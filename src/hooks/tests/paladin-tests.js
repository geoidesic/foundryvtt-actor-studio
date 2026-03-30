import { createCharacterPermutationTestHelpers } from '~/src/hooks/tests/character-permutation-tests.js';

const paladinConfig = {
  identifier: 'paladin',
  displayName: 'Paladin',
  classUuid: 'Compendium.dnd-players-handbook.classes.Item.phbpdnPaladin000',
  raceUuid: 'Compendium.dnd-players-handbook.origins.Item.phbspDwarf000000',
  backgroundUuid: 'Compendium.dnd-players-handbook.origins.Item.phbbgFarmer00000',
  spellProgressionTOON: {
    format: 'TOON-1',
    levels: {
      1: { '2014': { cantrips: 0, spells: 0, maxSpellLevel: 0 }, '2024': { cantrips: 0, spells: 2, maxSpellLevel: 1 } },
      2: { '2014': { cantrips: 0, spells: 'All', maxSpellLevel: 1 }, '2024': { cantrips: 0, spells: 3, maxSpellLevel: 1 } },
      3: { '2014': { cantrips: 0, spells: 'All', maxSpellLevel: 1 }, '2024': { cantrips: 0, spells: 4, maxSpellLevel: 1 } }
    }
  }
};

export function registerPaladinTests(context) {
  const { describe, it, before, after } = context;
  const helpers = createCharacterPermutationTestHelpers(context, paladinConfig);

  describe(paladinConfig.displayName, function () {
    before(helpers.beforeAll);
    after(helpers.afterAll);

    it('should auto-run paladin creation and complete', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runCreationTest();
    });

    it('should open level-up app from paladin actor sheet when milestone leveling is enabled', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runOpenLevelUpAppTest();
    });

    it('should level paladin from 1 to 2', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runLevelTest(2);
    });

    it('should level paladin from 2 to 3', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runLevelTest(3);
    });
  });
}