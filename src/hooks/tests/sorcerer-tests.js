import { createCharacterPermutationTestHelpers } from '~/src/hooks/tests/character-permutation-tests.js';

const sorcererConfig = {
  identifier: 'sorcerer',
  displayName: 'Sorcerer',
  classUuid: 'Compendium.dnd-players-handbook.classes.Item.phbscrSorcerer00',
  raceUuid: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000',
  backgroundUuid: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000',
  spellProgressionTOON: {
    format: 'TOON-1',
    levels: {
      1: { '2014': { cantrips: 4, spells: 2, maxSpellLevel: 1 }, '2024': { cantrips: 4, spells: 2, maxSpellLevel: 1 } },
      2: { '2014': { cantrips: 0, spells: 1, maxSpellLevel: 1 }, '2024': { cantrips: 0, spells: 1, maxSpellLevel: 1 } },
      3: { '2014': { cantrips: 0, spells: 1, maxSpellLevel: 2 }, '2024': { cantrips: 0, spells: 1, maxSpellLevel: 2 } }
    }
  }
};

export function registerSorcererTests(context) {
  const { describe, it, before, after } = context;
  const helpers = createCharacterPermutationTestHelpers(context, sorcererConfig);

  describe(sorcererConfig.displayName, function () {
    before(helpers.beforeAll);
    after(helpers.afterAll);

    it('should auto-run sorcerer creation and complete', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runCreationTest();
    });

    it('should open level-up app from sorcerer actor sheet when milestone leveling is enabled', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runOpenLevelUpAppTest();
    });

    it('should level sorcerer from 1 to 2', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runLevelTest(2);
    });

    it('should level sorcerer from 2 to 3', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runLevelTest(3);
    });
  });
}