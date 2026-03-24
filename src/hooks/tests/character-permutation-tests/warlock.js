import { registerCharacterPermutationTests } from '../character-permutation-tests.js';

export function registerWarlockPermutationTests(context) {
  return registerCharacterPermutationTests(context, { classes: ['warlock'] });
}
