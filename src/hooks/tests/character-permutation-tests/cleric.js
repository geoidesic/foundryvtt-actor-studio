import { registerCharacterPermutationTests } from '../character-permutation-tests.js';

export function registerClericPermutationTests(context) {
  return registerCharacterPermutationTests(context, { classes: ['cleric'] });
}
