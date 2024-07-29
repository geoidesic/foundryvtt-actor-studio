<script>
  import SvelteSelect from "svelte-select";
  import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
  import {
    getFoldersFromMultiplePacks,
    extractItemsFromPacks,
    getPacksFromSettings,
    log,
  } from "~/src/helpers/Utility.js";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { localize } from "#runtime/svelte/helper";
  import { background } from "~/src/helpers/store";

  let active = null,
    value = null,
    placeHolder = "Backgrounds";
  let packs = getPacksFromSettings("backgrounds");
  // let folders = getFoldersFromMultiplePacks(packs, 1);
  // let folderIds = folders.map((x) => x._id);
  let allItems = extractItemsFromPacks(packs, [
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
  
  const selectHandler = async (option) => {
    $background = await fromUuid(option);
    // log.d('background', $background)
    active = option;
    await tick();
    await importAdvancements();
    richHTML = await TextEditor.enrichHTML(html);
  };

  onMount(async () => {
    if ($background) {
      // log.d('background', background)
      value = $background.uuid;
      await tick();
      await importAdvancements();
      richHTML = await TextEditor.enrichHTML(html);
    }
  });

</script>

<template lang="pug">
div.content
  .flexrow
    .flex2.pr-sm.col-a
      .flexrow
        .flex0.required(class="{$background ? '' : 'active'}") *
        .flex3 
          IconSelect.icon-select({options} {active} {placeHolder} handler="{selectHandler}" id="background-select" bind:value )
     
      +if("advancementArray.length")
        h3.left {localize('GAS.Advancements')}
        ul.icon-list
          +each("advancementArray as advancement")
            //- @todo: this should be broken out into components for each advancement.type
            li.left
              .flexrow(data-tooltip="{advancement.configuration?.hint || null}"  data-tooltip-class="gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip")
                .flex0.relative.image
                  img.icon(src="{advancement.icon}" alt="{advancement.title}")
                .flex2 {advancement.title}
              .flexrow
                //- pre advancement {advancement.type}
                svelte:component(this="{advancementComponents[advancement.type]}" advancement="{advancement}")

    .flex0.border-right.right-border-gradient-mask 
    .flex3.left.pl-md.scroll.col-b {@html richHTML}

</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .content 
    @include staticOptions

  :global(.icon-select)
    position: relative

</style>
