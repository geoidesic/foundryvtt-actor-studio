<script>
  import SvelteSelect from 'svelte-select';
  import IconSelect from '~/src/components/atoms/select/IconSelect.svelte';
  import { extractMapIteratorObjectProperties, getPackFolders, addItemToCharacter, log, getRules } from "~/src/helpers/Utility";
  import { getContext, onDestroy, onMount } from "svelte";
  import Tabs from '~/src/components/molecules/Tabs.svelte';
  import ManualEntry from '~/src/components/organisms/dnd5e/AbilityEntry/ManualEntry.svelte';
  import { localize } from "#runtime/svelte/helper";

  let active = null, value = null, placeHolder = "Races";
  let pack = game.packs.get('dnd5e.races');
  let folders = getPackFolders(pack, 1);
  let folderIds = folders.map(x => x._id);
  let allRaceItems = extractMapIteratorObjectProperties(pack.index.entries(), ['name->label','img', 'type', 'folder', 'uuid->value', '_id']);
  let raceDefinitions = allRaceItems.filter(x => folderIds.includes(x.folder));
  let race; 
  
  const actor = getContext("#doc");
  const ruleConfig = { journalId: '0AGfrwZRzSG0vNKb', pageId: 'yuSwUFIjK31Mr3DI' };

  let rules = '';
  
  $: actorObject = $actor.toObject();
  $: options = raceDefinitions;
  $: html = rules?.content || '';
 
  
  log.d('actor', actor);
  log.d('$actor', $actor);
  
  const selectHandler = async (option) => {
      race = await fromUuid(option)
      active = option; 
      log.d('race', race);
  }
  
  const clickHandler = async () => {
      await createActorInGameAndEmbedItems();
  }
  
  /**
   * So the only viable strategy is to keep the race additions in storage 
   * and then only add them after the Actor is added to the game
   */
  const createActorInGameAndEmbedItems = async () => {
      const itemData = race.toObject()
      log.d('itemData', itemData)
      const actorInGame = await Actor.create(actorObject);
      log.d('actorInGame' , actorInGame)
      const result = await addItemToCharacter(actorInGame, itemData)
      log.d('result', result);
  }
  
  log.d('folders', folders);
  log.d('folderIds', folderIds);
  log.d('allRaceItems', allRaceItems);
  log.d('raceDefinitions', raceDefinitions);

  onMount(async () => {
      log.d('mounted');
      rules = await getRules(ruleConfig);
      log.d('rules', rules);
  });
    
</script>
    
<template lang="pug">
  div.tab-content
    .flexrow
      .flex2.pr-sm
        h3.left {localize('GAS.Tabs.Abilities.HowCalculated')}
        ol.properties-list
          li Manual Entry
        ManualEntry
      .flex0.border-right.right-border-gradient-mask 
      .flex3.left.pl-md.scroll(bind:innerHTML="{html}" contenteditable)
</template>

<style lang="sass" scoped>
@import "../../../../../styles/Mixins.scss"
.tab-content 
  @include staticOptions
  position: relative
  padding: 0
  .scroll
    // display: none
    overflow-y: auto
    height: 580px
    box-sizing: content-box
    padding-right: 15px
</style>