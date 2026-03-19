<svelte:options accessors={true} />

<template lang="pug">
TJSApplicationShell(bind:elementRoot="{elementRoot}")
  main.gas-settings-app
    .settings-header
      h2 UI & Window Configuration

    .settings-content
      .setting-group
        h3 Window Dimensions
        
        .setting-item
          label
            span {game.i18n.localize('GAS.Setting.WindowX.Name')}
            input(
              type="number"
              bind:value="{windowX}"
              min="300"
              max="2000"
              step="10"
              class="dimension-input"
            )
          p.hint {game.i18n.localize('GAS.Setting.WindowX.Hint')}

        .setting-item
          label
            span {game.i18n.localize('GAS.Setting.WindowY.Name')}
            input(
              type="number"
              bind:value="{windowY}"
              min="300"
              max="2000"
              step="10"
              class="dimension-input"
            )
          p.hint {game.i18n.localize('GAS.Setting.WindowY.Hint')}

      .setting-group
        h3 Display Options
        
        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{showButtonInSideBar}"
            )
            span {game.i18n.localize('GAS.Setting.showButtonInSideBar.Name')}
          p.hint {game.i18n.localize('GAS.Setting.showButtonInSideBar.Hint')}

        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{experimentalCharacterNameStyling}"
            )
            span {game.i18n.localize('GAS.Setting.ExperimentalCharacterNameStyling.Name')}
          p.hint {game.i18n.localize('GAS.Setting.ExperimentalCharacterNameStyling.Hint')}

        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{hideAdvancementList}"
            )
            span {game.i18n.localize('GAS.Setting.HideAdvancementList.Name')}
          p.hint {game.i18n.localize('GAS.Setting.HideAdvancementList.Hint')}

      .setting-group
        h3 Illuminated Description Options
        
        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{illuminatedDescription}"
            )
            span {game.i18n.localize('GAS.Setting.illuminatedDescription.Name')}
          p.hint {game.i18n.localize('GAS.Setting.illuminatedDescription.Hint')}

        .setting-item
          label
            span {game.i18n.localize('GAS.Setting.illuminatedWidth.Name')}
            input(
              type="text"
              bind:value="{illuminatedWidth}"
              class="illuminated-input"
            )
          p.hint {game.i18n.localize('GAS.Setting.illuminatedWidth.Hint')}

        .setting-item
          label
            span {game.i18n.localize('GAS.Setting.illuminatedHeight.Name')}
            input(
              type="text"
              bind:value="{illuminatedHeight}"
              class="illuminated-input"
            )
          p.hint {game.i18n.localize('GAS.Setting.illuminatedHeight.Hint')}

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
  let windowX = safeGetSetting(MODULE_ID, 'windowX', 720);
  let windowY = safeGetSetting(MODULE_ID, 'windowY', 800);
  let showButtonInSideBar = safeGetSetting(MODULE_ID, 'showButtonInSideBar', true);
  let experimentalCharacterNameStyling = safeGetSetting(MODULE_ID, 'experimentalCharacterNameStyling', false);
  let illuminatedDescription = safeGetSetting(MODULE_ID, 'illuminatedDescription', true);
  let illuminatedWidth = safeGetSetting(MODULE_ID, 'illuminatedWidth', '100');
  let illuminatedHeight = safeGetSetting(MODULE_ID, 'illuminatedHeight', '100');
  let hideAdvancementList = safeGetSetting(MODULE_ID, 'hideAdvancementList', false);

  async function saveSettings() {
    try {
      await game.settings.set(MODULE_ID, 'windowX', windowX);
      await game.settings.set(MODULE_ID, 'windowY', windowY);
      await game.settings.set(MODULE_ID, 'showButtonInSideBar', showButtonInSideBar);
      await game.settings.set(MODULE_ID, 'experimentalCharacterNameStyling', experimentalCharacterNameStyling);
      await game.settings.set(MODULE_ID, 'illuminatedDescription', illuminatedDescription);
      await game.settings.set(MODULE_ID, 'illuminatedWidth', illuminatedWidth);
      await game.settings.set(MODULE_ID, 'illuminatedHeight', illuminatedHeight);
      await game.settings.set(MODULE_ID, 'hideAdvancementList', hideAdvancementList);

      ui.notifications.info('UI settings saved successfully');
      application.close();
    } catch (error) {
      console.error('Error saving UI settings:', error);
      ui.notifications.error('Failed to save UI settings');
    }
  }

  function cancelSettings() {
    application.close();
  }
</script>

<style lang="sass">
  :global(#gas-ui-settings)
    background-color: rgba(0, 0, 0, 0.9)
    color: white

  :global(#gas-ui-settings .window-content)
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

          input[type="number"],
          input[type="text"]
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
