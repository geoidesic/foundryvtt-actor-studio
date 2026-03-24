import { registerCharacterPermutationTests } from '../character-permutation-tests.js';

export function registerFighterPermutationTests(context) {
  return registerCharacterPermutationTests(context, { classes: ['fighter'] });
}
