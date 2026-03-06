<svelte:options accessors={true} />

<template lang="pug">
TJSApplicationShell(bind:elementRoot="{elementRoot}")
  main.gas-settings-app
    .settings-content
      .setting-group
        h3 Display Options
        
        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{filterPackSourcesAppropriatelyByName}"
            )
            span {game.i18n.localize('GAS.Setting.FilterPackSourcesAppropriatelyByName.Name')}
          p.hint {game.i18n.localize('GAS.Setting.FilterPackSourcesAppropriatelyByName.Hint')}

        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{showPackLabelInSelect}"
            )
            span {game.i18n.localize('GAS.Setting.ShowPackLabelInSelect.Name')}
          p.hint {game.i18n.localize('GAS.Setting.ShowPackLabelInSelect.Hint')}

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
  let filterPackSourcesAppropriatelyByName = safeGetSetting(MODULE_ID, 'filterPackSourcesAppropriatelyByName', false);
  let showPackLabelInSelect = safeGetSetting(MODULE_ID, 'showPackLabelInSelect', true);

  async function saveSettings() {
    try {
      await game.settings.set(MODULE_ID, 'filterPackSourcesAppropriatelyByName', filterPackSourcesAppropriatelyByName);
      await game.settings.set(MODULE_ID, 'showPackLabelInSelect', showPackLabelInSelect);

      ui.notifications.info('Compendium display settings saved successfully');
      application.close();
    } catch (error) {
      console.error('Error saving compendium display settings:', error);
      ui.notifications.error('Failed to save compendium display settings');
    }
  }

  function cancelSettings() {
    application.close();
  }
</script>

<style lang="sass">
  :global(#gas-compendium-display-settings)
    background-color: rgba(0, 0, 0, 0.9)
    color: white

  :global(#gas-compendium-display-settings .window-content)
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
