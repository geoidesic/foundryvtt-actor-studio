import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateImageFromPrompt } from '~/src/helpers/aiImage';
import { safeGetSetting } from '~/src/helpers/Utility';

vi.mock('~/src/helpers/Utility', async () => {
  const actual = await vi.importActual('~/src/helpers/Utility');
  return {
    ...actual,
    safeGetSetting: vi.fn((module, key, d) => {
      if (key === 'llmApiKey') return 'test-api-key';
      if (key === 'llmProvider') return 'openrouter';
      if (key === 'openrouterModel') return 'stability/SDXL';
      if (key === 'llmBaseUrl') return 'https://openrouter.ai/api/v1';
      if (key === 'aiImagesUsePlaceholderOnFailure') return true;
      return d;
    })
  };
});

describe('AI image helper - error conditions', () => {
  const realFetch = global.fetch;

  afterEach(() => {
    global.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it('throws informative error when fetch fails (network/DNS)', async () => {
    global.fetch = vi.fn(() => { throw new TypeError('Failed to fetch'); });

    await expect(generateImageFromPrompt('test prompt')).rejects.toThrow(/network error calling/i);
  });

  it('throws informative error on non-JSON HTML response', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => '<html><body>Not Found</body></html>'
    }));

    await expect(generateImageFromPrompt('test prompt')).rejects.toThrow(/non-JSON response/i);
  });

  it('includes attempts array when initial endpoint returns non-JSON or 405', async () => {
    // First call returns 405 and empty body
    const first = Promise.resolve({ ok: false, status: 405, statusText: 'Method Not Allowed', text: async () => '' });
    // Second call (alt) returns 404 HTML
    const second = Promise.resolve({ ok: false, status: 404, statusText: 'Not Found', text: async () => '<html></html>' });
    // Third call (alt) fails network
    const third = Promise.reject(new TypeError('Failed to fetch'));

    let call = 0;
    global.fetch = vi.fn(() => {
      call++;
      if (call === 1) return first;
      if (call === 2) return second;
      return third;
    });

    await expect(generateImageFromPrompt('test prompt')).rejects.toThrow(/Tried alternative endpoints/);
  });

  it('returns placeholder when provider returns no image and setting enabled', async () => {
    // Simulate a successful 200 response but with an empty output (no b64 or url)
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, status: 200, text: async () => JSON.stringify({ output: [] }) }));

    const res = await generateImageFromPrompt('test prompt');
    expect(res.dataUrl).toBeTruthy();
    expect(res.dataUrl.startsWith('data:image/png;base64,')).toBe(true);
    expect(res.prompt).toBe('test prompt');
    expect(res.diagnostics).toBeDefined();
    expect(res.diagnostics.message).toMatch(/unexpected payload shape/i);
  });
});