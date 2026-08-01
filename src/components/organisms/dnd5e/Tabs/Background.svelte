<script>
  import SvelteSelect from "svelte-select";
  import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import {
    getFoldersFromMultiplePacks,
    extractItemsFromPacksSync,
    getPacksFromSettings,
    getAdvancementValue,
    illuminatedDescription,
    safeGetSetting,
    isSelectionAutomationEnabled,
    getSelectionAutomationValue
  } from "~/src/helpers/Utility.js";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { localize as t } from "~/src/helpers/Utility";
  import { background, readOnlyTabs } from "~/src/stores/index";
  import { MODULE_ID } from "~/src/helpers/constants";
  import CustomBackgroundForm from "~/src/components/molecules/dnd5e/CustomBackgroundForm.svelte";

  const isDisabled = getContext('isDisabled') || false;
  const hideAdvancementList = safeGetSetting(MODULE_ID, 'hideAdvancementList', false);

  $: console.log('[BG] $background changed:', $background);

  let active = null,
    value = null,
    placeHolder = t('Tabs.Background.Placeholder');
  let packs = getPacksFromSettings("backgrounds");
  // let folders = getFoldersFromMultiplePacks(packs, 1);
  // let folderIds = folders.map((x) => x._id);
  let allItems = extractItemsFromPacksSync(packs, [
    "name->label",
    "img",
    "type",
    "folder",
    "uuid->value",
    "_id",
  ]);
  let itemDefinitions = allItems
    .filter((x) => x.type == "background")
    .sort((a, b) => a.label.localeCompare(b.label));
  const actor = getContext("#doc");

  $: options = itemDefinitions;
  $: advancementComponents = {};
  $: html = $background?.system?.description.value || "";
  $: backgrounds = allItems.filter((x) => x.type == "background");
  $: advancementArray = $background?.advancement?.byId
    ? Object.entries($background.advancement.byId).map(([id, value]) => ({
        ...value,
        id,
      }))
    : [];

  let richHTML = "";

  // Custom background toggle
  let showCustomBackground = false;
  $: enableCustomBackground = safeGetSetting(MODULE_ID, 'enableCustomBackground', false);

  function toggleCustomBackground() {
    showCustomBackground = !showCustomBackground;
  }

  function onCustomBackgroundCreated(createdItem) {
    // The $background store is already set by the CustomBackgroundForm
    // Hide the custom form once created
    showCustomBackground = false;
  }

  // isDisabled now handled by StandardTabLayout

  const importAdvancements = async () => {
    for (const advancement of advancementArray) {
      try {
        const module = await import(`~/src/components/molecules/dnd5e/Advancements/${advancement.type}.svelte`);
        advancementComponents[advancement.type] = module.default;
      } catch (error) {
        log.e(`Failed to load component for ${advancement.type}:`, error);
      }
    }
  };
  
  const selectBackgroundHandler = async (option) => {
    console.log('[BG] selectBackgroundHandler called with:', option);
    const selectedBackground = await fromUuid(option);
    console.log('[BG] selectBackgroundHandler selectedBackground:', selectedBackground);
    $background = selectedBackground;
    active = option;
    if(!value) {
      value = option;
    }
    await tick();
    await importAdvancements();
    richHTML = await illuminatedDescription(html, $background);

    Hooks.call('gas.richhtmlReady', richHTML);
  };


  onMount(async () => {
    console.log('[BG] onMount, $background:', $background);
    let backgroundUuid = null;
    if (isSelectionAutomationEnabled()) {
      backgroundUuid = getSelectionAutomationValue('background');
    } else {
      backgroundUuid = $background?.uuid;
    }
    console.log('[BG] onMount, backgroundUuid:', backgroundUuid);
    if (backgroundUuid) {
      await selectBackgroundHandler(backgroundUuid);
    }
  });

</script>

<template lang="pug">
StandardTabLayout(title="{t('Tabs.Background.Title')}" showTitle="{true}" tabName="background" singlePanel="{hideAdvancementList}")
  div(slot="left")
    .flexrow
      .flex0.required(class="{$background ? '' : 'active'}") *
      .flex3 
        IconSelect.icon-select({options} {active} {placeHolder} groupBy="{['sourceBook','packLabel']}" handler="{selectBackgroundHandler}" id="background-select" bind:value disabled="{isDisabled}")
    +if("enableCustomBackground")
      .custom-toggle-wrap
        button.custom-toggle-btn(type="button" on:click="{toggleCustomBackground}" disabled="{isDisabled}")
          +if("showCustomBackground")
            | - {t('Tabs.Background.Placeholder')}
            +else()
              | + {t('Tabs.Background.ToggleCustom')}
    //- Custom background form (shown when toggled)
    CustomBackgroundForm(bind:show="{showCustomBackground}" onBackgroundCreated="{onCustomBackgroundCreated}")
    +if("advancementArray.length && !hideAdvancementList")
      h2.left {t('Advancements')}
      ul.icon-list
        +each("advancementArray as advancement")
          //- @todo: this should be broken out into components for each advancement.type
          li.left
            .flexrow(data-tooltip="{getAdvancementValue(advancement, 'hint')}"  data-tooltip-class="gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip")
              .flex0.relative.image
                img.icon(src="{advancement.icon}" alt="{advancement.title}")
              .flex2 {advancement.title}
            .flexrow
              //- pre advancement {advancement.type}
              svelte:component(this="{advancementComponents[advancement.type]}" advancement="{advancement}")
    +if("hideAdvancementList && value")
      .description-fill.mt-sm
        | {@html richHTML}
  div(slot="right") {@html richHTML}
</template>

<style lang="sass">
  :global(.icon-select)
    position: relative

  .description-fill
    overflow-y: auto
    font-size: smaller
    :global(img)
      max-width: 100%
      height: auto

  .custom-toggle-wrap
    margin-top: 0.5rem
    margin-bottom: 0.25rem

  .custom-toggle-btn
    width: 100%
    padding: 0.4rem 0.6rem
    border: 1px dashed #4a9eff
    border-radius: 4px
    background: rgba(74, 158, 255, 0.08)
    color: #4a9eff
    cursor: pointer
    font-size: 0.85rem
    font-family: inherit
    text-align: center
    transition: all 0.15s ease

    &:hover:not(:disabled)
      background: rgba(74, 158, 255, 0.18)
      border-color: #6ab8ff

    &:disabled
      opacity: 0.4
      cursor: not-allowed
</style>
