import { safeGetSetting } from '~/src/helpers/Utility';

const MODULE_ID = 'foundryvtt-actor-studio';

const TIMEOUT_SETTING_KEYS = {
  perTest: 'testTimeoutPerTest',
  waitShort: 'testTimeoutWaitShort',
  waitMedium: 'testTimeoutWaitMedium',
  waitLong: 'testTimeoutWaitLong',
  uiInteraction: 'testTimeoutUiInteraction',
  uiStateChange: 'testTimeoutUiStateChange',
  spellUiLoad: 'testTimeoutSpellUiLoad',
  spellWorkflow: 'testTimeoutSpellWorkflow',
  appClosure: 'testTimeoutAppClosure',
  appLifecycleComplete: 'testTimeoutAppLifecycleComplete',
  advancementProcessing: 'testTimeoutAdvancementProcessing',
  advancementPostLevel: 'testTimeoutAdvancementPostLevel',
  actorDataUpdate: 'testTimeoutActorDataUpdate',
  pollingInterval: 'testIntervalPolling',
};

const getRequiredTimeoutSetting = (timeoutName) => {
  const settingKey = TIMEOUT_SETTING_KEYS[timeoutName];
  if (!settingKey) {
    throw new Error(`[TEST TIMEOUT] Unknown timeout name '${timeoutName}'`);
  }

  const value = safeGetSetting(MODULE_ID, settingKey);
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    throw new Error(`[TEST TIMEOUT] Missing or invalid setting '${MODULE_ID}.${settingKey}'. Expected a positive number.`);
  }

  return value;
};

const logTimeoutUsage = (timeoutName, timeoutMs, source = 'lookup') => {
  const message = `[TEST TIMEOUT] ${source} '${timeoutName}' -> ${timeoutMs}ms`;
  if (window.GAS?.log?.q) {
    window.GAS.log.q(message);
    return;
  }
  console.info(message);
};

/**
 * Get all test timeout settings from game settings
 * @returns {Object} Object containing all timeout values
 */
export function getTestTimeouts() {
  const cache = {};

  return new Proxy(cache, {
    get(target, prop, receiver) {
      if (typeof prop === 'string' && prop in TIMEOUT_SETTING_KEYS) {
        if (!(prop in target)) {
          target[prop] = getRequiredTimeoutSetting(prop);
        }
      }

      const value = Reflect.get(target, prop, receiver);
      if (typeof prop === 'string' && typeof value === 'number') {
        logTimeoutUsage(prop, value, 'getTestTimeouts access');
      }
      return value;
    }
  });
}

/**
 * Get a specific test timeout by name
 * @param {string} timeoutName - Name of the timeout (perTest, waitShort, waitMedium, waitLong, uiInteraction, uiStateChange, spellUiLoad, spellWorkflow, appClosure, appLifecycleComplete, advancementProcessing, advancementPostLevel, actorDataUpdate, pollingInterval)
 * @returns {number} Timeout value in milliseconds
 */
export function getTestTimeout(timeoutName) {
  const validTimeoutNames = Object.keys(TIMEOUT_SETTING_KEYS);
  if (!validTimeoutNames.includes(timeoutName)) {
    throw new Error(`[TEST TIMEOUT] Invalid timeout name '${timeoutName}'. Valid names: ${validTimeoutNames.join(', ')}`);
  }
  const timeoutMs = getRequiredTimeoutSetting(timeoutName);
  logTimeoutUsage(timeoutName, timeoutMs, 'getTestTimeout');
  return timeoutMs;
}
