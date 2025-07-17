<script>
  import { onMount, getContext } from "svelte";
  import { localize as t } from "~/src/helpers/Utility";
  import { actorInGame, isLevelUp } from "~/src/stores/index";
  import { parseFeatSpellRequirements, getAvailableSpellsForFeat } from "~/src/helpers/FeatSpellParser";
  import { getLevelUpFSM, LEVELUP_EVENTS } from "~/src/helpers/LevelUpStateMachine";
  import { getWorkflowFSM, WORKFLOW_EVENTS } from "~/src/helpers/WorkflowStateMachine";
  import { get } from "svelte/store";
  
  // Component props
  export let sheet = null; // Accept but don't use to avoid warnings
  
  // Component state
  let featRequirements = [];
  let selectedSpells = new Map(); // Map of featId -> selected spells
  let selectedClasses = new Map(); // Map of featId -> selected class for generic feats
  let availableSpells = new Map(); // Map of featId -> available spell choices
  let isLoading = true;
  let error = null;
  
  // Get the current actor and workflow type
  $: actor = $actorInGame;
  $: isLevelUpWorkflow = $isLevelUp;
  
  /**
   * Initialize component on mount
   */
  onMount(async () => {
    await loadFeatSpellRequirements();
  });
  
  /**
   * Load feat spell requirements and available choices
   */
  async function loadFeatSpellRequirements() {
    try {
      isLoading = true;
      error = null;
      
      if (!actor) {
        throw new Error("No actor available");
      }
      
      // Get all feats from the actor
      const feats = actor.items.filter(item => item.type === 'feat');
      window.GAS.log.d('[FEAT SPELLS] Found feats:', feats.map(f => f.name));
      
      // Parse feat requirements
      featRequirements = parseFeatSpellRequirements(feats);
      window.GAS.log.d('[FEAT SPELLS] Parsed requirements:', featRequirements);
      
      // Keep all requirements - we want to show both choices AND fixed spells
      // Don't filter out requirements with choiceCount === 0
      
      if (featRequirements.length === 0) {
        window.GAS.log.d('[FEAT SPELLS] No feat spell requirements found, completing automatically');
        handleComplete();
        return;
      }
      
      // Load available spells for each requirement
      for (const requirement of featRequirements) {
        // Initialize selected spells and class for this feat
        selectedSpells.set(requirement.featId, []);
        
        if (requirement.requiresClassSelection) {
          // Don't load spells until class is selected
          selectedClasses.set(requirement.featId, null);
          availableSpells.set(requirement.featId, []);
        } else {
          // Load spells immediately for feats with predetermined sources
          const available = await getAvailableSpellsForFeat(requirement, actor);
          availableSpells.set(requirement.featId, available);
        }
      }
      
      // Trigger reactivity
      availableSpells = availableSpells;
      selectedSpells = selectedSpells;
      
    } catch (err) {
      window.GAS.log.e('[FEAT SPELLS] Error loading requirements:', err);
      error = err.message;
    } finally {
      isLoading = false;
    }
  }
  
  /**
   * Handle spell selection for a feat
   */
  function onSpellSelected(featId, spellId, spellName, isSelected) {
    const currentSelected = selectedSpells.get(featId) || [];
    
    if (isSelected) {
      // Add spell to selection
      selectedSpells.set(featId, [...currentSelected, { id: spellId, name: spellName }]);
    } else {
      // Remove spell from selection
      selectedSpells.set(featId, currentSelected.filter(s => s.id !== spellId));
    }
    
    // Trigger reactivity
    selectedSpells = selectedSpells;
  }
  
  /**
   * Handle class selection for generic feats like Magic Initiate
   */
  async function onClassSelected(featId, className) {
    selectedClasses.set(featId, className);
    
    // Find the requirement and update its spell sources
    const requirement = featRequirements.find(req => req.featId === featId);
    if (requirement && requirement.requiresClassSelection) {
      // Update the requirement with the selected class
      const updatedRequirement = {
        ...requirement,
        spellSources: [className],
        requiresClassSelection: false // Mark as no longer needing class selection
      };
      
      // Load spells for the selected class
      const available = await getAvailableSpellsForFeat(updatedRequirement, actor);
      availableSpells.set(featId, available);
      
      // Clear any previous spell selections since class changed
      selectedSpells.set(featId, []);
      
      // Trigger reactivity
      availableSpells = availableSpells;
      selectedSpells = selectedSpells;
      selectedClasses = selectedClasses;
    }
  }

  /**
   * Check if all required selections are complete
   */
  function areAllSelectionsComplete() {
    for (const requirement of featRequirements) {
      // Skip requirements that have no choices (fixed spells only)
      if (requirement.choiceCount === 0) {
        continue;
      }
      
      const selected = selectedSpells.get(requirement.featId) || [];
      if (selected.length < requirement.choiceCount) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Handle completion of feat spell selection
   */
  async function handleComplete() {
    try {
      // Add spells to the actor
      for (const requirement of featRequirements) {
        // Add selected spells (from user choices)
        const selected = selectedSpells.get(requirement.featId) || [];
        for (const spell of selected) {
          await addSpellToActor(spell, requirement);
        }
        
        // Add fixed spells (automatic from feat)
        if (requirement.fixedSpells && requirement.fixedSpells.length > 0) {
          for (const spellName of requirement.fixedSpells) {
            // Create a spell object for the fixed spell
            const fixedSpell = { name: spellName };
            await addSpellToActor(fixedSpell, requirement);
          }
        }
      }
      
      // Trigger the appropriate workflow event based on workflow type
      if (isLevelUpWorkflow) {
        const levelUpFSM = getLevelUpFSM();
        levelUpFSM.handle(LEVELUP_EVENTS.FEAT_SPELLS_COMPLETE);
      } else {
        const workflowFSM = getWorkflowFSM();
        workflowFSM.handle(WORKFLOW_EVENTS.FEAT_SPELLS_COMPLETE);
      }
      
    } catch (err) {
      window.GAS.log.e('[FEAT SPELLS] Error completing selection:', err);
      error = err.message;
    }
  }
  
  /**
   * Skip feat spell selection
   */
  function handleSkip() {
    if (isLevelUpWorkflow) {
      const levelUpFSM = getLevelUpFSM();
      levelUpFSM.handle(LEVELUP_EVENTS.SKIP_FEAT_SPELLS);
    } else {
      const workflowFSM = getWorkflowFSM();
      workflowFSM.handle(WORKFLOW_EVENTS.SKIP_FEAT_SPELLS);
    }
  }
  
  /**
   * Add a selected spell to the actor
   */
  async function addSpellToActor(spell, requirement) {
    try {
      // Find the spell in available packs
      const spellData = await findSpellData(spell.id || spell.name);
      
      if (!spellData) {
        window.GAS.log.w('[FEAT SPELLS] Could not find spell data for:', spell.name);
        return;
      }
      
      // Create the spell item on the actor
      const itemData = {
        ...spellData,
        system: {
          ...spellData.system,
          preparation: {
            mode: "always", // Feat spells are always prepared
            prepared: true
          },
          sourceClass: requirement.featName || "feat" // Mark source as the feat
        }
      };
      
      await actor.createEmbeddedDocuments("Item", [itemData]);
      window.GAS.log.d('[FEAT SPELLS] Added spell to actor:', spell.name);
      
    } catch (err) {
      window.GAS.log.e('[FEAT SPELLS] Error adding spell to actor:', err);
      throw err;
    }
  }
  
  /**
   * Find spell data in compendiums
   */
  async function findSpellData(spellIdentifier) {
    const spellPacks = [
      'dnd5e.spells',
      'dnd-players-handbook.spells'
    ];
    
    for (const packId of spellPacks) {
      const pack = game.packs.get(packId);
      if (!pack) continue;
      
      try {
        const index = await pack.getIndex();
        const spellEntry = index.find(entry => 
          entry.name === spellIdentifier || 
          entry._id === spellIdentifier
        );
        
        if (spellEntry) {
          const spell = await pack.getDocument(spellEntry._id);
          return spell.toObject();
        }
      } catch (err) {
        window.GAS.log.w('[FEAT SPELLS] Error searching pack:', packId, err);
      }
    }
    
    return null;
  }
</script>

<div class="feat-spells-container">
  {#if isLoading}
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <span>{t('FeatSpells.Loading')}</span>
    </div>
  {:else if error}
    <div class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <span>{t('FeatSpells.Error', { error })}</span>
      <button class="retry-btn" on:click={loadFeatSpellRequirements}>{t('Retry')}</button>
    </div>
  {:else if featRequirements.length === 0}
    <div class="no-requirements">
      <i class="fas fa-info-circle"></i>
      <span>{t('FeatSpells.NoRequirements')}</span>
    </div>
  {:else}
    <div class="feat-spells-content">
      <h2>{t('FeatSpells.Title')}</h2>
      
      <p class="description">{t('FeatSpells.Description')}</p>
      
      {#each featRequirements as requirement}
        <div class="feat-requirement">
          <div class="feat-header">
            <h3 class="feat-name">{requirement.featName}</h3>
            {#if requirement.choiceCount > 0}
              <div class="spell-count">
                {#if requirement.cantrips}
                  <span class="cantrip-count">{requirement.cantrips} cantrips</span>
                {/if}
                {#if requirement.cantrips && (requirement.choiceCount - requirement.cantrips) > 0}
                  <span class="separator">+</span>
                {/if}
                {#if (requirement.choiceCount - (requirement.cantrips || 0)) > 0}
                  <span class="spell-level-count">{requirement.choiceCount - (requirement.cantrips || 0)} level 1 spell{(requirement.choiceCount - (requirement.cantrips || 0)) > 1 ? 's' : ''}</span>
                {/if}
              </div>
            {/if}
          </div>
          
          <p class="feat-description">{requirement.description}</p>
          
          {#if requirement.requiresClassSelection}
            <!-- Class Selection for Magic Initiate -->
            <div class="class-selection">
              <label class="filter-label">Choose Spell Class:</label>
              <select 
                class="filter-select"
                value={selectedClasses.get(requirement.featId) || ''}
                on:change={(e) => onClassSelected(requirement.featId, e.target.value)}
              >
                <option value="">Select a class...</option>
                {#each requirement.availableClasses as className}
                  <option value={className}>{className.charAt(0).toUpperCase() + className.slice(1)}</option>
                {/each}
              </select>
            </div>
          {/if}
          
          <!-- Show spells only if class is selected (for generic) or not needed -->
          {#if !requirement.requiresClassSelection || selectedClasses.get(requirement.featId)}
            <div class="spell-selection">
              {#if requirement.choiceCount > 0}
                <div class="spell-grid">
                  {#if availableSpells.has(requirement.featId)}
                    {#each availableSpells.get(requirement.featId) as spell}
                      {@const isSelected = (selectedSpells.get(requirement.featId) || []).some(s => s.id === spell._id)}
                      {@const currentCount = (selectedSpells.get(requirement.featId) || []).length}
                      {@const isDisabled = currentCount >= requirement.choiceCount && !isSelected}
                      
                      <div class="spell-item" class:selected={isSelected} class:disabled={isDisabled}>
                        <label class="spell-label">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isDisabled}
                            on:change={(e) => onSpellSelected(requirement.featId, spell._id, spell.name, e.target.checked)}
                          />
                          <div class="spell-info">
                            <div class="spell-name">{spell.name}</div>
                            <div class="spell-details">
                              <span class="spell-level">
                                {#if spell.system?.level === 0}
                                  <span class="cantrip">Cantrip</span>
                                {:else}
                                  Level {spell.system?.level}
                                {/if}
                              </span>
                              {#if spell.system?.school}
                                <span class="spell-school">{spell.system.school.charAt(0).toUpperCase() + spell.system.school.slice(1)}</span>
                              {/if}
                            </div>
                          </div>
                        </label>
                      </div>
                    {/each}
                  {:else}
                    <div class="loading-spells">
                      <i class="fas fa-spinner fa-spin"></i>
                      <span>Loading spells...</span>
                    </div>
                  {/if}
                </div>
              {/if}
              
              {#if requirement.fixedSpells && requirement.fixedSpells.length > 0}
                <div class="fixed-spells">
                  <h4>Granted Spells:</h4>
                  <div class="spell-list">
                    {#each requirement.fixedSpells as spellName}
                      <div class="fixed-spell">{spellName}</div>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          {/if}
          
          {#if requirement.requiresManualReview}
            <div class="manual-review-warning">
              <i class="fas fa-exclamation-triangle"></i>
              <span>This feat requires manual review - please configure spells manually.</span>
            </div>
          {/if}
        </div>
      {/each}
      
      <div class="actions">
        <button class="skip-btn" on:click={handleSkip}>{t('Skip')}</button>
        <button class="complete-btn" disabled={!areAllSelectionsComplete()} on:click={handleComplete}>
          {t('Complete')}
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .feat-spells-container {
    padding: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-option, #f8f9fa);
    color: var(--color-text-dark-primary, #212529);
  }

  .loading-state, .error-state, .no-requirements {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 1rem;
    color: var(--color-text-dark-5, #6c757d);
  }

  .error-state {
    color: var(--color-text-danger, #dc3545);
  }

  .retry-btn {
    padding: 0.5rem 1rem;
    background: var(--color-bg-btn, #007bff);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .feat-spells-content {
    padding: 1rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .feat-spells-content h2 {
    margin: 0 0 0.5rem 0;
    color: var(--color-text-dark-primary, #212529);
    font-size: 1.25rem;
    font-weight: bold;
  }

  .description {
    margin: 0 0 1rem 0;
    color: var(--color-text-dark-5, #6c757d);
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .feat-requirement {
    background: var(--color-bg, white);
    border: 1px solid var(--color-border-light, #dee2e6);
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .feat-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
    gap: 1rem;
  }

  .feat-name {
    margin: 0;
    color: var(--color-text-dark-primary, #212529);
    font-size: 1.1rem;
    font-weight: 600;
    flex: 1;
  }

  .spell-count {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    font-size: 0.85rem;
    color: var(--color-text-dark-5, #6c757d);
    white-space: nowrap;
  }

  .cantrip-count {
    color: var(--color-text-success, #28a745);
    font-weight: 500;
  }

  .spell-level-count {
    color: var(--color-text-primary, #007bff);
    font-weight: 500;
  }

  .separator {
    color: var(--color-text-dark-5, #6c757d);
  }

  .feat-description {
    margin: 0 0 1rem 0;
    color: var(--color-text-dark-secondary, #495057);
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .class-selection {
    margin-bottom: 1rem;
    padding: 1rem;
    background: var(--color-bg-option, #f8f9fa);
    border: 1px solid var(--color-border-light-tertiary, #e9ecef);
    border-radius: 4px;
  }

  .filter-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--color-text-dark-primary, #212529);
    font-size: 0.9rem;
  }

  .filter-select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-border-light, #dee2e6);
    border-radius: 4px;
    background: var(--color-bg, white);
    color: var(--color-text-dark-primary, #212529);
    font-size: 0.9rem;
  }

  .filter-select:focus {
    outline: none;
    border-color: var(--color-border-focus, #007bff);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .spell-selection {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .spell-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 0.75rem;
  }

  .spell-item {
    background: var(--color-bg, white);
    border: 1px solid var(--color-border-light-tertiary, #e9ecef);
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .spell-item:hover:not(.disabled) {
    border-color: var(--color-border-light, #dee2e6);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .spell-item.selected {
    border-color: var(--color-border-focus, #007bff);
    background: var(--color-bg-selected, rgba(0, 123, 255, 0.05));
  }

  .spell-item.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spell-label {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    cursor: pointer;
    margin: 0;
  }

  .spell-label input[type="checkbox"] {
    margin: 0;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .spell-info {
    flex: 1;
    min-width: 0;
  }

  .spell-name {
    font-weight: 500;
    color: var(--color-text-dark-primary, #212529);
    margin-bottom: 0.25rem;
    line-height: 1.3;
  }

  .spell-details {
    display: flex;
    gap: 0.75rem;
    font-size: 0.85rem;
    color: var(--color-text-dark-5, #6c757d);
  }

  .spell-level .cantrip {
    color: var(--color-text-success, #28a745);
    font-weight: 500;
  }

  .spell-school {
    text-transform: capitalize;
  }

  .fixed-spells {
    padding: 1rem;
    background: var(--color-bg-option, #f8f9fa);
    border: 1px solid var(--color-border-light-tertiary, #e9ecef);
    border-radius: 4px;
  }

  .fixed-spells h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    color: var(--color-text-dark-primary, #212529);
  }

  .spell-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .fixed-spell {
    padding: 0.25rem 0.5rem;
    background: var(--color-bg-success, #d4edda);
    color: var(--color-text-success, #155724);
    border-radius: 3px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .manual-review-warning {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: var(--color-bg-warning, #fff3cd);
    color: var(--color-text-warning, #856404);
    border: 1px solid var(--color-border-warning, #ffeaa7);
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .loading-spells {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
    padding: 2rem;
    color: var(--color-text-dark-5, #6c757d);
    font-size: 0.9rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: auto;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border-light-tertiary, #e9ecef);
  }

  .skip-btn, .complete-btn {
    padding: 0.75rem 1.5rem;
    border: 1px solid transparent;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
  }

  .skip-btn {
    background: var(--color-bg-option, #f8f9fa);
    color: var(--color-text-dark-5, #6c757d);
    border-color: var(--color-border-light, #dee2e6);
  }

  .skip-btn:hover {
    background: var(--color-bg-btn-secondary, #e9ecef);
    color: var(--color-text-dark-primary, #212529);
  }

  .complete-btn {
    background: var(--color-bg-btn, #007bff);
    color: white;
  }

  .complete-btn:hover:not(:disabled) {
    background: var(--color-bg-btn-hover, #0056b3);
  }

  .complete-btn:disabled {
    background: var(--color-bg-option, #f8f9fa);
    color: var(--color-text-dark-inactive, #adb5bd);
    cursor: not-allowed;
  }
</style>
