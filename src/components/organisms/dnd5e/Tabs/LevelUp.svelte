<script>
  import SvelteSelect from "svelte-select";
  import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
  import {
    extractMapIteratorObjectProperties,
    extractItemsFromPacksSync,
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
    selectedMultiClass,
    isNewMultiClass
  } from "~/src/stores/index";
  import { localize } from "#runtime/svelte/helper";
  import { TJSSelect } from "@typhonjs-fvtt/svelte-standard/component";
  import DonationTracker from "~/src/plugins/donation-tracker"
  import LevelUpExisting from "~/src/components/organisms/dnd5e/Tabs/LevelUpExistingClassLeftCol.svelte";
  import LevelUpButtonInnards from "~/src/components/atoms/button/LevelUpButtonInnards.svelte";
  import { MODULE_ID } from "~/src/helpers/constants";
  import StartingEquipment from "~/src/components/molecules/dnd5e/StartingEquipment.svelte";
  import StartingGold from "~/src/components/molecules/dnd5e/StartingGold.svelte";

  let richHTML = "",
    richSubClassHTML = "",
    selectedMultiClassKey = null,
    activeSubClassUUID = null,
    classValue = null,
    multiclassValue = null,
    subclassValue = null,
    subClassesIndex,
    subclasses,
    classesPlaceholder = "Classes",
    subclassesPlaceholder = "Subclasses",
    packs = getPacksFromSettings("classes"),
    subClassesPack = game.packs.get('dnd5e.subclasses'),
    subClassesPacks = getPacksFromSettings("subclasses"),
    classAdvancementArrayFiltered = [],
    subClassAdvancementArrayFiltered = [],
    mappedClassIndex = extractItemsFromPacksSync(packs, [
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

  window.GAS.log.d('$characterClass', $characterClass)

  const selectStyles = {
    // width: '50%',
    // display: 'inline-block',
    // fontSize: 'smaller',
  };

  const actor = getContext("#doc");

  /** IMPORTERS */
  const importClassAdvancements = async () => {
    if (!classAdvancementArrayFiltered?.length) return;
    for (const classAdvancement of classAdvancementArrayFiltered) {
      try {
        const module = await import(`~/src/components/molecules/dnd5e/Advancements/${classAdvancement.type}.svelte`);
        classAdvancementComponents[classAdvancement.type] = module.default;
      } catch (error) {
        window.GAS.log.e(`Failed to load component for ${classAdvancement.type}:`, error);
      }
    }
  };

  const importSubClassAdvancements = async () => {
    if (!subClassAdvancementArrayFiltered?.length) return;
    for (const subClassAdvancement of subClassAdvancementArrayFiltered) {
      try {
        const module = await import(`~/src/components/molecules/dnd5e/Advancements/${subClassAdvancement.type}.svelte`);
        await tick();
        subClassAdvancementComponents[subClassAdvancement.type] = module.default;
      } catch (error) {
        window.GAS.log.e(`Failed to load component for ${subClassAdvancement.type}:`, error);
      }
    }
  };

  /** DECORATORS */
  function existingClassesCssClassForRow(classKey) {
    let css = getCharacterClass(classKey).uuid === $selectedMultiClass ? 'active' : ''
    if(isInMulticlassMode) {
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

  /** GETTERS */
  /**
   * Retrieves class data for a specific class from the actor's classes
   * @param {string} classKey - The key identifier for the character class
   * @returns {Object} The class data object from the actor
   */
  const getCharacterClass = (classKey) => {
    return $actor._classes[classKey];
  }

  /**
   * Gets the current or new level for a specific class
   * @param {string} classKey - The key identifier for the character class
   * @returns {number} The current or new level value
   */
  function getClassCurrentLevel(classKey) {
    const level = getCharacterClass(classKey)?.system?.levels
    return level
  }

  /** EVENT HANDLERS */
  /**
   * Handles the selection of a new class for multiclassing
   * Resets subclass state and updates available options
   * @param {string} option - The UUID of the selected class
   */
  const selectClassHandler = async (option) => {
    activeSubClassUUID = null;
    $characterSubClass = null;
    subclassValue = null;
    richSubClassHTML = "";
    
    // Store the multiclass value separately
    multiclassValue = option;
    
    // Load the class data for UI display
    const newClass = await fromUuid(option);
    $characterClass = newClass;
    $selectedMultiClass = option;
    
    await tick();
    subClassesIndex = await getFilteredSubclassIndex();
    await tick();
    importClassAdvancements();
    richHTML = await TextEditor.enrichHTML(html);
  };

  async function selectSubClassHandler(option) {
    activeSubClassUUID = option.value ?? option ?? null;
    $characterSubClass = await fromUuid(activeSubClassUUID);
    subclassValue = activeSubClassUUID;
    window.GAS.log.d('activeSubClassUUID', activeSubClassUUID)
    await tick();
    importSubClassAdvancements();
    richSubClassHTML = await TextEditor.enrichHTML(
      $characterSubClass?.system?.description?.value,
    );
  }

  function handleExistingClassClick(classKey) {
    const isActive = getCharacterClass(classKey).name == $characterClass.name;
    if(isActive) {
      clickCancelMulticlass();
    } else {
      clickAddLevel(classKey);
    }
  }

  function isRowActive(classKey) {
    window.GAS.log.d('isRowActive', $characterClass.name, getCharacterClass(classKey).name)
    return $characterClass.name && getCharacterClass(classKey).name == $characterClass.name
  }

  /**
   * Handles cancellation of multiclass selection
   * Resets all class and subclass related state
   */
  const clickCancelMulticlass = async () => {
    $selectedMultiClass = false
    classValue = null
    multiclassValue = null
    activeSubClassUUID = null
    selectedMultiClassKey = null
    $characterClass = false
    newClassLevel.set(false)
  }


  /**
   * Handles adding a level to an existing class
   * Updates state and loads relevant class advancements
   * @param {string} classKey - The key identifier for the character class
   */
  async function clickAddLevel(classKey) {
    if (isInMulticlassMode) return;
    const isUnset = Boolean($selectedMultiClass) && Boolean($newClassLevel);
    if(isUnset) return;

    const classObj = getCharacterClass(classKey)

    const uuid = classObj.uuid

    activeSubClassUUID = null;
    $characterSubClass = null;
    subclassValue = null;
    subClassAdvancementArrayFiltered = [];
    richSubClassHTML = "";
    $characterClass = await fromUuid(uuid);
    $selectedMultiClass = uuid;
    selectedMultiClassKey = classKey
    
    /**
     * Updates the newClassLevel store with the next level for this class
     * Calculates new level by adding 1 to the character's current level in this class
     * Example: If a Fighter is level 3, this sets newClassLevel to 4
     */
    newClassLevel.set(classObj?.system?.levels + 1);
    
    await tick();
    subClassesIndex = await getFilteredSubclassIndex();
    await tick();
    importClassAdvancements();
    richHTML = await TextEditor.enrichHTML(html);
  }

  /** REACTIVE DECLARATIONS */
  /**
   * Reactive declarations for managing component state and UI updates
   * These automatically recompute when their dependencies change
   */
  $: html = $characterClass?.system?.description.value || "";
  $: subClassProp = activeSubClassUUID;
  $: classProp = $selectedMultiClass;
  $: combinedHtml = $characterClass ? richHTML + (richSubClassHTML ? `<h1>${localize('GAS.SubClass')}</h1>` + richSubClassHTML : '') : '';
  $: classAdvancementComponents = {};
  $: subClassAdvancementComponents = {};

  /**
   * Manages subclass list state
   * Flattens and sorts subclass data when subClassesIndex changes
   */
  $: if(subClassesIndex?.length) {
    subclasses = subClassesIndex.flat().sort((a, b) => a.label.localeCompare(b.label));
  } else {
    subclasses = [];
  }



  /**
   * Filters class advancements for the current level
   * Maps advancement data to include IDs for component rendering
   */
   $: if ($characterClass?.system?.advancement.length) {
    classAdvancementArrayFiltered = $characterClass?.advancement?.byLevel[$newClassLevel]
  } else {
    classAdvancementArrayFiltered = [];
  }
  /**
   * Filters subclass advancements for the current level
   * Maps advancement data to include IDs for component rendering
   */
  $: if ($characterSubClass?.system?.advancement.length) {
    // window.GAS.log.d('characterSubClass', $characterSubClass)
    subClassAdvancementArrayFiltered =
      $characterSubClass.advancement?.byLevel[$newClassLevel]
  } else {
    subClassAdvancementArrayFiltered = [];
  }


  /**
   * Tracks existing class data and levels
   * Updates when classes or active class changes
   */
  $: classKeys = Object.keys($actor._classes);
  $: classLevels = classKeys.map((classKey) => {
    const classObj = $actor._classes[classKey]
    return classObj.uuid == $selectedMultiClass ? classObj.system.levels + 1 : classObj.system.levels;
  });

  $: selectedMultiClassObj = $actor._classes[selectedMultiClassKey];
  $: selectedMultiClassIndex = classKeys.indexOf(selectedMultiClassKey);
  $: selectedMultiClassLevel = classLevels[selectedMultiClassIndex];

  $: subClassLevel = $characterClass.getFlag ? $characterClass.getFlag(MODULE_ID, "subclassLevel") : false;
  $: classGetsSubclassThisLevel = subClassLevel && subClassLevel === $level;


  $: window.GAS.log.d('$characterClass', $characterClass)

  /**
   * Filters available classes for multiclassing
   * Excludes classes the character already has and sorts alphabetically
   */
  $: filteredClassIndex = mappedClassIndex
      .filter((i) => {
        // First check if it's a class type
        if (i.type !== 'class') return false;
        
        // Then check if the class is already in the character's classes
        // Compare by name (case-insensitive)
        const classNameLower = i.label.toLowerCase();
        return !classKeys.some(key => key.toLowerCase() === classNameLower);
      })
      .sort((a, b) => a.label.localeCompare(b.label))

  // Local derived store to correctly determine multiclass mode
  $: isInMulticlassMode = $characterClass && !$newClassLevel && multiclassValue;
  
  // Use this in the template instead of $isNewMultiClass where appropriate
  $: {
    console.log('Current character class:', $characterClass);
    console.log('Current character subclass:', $characterSubClass);
    console.log('Multiclass value:', multiclassValue);
    console.log('Class value:', classValue);
    console.log('Active class:', $selectedMultiClass);
    console.log('Is multiclass mode:', $isNewMultiClass);
    console.log('Is in multiclass mode (local):', isInMulticlassMode);
  }

  // Ensure that the character class is set before accessing its properties
  $: if ($characterClass) {
    subClassLevel = $characterClass.getFlag(MODULE_ID, "subclassLevel");
  } else {
    console.warn('Character class is not set, cannot access getFlag');
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
        $characterSubClass?.system?.description?.value,
      );
    }
    // window.GAS.log.d("classKeys", classKeys);
    // window.GAS.log.d(typeof classKeys);
    // window.GAS.log.d(classKeys.length);
    // window.GAS.log.d(Array.isArray(classKeys.length));
    // window.GAS.log.d(getCharacterClass('fighter'))
    // window.GAS.log.d($characterClass)
  });



</script>

<template lang="pug">
  .content
    //- pre isNewMultiClass {$isNewMultiClass}
    //- pre selectedMultiClass {$selectedMultiClass}
    //- pre characterClass {$characterClass}
    //- pre newClassLevel {$newClassLevel}
    .flexrow
      .flex2.pr-sm.col-a
        h1.flex Existing Classes
        +each("classKeys as classKey, index")
          //- pre {$actor._classes[classKey]?.system?.levels}
          //- pre classKey {classKey}
          //- pre getCharacterClass(classKey) {getCharacterClass(classKey).system.img}
          //- pre getCharacterClass(classKey)?.system?.img {getCharacterClass(classKey)?.system?.img}
          
          .class-row(class="{existingClassesCssClassForRow(classKey)}" role="button" aria-role="button" aria-label="{localize('GAS.LevelUp.Button')+' '+classKey}" data-tooltip="{localize('GAS.LevelUp.Button')+' '+classKey}" on:mousedown!="{handleExistingClassClick(classKey)}")
            LevelUpButtonInnards(src="{getCharacterClass(classKey)?.img}" level="{classLevels[index]}" classKey="{classKey}" iconClass="{isRowActive(classKey) ? 'fas fa-times' : $characterClass ? '' : 'fas fa-plus'}")  
        +if("!$newClassLevel") 
          h1.flexrow.mt-md
            .flex2.left Add Multiclass
            +if("classProp")
              .flex0
                button.mt-sm.gold-button(style="padding-right: 2px" type="button" role="button" on:mousedown="{clickCancelMulticlass}")
                  i(class="fas fa-times")
          IconSelect.icon-select( options="{filteredClassIndex}" placeHolder="{classesPlaceholder}" handler="{selectClassHandler}" id="characterClass-select" bind:value="{multiclassValue}" )
          
          +if("isInMulticlassMode")
            .info-text.mt-sm
              i.fas.fa-info-circle.mr-xs
              span {localize('GAS.MulticlassMode')}
        
        +if("$characterClass")
          +if("selectedMultiClassObj")
            h3.left.mt-md Advancements
            LevelUpExisting(classAdvancementArrayFiltered="{classAdvancementArrayFiltered}" level="{$newClassLevel}")
            
            //@deprecated Add the StartingEquipment component here - only used for Character level 1
            //- +if("$characterClass?.system?.startingEquipment?.length")
            //-   StartingEquipment(startingEquipment="{$characterClass.system.startingEquipment}")
            //-   StartingGold(characterClass="{$characterClass}")
          +if("subclasses.length && classGetsSubclassThisLevel")
            ul.icon-list
              li.left 
                .flexrow
                  .flex0.relative.image
                    img.icon(src="{`modules/${MODULE_ID}/assets/dnd5e/3.x/subclass.svg`}" alt="Subclass")
                  .flex2 {localize('GAS.SubClass')}
                  
            h3.left.mt-md Subclass
            IconSelect.icon-select(active="{subClassProp}" options="{subclasses}"  placeHolder="{subclassesPlaceholder}" handler="{selectSubClassHandler}" id="subClass-select" bind:value="{subclassValue}" truncateWidth="17" )
        
        +if("subclasses.length")
          +if("$characterSubClass && $characterClass")
            //- h3.left.mt-sm Description
            //- .left.sub-class(bind:innerHTML="{richSubClassHTML}" contenteditable)
            +if("subClassAdvancementArrayFiltered")
              h3.left.mt-sm.flexrow
                .flex {localize('GAS.Tabs.Classes.SubClass')} {localize('GAS.Advancements')}
                .flex0.div.badge.right.inset.ml-sm.mb-xs {localize('GAS.Level')} {$newClassLevel}
              ul.icon-list
                +if("!subClassAdvancementArrayFiltered.length && !classGetsSubclassThisLevel")
                  li.left {localize('GAS.NoAdvancements')}
                  +else()
                    +each("subClassAdvancementArrayFiltered as advancement")
                      //- @todo: this should be broken out into components for each advancement.type
                      li.left(data-type="{advancement.type}")
                        .flexrow(data-tooltip="{advancement.configuration?.hint || null}" data-tooltip-locked="true" data-tooltip-class="gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip" )
                          .flex0.relative.image
                            img.icon(src="{advancement.icon}" alt="{advancement.title}")
                          .flex2 {advancement.title}
                        .flexrow
                          svelte:component(this="{subClassAdvancementComponents[advancement.type]}" advancement="{advancement}")
  
      .flex0.border-right.right-border-gradient-mask 
      .flex3.left.pl-md.scroll.col-b 
        +if("$characterClass")
          h1 {$characterClass.name || ''}
        | {@html combinedHtml}
  
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
    
  .info-text
    font-size: 0.85rem
    color: var(--color-text-dark-secondary)
    font-style: italic
    
    i
      color: var(--color-text-hyperlink)

</style>
