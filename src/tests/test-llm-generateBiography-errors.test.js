import { vi, describe, it, expect, afterEach } from 'vitest';
import LLM from '~/src/plugins/llm';

vi.mock('~/src/helpers/Utility', async () => {
  const actual = await vi.importActual('~/src/helpers/Utility');
  return {
    ...actual,
    safeGetSetting: vi.fn((module, key, d) => {
      if (key === 'llmApiKey') return 'test-api-key';
      if (key === 'llmProvider') return 'openai';
      if (key === 'llmBaseUrl') return 'http://localhost:30001';
      return d;
    })
  };
});

describe('LLM.generateBiography - error diagnostics', () => {
  const realFetch = global.fetch;

  afterEach(() => {
    global.fetch = realFetch;
    vi.restoreAllMocks();
  });

  it('throws informative error when proxy returns HTML (non-JSON)', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => '<html><body>Not Found</body></html>'
    }));

    await expect(LLM.generateBiography({ race: 'Human', characterClass: 'Fighter', level: 1, elements: ['biography'] })).rejects.toThrow(/non-JSON response from/);
  });
});