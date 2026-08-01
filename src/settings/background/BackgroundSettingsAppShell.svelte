<svelte:options accessors={true} />

<template lang="pug">
TJSApplicationShell(bind:elementRoot="{elementRoot}")
  main.gas-settings-app
    .settings-content
      .setting-group
        h3 Custom Background Options
        
        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{enableCustomBackground}"
            )
            span {game.i18n.localize('GAS.Setting.EnableCustomBackground.Name')}
          p.hint {game.i18n.localize('GAS.Setting.EnableCustomBackground.Hint')}

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
  let enableCustomBackground = safeGetSetting(MODULE_ID, 'enableCustomBackground', false);

  async function saveSettings() {
    try {
      await game.settings.set(MODULE_ID, 'enableCustomBackground', enableCustomBackground);

      ui.notifications.info('Background settings saved successfully');
      
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
      console.error('Error saving background settings:', error);
      ui.notifications.error('Failed to save background settings');
    }
  }

  function cancelSettings() {
    application.close();
  }
</script>

<style lang="sass">
  :global(#gas-background-settings)
    background-color: rgba(0, 0, 0, 0.9)
    color: white

  :global(#gas-background-settings .window-content)
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

            &:disabled
              opacity: 0.5
              cursor: not-allowed

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
      pointer-events: all
      padding: 0.5rem 1rem
      border: 1px solid #666
      border-radius: 4px
      cursor: pointer
      font-size: 0.9rem

    .save-button
      background: #4a9eff
      color: white
      border-color: #4a9eff

      &:hover
        background: #3a8eef

    .cancel-button
      background: #555
      color: white

      &:hover
        background: #666
</style>