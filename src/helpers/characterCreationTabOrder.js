export const DEFAULT_CHARACTER_CREATION_TAB_ORDER = Object.freeze([
  'abilities',
  'race',
  'background',
  'class',
]);

// Import the localize function and getDndRulesVersion
import { localize } from './Utility.js';
import { getDndRulesVersion } from './Utility.js';

export function getCharacterCreationTabDefinitions() {
  let is2024 = false;
  try {
    is2024 = getDndRulesVersion() === '2024';
  } catch (e) {
    // If game is not ready, default to 2014
    is2024 = false;
  }

  const raceLabel = is2024 ? 'Species' : 'Race';

  return Object.freeze({
    abilities: { label: 'Abilities', id: 'abilities', component: 'Abilities' },
    race: { label: raceLabel, id: 'race', component: 'Race' },
    background: { label: 'Background', id: 'background', component: 'Background' },
    class: { label: 'Class', id: 'class', component: 'Class' },
  });
}

// For backward compatibility, provide a static version that uses current settings
export const CHARACTER_CREATION_TAB_DEFINITIONS = (() => {
  try {
    return getCharacterCreationTabDefinitions();
  } catch (e) {
    // Fallback to 2014 defaults if game is not ready
    return Object.freeze({
      abilities: { label: 'Abilities', id: 'abilities', component: 'Abilities' },
      race: { label: 'Race', id: 'race', component: 'Race' },
      background: { label: 'Background', id: 'background', component: 'Background' },
      class: { label: 'Class', id: 'class', component: 'Class' },
    });
  }
})();

function coerceToArray(order) {
  if (Array.isArray(order)) return order;
  if (!order || typeof order !== 'object') return order;

  const numericKeys = Object.keys(order)
    .filter((key) => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b));

  if (numericKeys.length === 0) return order;
  return numericKeys.map((key) => order[key]);
}

export function isValidCharacterCreationTabOrder(order) {
  const normalizedOrder = coerceToArray(order);

  if (!Array.isArray(normalizedOrder)) return false;
  if (normalizedOrder.length !== DEFAULT_CHARACTER_CREATION_TAB_ORDER.length) return false;

  const uniqueOrder = new Set(normalizedOrder);
  if (uniqueOrder.size !== DEFAULT_CHARACTER_CREATION_TAB_ORDER.length) return false;

  return DEFAULT_CHARACTER_CREATION_TAB_ORDER.every((tabId) => uniqueOrder.has(tabId));
}

export function normalizeCharacterCreationTabOrder(order) {
  const normalizedOrder = coerceToArray(order);
  return isValidCharacterCreationTabOrder(order)
    ? [...normalizedOrder]
    : [...DEFAULT_CHARACTER_CREATION_TAB_ORDER];
}

export function getCharacterCreationTabsFromOrder(order) {
  const normalizedOrder = normalizeCharacterCreationTabOrder(order);
  const definitions = getCharacterCreationTabDefinitions();
  return normalizedOrder.map((tabId) => ({ ...definitions[tabId] }));
}

export function getCoreCreationReadOnlyTabs(includeBiography = false) {
  const tabs = [...DEFAULT_CHARACTER_CREATION_TAB_ORDER];
  if (includeBiography) {
    tabs.push('biography');
  }
  return tabs;
}
