<script>
  import { getContext, createEventDispatcher } from "svelte";
  
  export let readonly = false;
  
  const actor = getContext("#doc");
  const dispatch = createEventDispatcher();
  
  $: languages = $actor?.system?.traits?.languages || {};
  
  // Get current languages for display
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
      languages.labels.ranged.forEach(lang => {
        if (lang && lang.trim()) {
          result.push({ key: lang, label: lang, type: 'ranged' });
        }
      });
    }
    
    // Note: We ignore languages.custom since custom languages are now stored in languages.value
    // along with standard languages
    
    return result;
  })();
  
  // Comma-separated display
  $: commaSeparatedLanguages = currentLanguages.map(lang => lang.label).join(', ');
  
  // Open the built-in dnd5e language configuration dialog
  function openLanguageConfig() {
    if (readonly || !$actor) return;
    
    try {
      // Use the built-in dnd5e LanguagesConfig
      // eslint-disable-next-line no-undef
      new dnd5e.applications.actor.LanguagesConfig({ document: $actor }).render({ force: true });
    } catch (error) {
      console.error('Failed to open language configuration:', error);
      ui.notifications?.error?.('Failed to open language configuration dialog');
    }
  }
</script>

<template lang="pug">
  .languages-container
    .label.inline Languages
    .value
      +if("currentLanguages && currentLanguages.length > 0")
        span.languages-display {commaSeparatedLanguages}
        +if("!readonly")
          button.language-config-btn(
            on:click!="{openLanguageConfig}"
            title="Configure Languages"
            aria-label="Configure Languages"
          )
            i.fas.fa-cog
        +else()
          span.no-languages (no languages)
          +if("!readonly")
            button.language-config-btn(
              on:click!="{openLanguageConfig}"
              title="Configure Languages"
              aria-label="Configure Languages"
            )
              i.fas.fa-cog
</template>

<style lang="sass" scoped>
  @import "/Users/noeldacosta/code/foundryvtt-actor-studio/styles/Mixins.sass"

.languages-container
  .languages-display
    @include display-hover
  
  .no-languages
    @include empty-state
  
  .language-config-btn
    @include config-cog-btn
</style>
