import fs from 'fs';
import { execSync } from 'child_process';

// Run `yarn version --patch` to update the version in package.json
execSync('yarn version --patch', { stdio: 'inherit' });

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
