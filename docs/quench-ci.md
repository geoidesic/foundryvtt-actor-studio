# Running Quench locally (quick start)

This doc explains how to run Quench automatically for local iteration and CI.

Prerequisites
- A local Foundry Node installation (e.g., `FoundryVTT-Node-13.341`) with a world you can use for tests.
- This repo and the Foundry instance should be on the same machine (so we can toggle a world setting before startup).

Quick steps (local)
1. Pick a world name (folder under `Data/worlds/<worldName>`). We'll use `test` by default.
2. Run the helper script which will enable autorun in the world settings, start Foundry, wait for `Data/quench-report.json`, copy it to `reports/` and exit:

   FOUNDY_DIR=/path/to/FoundryVTT-Node-13.341 WORLD_NAME=test npm run quench:run

3. The script times out by default after 120s; you can override with `QUENCH_TIMEOUT` (ms).

How it works
- The script sets `actor-studio.quenchAutorun` to `true` in the world's `world.json` before starting Foundry.
- A tiny autorun module in the code listens for the Quench `quenchReady` hook and executes `quench.runBatches('**', { json: true })` when that setting is present.
- Quench writes `Data/quench-report.json` (Quench's built-in JSON upload). The script waits for that file, copies to `reports/`, then shuts down the server and cleans the setting.

Notes & troubleshooting
- Ensure Foundry's `Data` directory and the world name are correct for your installation.
- If you get timeouts, increase `QUENCH_TIMEOUT`.
- The script relies on Quench and the module being installed and enabled in the world. If Quench is not present in the world, the autorun will never run.

Next steps (CI)
- Create a minimal CI job that checks out Foundry, configures a world, runs this script, and saves `reports/` as artifacts. I can prepare a GitHub Actions template if you'd like.
