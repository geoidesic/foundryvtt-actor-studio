import { createCharacterPermutationTestHelpers } from '~/src/hooks/tests/character-permutation-tests.js';

const fighterConfig = {
  identifier: 'fighter',
  displayName: 'Fighter',
  classUuid: 'Compendium.dnd-players-handbook.classes.Item.phbftrFighter000',
  raceUuid: 'Compendium.dnd-players-handbook.origins.Item.phbspOrc00000000',
  backgroundUuid: 'Compendium.dnd-players-handbook.origins.Item.phbbgArtisan0000',
  shouldExpectSpellsForLevel: () => false
};

export function registerFighterTests(context) {
  const { describe, it, before, after } = context;
  const helpers = createCharacterPermutationTestHelpers(context, fighterConfig);

  describe(fighterConfig.displayName, function () {
    before(helpers.beforeAll);
    after(helpers.afterAll);

    it('should auto-run fighter creation and complete', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runCreationTest();
    });

    it('should open level-up app from fighter actor sheet when milestone leveling is enabled', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runOpenLevelUpAppTest();
    });

    it('should level fighter from 1 to 2', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runLevelTest(2);
    });

    it('should level fighter from 2 to 3', async function () {
      this.timeout(helpers.TEST_TIMEOUTS.perTest);
      await helpers.runLevelTest(3);
    });
  });
}