<script>
  import { getContext, createEventDispatcher } from "svelte";
  
  export let abilities = {};
  export let readonly = false;
  export let proficiencyBonus = 2; // Default to +2
  export let includeRollButtons = false;
  
  const actor = getContext("#doc");
  const dispatch = createEventDispatcher();
  
  // Available ability scores for saving throws
  const availableAbilities = [
    { key: 'str', label: 'Strength', abbr: 'STR' },
    { key: 'dex', label: 'Dexterity', abbr: 'DEX' },
    { key: 'con', label: 'Constitution', abbr: 'CON' },
    { key: 'int', label: 'Intelligence', abbr: 'INT' },
    { key: 'wis', label: 'Wisdom', abbr: 'WIS' },
    { key: 'cha', label: 'Charisma', abbr: 'CHA' }
  ];
  
  // Helper function to calculate ability modifier
  function abilityMod(score) {
    return Math.floor((score - 10) / 2);
  }
  
  // Helper function to calculate proficiency bonus based on CR
  function getProficiencyBonus() {
    return proficiencyBonus;
  }
  
  // Get current saving throw proficiencies
  $: currentSavingThrows = (() => {
    if (!abilities) return [];
    
    const result = [];
    const pb = getProficiencyBonus();
    
    availableAbilities.forEach(ability => {
      const abilityData = abilities[ability.key];
      if (abilityData && abilityData.proficient) {
        const abilityScore = abilityData.value || 10;
        const abilityModifier = abilityMod(abilityScore);
        const saveModifier = abilityModifier + pb;
        
        result.push({
          key: ability.key,
          label: ability.label,
          abbr: ability.abbr,
          abilityScore: abilityScore,
          abilityModifier: abilityModifier,
          saveModifier: saveModifier,
          proficient: true
        });
      }
    });
    
    return result;
  })();
  
  // Get available abilities to add as proficient (excluding already proficient ones)
  $: availableAbilitiesToAdd = availableAbilities.filter(ability => 
    !currentSavingThrows.some(selected => selected.key === ability.key)
  );
  
  // Helper functions
  function getAbilityLabel(key) {
    return availableAbilities.find(a => a.key === key)?.label || key;
  }
  
  // State for adding new saving throw proficiencies
  let showAddSelect = false;
  let newAbilityType = '';
  
  function handleAddSavingThrow() {
    if (availableAbilitiesToAdd.length > 0) {
      showAddSelect = true;
      newAbilityType = availableAbilitiesToAdd[0].key;
    }
  }
  
  function confirmAddSavingThrow() {
    if (newAbilityType) {
      dispatch('savingThrowUpdate', { 
        type: 'add',
        ability: newAbilityType
      });
      showAddSelect = false;
      newAbilityType = '';
    }
  }
  
  function cancelAddSavingThrow() {
    showAddSelect = false;
    newAbilityType = '';
  }
  
  function handleRemoveSavingThrow(abilityKey) {
    dispatch('savingThrowUpdate', { 
      type: 'remove',
      ability: abilityKey
    });
  }

  async function rollSave(key, event) {
    try {
      const a = $actor;
      const ab = String(key || '').toLowerCase();
      if (!a || !ab) return;

      // Prefer dnd5e v4 API
      if (typeof a.rollSavingThrow === 'function') return a.rollSavingThrow({ ability: ab, event });
      // Fallback to dnd5e v3 API
      if (typeof a.rollAbilitySave === 'function') return a.rollAbilitySave(ab, { event });
      // Legacy/alt paths
      if (a?.system?.abilities?.[ab]?.save?.roll) return a.system.abilities[ab].save.roll({ event });
      if (a?.saves?.[ab]?.roll) return a.saves[ab].roll({ event });
      ui?.notifications?.warn?.(`Save roll not supported: ${key}`);
    } catch (err) {
      console.warn('Save roll failed', key, err);
    }
  }
</script>

<template lang="pug">
  .saving-throws-container
    .label.inline Saving Throw Proficiencies
    .value
      +if("currentSavingThrows && currentSavingThrows.length > 0")
        +each("currentSavingThrows as savingThrow")
          .saving-throw-item
            +if("includeRollButtons")
              button.roll.rollable.ability-save(
                title="Roll {savingThrow.label} Save"
                data-ability="{savingThrow.key}"
                aria-label="{savingThrow.label} save"
                on:click!="{(e) => rollSave(savingThrow.key, e)}"
              )
                i.fas.fa-shield-alt
            span.ability-abbr {savingThrow.abbr}
            span.ability-value {savingThrow.saveModifier >= 0 ? '+' : ''}{savingThrow.saveModifier}
            +if("!readonly")
              button.remove-btn(
                on:click!="{() => handleRemoveSavingThrow(savingThrow.key)}"
                title="Remove {savingThrow.label} proficiency"
              ) ×
      
      +if("!readonly")
        +if("showAddSelect")
          .add-saving-throw-form
            select.ability-type-select(
              bind:value="{newAbilityType}"
            )
              +each("availableAbilitiesToAdd as ability")
                option(value="{ability.key}") {ability.label}
            button.confirm-btn(
              on:click!="{confirmAddSavingThrow}"
              title="Add Saving Throw Proficiency"
            ) ✓
            button.cancel-btn(
              on:click!="{cancelAddSavingThrow}"
              title="Cancel"
            ) ×
        +if("!showAddSelect")
          +if("availableAbilitiesToAdd.length > 0")
            button.add-btn(
              on:click!="{handleAddSavingThrow}"
              title="Add saving throw proficiency"
            ) + Add Proficiency
      
      +if("!currentSavingThrows || currentSavingThrows.length === 0")
        span.no-saving-throws (no proficiencies)
</template>

<style lang="sass" scoped>
.saving-throws-container
  .saving-throw-item
    display: flex
    align-items: center
    gap: 8px
    margin-bottom: 3px
    
    .roll
      width: 24px
      height: 24px
      display: inline-flex
      align-items: center
      justify-content: center
      border: 1px solid var(--color-border, rgba(0,0,0,.2))
      border-radius: 4px
      background: rgba(0,0,0,.05)
    
    .ability-abbr
      font-weight: 600
      min-width: 40px
      color: var(--color-text-highlight, #ffffff)
    
    .ability-value
      font-weight: 500
      min-width: 30px
      text-align: center
      color: var(--color-text-highlight, #ffffff)
    
    .remove-btn
      background: var(--color-error, #dc3545)
      color: white
      border: none
      border-radius: 50%
      width: 20px
      height: 20px
      cursor: pointer
      font-size: 14px
      line-height: 1
      padding: 0
      
      &:hover
        background: var(--color-error-hover, #c82333)
  
  .add-btn
    background: var(--color-success, #28a745)
    color: white
    border: none
    border-radius: 3px
    padding: 4px 8px
    cursor: pointer
    font-size: 0.9em
    margin-top: 4px
    
    &:hover
      background: var(--color-success-hover, #218838)
  
  .add-saving-throw-form
    display: flex
    align-items: center
    gap: 4px
    margin-top: 4px
    
    .ability-type-select
      min-width: 120px
      padding: 2px 4px
      border: 1px solid var(--color-border-highlight, #007bff)
      border-radius: 3px
      background: var(--color-bg-input, #2c2c2c)
      color: var(--color-text, #ffffff)
    
    .confirm-btn,
    .cancel-btn
      background: var(--color-success, #28a745)
      color: white
      border: none
      border-radius: 3px
      padding: 2px 6px
      cursor: pointer
      font-size: 12px
      line-height: 1
      
      &:hover
        background: var(--color-success-hover, #218838)
    
    .cancel-btn
      background: var(--color-secondary, #6c757d)
      
      &:hover
        background: var(--color-secondary-hover, #5a6268)
  
  .no-saving-throws
    color: var(--color-text-muted, #6c757d)
    font-style: italic
</style>
