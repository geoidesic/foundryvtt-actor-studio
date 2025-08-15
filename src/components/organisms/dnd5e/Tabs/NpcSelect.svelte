<script>
  import { getPacksFromSettings, 
    extractItemsFromPacksSync, illuminatedDescription, 
    getAndSetActorItems, copyNpcStatsToActor, getItemsArray } from "~/src/helpers/Utility.js";
  import { getContext, onMount, tick } from "svelte";
  import { writable } from "svelte/store";
  import { activeTab, npcTabs, selectedNpcBase, readOnlyTabs } from "~/src/stores/index";
  import IconSearchSelect from "~/src/components/atoms/select/IconSearchSelect.svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import FeatureItemList from "~/src/components/molecules/dnd5e/NPC/FeatureItemList.svelte";


  // Add NPCStatBlock import
  import NPCStatBlock from "~/src/components/molecules/dnd5e/NPC/NPCStatBlock.svelte";

  const actor = getContext("#doc");

  // Store for selected NPC item
  export let selectedNpc = writable(null);
  let active = null, value = null;
  let placeHolder = "Select an NPC...";
  let packs = getPacksFromSettings("npcs");
  let allItems = extractItemsFromPacksSync(packs, [
    "name->label",
    "img",
    "type",
    "folder",
    "uuid->value",
    "_id"
  ]);
  let itemDefinitions = allItems
    .filter((x) => x.type == "npc")
    .sort((a, b) => a.label.localeCompare(b.label));

  $: options = itemDefinitions;
  $: html = $selectedNpc?.system?.details?.biography.value || "";
  let richHTML = "";

  const selectNpcHandler = async (option) => {
    const selected = await fromUuid(option);
    window.GAS.log.p('selected NPC', selected)
    $selectedNpc = selected;
    selectedNpcBase.set(selected);
    active = option;
    if (!value) value = option;
    await tick();
    
    // Copy NPC stats (ability scores, hit points, armor class, etc.) to the in-memory actor
    await copyNpcStatsToActor($selectedNpcBase, $actor);
    
    // Copy NPC items/features to the in-memory actor
    await getAndSetActorItems($selectedNpcBase, $actor, selected.name);
    
    richHTML = await illuminatedDescription(html, $selectedNpc);
    Hooks.call('gas.richhtmlReady', richHTML);
  };

  // Footer handles progress and advancing to features via its own button

  onMount(async () => {
    window.GAS.log.d('allItems', allItems)
    if ($selectedNpc?.uuid) {
      await selectNpcHandler($selectedNpc.uuid);
    }
  });

  // Keep local selection in sync with globally persisted selection
  $: if ($selectedNpcBase?.uuid && (!$selectedNpc || $selectedNpc?.uuid !== $selectedNpcBase.uuid)) {
    // Use handler to normalize active/value and compute richHTML; safe to re-fetch
    selectNpcHandler($selectedNpcBase.uuid);
  }
  $: itemsArray = getItemsArray($selectedNpc?.items);
</script>

<template lang="pug">
StandardTabLayout(title="NPC Select" showTitle="true" tabName="npc-select")
  div(slot="left")
    .flexrow
      .flex0.required(class="{$selectedNpc ? '' : 'active'}") *
      .flex3
        IconSearchSelect.icon-select({options} {active} {placeHolder} handler="{selectNpcHandler}" id="npc-select" bind:value)
    +if("$selectedNpc")
      NPCStatBlock(
        name="{$selectedNpc.name}"
        npc="{$selectedNpc}"
      )

      +if("itemsArray?.length")
        h3.mt-sm Features
        FeatureItemList(items="{itemsArray}")
  div(slot="right") 
    //- pre {$actor.items.toArray()}
    //- FeatureItemList(trashable="{true}")
    //- pre item count {$actor?.items.size}
    //- +if("$actor?.items.size > 0")
    //-   +each("$actor?.items as item")
    //-     pre {item.name}
    +if("$selectedNpc")
      div {@html richHTML ||  'No biography provided'}

</template>

<style lang="sass">
  :global(.icon-select)
    position: relative
</style>
