/**
 * Dev-only CSS entry: mirrors global style imports from index.js so Vite can emit dist/style.css
 * for Foundry's module.json "styles" array while HMR serves JS from the dev server.
 */
import '../styles/Variables.sass';
import '../styles/init.sass';
