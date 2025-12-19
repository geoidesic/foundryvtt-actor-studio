import { writable, get, derived } from 'svelte/store';
import LLM from '~/src/plugins/llm';
import { actorInGame, race } from '~/src/stores/storeDefinitions';
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
export async function generateBiography() {
  if (get(isGenerating)) return;

  isGenerating.set(true);
  try {
    // Build the prompt based on selected options
    const selectedElements = Object.entries(get(biographyOptions))
      .filter(([key, selected]) => selected && key !== 'name') // Exclude name from biography elements
      .map(([key, _]) => key);

    if (selectedElements.length === 0 && !get(biographyOptions).name) {
      ui.notifications.warn('Please select at least one biography element or name to generate.');
      return;
    }

    // Get race and class info for context
    const actor = get(actorInGame);
    const selectedRace = get(race);
    const raceName = selectedRace?.name || actor?.system?.details?.race || 'human';
    const characterClass = actor?.classes ? Object.keys(actor.classes)[0] : 'adventurer';
    const level = actor?.system?.details?.level || 1;

    // Generate name if selected
    if (get(biographyOptions).name) {
      try {
        const name = await LLM.generateName(raceName + ' lang: en avoiding patterns or common starting letters. Ensure the name is different with each request.');
        // Update the actor name
        await updateSource(actor, { name: name });
        // Update the biography content store
        biographyContent.update(content => ({ ...content, name: name }));
        ui.notifications.info('Character name generated successfully!');
      } catch (nameError) {
        console.error('Failed to generate name:', nameError);
        ui.notifications.error('Failed to generate character name');
      }
    }

    // Generate biography elements if any are selected
    if (selectedElements.length > 0) {
      // Generate biography using LLM
      const result = await LLM.generateBiography({
        race: raceName,
        characterClass,
        level,
        elements: selectedElements
      });

      // Update editable content with generated results
      biographyContent.set({ ...get(biographyContent), ...result });

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