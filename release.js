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

// Run `yarn version` with the specified version type but without creating a git tag
// This updates package.json with the new version
execSync(`yarn version --${versionType} --no-git-tag-version`, { stdio: 'inherit' });

// Read the updated package.json to get the new version
let packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const newVersion = packageJson.version; // Get the version set by `yarn version`

// Set debug to false
packageJson.debug = false;

// Write updated package.json back to file (with debug: false)
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 4), 'utf-8');

// Build the project (now with the correct version in package.json)
execSync('yarn build', { stdio: 'inherit' });

// Update module.json with the new version and URLs
const moduleJsonPath = 'module.json';
const moduleJson = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));
moduleJson.version = newVersion;
moduleJson.manifest = `https://github.com/geoidesic/foundryvtt-actor-studio/releases/download/${newVersion}/module.json`;
moduleJson.download = `https://github.com/geoidesic/foundryvtt-actor-studio/releases/download/${newVersion}/module.zip`;
fs.writeFileSync(moduleJsonPath, JSON.stringify(moduleJson, null, 4), 'utf-8');

// Commit the build and version changes
execSync('git add .', { stdio: 'inherit' });
execSync(`git commit -m "chore: build and bump version to ${newVersion}"`, { stdio: 'inherit' });

// Create a git tag manually without the 'v' prefix
execSync(`git tag ${newVersion}`, { stdio: 'inherit' });
execSync(`git push --tags`, { stdio: 'inherit' });

console.log(`Released version ${newVersion}`);