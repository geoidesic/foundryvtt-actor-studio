<svelte:options accessors={true} />

<template lang="pug">
TJSApplicationShell(bind:elementRoot="{elementRoot}")
  main.gas-settings-app
    .settings-content
      .setting-group
        h3 Starting Gold
        
        .setting-item
          label
            span {game.i18n.localize('GAS.Setting.defaultGoldDice.Name')}
            input(
              type="text"
              bind:value="{defaultGoldDice}"
              class="gold-dice-input"
            )
          p.hint {game.i18n.localize('GAS.Setting.defaultGoldDice.Hint')}

      .setting-group
        h3 Selection Options
        
        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{enableEquipmentSelection}"
            )
            span {game.i18n.localize('GAS.Setting.EnableEquipmentSelection.Name')}
          p.hint {game.i18n.localize('GAS.Setting.EnableEquipmentSelection.Hint')}

        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{enableEquipmentPurchase}"
            )
            span {game.i18n.localize('GAS.Setting.EnableEquipmentPurchase.Name')}
          p.hint {game.i18n.localize('GAS.Setting.EnableEquipmentPurchase.Hint')}

        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{enableSpellSelection}"
            )
            span {game.i18n.localize('GAS.Setting.EnableSpellSelection.Name')}
          p.hint {game.i18n.localize('GAS.Setting.EnableSpellSelection.Hint')}

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
  let defaultGoldDice = safeGetSetting(MODULE_ID, 'defaultGoldDice', '5d4 * 10');
  let enableEquipmentSelection = safeGetSetting(MODULE_ID, 'enableEquipmentSelection', false);
  let enableEquipmentPurchase = safeGetSetting(MODULE_ID, 'enableEquipmentPurchase', false);
  let enableSpellSelection = safeGetSetting(MODULE_ID, 'enableSpellSelection', false);

  async function saveSettings() {
    try {
      await game.settings.set(MODULE_ID, 'defaultGoldDice', defaultGoldDice);
      await game.settings.set(MODULE_ID, 'enableEquipmentSelection', enableEquipmentSelection);
      await game.settings.set(MODULE_ID, 'enableEquipmentPurchase', enableEquipmentPurchase);
      await game.settings.set(MODULE_ID, 'enableSpellSelection', enableSpellSelection);

      ui.notifications.info('Equipment settings saved successfully');
      
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
      console.error('Error saving equipment settings:', error);
      ui.notifications.error('Failed to save equipment settings');
    }
  }

  function cancelSettings() {
    application.close();
  }
</script>

<style lang="sass">
  :global(#gas-equipment-settings)
    background-color: rgba(0, 0, 0, 0.9)
    color: white

  :global(#gas-equipment-settings .window-content)
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

            &:disabled
              opacity: 0.5
              cursor: not-allowed

          input[type="text"]
            flex: 1
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
