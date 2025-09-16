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
  
  // Comma-separated display for non-edit mode
  $: commaSeparatedSavingThrows = currentSavingThrows.map(s => `${s.abbr} ${s.saveModifier >= 0 ? '+' : ''}${s.saveModifier}`).join(', ');
  
  // Helper functions
  function getAbilityLabel(key) {
    return availableAbilities.find(a => a.key === key)?.label || key;
  }
  
  // State for adding new saving throw proficiencies
  let showAddSelect = false;
  let newAbilityType = '';
  let isEditing = false;
  
  function handleAddSavingThrow() {
    if (availableAbilitiesToAdd.length > 0) {
      showAddSelect = true;
      newAbilityType = availableAbilitiesToAdd[0].key;
    }
  }
  
  function startEditing() {
    if (!readonly) {
      isEditing = true;
    }
  }
  
  function stopEditing() {
    isEditing = false;
    showAddSelect = false;
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
    .label.inline Saving Throws
    .value
      +if("!isEditing")
        +if("currentSavingThrows && currentSavingThrows.length > 0")
          span.saving-throws-display(
            on:click!="{startEditing}"
            class!="{readonly ? '' : 'editable'}"
            title!="{readonly ? '' : 'Click to edit saving throw proficiencies'}"
          ) {commaSeparatedSavingThrows}
          +else()
            span.no-saving-throws(
              on:click!="{startEditing}"
              class!="{readonly ? '' : 'editable'}"
              title!="{readonly ? '' : 'Click to add saving throw proficiencies'}"
            ) (no proficiencies)
      +if("isEditing")
        .saving-throws-edit-mode
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
                  button.button-remove(
                    on:click!="{() => handleRemoveSavingThrow(savingThrow.key)}"
                    title="Remove {savingThrow.label} proficiency"
                  ) ×
      
      +if("isEditing && !readonly")
        +if("showAddSelect")
          .add-saving-throw-form
            select.ability-type-select(
              bind:value="{newAbilityType}"
            )
              +each("availableAbilitiesToAdd as ability")
                option(value="{ability.key}") {ability.label}
            button.button-confirm(
              on:click!="{confirmAddSavingThrow}"
              title="Add Saving Throw Proficiency"
            ) ✓
            button.button-cancel(
              on:click!="{cancelAddSavingThrow}"
              title="Cancel"
            ) ×
        +if("!showAddSelect")
          .add-saving-throw-buttons
            +if("availableAbilitiesToAdd.length > 0")
              button(
                class="button-confirm"
                on:click!="{handleAddSavingThrow}"
                title="Add saving throw proficiency"
              ) +
            button(
              class="button-confirm"
              on:click!="{stopEditing}"
              title="Done editing"
            ) ✓
</template>

<style lang="sass" scoped>
  @import "/Users/noeldacosta/code/foundryvtt-actor-studio/styles/Mixins.sass"
.saving-throws-container
  .saving-throws-display
    @include display-hover
  
  .no-saving-throws
    @include empty-state
  
  
  .saving-throws-edit-mode
    margin-top: 4px
  
  .add-saving-throw-buttons
    @include button-container
  
  .saving-throw-item
    @include item-list
    
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
      @include item-label
      min-width: 40px
    
    .ability-value
      @include item-value
      min-width: 30px
    
    .button-remove
      @include button-remove
  
  
  .add-saving-throw-form
    @include form-container
    
    .ability-type-select
      @include form-select
      min-width: 120px
      background: var(--color-bg-input, #2c2c2c)
      color: var(--color-text, #ffffff)
    
  
  .no-saving-throws
    color: var(--color-text-muted, #6c757d)
    font-style: italic
</style>
