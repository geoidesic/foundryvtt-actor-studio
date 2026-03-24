import { registerCharacterPermutationTests } from '../character-permutation-tests.js';

export function registerRangerPermutationTests(context) {
  return registerCharacterPermutationTests(context, { classes: ['ranger'] });
}
