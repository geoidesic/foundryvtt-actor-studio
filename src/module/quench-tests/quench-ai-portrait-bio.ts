/* Quench test: Verify generated portrait preview appears in Biography tab after clicking Generate
   - Runs in Foundry via Quench (Hook: quenchReady)
   - Uses debug mode to avoid external API calls (window.GAS.debug = true)
*/

import { MODULE_ID } from '~/src/helpers/constants';
import type { Quench, QuenchContext } from '@ethaks/fvtt-quench';

Hooks.on('quenchReady', (quench: Quench) => {
  quench.registerBatch(
    'actor-studio.ai-portrait-bio',
    (context: QuenchContext) => {
      const { describe, it, assert, utils } = context;

      describe('AI Portrait - Biography Tab', function () {
        it('shows generated portrait preview in Bio tab after clicking Generate', async function () {
          // Enable debug mode so generation returns a test image
          window.GAS = window.GAS || {};
          window.GAS.debug = true;

          // Ensure portrait UI is enabled in settings
          await game.settings.set(MODULE_ID, 'enableAiTokens', true);

          // Open Actor Studio for the current user
          Hooks.call('gas.openActorStudio', game.user.name, '', 'character');

          // Wait for Actor Studio to appear
          let appEl = null;
          for (let i = 0; i < 50; i++) {
            appEl = document.querySelector('#foundryvtt-actor-studio-pc-sheet');
            if (appEl) break;
            await utils.pause(0.1);
          }
          assert.ok(appEl, 'Actor Studio opened');

          // Wait for the AI portrait panel to be present in the Biography tab
          let aiPanel = null;
          for (let i = 0; i < 50; i++) {
            aiPanel = appEl.querySelector('.ai-portrait-panel');
            if (aiPanel) break;
            await utils.pause(0.1);
          }
          assert.ok(aiPanel, 'AI Portrait panel is present in Biography tab');

          // Find the Generate button inside Actor Studio and click it
          const genButton = Array.from(appEl.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim().startsWith('Generate'));
          assert.ok(genButton, 'Found Generate button in the UI');

          // Trigger the mousedown so Svelte on:mousedown handlers run
          genButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));

          // Wait for the preview image to appear in the AI panel
          let imgEl = null;
          for (let i = 0; i < 100; i++) {
            imgEl = appEl.querySelector('img[alt="AI preview"]');
            if (imgEl && imgEl.getAttribute('src')) break;
            await utils.pause(0.1);
          }

          assert.ok(imgEl, 'Preview <img> element appeared');
          const src = imgEl.getAttribute('src') || '';
          assert.ok(src.length > 0, 'Preview <img> has a non-empty src');

          // In debug mode the test image is aardvark-logo.webp (module asset). Accept if path contains aardvark or is a data URL
          assert.ok(/aardvark|data:image|modules\//i.test(src), `Preview src looks valid: ${src}`);

          // Close Actor Studio
          Hooks.call('gas.close');
        });
      });
    },
    { displayName: 'ACTOR‑STUDIO: AI Portrait (Bio) - preview after Generate', preSelected: true }
  );
});
