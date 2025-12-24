<script>
  import SvelteSelect from "svelte-select";
  import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import {
    getFoldersFromMultiplePacks,
    extractItemsFromPacksSync,
    getPacksFromSettings,
    getAdvancementValue,
    illuminatedDescription
  } from "~/src/helpers/Utility.js";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { localize as t } from "~/src/helpers/Utility";
  import { background, readOnlyTabs } from "~/src/stores/index";

  const isDisabled = getContext('isDisabled') || false;

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
    let backgroundUuid;
    if (window.GAS.debug) {
      backgroundUuid = window.GAS.background;
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
StandardTabLayout(title="{t('Tabs.Background.Title')}" showTitle="{true}" tabName="background")
  div(slot="left")
    .flexrow
      .flex0.required(class="{$background ? '' : 'active'}") *
      .flex3 
        IconSelect.icon-select({options} {active} {placeHolder} groupBy="{['sourceBook','packLabel']}" handler="{selectBackgroundHandler}" id="background-select" bind:value disabled="{isDisabled}")
    +if("advancementArray.length")
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
  div(slot="right") {@html richHTML}
</template>

<style lang="sass">
  :global(.icon-select)
    position: relative
</style>
