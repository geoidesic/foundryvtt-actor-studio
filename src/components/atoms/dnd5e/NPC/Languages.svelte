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
    
    // Handle different possible data structures
    if (languages.value && Array.isArray(languages.value)) {
      // Standard array structure
      languages.value.forEach(lang => {
        if (lang && lang.trim()) {
          result.push({ key: lang, label: lang, type: 'standard' });
        }
      });
    } else if (languages.labels && languages.labels.languages && Array.isArray(languages.labels.languages)) {
      // FoundryVTT 13+ structure: languages.labels.languages array
      languages.labels.languages.forEach(lang => {
        if (lang && lang.trim()) {
          result.push({ key: lang, label: lang, type: 'standard' });
        }
      });
    } else if (languages.labels && Array.isArray(languages.labels)) {
      // Fallback: labels array structure
      languages.labels.forEach(lang => {
        if (lang && lang.trim()) {
          result.push({ key: lang, label: lang, type: 'standard' });
        }
      });
    } else if (typeof languages === 'string') {
      // Simple string structure
      const langParts = languages.split(',').map(s => s.trim()).filter(Boolean);
      langParts.forEach(lang => {
        result.push({ key: lang, label: lang, type: 'standard' });
      });
    }
    
    // Handle ranged languages (like telepathy)
    if (languages.labels && languages.labels.ranged && Array.isArray(languages.labels.ranged)) {
      console.log('🔍 Found ranged languages:', languages.labels.ranged);
      languages.labels.ranged.forEach(lang => {
        if (lang && lang.trim()) {
          console.log('🔍 Adding ranged language:', lang);
          result.push({ key: lang, label: lang, type: 'ranged' });
        }
      });
    } else {
      console.log('🔍 No ranged languages found. languages.labels:', languages.labels);
      console.log('🔍 languages.labels.ranged:', languages.labels?.ranged);
    }
    
    // Note: We don't display languages.value Set as it contains metadata (like "standard", "exotic")
    // not actual language names. We only show actual languages and ranged abilities.
    
    // Add custom languages
    if (languages.custom && languages.custom.trim()) {
      result.push({ key: languages.custom, label: languages.custom, type: 'custom' });
    }
    
    return result;
  })();
  
  // Get available languages to add (excluding already selected ones)
  $: availableLanguagesToAdd = availableLanguages.filter(lang => 
    !currentLanguages.some(selected => selected.key === lang.key)
  );
  
  // Helper functions
  function getLanguageLabel(key) {
    return availableLanguages.find(l => l.key === key)?.label || key;
  }
  
  // State for adding new languages
  let showAddSelect = false;
  let newLanguageType = '';
  let newCustomLanguage = '';
  let showCustomInput = false;
  
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
      +if("currentLanguages && currentLanguages.length > 0")
        +each("currentLanguages as language")
          .language-item(class!="language-{language.type}")
            span.language-name(class!="language-type-{language.type}") {language.label}
            +if("!readonly")
              button.remove-btn(
                on:click!="{() => handleRemoveLanguage(language.key, language.type)}"
                title="Remove {language.label}"
              ) ×
      
      +if("!readonly")
        +if("showAddSelect")
          .add-language-form
            select.language-type-select(
              bind:value="{newLanguageType}"
            )
              +each("availableLanguagesToAdd as language")
                option(value="{language.key}") {language.label}
            button.confirm-btn(
              on:click!="{confirmAddLanguage}"
              title="Add Language"
            ) ✓
            button.cancel-btn(
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
            button.confirm-btn(
              on:click!="{confirmAddCustomLanguage}"
              title="Add Custom Language"
            ) ✓
            button.cancel-btn(
              on:click!="{cancelAddCustomLanguage}"
              title="Cancel"
            ) ×
        +if("!showAddSelect && !showCustomInput")
          .add-language-buttons
            +if("availableLanguagesToAdd.length > 0")
              button.add-btn(
                on:click!="{handleAddLanguage}"
                title="Add standard language"
              ) + Add Language
            button.add-custom-btn(
              on:click!="{handleAddCustomLanguage}"
              title="Add custom language"
            ) + Add Custom
      
      +if("!currentLanguages || currentLanguages.length === 0")
        span.no-languages (no languages)
</template>

<style lang="sass" scoped>
.languages-container
  .language-item
    display: flex
    align-items: center
    gap: 6px
    margin-bottom: 3px
    
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
  
  .add-language-buttons
    display: flex
    gap: 8px
    margin-top: 4px
    
    .add-btn,
    .add-custom-btn
      background: var(--color-success, #28a745)
      color: white
      border: none
      border-radius: 3px
      padding: 4px 8px
      cursor: pointer
      font-size: 0.9em
      
      &:hover
        background: var(--color-success-hover, #218838)
    
    .add-custom-btn
      background: var(--color-info, #17a2b8)
      
      &:hover
        background: var(--color-info-hover, #138496)
  
  .add-language-form,
  .add-custom-language-form
    display: flex
    align-items: center
    gap: 4px
    margin-top: 4px
    
    .language-type-select
      min-width: 120px
      padding: 2px 4px
      border: 1px solid var(--color-border-highlight, #007bff)
      border-radius: 3px
      background: var(--color-bg-primary, white)
      color: var(--color-text-primary, #333)
      font-size: inherit
      font-family: inherit
      
      &:focus
        outline: none
        border-color: var(--color-border-highlight, #007bff)
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25)
    
    .custom-language-input
      min-width: 120px
      padding: 2px 4px
      border: 1px solid var(--color-border-highlight, #007bff)
      border-radius: 3px
      background: var(--color-bg-primary, white)
      color: var(--color-text-primary, #333)
      font-size: inherit
      font-family: inherit
      
      &:focus
        outline: none
        border-color: var(--color-border-highlight, #007bff)
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25)
    
    .confirm-btn
      background: var(--color-success, #28a745)
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
        background: var(--color-success-hover, #218838)
    
    .cancel-btn
      background: var(--color-secondary, #6c757d)
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
        background: var(--color-secondary-hover, #5a6268)
  
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
