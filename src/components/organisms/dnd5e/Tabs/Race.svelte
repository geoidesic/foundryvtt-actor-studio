<script>
import SvelteSelect from 'svelte-select';
import IconSelect from '~/src/components/atoms/select/IconSelect.svelte';
import { extractMapIteratorObjectProperties, getPackFolders, addItemToCharacter, getPacksFromSettings, log } from "~/src/helpers/Utility.js";
import { getContext, onDestroy, onMount, tick } from "svelte";
import { localize } from "#runtime/svelte/helper";
import { race } from "~/src/helpers/store"

let active = null, value = null, placeHolder = "Races";
let pack = getPacksFromSettings('races');
let folders = getPackFolders(pack, 1);
let folderIds = folders.map(x => x._id);
let allRaceItems = extractMapIteratorObjectProperties(pack.index.entries(), ['name->label','img', 'type', 'folder', 'uuid->value', '_id']);
let raceDefinitions = allRaceItems.filter(x => folderIds.includes(x.folder));

const actor = getContext("#doc");

$: actorObject = $actor.toObject();
$: options = raceDefinitions;
$: html = $race?.system?.description?.value || '';
$: movement = $race?.system?.movement
$: senses = $race?.system?.senses

$: filteredMovement = movement ? Object.keys(movement)
    .filter(key => key !== 'units' && movement[key])
    .map(key => ({ label: key, value: movement[key] })) : [];

$: filteredSenses = senses ? Object.keys(senses)
    .filter(key => key !== 'units' && senses[key])
    .map(key => ({ label: key, value: senses[key] })) : [];

$: units = $race?.system?.movement?.units || '';
$: type = $race?.system?.type || '';
$: source = $race?.system?.source || '';
$: book = source?.book || '';
$: page = source?.page? ', p. ' + source.page : '';
$: advancementArray = $race?.advancement?.byId ? Object.entries($race.advancement.byId).map(([id, value]) => ({ ...value, id }))
  .filter(value => !(value.type == 'Trait' && value.title == "Dwarven Resilience"))
  // .filter(value => (value.type == 'Trait' && value.title == "Tinker"))
  : [];

$: log.d('advancementArray', advancementArray)

const selectHandler = async (option) => {
  $race = await fromUuid(option);
  active = option; 
  await tick();
}

const importPath = '../../../molecules/dnd5e/Advancements/';
const importComponent = async (componentName) => {
  const { default: Component } = await import( /* @vite-ignore */`${importPath}${componentName}.svelte`);
  return Component;
};

onMount(async () => {
  if($race) {
    value = $race.uuid;
  }
});

/**
 * So the only viable strategy is to keep the race additions in storage 
 * and then only add them after the Actor is added to the game. 
 * I haven't found a way to add them to the Actor before it is persisted.
 */
const createActorInGameAndEmbedItems = async () => {
  const itemData = race.toObject()
  const actorInGame = await Actor.create(actorObject);
  const result = await addItemToCharacter(actorInGame, itemData)
}

</script>

<template lang="pug">
div.content
  .flexrow
    .flex2.pr-sm.col-a
      IconSelect.mb-md.icon-select({options} {active} {placeHolder} handler="{selectHandler}" id="race-select" bind:value )
      +if("value")
        +if("source")
          //- h3.left {localize('GAS.Source')}
          ol.properties-list
            li {book} {page} {type.value ? ', ' + type.value : ''} 

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
        +if("advancementArray")
          h3.left {localize('GAS.Advancements')}
          ul.icon-list
            +each("advancementArray as advancement")
              //- @todo: this should be broken out into components for each advancement.type
              li.left
                .flexrow(data-tooltip="{advancement.configuration?.hint || null}" data-tooltip-class="gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip")
                  .flex0.relative.image
                    img.icon(src="{advancement.icon}" alt="{advancement.title}")
                  .flex2 {advancement.title}
                //- pre advancement.type {advancement.type}
                //- pre advancement.title {advancement.title}

                +await("importComponent(advancement.type)")
                  +then("Component")
                    //- pre advancement {advancement.type}
                    svelte:component(this="{Component}" advancement="{advancement}")
                    
                  
                
    .flex0.border-right.right-border-gradient-mask 
    .flex3.left.pl-md.scroll.col-b(bind:innerHTML="{html}" contenteditable)
  
</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .content 
    @include staticOptions

  :global(.icon-select)
    position: relative



</style>