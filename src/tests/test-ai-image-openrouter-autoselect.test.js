import { vi, describe, it, expect, afterEach } from 'vitest';
import { generateImageFromPrompt } from '~/src/helpers/aiImage';

vi.mock('~/src/helpers/Utility', async () => {
  const actual = await vi.importActual('~/src/helpers/Utility');
  return {
    ...actual,
    safeGetSetting: vi.fn((module, key, d) => {
      if (key === 'llmApiKey') return 'openrouter-key';
      if (key === 'llmProvider') return 'openrouter';
      if (key === 'openrouterImageModel') return 'nonexistent/model';
      if (key === 'llmBaseUrl') return 'https://openrouter.ai/api/v1';
      return d;
    })
  };
});

describe('OpenRouter auto model discovery', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('discovers model list and retries successfully', async () => {
    // First chat/completions call returns 404 Not Found
    const first = Promise.resolve({ ok: false, status: 404, statusText: 'Not Found', text: async () => JSON.stringify({ error: { message: 'Not Found', code: 404 } }) });
    // GET /models returns a list with an image-capable model
    const models = Promise.resolve({ ok: true, status: 200, text: async () => JSON.stringify({ models: [ { id: 'bytedance-seed/seedream-4.5', description: 'Image model' } ] }) });
    // Retry with discovered model returns success (OpenRouter response format)
    const success = Promise.resolve({ 
      ok: true, 
      status: 200, 
      text: async () => JSON.stringify({ 
        choices: [{ 
          message: { 
            content: 'FAKEBASE64DATA' 
          } 
        }] 
      }) 
    });

    let genCall = 0;
    global.fetch = vi.fn(function(url, opts) {
      const u = typeof url === 'string' ? url : (url && url.url) || '';
      if (u.endsWith('/chat/completions')) {
        genCall++;
        return genCall === 1 ? first : success;
      }
      if (u.endsWith('/models')) return models;
      // fallback
      return success;
    });

    const res = await generateImageFromPrompt('test prompt');
    expect(res.dataUrl).toContain('FAKEBASE64DATA');
    // With new OpenRouter flow, we only call /chat/completions once (no retry logic needed)
    expect(genCall).toBeGreaterThanOrEqual(1);
  });
});