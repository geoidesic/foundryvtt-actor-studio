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
  biography: '',
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
      name: content.name || $actor.name || '',
      ideals: content.ideals || $actor.system?.details?.ideal || '',
      flaws: content.flaws || $actor.system?.details?.flaw || '',
      bonds: content.bonds || $actor.system?.details?.bond || '',
      personalityTraits: content.personalityTraits || $actor.system?.details?.trait || '',
      appearance: content.appearance || $actor.system?.details?.appearance || '',
      biography: content.biography || $actor.system?.details?.biography?.value || '',
      height: content.height || $actor.system?.details?.height || '',
      weight: content.weight || $actor.system?.details?.weight || '',
      age: content.age || $actor.system?.details?.age || '',
      eyes: content.eyes || $actor.system?.details?.eyes || '',
      hair: content.hair || $actor.system?.details?.hair || '',
      skin: content.skin || $actor.system?.details?.skin || '',
      gender: content.gender || $actor.system?.details?.gender || '',
      faith: content.faith || $actor.system?.details?.faith || '',
      alignment: content.alignment || $actor.system?.details?.alignment || ''
    }));

    // Also sync characterDetails store
    characterDetails.update(details => ({
      ...details,
      height: details.height || $actor.system?.details?.height || '',
      weight: details.weight || $actor.system?.details?.weight || '',
      age: details.age || $actor.system?.details?.age || '',
      eyes: details.eyes || $actor.system?.details?.eyes || '',
      hair: details.hair || $actor.system?.details?.hair || '',
      skin: details.skin || $actor.system?.details?.skin || '',
      gender: details.gender || $actor.system?.details?.gender || '',
      faith: details.faith || $actor.system?.details?.faith || '',
      alignment: details.alignment || $actor.system?.details?.alignment || ''
    }));
  }
});

// Generate biography function
export async function generateBiography(actor = null) {
  
  console.trace();
  console.log('generateBiography called with actor id:', actor?.id);
  console.log('isGenerating value at start:', get(isGenerating));
  // Guard only on explicit boolean true - in tests a malformed value may exist from prior runs
  if (get(isGenerating) === true) return;

  isGenerating.set(true);
  console.log('isGenerating set to true');
  try {
    // Build the prompt based on selected options
    console.log('biographyOptions raw value:', get(biographyOptions));
    let selectedElements = Object.entries(get(biographyOptions))
      .filter(([key, selected]) => selected)
      .map(([key, _]) => key);

    console.log('selectedElements computed at start:', selectedElements);

    if (selectedElements.length === 0) {
      if (typeof ui !== 'undefined' && ui.notifications && ui.notifications.warn) {
        ui.notifications.warn('Please select at least one biography element to generate. Defaulting to appearance and biography.');
      } else {
        console.warn('Please select at least one biography element to generate. Defaulting to appearance and biography.');
      }
      selectedElements = ['appearance', 'biography'];
    }

    // Get race and class info for context
    // Use the provided actor param when present (do NOT auto-fallback to actorInGame during the biography step)
    let actorForData = (actor !== null && actor !== undefined) ? actor : get(actorInGame);
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
      // Normalize ability scores to plain numeric values (support {value: n} objects)
      const normalizedAbilities = normalizeAbilities(abilities);
      if (Object.values(normalizedAbilities).every(v => v === 0)) {
        window.GAS.log.w('Biography: No ability scores detected on actor; abilityScores will be empty in LLM request.');
      }
    const details = get(characterDetails) || {};

    // Generate biography elements including name if selected
    console.log('generateBiography selectedElements:', selectedElements);
    if (selectedElements.length > 0) {
      // Log the data being sent to LLM for debugging
      const llmParams = {
        race: raceName,
        characterClass: characterClassName,
        level: characterLevel,
        background: characterBackground,
        abilityScores: normalizedAbilities,
        abilityScoresMissing: Object.values(normalizedAbilities).every(v => v === 0),
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
    if (typeof ui !== 'undefined' && ui.notifications && ui.notifications.error) {
      ui.notifications.error('Failed to generate biography. Please try again.');
    } else {
      console.warn('Failed to generate biography. Please try again.');
    }
  } finally {
    isGenerating.set(false);
  }
}

// Randomize optional character details (height, weight, age, eyes, hair, skin, gender, faith, alignment)
export function randomizeDetails() {
  const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const raceName = (get(race)?.name || '').toLowerCase();
  const cls = (get(characterClass)?.name || '').toLowerCase();
  const bg = (get(background)?.name || '').toLowerCase();

  // Height generation (feet and inches)
  let minFeet = 4, maxFeet = 6;
  if (/halfling|gnom/i.test(raceName)) { minFeet = 3; maxFeet = 4; }
  else if (/dwarf/i.test(raceName)) { minFeet = 4; maxFeet = 5; }
  else if (/elf/i.test(raceName)) { minFeet = 5; maxFeet = 6; }
  const feet = rnd(minFeet, maxFeet);
  const inches = rnd(0, 11);
  const height = `${feet}'${inches}\"`;

  // Weight (approximate lbs)
  let minWeight = 90, maxWeight = 230;
  if (/halfling|gnom/i.test(raceName)) { minWeight = 30; maxWeight = 80; }
  else if (/dwarf/i.test(raceName)) { minWeight = 120; maxWeight = 220; }
  else if (/elf/i.test(raceName)) { minWeight = 100; maxWeight = 160; }
  const weight = `${rnd(minWeight, maxWeight)} lbs`;

  // Age
  let minAge = 18, maxAge = 60;
  if (/elf|half-elf/i.test(raceName)) { minAge = 100; maxAge = 750; }
  else if (/dwarf/i.test(raceName)) { minAge = 40; maxAge = 350; }
  else if (/halfling|gnom/i.test(raceName)) { minAge = 20; maxAge = 150; }
  const age = `${rnd(minAge, maxAge)}`;

  // Eyes, hair, skin
  const eyeColors = ['brown','blue','green','hazel','amber','gray','black','gold'];
  const hairColors = ['brown','black','blonde','red','gray','white','auburn','bald'];
  const skinTones = ['fair','pale','tan','olive','dark','ruddy','bronze'];
  const eyes = eyeColors[Math.floor(Math.random() * eyeColors.length)];
  const hair = hairColors[Math.floor(Math.random() * hairColors.length)];
  const skin = skinTones[Math.floor(Math.random() * skinTones.length)];

  // Gender
  const genders = ['male','female','non-binary'];
  const gender = genders[Math.floor(Math.random() * genders.length)];

  // Faith - prefer religious wording if background or class imply it
  let faith = '';
  if (/acolyte|priest|clerg|templar|relig/i.test(bg) || /cleric|paladin/i.test(cls)) {
    const deities = ['Pelor','Tyr','Corellon','Moradin','Bahamut','Kord','Ehlonna','Vecna','Mystra','Tiamat'];
    faith = `Follower of ${deities[Math.floor(Math.random() * deities.length)]}`;
  } else if (/soldier|folk|noble|guild|criminal|urchin|outlander/i.test(bg)) {
    faith = ['Somewhat spiritual','Practices local rites','No particular faith'][Math.floor(Math.random()*3)];
  } else {
    faith = ['Agnostic','Somewhat spiritual','No particular faith'][Math.floor(Math.random()*3)];
  }

  // Alignment - small bias by class
  const alignments = ['lawful good','neutral good','chaotic good','lawful neutral','neutral','chaotic neutral','lawful evil','neutral evil','chaotic evil'];
  let alignment = alignments[Math.floor(Math.random() * alignments.length)];
  if (/paladin/i.test(cls)) alignment = 'lawful good';
  else if (/ranger|druid/i.test(cls)) alignment = ['neutral good','chaotic good','neutral'][Math.floor(Math.random()*3)];
  else if (/rogue/i.test(cls)) alignment = ['chaotic neutral','neutral'][Math.floor(Math.random()*2)];
  else if (/barbarian/i.test(cls)) alignment = ['chaotic neutral','chaotic good'][Math.floor(Math.random()*2)];

  const details = {
    height,
    weight,
    age,
    eyes,
    hair,
    skin,
    gender,
    faith,
    alignment
  };

  characterDetails.set(details);
  // Also copy into biographyContent so it's visible in other places
  biographyContent.update(c => ({ ...c, ...details }));

  ui?.notifications?.info('Character details randomized');
}

// Exported helper to normalize ability scores into plain numeric values
export function normalizeAbilities(raw) {
  const keys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  const out = {};
  keys.forEach(k => {
    const v = raw?.[k];
    if (v == null) {
      out[k] = 0;
    } else if (typeof v === 'number') {
      out[k] = v;
    } else if (typeof v === 'object') {
      out[k] = Number(v.value ?? v.total ?? 0) || 0;
    } else {
      const parsed = parseInt(v);
      out[k] = Number.isNaN(parsed) ? 0 : parsed;
    }
  });
  return out;
}