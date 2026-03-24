import { safeGetSetting } from '~/src/helpers/Utility';

const MODULE_ID = 'foundryvtt-actor-studio';

/**
 * Get all test timeout settings from game settings
 * @returns {Object} Object containing all timeout values
 */
export function getTestTimeouts() {
  return {
    perTest: safeGetSetting(MODULE_ID, 'testTimeoutPerTest', 50000),
    actorStudioClosed: safeGetSetting(MODULE_ID, 'testTimeoutActorStudioClosed', 4000),
    spellsTabVisible: safeGetSetting(MODULE_ID, 'testTimeoutSpellsTabVisible', 10000),
    generalCondition: safeGetSetting(MODULE_ID, 'testTimeoutGeneralCondition', 10000),
    pollingInterval: safeGetSetting(MODULE_ID, 'testIntervalPolling', 100),
  };
}

/**
 * Get a specific test timeout by name
 * @param {string} timeoutName - Name of the timeout (perTest, actorStudioClosed, spellsTabVisible, generalCondition, pollingInterval)
 * @returns {number} Timeout value in milliseconds
 */
export function getTestTimeout(timeoutName) {
  const timeouts = getTestTimeouts();
  return timeouts[timeoutName] ?? 20000;
}
