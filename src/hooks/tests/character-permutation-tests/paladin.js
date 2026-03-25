import { registerCharacterPermutationTests } from '../character-permutation-tests.js';

export function registerPaladinPermutationTests(context) {
  return registerCharacterPermutationTests(context, { classes: ['paladin'] });
}
