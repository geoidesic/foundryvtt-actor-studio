<script>
  import IconSearchSelect from "~/src/components/atoms/select/IconSearchSelect.svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import { getPacksFromSettings, extractItemsFromPacksSync, illuminatedDescription } from "~/src/helpers/Utility.js";
  import { getContext, onMount, tick } from "svelte";
  import { writable } from "svelte/store";
  import { activeTab, npcTabs, selectedNpcBase, readOnlyTabs } from "~/src/stores/index";

  // Add NPCStatBlock import
  import NPCStatBlock from "~/src/components/molecules/dnd5e/NPC/NPCStatBlock.svelte";

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
  div(slot="right") {@html richHTML}
</template>

<style lang="sass">
  :global(.icon-select)
    position: relative
</style>
