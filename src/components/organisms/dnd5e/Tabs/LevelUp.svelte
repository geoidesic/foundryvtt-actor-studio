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
    activeClass,
    isMultiClass
  } from "~/src/helpers/store";
  import { localize } from "#runtime/svelte/helper";
  import { TJSSelect } from "@typhonjs-fvtt/svelte-standard/component";
  import DonationTracker from "~/src/plugins/donation-tracker"
  import LevelUpExisting from "~/src/components/organisms/dnd5e/Tabs/LevelUpExistingClassLeftCol.svelte";
  import LevelUpButtonInnards from "~/src/components/atoms/button/LevelUpButtonInnards.svelte";
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

  /** IMPORTERS */
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

  /** DECORATORS */
  function existingClassesCssClassForRow(classKey) {
    let css = getCharacterClass(classKey).uuid === $activeClass ? 'active' : ''
    if($isMultiClass) {
      css += ' gold-button-disabled'
    } else {
        css += ' gold-button'
    }
    return css
  }

  /** FILTERS */
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
 
  const getCharacterClass = (classKey) => {
    // log.d($actor._classes[classKey])
    return $actor._classes[classKey];
  }

  function getLevel(classKey) {
    const level = $newClassLevel ? $newClassLevel : getCharacterClass(classKey)?.system?.levels
    return level
  }

  /** EVENT HANDLERS */
  const selectClassHandler = async (option) => {
    // log.d('add multi class', option)
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

  const clickCancelMulticlass = async () => {
    $activeClass = false
    classValue = null
    activeSubClass = null
    activeClassKey = null
    $characterClass = false
  }

  async function clickAddLevel(classKey) {

    if ($isMultiClass) return;
    const isUnset = Boolean($activeClass) && Boolean($newClassLevel);
    if(isUnset) return;

    const uuid = getCharacterClass(classKey).uuid
    // log.d('add level for class: ', uuid)

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

  /** REACTIVE */

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
    // log.d("classKeys", classKeys);
    // log.d(typeof classKeys);
    // log.d(classKeys.length);
    // log.d(Array.isArray(classKeys.length));
    // log.d(getCharacterClass('fighter'))
    // log.d($characterClass)
  });



</script>

<template lang="pug">
  .content
    //- pre isMultiClass {$isMultiClass}
    //- pre activeClass {$activeClass}
    //- pre characterClass {$characterClass}
    //- pre newClassLevel {$newClassLevel}
    .flexrow
      .flex2.pr-sm.col-a
        h1.flex Existing Classes
        +each("classKeys as classKey, index")
          //- pre classKey {classKey}
          //- pre getCharacterClass(classKey) {getCharacterClass(classKey).system.img}
          //- pre getCharacterClass(classKey)?.system?.img {getCharacterClass(classKey)?.system?.img}
          +if("$activeClass && !$newClassLevel")
            .class-row(class="{existingClassesCssClassForRow(classKey)}")
              LevelUpButtonInnards(src="{getCharacterClass(classKey)?.img}" level="{classLevels[index]}" classKey="{classKey}")  
            +else()
              .class-row(class="{existingClassesCssClassForRow(classKey)}" role="button" aria-role="button" aria-label="{localize('GAS.LevelUp.Button')+' '+classKey}" data-tooltip="{localize('GAS.LevelUp.Button')+' '+classKey}" on:mousedown!="{clickAddLevel(classKey)}")
                LevelUpButtonInnards(src="{getCharacterClass(classKey)?.img}" level="{classLevels[index]}" classKey="{classKey}")  
        +if("!$newClassLevel") 
          h1.flexrow.mt-md
            .flex2.left Add Multiclass
            +if("classProp")
              .flex0
                button.pr-none.mt-sm.gold-button(type="button" role="button" on:mousedown="{clickCancelMulticlass}")
                  i(class="fas fa-times")
          IconSelect.icon-select( options="{filteredClassIndex}"  placeHolder="{classesPlaceholder}" handler="{selectClassHandler}" id="characterClass-select" bind:value="{classValue}" )
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


  .gold-button-disabled
    @include gold-button(null)
  .gold-button
    @include gold-button  

  .sub-class
    height: 100px
    overflow-y: auto
    padding: 0.5rem
    border: 1px solid transparent
    border-radius: 5px
    box-shadow: 0 0 5px rgba(0,0,0,0.3) inset
    font-size: smaller
</style>
