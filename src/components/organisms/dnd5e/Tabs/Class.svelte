<script>
  import SvelteSelect from 'svelte-select';
  import IconSelect from '~/src/components/atoms/select/IconSelect.svelte';
  import { extractMapIteratorObjectProperties, getPackFolders, addItemToCharacter, log } from "~/src/helpers/Utility.js";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { characterClass, characterSubClass } from "~/src/helpers/store"
  
  let filteredSubClassIndex = [], mappedSubClassIndex, subClassesIndex, activeClass = null, activeSubClass = null, classValue = null, subclassValue = null, classesPlaceholder = "Classes",  subclassesPlaceholder = "Subclasses";
  let pack = game.packs.get('dnd5e.classes');
  let subClassesPack = game.packs.get('dnd5e.subclasses');
  let folders = getPackFolders(pack, 1);
  let folderIds = folders.map(x => x._id);
  let mappedClassIndex = extractMapIteratorObjectProperties(pack.index.entries(), ['name->label','img', 'type', 'folder', 'uuid->value', '_id']);
  let filteredClassIndex = mappedClassIndex.filter(x => !folderIds.includes(x.folder));
  
  
  
  const actor = getContext("#doc");
  
  
  $: classOptions = filteredClassIndex;
  $: subclassOptions = filteredSubClassIndex;
  $: html = $characterClass?.system?.description.value || '';
  $: subclasses = subClassesIndex?.filter(x => x.system.classIdentifier === $characterClass?.system.identifier);
  
  let richHTML = '';
  
  log.d('actor', actor);
  log.d('$actor', $actor);
  
  const getSubclassIndex = async () => {
    subClassesIndex = await subClassesPack.getIndex({ fields: ['system.classIdentifier'] });
    mappedSubClassIndex = subClassesPack ? extractMapIteratorObjectProperties(subClassesIndex.entries(), ['name->label','img', 'type', 'folder', 'uuid->value', 'system', '_id'])  : [];
    filteredSubClassIndex = subClassesPack ? mappedSubClassIndex?.filter(x => x.system.classIdentifier == $characterClass.system.identifier) : [];
    log.d('subClassesIndex', subClassesIndex);
    log.d($characterClass.system.identifier);
    log.d(mappedSubClassIndex);
    log.d(filteredClassIndex);
    log.d(filteredSubClassIndex);
    log.d(subclassOptions);
  }

  const selectClassHandler = async (option) => {
    $characterClass = await fromUuid(option)
    activeClass = option; 
    getSubclassIndex();
    await tick();
    richHTML = await TextEditor.enrichHTML(html);
  }

  const selectSubClassHandler = async (option) => {
    $characterSubClass = await fromUuid(option)
    activeSubClass = option; 
  }

  onMount(async () => {
    log.d('actor', actor);
    if($characterClass) {
      classValue = $characterClass.uuid;
      richHTML = await TextEditor.enrichHTML(html);
      getSubclassIndex();
    }
    if($characterSubClass) {
      subclassValue = $characterSubClass.uuid;
    }
  });
    
</script>
    
<template lang="pug">
div.tab-content
  .flexrow
    .flex2.pr-sm.col-a
      IconSelect.icon-select(active="{activeClass}" options="{filteredClassIndex}"  placeHolder="{classesPlaceholder}" handler="{selectClassHandler}" id="characterClass-select" bind:value="{classValue}" )
      +if("subClassesIndex")
      +if("subclasses")
        h3.left.mt-md Subclass
        IconSelect.icon-select(active="{activeSubClass}" options="{filteredSubClassIndex}"  placeHolder="{subclassesPlaceholder}" handler="{selectSubClassHandler}" id="subClass-select" bind:value="{subclassValue}" )
        
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