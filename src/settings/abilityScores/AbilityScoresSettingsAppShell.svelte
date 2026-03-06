<svelte:options accessors={true} />

<template lang="pug">
TJSApplicationShell(bind:elementRoot="{elementRoot}")
  main.gas-settings-app
    //- Settings controls
    .settings-content
      .setting-group
        h3 Entry Methods
        
        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{allowManualInput}"
            )
            span {game.i18n.localize('GAS.Setting.AbilityEntry.AllowManualInput.Name')}
          p.hint {game.i18n.localize('GAS.Setting.AbilityEntry.AllowManualInput.Hint')}

        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{allowStandardArray}"
            )
            span {game.i18n.localize('GAS.Setting.AbilityEntry.AllowStandardArray.Name')}
          p.hint {game.i18n.localize('GAS.Setting.AbilityEntry.AllowStandardArray.Hint')}

        +if("allowStandardArray")
          .setting-item.indented
            label
              span {game.i18n.localize('GAS.Setting.AbilityEntry.StandardArrayValues.Name')}
              input(
                type="text"
                bind:value="{standardArray}"
                class="standard-array-input"
              )
            p.hint {game.i18n.localize('GAS.Setting.AbilityEntry.StandardArrayValues.Hint')}

        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{allowPointBuy}"
            )
            span {game.i18n.localize('GAS.Setting.AbilityEntry.AllowPointBuy.Name')}
          p.hint {game.i18n.localize('GAS.Setting.AbilityEntry.AllowPointBuy.Hint')}

        +if("allowPointBuy")
          .setting-item.indented
            label
              span {game.i18n.localize('GAS.Setting.AbilityEntry.PointBuyLimit.Name')}
              input(
                type="number"
                bind:value="{pointBuyLimit}"
                min="0"
                max="100"
                class="point-buy-input"
              )
            p.hint {game.i18n.localize('GAS.Setting.AbilityEntry.PointBuyLimit.Hint')}

        .setting-item
          label
            input(
              type="checkbox"
              bind:checked="{allowRolling}"
            )
            span {game.i18n.localize('GAS.Setting.AbilityEntry.AllowRolling.Name')}
          p.hint {game.i18n.localize('GAS.Setting.AbilityEntry.AllowRolling.Hint')}

        +if("allowRolling")
          .setting-item.indented
            label
              span {game.i18n.localize('GAS.Setting.AbilityEntry.AbilityRollFormula.Name')}
              input(
                type="text"
                bind:value="{abilityRollFormula}"
                class="formula-input"
              )
            p.hint {game.i18n.localize('GAS.Setting.AbilityEntry.AbilityRollFormula.Hint')}

          .setting-item.indented
            label
              input(
                type="checkbox"
                bind:checked="{allowAbilityRollScoresToBeMoved}"
              )
              span {game.i18n.localize('GAS.Setting.AllowAbilityRollScoresToBeMoved.Name')}
            p.hint {game.i18n.localize('GAS.Setting.AllowAbilityRollScoresToBeMoved.Hint')}

    //- Footer with save/cancel buttons
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
  let allowManualInput = safeGetSetting(MODULE_ID, 'allowManualInput', true);
  let allowStandardArray = safeGetSetting(MODULE_ID, 'allowStandardArray', false);
  let standardArray = safeGetSetting(MODULE_ID, 'standardArray', '15, 14, 13, 12, 10, 8');
  let allowPointBuy = safeGetSetting(MODULE_ID, 'allowPointBuy', false);
  let pointBuyLimit = safeGetSetting(MODULE_ID, 'pointBuyLimit', 27);
  let allowRolling = safeGetSetting(MODULE_ID, 'allowRolling', false);
  let abilityRollFormula = safeGetSetting(MODULE_ID, 'abiiltyRollFormula', '4d6kh3');
  let allowAbilityRollScoresToBeMoved = safeGetSetting(MODULE_ID, 'allowAbilityRollScoresToBeMoved', true);

  async function saveSettings() {
    try {
      await game.settings.set(MODULE_ID, 'allowManualInput', allowManualInput);
      await game.settings.set(MODULE_ID, 'allowStandardArray', allowStandardArray);
      await game.settings.set(MODULE_ID, 'standardArray', standardArray);
      await game.settings.set(MODULE_ID, 'allowPointBuy', allowPointBuy);
      await game.settings.set(MODULE_ID, 'pointBuyLimit', pointBuyLimit);
      await game.settings.set(MODULE_ID, 'allowRolling', allowRolling);
      await game.settings.set(MODULE_ID, 'abiiltyRollFormula', abilityRollFormula);
      await game.settings.set(MODULE_ID, 'allowAbilityRollScoresToBeMoved', allowAbilityRollScoresToBeMoved);

      ui.notifications.info(game.i18n.localize('GAS.Notification.SettingsSaved'));
      application.close();
    } catch (error) {
      console.error('Error saving ability scores settings:', error);
      ui.notifications.error(game.i18n.localize('GAS.Notification.SettingsSaveFailed'));
    }
  }

  function cancelSettings() {
    application.close();
  }
</script>

<style lang="sass">
  :global(#gas-ability-scores-settings)
    background-color: rgba(0, 0, 0, 0.9)
    color: white

  :global(#gas-ability-scores-settings .window-content)
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

        &.indented
          margin-left: 2rem
          background: rgba(255, 255, 255, 0.03)

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

          input[type="text"],
          input[type="number"]
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

          input[type="number"]
            max-width: 100px

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
