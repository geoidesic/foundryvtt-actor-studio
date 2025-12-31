import { test, expect, beforeEach } from 'vitest';
import { generateImageFromPrompt } from '~/src/helpers/aiImage';

beforeEach(() => {
  window.GAS = window.GAS || {};
  window.GAS.debug = true;
});

test('generateImageFromPrompt returns test image in debug mode', async () => {
  const res = await generateImageFromPrompt('any prompt');
  expect(res).toBeTruthy();
  expect(res.dataUrl).toContain('aardvark-logo.webp');
});
