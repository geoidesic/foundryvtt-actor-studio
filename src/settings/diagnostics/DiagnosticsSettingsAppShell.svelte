<svelte:options accessors={true} />

<template lang="pug">
TJSApplicationShell(bind:elementRoot="{elementRoot}")
  main.gas-settings-app
    .settings-content
      .setting-group
        h3 Debug Options
        
        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{debug}"
            )
            span {game.i18n.localize('GAS.Setting.debug.Name')}
          p.hint {game.i18n.localize('GAS.Setting.debug.Hint')}

        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{debugHooks}"
            )
            span {game.i18n.localize('GAS.Setting.debugHooks.Name')}
          p.hint {game.i18n.localize('GAS.Setting.debugHooks.Hint')}

      +if("quenchActive")
        .setting-group
          h3 Test Timeout Configuration (milliseconds)

          .setting-item
            p.setting-label {game.i18n.localize('GAS.Setting.testTimeoutUiInteraction.Name')}
            input(
              type="number"
              placeholder="5000"
              bind:value="{uiInteraction}"
              min="1000"
              step="500"
            )
            p.hint {game.i18n.localize('GAS.Setting.testTimeoutUiInteraction.Hint')}

          .setting-item
            p.setting-label {game.i18n.localize('GAS.Setting.testTimeoutUiStateChange.Name')}
            input(
              type="number"
              placeholder="20000"
              bind:value="{uiStateChange}"
              min="5000"
              step="1000"
            )
            p.hint {game.i18n.localize('GAS.Setting.testTimeoutUiStateChange.Hint')}

          .setting-item
            p.setting-label {game.i18n.localize('GAS.Setting.testTimeoutSpellUiLoad.Name')}
            input(
              type="number"
              placeholder="5000"
              bind:value="{spellUiLoad}"
              min="1000"
              step="500"
            )
            p.hint {game.i18n.localize('GAS.Setting.testTimeoutSpellUiLoad.Hint')}

          .setting-item
            p.setting-label {game.i18n.localize('GAS.Setting.testTimeoutSpellWorkflow.Name')}
            input(
              type="number"
              placeholder="30000"
              bind:value="{spellWorkflow}"
              min="5000"
              step="1000"
            )
            p.hint {game.i18n.localize('GAS.Setting.testTimeoutSpellWorkflow.Hint')}

          .setting-item
            p.setting-label {game.i18n.localize('GAS.Setting.testTimeoutAppClosure.Name')}
            input(
              type="number"
              placeholder="4000"
              bind:value="{appClosure}"
              min="1000"
              step="500"
            )
            p.hint {game.i18n.localize('GAS.Setting.testTimeoutAppClosure.Hint')}

          .setting-item
            p.setting-label {game.i18n.localize('GAS.Setting.testTimeoutAppLifecycleComplete.Name')}
            input(
              type="number"
              placeholder="32000"
              bind:value="{appLifecycleComplete}"
              min="5000"
              step="1000"
            )
            p.hint {game.i18n.localize('GAS.Setting.testTimeoutAppLifecycleComplete.Hint')}

          .setting-item
            p.setting-label {game.i18n.localize('GAS.Setting.testTimeoutAdvancementProcessing.Name')}
            input(
              type="number"
              placeholder="1500"
              bind:value="{advancementProcessing}"
              min="100"
              step="100"
            )
            p.hint {game.i18n.localize('GAS.Setting.testTimeoutAdvancementProcessing.Hint')}

          .setting-item
            p.setting-label {game.i18n.localize('GAS.Setting.testTimeoutAdvancementPostLevel.Name')}
            input(
              type="number"
              placeholder="3000"
              bind:value="{advancementPostLevel}"
              min="500"
              step="100"
            )
            p.hint {game.i18n.localize('GAS.Setting.testTimeoutAdvancementPostLevel.Hint')}

          .setting-item
            p.setting-label {game.i18n.localize('GAS.Setting.testTimeoutActorDataUpdate.Name')}
            input(
              type="number"
              placeholder="50000"
              bind:value="{actorDataUpdate}"
              min="10000"
              step="5000"
            )
            p.hint {game.i18n.localize('GAS.Setting.testTimeoutActorDataUpdate.Hint')}

          .setting-item
            p.setting-label {game.i18n.localize('GAS.Setting.testIntervalPolling.Name')}
            input(
              type="number"
              placeholder="100"
              bind:value="{pollingInterval}"
              min="10"
              step="10"
            )
            p.hint {game.i18n.localize('GAS.Setting.testIntervalPolling.Hint')}

    footer.settings-footer
      button.cancel-button(on:click="{cancelSettings}") Cancel
      button.reset-button(on:click="{resetSettings}") Reset to Defaults
      button.save-button(on:click="{saveSettings}") Save
</template>

<script>
  import { getContext } from 'svelte';
  import { TJSApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/application';
  import { MODULE_ID } from '~/src/helpers/constants';
  import { safeGetSetting } from '~/src/helpers/Utility';

  export let elementRoot;

  const { application } = getContext('#external');

  const TIMEOUT_DEFAULTS = {
    uiInteraction: 5000,
    uiStateChange: 20000,
    spellUiLoad: 5000,
    spellWorkflow: 30000,
    appClosure: 4000,
    appLifecycleComplete: 32000,
    advancementProcessing: 1500,
    advancementPostLevel: 3000,
    actorDataUpdate: 50000,
    pollingInterval: 100
  };

  function readTimeoutSetting(key, fallback) {
    const raw = safeGetSetting(MODULE_ID, key, fallback);
    const numeric = Number(raw);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
  }

  function toPositiveInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  // Load current settings
  const quenchActive = Boolean(game.modules.get('quench')?.active);
  let debug = safeGetSetting(MODULE_ID, 'debug', false);
  let debugHooks = safeGetSetting(MODULE_ID, 'debug.hooks', false);
  let uiInteraction = quenchActive ? readTimeoutSetting('testTimeoutUiInteraction', TIMEOUT_DEFAULTS.uiInteraction) : null;
  let uiStateChange = quenchActive ? readTimeoutSetting('testTimeoutUiStateChange', TIMEOUT_DEFAULTS.uiStateChange) : null;
  let spellUiLoad = quenchActive ? readTimeoutSetting('testTimeoutSpellUiLoad', TIMEOUT_DEFAULTS.spellUiLoad) : null;
  let spellWorkflow = quenchActive ? readTimeoutSetting('testTimeoutSpellWorkflow', TIMEOUT_DEFAULTS.spellWorkflow) : null;
  let appClosure = quenchActive ? readTimeoutSetting('testTimeoutAppClosure', TIMEOUT_DEFAULTS.appClosure) : null;
  let appLifecycleComplete = quenchActive ? readTimeoutSetting('testTimeoutAppLifecycleComplete', TIMEOUT_DEFAULTS.appLifecycleComplete) : null;
  let advancementProcessing = quenchActive ? readTimeoutSetting('testTimeoutAdvancementProcessing', TIMEOUT_DEFAULTS.advancementProcessing) : null;
  let advancementPostLevel = quenchActive ? readTimeoutSetting('testTimeoutAdvancementPostLevel', TIMEOUT_DEFAULTS.advancementPostLevel) : null;
  let actorDataUpdate = quenchActive ? readTimeoutSetting('testTimeoutActorDataUpdate', TIMEOUT_DEFAULTS.actorDataUpdate) : null;
  let pollingInterval = quenchActive ? readTimeoutSetting('testIntervalPolling', TIMEOUT_DEFAULTS.pollingInterval) : null;

  async function saveSettings() {
    try {
      await game.settings.set(MODULE_ID, 'debug', debug);
      await game.settings.set(MODULE_ID, 'debug.hooks', debugHooks);
      if (quenchActive) {
        await game.settings.set(MODULE_ID, 'testTimeoutUiInteraction', toPositiveInt(uiInteraction, TIMEOUT_DEFAULTS.uiInteraction));
        await game.settings.set(MODULE_ID, 'testTimeoutUiStateChange', toPositiveInt(uiStateChange, TIMEOUT_DEFAULTS.uiStateChange));
        await game.settings.set(MODULE_ID, 'testTimeoutSpellUiLoad', toPositiveInt(spellUiLoad, TIMEOUT_DEFAULTS.spellUiLoad));
        await game.settings.set(MODULE_ID, 'testTimeoutSpellWorkflow', toPositiveInt(spellWorkflow, TIMEOUT_DEFAULTS.spellWorkflow));
        await game.settings.set(MODULE_ID, 'testTimeoutAppClosure', toPositiveInt(appClosure, TIMEOUT_DEFAULTS.appClosure));
        await game.settings.set(MODULE_ID, 'testTimeoutAppLifecycleComplete', toPositiveInt(appLifecycleComplete, TIMEOUT_DEFAULTS.appLifecycleComplete));
        await game.settings.set(MODULE_ID, 'testTimeoutAdvancementProcessing', toPositiveInt(advancementProcessing, TIMEOUT_DEFAULTS.advancementProcessing));
        await game.settings.set(MODULE_ID, 'testTimeoutAdvancementPostLevel', toPositiveInt(advancementPostLevel, TIMEOUT_DEFAULTS.advancementPostLevel));
        await game.settings.set(MODULE_ID, 'testTimeoutActorDataUpdate', toPositiveInt(actorDataUpdate, TIMEOUT_DEFAULTS.actorDataUpdate));
        await game.settings.set(MODULE_ID, 'testIntervalPolling', toPositiveInt(pollingInterval, TIMEOUT_DEFAULTS.pollingInterval));
      }

      ui.notifications.info('Diagnostics settings saved successfully');
      application.close();
    } catch (error) {
      console.error('Error saving diagnostics settings:', error);
      ui.notifications.error('Failed to save diagnostics settings');
    }
  }

  function cancelSettings() {
    application.close();
  }

  function resetSettings() {
    debug = false;
    debugHooks = false;
    if (quenchActive) {
      uiInteraction = TIMEOUT_DEFAULTS.uiInteraction;
      uiStateChange = TIMEOUT_DEFAULTS.uiStateChange;
      spellUiLoad = TIMEOUT_DEFAULTS.spellUiLoad;
      spellWorkflow = TIMEOUT_DEFAULTS.spellWorkflow;
      appClosure = TIMEOUT_DEFAULTS.appClosure;
      appLifecycleComplete = TIMEOUT_DEFAULTS.appLifecycleComplete;
      advancementProcessing = TIMEOUT_DEFAULTS.advancementProcessing;
      advancementPostLevel = TIMEOUT_DEFAULTS.advancementPostLevel;
      actorDataUpdate = TIMEOUT_DEFAULTS.actorDataUpdate;
      pollingInterval = TIMEOUT_DEFAULTS.pollingInterval;
    }
  }
</script>

<style lang="sass">
  :global(#gas-diagnostics-settings)
    background-color: rgba(0, 0, 0, 0.9)
    color: white

  :global(#gas-diagnostics-settings .window-content)
    padding: 0
    overflow: hidden

  :global(#gas-diagnostics-settings .window-header)
    color: white

  :global(#gas-diagnostics-settings .window-header .window-title)
    color: white

  :global(#gas-diagnostics-settings .window-header a)
    color: white

  .gas-settings-app
    display: flex
    flex-direction: column
    height: 100%
    padding: 0
    color: white
    background-color: rgba(0, 0, 0, 0.9)

  .settings-header
    padding: 1rem
    border-bottom: 1px solid #666
    background: #222

    h2
      margin: 0
      font-size: 1.3rem
      color: white

  .settings-content
    flex: 1
    overflow-y: auto
    padding: 1rem

    .setting-group
      margin-bottom: 1.5rem

      h3
        margin: 0 0 0.75rem 0
        font-size: 1.1rem
        color: white
        border-bottom: 1px solid #444
        padding-bottom: 0.25rem

      .setting-item
        margin-bottom: 0.75rem
        padding: 0.75rem
        background: rgba(255, 255, 255, 0.05)
        border: 1px solid #444
        border-radius: 4px

        label
          display: flex
          align-items: center
          gap: 0.5rem
          font-weight: 500
          margin-bottom: 0.25rem
          color: white

          input[type="checkbox"]
            width: 1.2rem
            height: 1.2rem
            cursor: pointer

        p.hint
          margin: 0.25rem 0 0 0
          font-size: 0.85rem
          color: #aaa
          font-style: italic

        input[type="number"]
          width: 100%
          color: white
          background: rgba(255, 255, 255, 0.06)
          border: 1px solid #555

          &::placeholder
            color: #7d7d7d
            opacity: 1

          &:focus
            outline: 1px solid #777
            border-color: #777

  .settings-footer
    position: sticky
    bottom: 0
    z-index: 2
    display: flex
    justify-content: flex-end
    gap: 0.5rem
    padding: 0.75rem 1rem
    border-top: 1px solid #666
    background: #222
    pointer-events: none

    button
      background: #444
      border: 1px solid #666
      color: white
      padding: 0.4rem 1rem
      border-radius: 3px
      cursor: pointer
      margin: 0
      pointer-events: auto
      font-family: inherit

      &:hover
        background: #555

      &.save-button
        min-width: 6rem
        background: #1a4d1a
        border-color: #2a6d2a

        &:hover
          background: #2a6d2a
</style>
