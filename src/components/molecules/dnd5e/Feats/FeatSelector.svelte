<script>
  import { onMount } from "svelte";
  import { getFilteredFeats, enrichHTML } from "~/src/helpers/Utility.js";
  import { localize as t } from "~/src/helpers/Utility";

  export let actor = null;
  export let characterLevel = 1;
  export let onSelect = () => {};
  export let onClose = () => {};

  let feats = [];
  let filteredFeats = [];
  let searchTerm = "";
  let loading = true;
  let selectedFeat = null;
  let showIneligible = false;
  let enrichedFeatLinks = {};

  const isFeatSelected = (feat) => selectedFeat?._id === feat?._id;

  // Check if the character meets the level requirement
  const meetsLevelRequirement = (feat) => {
    const requiredLevel = feat?.system?.prerequisites?.level;
    if (requiredLevel == null) return true;
    return characterLevel >= requiredLevel;
  };

  // Check if the character has the required features
  const meetsFeatureRequirements = (feat) => {
    const requiredFeatures = feat?.system?.prerequisites?.features;
    if (!requiredFeatures || requiredFeatures.length === 0) return true;
    if (!actor) return true; // If no actor provided, can't check, so allow
    
    const actorItems = actor.items || [];
    
    // Check if all required features are present
    return requiredFeatures.every(requiredFeature => {
      // requiredFeature might be a string (feature name) or object with uuid/name
      const featureName = typeof requiredFeature === 'string' 
        ? requiredFeature 
        : (requiredFeature.name || requiredFeature.identifier);
      
      if (!featureName) return false;
      
      // Check if the actor has this feature (case-insensitive)
      return actorItems.some(item => 
        item.name?.toLowerCase() === featureName.toLowerCase()
      );
    });
  };

  // Check if the character has the required ability scores
  const meetsAbilityRequirements = (feat) => {
    const requiredAbilities = feat?.system?.prerequisites?.abilities;
    if (!requiredAbilities || requiredAbilities.length === 0) return true;
    if (!actor) return true; // If no actor provided, can't check, so allow
    
    const actorAbilities = actor.system?.abilities || {};
    
    // Check if all required ability scores are met
    return requiredAbilities.every(abilityReq => {
      const abilityKey = abilityReq.ability || abilityReq.key;
      const requiredValue = abilityReq.value || abilityReq.minimum || 13; // Default to 13 if not specified
      
      if (!abilityKey) return false;
      
      const actorAbility = actorAbilities[abilityKey];
      const actorValue = actorAbility?.value ?? 0;
      
      return actorValue >= requiredValue;
    });
  };

  // Check if the character meets all prerequisites
  const meetsAllPrerequisites = (feat) => {
    return meetsLevelRequirement(feat) 
      && meetsFeatureRequirements(feat)
      && meetsAbilityRequirements(feat);
  };

  // Get a human-readable reason why the feat is ineligible
  const getIneligibilityReason = (feat) => {
    const reasons = [];
    
    if (!meetsLevelRequirement(feat)) {
      const required = feat?.system?.prerequisites?.level;
      reasons.push(`Requires level ${required} (you are level ${characterLevel})`);
    }
    
    if (!meetsFeatureRequirements(feat)) {
      const required = feat?.system?.prerequisites?.features || [];
      const missing = required.filter(requiredFeature => {
        const featureName = typeof requiredFeature === 'string' 
          ? requiredFeature 
          : (requiredFeature.name || requiredFeature.identifier);
        
        return !actor?.items?.some(item => 
          item.name?.toLowerCase() === featureName?.toLowerCase()
        );
      });
      
      if (missing.length > 0) {
        const names = missing.map(f => typeof f === 'string' ? f : (f.name || f.identifier)).join(', ');
        reasons.push(`Requires feature(s): ${names}`);
      }
    }
    
    if (!meetsAbilityRequirements(feat)) {
      const required = feat?.system?.prerequisites?.abilities || [];
      const unmet = required.filter(abilityReq => {
        const abilityKey = abilityReq.ability || abilityReq.key;
        const requiredValue = abilityReq.value || abilityReq.minimum || 13;
        const actorValue = actor?.system?.abilities?.[abilityKey]?.value ?? 0;
        return actorValue < requiredValue;
      });
      
      if (unmet.length > 0) {
        const details = unmet.map(a => {
          const key = (a.ability || a.key).toUpperCase();
          const val = a.value || a.minimum || 13;
          return `${key} ${val}`;
        }).join(', ');
        reasons.push(`Requires: ${details}`);
      }
    }
    
    return reasons.join('; ');
  };

  onMount(async () => {
    try {
      feats = await getFilteredFeats();
      filteredFeats = feats;
      
      // Pre-enrich all feat links for tooltips
      for (const feat of feats) {
        if (feat.uuid) {
          const link = `@UUID[${feat.uuid}]{${feat.name}}`;
          enrichedFeatLinks[feat._id] = await enrichHTML(link, { async: true });
        }
      }
    } catch (error) {
      window.GAS.log.e('[FeatSelector] Error loading feats:', error);
    } finally {
      loading = false;
    }
  });

  $: {
    let filtered = feats;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(feat =>
        feat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feat.system?.description?.value?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply prerequisite filter unless showIneligible is true
    if (!showIneligible && actor) {
      filtered = filtered.filter(feat => meetsAllPrerequisites(feat));
    }
    
    filteredFeats = filtered;
  }

  function handleFeatSelect(feat) {
    selectedFeat = feat;
  }

  function handleConfirm() {
    if (selectedFeat) {
      onSelect(selectedFeat);
      onClose();
    }
  }

  function handleCancel() {
    onClose();
  }
</script>

<template lang="pug">
.feat-selector-overlay
  .feat-selector-modal
    .feat-selector-header
      h2 {t('FeatSelector.Title', 'Select a Feat')}
      button.close-button(type="button" on:click="{handleCancel}")
        i.fa-solid.fa-times

    .feat-selector-content
      +if("loading")
        .loading-state
          i.fa-solid.fa-spinner.fa-spin
          p {t('FeatSelector.Loading', 'Loading feats...')}

        +else
          +if("feats.length === 0")
            .empty-state
              i.fa-solid.fa-exclamation-triangle
              p {t('FeatSelector.NoFeats', 'No feats available. Check your compendium sources in settings.')}

            +else
              .search-section
                input.search-input(
                  type="text"
                  placeholder="{t('FeatSelector.Search', 'Search feats...')}"
                  bind:value="{searchTerm}"
                )
                +if("actor")
                  label.show-ineligible-toggle
                    input(type="checkbox" bind:checked="{showIneligible}")
                    span {t('FeatSelector.ShowIneligible', 'Show ineligible feats')}

              .feats-list
                +each("filteredFeats as feat")
                  .feat-item(
                    class:selected!="{isFeatSelected(feat)}"
                    class:ineligible!="{!meetsAllPrerequisites(feat)}"
                    on:click!="{() => handleFeatSelect(feat)}"
                  )
                    .feat-icon
                      img(src!="{feat.img || '/icons/svg/mystery-man.svg'}" alt!="{feat.name}")
                    +if("enrichedFeatLinks[feat._id]")
                      .feat-link {@html enrichedFeatLinks[feat._id]}
                      +else()
                        .feat-link {feat.name}
                    +if("!meetsAllPrerequisites(feat)")
                      .feat-ineligibility-reason
                        i.fa-solid.fa-exclamation-triangle
                        span {@html getIneligibilityReason(feat)}

              .feat-selector-footer
                +if("selectedFeat")
                  .selected-feat-info
                    h4 Selected: {selectedFeat.name}
                    button.confirm-button(type="button" on:click="{handleConfirm}") {t('FeatSelector.Select', 'Select Feat')}
                button.cancel-button(type="button" on:click="{handleCancel}") {t('FeatSelector.Cancel', 'Cancel')}
</template>

<style lang="sass">
@import "../../../../../styles/Mixins.sass"

.feat-selector-overlay
  position: fixed
  top: 0
  left: 0
  width: 100%
  height: 100%
  background: rgba(0, 0, 0, 0.8)
  display: flex
  align-items: center
  justify-content: center
  z-index: 10000

.feat-selector-modal
  background: var(--tabs-content-background)
  border: 1px solid #000
  border-radius: 12px
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.8)
  width: 90%
  max-width: 600px
  max-height: 80vh
  display: flex
  flex-direction: column
  box-shadow: 0 0px 20px 2px var(--color-shadow-primary)

.feat-selector-header
  display: flex
  justify-content: space-between
  align-items: center
  padding: 0.5rem 1rem
  background: rgba(0, 0, 0, 0.2)
  border-bottom: 1px solid rgba(0, 0, 0, 0.5)

  h2
    margin: 0
    color: var(--color-highlight)
    font-size: 2rem
    font-weight: normal
    font-family: "Modesto Condensed"

  .close-button
    background: transparent
    border: none
    color: var(--gas-color-text, #f0f0e0)
    font-size: 1.2rem
    cursor: pointer
    padding: 0
    width: 24px
    height: 24px
    display: flex
    align-items: center
    justify-content: center

    &:hover
      color: var(--dnd5e-color-gold, #c9c9c9)

.feat-selector-content
  flex: 1
  overflow-y: auto
  padding: 0.5rem

.search-section
  margin-bottom: 0.5rem
  display: flex
  flex-direction: column
  gap: 0.35rem

  .search-input
    width: 100%
    padding: 0.35rem 0.5rem
    border: 1px solid #7a7971
    border-radius: 3px
    background: rgba(0, 0, 0, 0.25)
    color: var(--gas-color-text, #f0f0e0)
    font-size: 0.9rem
    font-family: "Signika", sans-serif

    &:focus
      outline: none
      border-color: var(--dnd5e-color-gold, #c9c9c9)
      box-shadow: 0 0 5px rgba(255, 255, 255, 0.1)

    &::placeholder
      color: rgba(240, 240, 224, 0.5)

  .show-ineligible-toggle
    display: flex
    align-items: center
    gap: 0.5rem
    font-size: 0.85rem
    color: var(--gas-color-text, #f0f0e0)
    cursor: pointer
    font-family: "Signika", sans-serif

    input[type="checkbox"]
      cursor: pointer

    span
      user-select: none

.feats-list
  @include inset(#7a7971, 0.35rem)
  max-height: 400px
  overflow-y: auto
  background: rgba(0, 0, 0, 0.2)

.feat-item
  display: flex
  align-items: center
  gap: 0.5rem
  padding: 0.25rem 0.5rem
  margin-bottom: 2px
  cursor: pointer
  background: rgba(255, 255, 255, 0.05)
  border: 1px solid transparent
  transition: all 0.15s ease

  &:hover
    background: rgba(255, 255, 255, 0.1)
    border-color: rgba(255, 255, 255, 0.2)

  &.selected
    background: var(--select-option-highlight-color, #5e5437)
    border-color: var(--dnd5e-color-gold, #c9c9c9)

  &.ineligible
    opacity: 0.5
    cursor: not-allowed

    &:hover
      background: rgba(139, 48, 48, 0.2)
      border-color: rgba(139, 48, 48, 0.4)

  .feat-icon
    width: 24px
    height: 24px
    border-radius: 2px
    overflow: hidden
    flex-shrink: 0
    border: 1px solid rgba(0, 0, 0, 0.3)

    img
      width: 100%
      height: 100%
      object-fit: cover

  .feat-link
    flex: 1
    font-size: 0.9rem
    color: var(--gas-color-text, #f0f0e0)
    font-family: "Signika", sans-serif

    :global(a.content-link)
      color: var(--gas-color-text, #f0f0e0)
      text-decoration: none

      &:hover
        color: var(--dnd5e-color-gold, #c9c9c9)
        text-shadow: 0 0 4px rgba(255, 255, 255, 0.3)

  .feat-ineligibility-reason
    font-size: 0.75rem
    color: #ff6b6b
    margin-left: 0.5rem
    display: flex
    align-items: center
    gap: 0.25rem
    white-space: nowrap
    font-family: "Signika", sans-serif

    i
      font-size: 0.7rem

.feat-selector-footer
  display: flex
  justify-content: flex-end
  align-items: center
  gap: 0.5rem
  padding: 0.5rem 1rem
  background: rgba(0, 0, 0, 0.2)
  border-top: 1px solid rgba(0, 0, 0, 0.5)

  .selected-feat-info
    flex: 1
    display: flex
    align-items: center

    h4
      margin: 0
      color: var(--gas-color-text, #f0f0e0)
      font-size: 0.9rem
      font-weight: normal
      font-family: "Signika", sans-serif

  .confirm-button, .cancel-button
    padding: 0.35rem 0.75rem
    margin-left: 1rem
    border-radius: 3px
    cursor: pointer
    font-weight: normal
    font-size: 0.9rem
    font-family: "Signika", sans-serif
    transition: all 0.15s ease

  .confirm-button
    background: linear-gradient(180deg, #5e5437 0%, #4a4229 100%)
    color: #f0f0e0
    border: 1px solid #7a7971
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.5)

    &:hover
      background: linear-gradient(180deg, #6e6447 0%, #5a5239 100%)
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.2)

  .cancel-button
    background: transparent
    color: var(--gas-color-text, #f0f0e0)
    border: 1px solid #7a7971

    &:hover
      background: rgba(255, 255, 255, 0.1)
      border-color: #c9c9c9

.loading-state, .empty-state
  text-align: center
  padding: 2rem
  color: var(--gas-color-text, #f0f0e0)
  font-family: "Signika", sans-serif

  i
    font-size: 2rem
    margin-bottom: 1rem
    display: block
    color: var(--dnd5e-color-gold, #c9c9c9)

  p
    margin: 0
    font-size: 1rem
</style>