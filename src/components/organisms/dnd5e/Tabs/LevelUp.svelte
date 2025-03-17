<script>
import { getContext, onMount, tick } from "svelte";
import { MODULE_ID } from "~/src/helpers/constants";
import { localize } from "#runtime/svelte/helper";

import { 
  levelUpSubClassObject,
  classUuidForLevelUp, 
  selectedMultiClassUUID,
  newLevelValueForExistingClass,
  levelUpClassObject,
  resetLevelUpStores,
  isLevelUp
} from "~/src/stores";

import {
  extractItemsFromPacksSync,
  extractMapIteratorObjectProperties,
  getPacksFromSettings,
  getSubclassLevel,
  illuminatedDescription
} from "~/src/helpers/Utility.js";

import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
import ClassLevelRow from "~/src/plugins/level-up/ClassLevelRow.svelte";
import LeftColDetails from "~/src/plugins/level-up/LevelUpExistingClassLeftCol.svelte";

/** LOCAL VARIABLES */
let 
  classValue = null,
  activeSubClassUUID = null,
  selectedMultiClassUUIDKey = null, //- tracks which class key (i.e. which existing class row) was selected
  subclassValue = null,
  subClassesIndex = [],
  classAdvancementArrayFiltered = [],
  subClassAdvancementArrayFiltered = [],
  classesPlaceholder = "Select Multiclass",
  richHTML = "",
  rowTooltip = "",
  richSubClassHTML = "",
  packs = getPacksFromSettings("classes"),
  subclasses,
  subClassesPacks = getPacksFromSettings("subclasses"),
  subclassesPlaceholder = "Subclasses",
  activeRowClassKey = null,
  mappedClassIndex = extractItemsFromPacksSync(packs, [
    "name->label",
    "img",
    "type",
    "folder",
    "uuid->value",
    "_id",
  ])
;

/** CONTEXT VARIABLES */
const actor = getContext("#doc");

/** DECORATORS */
const decorators = {
  existingClassesCssClassForRow(classKey) {
    let css = getters.getCharacterClass(classKey).uuid === $selectedMultiClassUUID ? 'active' : ''
    if(isNewMultiClassSelected) {
      css += ' gold-button-disabled'
    } else {
        css += ' gold-button'
    }
    return css
  }
}

/** FILTERS*/
const filters = {
  getFilteredSubclassIndex: async () => {
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
        (x) => x.system.classIdentifier == $levelUpClassObject.system.identifier,
      ))
    }
    const output = filteredSubClassIndex.flat().sort((a, b) => a.label.localeCompare(b.label));
    return output
  }
}

/** GETTERS */
const getters = {
  /**
   * Retrieves class data for a specific class from the actor's classes
   * @param {string} classKey - The key identifier for the character class
   * @returns {Object} The class data object from the actor
   */
  getCharacterClass(classKey) {
    return $actor._classes[classKey];
  },
  /**
   * Checks if a class row is active based on the selected class
   * @param {string} classKey - The key identifier for the character class
   * @returns {boolean} True if the class row is active, false otherwise
   */
  isRowActive(classKey) {
  //   window.GAS.log.d('classKey', classKey)
  //   window.GAS.log.d('$classUuidForLevelUp', $classUuidForLevelUp)
    if(!$classUuidForLevelUp) return false;
  //   window.GAS.log.d('classKey', classKey)
  //   window.GAS.log.d('$levelUpClassObject.name.toLowerCase()', $levelUpClassObject.name.toLowerCase())
    return classKey === $levelUpClassObject.name.toLowerCase()
  },
  rowTooltip(classKey) {
    // Check if the class row is active
    if ($classUuidForLevelUp && classKey === $levelUpClassObject.name.toLowerCase()) {
      return 'Cancel'; // Return "Cancel" if the row is active
    }
    return localize('GAS.LevelUp.Button') + ' ' + classKey; // Default tooltip
  }
}

/** IMPORTERS */
const importers = {
  async importClassAdvancements() {
    if (!classAdvancementArrayFiltered?.length) return;
    for (const classAdvancement of classAdvancementArrayFiltered) {
      try {
        const module = await import(`~/src/components/molecules/dnd5e/Advancements/${classAdvancement.type}.svelte`);
        classAdvancementComponents[classAdvancement.type] = module.default;
      } catch (error) {
        window.GAS.log.e(`Failed to load component for ${classAdvancement.type}:`, error);
      }
    }
  },
  async importSubClassAdvancements() {
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
  },
}

/** EVENT HANDLERS */
const eventHandlers = {
  /**
   * Handles adding a level to an existing class
   * Updates state and loads relevant class advancements
   * @param {string} classKey - The key identifier for the character class
   */
  clickAddLevel: async (classKey) => {
    if (isNewMultiClassSelected) return;
    const isUnset = Boolean($selectedMultiClassUUID) && Boolean($newLevelValueForExistingClass);
    if(isUnset) return;

    $levelUpClassObject = getters.getCharacterClass(classKey)
    window.GAS.log.d('classKey', classKey)
    window.GAS.log.d('$levelUpClassObject', $levelUpClassObject)
    $classUuidForLevelUp = $levelUpClassObject.uuid
    activeSubClassUUID = null;
    $levelUpSubClassObject = null;
    subclassValue = null;
    subClassAdvancementArrayFiltered = [];
    richSubClassHTML = "";
    $selectedMultiClassUUID = false
    activeRowClassKey = classKey;
    /**
     * Updates the newLevelValueForExistingClass store with the next level for this class
     * Calculates new level by adding 1 to the character's current level in this class
     * Example: If a Fighter is level 3, this sets newLevelValueForExistingClass to 4
     */
    $newLevelValueForExistingClass = $levelUpClassObject?.system?.levels + 1
    
    await tick();
    subClassesIndex = await filters.getFilteredSubclassIndex();
    await tick();
    importers.importClassAdvancements();
    richHTML = await illuminatedDescription(html, $levelUpClassObject);
  },
  /**
   * Handles cancellation of multiclass selection
   * Resets all class and subclass related state
   */
  clickCancel: async () => {
    $selectedMultiClassUUID = false
    classValue = null
    activeSubClassUUID = null
    selectedMultiClassUUIDKey = null
    $classUuidForLevelUp = false
    newLevelValueForExistingClass.set(false)
    activeRowClassKey = null;
  },
  /**
   * Click will either add a level to the clicked class or cancel the level up selection
   * @param classKey
   */
  handleRowActivation: (classKey) => {
    return () => {
      const nameOfClickedClass = getters.getCharacterClass(classKey).name;
      const isMultiClassMode = $classUuidForLevelUp && nameOfClickedClass == $levelUpClassObject.name;

      if(isMultiClassMode) {
        eventHandlers.clickCancel();
      } else {
        eventHandlers.clickAddLevel(classKey);
      }
    };
  },
  handleRowDeactivation: (classKey) => {
    return () => {
      eventHandlers.clickCancel();
    };
  },
  /**
   * Handles the selection of a new class for multiclassing
   * Resets subclass state and updates available options
   * @param {string} option - The UUID of the selected class
   */
  selectClassHandler: async (option) => {
    activeSubClassUUID = null;
    $levelUpSubClassObject = null;
    subclassValue = null;
    richSubClassHTML = "";
    
    $levelUpClassObject = await fromUuid(option);
    $selectedMultiClassUUID = option;
    $classUuidForLevelUp = option;
    activeRowClassKey = null;
    
    await tick();
    subClassesIndex = await filters.getFilteredSubclassIndex();
    await tick();
    importers.importClassAdvancements();
    richHTML = await illuminatedDescription(html, $levelUpClassObject);
  },
  /**
   * Handles the selection of a subclass
   * Updates state and loads relevant subclass advancements
   * @param {string} option - The UUID of the selected subclass
   */
  selectSubClassHandler: async (option) => {
    activeSubClassUUID = option.value ?? option ?? null;
    $levelUpSubClassObject = await fromUuid(activeSubClassUUID);
    subclassValue = activeSubClassUUID;
    window.GAS.log.d('activeSubClassUUID', activeSubClassUUID)
    await tick();
    importers.importSubClassAdvancements();
    richSubClassHTML = await illuminatedDescription(
      $levelUpSubClassObject?.system?.description?.value,
      $levelUpSubClassObject
    );
  }
}

/** REACTIVE VARIABLES */
$: classAdvancementComponents = {};
$: subClassAdvancementComponents = {};
$: subClassProp = activeSubClassUUID;
$: classProp = $selectedMultiClassUUID;
$: classKeys = Object.keys($actor._classes);
$: html = $levelUpClassObject?.system?.description.value || "";
$: subClassLevel = $classUuidForLevelUp ? getSubclassLevel($levelUpClassObject, MODULE_ID) : false; //- Update subclass detection to match Class.svelte implementation
$: classGetsSubclassThisLevel = subClassLevel && subClassLevel === $newLevelValueForExistingClass;
$: isNewMultiClassSelected = $classUuidForLevelUp && !$newLevelValueForExistingClass && $selectedMultiClassUUID; //- Local derived store to correctly determine multiclass mode
$: combinedHtml = $classUuidForLevelUp ? richHTML + (richSubClassHTML ? `<h1>${localize('GAS.SubClass')}</h1>` + richSubClassHTML : '') : '';
// Reactive variable for tooltip
$: tooltipText = (classKey) => {
  return $classUuidForLevelUp && classKey === $levelUpClassObject.name.toLowerCase() ? 'Cancel' : localize('GAS.LevelUp.Button') + ' ' + classKey;
}

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
/**
 * Tracks existing class data and levels
 * Updates when classes or active class changes
 */
  $: existingCLassLevels = classKeys.map((classKey, index) => {
    const classObj = $actor._classes[classKey]
    window.GAS.log.d('classObj_' + index, classObj)
    window.GAS.log.d('classObj.system.levels', classObj.system.levels)
    return classObj.system.levels;
  });
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
   $: if ($levelUpClassObject?.system?.advancement.length) {
    classAdvancementArrayFiltered = $levelUpClassObject?.advancement?.byLevel[$newLevelValueForExistingClass]
  } else {
    classAdvancementArrayFiltered = [];
  }

$: window.GAS.log.d('$classUuidForLevelUp', $classUuidForLevelUp)

onMount(async () => {
  resetLevelUpStores();
  console.log('levelup', $classUuidForLevelUp);
});
</script>
<template lang="pug">
.content
  .flexrow
    .flex2.pr-sm.col-a
      +if("!$selectedMultiClassUUID")
        h1.flex {localize('GAS.LevelUp.ExistingClassesTitle')}
        +if("$classUuidForLevelUp")
          p.left {localize('GAS.LevelUp.CancelDescription')}
          +else 
            p.left {localize('GAS.LevelUp.ExistingClassesDescription')}
        +each("classKeys as classKey, index")
          +if("activeRowClassKey == classKey")
            // Active row with "Cancel" tooltip
            ClassLevelRow(
              cssClasses="{decorators.existingClassesCssClassForRow(classKey)}"
              eventHandler!="{eventHandlers.handleRowDeactivation(classKey)}"
              imgSrc="{getters.getCharacterClass(classKey)?.img}"
              oldLevel="{existingCLassLevels[index]}"
              classKey="{classKey}"
              iconClass="fas fa-times"
              newLevel="{$newLevelValueForExistingClass}"
            )
            +else
              // Inactive row with default tooltip
              +if("!$classUuidForLevelUp")
                ClassLevelRow(
                  imgSrc="{getters.getCharacterClass(classKey)?.img}"
                  cssClasses="{decorators.existingClassesCssClassForRow(classKey)}"
                  eventHandler!="{eventHandlers.handleRowActivation(classKey)}"
                  oldLevel="{existingCLassLevels[index]}"
                  classKey="{classKey}"
                  tooltip="{getters.rowTooltip(classKey)}"
                  iconClass="{$classUuidForLevelUp ? '' : 'fas fa-plus'}"
                )

      +if("!$newLevelValueForExistingClass") 
        h1.flexrow.mt-md
          .flex2.left {localize('GAS.LevelUp.NewClassTitle')}
          +if("$selectedMultiClassUUID")
            .flex0
              button.mt-sm.gold-button(style="padding-right: 2px" type="button" role="button" on:mousedown="{eventHandlers.clickCancel}")
                i(class="fas fa-times")
        IconSelect.icon-select( options="{filteredClassIndex}" data-tooltip="{localize('GAS.LevelUp.SelectClass')}" placeHolder="{classesPlaceholder}" handler="{eventHandlers.selectClassHandler}" id="characterClass-select" bind:value="{$selectedMultiClassUUID}" )

      +if("$classUuidForLevelUp")
        h2.flexrow.mt-md {localize('GAS.LevelUp.LevelAdvancements')}
        LeftColDetails(classAdvancementArrayFiltered="{classAdvancementArrayFiltered}" level="{$newLevelValueForExistingClass}" )
        //- pre subclasses {subclasses.length}
        //- pre newLevelValueForExistingClass {$newLevelValueForExistingClass}
        //- pre subClassLevel {subClassLevel}
        //- pre classGetsSubclassThisLevel {classGetsSubclassThisLevel}
        +if("!!subclasses.length && classGetsSubclassThisLevel")
          +if("window.GAS.dnd5eVersion < 4 || window.GAS.dnd5eRules == '2014'")
            ul.icon-list
              li.left
                .flexrow
                  .flex0.relative.image
                    img.icon(src="{`modules/${MODULE_ID}/assets/dnd5e/3.x/subclass.svg`}" alt="Subclass")
                  .flex2 {localize('GAS.SubClass')}
                
          h3.left.mt-md Subclass
          IconSelect.icon-select(active="{subClassProp}" options="{subclasses}"  placeHolder="{subclassesPlaceholder}" handler="{eventHandlers.selectSubClassHandler}" id="subClass-select" bind:value="{subclassValue}" truncateWidth="17" )
      
    .flex0.border-right.right-border-gradient-mask 
    .flex3.left.pl-md.scroll.col-b 
      //- pre isLevelUp: {$isLevelUp}
      +if("$classUuidForLevelUp")
        h1 {$levelUpClassObject.name || ''}
      | {@html combinedHtml}
</template>
<style lang="sass">
  @use "../../../../../styles/Mixins.scss" as mixins

  :global(.icon-select)
    position: relative

  .gold-button-disabled
    +mixins.gold-button(null)
  .gold-button
    +mixins.gold-button  

  .content 
    +mixins.staticOptions
    .badge.inset
      +mixins.badge
      +mixins.inset
      display: inline-block
      white-space: nowrap

    .col-a
      max-width: 325px
</style>