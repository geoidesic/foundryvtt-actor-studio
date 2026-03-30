import { createCharacterPermutationTestHelpers } from '~/src/hooks/tests/character-permutation-tests.js';

const clericConfig = {
  identifier: 'cleric',
  displayName: 'Cleric',
  classUuid: 'Compendium.dnd-players-handbook.classes.Item.phbclcCleric0000',
  raceUuid: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000',
  backgroundUuid: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000',
  spellProgressionTOON: {
    format: 'TOON-1',
    levels: {
      1: { '2014': { cantrips: 3, spells: 'All', maxSpellLevel: 1 }, '2024': { cantrips: 3, spells: 4, maxSpellLevel: 1 } },
      2: { '2014': { cantrips: 3, spells: 'All', maxSpellLevel: 1 }, '2024': { cantrips: 3, spells: 5, maxSpellLevel: 1 } },
      3: { '2014': { cantrips: 3, spells: 'All', maxSpellLevel: 2 }, '2024': { cantrips: 3, spells: 6, maxSpellLevel: 2 } }
    }
  }
};

export function registerClericTests(context) {
  const { describe, it, before, after } = context;
  const helpers = createCharacterPermutationTestHelpers(context, clericConfig);

  describe(clericConfig.displayName, function () {
    before(helpers.beforeAll);
    after(helpers.afterAll);

    it('should auto-run cleric creation and complete', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runCreationTest();
    });

    it('should open level-up app from cleric actor sheet when milestone leveling is enabled', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runOpenLevelUpAppTest();
    });

    it('should level cleric from 1 to 2', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runLevelTest(2);
    });

    it('should level cleric from 2 to 3', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runLevelTest(3);
    });
  });
}