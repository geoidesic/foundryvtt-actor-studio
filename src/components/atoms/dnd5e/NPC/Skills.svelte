<script>
  import { getContext, createEventDispatcher, onMount } from "svelte";
  import { updateSource } from "~/src/helpers/Utility";
  
  export let readonly = false;
  
  const actor = getContext("#doc");
  const dispatch = createEventDispatcher();
  
  $: skills = $actor?.system?.skills || {};
  
  // Available skills with their ability modifiers
  const availableSkills = [
    { key: 'acr', label: 'Acrobatics', ability: 'dex' },
    { key: 'ani', label: 'Animal Handling', ability: 'wis' },
    { key: 'arc', label: 'Arcana', ability: 'int' },
    { key: 'ath', label: 'Athletics', ability: 'str' },
    { key: 'dec', label: 'Deception', ability: 'cha' },
    { key: 'his', label: 'History', ability: 'int' },
    { key: 'ins', label: 'Insight', ability: 'wis' },
    { key: 'itm', label: 'Intimidation', ability: 'cha' },
    { key: 'inv', label: 'Investigation', ability: 'int' },
    { key: 'med', label: 'Medicine', ability: 'wis' },
    { key: 'nat', label: 'Nature', ability: 'int' },
    { key: 'prc', label: 'Perception', ability: 'wis' },
    { key: 'prf', label: 'Performance', ability: 'cha' },
    { key: 'per', label: 'Persuasion', ability: 'cha' },
    { key: 'rel', label: 'Religion', ability: 'int' },
    { key: 'slt', label: 'Sleight of Hand', ability: 'dex' },
    { key: 'ste', label: 'Stealth', ability: 'dex' },
    { key: 'sur', label: 'Survival', ability: 'wis' }
  ];
  
  // Get current skills that have proficiency
  $: currentSkills = Object.entries(skills || {})
    .filter(([key, skill]) => skill && skill.proficient > 0)
    .map(([key, skill]) => ({ 
      key, 
      label: availableSkills.find(s => s.key === key)?.label || key,
      ability: skill.ability || availableSkills.find(s => s.key === key)?.ability || 'int',
      proficient: skill.proficient || 0,
      mod: skill.mod || 0
    }));
  
  // Get available skills to add
  $: availableSkillsToAdd = availableSkills.filter(skill => 
    !currentSkills.some(s => s.key === skill.key)
  );
  
  // Comma-separated display for non-edit mode
  $: commaSeparatedSkills = currentSkills.map(s => s.label).join(', ');
  
  // Helper functions
  function getSkillLabel(key) {
    return availableSkills.find(s => s.key === key)?.label || key;
  }
  
  function getSkillAbility(key) {
    return availableSkills.find(s => s.key === key)?.ability || 'int';
  }
  
  function isProficient(proficient) {
    return proficient > 0;
  }
  
  function getProficiencySymbol(proficient) {
    return proficient > 0 ? '✓' : '○';
  }

  function getSkillMod(key) {
    return skills[key]?.mod > 0 ? '+' + skills[key]?.mod : skills[key]?.mod;
  }
  
  // State for adding new skills
  let showAddSelect = false;
  let newSkillType = '';
  let isEditing = false;
  
  async function handleSkillToggle(skillKey, currentProficient) {
    // Toggle between 0 (not proficient) and 1 (proficient)
    const newProficient = currentProficient > 0 ? 0 : 1;
    try {
      await updateSource($actor, { [`system.skills.${skillKey}.value`]: newProficient });
      dispatch('skillUpdate', { 
        skill: skillKey, 
        proficient: newProficient,
        ability: getSkillAbility(skillKey)
      });
    } catch (error) {
      console.error('Failed to update skill:', error);
    }
  }
  
  function handleAddSkill() {
    if (availableSkillsToAdd.length > 0) {
      showAddSelect = true;
      newSkillType = availableSkillsToAdd[0].key;
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
  
  // Open the built-in dnd5e skills configuration dialog
  function openSkillsConfig() {
    if (readonly || !$actor) return;
    
    try {
      // Use the built-in dnd5e SkillsConfig
      // eslint-disable-next-line no-undef
      new dnd5e.applications.actor.SkillsConfig({ document: $actor }).render({ force: true });
    } catch (error) {
      console.error('Failed to open skills configuration:', error);
      ui.notifications?.error?.('Failed to open skills configuration dialog');
    }
  }
  
  function confirmAddSkill() {
    if (newSkillType) {
      dispatch('skillUpdate', { 
        skill: newSkillType, 
        proficient: 1,
        ability: getSkillAbility(newSkillType)
      });
      showAddSelect = false;
      newSkillType = '';
    }
  }
  
  function cancelAddSkill() {
    showAddSelect = false;
    newSkillType = '';
  }
  
  function handleRemoveSkill(skillKey) {
    dispatch('skillUpdate', { 
      skill: skillKey, 
      proficient: 0,
      ability: getSkillAbility(skillKey)
    });
  }

  onMount(() => {
    console.log('skills', skills)
    console.log('currentSkills', currentSkills)
  })
</script>

<template lang="pug">
  .skills-container
    .label.inline Skills
    .value
      +if("currentSkills && currentSkills.length > 0")
        span.skills-display {commaSeparatedSkills}
        +if("!readonly")
          button.skills-config-btn(
            on:click!="{openSkillsConfig}"
            title="Configure Skills"
            aria-label="Configure Skills"
          )
            i.fas.fa-cog
        +else()
          span.no-skills (no skills)
          +if("!readonly")
            button.skills-config-btn(
              on:click!="{openSkillsConfig}"
              title="Configure Skills"
              aria-label="Configure Skills"
            )
              i.fas.fa-cog
      
      //- Hidden editing interface (preserved but not displayed)
      +if("false")
        +if("isEditing")
          .skills-edit-mode
            +if("currentSkills && currentSkills.length > 0")
              +each("currentSkills as skill")
                .skill-item
                  span.skill-name {getSkillLabel(skill.key)}
                  +if("!readonly")
                    button.button-remove(
                      on:click!="{() => handleRemoveSkill(skill.key)}"
                      title="Remove {getSkillLabel(skill.key)}"
                    ) ×
                  +if("readonly")
                    span ({getSkillMod(skill.key)})
        
        +if("isEditing && !readonly")
          +if("showAddSelect")
            .add-skill-form
              select.skill-type-select(
                bind:value="{newSkillType}"
              )
                +each("availableSkillsToAdd as skill")
                  option(value="{skill.key}") {skill.label}
              button.button-confirm(
                on:click!="{confirmAddSkill}"
                title="Add Skill"
              ) ✓
              button.button-cancel(
                on:click!="{cancelAddSkill}"
                title="Cancel"
              ) ×
          +if("!showAddSelect")
            .add-skill-buttons
              +if("availableSkillsToAdd && availableSkillsToAdd.length > 0")
                button.button-confirm(
                  on:click!="{handleAddSkill}"
                  title="Add skill"
                ) +
              button.button-confirm(
                on:click!="{stopEditing}"
                title="Done editing"
              ) ✓
</template>

<style lang="sass" scoped>
  @import "/Users/noeldacosta/code/foundryvtt-actor-studio/styles/Mixins.sass"
.skills-container
  .skills-display
    @include display-hover
  
  .no-skills
    @include empty-state
  
  .skills-config-btn
    @include config-cog-btn
  
  
  .skills-edit-mode
    margin-top: 4px
  
  .add-skill-buttons
    @include button-container
  
  .skill-item
    @include item-list
    
    .skill-name
      @include item-label
      min-width: 80px
    
    .toggle-btn
      width: 24px
      height: 24px
      border: 2px solid var(--color-border-highlight, #007bff)
      border-radius: 50%
      background: transparent
      cursor: pointer
      font-size: 12px
      font-weight: bold
      display: flex
      align-items: center
      justify-content: center
      transition: all 0.2s ease
      
      &.proficient
        background: var(--color-success, #28a745)
        border-color: var(--color-success, #28a745)
        color: white
      
      &.not-proficient
        color: var(--color-text-secondary, #666)
      
      &:hover
        transform: scale(1.1)
    
    .proficiency-indicator
      width: 24px
      height: 24px
      border: 2px solid var(--color-border-highlight, #007bff)
      border-radius: 50%
      background: var(--color-success, #28a745)
      border-color: var(--color-success, #28a745)
      color: white
      font-size: 12px
      font-weight: bold
      display: flex
      align-items: center
      justify-content: center
    
    .button-remove
      @include button-remove
  
  .add-skill-form
    @include form-container
    margin-top: 4px
    
    .skill-type-select
      @include form-select
      min-width: 120px
    
  
  .no-skills
    color: var(--color-text-secondary, #666)
    font-style: italic

// Dark theme overrides
@media (prefers-color-scheme: dark)
  .skills-container
    .add-skill-form
      .skill-type-select
        background: var(--color-bg-primary, #2b2b2b)
        color: var(--color-text-primary, #ffffff)
        border-color: var(--color-border-highlight, #4a9eff)
        
        &:focus
          border-color: var(--color-border-highlight, #4a9eff)
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.25)

:global(.dark-mode)
  .skills-container
    .add-skill-form
      .skill-type-select
        background: var(--color-bg-primary, #2b2b2b)
        color: var(--color-text-primary, #ffffff)
        border-color: var(--color-border-highlight, #4a9eff)
        
        &:focus
          border-color: var(--color-border-highlight, #4a9eff)
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.25)
</style>
