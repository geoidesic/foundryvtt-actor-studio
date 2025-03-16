import fs from 'fs';
import { execSync } from 'child_process';

// Get versioning argument from command line arguments and remove leading '--'
const versionType = process.argv[2]?.replace(/^--/, '') || 'patch';

// Validate versionType
const validVersionTypes = ['patch', 'minor', 'major'];
if (!validVersionTypes.includes(versionType)) {
  console.error(`Invalid version type: ${versionType}. Valid types are: ${validVersionTypes.join(', ')}`);
  process.exit(1);
}

// Build the project
execSync('yarn build', { stdio: 'inherit' });

// Read current version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

// Set debug to false
packageJson.debug = false;

// Write updated package.json back to file
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 4), 'utf-8');

const currentVersion = packageJson.version;

// Calculate new version
const [major, minor, patch] = currentVersion.split('.').map(Number);
let newVersion;
switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

// Update module.json
const moduleJsonPath = 'module.json';
const moduleJson = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));
moduleJson.version = newVersion;
fs.writeFileSync(moduleJsonPath, JSON.stringify(moduleJson, null, 4), 'utf-8');

// Commit the build and version changes
execSync('git add .', { stdio: 'inherit' });
execSync(`git commit -m "chore: build"`, { stdio: 'inherit' });

// Run `yarn version` with the specified version type but without creating a git tag
execSync(`yarn version --${versionType} --no-git-tag-version`, { stdio: 'inherit' });

// Create a git tag manually without the 'v' prefix
execSync(`git tag ${newVersion}`, { stdio: 'inherit' });
execSync(`git push --tags`, { stdio: 'inherit' });

console.log(`Released version ${newVersion}`);