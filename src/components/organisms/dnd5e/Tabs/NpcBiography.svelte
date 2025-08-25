<script>
  import { getContext, onMount, onDestroy } from "svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import { updateSource, enrichHTML } from "~/src/helpers/Utility";
  import { selectedNpcBase } from "~/src/stores/index";
  import { TreasureCategoryMapper } from "~/src/helpers/TreasureCategoryMapper";
  import ProseMirror from "~/src/components/molecules/ProseMirror.svelte";
  import { MODULE_ID } from "~/src/helpers/constants";

  const actor = getContext("#doc");

  // Local state for editing
  let editingIdeal = false;
  let editingBond = false;
  let editingFlaw = false;
  let editingAlignment = false;
  let editingType = false;
  let editingXP = false;
  let editingTreasure = false;
  let editingHabitat = false;
  let editingModuleFlags = false;


  // Local values for editing
  let localIdeal = "";
  let localBond = "";
  let localFlaw = "";
  let localAlignment = "";
  let localType = "";
  let localXP = 0;
  let localTreasure = new Set();
  let localHabitat = [];
  
  // Module flags for token generation
  let moduleFlags = {
    enableRandomGold: false,
    enableMagicItemRoll: false,
    rollHP: false,
    randomizeArt: false,
    enableBioVariance: false
  };
  
  // Load module flags from actor data
  const loadModuleFlags = () => {
    console.log(`[foundryvtt-actor-studio] Loading module flags from actor:`, $actor);
    console.log(`[foundryvtt-actor-studio] Actor flags:`, $actor?.flags);
    console.log(`[foundryvtt-actor-studio] Module flags:`, $actor?.flags?.[MODULE_ID]);
    
    if ($actor && $actor.flags && $actor.flags[MODULE_ID]) {
      const flags = $actor.flags[MODULE_ID];
      moduleFlags = {
        enableRandomGold: flags.enableRandomGold || false,
        enableMagicItemRoll: flags.enableMagicItemRoll || false,
        rollHP: flags.rollHP || false,
        randomizeArt: flags.randomizeArt || false,
        enableBioVariance: flags.enableBioVariance || false
      };
      console.log(`[foundryvtt-actor-studio] Loaded module flags:`, moduleFlags);
    } else {
      console.log(`[foundryvtt-actor-studio] No module flags found, using defaults:`, moduleFlags);
    }
  };

  // Save module flags to actor data
  const saveModuleFlags = async () => {
    if ($actor) {
      console.log(`[foundryvtt-actor-studio] Saving module flags:`, moduleFlags);
      console.log(`[foundryvtt-actor-studio] Actor before save:`, $actor.flags);
      
      await updateSource($actor, {
        'flags.foundryvtt-actor-studio.enableRandomGold': moduleFlags.enableRandomGold,
        'flags.foundryvtt-actor-studio.enableMagicItemRoll': moduleFlags.enableMagicItemRoll,
        'flags.foundryvtt-actor-studio.rollHP': moduleFlags.rollHP,
        'flags.foundryvtt-actor-studio.randomizeArt': moduleFlags.randomizeArt,
        'flags.foundryvtt-actor-studio.enableBioVariance': moduleFlags.enableBioVariance
      });
      
      console.log(`[foundryvtt-actor-studio] Actor after save:`, $actor.flags);
      console.log(`[foundryvtt-actor-studio] Module flags after save:`, $actor.flags?.[MODULE_ID]);
    }
  };
  

  
  // Click outside detection using refs
  let idealContainer, bondContainer, flawContainer, alignmentContainer, typeContainer, crContainer, treasureContainer, habitatContainer, moduleFlagsContainer;
  
  function isClickOutsideContainer(event, containerElement) {
    try {
      const targetElement = event.target;
      
      // Check if the target element is the container itself
      if (targetElement === containerElement) {
        return false;
      }
      
      // Guard: if containerElement is null, treat as click outside
      if (!containerElement) {
        return true;
      }
      
      // Guard: if targetElement is null, treat as click outside
      if (!targetElement) {
        return true;
      }
      
      // Check if the target element is inside the container
      return !containerElement.contains(targetElement);
    } catch (error) {
      console.error('[NpcBiography] Error in isClickOutsideContainer:', error);
      return true; // Treat as click outside on error
    }
  }
  
  function handleClickOutside(event) {
    try {
      // Check each editable field using refs
      if (editingIdeal && idealContainer && isClickOutsideContainer(event, idealContainer)) {
        editingIdeal = false;
      }
      
      if (editingBond && bondContainer && isClickOutsideContainer(event, bondContainer)) {
        editingBond = false;
      }
      
      if (editingFlaw && flawContainer && isClickOutsideContainer(event, flawContainer)) {
        editingFlaw = false;
      }
      
      if (editingAlignment && alignmentContainer && isClickOutsideContainer(event, alignmentContainer)) {
        editingAlignment = false;
      }
      
      if (editingType && typeContainer && isClickOutsideContainer(event, typeContainer)) {
        editingType = false;
      }
      
      
      if (editingTreasure && treasureContainer && isClickOutsideContainer(event, treasureContainer)) {
        editingTreasure = false;
      }
      
      if (editingHabitat && habitatContainer && isClickOutsideContainer(event, habitatContainer)) {
        editingHabitat = false;
      }
      
      if (editingModuleFlags && moduleFlagsContainer && isClickOutsideContainer(event, moduleFlagsContainer)) {
        editingModuleFlags = false;
      }
    } catch (error) {
      console.error('[NpcBiography] Error in handleClickOutside:', error);
    }
  }

  // Get treasure categories from the mapper
  const treasureCategories = TreasureCategoryMapper.getTreasureCategories();

  // Habitat type options
  const habitatTypes = [
    "arctic", "coastal", "desert", "forest", "grassland", "hill", "mountain", 
    "swamp", "underdark", "underwater", "urban"
  ];

  // Type options
  const typeOptions = [
    "aberration", "beast", "celestial", "construct", "dragon", "elemental", 
    "fey", "fiend", "giant", "humanoid", "monstrosity", "ooze", "plant", "undead"
  ];

  // Initialize local values only once when component mounts
  let initialized = false;
  $: if ($actor && !initialized) {
    window.GAS.log.p('initialized actor', $actor)
    localIdeal = $actor.system?.details?.ideal || "";
    localBond = $actor.system?.details?.bond || "";
    localFlaw = $actor.system?.details?.flaw || "";
    localAlignment = $actor.system?.details?.alignment || "";
    localType = $actor.system?.details?.type?.value || "";
    localXP = $actor.system?.details?.xp?.value ?? 0;
    localTreasure = new Set($actor.system?.details?.treasure?.value || []);
    localHabitat = $actor.system?.details?.habitat?.value || [];
    loadModuleFlags(); // Load module flags on initial load
    initialized = true;
  }
  
  // Don't reset local values when actor changes - this prevents double updates
  // The local values should only be set once when the component first loads

  // Update functions
  async function updateIdeal() {
    if ($actor) {
      console.log('updateIdeal called with:', localIdeal);
      await updateSource($actor, { 'system.details.ideal': localIdeal });
      editingIdeal = false;
    }
  }

  async function updateBond() {
    if ($actor) {
      console.log('updateBond called with:', localBond);
      await updateSource($actor, { 'system.details.bond': localBond });
      editingBond = false;
    }
  }

  async function updateFlaw() {
    if ($actor) {
      await updateSource($actor, { 'system.details.flaw': localFlaw });
      editingFlaw = false;
    }
  }

  async function updateAlignment() {
    if ($actor) {
      await updateSource($actor, { 'system.details.alignment': localAlignment });
      editingAlignment = false;
    }
  }

  async function updateType() {
    if ($actor) {
      await updateSource($actor, { 'system.details.type.value': localType });
      editingType = false;
    }
  }


  async function updateTreasure() {
    if ($actor) {
      await updateSource($actor, { 'system.details.treasure.value': Array.from(localTreasure) });
      editingTreasure = false;
    }
  }

  async function updateHabitat() {
    if ($actor) {
      await updateSource($actor, { 'system.details.habitat.value': localHabitat });
      editingHabitat = false;
    }
  }

  function toggleTreasureCategory(category) {
    if (localTreasure.has(category)) {
      localTreasure.delete(category);
    } else {
      localTreasure.add(category);
    }
    localTreasure = new Set(localTreasure); // Trigger reactivity
  }

  function addHabitatType() {
    if (localHabitat.length < 3) { // Limit to 3 habitat types
      localHabitat = [...localHabitat, { type: "forest", subtype: "" }];
    }
  }

  function removeHabitatType(index) {
    localHabitat = localHabitat.filter((_, i) => i !== index);
  }

  function updateHabitatType(index, field, value) {
    localHabitat[index][field] = value;
    localHabitat = [...localHabitat]; // Trigger reactivity
  }

  // Get treasure description for display
  function getTreasureDescription() {
    if (localTreasure.size === 0) return 'No treasure categories selected';
    return TreasureCategoryMapper.getTreasureDescription(Array.from(localTreasure));
  }

  // Get treasure category data for display
  function getTreasureCategoryData(category) {
    return TreasureCategoryMapper.TREASURE_CATEGORIES[category] || { label: category, description: '' };
  }

  // Biography content is handled automatically by ProseMirror
  

  
  // Set up click outside detection
  onMount(() => {
    window.addEventListener("click", handleClickOutside);
  });
  
  onDestroy(() => {
    window.removeEventListener("click", handleClickOutside);
  });
</script>

<template lang="pug">
StandardTabLayout(title="NPC Biography" showTitle="true" tabName="npc-biography")
  div(slot="left")
    .biography-section
      .detail-row
        label Ideal
        +if("editingIdeal")
          .edit-controls(bind:this="{idealContainer}")
            input(
              type="text"
              bind:value="{localIdeal}"
              on:keydown!="{e => e.key === 'Enter' && updateIdeal()}"
            )
        +if("!editingIdeal")
          .display-value(
            on:click|stopPropagation!="{() => editingIdeal = true}"
            class!="{!localIdeal ? 'empty' : ''}"
          ) {localIdeal || 'Click to add ideal'}

      .detail-row
        label Bond
        +if("editingBond")
          .edit-controls(bind:this="{bondContainer}")
            input(
              type="text"
              bind:value="{localBond}"
              on:keydown!="{e => e.key === 'Enter' && updateBond()}"
            )
        +if("!editingBond")
          .display-value(
            on:click|stopPropagation!="{() => editingBond = true}"
            class!="{!localBond ? 'empty' : ''}"
          ) {localBond || 'Click to add bond'}

      .detail-row
        label Flaw
        +if("editingFlaw")
          .edit-controls(bind:this="{flawContainer}")
            input(
              type="text"
              bind:value="{localFlaw}"
              on:keydown!="{e => e.key === 'Enter' && updateFlaw()}"
            )
        +if("!editingFlaw")
          .display-value(
            on:click|stopPropagation!="{() => editingFlaw = true}"
            class!="{!localFlaw ? 'empty' : ''}"
          ) {localFlaw || 'Click to add flaw'}

      .detail-row
        label Alignment
        +if("editingAlignment")
          .edit-controls(bind:this="{alignmentContainer}")
            select(
              bind:value="{localAlignment}"
              on:change!="{updateAlignment}"
            )
              option(value="") Unaligned
              option(value="Lawful Good") Lawful Good
              option(value="Lawful Neutral") Lawful Neutral
              option(value="Lawful Evil") Lawful Evil
              option(value="Neutral Good") Neutral Good
              option(value="Neutral") Neutral
              option(value="Neutral Evil") Neutral Evil
              option(value="Chaotic Good") Chaotic Good
              option(value="Chaotic Neutral") Chaotic Neutral
              option(value="Chaotic Evil") Chaotic Evil
        +if("!editingAlignment")
          .display-value(
            on:click|stopPropagation!="{() => editingAlignment = true}"
            class!="{!localAlignment ? 'empty' : ''}"
          ) {localAlignment || 'Click to set alignment'}

      .detail-row
        label Type
        +if("editingType")
          .edit-controls(bind:this="{typeContainer}")
            select(
              bind:value="{localType}"
              on:change!="{updateType}"
            )
              +each("typeOptions as type")
                option(value="{type}") {type.charAt(0).toUpperCase() + type.slice(1)}
        +if("!editingType")
          .display-value(
            on:click|stopPropagation!="{() => editingType = true}"
            class!="{!localType ? 'empty' : ''}"
          ) {localType ? localType.charAt(0).toUpperCase() + localType.slice(1) : 'Click to set type'}

      

      .detail-row
        label Treasure Categories
        +if("editingTreasure")
          .edit-controls(bind:this="{treasureContainer}")
            .treasure-checkboxes
              +each("treasureCategories as category")
                label.checkbox-label
                  input(
                    type="checkbox"
                    checked="{localTreasure.has(category.value)}"
                    on:change!="{() => toggleTreasureCategory(category.value)}"
                  )
                  span {category.label}
            button.save-btn(on:click!="{updateTreasure}") Save
        +if("!editingTreasure")
          .display-value(
            on:click|stopPropagation!="{() => editingTreasure = true}"
            class!="{localTreasure.size === 0 ? 'empty' : ''}"
          )
            +if("localTreasure.size > 0")
              .treasure-info
                .treasure-tags
                  +each("Array.from(localTreasure) as category")
                    span.treasure-tag
                      span.category-label {getTreasureCategoryData(category).label}
                      span.category-desc {getTreasureCategoryData(category).description}
            +if("localTreasure.size === 0")
              span Click to set treasure categories

      .detail-row
        label Habitat
        +if("editingHabitat")
          .edit-controls(bind:this="{habitatContainer}")
            .habitat-controls
              +each("localHabitat as habitat, index")
                .habitat-entry
                  select(
                    value="{habitat.type}"
                    on:change!="{e => updateHabitatType(index, 'type', e.target.value)}"
                  )
                    +each("habitatTypes as type")
                      option(value="{type}") {type.charAt(0).toUpperCase() + type.slice(1)}
                  input(
                    type="text"
                    placeholder="Subtype (optional)"
                    value="{habitat.subtype || ''}"
                    on:change!="{e => updateHabitatType(index, 'subtype', e.target.value)}"
                  )
                  button.remove-btn(
                    on:click!="{() => removeHabitatType(index)}"
                    title="Remove habitat type"
                  ) ×
              +if("localHabitat.length < 3")
                button.add-btn(on:click!="{addHabitatType}") + Add Habitat
            button.save-btn(on:click!="{updateHabitat}") Save
        +if("!editingHabitat")
          .display-value(
            on:click|stopPropagation!="{() => editingHabitat = true}"
            class!="{localHabitat.length === 0 ? 'empty' : ''}"
          )
            +if("localHabitat.length > 0")
              +each("localHabitat as habitat")
                span.habitat-tag {habitat.type}{habitat.subtype ? ' (' + habitat.subtype + ')' : ''}
            +if("localHabitat.length === 0")
              span Click to set habitat

      .detail-row
        label Module Flags
        .module-flags-section
          .module-flags-grid
            label.checkbox-label
              input(
                type="checkbox"
                checked="{moduleFlags.enableRandomGold}"
                on:change!="{() => { moduleFlags.enableRandomGold = !moduleFlags.enableRandomGold; saveModuleFlags(); }}"
              )
              span Enable Random Gold
            label.checkbox-label
              input(
                type="checkbox"
                checked="{moduleFlags.enableMagicItemRoll}"
                on:change!="{() => { moduleFlags.enableMagicItemRoll = !moduleFlags.enableMagicItemRoll; saveModuleFlags(); }}"
              )
              span Enable Magic Item Roll
            label.checkbox-label
              input(
                type="checkbox"
                checked="{moduleFlags.rollHP}"
                on:change!="{() => { moduleFlags.rollHP = !moduleFlags.rollHP; saveModuleFlags(); }}"
              )
              span Roll HP
            label.checkbox-label
              input(
                type="checkbox"
                checked="{moduleFlags.randomizeArt}"
                on:change!="{() => { moduleFlags.randomizeArt = !moduleFlags.randomizeArt; saveModuleFlags(); }}"
              )
              span Randomize Art
            label.checkbox-label
              input(
                type="checkbox"
                checked="{moduleFlags.enableBioVariance}"
                on:change!="{() => { moduleFlags.enableBioVariance = !moduleFlags.enableBioVariance; saveModuleFlags(); }}"
              )
              span Enable Bio Variance



  div(slot="right")
    .biography-content
      .biography-section
        h3 GM Description
        ProseMirror(
          attr="system.details.biography.value"
          classes="biography-editor"
          inMemory="true"
        )
      .biography-section
        h3 Player Description
        ProseMirror(
          attr="system.details.biography.public"
          classes="biography-editor"
          inMemory="true"
        )
      
</template>

<style lang="sass" scoped>
.biography-section
  margin-bottom: 2rem
  
  h3
    color: var(--color-text-highlight)
    border-bottom: 1px solid var(--color-border-highlight)
    padding-bottom: 0.5rem
    margin-bottom: 1rem

.biography-editor
  min-height: 500px
  height: 70vh
  width: 100%
  border: 1px solid var(--color-border-highlight)
  border-radius: 4px
  background: rgba(0, 0, 0, 0.3)
  padding: 1rem
  margin-top: 1rem
  color: white
  font-family: inherit
  font-size: inherit
  line-height: 1.5
  resize: vertical
  
  &:focus
    outline: none
    border-color: var(--color-border-highlight-secondary)
    background: rgba(0, 0, 0, 0.4)
  
  &:hover
    border-color: var(--color-border-highlight-secondary)
    background: rgba(0, 0, 0, 0.35)
  
  &::placeholder
    color: var(--color-text-dark-secondary)
    font-style: italic
  
  // Force ProseMirror editor to be much taller - target all possible elements
  :global(.ProseMirror)
    height: 600px !important
    min-height: 600px !important
    max-height: none !important
    background: red !important // Debug: make it obvious if this works
  
  :global(.editor)
    height: 600px !important
    min-height: 600px !important
    max-height: none !important
    background: blue !important // Debug: make it obvious if this works
  
  :global(.ProseMirror-focused)
    height: 600px !important
    min-height: 600px !important
  
  // Target the actual wrapper that ProseMirror creates
  :global(.tjs-prosemirror)
    height: 600px !important
    min-height: 600px !important
    max-height: none !important
    background: green !important // Debug: make it obvious if this works
  
  // Target any other ProseMirror-related classes
  :global([class*="ProseMirror"])
    height: 600px !important
    min-height: 600px !important
    max-height: none !important

.detail-row
  margin-bottom: 1rem
  
  label
    display: block
    font-weight: 600
    margin-bottom: 0.5rem
    color: var(--color-text-highlight)

.display-value
  padding: 0.5rem
  background: rgba(255, 255, 255, 0.05)
  border: 1px solid transparent
  border-radius: 4px
  cursor: pointer
  transition: all 0.2s ease
  
  &:hover
    background: rgba(255, 255, 255, 0.1)
    border-color: var(--color-border-highlight)
  
  &.empty
    color: var(--color-text-dark-secondary)
    font-style: italic

.edit-controls
  input, select
    width: 100%
    padding: 0.5rem
    background: rgba(0, 0, 0, 0.3)
    border: 1px solid var(--color-border-highlight)
    border-radius: 4px
    color: white
    
    &:focus
      outline: none
      border-color: var(--color-border-highlight-secondary)

.treasure-checkboxes
  .checkbox-label
    display: flex
    align-items: center
    margin-bottom: 0.5rem
    
    input[type="checkbox"]
      margin-right: 0.5rem
    
    span
      color: var(--color-text-light)

.habitat-controls
  .habitat-entry
    display: flex
    gap: 0.5rem
    margin-bottom: 0.5rem
    align-items: center
    
    select, input
      flex: 1
      padding: 0.25rem
      background: rgba(0, 0, 0, 0.3)
      border: 1px solid var(--color-border-highlight)
      border-radius: 4px
      color: white
    
    .remove-btn
      background: #ff6b6b
      color: white
      border: none
      border-radius: 4px
      width: 24px
      height: 24px
      cursor: pointer
      display: flex
      align-items: center
      justify-content: center
      
      &:hover
        background: #ff5252

.add-btn, .save-btn
  background: var(--color-border-highlight)
  color: white
  border: none
  border-radius: 4px
  padding: 0.5rem 1rem
  cursor: pointer
  margin-top: 0.5rem
  
  &:hover
    background: var(--color-border-highlight-secondary)

.treasure-tag, .habitat-tag
  display: inline-block
  background: var(--color-border-highlight)
  color: white
  padding: 0.25rem 0.5rem
  border-radius: 3px
  margin: 0.25rem 0.25rem 0.25rem 0
  font-size: 0.875rem
  
  .category-label
    display: block
    font-weight: bold
    color: var(--color-text-highlight)
    margin-bottom: 0.25rem
  
  .category-desc
    display: block
    font-size: 0.8em
    color: var(--color-text-light)
    font-style: italic

.module-flags-section
  margin-top: 1rem
  
  .module-flags-grid
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))
    gap: 0.75rem
    margin-bottom: 1rem
    
    .checkbox-label
      display: flex
      align-items: center
      gap: 0.5rem
      
      input[type="checkbox"]
        transform: scale(1.1)
        accent-color: var(--color-primary)
      
      span
        color: var(--color-text-light)
        font-size: 0.875rem


.no-biography
  text-align: center
  padding: 2rem
  color: var(--color-text-dark-secondary)
  
  p
    margin-bottom: 1rem
</style>
