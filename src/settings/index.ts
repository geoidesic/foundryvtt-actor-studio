import CompendiumSourcesButton from './CompendiumSourcesButton';
import DonationTrackerSettingsButton from './DonationTrackerSettingsButton';
import { MODULE_ID, DEFAULT_SOURCES } from '../helpers/constants';

// Import domain-specific settings modules
import { registerAbilityScoresSettings } from './abilityScores/registerAbilityScoresSettings';
import { registerEquipmentSettings } from './equipment/registerEquipmentSettings';
import { registerProgressionSettings } from './progression/registerProgressionSettings';
import { registerUISettings } from './ui/registerUISettings';
import { registerAccessControlSettings } from './accessControl/registerAccessControlSettings';
import { registerCompendiumDisplaySettings } from './compendiumDisplay/registerCompendiumDisplaySettings';
import { registerDiagnosticsSettings } from './diagnostics/registerDiagnosticsSettings';

// settings not shown on the Module Settings - not modifiable by users
export const enum PrivateSettingKeys {
  LAST_MIGRATION = 'lastMigration',
  // LEVEL_UP_IN_PROGRESS is now a Svelte store in src/stores/index.js
}

export function registerSettings(app: Game): void {
  window.GAS.log.d("Building module settings");

  Handlebars.registerHelper('checkedIf', function (condition) {
    return condition ? 'checked' : '';
  });

  // Private settings
  lastMigration();
  
  // Register domain-specific settings modules (each creates its own menu)
  registerAbilityScoresSettings();
  registerEquipmentSettings();
  registerProgressionSettings();
  registerUISettings();
  registerAccessControlSettings();
  registerCompendiumDisplaySettings();
  registerDiagnosticsSettings();
  
  // Legacy settings that remain in main config
  sourcesConfiguration();
  donationTracker();
  usageTracking();
  dontShowWelcome();
}

// PRIVATE SETTINGS

function lastMigration() {
  game.settings.register(MODULE_ID, PrivateSettingKeys.LAST_MIGRATION, {
    scope: 'world',
    config: false,
    default: 0,
    type: Number,
  });
}

// NOTE: levelUpInProgress is now a Svelte store in src/stores/index.js
// This allows players to level up without requiring 'Modify Configuration Settings' permission
// The store is ephemeral and won't cause data corruption like a world setting could

function sourcesConfiguration() {
  game.settings.register(MODULE_ID, 'compendiumSources', {
    scope: 'world',
    config: false,
    type: Object,
    default: DEFAULT_SOURCES,
    onChange: () => {
      Dialog.confirm({
        title: game.i18n.localize('GAS.Dialog.ReloadRequiredTitle'),
        content: `<p>${game.i18n.localize('GAS.Dialog.ReloadRequiredContent')}</p>`,
        yes: () => window.location.reload(),
        no: () => {},
        defaultYes: true
      });
    }
  });
  // Define a settings submenu which handles advanced configuration needs
  game.settings.registerMenu(MODULE_ID, 'compendiumSources', {
    name: game.i18n.localize('GAS.Setting.Sources.Name'),
    hint: game.i18n.localize('GAS.Setting.Sources.Hint'),
    label: game.i18n.localize('GAS.Setting.Sources.Label'),
    icon: 'fas fa-atlas',
    type: CompendiumSourcesButton,
    restricted: true,
  });
}

function donationTracker() {
  if (!game.modules.get('donation-tracker')?.active) return;

  Hooks.on('actor-studio-donation-tracker:settings', () => {
    if (game.user.isGM) { DonationTrackerSettingsButton.showSettings(); }
  });

  game.settings.registerMenu(MODULE_ID, 'DonationTracker', {
    name: game.i18n.localize('GAS.Setting.DonationTracker.Name'),
    hint: game.i18n.localize('GAS.Setting.DonationTracker.Hint'),
    label: game.i18n.localize('GAS.Setting.DonationTracker.Label'),
    icon: 'fas fa-coins',
    type: DonationTrackerSettingsButton,
    restricted: true,
    onChange: () => {
      Hooks.call('actor-studio-donation-tracker:settings');
    }
  });
}

function dontShowWelcome() {
  game.settings.register(MODULE_ID, 'dontShowWelcome', {
    name: game.i18n.localize('GAS.Setting.DontShowWelcome.Name'),
    hint: game.i18n.localize('GAS.Setting.DontShowWelcome.Hint'),
    scope: 'user',
    config: true,
    default: false,
    type: Boolean,
  });
}

function usageTracking() {
  game.settings.register(MODULE_ID, 'usage-tracking', {
    name: 'Usage Tracking',
    hint: 'Allow Actor Studio to collect anonymous usage data to help improve the module. No personal information is collected.',
    scope: 'user',
    config: true,
    type: Boolean,
    default: true,
    onChange: (value) => {
      if (!value) {
        Dialog.confirm({
          title: 'Disable Usage Tracking?',
          content: `<p>Disabling usage tracking means we won't know which languages or features are most important to our users. This anonymous data helps us improve Actor Studio for everyone. Are you sure you want to disable it?</p>`,
          yes: () => {
            if (window.GASUsageTracker) window.GASUsageTracker.consentGranted = false;
          },
          no: () => {
            // Re-enable the setting if user cancels
            game.settings.set(MODULE_ID, 'usage-tracking', true);
          },
          defaultYes: false
        });
      } else {
        if (window.GASUsageTracker) {
          window.GASUsageTracker.consentGranted = true;
          if (window.GASUsageTracker.offlineEvents.length > 0) {
            window.GASUsageTracker.syncOfflineEvents();
          }
        }
      }
    }
  });
}
