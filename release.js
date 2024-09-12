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

// Run `yarn version` with the specified version type
execSync(`yarn version --${versionType}`, { stdio: 'inherit' });

// Read the updated version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const newVersion = packageJson.version;

// Read module.json
const moduleJsonPath = 'module.json';
const moduleJson = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));

// Update the version in module.json
moduleJson.version = newVersion;

// Write back the updated module.json
fs.writeFileSync(moduleJsonPath, JSON.stringify(moduleJson, null, 4), 'utf-8');

execSync('yarn build', { stdio: 'inherit' });
console.log(`Updated module.json to version ${newVersion}`);
