<svelte:options accessors={true} />

<template lang="pug">
TJSApplicationShell(bind:elementRoot="{elementRoot}")
  main.gas-settings-app
    .settings-content
      .setting-group
        h3 Level Up Options
        
        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{enableLevelUp}"
            )
            span {game.i18n.localize('GAS.Setting.EnableLevelUp.Name')}
          p.hint {game.i18n.localize('GAS.Setting.EnableLevelUp.Hint')}

        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{milestoneLeveling}"
            )
            span {game.i18n.localize('GAS.Setting.milestoneLeveling.Name')}
          p.hint {game.i18n.localize('GAS.Setting.milestoneLeveling.Hint')}

        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{forceDnd5eLevelUpAutomation}"
            )
            span {game.i18n.localize('GAS.Setting.forceDnd5eLevelUpAutomation.Name')}
          p.hint {game.i18n.localize('GAS.Setting.forceDnd5eLevelUpAutomation.Hint')}

        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{showLevelPreviewDropdown}"
            )
            span {game.i18n.localize('GAS.Setting.ShowLevelPreviewDropdown.Name')}
          p.hint {game.i18n.localize('GAS.Setting.ShowLevelPreviewDropdown.Hint')}

      .setting-group
        h3 Advancement Options
        
        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{disableAdvancementCapture}"
            )
            span {game.i18n.localize('GAS.Setting.disableAdvancementCapture.Name')}
          p.hint {game.i18n.localize('GAS.Setting.disableAdvancementCapture.Hint')}

        .setting-item
          label
            span {game.i18n.localize('GAS.Setting.AdvancementCaptureTimerThreshold.Name')}
            input(
              type="number"
              bind:value="{advancementCaptureTimerThreshold}"
              min="0"
              max="5000"
              step="100"
              class="threshold-input"
            )
          p.hint {game.i18n.localize('GAS.Setting.AdvancementCaptureTimerThreshold.Hint')}

        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{enableCustomFeatSelector}"
            )
            span Enable Custom Feat Selector
          p.hint Replace the default dnd5e compendium browser with a custom feat selector modal for ItemChoice feat advancements.

    footer.settings-footer
      button.cancel-button(on:click="{cancelSettings}") Cancel
      button.save-button(on:click="{saveSettings}") Save
</template>

<script>
  import { getContext } from 'svelte';
  import { TJSApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/application';
  import { TJSDialog } from '@typhonjs-fvtt/runtime/svelte/application';
  import { MODULE_ID } from '~/src/helpers/constants';
  import { safeGetSetting } from '~/src/helpers/Utility';

  export let elementRoot;

  const { application } = getContext('#external');

  // Load current settings
  let enableLevelUp = safeGetSetting(MODULE_ID, 'enableLevelUp', true);
  let milestoneLeveling = safeGetSetting(MODULE_ID, 'milestoneLeveling', false);
  let forceDnd5eLevelUpAutomation = safeGetSetting(MODULE_ID, 'forceDnd5eLevelUpAutomation', true);
  let disableAdvancementCapture = safeGetSetting(MODULE_ID, 'disableAdvancementCapture', false);
  let advancementCaptureTimerThreshold = safeGetSetting(MODULE_ID, 'advancementCaptureTimerThreshold', 300);
  let enableCustomFeatSelector = safeGetSetting(MODULE_ID, 'enableCustomFeatSelector', false);
  let showLevelPreviewDropdown = safeGetSetting(MODULE_ID, 'showLevelPreviewDropdown', false);

  async function saveSettings() {
    try {
      await game.settings.set(MODULE_ID, 'enableLevelUp', enableLevelUp);
      await game.settings.set(MODULE_ID, 'milestoneLeveling', milestoneLeveling);
      await game.settings.set(MODULE_ID, 'forceDnd5eLevelUpAutomation', forceDnd5eLevelUpAutomation);
      await game.settings.set(MODULE_ID, 'disableAdvancementCapture', disableAdvancementCapture);
      await game.settings.set(MODULE_ID, 'advancementCaptureTimerThreshold', advancementCaptureTimerThreshold);
      await game.settings.set(MODULE_ID, 'enableCustomFeatSelector', enableCustomFeatSelector);
      await game.settings.set(MODULE_ID, 'showLevelPreviewDropdown', showLevelPreviewDropdown);

      ui.notifications.info('Progression settings saved successfully');
      
      const result = await TJSDialog.confirm({
        title: game.i18n.localize('GAS.Dialog.ReloadRequiredTitle'),
        content: `<p>${game.i18n.localize('GAS.Dialog.ReloadRequiredContent')}</p>`,
        defaultYes: true
      });

      if (result) {
        window.location.reload();
      } else {
        application.close();
      }
    } catch (error) {
      console.error('Error saving progression settings:', error);
      ui.notifications.error('Failed to save progression settings');
    }
  }

  function cancelSettings() {
    application.close();
  }
</script>

<style lang="sass">
  :global(#gas-progression-settings)
    background-color: rgba(0, 0, 0, 0.9)
    color: white

  :global(#gas-progression-settings .window-content)
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

          input[type="number"]
            max-width: 120px
            padding: 0.25rem 0.5rem
            border: 1px solid #666
            border-radius: 3px
            background: #333
            color: white
            font-family: inherit

            &:focus
              outline: 2px solid #4a9eff
              outline-offset: 1px

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
