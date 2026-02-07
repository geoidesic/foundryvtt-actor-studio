#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const MODULE_ID = 'actor-studio';
const FOUNDY_DIR = process.env.FOUNDY_DIR || path.resolve(__dirname, '..', '..', 'FoundryVTT-Node-13.341');
const WORLD_NAME = process.env.WORLD_NAME || 'test';
const TIMEOUT = Number(process.env.QUENCH_TIMEOUT || 120000); // 120s default

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Print runtime options for clarity so users (and CI) can see what mode the script will run in
const _envOptions = {
  QUENCH_AUTO_START: process.env.QUENCH_AUTO_START || 'false',
  QUENCH_NO_START_SERVER: process.env.QUENCH_NO_START_SERVER || 'false',
  QUENCH_SKIP_WAIT: process.env.QUENCH_SKIP_WAIT || 'false',
  QUENCH_HEADLESS: process.env.QUENCH_HEADLESS || 'true',
  QUENCH_SHOW_PROGRESS: process.env.QUENCH_SHOW_PROGRESS || 'true',
  QUENCH_TIMEOUT: process.env.QUENCH_TIMEOUT || TIMEOUT
};
console.log('Run Quench options:', JSON.stringify(_envOptions));

// Progress helper: prints a simple spinner with percentage and remaining seconds
function startProgress(label, timeoutMs) {
  const start = Date.now();
  const spinner = ['|','/','-','\\'];
  let i = 0;
  const show = (pct, remaining) => {
    process.stdout.write(`\r${label} ${spinner[i % spinner.length]} ${pct}% (${remaining}s left)   `);
    i++;
  };
  show(0, Math.ceil(timeoutMs / 1000));
  const iv = setInterval(() => {
    const elapsed = Date.now() - start;
    const pct = Math.min(100, Math.round((elapsed / timeoutMs) * 100));
    const remaining = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000));
    show(pct, remaining);
  }, 1000);
  return {
    stop: (doneLabel) => { clearInterval(iv); process.stdout.write(`\r${label} ${doneLabel || 'done.'}                     \n`); }
  };
}

// Convenience: check if progress output is enabled
const SHOW_PROGRESS = (process.env.QUENCH_SHOW_PROGRESS || 'true').toLowerCase() !== 'false';


// --- Process ownership tracking -------------------------------------------
const OWNERSHIP_FILE = path.join(require('os').tmpdir(), 'quench-owned-pids.json');

function loadOwnedPids() {
  try {
    if (fs.existsSync(OWNERSHIP_FILE)) {
      return JSON.parse(fs.readFileSync(OWNERSHIP_FILE, 'utf8'));
    }
  } catch (e) { /* ignore */ }
  return { pids: [] };
}

function saveOwnedPids(data) {
  try {
    fs.writeFileSync(OWNERSHIP_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.warn('Failed to save owned PIDs:', e.message);
  }
}

function recordPid(pid, type = 'unknown') {
  const data = loadOwnedPids();
  if (!data.pids.includes(pid)) {
    data.pids.push(pid);
    console.log(`Recorded ownership of PID ${pid} (${type})`);
    saveOwnedPids(data);
  }
}

function clearOwnedPids() {
  try {
    if (fs.existsSync(OWNERSHIP_FILE)) {
      fs.unlinkSync(OWNERSHIP_FILE);
      console.log('Cleared owned PIDs file');
    }
  } catch (e) { /* ignore */ }
}

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

// --- Port cleanup helpers -------------------------------------------------
function getPidsListeningOnPort(port) {
  try {
    const out = require('child_process').execSync(`lsof -n -iTCP:${port} -sTCP:LISTEN -t || true`, { encoding: 'utf8' }).trim();
    if (!out) return [];
    return out.split(/\s+/).map(s => parseInt(s, 10)).filter(Boolean);
  } catch (e) {
    return [];
  }
}

function getCmdForPid(pid) {
  try {
    return require('child_process').execSync(`ps -p ${pid} -o command=`).toString().trim();
  } catch (e) {
    return '';
  }
}

async function getPpid(pid) {
  try { return parseInt(require('child_process').execSync(`ps -p ${pid} -o ppid=`).toString().trim(), 10) || null; } catch (e) { return null; }
}

async function killPids(pids, timeoutMs = 5000) {
  for (const pid of pids) {
    try {
      const cmd = getCmdForPid(pid);
      // Be conservative: only kill if the command looks like node/bun/vite/foundry
      if (!/\b(node|bun|vite|foundry|nodejs)\b/i.test(cmd)) {
        console.log(`Skipping pid ${pid} (cmd=${cmd}) - does not look like a dev server`);
        continue;
      }
      console.log(`Attempting graceful shutdown of pid ${pid} (cmd=${cmd})`);
      try { process.kill(pid, 'SIGINT'); } catch (e) { /* ignore */ }

      // If the process is a child of a launcher shell (e.g. bash -lc ...), attempt to kill parent too
      const ppid = await getPpid(pid);
      if (ppid) {
        const pCmd = getCmdForPid(ppid);
        if (/\b(bash|sh)\b/.test(pCmd) || /nvm use/.test(pCmd)) {
          console.log(`Also attempting to shut down parent pid ${ppid} (cmd=${pCmd})`);
          try { process.kill(ppid, 'SIGINT'); } catch (e) { /* ignore */ }
        }
      }

      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        try { process.kill(pid, 0); await sleep(200); } catch (e) { break; }
      }
      // If still alive after timeout, escalate to SIGKILL
      try { process.kill(pid, 0); process.kill(pid, 'SIGKILL'); console.log(`SIGKILL sent to pid ${pid}`); } catch (e) { /* already gone */ }
    } catch (e) {
      console.warn(`Failed to kill pid ${pid}: ${e.message}`);
    }
  }
}

async function waitForPortClosed(host, port, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const open = await isPortOpen(host, port).catch(() => false);
    if (!open) return true;
    await sleep(200);
  }
  return false;
}

async function cleanPorts(ports = [], host = '127.0.0.1') {
  const shutdownMode = (process.env.QUENCH_SHUTDOWN_EXISTING || 'owned').toLowerCase();
  if (shutdownMode === 'false' || shutdownMode === 'none') {
    console.log('Port cleanup skipped (QUENCH_SHUTDOWN_EXISTING=false/none)');
    return;
  }

  const ownedData = loadOwnedPids();
  const ownedPids = ownedData.pids || [];

  for (const p of ports) {
    const pids = getPidsListeningOnPort(p);
    if (pids.length === 0) continue;
    console.log(`Found processes listening on port ${p}: ${pids.join(', ')}`);

    // Filter PIDs based on shutdown mode
    let pidsToKill = [];
    if (shutdownMode === 'force' || shutdownMode === 'all') {
      // Force mode: kill all PIDs on target ports
      pidsToKill = pids;
      console.log(`QUENCH_SHUTDOWN_EXISTING=force: will attempt to kill all PIDs on port ${p}`);
    } else {
      // Default 'owned' mode: only kill PIDs we spawned
      pidsToKill = pids.filter(pid => ownedPids.includes(pid));
      const external = pids.filter(pid => !ownedPids.includes(pid));
      if (external.length > 0) {
        console.log(`Detected external processes on port ${p} (PIDs: ${external.join(', ')}) - not killing (use QUENCH_SHUTDOWN_EXISTING=force to override)`);
      }
      if (pidsToKill.length > 0) {
        console.log(`Will kill owned PIDs on port ${p}: ${pidsToKill.join(', ')}`);
      }
    }

    if (pidsToKill.length > 0) {
      await killPids(pidsToKill);
      const closed = await waitForPortClosed(host, p, 5000);
      if (!closed) console.warn(`Port ${p} did not close within timeout; it may be held by another process`);
    }
  }
}

// --------------------------------------------------------------------------

function setWorldSetting(foundryDir, worldName) {
  const dataDir = process.env.DATA_PATH || path.join(foundryDir, 'Data');
  const worldJson = path.join(dataDir, 'worlds', worldName, 'world.json');
  if (!fs.existsSync(worldJson)) throw new Error(`world.json not found at ${worldJson}`);
  const raw = fs.readFileSync(worldJson, 'utf8');
  const json = JSON.parse(raw);
  json.settings = json.settings || {};
  json.settings[`${MODULE_ID}.quenchAutorun`] = true;
  fs.writeFileSync(worldJson, JSON.stringify(json, null, 2));
  console.log(`Wrote ${MODULE_ID}.quenchAutorun = true to ${worldJson}`);
}

// Ensure a module is enabled for the target world by editing world.json
function ensureModuleEnabled(foundryDir, worldName, moduleId) {
  const dataDir = process.env.DATA_PATH || path.join(foundryDir, 'Data');
  const worldJson = path.join(dataDir, 'worlds', worldName, 'world.json');
  if (!fs.existsSync(worldJson)) throw new Error(`world.json not found at ${worldJson}`);
  const raw = fs.readFileSync(worldJson, 'utf8');
  const json = JSON.parse(raw);
  // World JSON may or may not have a modules map; safely add it
  json.modules = json.modules || {};
  if (!json.modules[moduleId]) {
    json.modules[moduleId] = true;
    fs.writeFileSync(worldJson, JSON.stringify(json, null, 2));
    console.log(`Enabled module '${moduleId}' in ${worldJson}`);
    return true;
  }
  console.log(`Module '${moduleId}' already enabled in ${worldJson}`);
  return false;
}

async function waitForReport(foundryDir, timeoutMs) {
  const dataDir = process.env.DATA_PATH || path.join(foundryDir, 'Data');
  const reportPath = path.join(dataDir, 'quench-report.json');
  const start = Date.now();
  const progress = SHOW_PROGRESS ? startProgress('Waiting for quench-report.json to be written by Foundry', timeoutMs) : null;
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(reportPath)) {
      if (progress) progress.stop('found.');
      return reportPath;
    }
    await sleep(1000);
  }
  if (progress) progress.stop('timeout.');
  throw new Error('Timed out waiting for quench-report.json');
}

(async () => {
  try {
    console.log('Run Quench: starting');
    console.log('Foundry dir:', FOUNDY_DIR);
    console.log('World name:', WORLD_NAME);

    setWorldSetting(FOUNDY_DIR, WORLD_NAME);

    // Determine the Data directory used by Foundry (allow override with DATA_PATH)
    const dataDir = process.env.DATA_PATH || path.join(FOUNDY_DIR, 'Data');

    // Warn if Quench module is not present under the Data folder (common cause of no report being generated)
    const quenchModulePath = path.join(dataDir, 'modules', 'quench');
    if (!fs.existsSync(quenchModulePath)) {
      console.warn(`Quench module not found at ${quenchModulePath}. If you want the script to run Quench autorun, install Quench into your Foundry Data modules for this Foundry instance.`);
      console.warn('If Quench is installed in a different Data path, set DATA_PATH to point to it, or set QUENCH_NO_START_SERVER=true and run against a running Foundry with Quench installed.');
    } else {
      // If Quench is installed but not enabled in the world, enable it so autorun can run
      try {
        const changed = ensureModuleEnabled(FOUNDY_DIR, WORLD_NAME, 'quench');
        if (changed) console.log('Quench module enabled in world; it will be available on next reload.');
      } catch (e) {
        console.warn('Failed to auto-enable Quench in world.json:', e.message);
      }
    }

    // Quick-exit mode: only set the autorun flag and exit so an externally running Foundry will execute tests
    const skipWait = (process.env.QUENCH_SKIP_WAIT || 'false').toLowerCase() === 'true';
    if (skipWait) {
      console.log('QUENCH_SKIP_WAIT=true: autorun flag set; exiting without launching Foundry or waiting for report');
      process.exit(0);
    }

    // Launch Foundry server if not running
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

    // Clean up any stray processes that may be listening on the Foundry or dev ports
    const baseDevPort = Number(process.env.DEV_PORT || 30001);
    const devPortRange = [baseDevPort, baseDevPort + 1, baseDevPort + 2, baseDevPort + 3];
    await cleanPorts([foundryPort, ...devPortRange]);

    // Check if we should skip server management entirely
    const noStartServer = (process.env.QUENCH_NO_START_SERVER || 'false').toLowerCase() === 'true';
    if (noStartServer) {
      console.log('QUENCH_NO_START_SERVER=true: skipping Foundry and dev server management');
      console.log(`Will attempt to connect to existing Foundry instance at ${foundryHost}:${foundryPort}`);
      const foundryIsUp = await isPortOpen(foundryHost, foundryPort).catch(() => false);
      if (!foundryIsUp) {
        console.error(`QUENCH_NO_START_SERVER=true but no Foundry instance detected at ${foundryHost}:${foundryPort}`);
        console.error('Please start Foundry manually with the world "${WORLD_NAME}" loaded before running this script.');
        process.exit(4);
      }
    } else {
      // Verify that cleanup freed the foundry port. If not, fail early with actionable logs.
      const foundryStill = await isPortOpen(foundryHost, foundryPort).catch(() => false);
      if (foundryStill) {
        const pids = getPidsListeningOnPort(foundryPort);
        const ownedData = loadOwnedPids();
        const isOwned = pids.some(pid => ownedData.pids.includes(pid));
        if (isOwned) {
          console.warn(`Foundry port ${foundryPort} still in use by owned PIDs: ${pids.join(', ')}. Attempting to proceed anyway...`);
        } else {
          console.error(`Foundry port ${foundryPort} still in use by external PIDs: ${pids.join(', ')}.`);
          console.error(`Options: 1) Set QUENCH_NO_START_SERVER=true to connect to existing instance`);
          console.error(`         2) Set QUENCH_SHUTDOWN_EXISTING=force to kill external processes`);
          console.error(`         3) Manually kill: 'sudo kill -9 ${pids.join(' ')}'`);
          process.exit(3);
        }
      }

      const foundryIsUp = await isPortOpen(foundryHost, foundryPort).catch(() => false);
      const autoStart = (process.env.QUENCH_AUTO_START || 'false').toLowerCase() === 'true';

      if (foundryIsUp) {
        console.log(`Foundry appears to be running at ${foundryHost}:${foundryPort}; not starting a new server.`);
      } else if (!autoStart) {
        console.log(`Foundry is not running at ${foundryHost}:${foundryPort}.`);
        console.log(`Set QUENCH_AUTO_START=true to automatically start Foundry, or start it manually and set QUENCH_NO_START_SERVER=true.`);
        process.exit(5);
      } else {
        console.log(`Starting foundry server with entry ${entry}...`);
        // Use a shell invocation so we can use nvm to select Node 20 if available
        // Always pass an explicit --dataPath: prefer DATA_PATH env if provided, otherwise use FOUNDY_DIR/Data
        const computedDataPath = process.env.DATA_PATH || path.join(FOUNDY_DIR, 'Data');
        const dataPathArg = `--dataPath='${computedDataPath}'`;
        console.log('Launching Foundry with dataPath:', computedDataPath);
        const launchCmd = `source ~/.nvm/nvm.sh >/dev/null 2>&1 || true; nvm use 20 >/dev/null 2>&1 || true; node ${entry} ${dataPathArg}`;
        server = spawn('bash', ['-lc', launchCmd], { cwd: FOUNDY_DIR, env: { ...process.env }, stdio: ['ignore', 'pipe', 'pipe'] });
        foundryOwned = true;
        recordPid(server.pid, 'foundry-wrapper');

        server.stdout.on('data', chunk => process.stdout.write(`[foundry] ${chunk.toString()}`));
        server.stderr.on('data', chunk => process.stderr.write(`[foundry.err] ${chunk.toString()}`));

        // Wait until port is open (basic readiness)
        const start = Date.now();
        const foundryProgress = SHOW_PROGRESS ? startProgress('Waiting for Foundry to become available', TIMEOUT) : null;
        while (Date.now() - start < TIMEOUT) {
          const up = await isPortOpen(foundryHost, foundryPort).catch(() => false);
          if (up) {
            // Record the actual node process PID once port is open
            const nodePids = getPidsListeningOnPort(foundryPort);
            nodePids.forEach(pid => recordPid(pid, 'foundry-node'));
            if (foundryProgress) foundryProgress.stop('ready.');
            break;
          }
          await sleep(500);
        }
        if (foundryProgress) foundryProgress.stop('timeout/complete.');
      }
    }

    // Ensure bun dev (vite) is running; if not, try to spawn it so module code is served
    const devHost = '127.0.0.1';
    const devPort = Number(process.env.DEV_PORT || 30001);
    let devOwned = false;
    const devIsUp = await isPortOpen(devHost, devPort).catch(() => false);
    let devProc = null;

    if (!noStartServer) {
      if (!devIsUp) {
        const autoStart = (process.env.QUENCH_AUTO_START || 'false').toLowerCase() === 'true';
        if (autoStart) {
          try {
            console.log('Starting module dev server (bun dev)...');
            // When running headless automation, disable Vite's auto-open by setting QUENCH_NO_OPEN=true
            const spawnEnv = { ...process.env, QUENCH_NO_OPEN: headless ? 'true' : (process.env.QUENCH_NO_OPEN || 'false') };
            devProc = spawn('bun', ['dev'], { cwd: path.resolve(__dirname, '..'), env: spawnEnv, stdio: ['ignore', 'pipe', 'pipe'] });
            devOwned = true;
            recordPid(devProc.pid, 'dev-server');
            devProc.stdout.on('data', chunk => process.stdout.write(`[dev] ${chunk.toString()}`));
            devProc.stderr.on('data', chunk => process.stderr.write(`[dev.err] ${chunk.toString()}`));

            // Wait until dev port is open (basic readiness)
            const startDev = Date.now();
            const devProgress = SHOW_PROGRESS ? startProgress('Waiting for dev server (bun dev)', TIMEOUT) : null;
            while (Date.now() - startDev < TIMEOUT) {
              const d = await isPortOpen(devHost, devPort).catch(() => false);
              if (d) {
                const devPids = getPidsListeningOnPort(devPort);
                devPids.forEach(pid => recordPid(pid, 'dev-server-node'));
                if (devProgress) devProgress.stop('ready.');
                break;
              }
              await sleep(500);
            }
            if (devProgress) devProgress.stop('timeout/complete.');
          } catch (e) {
            console.warn('Failed to spawn bun dev; ensure you run it manually if needed', e.message);
          }
        } else {
          console.log(`Dev server not running at ${devHost}:${devPort}. Set QUENCH_AUTO_START=true to start automatically, or run 'bun dev' manually.`);
        }
      } else {
        console.log(`Dev server appears to be running at ${devHost}:${devPort}; not starting bun dev.`);
      }
    }

    // Launch headless browser to connect to Foundry client so Quench can run client-side tests
    let puppeteerBrowser = null;
    try {
      // Optionally auto-install puppeteer in CI/environment if it's missing and allowed
      const autoInstallPuppeteer = (process.env.QUENCH_AUTO_INSTALL_PUPPETEER || 'true').toLowerCase() === 'true';
      let puppeteer = null;
      try {
        puppeteer = require('puppeteer');
      } catch (e) {
        if (autoInstallPuppeteer) {
          console.log('Puppeteer not installed; installing automatically...');
          const { spawnSync } = require('child_process');
          const res = spawnSync('npm', ['i', '-D', 'puppeteer@latest', '--legacy-peer-deps'], { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
          if (res.status !== 0) throw new Error('Failed to install puppeteer automatically');
          puppeteer = require('puppeteer');
        } else {
          throw e;
        }
      }

      // Robust parsing: default to headless true unless explicitly set to 'false'
      const headlessEnvRaw = process.env.QUENCH_HEADLESS;
      const headless = headlessEnvRaw === undefined ? true : (/^true$/i.test(headlessEnvRaw));
      console.log(`Launching browser to connect to Foundry client (headless=${headless})...`);
      // Create an isolated user data dir so we do not attach to your normal Chrome profile
      const os = require('os');
      const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'quench-profile-'));
      // Use the modern headless mode when headless is enabled
      const headlessMode = headless ? 'new' : false;
      const launchOpts = {
        headless: headlessMode,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--no-first-run',
          '--no-zygote'
        ],
        userDataDir
      };
      if (!headless) {
        launchOpts.devtools = true;
        launchOpts.slowMo = 50;
      }
      console.log('puppeteer launch options:', Object.assign({}, launchOpts, {userDataDir: '[temp]'}));
      puppeteerBrowser = await puppeteer.launch(launchOpts);
      try { console.log('puppeteer wsEndpoint:', puppeteerBrowser.wsEndpoint ? puppeteerBrowser.wsEndpoint() : 'n/a'); } catch(e){}
      try { console.log('puppeteer spawnargs:', puppeteerBrowser.process ? puppeteerBrowser.process().spawnargs : 'n/a'); } catch(e){}
      const page = await puppeteerBrowser.newPage();
      // Ensure we remove the temporary profile when the browser is closed
      const removeUserDataDir = () => {
        try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) { /* ignore */ }
      };
      // Attach cleanup to browser close
      (async () => {
        if (puppeteerBrowser && puppeteerBrowser.process) {
          const proc = puppeteerBrowser.process();
          proc && proc.on && proc.on('exit', removeUserDataDir);
        }
      })();

      // Ensure reports dir exists for artifacts
      const reportsDir = path.resolve(__dirname, '..', 'reports');
      if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
      const ts = Date.now();
      const consoleLogPath = path.join(reportsDir, `client-console-${ts}.log`);
      const consoleStream = fs.createWriteStream(consoleLogPath, { flags: 'a' });

      // VERIFY HEADLESS: if tests expect headless mode, assert that the browser was launched with a headless flag
      try {
        const spawnArgs = (puppeteerBrowser && puppeteerBrowser.process && puppeteerBrowser.process().spawnargs) || [];
        const foundHeadlessFlag = spawnArgs.some(a => /--headless(=|$)|--headless=new/i.test(a));
        if (headless && !foundHeadlessFlag) {
          console.error('Headless mode expected but the browser was not launched with a headless flag. Aborting to avoid opening visible browser.');
          // Capture artifacts for debugging
          try { fs.writeFileSync(path.join(reportsDir, `puppeteer-spawnargs-${ts}.json`), JSON.stringify(spawnArgs, null, 2)); } catch(e){}
          try { if (puppeteerBrowser && puppeteerBrowser.close) await puppeteerBrowser.close(); } catch(e){}
          throw new Error('Browser was not launched headlessly as requested.');
        }
        // As proof, take a tiny screenshot (headless-only) to show the browser is running in headless mode
        try {
          const proofPath = path.join(reportsDir, `headless-proof-${ts}.png`);
          const tmpPage = await puppeteerBrowser.newPage();
          await tmpPage.setViewport({ width: 200, height: 100 });
          await tmpPage.goto(`http://127.0.0.1:${foundryPort}`, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(()=>{});
          await tmpPage.screenshot({ path: proofPath, fullPage: false }).catch(()=>{});
          await tmpPage.close();
          console.log('Wrote headless proof screenshot:', proofPath);
        } catch (e) { console.warn('Could not create headless proof screenshot:', e.message); }
      } catch (e) {
        console.warn('Headless verification failed:', e.message);
      }

      page.on('console', msg => {
        const text = msg.text();
        console.log(`[client.console] ${text}`);
        consoleStream.write(text + '\n');
      });
      page.on('pageerror', err => {
        const msg = `[client.pageerror] ${err.toString()}`;
        console.error(msg);
        consoleStream.write(msg + '\n');
      });

      // Capture network responses and failed requests to help debug setup failures
      try {
        const netLogPath = path.join(reportsDir, `client-network-${ts}.log`);
        const netStream = fs.createWriteStream(netLogPath, { flags: 'a' });
        page.on('response', async (resp) => {
          try {
            const url = resp.url();
            const status = resp.status();
            netStream.write(`${new Date().toISOString()} ${status} ${url}\n`);
          } catch (e) { /* ignore */ }
        });
        page.on('requestfailed', req => {
          try { netStream.write(`${new Date().toISOString()} FAILED ${req.url()} ${req.failure().errorText}\n`); } catch (e) { /* ignore */ }
        });
        // Ensure this stream is closed later with the console stream
        process.on('exit', () => { try { netStream.end(); } catch(e){} });
      } catch (e) { console.warn('Failed to set up network logging:', e.message); }

      try {
        await page.setViewport({ width: 1280, height: 900 });
      } catch (e) { /* ignore */ }

      const url = `http://${foundryHost}:${foundryPort}`;
      const navTimeout = Number(process.env.QUENCH_NAV_TIMEOUT || 180000);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: navTimeout }).catch(e => console.warn('Warning: navigation to Foundry client failed:', e.message));

      // Try to auto-join or trigger Quench from the client context. We'll poll for a logged-in user,
      // try to click common login buttons, attempt to start the world if we're in setup mode, and
      // finally call quench.runBatches directly
      const tryAutoJoinOrAutorun = async () => {
        // Debug: report whether window.game and window.quench are present immediately after navigation
        try {
          const debug = await page.evaluate(() => ({
            hasQuench: !!window.quench,
            quenchType: typeof window.quench,
            hasGame: !!(window.game && window.game.user && window.game.user.id),
            worldId: (window.game && window.game.world && window.game.world.id) || null,
            userId: (window.game && window.game.user && window.game.user.id) || null,
            path: window.location && window.location.pathname ? window.location.pathname : null,
            htmlSnippet: (document && document.body && document.body.textContent) ? document.body.textContent.slice(0,200) : ''
          }));
          console.log('[AUTO-RUN DEBUG] client status', JSON.stringify(debug));
        } catch (e) { console.warn('AUTO-RUN DEBUG failed:', e.message); }

        // If we're on /game and there is 'no active game session' shown, click the 'Go Back' / 'Return to Setup' button
        try {
          // Try twice in case the first click doesn't propagate
          for (let tryBack = 0; tryBack < 2; tryBack++) {
            const wentBack = await page.evaluate(() => {
              const bodyText = (document && document.body && document.body.textContent) ? document.body.textContent.toLowerCase() : '';
              if (bodyText.includes('there is currently no active game session')) {
                const btn = Array.from(document.querySelectorAll('button,a')).find(el => /(go back|return to setup|back to setup)/i.test((el.textContent||'')));
                if (btn) { try { btn.click(); return 'clicked-go-back'; } catch(e) { return 'click-fail'; } }
                return 'no-button';
              }
              return 'not-on-no-session';
            }).catch(() => 'error');

            if (wentBack && wentBack.startsWith('clicked')) {
              console.log('[AUTO-RUN] Clicked Go Back / Return to Setup to reach setup screen.');
              // Wait briefly for setup UI
              await sleep(1200);
              break;
            }
            await sleep(300);
          }
        } catch(e) { console.warn('Auto Back click failed:', e.message); }
        // Ensure the Game Worlds tab is active on the Setup screen so world tiles are loaded
        try {
          const tabResult = await page.evaluate(() => {
            const bodyText = (document && document.body && document.body.textContent) ? document.body.textContent.toLowerCase() : '';
            if (!bodyText.includes('game worlds')) return 'no-worlds-text';
            const candidates = Array.from(document.querySelectorAll('a,button,li'));
            const tab = candidates.find(el => /game worlds/i.test((el.textContent||'')));
            if (tab) { try { tab.click(); return 'clicked-worlds-tab'; } catch(e) { return 'click-fail'; } }
            // fallback to generic tab selectors
            const alt = Array.from(document.querySelectorAll('[role="tab"], [data-tab]')).find(el => /(worlds|world)/i.test((el.textContent||'') + ' ' + (el.dataset && (el.dataset.tab || ''))));
            if (alt) { try { alt.click(); return 'clicked-alt-tab'; } catch(e) { return 'click-fail-alt'; } }
            return 'tab-not-found';
          }).catch(() => 'error');

          console.log('[AUTO-RUN] Worlds tab status', tabResult);

          if (tabResult && tabResult.startsWith('clicked')) {
            // Wait up to 10s for world tiles to appear
            const tilesPresent = await (async () => {
              const start = Date.now();
              const timeoutMs = 10000;
              while (Date.now() - start < timeoutMs) {
                const found = await page.evaluate(() => {
                  return !!(document.querySelector('.setup .setup-packages-worlds .package') || document.querySelector('[data-world-id]') || document.querySelector('.package'));
                }).catch(() => false);
                if (found) return true;
                await sleep(500);
              }
              return false;
            })();
            console.log('[AUTO-RUN] Worlds tab tiles present:', tilesPresent);
          }
        } catch (e) { console.warn('Worlds tab activation failed:', e.message); }
        // If the client is in setup mode (no world loaded), attempt to click the Play button for the requested world
        const desiredWorld = process.env.WORLD_NAME || process.env.FOUNDY_WORLD || '';
        if (desiredWorld) {
          try {
            // We'll attempt selection multiple times to be resilient
            let started = false;
            for (let attempt = 0; attempt < 5 && !started; attempt++) {
              started = await page.evaluate(async (worldName) => {
                // Be robust: search for world tiles under several possible selectors, including dataset attributes
                const tileSelectors = ['.setup .setup-packages-worlds .package', '.world-list .world', '.setup .package', '.setup-package-item', '.setup-packages .package', '[data-world-id]', '[data-world]'];
                let tiles = [];
                for (const s of tileSelectors) tiles.push(...Array.from(document.querySelectorAll(s)));
                tiles = tiles.filter(Boolean);

                // If no structured tiles found, broaden search to anchors/buttons and tiles with world text
                if (tiles.length === 0) tiles = Array.from(document.querySelectorAll('a,button,div'));

                for (const t of tiles) {
                  const txt = (t.textContent || '').toLowerCase();
                  // Also check data attributes for world id/name
                  const dataAttrs = Object.assign({}, t.dataset || {});
                  const dataText = Object.values(dataAttrs).join(' ').toLowerCase();
                  if (txt.includes(worldName.toLowerCase()) || dataText.includes(worldName.toLowerCase())) {
                    // Find a descendant Play-like button
                    const possibleBtn = Array.from(t.querySelectorAll('button,a')).find(el => /play|launch|enter|open/i.test(el.textContent || ''));
                    if (possibleBtn) { try { possibleBtn.click(); return true; } catch (e) { /* ignore */ } }
                    // If no button, try clicking the tile itself
                    try { t.click(); return true; } catch (e) { /* ignore */ }
                  }
                }

                // Fallback: find any global Play button
                const playBtn = Array.from(document.querySelectorAll('button,a')).find(el => /^\s*play\s*$/i.test((el.textContent||'')));
                if (playBtn) { try { playBtn.click(); return true; } catch (e) { /* ignore */ } }

                return false;
              }, desiredWorld).catch(() => false);

              if (!started) {
                console.log('[AUTO-RUN] World start attempt failed; retrying...');
                await sleep(1200);
              }
            }

            // 'started' indicates we clicked play; wait for world to load
            if (started) console.log('[AUTO-RUN] Clicked Play/Launch for world', desiredWorld);

            if (started) {
              console.log(`[AUTO-RUN] Clicked Play for world '${desiredWorld}'`);
              // Wait for the world to load (window.game.world.id === desiredWorld)
              const worldLoaded = await (async () => {
                const start = Date.now();
                const timeoutMs = Number(process.env.QUENCH_NAV_TIMEOUT || 180000);
                while (Date.now() - start < timeoutMs) {
                  const id = await page.evaluate(() => (window.game && window.game.world && window.game.world.id) || null).catch(() => null);
                  if (id === desiredWorld) return true;
                  await sleep(1000);
                }
                return false;
              })();

              if (worldLoaded) {
                console.log(`[AUTO-RUN] World '${desiredWorld}' loaded in client`);
                // Give a short grace period for modules to initialize
                await sleep(2200);
              } else {
                console.warn(`[AUTO-RUN] Timed out waiting for world '${desiredWorld}' to load`);
              }
            }

            // If we tried several times and failed, capture a DOM snapshot of candidate elements for debugging
            if (!started) {
              try {
                const domSnapshot = await page.evaluate(() => {
                  const selectors = ['.setup .setup-packages-worlds .package', '.world-list .world', '.setup .package', '.setup-package-item', '.setup-packages .package', '[data-world-id]', '[data-world]'];
                  const found = [];
                  for (const s of selectors) {
                    const els = Array.from(document.querySelectorAll(s));
                    for (const el of els) {
                      found.push({ selector: s, text: (el.textContent || '').slice(0,200), html: el.outerHTML ? el.outerHTML.slice(0,2000) : null });
                    }
                  }
                  // Also include a short body text sample
                  return { path: window.location.pathname, found, bodyText: (document.body && document.body.textContent) ? document.body.textContent.slice(0,2000) : '' };
                });
                try { fs.writeFileSync(path.join(reportsDir, `client-dom-candidates-${ts}.json`), JSON.stringify(domSnapshot, null, 2)); console.log('Wrote client DOM candidates snapshot for debugging'); } catch(e) { console.warn('Failed to write DOM candidates snapshot:', e.message); }
              } catch(e) { console.warn('Failed to capture DOM candidate info:', e.message); }
            }

          } catch (e) { console.warn('Auto-start world failed:', e.message); }
        }

        const candidateSelectors = ['#players .users-list button', '.users-list button', 'a.player', 'button.player', '.user-list button', 'a.join', 'button.join', 'button[data-action="join"]', 'button[data-player-id]'];
        for (let attempt = 0; attempt < 240; attempt++) {
          // If a user is logged in, we're ready
          const hasUser = await page.evaluate(() => !!(window.game && window.game.user && window.game.user.id)).catch(() => false);
          if (hasUser) {
            console.log('Client has a logged-in user');
            // If quench exists, call runBatches directly
            const quenchAvail = await page.evaluate(() => !!(window.quench && typeof window.quench.runBatches === 'function')).catch(() => false);
            if (quenchAvail) {
              console.log('Quench is available in client; triggering runBatches from client');
              await page.evaluate(() => { window.quench.runBatches('**', { json: true }).catch(e => console.error('[AUTO-RUN] quench.runBatches error', e)); }).catch(e => console.error('[AUTO-RUN] failed to trigger runBatches', e));
              return true;
            }
            return true;
          }

          // Try to find and click a login/join button
          const sel = await page.evaluate((sels) => {
            for (const s of sels) if (document.querySelector(s)) return s;
            return null;
          }, candidateSelectors).catch(() => null);
          if (sel) {
            try {
              await page.click(sel);
              console.log(`Clicked login selector ${sel}`);
              await sleep(1000);
              continue;
            } catch (e) {
              console.warn('Click failed for selector', sel, e.message);
            }
          }

          // If Quench is present and user is not required, try to trigger it anyway
          const quenchReady = await page.evaluate(() => !!(window.quench && typeof window.quench.runBatches === 'function' && window.game && window.game.user && window.game.user.id)).catch(() => false);
          if (quenchReady) {
            console.log('Quench is available and client user present; calling runBatches');
            await page.evaluate(() => { window.quench.runBatches('**', { json: true }).catch(e => console.error('[AUTO-RUN] quench.runBatches error', e)); }).catch(e => console.error('[AUTO-RUN] failed to trigger runBatches', e));
            return true;
          }

          await sleep(1000);
        }
        return false;
      };

      const autorunTriggered = await tryAutoJoinOrAutorun();
      if (!autorunTriggered) {
        console.warn('Auto-join/autorun did not find a logged-in client or could not trigger Quench; Quench may not run automatically in this session.');

        // Dump a short snippet of page content and take a screenshot to help debugging
        try {
          const html = await page.content();
          const snippet = html.slice(0, 5000);
          console.log('[client.content.snippet] ' + snippet.replace(/\s+/g,' ').slice(0,1200));
          fs.writeFileSync(path.join(reportsDir, `client-content-${ts}.html`), html);
        } catch (e) { console.warn('Failed to read page content for debugging:', e.message); }
        try { await page.screenshot({ path: path.join(reportsDir, `client-screenshot-${ts}.png`), fullPage: true }); } catch (e) { console.warn('Failed to take screenshot:', e.message); }

        // Capture a broader DOM dump of top elements for easier inspection (tag, id, classes, text snippet)
        try {
          const domDump = await page.evaluate(() => {
            const els = Array.from(document.querySelectorAll('body *'));
            const take = els.slice(0, 200).map(el => ({
              tag: el.tagName,
              id: el.id || null,
              classes: (el.className && typeof el.className === 'string') ? el.className.split(/\s+/).slice(0,5) : [],
              text: (el.textContent || '').trim().slice(0,200),
              outer: (el.outerHTML || '').slice(0,1000),
              attrs: Array.from(el.attributes || []).slice(0,10).map(a => ({ name: a.name, value: a.value }))
            }));
            return { path: window.location.pathname, snapshot: take };
          });
          try { fs.writeFileSync(path.join(reportsDir, `client-dom-dump-${ts}.json`), JSON.stringify(domDump, null, 2)); console.log('Wrote client DOM dump for debugging'); } catch(e) { console.warn('Failed to write DOM dump:', e.message); }
        } catch (e) { console.warn('Failed to capture DOM dump:', e.message); }
      }

      // Flush console stream
      consoleStream.end();
    } catch (e) {
      console.warn('Puppeteer is not installed or failed to launch a headless client:', e.message);
      console.warn('Install puppeteer with `npm i -D puppeteer` and re-run if you want automated headless client connection.');
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

    // Close headless browser if we launched one
    if (typeof puppeteerBrowser !== 'undefined' && puppeteerBrowser && puppeteerBrowser.close) {
      console.log('Closing headless browser...');
      try { await puppeteerBrowser.close(); } catch (e) { console.warn('Failed to close headless browser:', e.message); }
      // Clean up any temporary user profile dir if it was created
      try {
        const os = require('os');
        const tmpPrefix = path.join(os.tmpdir(), 'quench-profile-');
        const entries = fs.readdirSync(os.tmpdir()).filter(n => n.startsWith('quench-profile-'));
        for (const e of entries) {
          const pth = path.join(os.tmpdir(), e);
          try { fs.rmSync(pth, { recursive: true, force: true }); } catch (err) { /* ignore */ }
        }
      } catch (err) { /* ignore */ }
    }

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

    // Clear owned PIDs since we successfully shut down our processes
    clearOwnedPids();

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('run-quench failed:', err);
    process.exit(2);
  }
})();
