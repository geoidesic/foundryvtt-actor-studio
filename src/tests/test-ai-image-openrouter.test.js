import { vi, describe, it, expect, afterEach } from 'vitest';
import { generateImageFromPrompt } from '~/src/helpers/aiImage';

vi.mock('~/src/helpers/Utility', async () => {
  const actual = await vi.importActual('~/src/helpers/Utility');
  return {
    ...actual,
    safeGetSetting: vi.fn((module, key, d) => {
      if (key === 'llmApiKey') return 'test-api-key';
      if (key === 'llmProvider') return 'openrouter';
      if (key === 'openrouterImageModel') return 'openai/gpt-5-image';
      if (key === 'llmBaseUrl') return 'https://openrouter.ai/api/v1';
      return d;
    })
  };
});

describe('OpenRouter image success', () => {
  const realFetch = global.fetch;

  afterEach(() => {
    global.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it('parses base64 response from OpenRouter generation endpoint', async () => {
    const fakeB64 = 'iVBORw0KGgoAAAANSUhEUgAA...';
    const payload = { id: 'gen-1', output: [{ b64: fakeB64 }] };
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, status: 200, text: async () => JSON.stringify(payload) }));

    const res = await generateImageFromPrompt('a test prompt');
    expect(res.dataUrl.startsWith('data:image/png;base64,')).toBe(true);
    expect(res.prompt).toBe('a test prompt');
  });

  it('falls back to alternative endpoint when initial returns 404 JSON', async () => {
    const fakeB64 = 'abcdBASE64DATA...';
    // First call: 404 JSON body
    const first = Promise.resolve({ ok: false, status: 404, statusText: 'Not Found', text: async () => JSON.stringify({ error: { message: 'Not Found', code: 404 } }) });
    // Second call: alternative returns 200 with payload
    const second = Promise.resolve({ ok: true, status: 200, text: async () => JSON.stringify({ output: [{ b64: fakeB64 }] }) });

    let call = 0;
    global.fetch = vi.fn(() => { call++; return call === 1 ? first : second; });

    const res = await generateImageFromPrompt('fallback prompt');
    expect(res.dataUrl).toContain(fakeB64);
    expect(res.prompt).toBe('fallback prompt');
  });
});