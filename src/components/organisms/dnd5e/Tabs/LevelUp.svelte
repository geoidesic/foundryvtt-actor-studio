<script>
import { getContext, onMount, tick } from "svelte";
import { 
  characterClass, 
  characterSubClass,
  classUuidForLevelUp, 
  selectedMultiClass 
} from "~/src/stores";
import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
import {
  extractItemsFromPacksSync,
  extractMapIteratorObjectProperties,
  // getFoldersFromMultiplePacks,
  getPacksFromSettings,
  // ucfirst,
  // getSubclassLevel
  } from "~/src/helpers/Utility.js";
/** LOCAL VARIABLES */
let multiclassValue = null,
  activeSubClassUUID = null,
  subclassValue = null,
  subClassesIndex = [],
  classAdvancementArrayFiltered = [],
  classesPlaceholder = "Classes",
  richHTML = "",
  richSubClassHTML = "",
  packs = getPacksFromSettings("classes"),
  subClassesPacks = getPacksFromSettings("subclasses"),
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
        (x) => x.system.classIdentifier == $characterClass.system.identifier,
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
  }
}

/** EVENT HANDLERS */
const eventHandlers = {
  /**
   * Click will either add a level to the clicked class or cancel the level up selection
   * @param classKey
   */
  handleExistingClassClick(classKey) {
    const nameOfClickedClass = getters.getCharacterClass(classKey).name;
    const isMultiClassMode = !classUuidForLevelUp && nameOfClickedClass == $characterClass.name;


    if(isMultiClassMode) {
      eventHandlers.clickCancelMulticlass();
    } else {
      eventHandlers.clickAddLevel(classKey);
    }
  },
    /**
   * Handles the selection of a new class for multiclassing
   * Resets subclass state and updates available options
   * @param {string} option - The UUID of the selected class
   */
   async selectClassHandler(option) {
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
    $classUuidForLevelUp = option;
    
    await tick();
    subClassesIndex = await filters.getFilteredSubclassIndex();
    await tick();
    importers.importClassAdvancements();
    richHTML = await TextEditor.enrichHTML(html);
  }
}

/** REACTIVE VARIABLES */
$: html = $characterClass?.system?.description.value || "";
$: classKeys = Object.keys($actor._classes);
$: classAdvancementComponents = {};
$: subClassAdvancementComponents = {};

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


onMount(async () => {
  console.log('levelup', $characterClass);
});
</script>
<template lang="pug">
pre characterClass {Object.keys($characterClass)}
pre selectedMultiClass {$selectedMultiClass}
IconSelect.icon-select( options="{filteredClassIndex}" placeHolder="{classesPlaceholder}" handler="{eventHandlers.selectClassHandler}" id="characterClass-select" bind:value="{multiclassValue}" )

</template>
<style lang="sass">
</style>