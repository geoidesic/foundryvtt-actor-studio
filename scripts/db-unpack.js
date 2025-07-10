//- generates the yml from the db
import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODULE_ID = path.join(__dirname, '..');
const yaml = true;

const packs = await fs.readdir(path.join(MODULE_ID, "packs"));

for (const pack of packs) {
  const packPath = path.join(MODULE_ID, 'src', 'packs', pack);

  const stat = await fs.stat(packPath);
  if (pack === '.gitattributes' || !stat.isDirectory()) continue; // Skip non-directory entries
  console.log("packs", packs);
  console.log("__dirname", __dirname);
  console.log("__filename", __filename);
  console.log("MODULE_ID", MODULE_ID);
  console.log("Unpacking " + pack);
  const directory = path.join(MODULE_ID, "src", "packs", pack);
  console.log("directory", directory);
  try {
    for (const file of await fs.readdir(directory)) {
      console.log("file", file);
      await fs.unlink(path.join(directory, file));
    }
  } catch (error) {
    if (error.code === "ENOENT") console.log("No files inside of " + pack);
    else console.log(error);
  }
  await extractPack(
    path.join(MODULE_ID, "packs", pack),
    path.join(MODULE_ID, "src", "packs", pack),
    {
      yaml,
      transformName,
    }
  );
}

/**
 * Prefaces the document with its type
 * @param {object} doc - The document data
 */
function transformName(doc) {
  const safeFileName = doc.name.replace(/[^a-zA-Z0-9А-я]/g, "_");
  const type = doc._key.split("!")[1];
  const prefix = ["actors", "items"].includes(type) ? doc.type : type;

  return `${doc.name ? `${prefix}_${safeFileName}_${doc._id}` : doc._id}.${
    yaml ? "yml" : "json"
  }`;
}