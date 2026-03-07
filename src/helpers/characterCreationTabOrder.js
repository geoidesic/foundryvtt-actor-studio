export const DEFAULT_CHARACTER_CREATION_TAB_ORDER = Object.freeze([
  'abilities',
  'race',
  'background',
  'class',
]);

export const CHARACTER_CREATION_TAB_DEFINITIONS = Object.freeze({
  abilities: { label: 'Abilities', id: 'abilities', component: 'Abilities' },
  race: { label: 'Race', id: 'race', component: 'Race' },
  background: { label: 'Background', id: 'background', component: 'Background' },
  class: { label: 'Class', id: 'class', component: 'Class' },
});

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
  return normalizedOrder.map((tabId) => ({ ...CHARACTER_CREATION_TAB_DEFINITIONS[tabId] }));
}

export function getCoreCreationReadOnlyTabs(includeBiography = false) {
  const tabs = [...DEFAULT_CHARACTER_CREATION_TAB_ORDER];
  if (includeBiography) {
    tabs.push('biography');
  }
  return tabs;
}
