import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

// Get the current directory of the script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths to package.json and module.json
const packageJsonPath = path.join(__dirname, 'package.json');
const moduleJsonPath = path.join(__dirname, 'module.json');

const versionType = process.argv[2];

if (!versionType) {
    console.error('Please provide a version argument (major, minor, patch).');
    process.exit(1);
}

// Function to validate version format
const isValidVersion = (version) => /^\d+\.\d+\.\d+$/.test(version);

// Function to increment version
const incrementVersion = (version, type) => {
    if (!isValidVersion(version)) {
        console.log(`Invalid version format: "${version}". Using default version 0.1.0 as base.`);
        version = '0.1.0';
    }
    const parts = version.split('.').map(Number);
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
    return parts.join('.');
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
            stream: false // Ensure non-streaming response for simplicity
        };
        
        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            timeout: 30000 // 30-second timeout
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
            ? logOutput.split('\n').filter(msg => msg && !msg.match(/^(Release|chore: build and bump version)/))
            : [];

        // If no commits found in the range, fall back to the last 10 commits
        if (commitMessages.length === 0 && !range) {
            console.log('No commits found in range, falling back to last 10 commits.');
            gitLogCommand = `git log --pretty=format:"%s" -n 10`;
            logOutput = execSync(gitLogCommand).toString().trim();
            commitMessages = logOutput
                ? logOutput.split('\n').filter(msg => msg && !msg.match(/^(Release|chore: build and bump version)/))
                : [];
        }

        console.log('Commits to summarize:', commitMessages);

        if (commitMessages.length === 0) {
            console.log('No new commits found to summarize.');
            return '## Release Notes\n\nNo significant changes in this release.';
        }

        // Check if Ollama is running before calling it
        const ollamaRunning = await checkOllamaStatus();
        if (!ollamaRunning) {
            console.warn('Ollama server is not running or unreachable. Falling back to raw commit list.');
            return generateReleaseNotes(commitMessages);
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
    return generateReleaseNotes(commitMessages);
};

// Function to generate fallback release notes
const generateReleaseNotes = (commitMessages) => {
    if (!commitMessages || commitMessages.length === 0) {
        return '## Release Notes\n\nNo significant changes in this release.';
    }
    const formattedCommits = commitMessages.map(message => `- ${message}`);
    return `## What's Changed\n\n${formattedCommits.join('\n')}`;
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

// Update package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const newVersion = incrementVersion(packageJson.version, versionType);
packageJson.version = newVersion;
packageJson.debug = false; // Set debug to false for releases
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

// Build after version update so the new version is included in the build
console.log('Building project...');
execSync('bun run build', { stdio: 'inherit' });

// Commit changes
console.log('Committing changes...');
execSync('git add .');
execSync(`git commit -m "chore: build and bump version to ${newVersion}"`);

// Generate release notes *before* creating the tag
console.log('Generating release notes...');
const previousTag = getPreviousTag();
const releaseNotes = await generateReleaseNotesWithFallback(previousTag);

// Create tag
console.log('Creating tag...');
execSync(`git tag ${newVersion}`);

// Push changes and tag
console.log('Pushing to repository...');
execSync('git push');
execSync(`git push origin ${newVersion}`);

// Create a temporary file for release notes
const releaseNotesPath = path.join(__dirname, 'release-notes.md');
fs.writeFileSync(releaseNotesPath, releaseNotes);

// Create GitHub release
console.log('Creating GitHub release...');
try {
    execSync(`gh release create ${newVersion} --title "Version ${newVersion}" --notes-file ${releaseNotesPath}`);
    console.log(`GitHub release created for ${newVersion}`);
} catch (error) {
    console.error('Error creating GitHub release:', error.message);
    console.log('You may need to install GitHub CLI (gh) or authenticate it.');
    console.log('To install: https://cli.github.com/');
    console.log('To authenticate: gh auth login');
}

// Clean up
try {
    fs.unlinkSync(releaseNotesPath);
} catch (error) {
    console.error('Error removing temporary release notes file:', error);
}

console.log(`Successfully released version ${newVersion}`);
console.log(`Release notes:\n${releaseNotes}`);