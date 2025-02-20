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

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');

// Update module.json
const moduleJsonPath = 'module.json';
const moduleJson = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));
moduleJson.version = newVersion;
fs.writeFileSync(moduleJsonPath, JSON.stringify(moduleJson, null, 4), 'utf-8');

// Commit the build and version changes
execSync('git add .', { stdio: 'inherit' });
execSync(`git commit -m "chore: release version ${newVersion}"`, { stdio: 'inherit' });

// Create and push the tag
execSync(`git tag -a v${newVersion} -m "Release ${newVersion}"`, { stdio: 'inherit' });
execSync('git push --follow-tags', { stdio: 'inherit' });

console.log(`Released version ${newVersion}`);
