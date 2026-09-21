<script>
  import IconSelect from "~/src/components/molecules/select/IconSelect.svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import {
    extractItemsFromPacksSync,
    getPacksFromSettings,
    getAdvancementEntryCount,
    advancementEntriesToArray,
    illuminatedDescription,
    safeGetSetting,
    isSelectionAutomationEnabled,
    getSelectionAutomationValue
  } from "~/src/helpers/Utility.js";
  import { getContext, onMount, tick } from "svelte";
  import { localize as t } from "~/src/helpers/Utility";
  import { background, readOnlyTabs, level } from "~/src/stores/index";
  import { TJSSelect } from "@typhonjs-fvtt/standard/component/form";
  import { MODULE_ID } from "~/src/helpers/constants";
  import AdvancementIconList from "~/src/components/molecules/dnd5e/AdvancementIconList.svelte";

  const isDisabled = getContext('isDisabled') || false;
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

  // Match the Class tab: preview mode is a two-panel layout; otherwise the
  // selected background uses the full-width single panel.
  $: canRenderTwoPanels = Boolean(value && showLevelPreviewDropdown);
  $: singlePanel = !canRenderTwoPanels;


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

  $: if (advancementArray.length) {
    importAdvancements();
  }

</script>

<template lang="pug">
StandardTabLayout(title="{tabTitle}" showTitle="{true}" tabName="background" singlePanel="{singlePanel}" contentClass="{singlePanel ? 'class-tab-single-panel' : ''}")
  div(slot="left")
    .flexrow
      .flex0.required(class="{$background ? '' : 'active'}") *
      .flex3
        IconSelect.icon-select({options} {active} {placeHolder} groupBy="{['sourceBook','packLabel']}" handler="{selectBackgroundHandler}" id="background-select" bind:value disabled="{isDisabled}")
    +if("canRenderTwoPanels")
      +if("!$readOnlyTabs.includes('background')")
        .flexrow.mb-xs
          .flex2.left
            TJSSelect(options="{levelOptions}" store="{level}" on:change="{importAdvancements}" styles="{selectStyles}")
      h2.left {t('Advancements')}
      AdvancementIconList(advancements="{advancementArray}" components="{advancementComponents}")
    +if("singlePanel && value")
      .description-fill.mt-sm
        | {@html richHTML}
  div(slot="right")
    | {@html richHTML}
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

  :global(.class-tab-single-panel .col-a)
    flex: 1 1 100%
    max-width: 100%
    width: 100%

  :global(.class-tab-single-panel .description-fill)
    width: 100%
</style>
