# Quench (Foundry E2E test runner)

Quench is the Foundry-focused end-to-end UI test runner used by the community. It provides a native Foundry application with a Mocha+Chai-powered test runner UI and supports snapshots and programmatic batch runs.

Key links
- Official docs: https://ethaks.github.io/FVTT-Quench/index.html
- Repository: https://github.com/Ethaks/FVTT-Quench

How we set it up locally
1. Installed the types package as a devDependency:
   `npm install --save-dev @ethaks/fvtt-quench --legacy-peer-deps`
2. Added the type package to `tsconfig.json` (to enable IDE autocompletion):
   ```json
   "types": ["@league-of-foundry-developers/foundry-vtt-types", "@ethaks/fvtt-quench", "node", "jest"]
   ```
3. Added a minimal sanity batch at `src/module/quench-tests/quench-sanity-tests.ts` which registers a small suite when Quench initializes.

Notes
- Quench runs inside a running Foundry instance as a module. To use it interactively, install the Quench module in your Foundry `Data/modules/` directory (see the repo or Foundry module pages).
- Programmatic runs are possible via the `quench` global API (`quench.runBatches`) for automated reporting.

Next steps
- If you want, I can add a GitHub Actions workflow or local script to run Quench against a local Foundry instance and collect reports.
