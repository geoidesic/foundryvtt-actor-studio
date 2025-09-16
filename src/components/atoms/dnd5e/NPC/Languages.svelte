<script>
  import { getContext, createEventDispatcher } from "svelte";
  
  export let languages = {};
  export let readonly = false;
  
  const actor = getContext("#doc");
  const dispatch = createEventDispatcher();
  
  // Debug logging
  $: if (languages) {
    console.log('🔍 Languages component received data:', languages);
    console.log('🔍 Languages type:', typeof languages);
    console.log('🔍 Languages keys:', Object.keys(languages || {}));
    if (languages.labels) {
      console.log('🔍 languages.labels:', languages.labels);
      console.log('🔍 languages.labels.languages:', languages.labels.languages);
    }
  }
  
  // Available standard D&D 5e languages
  const availableLanguages = [
    { key: 'common', label: 'Common' },
    { key: 'dwarvish', label: 'Dwarvish' },
    { key: 'elvish', label: 'Elvish' },
    { key: 'giant', label: 'Giant' },
    { key: 'gnomish', label: 'Gnomish' },
    { key: 'goblin', label: 'Goblin' },
    { key: 'halfling', label: 'Halfling' },
    { key: 'orc', label: 'Orc' },
    { key: 'abyssal', label: 'Abyssal' },
    { key: 'celestial', label: 'Celestial' },
    { key: 'draconic', label: 'Draconic' },
    { key: 'deep-speech', label: 'Deep Speech' },
    { key: 'infernal', label: 'Infernal' },
    { key: 'primordial', label: 'Primordial' },
    { key: 'sylvan', label: 'Sylvan' },
    { key: 'undercommon', label: 'Undercommon' }
  ];
  
  // Get current languages that are selected
  $: currentLanguages = (() => {
    if (!languages) return [];
    
    const result = [];
    const seenLanguages = new Set(); // Track seen languages to prevent duplicates
    
    // Helper function to add language if not already seen
    const addLanguageIfUnique = (lang, type) => {
      if (lang && lang.trim()) {
        const trimmedLang = lang.trim();
        if (!seenLanguages.has(trimmedLang)) {
          seenLanguages.add(trimmedLang);
          result.push({ key: trimmedLang, label: trimmedLang, type });
        }
      }
    };
    
    // Handle different possible data structures
    if (languages.value && Array.isArray(languages.value)) {
      // Standard array structure
      languages.value.forEach(lang => addLanguageIfUnique(lang, 'standard'));
    } else if (languages.labels && languages.labels.languages && Array.isArray(languages.labels.languages)) {
      // FoundryVTT 13+ structure: languages.labels.languages array
      languages.labels.languages.forEach(lang => addLanguageIfUnique(lang, 'standard'));
    } else if (languages.labels && Array.isArray(languages.labels)) {
      // Fallback: labels array structure
      languages.labels.forEach(lang => addLanguageIfUnique(lang, 'standard'));
    } else if (typeof languages === 'string') {
      // Simple string structure
      const langParts = languages.split(',').map(s => s.trim()).filter(Boolean);
      langParts.forEach(lang => addLanguageIfUnique(lang, 'standard'));
    }
    
    // Handle ranged languages (like telepathy)
    if (languages.labels && languages.labels.ranged && Array.isArray(languages.labels.ranged)) {
      console.log('🔍 Found ranged languages:', languages.labels.ranged);
      languages.labels.ranged.forEach(lang => {
        console.log('🔍 Adding ranged language:', lang);
        addLanguageIfUnique(lang, 'ranged');
      });
    } else {
      console.log('🔍 No ranged languages found. languages.labels:', languages.labels);
      console.log('🔍 languages.labels.ranged:', languages.labels?.ranged);
    }
    
    // Note: We don't display languages.value Set as it contains metadata (like "standard", "exotic")
    // not actual language names. We only show actual languages and ranged abilities.
    
    // Add custom languages (only if not already seen from other sources)
    if (languages.custom && languages.custom.trim()) {
      addLanguageIfUnique(languages.custom, 'custom');
    }
    
    return result;
  })();
  
  // Get available languages to add (excluding already selected ones)
  $: availableLanguagesToAdd = availableLanguages.filter(lang => 
    !currentLanguages.some(selected => selected.key === lang.key)
  );
  
  // Comma-separated display for non-edit mode
  $: commaSeparatedLanguages = currentLanguages.map(lang => lang.label).join(', ');
  
  // Helper functions
  function getLanguageLabel(key) {
    return availableLanguages.find(l => l.key === key)?.label || key;
  }
  
  // State for adding new languages
  let showAddSelect = false;
  let newLanguageType = '';
  let newCustomLanguage = '';
  let showCustomInput = false;
  let isEditing = false;
  
  function handleAddLanguage() {
    if (availableLanguagesToAdd.length > 0) {
      showAddSelect = true;
      newLanguageType = availableLanguagesToAdd[0].key;
      showCustomInput = false;
    }
  }
  
  function handleAddCustomLanguage() {
    showCustomInput = true;
    showAddSelect = false;
    newCustomLanguage = '';
  }
  
  function startEditing() {
    if (!readonly) {
      isEditing = true;
    }
  }
  
  function stopEditing() {
    isEditing = false;
    showAddSelect = false;
    showCustomInput = false;
  }
  
  function confirmAddLanguage() {
    if (newLanguageType) {
      dispatch('languageUpdate', { 
        type: 'add',
        language: newLanguageType,
        isCustom: false
      });
      showAddSelect = false;
      newLanguageType = '';
    }
  }
  
  function confirmAddCustomLanguage() {
    if (newCustomLanguage && newCustomLanguage.trim()) {
      dispatch('languageUpdate', { 
        type: 'add',
        language: newCustomLanguage.trim(),
        isCustom: true
      });
      showCustomInput = false;
      newCustomLanguage = '';
    }
  }
  
  function cancelAddLanguage() {
    showAddSelect = false;
    newLanguageType = '';
  }
  
  function cancelAddCustomLanguage() {
    showCustomInput = false;
    newCustomLanguage = '';
  }
  
  function handleRemoveLanguage(languageKey, languageType) {
    dispatch('languageUpdate', { 
      type: 'remove',
      language: languageKey,
      isCustom: languageType === 'custom'
    });
  }
</script>

<template lang="pug">
    .languages-container
      .label.inline Languages
      .value
        +if("!isEditing")
          +if("currentLanguages && currentLanguages.length > 0")
            span.languages-display(
              on:click!="{startEditing}"
              class!="{readonly ? '' : 'editable'}"
              title!="{readonly ? '' : 'Click to edit languages'}"
            ) {commaSeparatedLanguages}
            +else()
              span.no-languages(
                on:click!="{startEditing}"
                class!="{readonly ? '' : 'editable'}"
                title!="{readonly ? '' : 'Click to add languages'}"
              ) (no languages)
        +if("isEditing")
          .languages-edit-mode
            +if("currentLanguages && currentLanguages.length > 0")
              +each("currentLanguages as language")
                .language-item(class!="language-{language.type}")
                  span.language-name(class!="language-type-{language.type}") {language.label}
                  button.button-remove(
                    on:click!="{() => handleRemoveLanguage(language.key, language.type)}"
                    title="Remove {language.label}"
                  ) ×
      
      +if("isEditing && !readonly")
        +if("showAddSelect")
          .add-language-form
            select.language-type-select(
              bind:value="{newLanguageType}"
            )
              +each("availableLanguagesToAdd as language")
                option(value="{language.key}") {language.label}
            button.button-confirm(
              on:click!="{confirmAddLanguage}"
              title="Add Language"
            ) ✓
            button.button-cancel(
              on:click!="{cancelAddLanguage}"
              title="Cancel"
            ) ×
        +if("showCustomInput")
          .add-custom-language-form
            input.custom-language-input(
              type="text"
              bind:value="{newCustomLanguage}"
              placeholder="Enter custom language"
              on:keydown!="{e => e.key === 'Enter' && confirmAddCustomLanguage()}"
            )
            button.button-confirm(
              on:click!="{confirmAddCustomLanguage}"
              title="Add Custom Language"
            ) ✓
            button.button-cancel(
              on:click!="{cancelAddCustomLanguage}"
              title="Cancel"
            ) ×
        +if("!showAddSelect && !showCustomInput")
          .add-language-buttons
            +if("availableLanguagesToAdd.length > 0")
              button.button-confirm(
                on:click!="{handleAddLanguage}"
                title="Add standard language"
              ) +
            button.button-primary(
              on:click!="{handleAddCustomLanguage}"
              title="Add custom language"
            ) + Custom
            button.button-confirm(
              on:click!="{stopEditing}"
              title="Done editing"
            ) ✓
</template>

<style lang="sass" scoped>
  @import "/Users/noeldacosta/code/foundryvtt-actor-studio/styles/Mixins.sass"
.languages-container
  .languages-display
    @include display-hover
  
  .no-languages
    @include empty-state
  
  
  .languages-edit-mode
    margin-top: 4px
  
  .language-item
    @include item-list
    
    .language-name
      font-weight: 500
      min-width: 80px
      
      &.language-type-standard
        color: var(--color-text-highlight, #ffffff)
      
      &.language-type-ranged
        color: var(--color-info, #17a2b8)
        font-style: italic
      
      &.language-type-category
        color: var(--color-warning, #ffc107)
        font-size: 0.9em
      
      &.language-type-custom
        color: var(--color-success, #28a745)
        font-style: italic
    
    .button-remove
      @include button-remove
  
  .add-language-buttons
    @include button-container
    
  
  .add-language-form,
  .add-custom-language-form
    @include form-container
    margin-top: 4px
    
    .language-type-select
      @include form-select
      min-width: 120px
    
    .custom-language-input
      @include form-input
      min-width: 120px
    
  
  .no-languages
    color: var(--color-text-secondary, #666)
    font-style: italic

// Dark theme overrides
@media (prefers-color-scheme: dark)
  .languages-container
    .add-language-form,
    .add-custom-language-form
      .language-type-select,
      .custom-language-input
        background: var(--color-bg-primary, #2b2b2b)
        color: var(--color-text-primary, #ffffff)
        border-color: var(--color-border-highlight, #4a9eff)
        
        &:focus
          border-color: var(--color-border-highlight, #4a9eff)
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.25)

:global(.dark-mode)
  .languages-container
    .add-language-form,
    .add-custom-language-form
      .language-type-select,
      .custom-language-input
        background: var(--color-bg-primary, #2b2b2b)
        color: var(--color-text-primary, #ffffff)
        border-color: var(--color-border-highlight, #4a9eff)
        
        &:focus
          border-color: var(--color-border-highlight, #4a9eff)
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.25)
</style>
