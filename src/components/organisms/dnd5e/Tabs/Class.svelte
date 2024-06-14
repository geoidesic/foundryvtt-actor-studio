<script>
  import SvelteSelect from "svelte-select";
  import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
  import {
    extractMapIteratorObjectProperties,
    extractItemsFromPacks,
    getFoldersFromMultiplePacks,
    addItemToCharacter,
    getPacksFromSettings,
    log,
    importComponent
  } from "~/src/helpers/Utility.js";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import {
    characterClass,
    characterSubClass,
    level,
    tabs,
  } from "~/src/helpers/store";
  import { localize } from "#runtime/svelte/helper";
  import { TJSSelect } from "@typhonjs-fvtt/svelte-standard/component";
  import DonationTracker from "~/src/plugins/donation-tracker"

  let richHTML = "",
    richSubClassHTML = "",
    activeClass = null,
    activeSubClass = null,
    classValue = null,
    subclassValue = null,
    subClassesIndex,
    subclasses,
    classesPlaceholder = "Classes",
    subclassesPlaceholder = "Subclasses",
    packs = getPacksFromSettings("classes"),
    subClassesPack = game.packs.get('dnd5e.subclasses'),
    subClassesPacks = getPacksFromSettings("subclasses"),
    // folders = getFoldersFromMultiplePacks(packs, 1),
    // folderIds = folders.map((x) => x._id),
    mappedClassIndex,
    filteredClassIndex
  ;


  const levelOptions = [];
  for (let i = 1; i <= 20; i++) {
    levelOptions.push({ label: "Level " + i, value: i });
  }

  const selectStyles = {
    // width: '50%',
    // display: 'inline-block',
    // fontSize: 'smaller',
  };

  const actor = getContext("#doc");

  const getFilteredSubclassIndex = async () => {
    const filteredSubClassIndex = [];
    for(let subClassesPack of subClassesPacks) {
      let index = await subClassesPack.getIndex({
        fields: ["system.classIdentifier"],
      });
      if(!subClassesPack) continue
      let mappedSubClassIndex =  extractMapIteratorObjectProperties(index.entries(), [
          "name->label",
          "img",
          "type",
          "folder",
          "uuid->value",
          "system",
          "_id",
        ])

      filteredSubClassIndex.push(mappedSubClassIndex?.filter(
        (x) => x.system.classIdentifier == $characterClass.system.identifier,
      ))
    }
    const output = filteredSubClassIndex.flat().sort((a, b) => a.label.localeCompare(b.label));
    return output
  };

  const selectClassHandler = async (option) => {
    activeSubClass = null;
    $characterSubClass = null;
    subclassValue = null;
    subClassAdvancementArrayFiltered = [];
    richSubClassHTML = "";
    $characterClass = await fromUuid(option);
    activeClass = option;
    subClassesIndex = await getFilteredSubclassIndex();
    await tick();
    richHTML = await TextEditor.enrichHTML(html);
  };

  const selectSubClassHandler = async (option) => {
    $characterSubClass = await fromUuid(option);
    activeSubClass = option;
    await tick();
    richSubClassHTML = await TextEditor.enrichHTML(
      $characterSubClass.system.description.value,
    );
  };

  const levelSelectHandler = async (option) => {};

  const importPath = "components/molecules/dnd5e/Advancements/";

  $: html = $characterClass?.system?.description.value || "";
  $: subClassProp = activeSubClass;
  $: classProp = activeClass;
  $: combinedHtml = richHTML + (richSubClassHTML ? '<h1>Subclass</h1>' + richSubClassHTML : '');

  $: if(subClassesIndex?.length) {
    subclasses = subClassesIndex.flat().sort((a, b) => a.label.localeCompare(b.label));
  } else {
    subclasses = [];
  }

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

  onMount(async () => {

    mappedClassIndex = extractItemsFromPacks(packs, [
      "name->label",
      "img",
      "type",
      "folder",
      "uuid->value",
      "_id",
    ]),
    filteredClassIndex = mappedClassIndex
      .filter((i) => {
        return DonationTracker.canViewItem(i)
      })
      .sort((a, b) => a.label.localeCompare(b.label));

      
    if ($characterClass) {
      classValue = $characterClass.uuid;
      richHTML = await TextEditor.enrichHTML(html);
      subClassesIndex = await getFilteredSubclassIndex();
    }
    if ($characterSubClass) {
      subclassValue = $characterSubClass.uuid;
      await tick();
      richSubClassHTML = await TextEditor.enrichHTML(
        $characterSubClass.system.description.value,
      );
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
            TJSSelect( options="{levelOptions}" store="{level}" on:change="{levelSelectHandler}" styles="{selectStyles}" )
        +if("classAdvancementArrayFiltered")
          h3.left.mt-sm.flexrow
            .flex {localize('GAS.Tabs.Classes.Class')} {localize('GAS.Advancements')}
            .flex0.div.badge.right.inset.ml-sm.mb-xs {localize('GAS.Level')} {$level}
          ul.icon-list
            +if("!classAdvancementArrayFiltered.length")
              li.left {localize('GAS.NoAdvancements')}
              +else()
                +each("classAdvancementArrayFiltered as advancement")
                  //- @todo: this should be broken out into components for each advancement.type
                  li.left(data-type="{advancement.type}")
                    .flexrow(data-tooltip="{advancement.configuration?.hint || null}" data-tooltip-class="gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip")
                      .flex0.relative.image
                        img.icon(src="{advancement.icon}" alt="{advancement.title}")
                      .flex2 {advancement.title}
                    +await("importComponent(importPath, advancement.type)")
                      +then("Component")
                        //- pre advancement {advancement.type}
                        svelte:component(this="{Component}" advancement="{advancement}")

      +if("subclasses.length")
        h3.left.mt-md Subclass
        IconSelect.icon-select(active="{subClassProp}" options="{subclasses}"  placeHolder="{subclassesPlaceholder}" handler="{selectSubClassHandler}" id="subClass-select" bind:value="{subclassValue}" truncateWidth="17" )
        +if("$characterSubClass")
          //- h3.left.mt-sm Description
          //- .left.sub-class(bind:innerHTML="{richSubClassHTML}" contenteditable)
          +if("subClassAdvancementArrayFiltered")
            h3.left.mt-sm.flexrow
              .flex {localize('GAS.Tabs.Classes.SubClass')} {localize('GAS.Advancements')}
              .flex0.div.badge.right.inset.ml-sm.mb-xs {localize('GAS.Level')} {$level}
            ul.icon-list
              +if("!subClassAdvancementArrayFiltered.length")
                li.left {localize('GAS.NoAdvancements')}
                +else()
                  +each("subClassAdvancementArrayFiltered as advancement")
                    //- @todo: this should be broken out into components for each advancement.type
                    li.left(data-type="{advancement.type}")
                      .flexrow(data-tooltip="{advancement.configuration?.hint || null}" data-tooltip-locked="true" data-tooltip-class="gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip" )
                        .flex0.relative.image
                          img.icon(src="{advancement.icon}" alt="{advancement.title}")
                        .flex2 {advancement.title}
                      
                      +await("importComponent(importPath, advancement.type)")
                        +then("Component")
                          //- pre advancement {advancement.type}
                          svelte:component(this="{Component}" advancement="{advancement}")

    .flex0.border-right.right-border-gradient-mask 
    .flex3.left.pl-md.scroll.col-b {@html combinedHtml}

</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .content 
    @include staticOptions
    .badge.inset
      @include badge()
      @include inset
      display: inline-block
      white-space: nowrap


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
