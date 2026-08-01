<script>
  import SvelteSelect from "svelte-select";
  import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import {
    getFoldersFromMultiplePacks,
    extractItemsFromPacksSync,
    getPacksFromSettings,
    getAdvancementValue,
    getAdvancementEntryCount,
    advancementEntriesToArray,
    illuminatedDescription,
    safeGetSetting,
    isSelectionAutomationEnabled,
    getSelectionAutomationValue
  } from "~/src/helpers/Utility.js";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { localize as t } from "~/src/helpers/Utility";
  import { background, readOnlyTabs, level } from "~/src/stores/index";
  import { TJSSelect } from "@typhonjs-fvtt/standard/component/form";
  import { MODULE_ID } from "~/src/helpers/constants";

  const isDisabled = getContext('isDisabled') || false;
  const hideLeftSidebar = safeGetSetting(MODULE_ID, 'hideLeftSidebar', false);
  const tabTitle = t('Tabs.Background.Title');
  const showLevelPreviewDropdown = safeGetSetting(
    MODULE_ID,
    "showLevelPreviewDropdown",
    false
  );

  const levelOptions = [];
  for (let i = 1; i <= 20; i++) {
    levelOptions.push({ label: t('Tabs.Classes.Level') + " " + i, value: i });
  }

  const selectStyles = {};

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
  $: advancementArray = getAdvancementEntryCount($background?.system?.advancement)
    ? advancementEntriesToArray($background.system.advancement).filter((value) => value.level === $level)
    : [];


  let richHTML = "";

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

  const levelSelectHandler = async () => {
    await importAdvancements();
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
StandardTabLayout(title="{tabTitle}" showTitle="{true}" tabName="background" singlePanel="{hideLeftSidebar || !value}")
  div(slot="left")
    .flexrow
      .flex0.required(class="{$background ? '' : 'active'}") *
      .flex3 
        IconSelect.icon-select({options} {active} {placeHolder} groupBy="{['sourceBook','packLabel']}" handler="{selectBackgroundHandler}" id="background-select" bind:value disabled="{isDisabled}")
    +if("value && !hideLeftSidebar && showLevelPreviewDropdown")
      +if("!$readOnlyTabs.includes('background')")
        .flexrow.mb-xs
          .flex2.left
            TJSSelect(options="{levelOptions}" store="{level}" on:change="{levelSelectHandler}" styles="{selectStyles}")
      h2.left {t('Advancements')}
      ul.icon-list
        +if("!advancementArray.length")
          li.left {t('NoAdvancements')}
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
    +if("hideLeftSidebar && value")
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
</style>
