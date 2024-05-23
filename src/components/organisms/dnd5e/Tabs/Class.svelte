<script>
  import SvelteSelect from 'svelte-select';
  import IconSelect from '~/src/components/atoms/select/IconSelect.svelte';
  import { extractMapIteratorObjectProperties, getPackFolders, addItemToCharacter, log } from "~/src/helpers/Utility.js";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  
  let active = null, value = null, placeHolder = "Classes";
  let pack = game.packs.get('dnd5e.classes');
  let folders = getPackFolders(pack, 1);
  let folderIds = folders.map(x => x._id);
  let allItems = extractMapIteratorObjectProperties(pack.index.entries(), ['name->label','img', 'type', 'folder', 'uuid->value', '_id']);
  let itemDefinitions = allItems.filter(x => !folderIds.includes(x.folder));
  let characterClass; 
  
  const actor = getContext("#doc");
  
  
  $: options = itemDefinitions;
  $: html = characterClass?.system?.description.value || '';

  let richHTML = '';
  
  log.d('actor', actor);
  log.d('$actor', $actor);
  
  const selectHandler = async (option) => {
    characterClass = await fromUuid(option)
    active = option; 
    await tick();
    richHTML = await TextEditor.enrichHTML(html);
  }
  
    
</script>
    
<template lang="pug">
div.tab-content
  .flexrow
    .flex2.pr-sm.col-a
      IconSelect.icon-select({options} {active} {placeHolder} handler="{selectHandler}" id="characterClass-select" bind:value )
  
    .flex0.border-right.right-border-gradient-mask 
    .flex3.left.pl-md.scroll.col-b(bind:innerHTML="{richHTML}" contenteditable)

</template>
  

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .tab-content 
    @include staticOptions

  :global(.icon-select)
    position: relative

</style>