import { MODULE_ID } from '~/src/helpers/constants';

function addUuid(uuidSet, value) {
  const normalizedValue = String(value || '').trim();
  if (normalizedValue) uuidSet.add(normalizedValue);
}

function addDocumentAliases(uuidSet, documentLike) {
  if (!documentLike) return;

  addUuid(uuidSet, documentLike.uuid);
  addUuid(uuidSet, documentLike?._stats?.compendiumSource);
  addUuid(uuidSet, documentLike?.flags?.core?.sourceId);
  addUuid(uuidSet, documentLike?.flags?.dnd5e?.sourceId);
  addUuid(uuidSet, documentLike?.flags?.['dnd5e']?.sourceId);
  addUuid(uuidSet, documentLike?.system?.sourceId);
  addUuid(uuidSet, documentLike?.system?.source);
}

function addCollectionAliases(uuidSet, collection) {
  if (!collection) return;

  for (const entry of collection) {
    const type = String(entry?.type || '').toLowerCase();
    if (type && type !== 'class' && type !== 'subclass') continue;
    addDocumentAliases(uuidSet, entry);
  }
}

function addDroppedItemAliases(uuidSet, droppedItems) {
  if (!droppedItems) return;

  if (Array.isArray(droppedItems)) {
    addCollectionAliases(uuidSet, droppedItems);
    return;
  }

  if (typeof droppedItems !== 'object') return;

  const classEntries = Array.isArray(droppedItems.class)
    ? droppedItems.class
    : (droppedItems.class ? [droppedItems.class] : []);
  const subclassEntries = Array.isArray(droppedItems.subclass)
    ? droppedItems.subclass
    : (droppedItems.subclass ? [droppedItems.subclass] : []);

  addCollectionAliases(uuidSet, classEntries);
  addCollectionAliases(uuidSet, subclassEntries);
}

function addActorAliases(uuidSet, actor) {
  if (!actor) return;

  addCollectionAliases(uuidSet, actor?.items || []);
  addCollectionAliases(uuidSet, Object.values(actor?.classes || {}));
  addCollectionAliases(uuidSet, Object.values(actor?._classes || {}));

  const droppedItems = typeof actor?.getFlag === 'function'
    ? actor.getFlag(MODULE_ID, 'droppedItems')
    : actor?.flags?.[MODULE_ID]?.droppedItems;
  addDroppedItemAliases(uuidSet, droppedItems);
}

export function collectTcrSpellClassUuids({
  actor = null,
  selectedClass = null,
  selectedSubClass = null,
  levelUpClass = null,
  levelUpClassUuid = null,
  levelUpSubClassUuid = null
} = {}) {
  const uuidSet = new Set();

  addDocumentAliases(uuidSet, selectedClass);
  addDocumentAliases(uuidSet, selectedSubClass);
  addDocumentAliases(uuidSet, levelUpClass);
  addUuid(uuidSet, levelUpClassUuid);
  addUuid(uuidSet, levelUpSubClassUuid);
  addActorAliases(uuidSet, actor);

  return [...uuidSet];
}