import { describe, it, expect, vi } from 'vitest';
import { generateBiography, isGenerating } from '~/src/stores/biography';
import { actorInGame } from '~/src/stores/storeDefinitions';
import LLM from '~/src/plugins/llm';

describe('generateBiography actor behavior', () => {
  it('uses provided actor even if it lacks abilities and marks abilityScoresMissing', async () => {
    // Actor passed in lacks system abilities
    const badActor = { id: 'proxy-1', system: {} };

    // actorInGame has full abilities (should NOT be used when actor param is provided)
    const goodActor = {
      id: 'actor-123',
      system: { abilities: { str: { value: 18 }, dex: { value: 8 }, con: { value: 12 }, int: { value: 10 }, wis: { value: 9 }, cha: { value: 11 } }, details: { race: 'Orc', level: 1 } },
      classes: { artificer: { name: 'Artificer' } }
    };

    actorInGame.set(goodActor);

    // Ensure no stale generation state is set from other tests
    isGenerating.set(false);

    const spy = vi.spyOn(LLM, 'generateBiography').mockResolvedValue({ appearance: '', biography: '' });

    await generateBiography(badActor);

    expect(spy).toHaveBeenCalled();
    const params = spy.mock.calls[0][0];
    // Since badActor has no abilities, normalized scores should be zeros and abilityScoresMissing true
    expect(params.abilityScores).toEqual({ str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 });
    expect(params.abilityScoresMissing).toBe(true);

    spy.mockRestore();
  });
});
