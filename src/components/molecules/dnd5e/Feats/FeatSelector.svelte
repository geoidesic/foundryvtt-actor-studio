<script>
  import { onMount } from "svelte";
  import { getFilteredFeats } from "~/src/helpers/Utility.js";
  import { localize as t } from "~/src/helpers/Utility";

  export let onSelect = () => {};
  export let onClose = () => {};

  let feats = [];
  let filteredFeats = [];
  let searchTerm = "";
  let loading = true;
  let selectedFeat = null;

  const isFeatSelected = (feat) => selectedFeat?._id === feat?._id;
  const getFeatImage = (feat) => feat?.img || '/icons/svg/mystery-man.svg';
  const hasPrerequisiteLevel = (feat) => Boolean(feat?.system?.prerequisites && feat.system.prerequisites.level != null);
  const getPrerequisiteLevel = (feat) => feat?.system?.prerequisites?.level ?? '';
  const hasFeatDescription = (feat) => Boolean(feat?.system?.description?.value);
  const getFeatDescriptionSnippet = (feat) => {
    const raw = feat?.system?.description?.value ?? '';
    if (!raw) return '';
    return raw.length > 100 ? `${raw.substring(0, 100)}...` : raw;
  };

  onMount(async () => {
    try {
      feats = await getFilteredFeats();
      filteredFeats = feats;
    } catch (error) {
      window.GAS.log.e('[FeatSelector] Error loading feats:', error);
    } finally {
      loading = false;
    }
  });

  $: if (searchTerm) {
    filteredFeats = feats.filter(feat =>
      feat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feat.system?.description?.value?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } else {
    filteredFeats = feats;
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

              .feats-list
                +each("filteredFeats as feat")
                  .feat-item(
                    class:selected!="{isFeatSelected(feat)}"
                    on:click!="{() => handleFeatSelect(feat)}"
                  )
                    .feat-image
                      img(src!="{getFeatImage(feat)}" alt!="{feat.name}")
                    .feat-details
                      h4.feat-name {feat.name}
                      +if("hasPrerequisiteLevel(feat)")
                        .feat-prereq Level {getPrerequisiteLevel(feat)}
                      +if("hasFeatDescription(feat)")
                        .feat-description {@html getFeatDescriptionSnippet(feat)}

              .feat-selector-footer
                +if("selectedFeat")
                  .selected-feat-info
                    h4 Selected: {selectedFeat.name}
                    button.confirm-button(type="button" on:click="{handleConfirm}") {t('FeatSelector.Select', 'Select Feat')}
                button.cancel-button(type="button" on:click="{handleCancel}") {t('FeatSelector.Cancel', 'Cancel')}
</template>

<style lang="sass">
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
  z-index: 1000

.feat-selector-modal
  background: var(--color-bg-primary)
  border: 1px solid var(--color-border-primary)
  border-radius: var(--border-radius)
  width: 80%
  max-width: 800px
  max-height: 80%
  display: flex
  flex-direction: column
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5)

.feat-selector-header
  display: flex
  justify-content: space-between
  align-items: center
  padding: 1rem
  border-bottom: 1px solid var(--color-border-primary)

  h2
    margin: 0
    color: var(--color-text-primary)

  .close-button
    background: none
    border: none
    color: var(--color-text-secondary)
    font-size: 1.2rem
    cursor: pointer

    &:hover
      color: var(--color-text-primary)

.feat-selector-content
  flex: 1
  overflow-y: auto
  padding: 1rem

.search-section
  margin-bottom: 1rem

  .search-input
    width: 100%
    padding: 0.5rem
    border: 1px solid var(--color-border-primary)
    border-radius: var(--border-radius)
    background: var(--color-bg-secondary)
    color: var(--color-text-primary)

.feats-list
  max-height: 400px
  overflow-y: auto

.feat-item
  display: flex
  align-items: center
  padding: 0.75rem
  border: 1px solid var(--color-border-primary)
  border-radius: var(--border-radius)
  margin-bottom: 0.5rem
  cursor: pointer
  transition: all 0.2s ease

  &:hover
    background: var(--color-bg-secondary)
    border-color: var(--color-border-highlight)

  &.selected
    background: var(--color-bg-highlight)
    border-color: var(--color-border-highlight)

  .feat-image
    width: 40px
    height: 40px
    margin-right: 1rem
    border-radius: var(--border-radius)
    overflow: hidden

    img
      width: 100%
      height: 100%
      object-fit: cover

  .feat-details
    flex: 1

    .feat-name
      margin: 0 0 0.25rem 0
      color: var(--color-text-primary)

    .feat-prereq
      font-size: 0.8rem
      color: var(--color-text-secondary)
      margin-bottom: 0.25rem

    .feat-description
      font-size: 0.9rem
      color: var(--color-text-secondary)
      line-height: 1.4

.feat-selector-footer
  display: flex
  justify-content: space-between
  align-items: center
  padding: 1rem
  border-top: 1px solid var(--color-border-primary)

  .selected-feat-info
    display: flex
    align-items: center
    gap: 1rem

    h4
      margin: 0
      color: var(--color-text-primary)

  .confirm-button
    background: var(--color-button-primary)
    color: var(--color-text-button)
    border: none
    padding: 0.5rem 1rem
    border-radius: var(--border-radius)
    cursor: pointer

    &:hover
      background: var(--color-button-primary-hover)

  .cancel-button
    background: var(--color-button-secondary)
    color: var(--color-text-secondary)
    border: 1px solid var(--color-border-primary)
    padding: 0.5rem 1rem
    border-radius: var(--border-radius)
    cursor: pointer

    &:hover
      background: var(--color-bg-secondary)

.loading-state, .empty-state
  text-align: center
  padding: 2rem
  color: var(--color-text-secondary)

  i
    font-size: 2rem
    margin-bottom: 1rem
    display: block

  p
    margin: 0
</style>