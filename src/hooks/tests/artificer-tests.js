import { createCharacterPermutationTestHelpers } from '~/src/hooks/tests/character-permutation-tests.js';

const artificerConfig = {
  identifier: 'artificer',
  displayName: 'Artificer',
  classUuid: 'Compendium.dnd-tashas-cauldron.tcoe-character-options.Item.tcoeArtificer000',
  raceUuid: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000',
  backgroundUuid: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000',
  spellProgressionTOON: {
    format: 'TOON-1',
    levels: {
      1: { '2014': { cantrips: 2, spells: 0, maxSpellLevel: 0 }, '2024': { cantrips: 2, spells: 2, maxSpellLevel: 1 } },
      2: { '2014': { cantrips: 0, spells: 0, maxSpellLevel: 1 }, '2024': { cantrips: 0, spells: 1, maxSpellLevel: 1 } },
      3: { '2014': { cantrips: 0, spells: 0, maxSpellLevel: 1 }, '2024': { cantrips: 0, spells: 1, maxSpellLevel: 1 } }
    }
  }
};

export function registerArtificerTests(context) {
  const { describe, it, before, after } = context;
  const helpers = createCharacterPermutationTestHelpers(context, artificerConfig);

  describe(artificerConfig.displayName, function () {
    before(helpers.beforeAll);
    after(helpers.afterAll);

    it('should auto-run artificer creation and complete', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runCreationTest();
    });

    it('should open level-up app from artificer actor sheet when milestone leveling is enabled', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runOpenLevelUpAppTest();
    });

    it('should level artificer from 1 to 2', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runLevelTest(2);
    });

    it('should level artificer from 2 to 3', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runLevelTest(3);
    });
  });
}