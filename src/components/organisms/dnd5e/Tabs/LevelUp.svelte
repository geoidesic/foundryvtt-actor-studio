<script>
  import SvelteSelect from "svelte-select";
  import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
  import {
    extractMapIteratorObjectProperties,
    extractItemsFromPacks,
    getFoldersFromMultiplePacks,
    getPacksFromSettings,
    ucfirst
  } from "~/src/helpers/Utility.js";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import {
    characterClass,
    characterSubClass,
    level,
    tabs,
    newClassLevel,
    activeClass
  } from "~/src/helpers/store";
  import { localize } from "#runtime/svelte/helper";
  import { TJSSelect } from "@typhonjs-fvtt/svelte-standard/component";
  import DonationTracker from "~/src/plugins/donation-tracker"
  import LevelUpExisting from "~/src/components/organisms/dnd5e/Tabs/LevelUpExistingClassLeftCol.svelte";
    import { log } from "../../../../helpers/Utility";

  let richHTML = "",
    richSubClassHTML = "",
    activeClassKey = null,
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
    mappedClassIndex = extractItemsFromPacks(packs, [
      "name->label",
      "img",
      "type",
      "folder",
      "uuid->value",
      "_id",
    ])
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

  const levelSelectHandler = async (option) => {
    subClassesIndex = await getFilteredSubclassIndex();
    await tick();
    importClassAdvancements();
    importSubClassAdvancements();
  };

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
    $activeClass = option;
    
    await tick();
    subClassesIndex = await getFilteredSubclassIndex();
    await tick();
    importClassAdvancements();
    richHTML = await TextEditor.enrichHTML(html);
  };

  const importClassAdvancements = async () => {
    for (const classAdvancement of classAdvancementArrayFiltered) {
      try {
        const module = await import(`~/src/components/molecules/dnd5e/Advancements/${classAdvancement.type}.svelte`);
        classAdvancementComponents[classAdvancement.type] = module.default;
      } catch (error) {
        log.e(`Failed to load component for ${classAdvancement.type}:`, error);
      }
    }
  };

  const selectSubClassHandler = async (option) => {
    $characterSubClass = await fromUuid(option);
    activeSubClass = option;
    await tick();
    importClassAdvancements()
    importSubClassAdvancements()
    richSubClassHTML = await TextEditor.enrichHTML(
      $characterSubClass.system.description.value,
    );
  };

  const importSubClassAdvancements = async () => {
    for (const subClassAdvancement of subClassAdvancementArrayFiltered) {
      try {
        const module = await import(`~/src/components/molecules/dnd5e/Advancements/${subClassAdvancement.type}.svelte`);
        await tick();
        subClassAdvancementComponents[subClassAdvancement.type] = module.default;
      } catch (error) {
        log.e(`Failed to load component for ${subClassAdvancement.type}:`, error);
      }
    }
  };

  const clickCancelMulticlass = async () => {
    $activeClass = null
    activeSubClass = null
  }

  $: html = $characterClass?.system?.description.value || "";
  $: subClassProp = activeSubClass;
  $: classProp = $activeClass;
  $: combinedHtml = richHTML + (richSubClassHTML ? `<h1>${localize('GAS.SubClass')}</h1>` + richSubClassHTML : '');
  $: classAdvancementComponents = {};
  $: subClassAdvancementComponents = {};

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

  $: classKeys = Object.keys($actor._classes);

  $: classLevels = classKeys.map((classKey) => {
    const classObj = $actor._classes[classKey]
    return classObj.uuid == $activeClass ? classObj.system.levels + 1 : classObj.system.levels;
  });

  $: activeClassObj = $actor._classes[activeClassKey];
  $: activeClassIndex = classKeys.indexOf(activeClassKey);
  $: activeClassLevel = classLevels[activeClassIndex];


  $: filteredClassIndex = mappedClassIndex
      .filter((i) => {
        return i.type == 'class' 
        && DonationTracker.canViewItem(i)
        //- @why: don't include classes that are already in the character
        && !classKeys.includes(i.label.toLowerCase())
      })
      .sort((a, b) => a.label.localeCompare(b.label))

  const getCharacterClass = (classKey) => {
    return $actor._classes[classKey];
  }

  async function clickAddLevel(classKey) {

    log.d(getCharacterClass(classKey).uuid)
    const uuid = getCharacterClass(classKey).uuid
    activeSubClass = null;
    $characterSubClass = null;
    subclassValue = null;
    subClassAdvancementArrayFiltered = [];
    richSubClassHTML = "";
    $characterClass = await fromUuid(uuid);
    $activeClass = uuid;
    activeClassKey = classKey
    newClassLevel.set($actor._classes[classKey]?.system?.levels + 1);
    
    await tick();
    subClassesIndex = await getFilteredSubclassIndex();
    await tick();
    importClassAdvancements();
    richHTML = await TextEditor.enrichHTML(html);

  }

  function getLevel(classKey) {
    const level = $newClassLevel ? $newClassLevel : getCharacterClass(classKey)?.system?.levels
    return level
  }

  onMount(async () => {
    if ($characterClass) {
      classValue = $characterClass.uuid;
      await tick();
      importClassAdvancements();
      richHTML = await TextEditor.enrichHTML(html);
      subClassesIndex = await getFilteredSubclassIndex();
    }
    if ($characterSubClass) {
      subclassValue = $characterSubClass.uuid;
      await tick();
      importSubClassAdvancements();
      richSubClassHTML = await TextEditor.enrichHTML(
        $characterSubClass.system.description.value,
      );
    }
    log.d("classKeys", classKeys);
    log.d(typeof classKeys);
    log.d(classKeys.length);
    log.d(Array.isArray(classKeys.length));
    log.d(getCharacterClass('fighter'))
    log.d($characterClass)
  });



</script>

<template lang="pug">
  .content
    .flexrow
      .flex2.pr-sm.col-a
        h1.flex Existing Classes
        +each("classKeys as classKey, index")
          .class-row.gold-button.flexrow(class="{getCharacterClass(classKey).uuid === $activeClass ? 'active' : ''}" role="button" aria-role="button" aria-label="{localize('GAS.LevelUp.Button')+' '+classKey}" data-tooltip="{localize('GAS.LevelUp.Button')+' '+classKey}" on:mousedown!="{clickAddLevel(classKey)}")
            .flex.icon
              img(height="40" src="{getCharacterClass(classKey)?.img}")
            .flex3.flexrow
              .flex3 {ucfirst(classKey)} 
              .flex0
                .lozenge {classLevels[index]} 
              .flex1.right.pr-md
                +if("!$activeClass")
                  i(class="fas fa-plus")
        //- h1.flexrow.mt-md
        //-   .flex2.left Add Multiclass
        //-   +if("classProp")
        //-     .flex0
        //-       button.mt-sm.gold-button(type="button" role="button" on:mousedown="{clickCancelMulticlass}")
        //-         i(class="fas fa-times")
        //- IconSelect.icon-select(bind:active="{$activeClass}" options="{filteredClassIndex}"  placeHolder="{classesPlaceholder}" handler="{selectClassHandler}" id="characterClass-select" bind:value="{classValue}" )
        +if("$characterClass")
          //- +if("subclasses.length")
          //-   h3.left.mt-md Subclass
          //-   IconSelect.icon-select(active="{subClassProp}" options="{subclasses}"  placeHolder="{subclassesPlaceholder}" handler="{selectSubClassHandler}" id="subClass-select" bind:value="{subclassValue}" truncateWidth="17" )
          //- h3.left.mt-sm {localize('GAS.Tabs.Classes.FilterByLevel')}
          +if("activeClassObj")
            h3 {activeClassObj.name} {levelOptions[1].label}
            //- .flexrow
            //-   .flex2.left
            //-     TJSSelect( options="{levelOptions}" store="{level}" on:change="{levelSelectHandler}" styles="{selectStyles}" )
            LevelUpExisting(classAdvancementArrayFiltered="{classAdvancementArrayFiltered}" level="{getLevel(activeClassKey)}")
        //- +if("subclasses.length")
        //-   +if("$characterSubClass")
        //-     //- h3.left.mt-sm Description
        //-     //- .left.sub-class(bind:innerHTML="{richSubClassHTML}" contenteditable)
        //-     +if("subClassAdvancementArrayFiltered")
        //-       h3.left.mt-sm.flexrow
        //-         .flex {localize('GAS.Tabs.Classes.SubClass')} {localize('GAS.Advancements')}
        //-         .flex0.div.badge.right.inset.ml-sm.mb-xs {localize('GAS.Level')} {$level}
        //-       ul.icon-list
        //-         +if("!subClassAdvancementArrayFiltered.length")
        //-           li.left {localize('GAS.NoAdvancements')}
        //-           +else()
        //-             +each("subClassAdvancementArrayFiltered as advancement")
        //-               //- @todo: this should be broken out into components for each advancement.type
        //-               li.left(data-type="{advancement.type}")
        //-                 .flexrow(data-tooltip="{advancement.configuration?.hint || null}" data-tooltip-locked="true" data-tooltip-class="gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip" )
        //-                   .flex0.relative.image
        //-                     img.icon(src="{advancement.icon}" alt="{advancement.title}")
        //-                   .flex2 {advancement.title}
        //-                 .flexrow
        //-                   svelte:component(this="{subClassAdvancementComponents[advancement.type]}" advancement="{advancement}")
  
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

  .class-row
    padding: 0
    justify-items: center
    align-items: center
  
  .lozenge
    background-color: var(--dnd5e-color-gold)
    color: #000
    border-radius: var(--border-radius)
    box-shadow: 0 0 6px var(--dnd5e-shadow-45)
    padding: 0 0.2rem
  
  .gold-button
    position: relative
    border: 3px solid transparent
    border-radius: var(--border-radius)
    background: var(--dnd5e-color-black)
    color: var(--dnd5e-color-gold)
    margin: 0 0 3px 0
    box-shadow: 0 0 6px var(--dnd5e-shadow-45)
    font-size: var(--font-size-14)
    line-height: normal
    overflow: hidden
    //- cursor:  cell
    cursor: pointer
    &.active .lozenge
      border: 3px solid var(-as-blue)
      background: var(--as-blue)
      color: #fff
  .icon
    min-width: 20px
  .sub-class
    height: 100px
    overflow-y: auto
    padding: 0.5rem
    border: 1px solid transparent
    border-radius: 5px
    box-shadow: 0 0 5px rgba(0,0,0,0.3) inset
    font-size: smaller
</style>
