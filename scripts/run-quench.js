#!/usr/bin/env node
/**
 * scripts/run-quench.js
 * - Prepare world settings to enable autorun
 * - Launch Foundry Node server
 * - Wait for Data/quench-report.json and copy it to repo reports/
 * - Clean up and exit
 *
 * Usage:
 *  FOUNDY_DIR=/path/to/FoundryVTT-Node-13.341 WORLD_NAME=Data/worlds/TestWorld node scripts/run-quench.js
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const MODULE_ID = 'actor-studio';
const FOUNDY_DIR = process.env.FOUNDY_DIR || path.resolve(__dirname, '..', '..', 'FoundryVTT-Node-13.341');
const WORLD_NAME = process.env.WORLD_NAME || 'test';
const TIMEOUT = Number(process.env.QUENCH_TIMEOUT || 120000); // 120s default

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function isPortOpen(host, port, timeout = 1000) {
  return new Promise(resolve => {
    const net = require('net');
    const socket = new net.Socket();
    let called = false;
    socket.setTimeout(timeout);
    socket.on('connect', () => { called = true; socket.destroy(); resolve(true); });
    socket.on('timeout', () => { if (!called) { called = true; socket.destroy(); resolve(false); } });
    socket.on('error', () => { if (!called) { called = true; socket.destroy(); resolve(false); } });
    socket.connect(port, host);
  });
}

function setWorldSetting(foundryDir, worldName) {
  const worldJson = path.join(foundryDir, 'Data', 'worlds', worldName, 'world.json');
  if (!fs.existsSync(worldJson)) throw new Error(`world.json not found at ${worldJson}`);
  const raw = fs.readFileSync(worldJson, 'utf8');
  const json = JSON.parse(raw);
  json.settings = json.settings || {};
  json.settings[`${MODULE_ID}.quenchAutorun`] = true;
  fs.writeFileSync(worldJson, JSON.stringify(json, null, 2));
  console.log(`Wrote ${MODULE_ID}.quenchAutorun = true to ${worldJson}`);
}

async function waitForReport(foundryDir, timeoutMs) {
  const reportPath = path.join(foundryDir, 'Data', 'quench-report.json');
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(reportPath)) return reportPath;
    await sleep(1000);
  }
  throw new Error('Timed out waiting for quench-report.json');
}

(async () => {
  try {
    console.log('Run Quench: starting');
    console.log('Foundry dir:', FOUNDY_DIR);
    console.log('World name:', WORLD_NAME);

    setWorldSetting(FOUNDY_DIR, WORLD_NAME);

    // Launch Foundry server
    const entryCandidates = ['main.mjs', 'main.js', 'index.js'];
    let entry = null;
    for (const c of entryCandidates) {
      const full = path.join(FOUNDY_DIR, c);
      if (fs.existsSync(full)) { entry = c; break; }
    }
    if (!entry) throw new Error(`Could not find Foundry entry file (${entryCandidates.join(', ')}) in ${FOUNDY_DIR}`);

    // Determine if Foundry is already running (port 30000). If so, reuse it; otherwise spawn and mark ownership.
    const foundryHost = process.env.FOUNDRY_HOST || '127.0.0.1';
    const foundryPort = Number(process.env.FOUNDRY_PORT || 30000);
    let foundryOwned = false;
    let server = null;

    const foundryIsUp = await isPortOpen(foundryHost, foundryPort).catch(() => false);
    if (foundryIsUp) {
      console.log(`Foundry appears to be running at ${foundryHost}:${foundryPort}; not starting a new server.`);
    } else {
      console.log(`Starting foundry server with entry ${entry}...`);
      server = spawn('node', [entry, `--dataPath=${process.env.DATA_PATH || ''}`].filter(Boolean), { cwd: FOUNDY_DIR, env: { ...process.env }, stdio: ['ignore', 'pipe', 'pipe'] });
      foundryOwned = true;

      server.stdout.on('data', chunk => process.stdout.write(`[foundry] ${chunk.toString()}`));
      server.stderr.on('data', chunk => process.stderr.write(`[foundry.err] ${chunk.toString()}`));

      // Wait until port is open (basic readiness)
      const start = Date.now();
      while (Date.now() - start < TIMEOUT) {
        const up = await isPortOpen(foundryHost, foundryPort).catch(() => false);
        if (up) break;
        await sleep(500);
      }
    }

    // Ensure bun dev (vite) is running; if not, try to spawn it so module code is served
    const devHost = '127.0.0.1';
    const devPort = Number(process.env.DEV_PORT || 30001);
    let devOwned = false;
    const devIsUp = await isPortOpen(devHost, devPort).catch(() => false);
    let devProc = null;
    if (!devIsUp) {
      try {
        console.log('Starting module dev server (bun dev)...');
        devProc = spawn('bun', ['dev'], { cwd: path.resolve(__dirname, '..'), env: { ...process.env }, stdio: ['ignore', 'pipe', 'pipe'] });
        devOwned = true;
        devProc.stdout.on('data', chunk => process.stdout.write(`[dev] ${chunk.toString()}`));
        devProc.stderr.on('data', chunk => process.stderr.write(`[dev.err] ${chunk.toString()}`));

        // Wait until dev port is open (basic readiness)
        const startDev = Date.now();
        while (Date.now() - startDev < TIMEOUT) {
          const d = await isPortOpen(devHost, devPort).catch(() => false);
          if (d) break;
          await sleep(500);
        }
      } catch (e) {
        console.warn('Failed to spawn bun dev; ensure you run it manually if needed', e.message);
      }
    } else {
      console.log(`Dev server appears to be running at ${devHost}:${devPort}; not starting bun dev.`);
    }

    // Wait for report to be created
    console.log('Waiting for quench report (timeout', TIMEOUT, 'ms) ...');
    const reportPath = await waitForReport(FOUNDY_DIR, TIMEOUT);

    // Copy report into repo for inspection
    const reportsDir = path.resolve(__dirname, '..', 'reports');
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);
    const dest = path.join(reportsDir, `quench-report-${Date.now()}.json`);
    fs.copyFileSync(reportPath, dest);
    console.log('Quench report saved to', dest);

    // Graceful shutdown of processes we started
    if (devOwned && devProc) {
      console.log('Shutting down module dev server...');
      devProc.kill('SIGINT');
    }

    if (foundryOwned && server) {
      console.log('Shutting down Foundry server...');
      server.kill('SIGINT');
    }

    // Unset the autorun flag to avoid re-running next time
    const worldJson = path.join(FOUNDY_DIR, 'Data', 'worlds', WORLD_NAME, 'world.json');
    const json = JSON.parse(fs.readFileSync(worldJson, 'utf8'));
    if (json.settings && (json.settings[`${MODULE_ID}.quenchAutorun`] === true)) {
      delete json.settings[`${MODULE_ID}.quenchAutorun`];
      fs.writeFileSync(worldJson, JSON.stringify(json, null, 2));
      console.log('Cleared autorun flag from world.json');
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('run-quench failed:', err);
    process.exit(2);
  }
})();
