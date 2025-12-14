import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Get the current directory of the script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths to package.json and module.json
const packageJsonPath = path.join(__dirname, 'package.json');
const moduleJsonPath = path.join(__dirname, 'module.json');

const args = process.argv.slice(2);
const versionType = args[0];
const isDraft = args.includes('draft') || args.includes('--draft');
const isPreRelease = args.includes('pre') || args.includes('--pre');
const isTestRelease = isDraft || isPreRelease;

// Check for uncommitted changes (must be before any branch switching or merging)
try {
    const gitStatus = execSync('git status --porcelain').toString().trim();
    if (gitStatus) {
        console.error('❌ There are uncommitted changes in your working directory:');
        console.error(gitStatus);
        console.error('Please commit or stash your changes before running a release.');
        process.exit(1);
    }
} catch (error) {
    console.error('❌ Error checking git status:', error.message);
    process.exit(1);
}

if (!versionType) {
    console.error('Usage: node release.js <major|minor|patch> [draft|pre]');
    console.error('');
    console.error('Release Types:');
    console.error('  (none)  - Public release on main branch (triggers GitHub Actions)');
    console.error('  draft   - Draft release on next branch (private, triggers GitHub Actions)');
    console.error('  pre     - Pre-release on next branch (public preview, triggers GitHub Actions)');
    console.error('');
    console.error('Examples:');
    console.error('  node release.js patch        # Public release');
    console.error('  node release.js minor draft  # Private draft for internal testing');
    console.error('  node release.js major pre    # Public pre-release for beta testing');
    process.exit(1);
}

// Validate version type
const validTypes = ['major', 'minor', 'patch'];
if (!validTypes.includes(versionType)) {
    console.error(`Invalid version type: ${versionType}. Valid types are: ${validTypes.join(', ')}`);
    console.error('Usage: node release.js <major|minor|patch> [draft|pre]');
    process.exit(1);
}

// Validate that only one release type is specified
if (isDraft && isPreRelease) {
    console.error('❌ Cannot specify both "draft" and "pre". Choose one.');
    process.exit(1);
}

// Function to validate version format (including pre-release)
const isValidVersion = (version) => /^\d+\.\d+\.\d+(-\w+\.\d+)?$/.test(version);

// Function to increment version with clear pre-release logic
const incrementVersion = (version, type, isPreRelease = false) => {
    if (!isValidVersion(version)) {
        console.error(`❌ Invalid version format: "${version}". Expected format: x.y.z or x.y.z-pre.n`);
        process.exit(1);
    }
    
    // Check if current version is already a pre-release
    const isCurrentlyPreRelease = /-beta\.(\d+)$/.test(version);
    const baseVersion = version.replace(/-.*$/, '');
    const currentBetaMatch = version.match(/-beta\.(\d+)$/);
    const currentBetaNumber = currentBetaMatch ? parseInt(currentBetaMatch[1], 10) : 0;
    
    const parts = baseVersion.split('.').map(Number);
    console.log(`📋 Current version: ${version}`);
    console.log(`📋 Base version parts: [${parts.join(', ')}]`);
    console.log(`📋 Is currently pre-release: ${isCurrentlyPreRelease}`);
    
    // Validate that all parts are valid numbers
    if (parts.some(part => isNaN(part))) {
        console.error(`❌ Version contains invalid numbers: "${version}". Resetting to 1.0.0`);
        parts[0] = 1;
        parts[1] = 0;
        parts[2] = 0;
    }
    
    let newVersion;
    
    if (isPreRelease) {
        if (isCurrentlyPreRelease) {
            // Current version is already a pre-release, just increment beta number
            newVersion = `${baseVersion}-beta.${currentBetaNumber + 1}`;
            console.log(`📋 Incrementing beta: ${version} → ${newVersion}`);
        } else {
            // Current version is a release, increment base version and add beta.1
            switch (type) {
                case 'major':
                    parts[0]++;
                    parts[1] = 0;
                    parts[2] = 0;
                    break;
                case 'minor':
                    parts[1]++;
                    parts[2] = 0;
                    break;
                case 'patch':
                    parts[2]++;
                    break;
                default:
                    throw new Error('Invalid version type. Use major, minor, or patch.');
            }
            newVersion = `${parts.join('.')}-beta.1`;
            console.log(`📋 Creating first pre-release: ${version} → ${newVersion}`);
        }
    } else {
        if (isCurrentlyPreRelease) {
            // Current version is a pre-release, final release drops beta suffix
            newVersion = baseVersion;
            console.log(`📋 Creating final release: ${version} → ${newVersion}`);
        } else {
            // Current version is a release, increment normally
            switch (type) {
                case 'major':
                    parts[0]++;
                    parts[1] = 0;
                    parts[2] = 0;
                    break;
                case 'minor':
                    parts[1]++;
                    parts[2] = 0;
                    break;
                case 'patch':
                    parts[2]++;
                    break;
                default:
                    throw new Error('Invalid version type. Use major, minor, or patch.');
            }
            newVersion = parts.join('.');
            console.log(`📋 Normal release increment: ${version} → ${newVersion}`);
        }
    }
    
    console.log(`📋 Final new version: ${newVersion}`);
    return newVersion;
};



// Function to check if Ollama is running
const checkOllamaStatus = async () => {
    try {
        const response = await fetch('http://127.0.0.1:11434/', { method: 'GET', timeout: 5000 });
        return response.ok;
    } catch (error) {
        console.error('Ollama server is not running or unreachable:', error.message);
        return false;
    }
};

// Function to call Ollama for summarization
const callOllama = async (commitMessages) => {
    try {
        if (!commitMessages || commitMessages.length === 0) {
            throw new Error('No commit messages to summarize.');
        }
        const prompt = `Summarize the following commit messages in a concise paragraph or (if more relevant) in a list of bullet points. Use definitive, factual statements based solely on the content of the messages, avoiding speculative language such as "likely due to," "possibly," or "might have." Write in a professional tone suitable for release notes:\n\n${commitMessages.join('\n')}`;
        
        const payload = {
            model: 'qwen2.5:7b',
            prompt: prompt,
            max_tokens: 150,
            temperature: 0.7,
            stream: false
        };
        
        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            timeout: 30000
        });
        
        if (!response.ok) throw new Error(`Ollama error: ${response.status} - ${await response.text()}`);
        const data = await response.json();
        return data.response.trim();
    } catch (error) {
        console.error('Error calling Ollama:', error.message);
        return null;
    }
};

// Function to generate release notes with Ollama and fallback
const generateReleaseNotesWithFallback = async (previousTag) => {
    let commitMessages = [];
    try {
        // Fetch commits since the previous tag
        let range = previousTag ? `${previousTag}..HEAD^` : ''; // Use HEAD^ to exclude the release commit
        let gitLogCommand = range
            ? `git log ${range} --pretty=format:"%s"`
            : `git log --pretty=format:"%s" -n 50`;
        let logOutput = execSync(gitLogCommand).toString().trim();
        commitMessages = logOutput
            ? logOutput.split('\n').filter(msg => 
                msg && 
                !msg.match(/^(Release|chore: build and bump version)/) &&
                !msg.match(/^\d+\.\d+\.\d+ manifest$/) &&
                !msg.match(/^v\d+\.\d+\.\d+$/)
            )
            : [];

        // If no commits found in the range, fall back to the last 10 commits
        if (commitMessages.length === 0 && !range) {
            console.log('No commits found in range, falling back to last 10 commits.');
            gitLogCommand = `git log --pretty=format:"%s" -n 10`;
            logOutput = execSync(gitLogCommand).toString().trim();
            commitMessages = logOutput
                ? logOutput.split('\n').filter(msg => 
                    msg && 
                    !msg.match(/^(Release|chore: build and bump version)/) &&
                    !msg.match(/^\d+\.\d+\.\d+ manifest$/) &&
                    !msg.match(/^v\d+\.\d+\.\d+$/)
                )
                : [];
        }

        console.log('Commits to summarize:', commitMessages);

        if (commitMessages.length === 0) {
            console.log('No new commits found to summarize.');
            return generateReleaseNotes(commitMessages, previousTag);
        }

        // Check if Ollama is running before calling it
        const ollamaRunning = await checkOllamaStatus();
        if (!ollamaRunning) {
            console.warn('Ollama server is not running or unreachable. Falling back to raw commit list.');
            return generateReleaseNotes(commitMessages, previousTag);
        }

        const aiSummary = await callOllama(commitMessages);
        if (aiSummary) {
            console.log('Release notes successfully generated using Ollama.');
            return `## Release Notes\n\n${aiSummary}`;
        } else {
            console.log('Ollama did not return a valid summary.');
        }
    } catch (error) {
        console.error('Error generating release notes with Ollama:', error);
    }

    console.log('Falling back to generating release notes from commit messages.');
    return generateReleaseNotes(commitMessages, previousTag);
};

// Function to generate fallback release notes
const generateReleaseNotes = (commitMessages, previousTag) => {
    // If there are no commits to list, prefer to point users at the pre-release notes
    // when the previous tag is a pre-release (e.g. -beta.n). This avoids saying
    // "No significant changes" when all changes were already documented on the pre-release.
    if (!commitMessages || commitMessages.length === 0) {
        if (previousTag && /-beta\.\d+$/.test(previousTag)) {
            return `## Release Notes\n\nThis release finalizes pre-release ${previousTag}. All changes were documented in the pre-release notes.\n\nSee: https://github.com/geoidesic/foundryvtt-actor-studio/releases/tag/${previousTag}`;
        }
        return '## Release Notes\n\nNo significant changes in this release.';
    }
    const formattedCommits = commitMessages.map(message => `- ${message}`);
    return `## What’s Changed\n\n${formattedCommits.join('\n')}`;
};

// Function to get the previous tag
const getPreviousTag = () => {
    try {
        return execSync('git describe --tags --abbrev=0').toString().trim();
    } catch (error) {
        console.log('No previous tag found.');
        return null;
    }
};

// Determine target branch
const targetBranch = isTestRelease ? 'next' : 'main';
console.log(`🎯 Target branch: ${targetBranch}`);

// --- Branch merging logic ---
try {
    const currentBranch = execSync('git branch --show-current').toString().trim();
    console.log(`📍 Current branch: ${currentBranch}`);
    if (isTestRelease) {
        // For pre/draft releases: ensure next branch exists and has latest main changes
        const branches = execSync('git branch --list').toString().split('\n').map(b => b.trim().replace('* ', ''));
        if (!branches.includes('next')) {
            console.log('🔄 Creating next branch...');
            execSync('git checkout -b next');
        } else if (currentBranch !== 'next') {
            console.log('🔄 Switching to next branch...');
            execSync('git checkout next');
        }
        console.log('📥 Merging latest main into next branch...');
        try {
            execSync('git merge main');
            console.log('✅ Successfully merged main into next');
        } catch (error) {
            console.error('❌ Merge conflict detected while merging main into next. Please resolve conflicts and re-run the release script.');
            process.exit(1);
        }
    } else {
        // For production releases: merge next into main if next exists
        if (currentBranch !== 'main') {
            console.log('🔄 Switching to main branch...');
            execSync('git checkout main');
        }
        const branches = execSync('git branch --list').toString().split('\n').map(b => b.trim().replace('* ', ''));
        if (branches.includes('next')) {
            console.log('📥 Merging next branch into main...');
            try {
                execSync('git merge next');
                console.log('✅ Successfully merged next into main');
            } catch (error) {
                console.error('❌ Merge conflict detected while merging next into main. Please resolve conflicts and re-run the release script.');
                process.exit(1);
            }
        } else {
            console.log('📍 Next branch does not exist, skipping merge.');
        }
    }
} catch (error) {
    console.error('❌ Error handling git branches:', error.message);
    process.exit(1);
}

// Update package.json (skip for drafts)
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

let newVersion;
if (isDraft) {
    newVersion = currentVersion; // Drafts use current version, no increment
    console.log(`🚀 Creating draft release with current version: ${currentVersion} (DRAFT - no version bump)`);
} else {
    newVersion = incrementVersion(currentVersion, versionType, isPreRelease);
    const releaseTypeLabel = isPreRelease ? ' (PRE-RELEASE)' : '';
    console.log(`🚀 Releasing ${versionType} version: ${currentVersion} → ${newVersion}${releaseTypeLabel}`);
}

// Always set environment to production for all releases
packageJson.env = 'production';

// Check if the new version tag already exists (only for published releases)
if (!isDraft) {
    try {
        execSync(`git rev-parse ${newVersion}`, { stdio: 'pipe' });
        console.error(`❌ Tag ${newVersion} already exists! Please check your git history.`);
        process.exit(1);
    } catch (error) {
        // Tag doesn't exist, which is what we want
        console.log(`✅ Version ${newVersion} is available`);
    }
    
    // Save original versions for potential revert
    const originalPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const originalModuleJson = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf8'));
    
    // Update files and build for published releases only
    packageJson.version = newVersion;
    if (packageJson.debug !== undefined) {
        packageJson.debug = false; // Set debug to false for releases
    }
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4));

    // Update module.json
    const moduleJson = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf8'));
    moduleJson.version = newVersion;
    if (moduleJson.manifest) {
        moduleJson.manifest = moduleJson.manifest.replace(/\/releases\/download\/[^/]+\//, `/releases/download/${newVersion}/`);
    }
    if (moduleJson.download) {
        moduleJson.download = moduleJson.download.replace(/\/releases\/download\/[^/]+\//, `/releases/download/${newVersion}/`);
    }
    fs.writeFileSync(moduleJsonPath, JSON.stringify(moduleJson, null, 4));

    try {
        // Build after version update so the new version is included in the build
        console.log('🔨 Building project...');
        execSync('npm run build', { stdio: 'inherit' });

        // Commit changes
        console.log('💾 Committing changes...');
        execSync('git add .');
        execSync(`git commit -m "chore: build and bump version to ${newVersion}"`);
    } catch (error) {
        console.error('❌ Build or commit failed:', error.message);
        // Revert version changes
        fs.writeFileSync(packageJsonPath, JSON.stringify(originalPackageJson, null, 4));
        fs.writeFileSync(moduleJsonPath, JSON.stringify(originalModuleJson, null, 4));
        console.log('Reverted version changes due to error.');
        process.exit(1);
    }
} else {
    console.log(`✅ Draft release - no file changes or build needed`);
}

// Generate release notes *before* creating the tag
console.log('📝 Generating release notes...');
const previousTag = getPreviousTag();
const releaseNotes = await generateReleaseNotesWithFallback(previousTag);

// Normalize characters to improve Open Graph preview rendering (avoid HTML entity escapes)
const normalizeForOpenGraph = (text) => {
    try {
        return text ? text.replace(/'/g, '’') : text;
    } catch (e) {
        return text;
    }
};
const ogSafeReleaseNotes = normalizeForOpenGraph(releaseNotes);

// Create tag (skip for drafts)
if (!isDraft) {
    console.log('🏷️  Creating tag...');
    execSync(`git tag ${newVersion}`);
} else {
    console.log('🏷️  Skipping tag creation for draft release...');
}

// Push changes and tag (only for published releases)
if (!isDraft) {
    console.log(`⬆️  Pushing to ${targetBranch} branch...`);
    execSync(`git push origin ${targetBranch}`);
    execSync(`git push origin ${newVersion}`);
    console.log(`📌 Pushed tag ${newVersion}`);
} else {
    console.log('📌 No git changes to push for draft release');
}

// Create a temporary file for release notes
const releaseNotesPath = path.join(__dirname, 'release-notes.md');
fs.writeFileSync(releaseNotesPath, ogSafeReleaseNotes);

// Create GitHub release
const releaseTypeText = isDraft ? ' (draft)' : isPreRelease ? ' (pre-release)' : '';
console.log(`📦 Creating GitHub release${releaseTypeText}...`);
try {
    let ghCommand = `gh release create ${newVersion} --title "Version ${newVersion}" --notes-file ${releaseNotesPath}`;
    if (isDraft) {
        ghCommand += ' --draft';
    }
    if (isPreRelease) {
        ghCommand += ' --prerelease';
    }
    execSync(ghCommand);
    
    const releaseTypeMsg = isDraft ? 'draft' : isPreRelease ? 'pre-release' : 'release';
    console.log(`✅ GitHub ${releaseTypeMsg} created for ${newVersion}`);
} catch (error) {
    console.error('❌ Error creating GitHub release:', error.message);
    console.log('You may need to install GitHub CLI (gh) or authenticate it.');
    console.log('To install: https://cli.github.com/');
    process.exit(1);
}

// Clean up
try {
    fs.unlinkSync(releaseNotesPath);
} catch (error) {
    console.error('❌ Error removing temporary release notes file:', error);
}

const actionText = isDraft ? 'drafted' : isPreRelease ? 'pre-released' : 'released';
console.log(`🎉 Successfully ${actionText} version ${newVersion} on ${targetBranch} branch`);
console.log(`📄 Release notes:\n${ogSafeReleaseNotes}`);
console.log(`🔗 View release: https://github.com/geoidesic/foundryvtt-actor-studio/releases/tag/${newVersion}`);

if (isDraft) {
    console.log(`📝 Note: This is a DRAFT RELEASE (tentative).`);
    console.log(`❌ GitHub Actions will NOT run - no install files generated.`);
    console.log(`🔒 No version bump, no commits, no tags - purely tentative.`);
    console.log(`🔄 Publish the draft to trigger Actions and generate install files.`);
} else if (isPreRelease) {
    console.log(`📝 Note: This is a PRE-RELEASE on the '${targetBranch}' branch.`);
    console.log(`✅ GitHub Actions WILL run and update the next branch manifest!`);
    console.log(`🔄 When ready, merge '${targetBranch}' to 'main' and create a full release.`);
} else {
    console.log(`🚀 Production release created on 'main' branch. GitHub Actions will run!`);
}