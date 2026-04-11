<svelte:options accessors={true} />

<template lang="pug">
TJSApplicationShell(bind:elementRoot="{elementRoot}")
  main.gas-settings-app
    .settings-content

      .setting-group
        h3 {game.i18n.localize('GAS.Setting.CharacterCreationTabOrder.Title')}

        .setting-item
          .setting-label
            span {game.i18n.localize('GAS.Setting.CharacterCreationTabOrder.Name')}
          p.hint {game.i18n.localize('GAS.Setting.CharacterCreationTabOrder.Hint')}
          .tab-order-list
            +each("characterCreationTabOrder as tabId, index")
              .tab-order-row
                span.tab-order-label {getCharacterCreationTabLabel(tabId)}
                .tab-order-controls
                  button.move-button(
                    type="button"
                    on:click!="{getMoveCharacterCreationTabHandler(index, -1)}"
                    disabled="{index === 0}"
                    aria-label="{game.i18n.localize('GAS.AltText.MoveUp')}"
                  )
                    i.fas.fa-chevron-up
                  button.move-button(
                    type="button"
                    on:click!="{getMoveCharacterCreationTabHandler(index, 1)}"
                    disabled="{index === characterCreationTabOrder.length - 1}"
                    aria-label="{game.i18n.localize('GAS.AltText.MoveDown')}"
                  )
                    i.fas.fa-chevron-down

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
              bind:checked="{forceTakeAverageHitPoints}"
            )
            span {game.i18n.localize('GAS.Setting.forceTakeAverageHitPoints.Name')}
          p.hint {game.i18n.localize('GAS.Setting.forceTakeAverageHitPoints.Hint')}

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
  import { MODULE_ID } from '~/src/helpers/constants';
  import { safeGetSetting, getDndRulesVersion } from '~/src/helpers/Utility';
  import {
    DEFAULT_CHARACTER_CREATION_TAB_ORDER,
    normalizeCharacterCreationTabOrder,
  } from '~/src/helpers/characterCreationTabOrder';

  export let elementRoot;

  const { application } = getContext('#external');

  // Dynamic label keys based on D&D rules version
  $: is2024 = (() => {
    try {
      return getDndRulesVersion() === '2024';
    } catch (e) {
      return false;
    }
  })();
  $: characterCreationTabOrderLabelKeys = {
    abilities: 'GAS.Setting.CharacterCreationTabOrder.Abilities',
    race: is2024 ? 'GAS.Setting.CharacterCreationTabOrder.Race2024' : 'GAS.Setting.CharacterCreationTabOrder.Race',
    background: 'GAS.Setting.CharacterCreationTabOrder.Background',
    class: 'GAS.Setting.CharacterCreationTabOrder.Class'
  };

  // Load current settings
  let enableLevelUp = safeGetSetting(MODULE_ID, 'enableLevelUp', true);
  let milestoneLeveling = safeGetSetting(MODULE_ID, 'milestoneLeveling', false);
  let forceDnd5eLevelUpAutomation = safeGetSetting(MODULE_ID, 'forceDnd5eLevelUpAutomation', true);
  let disableAdvancementCapture = safeGetSetting(MODULE_ID, 'disableAdvancementCapture', false);
  let forceTakeAverageHitPoints = safeGetSetting(MODULE_ID, 'forceTakeAverageHitPoints', false);
  let advancementCaptureTimerThreshold = safeGetSetting(MODULE_ID, 'advancementCaptureTimerThreshold', 300);
  let enableCustomFeatSelector = safeGetSetting(MODULE_ID, 'enableCustomFeatSelector', false);
  let showLevelPreviewDropdown = safeGetSetting(MODULE_ID, 'showLevelPreviewDropdown', false);
  let characterCreationTabOrder = normalizeCharacterCreationTabOrder(
    safeGetSetting(MODULE_ID, 'characterCreationTabOrder', DEFAULT_CHARACTER_CREATION_TAB_ORDER)
  );

  function moveCharacterCreationTab(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= characterCreationTabOrder.length) return;

    const updatedOrder = [...characterCreationTabOrder];
    [updatedOrder[index], updatedOrder[targetIndex]] = [updatedOrder[targetIndex], updatedOrder[index]];
    characterCreationTabOrder = updatedOrder;
  }

  function getMoveCharacterCreationTabHandler(index, direction) {
    return () => moveCharacterCreationTab(index, direction);
  }

  function getCharacterCreationTabLabel(tabId) {
    const localizationKey = characterCreationTabOrderLabelKeys[tabId];
    return localizationKey ? game.i18n.localize(localizationKey) : tabId;
  }

  function refreshOpenActorSheets() {
    const openWindows = Object.values(ui.windows || {});
    for (const app of openWindows) {
      if (app?.document?.documentName === 'Actor' && typeof app.render === 'function') {
        app.render(false);
      }
    }
  }

  async function saveSettings() {
    try {
      const normalizedTabOrder = normalizeCharacterCreationTabOrder(characterCreationTabOrder);
      await game.settings.set(MODULE_ID, 'enableLevelUp', enableLevelUp);
      await game.settings.set(MODULE_ID, 'milestoneLeveling', milestoneLeveling);
      await game.settings.set(MODULE_ID, 'forceDnd5eLevelUpAutomation', forceDnd5eLevelUpAutomation);
      await game.settings.set(MODULE_ID, 'disableAdvancementCapture', disableAdvancementCapture);
      await game.settings.set(MODULE_ID, 'forceTakeAverageHitPoints', forceTakeAverageHitPoints);
      await game.settings.set(MODULE_ID, 'advancementCaptureTimerThreshold', advancementCaptureTimerThreshold);
      await game.settings.set(MODULE_ID, 'enableCustomFeatSelector', enableCustomFeatSelector);
      await game.settings.set(MODULE_ID, 'showLevelPreviewDropdown', showLevelPreviewDropdown);
      await game.settings.set(MODULE_ID, 'characterCreationTabOrder', normalizedTabOrder);

      refreshOpenActorSheets();
      ui.notifications.info('Progression settings saved successfully');
      application.close();
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

        .setting-label
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

        .tab-order-list
          margin-top: 0.5rem
          display: flex
          flex-direction: column
          gap: 0.35rem

          .tab-order-row
            display: flex
            align-items: center
            justify-content: space-between
            padding: 0.4rem 0.5rem
            border: 1px solid #555
            border-radius: 4px
            background: rgba(0, 0, 0, 0.25)

            .tab-order-label
              font-weight: 600

            .tab-order-controls
              display: flex
              gap: 0.35rem

              .move-button
                min-width: 2rem
                padding: 0.25rem 0.4rem
                background: #333
                border: 1px solid #666
                color: white

                &:hover:not([disabled])
                  background: #444

                &[disabled]
                  opacity: 0.45
                  cursor: not-allowed

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
