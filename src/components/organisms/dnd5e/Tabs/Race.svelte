<script>
import SvelteSelect from 'svelte-select';
import IconSelect from '~/src/components/atoms/select/IconSelect.svelte';
import { extractMapIteratorObjectProperties, getPackFolders, addItemToCharacter, log } from "~/src/helpers/Utility.js";
import { getContext, onDestroy, onMount, tick } from "svelte";
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
$: movement = race?.system?.movement
$: senses = race?.system?.senses

$: filteredMovement = movement ? Object.keys(movement)
    .filter(key => key !== 'units' && movement[key])
    .map(key => ({ label: key, value: movement[key] })) : [];

$: filteredSenses = senses ? Object.keys(senses)
    .filter(key => key !== 'units' && senses[key])
    .map(key => ({ label: key, value: senses[key] })) : [];

$: units = race?.system?.movement?.units || '';
$: type = race?.system?.type || '';
$: source = race?.system?.source || '';
$: book = source?.book || '';
$: page = source?.page? ', p. ' + source.page : '';
$: advancementArray = race?.advancement?.byId ? Object.entries(race.advancement.byId).map(([id, value]) => ({ ...value, id })) : [];


const selectHandler = async (option) => {
  race = await fromUuid(option);
  active = option; 
  log.d('race', race);
  log.d('race.system.description', race.system.description);
  log.d('filteredMovement', filteredMovement);
  log.d('race.advancement', race.advancement);
  log.d('race.advancement.byId', race.advancement.byId);
  await tick();
  log.d('advancementArray', advancementArray);
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
    .flex2.pr-sm.col-a
      IconSelect.mb-md.icon-select({options} {active} {placeHolder} handler="{selectHandler}" id="asdlfkj" bind:value )
      +if("value")
        +if("source")
          h3.left {localize('GAS.Source')}
          ol.properties-list
            li {book} {page}
        h3.left {localize('GAS.AbilityScores')}
        ol.properties-list
          li Manual Entry
        +if("filteredMovement")
          h3.left {localize('GAS.Tabs.Races.Movement')}
          ol.properties-list
            +each("filteredMovement as movement")
              li.left {movement.label} : {movement.value} {units}
        +if("filteredSenses")
          h3.left {localize('GAS.Tabs.Races.Senses')}
          ol.properties-list
            +each("filteredSenses as senses")
              li.left {senses.label} : {senses.value} {units}
        +if("type")
          h3.left {localize('GAS.Tabs.Races.Type')}
          ol.properties-list
            li.left {type.value}
        +if("advancementArray")
          h3.left {localize('GAS.Tabs.Races.Advancements')}
          ul.icon-list
            +each("advancementArray as advancement")
              li.left
                .flexrow
                  .flex0.relative.image
                    img.icon(src="{advancement.icon}" alt="{advancement.title}")
                  .flex2 {advancement.title}
                  
                
    .flex0.border-right.right-border-gradient-mask 
    .flex3.left.pl-md.scroll.col-b(bind:innerHTML="{html}" contenteditable)
  
</template>

<style lang="sass" scoped>
  @import "../../../../../styles/Mixins.scss"
  .tab-content 
    @include staticOptions

  :global(.icon-select)
    position: relative

  .image
    min-width: 24px

  ul.icon-list
    list-style-type: none
    padding: 0
    position: relative
    margin: 0
    li
      margin: 3px 0
      box-shadow: 0 0 0 1px var(--li-inset-color) inset
      padding: 0.5rem 0.3rem
      border-radius: var(--border-radius)
      background: var(--li-background-color)

  img.icon
    position: absolute
    top: -3px
    left: 0
    width: 24px
    height: 24px
    vertical-align: middle
    border: 0
  

</style>