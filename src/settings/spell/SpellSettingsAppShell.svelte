<svelte:options accessors={true} />

<template lang="pug">
TJSApplicationShell(bind:elementRoot="{elementRoot}")
  main.gas-settings-app
    .settings-content
      .setting-group
        h3 {game.i18n.localize('GAS.Setting.Spell.SelectionOptions')}

        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{enableSpellSelection}"
            )
            span {game.i18n.localize('GAS.Setting.EnableSpellSelection.Name')}
          p.hint {game.i18n.localize('GAS.Setting.EnableSpellSelection.Hint')}

        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{enableCustomSpellListFiltering}"
            )
            span {game.i18n.localize('GAS.Setting.EnableCustomSpellListFiltering.Name')}
          p.hint {game.i18n.localize('GAS.Setting.EnableCustomSpellListFiltering.Hint')}

      .setting-group
        h3 {game.i18n.localize('GAS.Setting.Spell.CustomLists')}

        .setting-item
          p.hint {game.i18n.localize('GAS.Setting.CustomSpellLists.Hint')}
          button.manage-lists-button(type="button" on:click="{openSpellListManager}")
            | {game.i18n.localize('GAS.Setting.CustomSpellLists.Label')}

    footer.settings-footer
      button.cancel-button(on:click="{cancelSettings}") Cancel
      button.save-button(on:click="{saveSettings}") Save
</template>

<script>
  import { getContext } from 'svelte';
  import { TJSApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/application';
  import { MODULE_ID } from '~/src/helpers/constants';
  import { safeGetSetting } from '~/src/helpers/Utility';
  import SpellListManagerButton from '../SpellListManagerButton';

  export let elementRoot;

  const { application } = getContext('#external');

  let enableSpellSelection = safeGetSetting(MODULE_ID, 'enableSpellSelection', false);
  let enableCustomSpellListFiltering = safeGetSetting(MODULE_ID, 'enableCustomSpellListFiltering', true);

  async function saveSettings() {
    try {
      await game.settings.set(MODULE_ID, 'enableSpellSelection', enableSpellSelection);
      await game.settings.set(MODULE_ID, 'enableCustomSpellListFiltering', enableCustomSpellListFiltering);

      ui.notifications.info(game.i18n.localize('GAS.Notification.SettingsSaved'));
      application.close();
    } catch (error) {
      console.error('Error saving spell settings:', error);
      ui.notifications.error(game.i18n.localize('GAS.Notification.SettingsSaveFailed'));
    }
  }

  function openSpellListManager() {
    SpellListManagerButton.showManager();
  }

  function cancelSettings() {
    application.close();
  }
</script>

<style lang="sass">
  :global(#gas-spell-settings)
    background-color: rgba(0, 0, 0, 0.9)
    color: white

  :global(#gas-spell-settings .window-content)
    padding: 0
    overflow: hidden

  .gas-settings-app
    display: flex
    flex-direction: column
    height: 100%
    padding: 0
    color: white
    background-color: rgba(0, 0, 0, 0.9)

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

        .manage-lists-button
          background: #2a3f60
          border: 1px solid #4a6ba0
          color: white
          padding: 0.4rem 0.8rem
          border-radius: 3px
          cursor: pointer
          margin-top: 0.5rem

          &:hover
            background: #3a5a8a

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
