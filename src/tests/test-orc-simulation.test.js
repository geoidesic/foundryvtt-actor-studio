import { describe, it, expect, vi } from 'vitest';
import LLM from '~/src/plugins/llm';

describe('Orc integrated generation simulation', () => {
  it('sends prompt/payload and returns integrated explanation (simulated provider)', async () => {
    // Force provider to openrouter so the prompt is visible in messages
    vi.spyOn(LLM, 'getProvider').mockReturnValue('openrouter');
    vi.spyOn(LLM, 'getApiKey').mockReturnValue('testapikey12345');

    const orcParams = {
      race: 'Orc',
      characterClass: 'Artificer',
      level: 1,
      background: 'Artisan',
      abilityScores: { str: 18, dex: 8, con: 12, int: 10, wis: 9, cha: 11 },
      characterDetails: { height: "3'10\"", weight: '100 lbs', age: '13' },
      elements: ['appearance', 'biography']
    };

    // Mock response: integrated explanation in both fields
    const fakeResponse = {
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'TOON\nappearance: Gruk is compact and solid, his disproportionately muscular frame hinting at an early workshop accident that left him unusually strong for his size.\nbiography: When Gruk was very young, a mishap with a reactive enchantment in his clan\'s forge altered his growth; he turned that change into a strength through long hours of labor and clever invention, becoming an artificer who builds with both skill and force.\nENDTOON' } }] })
    };

    const fetchSpy = vi.fn(() => Promise.resolve(fakeResponse));
    global.fetch = fetchSpy;

    const result = await LLM.generateBiography(orcParams);

    // Log the prompt/payload that was sent to the provider
    const sent = fetchSpy.mock.calls[0][1].body;
    console.log('--- PROMPT/PAYLOAD SENT TO PROVIDER ---');
    console.log(sent);
    console.log('--- PARSED RESULT ---');
    console.log(result);

    // Ensure returned fields have integrated causal phrasing and do not contain the literal "Anomaly:"
    expect(result.appearance).toMatch(/mishap|accident|enchant|enchantment|workshop|because|due to|after/i);
    expect(result.biography).toMatch(/mishap|accident|enchant|enchantment|workshop|because|due to|after/i);
    expect(result.appearance).not.toMatch(/Anomaly:/);
    expect(result.biography).not.toMatch(/Anomaly:/);

    vi.restoreAllMocks();
  });
});