/**
 * Quench autorun helper
 * - When the world setting `actor-studio.quenchAutorun` is true, run Quench batches on quenchReady
 * - Writes JSON report via Quench's built-in `{ json:true }` option (Quench will save to Data/quench-report.json)
 */
import { MODULE_ID } from '~/src/helpers/constants';
import type { Quench } from '@ethaks/fvtt-quench';

Hooks.on('quenchReady', async (quench: Quench) => {
  try {
    const autorun = game.settings.get(MODULE_ID, 'quenchAutorun');
    if (!autorun) return;

    window.GAS && window.GAS.log && window.GAS.log.d && window.GAS.log.d('[QUENCH-AUTORUN] Detected autorun flag; running all batches');
    await quench.runBatches('**', { json: true });
    window.GAS && window.GAS.log && window.GAS.log.d && window.GAS.log.d('[QUENCH-AUTORUN] Batches completed; report should be at Data/quench-report.json');

    // Optionally notify users in Foundry UI
    ui.notifications?.info('Quench autorun: batches completed and JSON report written to Data/quench-report.json');
  } catch (e) {
    console.error('[QUENCH-AUTORUN] Error running batches:', e);
    ui.notifications?.error('Quench autorun failed: ' + (e.message || e));
  }
});
