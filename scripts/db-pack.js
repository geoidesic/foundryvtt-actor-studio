//- Takes the yml and packs that into the db
import { compilePack } from '@foundryvtt/foundryvtt-cli';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODULE_ID = path.join(__dirname, '..');
const yaml = true;

// Check if FoundryVTT server is running by detecting processes and LOCK files
async function checkForRunningServer() {
  const packsDir = path.join(MODULE_ID, 'packs');

  // Check for running FoundryVTT processes
  const isCI = process.env.GITHUB_ACTIONS === 'true' || process.env.CI === 'true';
  if (!isCI) {
    try {
      const result = execSync('pgrep -f "FoundryVTT|main.js --dataPath"', { encoding: 'utf8', stdio: 'pipe' });
      if (result.trim()) {
        console.error(`ERROR: FoundryVTT server appears to be running!`);
        console.error(`Found processes: ${result.trim()}`);
        console.error(`Please stop the FoundryVTT server before running this script.`);
        process.exit(1);
      }
    } catch (error) {
      // pgrep returns non-zero if no matches, which is fine
      if (error.status !== 1) {
        console.warn('Could not check for running processes, proceeding with caution.');
      }
    }
  }

  // Remove any stale LOCK files since no server is running
  try {
    const packDirs = await fs.readdir(packsDir);
    for (const pack of packDirs) {
      const packPath = path.join(packsDir, pack);
      const stat = await fs.stat(packPath);
      if (!stat.isDirectory()) continue;
      
      const lockFile = path.join(packPath, 'LOCK');
      try {
        await fs.unlink(lockFile);
        console.log(`Removed stale LOCK file: ${lockFile}`);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

// Check for running server before proceeding
await checkForRunningServer();

const packs = await fs.readdir(path.join(MODULE_ID, 'src', 'packs'));
for (const pack of packs) {
  const packPath = path.join(MODULE_ID, 'src', 'packs', pack);
  const stat = await fs.stat(packPath);
  if (pack === '.gitattributes' || !stat.isDirectory()) continue; // Skip non-directory entries
  console.log('Packing ' + pack);
  await compilePack(
    packPath,
    path.join(MODULE_ID, 'packs', pack),
    { yaml }
  );
}