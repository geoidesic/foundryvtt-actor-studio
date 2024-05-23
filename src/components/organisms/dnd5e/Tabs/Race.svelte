<script>
import SvelteSelect from 'svelte-select';
import IconSelect from '~/src/components/atoms/select/IconSelect.svelte';
import { extractMapIteratorObjectProperties, getPackFolders, addItemToCharacter, log } from "~/src/helpers/Utility.js";
import { getContext, onDestroy, onMount } from "svelte";
import { localize } from "#runtime/svelte/helper";

let active = null, value = null, placeHolder = "Races";
let pack = game.packs.get('dnd5e.races');
let folders = getPackFolders(pack, 1);
let folderIds = folders.map(x => x._id);
let allRaceItems = extractMapIteratorObjectProperties(pack.index.entries(), ['name->label','img', 'type', 'folder', 'uuid->value', '_id']);
let raceDefinitions = allRaceItems.filter(x => folderIds.includes(x.folder));
let race; 

const actor = getContext("#doc");


$: actorObject = $actor.toObject();
$: options = raceDefinitions;
$: html = race?.system?.description.value || '';

log.d('actor', actor);
log.d('$actor', $actor);

const selectHandler = async (option) => {
  race = await fromUuid(option)
  active = option; 
  log.d('race', race);
  log.d('race.system.description', race.system.description);
}


/**
 * So the only viable strategy is to keep the race additions in storage 
 * and then only add them after the Actor is added to the game. 
 * I haven't found a way to add them to the Actor before it is persisted.
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

</script>

<template lang="pug">
div.tab-content
  .flexrow
    .flex2.pr-sm
      IconSelect.icon-select({options} {active} {placeHolder} handler="{selectHandler}" id="asdlfkj" bind:value )
      h3.left {localize('GAS.Tabs.Races.Select')}
    .flex0.border-right.right-border-gradient-mask 
    .flex3.left.pl-md.scroll(bind:innerHTML="{html}" contenteditable)
  
</template>

<style lang="scss" scoped>

</style>