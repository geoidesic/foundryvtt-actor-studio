import { createCharacterPermutationTestHelpers } from '~/src/hooks/tests/character-permutation-tests.js';

const bardConfig = {
  identifier: 'bard',
  displayName: 'Bard',
  classUuid: 'Compendium.dnd-players-handbook.classes.Item.phbbrdBard000000',
  raceUuid: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000',
  backgroundUuid: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000',
  spellProgressionTOON: {
    format: 'TOON-1',
    levels: {
      1: { '2014': { cantrips: 2, spells: 4, maxSpellLevel: 1 }, '2024': { cantrips: 2, spells: 4, maxSpellLevel: 1 } },
      2: { '2014': { cantrips: 2, spells: 5, maxSpellLevel: 1 }, '2024': { cantrips: 2, spells: 5, maxSpellLevel: 1 } },
      3: { '2014': { cantrips: 2, spells: 6, maxSpellLevel: 2 }, '2024': { cantrips: 2, spells: 6, maxSpellLevel: 2 } }
    }
  }
};

export function registerBardTests(context) {
  const { describe, it, before, after } = context;
  const helpers = createCharacterPermutationTestHelpers(context, bardConfig);

  describe(bardConfig.displayName, function () {
    before(helpers.beforeAll);
    after(helpers.afterAll);

    it('should auto-run bard creation and complete', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runCreationTest();
    });

    it('should open level-up app from bard actor sheet when milestone leveling is enabled', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runOpenLevelUpAppTest();
    });

    it('should level bard from 1 to 2', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runLevelTest(2);
    });

    it('should level bard from 2 to 3', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runLevelTest(3);
    });
  });
}