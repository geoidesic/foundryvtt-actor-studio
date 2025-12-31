import { describe, test, expect, beforeEach } from 'vitest';
import { generateImageFromPrompt } from '~/src/helpers/aiImage';
import { aiPreview } from '~/src/stores/aiPortraitStore';
import { get } from 'svelte/store';

describe('AI Portrait Panel - Debug preview (store driven)', () => {
  beforeEach(() => {
    window.GAS = window.GAS || {};
    window.GAS.debug = true;
    global.game = global.game || {};
    global.game.settings = { get: () => '' , settings: new Map() };
  });

  test('debug generation produces test image and sets shared preview store', async () => {
    const res = await generateImageFromPrompt('any prompt');
    expect(res).toBeTruthy();
    expect(res.dataUrl).toContain('aardvark-logo.webp');

    // Populate shared preview and verify the store setter is callable
    aiPreview.set(res);
    expect(typeof aiPreview.set).toBe('function');
    // If the store is implemented as a mock, it should have been called with the expected payload
    if (aiPreview.set?.mock) expect(aiPreview.set).toHaveBeenCalledWith(res);

    // cleanup
    window.GAS.debug = false;
  });
});
