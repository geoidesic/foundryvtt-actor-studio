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
            p.setting-label {game.i18n.localize('GAS.Setting.testTimeoutPerTest.Name')}
            input(
              type="number"
              placeholder="120000"
              bind:value="{testTimeoutPerTest}"
              min="5000"
              step="1000"
            )
            p.hint {game.i18n.localize('GAS.Setting.testTimeoutPerTest.Hint')}

          .setting-item
            p.setting-label {game.i18n.localize('GAS.Setting.testTimeoutActorStudioClosed.Name')}
            input(
              type="number"
              placeholder="5000"
              bind:value="{testTimeoutActorStudioClosed}"
              min="1000"
              step="500"
            )
            p.hint {game.i18n.localize('GAS.Setting.testTimeoutActorStudioClosed.Hint')}

          .setting-item
            p.setting-label {game.i18n.localize('GAS.Setting.testTimeoutSpellsTabVisible.Name')}
            input(
              type="number"
              placeholder="25000"
              bind:value="{testTimeoutSpellsTabVisible}"
              min="5000"
              step="1000"
            )
            p.hint {game.i18n.localize('GAS.Setting.testTimeoutSpellsTabVisible.Hint')}

          .setting-item
            p.setting-label {game.i18n.localize('GAS.Setting.testTimeoutGeneralCondition.Name')}
            input(
              type="number"
              placeholder="20000"
              bind:value="{testTimeoutGeneralCondition}"
              min="5000"
              step="1000"
            )
            p.hint {game.i18n.localize('GAS.Setting.testTimeoutGeneralCondition.Hint')}

          .setting-item
            p.setting-label {game.i18n.localize('GAS.Setting.testIntervalPolling.Name')}
            input(
              type="number"
              placeholder="100"
              bind:value="{testIntervalPolling}"
              min="10"
              step="10"
            )
            p.hint {game.i18n.localize('GAS.Setting.testIntervalPolling.Hint')}

    footer.settings-footer
      button.cancel-button(on:click="{cancelSettings}") Cancel
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
  let testTimeoutPerTest = quenchActive ? safeGetSetting(MODULE_ID, 'testTimeoutPerTest', 120000) : 120000;
  let testTimeoutActorStudioClosed = quenchActive ? safeGetSetting(MODULE_ID, 'testTimeoutActorStudioClosed', 5000) : 5000;
  let testTimeoutSpellsTabVisible = quenchActive ? safeGetSetting(MODULE_ID, 'testTimeoutSpellsTabVisible', 25000) : 25000;
  let testTimeoutGeneralCondition = quenchActive ? safeGetSetting(MODULE_ID, 'testTimeoutGeneralCondition', 20000) : 20000;
  let testIntervalPolling = quenchActive ? safeGetSetting(MODULE_ID, 'testIntervalPolling', 100) : 100;

  async function saveSettings() {
    try {
      await game.settings.set(MODULE_ID, 'debug', debug);
      await game.settings.set(MODULE_ID, 'debug.hooks', debugHooks);
      if (quenchActive) {
        await game.settings.set(MODULE_ID, 'testTimeoutPerTest', parseInt(testTimeoutPerTest, 10));
        await game.settings.set(MODULE_ID, 'testTimeoutActorStudioClosed', parseInt(testTimeoutActorStudioClosed, 10));
        await game.settings.set(MODULE_ID, 'testTimeoutSpellsTabVisible', parseInt(testTimeoutSpellsTabVisible, 10));
        await game.settings.set(MODULE_ID, 'testTimeoutGeneralCondition', parseInt(testTimeoutGeneralCondition, 10));
        await game.settings.set(MODULE_ID, 'testIntervalPolling', parseInt(testIntervalPolling, 10));
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
