import { describe, it, expect } from 'vitest';
import LLM from '~/src/plugins/llm';

describe('LLM.analyzeAbilityScoreCorrelations anomalies', () => {
  it('detects strong-but-small anomaly (height/weight mismatch with STR)', () => {
    const abilities = { str: { value: 18 }, dex: { value: 10 }, con: { value: 12 }, int: { value: 8 }, wis: { value: 9 }, cha: { value: 11 } };
    const details = { height: "3'5\"", weight: '100 lbs', age: '25' };
    const out = LLM.analyzeAbilityScoreCorrelations(abilities, 'Half-Orc', details, 'Barbarian', 'Soldier');
    expect(out).toMatch(/Exceptional Strength|Impressive Strength|Unusually light/);
  });

  it('flags high ability not typical for class', () => {
    const abilities = { str: { value: 17 }, dex: { value: 8 }, con: { value: 10 }, int: { value: 16 }, wis: { value: 9 }, cha: { value: 10 } };
    const details = { height: "5'9\"", weight: '160 lbs' };
    const out = LLM.analyzeAbilityScoreCorrelations(abilities, 'Human', details, 'Wizard', 'Sage');
    expect(out).toMatch(/High STR \(17\) is not a typical primary for a Wizard|High STR/);
  });

  it('flags low primary ability for class', () => {
    const abilities = { str: { value: 8 }, dex: { value: 10 }, con: { value: 12 }, int: { value: 11 }, wis: { value: 9 }, cha: { value: 10 } };
    const details = { height: "6'2\"", weight: '180 lbs' };
    const out = LLM.analyzeAbilityScoreCorrelations(abilities, 'Human', details, 'Fighter', 'Soldier');
    expect(out).toMatch(/Low STR \(8\) for a Fighter|Below-average STR/);
  });

  it('flags background mismatch (low CHA for Charlatan)', () => {
    const abilities = { str: { value: 10 }, dex: { value: 12 }, con: { value: 11 }, int: { value: 13 }, wis: { value: 9 }, cha: { value: 8 } };
    const details = { height: "5'6\"", weight: '140 lbs' };
    const out = LLM.analyzeAbilityScoreCorrelations(abilities, 'Human', details, 'Rogue', 'Charlatan');
    expect(out).toMatch(/Low CHA \(8\) is unusual for someone with a Charlatan background/);
  });

  it('describeAnomaliesFromAnalysis generates explanatory sentence', () => {
    const analysis = 'Exceptional Strength (18) for a Half-Orc - this character\'s physical power is remarkable and likely plays a significant role in their background.';
    const details = { height: "3'10\"", weight: '100 lbs' };
    const sentence = LLM.describeAnomaliesFromAnalysis(analysis, { str: 18 }, 'Half-Orc', details, 'Artificer', 'Artisan');
    expect(sentence).toMatch(/Possible explanations include/);
    expect(sentence.length).toBeGreaterThan(20);
  });

  it('buildAnomalyInstruction produces a class-appropriate integrated instruction', () => {
    const analysis = 'Unusually light (100 lbs) for height (3\'10\") - this character\'s slender build is striking.';
    const instruction = LLM.buildAnomalyInstruction(analysis, 'Artificer', 'Artisan');
    expect(instruction).toMatch(/INTEGRATE ANOMALIES/);
    expect(instruction).toMatch(/mechanical and technical/);
    expect(instruction).not.toMatch(/Anomaly:/);
  });

  it('buildAnomalyInstruction requests integrated single-cause explanations and mentions age', () => {
    const analysis = 'Exceptional Strength (18) despite short stature. Unusually young age (13) with high INT.';
    const instruction = LLM.buildAnomalyInstruction(analysis, 'Artificer', 'Artisan');
    expect(instruction).toMatch(/integrate/i);
    expect(instruction).toMatch(/age/i);
    expect(instruction).not.toMatch(/Anomaly:/);
  });

  it('buildAnomalyLines returns per-sentence integrated explanation sentences tailored to class', () => {
    const analysis = 'Exceptional Strength (18) despite short stature. Unusually young age (13) with high INT. Low Dexterity (8) is notable.';
    const abilities = { str: 18, dex: 8, int: 16 };
    const details = { height: "3'10\"", weight: '100 lbs', age: '13' };
    const lines = LLM.buildAnomalyLines(analysis, abilities, 'Orc', details, 'Artificer', 'Artisan');
    expect(Array.isArray(lines)).toBe(true);
    expect(lines.length).toBe(3);
    expect(lines[0]).not.toMatch(/^Anomaly:/);
    expect(lines[0]).toMatch(/training|augment|graft|reinforced|musculature/i);
    expect(lines[1]).toMatch(/youth|young|prodigious|talent/i);
    expect(lines[2]).toMatch(/stabilizers|mechanical|compensated|diet|physiology/i);
  });

  it('generateBiography includes integrated anomaly instruction in outgoing request payload', async () => {
    // Mock fetch to capture request
    const fakeResponse = {
      ok: true,
      json: async () => ({ object: { biography: 'TOON\nappearance: Sample\nbiography: Sample\nENDTOON' } })
    };
    const fetchSpy = vi.fn(() => Promise.resolve(fakeResponse));
    global.fetch = fetchSpy;

    const params = {
      race: 'Orc',
      characterClass: 'Artificer',
      level: 1,
      background: 'Artisan',
      abilityScores: { str: 18, dex: 8, int: 13 },
      characterDetails: { height: "3'10\"", weight: '100 lbs', age: '13' },
      elements: ['appearance', 'biography']
    };

    const result = await LLM.generateBiography(params);

    // Ensure fetch was called and body contained integrated anomaly instruction but NOT anomalyLines
    expect(fetchSpy).toHaveBeenCalled();
    const callArgs = fetchSpy.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body).toHaveProperty('anomalyInstruction');
    expect(body.anomalyInstruction).toMatch(/INTEGRATE ANOMALIES/);
    expect(body).not.toHaveProperty('anomalyLines');
  });

  it('prompts the LLM to infer abilities when ability scores are missing', async () => {
    // Mock provider to openrouter so prompt is sent in messages
    vi.spyOn(LLM, 'getProvider').mockReturnValue('openrouter');
    vi.spyOn(LLM, 'getApiKey').mockReturnValue('testapikey12345');

    const fakeResponse = {
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'TOON\nappearance: A solid, muscled build suggests surprising power (Inferred STR ~18).\nbiography: A childhood of heavy labor and an early workshop mishap hint at why he is so powerful for his size (Inferred STR ~18).\nENDTOON' } }] })
    };
    const fetchSpy = vi.fn(() => Promise.resolve(fakeResponse));
    global.fetch = fetchSpy;

    const params = {
      race: 'Orc',
      characterClass: 'Artificer',
      level: 1,
      background: 'Artisan',
      abilityScores: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
      characterDetails: { height: "3'10\"", weight: '100 lbs', age: '13' },
      elements: ['appearance', 'biography']
    };

    // Also set actorInGame to a proxy with missing abilities to simulate Footer passing bad actor
    const { actorInGame } = await import('~/src/stores/storeDefinitions');
    actorInGame.set(null);

    await LLM.generateBiography(params);

    // The prompt should have included the NOTE about missing ability scores
    const sent = fetchSpy.mock.calls[0][1].body;
    expect(sent).toMatch(/No explicit ability scores were provided/);

    vi.restoreAllMocks();
  });

  it('generateBiography will re-prompt the LLM to insert anomaly lines when initial response omits them', async () => {
    // First fetch returns a TOON without Anomaly lines
    const firstResp = {
      ok: true,
      json: async () => ({ object: { biography: 'TOON\nappearance: A plain appearance\nbiography: A plain biography\nENDTOON' } })
    };

    // Second fetch returns corrected TOON including integrated explanations
    const secondResp = {
      ok: true,
      json: async () => ({ object: { biography: 'TOON\nappearance: A compact, surprisingly muscular form hints at a childhood workshop accident that altered his growth. A plain appearance\nbiography: After a mishap with an experimental forge enchantment, he learned to turn his altered body into an asset and trained in the clan workshops. A plain biography\nENDTOON' } })
    };

    const fetchSpy = vi.fn()
      .mockImplementationOnce(() => Promise.resolve(firstResp))
      .mockImplementationOnce(() => Promise.resolve(secondResp));

    global.fetch = fetchSpy;

    const params = {
      race: 'Orc',
      characterClass: 'Artificer',
      level: 1,
      background: 'Artisan',
      abilityScores: { str: 18, dex: 8, int: 13 },
      characterDetails: { height: "3'10\"", weight: '100 lbs', age: '13' },
      elements: ['appearance', 'biography']
    };

    const result = await LLM.generateBiography(params);

    // Expect integrated causal phrasing in both fields after re-prompt
    expect(/\b(because|due to|after|as a result|caused by|mishap|accident|enchant|enchantment|inferred)\b/i.test(result.appearance)).toBe(true);
    expect(/\b(because|due to|after|as a result|caused by|mishap|accident|enchant|enchantment|inferred)\b/i.test(result.biography)).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
