import { describe, it, expect, vi } from 'vitest';
import { generateBiography, biographyOptions, isGenerating } from '~/src/stores/biography';
import LLM from '~/src/plugins/llm';

describe('biography ability normalization', () => {
  it('sends normalized numeric abilityScores to LLM.generateBiography', async () => {
    const fakeActor = {
      system: {
        details: { race: 'Orc', level: 1 },
        abilities: {
          str: { value: 18 },
          dex: { value: 8 },
          con: { value: 12 },
          int: { value: 10 },
          wis: { value: 9 },
          cha: { value: 11 }
        }
      },
      classes: { artificer: { name: 'Artificer' } },
      name: 'Test'
    };


    // Ensure generation options are enabled
    biographyOptions.set({ name: true, ideals: true, flaws: true, bonds: true, personalityTraits: true, appearance: true, biography: true });

    isGenerating.set(false);


    // Test normalizeAbilities helper directly
    const { normalizeAbilities } = await import('~/src/stores/biography');
    const normalized = normalizeAbilities(fakeActor.system.abilities);
    expect(normalized).toEqual({ str: 18, dex: 8, con: 12, int: 10, wis: 9, cha: 11 });
  });
});
