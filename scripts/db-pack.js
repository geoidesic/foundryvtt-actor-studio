//- Takes the yml and packs that into the db
import { compilePack } from '@foundryvtt/foundryvtt-cli';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODULE_ID = path.join(__dirname, '..');
const yaml = true;

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