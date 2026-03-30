import { createCharacterPermutationTestHelpers } from '~/src/hooks/tests/character-permutation-tests.js';

const barbarianConfig = {
  identifier: 'barbarian',
  displayName: 'Barbarian',
  classUuid: 'Compendium.dnd-players-handbook.classes.Item.phbbrbBarbarian0',
  raceUuid: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000',
  backgroundUuid: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000',
  spellProgressionTOON: {
    format: 'TOON-1',
    levels: {
      1: { '2014': { cantrips: 0, spells: 0, maxSpellLevel: 0 }, '2024': { cantrips: 0, spells: 0, maxSpellLevel: 0 } },
      2: { '2014': { cantrips: 0, spells: 0, maxSpellLevel: 0 }, '2024': { cantrips: 0, spells: 0, maxSpellLevel: 0 } },
      3: { '2014': { cantrips: 0, spells: 0, maxSpellLevel: 0 }, '2024': { cantrips: 0, spells: 0, maxSpellLevel: 0 } }
    }
  }
};

export function registerBarbarianTests(context) {
  const { describe, it, before, after } = context;
  const helpers = createCharacterPermutationTestHelpers(context, barbarianConfig);

  describe(barbarianConfig.displayName, function () {
    before(helpers.beforeAll);
    after(helpers.afterAll);

    it('should auto-run barbarian creation and complete', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runCreationTest();
    });

    it('should open level-up app from barbarian actor sheet when milestone leveling is enabled', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runOpenLevelUpAppTest();
    });

    it('should level barbarian from 1 to 2', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runLevelTest(2);
    });

    it('should level barbarian from 2 to 3', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runLevelTest(3);
    });
  });
}