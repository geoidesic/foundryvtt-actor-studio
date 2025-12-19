import { writable, get, derived } from 'svelte/store';
import LLM from '~/src/plugins/llm';
import { actorInGame, race, characterClass, level, background } from '~/src/stores/storeDefinitions';
import { updateSource } from '~/src/helpers/Utility';

// Biography generation options
export const biographyOptions = writable({
  name: true,
  ideals: true,
  flaws: true,
  bonds: true,
  personalityTraits: true,
  appearance: true,
  biography: true
});

// Generation state
export const isGenerating = writable(false);

// Token tracking
export const requestTokens = writable(400); // Initial value: 100 base + 6 options * 50 = 400
export const responseTokens = writable(0);

// Update request tokens when options change
biographyOptions.subscribe(($biographyOptions) => {
  const selectedOptions = Object.entries($biographyOptions).filter(([_, selected]) => selected).length;
  const baseTokens = 100; // Base prompt tokens
  const perOptionTokens = 50; // Tokens per selected option
  requestTokens.set(baseTokens + (selectedOptions * perOptionTokens));
});

// Editable biography content (for manual entry and generated content)
export const biographyContent = writable({
  name: '',
  ideals: '',
  flaws: '',
  bonds: '',
  personalityTraits: '',
  appearance: '',
  biography: ''
});

// Character details (optional fields for enhanced biography generation)
export const characterDetails = writable({
  height: '',
  weight: '',
  age: '',
  eyes: '',
  hair: '',
  skin: '',
  gender: '',
  faith: '',
  alignment: ''
});

// Sync biography content with actor data
actorInGame.subscribe(($actor) => {
  if ($actor) {
    biographyContent.update(content => ({
      ...content,
      name: $actor.name || content.name || '',
      ideals: $actor.system?.details?.ideals || content.ideals || '',
      flaws: $actor.system?.details?.flaws || content.flaws || '',
      bonds: $actor.system?.details?.bonds || content.bonds || '',
      personalityTraits: $actor.system?.details?.trait || content.personalityTraits || '',
      appearance: $actor.system?.details?.appearance || content.appearance || '',
      biography: $actor.system?.details?.biography?.value || content.biography || ''
    }));
  }
});

// Generate biography function
export async function generateBiography(actor = null) {
  if (get(isGenerating)) return;

  isGenerating.set(true);
  try {
    // Build the prompt based on selected options
    const selectedElements = Object.entries(get(biographyOptions))
      .filter(([key, selected]) => selected)
      .map(([key, _]) => key);

    if (selectedElements.length === 0) {
      ui.notifications.warn('Please select at least one biography element to generate.');
      return;
    }

    // Get race and class info for context
    const actorForData = actor || get(actorInGame);
    const selectedRace = get(race);
    const raceName = selectedRace?.name || actorForData?.system?.details?.race || 'human';
    
    // Get class name from actor data directly, since the UI store may not be populated
    let characterClassName = 'adventurer'; // default fallback
    if (actorForData?.classes && Object.keys(actorForData.classes).length > 0) {
      // Get the first (or only) class from the actor
      const firstClassKey = Object.keys(actorForData.classes)[0];
      const firstClass = actorForData.classes[firstClassKey];
      characterClassName = firstClass?.name || firstClassKey || 'adventurer';
    }
    
    // Also try the UI store as a fallback (for when class was selected in UI)
    const selectedCharacterClass = get(characterClass);
    if (!characterClassName || characterClassName === 'adventurer') {
      characterClassName = selectedCharacterClass?.name || characterClassName;
    }
    
    const characterLevel = get(level) || actorForData?.system?.details?.level || 1;
    const characterBackground = get(background)?.name || '';
    const abilities = actorForData?.system?.abilities || {};
    const details = get(characterDetails) || {};

    // Generate biography elements including name if selected
    if (selectedElements.length > 0) {
      // Log the data being sent to LLM for debugging
      const llmParams = {
        race: raceName,
        characterClass: characterClassName,
        level: characterLevel,
        background: characterBackground,
        abilityScores: abilities,
        characterDetails: details,
        elements: selectedElements
      };
      window.GAS.log.d('Biography LLM Request - full params:', JSON.stringify(llmParams, null, 2));
      window.GAS.log.d('Biography LLM Request - characterClass value:', characterClassName);
      window.GAS.log.d('Biography LLM Request:', llmParams);

      // Generate biography using LLM with comprehensive character data
      const result = await LLM.generateBiography(llmParams);

      // Update editable content with generated results
      biographyContent.set({ ...get(biographyContent), ...result });

      // Note: Actor updates are deferred until actor creation

      // Estimate response tokens (rough calculation)
      const responseText = Object.values(result).join(' ');
      responseTokens.set(Math.ceil(responseText.length / 4)); // Rough token estimate

      ui.notifications.info('Biography generated successfully!');
    }

  } catch (error) {
    console.error('Failed to generate biography:', error);
    ui.notifications.error('Failed to generate biography. Please try again.');
  } finally {
    isGenerating.set(false);
  }
}