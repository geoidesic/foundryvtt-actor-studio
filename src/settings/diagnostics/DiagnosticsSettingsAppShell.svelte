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
              placeholder="10000"
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
              placeholder="10000"
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

  // Load current settings
  const quenchActive = Boolean(game.modules.get('quench')?.active);
  let debug = safeGetSetting(MODULE_ID, 'debug', false);
  let debugHooks = safeGetSetting(MODULE_ID, 'debug.hooks', false);
  let uiInteraction = quenchActive ? safeGetSetting(MODULE_ID, 'testTimeoutUiInteraction') : null;
  let uiStateChange = quenchActive ? safeGetSetting(MODULE_ID, 'testTimeoutUiStateChange') : null;
  let spellUiLoad = quenchActive ? safeGetSetting(MODULE_ID, 'testTimeoutSpellUiLoad') : null;
  let spellWorkflow = quenchActive ? safeGetSetting(MODULE_ID, 'testTimeoutSpellWorkflow') : null;
  let appClosure = quenchActive ? safeGetSetting(MODULE_ID, 'testTimeoutAppClosure') : null;
  let appLifecycleComplete = quenchActive ? safeGetSetting(MODULE_ID, 'testTimeoutAppLifecycleComplete') : null;
  let advancementProcessing = quenchActive ? safeGetSetting(MODULE_ID, 'testTimeoutAdvancementProcessing') : null;
  let advancementPostLevel = quenchActive ? safeGetSetting(MODULE_ID, 'testTimeoutAdvancementPostLevel') : null;
  let actorDataUpdate = quenchActive ? safeGetSetting(MODULE_ID, 'testTimeoutActorDataUpdate') : null;
  let pollingInterval = quenchActive ? safeGetSetting(MODULE_ID, 'testIntervalPolling') : null;

  async function saveSettings() {
    try {
      await game.settings.set(MODULE_ID, 'debug', debug);
      await game.settings.set(MODULE_ID, 'debug.hooks', debugHooks);
      if (quenchActive) {
        await game.settings.set(MODULE_ID, 'testTimeoutUiInteraction', parseInt(uiInteraction, 10));
        await game.settings.set(MODULE_ID, 'testTimeoutUiStateChange', parseInt(uiStateChange, 10));
        await game.settings.set(MODULE_ID, 'testTimeoutSpellUiLoad', parseInt(spellUiLoad, 10));
        await game.settings.set(MODULE_ID, 'testTimeoutSpellWorkflow', parseInt(spellWorkflow, 10));
        await game.settings.set(MODULE_ID, 'testTimeoutAppClosure', parseInt(appClosure, 10));
        await game.settings.set(MODULE_ID, 'testTimeoutAppLifecycleComplete', parseInt(appLifecycleComplete, 10));
        await game.settings.set(MODULE_ID, 'testTimeoutAdvancementProcessing', parseInt(advancementProcessing, 10));
        await game.settings.set(MODULE_ID, 'testTimeoutAdvancementPostLevel', parseInt(advancementPostLevel, 10));
        await game.settings.set(MODULE_ID, 'testTimeoutActorDataUpdate', parseInt(actorDataUpdate, 10));
        await game.settings.set(MODULE_ID, 'testIntervalPolling', parseInt(pollingInterval, 10));
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
      uiInteraction = 5000;
      uiStateChange = 20000;
      spellUiLoad = 5000;
      spellWorkflow = 30000;
      appClosure = 4000;
      appLifecycleComplete = 32000;
      advancementProcessing = 1500;
      advancementPostLevel = 3000;
      actorDataUpdate = 50000;
      pollingInterval = 100;
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
