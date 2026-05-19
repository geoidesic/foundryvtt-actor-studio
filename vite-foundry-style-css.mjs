/**
 * During `vite` dev, write bundled global CSS to dist/style.css.
 * Foundry always loads module.json → dist/style.css; the dev script must not leave that file empty.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { build, mergeConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STYLE_OUT = path.join(__dirname, 'dist', 'style.css');
const STYLE_ENTRY = path.join(__dirname, 'src', 'style-dev-entry.js');
const STYLE_TMP_DIR = path.join(__dirname, '.style-dev-tmp');

const isStyleRelatedFile = (file) =>
   file.endsWith('.sass') ||
   file.endsWith('.scss') ||
   file.endsWith('.css') ||
   file.endsWith('style-dev-entry.js');

export function foundryStyleCssDev(baseConfig) {
   let building = false;
   let pending = false;

   async function emitCss() {
      if (building) {
         pending = true;
         return;
      }
      building = true;
      try {
         fs.rmSync(STYLE_TMP_DIR, { recursive: true, force: true });
         await build(
            mergeConfig(baseConfig, {
               build: {
                  outDir: STYLE_TMP_DIR,
                  emptyOutDir: true,
                  write: true,
                  cssCodeSplit: false,
                  minify: false,
                  rollupOptions: {
                     input: STYLE_ENTRY,
                     output: {
                        assetFileNames: 'style.css',
                        entryFileNames: 'style-dev-entry.js'
                     }
                  }
               }
            })
         );

         const tmpCss = path.join(STYLE_TMP_DIR, 'style.css');
         if (!fs.existsSync(tmpCss)) {
            throw new Error('Dev CSS emit failed: no style.css in .style-dev-tmp');
         }
         fs.mkdirSync(path.dirname(STYLE_OUT), { recursive: true });
         fs.copyFileSync(tmpCss, STYLE_OUT);
      } finally {
         building = false;
         if (pending) {
            pending = false;
            await emitCss();
         }
      }
   }

   return {
      name: 'foundry-style-css-dev',
      apply: 'serve',
      configureServer() {
         return emitCss();
      },
      handleHotUpdate(ctx) {
         if (isStyleRelatedFile(ctx.file)) {
            return emitCss().then(() => ctx.modules);
         }
      }
   };
}
