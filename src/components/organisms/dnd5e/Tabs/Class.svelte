<script>
  import SvelteSelect from 'svelte-select';
  import IconSelect from '~/src/components/atoms/select/IconSelect.svelte';
  import { extractMapIteratorObjectProperties, getPackFolders, addItemToCharacter, log } from "~/src/helpers/Utility.js";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { characterClass, characterSubClass, level } from "~/src/helpers/store"
  import { localize } from "#runtime/svelte/helper";
  import { TJSSelect } from "@typhonjs-fvtt/svelte-standard/component";
  
  let richHtml = '', richSubClassHTML = '', filteredSubClassIndex = [], mappedSubClassIndex, subClassesIndex, 
    activeClass = null, activeSubClass = null, classValue = null, subclassValue = null, 
    classesPlaceholder = "Classes",  subclassesPlaceholder = "Subclasses"
    ;

  let pack = game.packs.get('dnd5e.classes');
  let subClassesPack = game.packs.get('dnd5e.subclasses');
  let folders = getPackFolders(pack, 1);
  let folderIds = folders.map(x => x._id);
  let mappedClassIndex = extractMapIteratorObjectProperties(pack.index.entries(), ['name->label','img', 'type', 'folder', 'uuid->value', '_id']);
  let filteredClassIndex = mappedClassIndex.filter(x => !folderIds.includes(x.folder));
  
  const levelOptions = [];
  for (let i = 1; i <= 20; i++) {
    levelOptions.push({ label: "Level "+i, value: i });
  }

  const selectStyles = {
    // width: '50%',
    // display: 'inline-block',
    // fontSize: 'smaller',
  }

  
  const actor = getContext("#doc");
  
  
  $: classOptions = filteredClassIndex;
  $: subclassOptions = filteredSubClassIndex;
  $: html = $characterClass?.system?.description.value || '';
  $: subclasses = subClassesIndex?.filter(x => x.system.classIdentifier === $characterClass?.system.identifier);

  $: subClassProp = activeSubClass
  $: classProp = activeClass
  // $: subClassAdvancementArray = $characterSubClass?.advancement?.byId ? Object.entries($characterSubClass.advancement.byId).map(([id, value]) => ({ ...value, id })) : [];
  // $: classAdvancementArray = $characterClass?.advancement?.byId ? Object.entries($characterClass.advancement.byId).map(([id, value]) => ({ ...value, id })) : [];

  $: subClassAdvancementArrayFiltered = $characterSubClass?.advancement?.byId
    ? Object.entries($characterSubClass.advancement.byId)
        .filter(([id, value]) => value.level === $level)
        .map(([id, value]) => ({ ...value, id }))
    : [];

  $: classAdvancementArrayFiltered = $characterClass?.advancement?.byId
    ? Object.entries($characterClass.advancement.byId)
        .filter(([id, value]) => value.level === $level)
        .map(([id, value]) => ({ ...value, id }))
    : [];

    
  
  $: log.d('subClassAdvancementArrayFiltered', subClassAdvancementArrayFiltered )
  $: log.d('classAdvancementArrayFiltered', classAdvancementArrayFiltered )

  let richHTML = '';
  
  const getSubclassIndex = async () => {
    subClassesIndex = await subClassesPack.getIndex({ fields: ['system.classIdentifier'] });
    mappedSubClassIndex = subClassesPack ? extractMapIteratorObjectProperties(subClassesIndex.entries(), ['name->label','img', 'type', 'folder', 'uuid->value', 'system', '_id'])  : [];
    filteredSubClassIndex = subClassesPack ? mappedSubClassIndex?.filter(x => x.system.classIdentifier == $characterClass.system.identifier) : [];
  }

  const selectClassHandler = async (option) => {
    activeSubClass = null
    $characterSubClass = null
    subclassValue = null
    subClassAdvancementArrayFiltered = []
    richSubClassHTML = ''
    $characterClass = await fromUuid(option)
    activeClass = option; 
    getSubclassIndex();
    await tick();
    richHTML = await TextEditor.enrichHTML(html);
  }

  const selectSubClassHandler = async (option) => {
    $characterSubClass = await fromUuid(option)
    activeSubClass = option; 
    await tick();
    richSubClassHTML = await TextEditor.enrichHTML($characterSubClass.system.description.value);
    log.d($characterSubClass)
  }

  const levelSelectHandler = async (option) => {
    
  }
  
  onMount(async () => {
    if($characterClass) {
      classValue = $characterClass.uuid;
      richHTML = await TextEditor.enrichHTML(html);
      getSubclassIndex();
    }
    if($characterSubClass) {
      subclassValue = $characterSubClass.uuid;
      await tick();
      richSubClassHTML = await TextEditor.enrichHTML($characterSubClass.system.description.value);
    }
  });
    
</script>
    
<template lang="pug">
.content
  .flexrow
    .flex2.pr-sm.col-a
      IconSelect.icon-select(active="{classProp}" options="{filteredClassIndex}"  placeHolder="{classesPlaceholder}" handler="{selectClassHandler}" id="characterClass-select" bind:value="{classValue}" )
      +if("$characterClass")
        h3.left.mt-sm Features
        .flexrow
          .flex2.mt-xs {localize('GAS.Tabs.Classes.FilterByLevel')}
          .flex2.left
            TJSSelect( options="{levelOptions}" store="{level}" on:change="{levelSelectHandler}" id="level-select" styles="{selectStyles}" )
        +if("classAdvancementArrayFiltered")
          h3.left.mt-sm {localize('GAS.Tabs.Classes.Class')} {localize('GAS.Advancements')} 
          ul.icon-list
            +each("classAdvancementArrayFiltered as advancement")
              //- @todo: this should be broken out into components for each advancement.type
              li.left
                .flexrow(data-tooltip="{advancement.configuration?.hint || ''}")
                  .flex0.relative.image
                    img.icon(src="{advancement.icon}" alt="{advancement.title}")
                  .flex2 {advancement.title}
      +if("subclasses")
        h3.left.mt-md Subclass
        IconSelect.icon-select(active="{subClassProp}" options="{filteredSubClassIndex}"  placeHolder="{subclassesPlaceholder}" handler="{selectSubClassHandler}" id="subClass-select" bind:value="{subclassValue}" truncateWidth="17" )
        +if("$characterSubClass")
          h3.left.mt-sm Description
          .left.sub-class(bind:innerHTML="{richSubClassHTML}" contenteditable)
        +if("subClassAdvancementArrayFiltered")
          h3.left.mt-sm {localize('GAS.Tabs.Classes.SubClass')} {localize('GAS.Advancements')} 
          ul.icon-list
            +each("subClassAdvancementArrayFiltered as advancement")
              //- @todo: this should be broken out into components for each advancement.type
              li.left
                .flexrow(data-tooltip="{advancement.configuration?.hint || ''}")
                  .flex0.relative.image
                    img.icon(src="{advancement.icon}" alt="{advancement.title}")
                  .flex2 {advancement.title}
    .flex0.border-right.right-border-gradient-mask 
    .flex3.left.pl-md.scroll.col-b(bind:innerHTML="{richHTML}" contenteditable)

</template>
  

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .content 
    @include staticOptions

  :global(.icon-select)
    position: relative
  
  .sub-class
    height: 100px
    overflow-y: auto
    padding: 0.5rem
    border: 1px solid transparent
    border-radius: 5px
    box-shadow: 0 0 5px rgba(0,0,0,0.3) inset
    font-size: smaller
</style>