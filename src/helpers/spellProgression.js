import spellsKnownData from '~/src/stores/spellsKnown.json';
import { advancementEntriesToArray, getAdvancementEntryCount } from '~/src/helpers/Utility';

function getSpellsFromTable(classIdentifier, level, rulesVersion) {
  const normalizedClass = String(classIdentifier || '').toLowerCase();
  const numericLevel = Number(level) || 0;
  if (!normalizedClass || numericLevel <= 0) return null;

  const levelData = spellsKnownData.levels.find((entry) => Number(entry.level) === numericLevel);
  const rawValue = levelData?.[normalizedClass]?.[rulesVersion] ?? levelData?.[normalizedClass];
  if (typeof rawValue !== 'string') return null;

  const normalized = rawValue.trim();
  if (!normalized) return null;

  // New format: spells-only values (e.g. "6", "All")
  // Backward compatibility: old "cantrips / spells" format
  const spellsRaw = normalized.includes('/')
    ? normalized.split('/').map((entry) => String(entry ?? '').trim())[1]
    : normalized;

  if (!spellsRaw) return null;
  return {
    spells: Number.parseInt(spellsRaw, 10) || 0,
    hasAllSpells: spellsRaw.toLowerCase() === 'all'
  };
}

function getScaleValueAtLevel(advancement, level) {
  const numericLevel = Number(level) || 0;

  const getFromLevelMap = (mapLike) => {
    if (!mapLike || typeof mapLike !== 'object' || Array.isArray(mapLike)) return null;
    const extractNumeric = (entry) => {
      if (entry === undefined || entry === null) return null;
      if (typeof entry === 'object') {
        const nested = entry.value ?? entry.number ?? entry.n;
        const parsedNested = Number.parseInt(nested, 10);
        if (Number.isFinite(parsedNested)) return parsedNested;
      }
      const parsed = Number.parseInt(entry, 10);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const exact = mapLike[String(numericLevel)] ?? mapLike[numericLevel];
    if (exact !== undefined && exact !== null) {
      const parsed = extractNumeric(exact);
      if (Number.isFinite(parsed)) return parsed;
    }

    // Fallback: choose the closest lower level key if present.
    const levelKeys = Object.keys(mapLike)
      .map((k) => Number.parseInt(k, 10))
      .filter((k) => Number.isFinite(k) && k <= numericLevel)
      .sort((a, b) => b - a);
    for (const key of levelKeys) {
      const parsed = extractNumeric(mapLike[String(key)] ?? mapLike[key]);
      if (Number.isFinite(parsed)) return parsed;
    }
    return null;
  };

  const configLevels = getFromLevelMap(advancement?.configuration?.levels);
  if (Number.isFinite(configLevels)) return configLevels;

  const configScale = getFromLevelMap(advancement?.configuration?.scale);
  if (Number.isFinite(configScale)) return configScale;

  const configValues = getFromLevelMap(advancement?.configuration?.values);
  if (Number.isFinite(configValues)) return configValues;

  // Some ScaleValue payloads store level-indexed values as objects directly on value.
  const objectValue = getFromLevelMap(advancement?.value);
  if (Number.isFinite(objectValue)) return objectValue;

  // Fallback for non-dnd5e map-based payloads that provide a plain progression array.
  const levelsArray = advancement?.levels;
  if (Array.isArray(levelsArray)) {
    const startLevel = Number(advancement?.level || 1);
    const index = numericLevel - startLevel;
    if (index >= 0 && index < levelsArray.length) {
      return Number.parseInt(levelsArray[index], 10) || 0;
    }
  }

  const directValue = Number.parseInt(advancement?.value, 10);
  if (Number.isFinite(directValue)) return directValue;

  const configValue = Number.parseInt(advancement?.configuration?.value, 10);
  if (Number.isFinite(configValue)) return configValue;

  return null;
}

function getSpellLimitsFromAdvancements(classItem, level) {
  const advancements = advancementEntriesToArray(classItem?.system?.advancement);
  if (advancements.length === 0) return null;

  const numericLevel = Number(level) || 0;
  if (numericLevel <= 0) return null;

  const applicable = advancements.filter((adv) =>
    adv?.type === 'ScaleValue' && Number(adv?.level || 0) <= numericLevel
  );
  if (!applicable.length) return null;

  let cantrips = null;
  let spellsKnown = null;

  for (const advancement of applicable) {
    const title = String(advancement?.title || '').toLowerCase();
    const value = getScaleValueAtLevel(advancement, numericLevel);
    if (!Number.isFinite(value)) continue;

    if (title === 'cantrips known' || title.includes('cantrip')) {
      cantrips = value;
      continue;
    }

    if (title === 'spells known') {
      spellsKnown = value;
      continue;
    }

    if (title.includes('spell') && !title.includes('prepared')) {
      spellsKnown = value;
    }
  }

  if (cantrips === null && spellsKnown === null) return null;

  return {
    cantrips: cantrips === null ? null : Math.max(0, cantrips),
    spells: spellsKnown === null ? null : Math.max(0, spellsKnown),
    hasAllSpells: false
  };
}

export function getSpellLimitsForClassLevel({ classIdentifier, classItem, level, rulesVersion = '2014' }) {
  const fromAdvancements = getSpellLimitsFromAdvancements(classItem, level);
  const fromTable = getSpellsFromTable(classIdentifier, level, rulesVersion);

  if (!fromAdvancements && !fromTable) return null;

  return {
    // Cantrip limits come from advancements only; table cantrip data is intentionally ignored.
    cantrips: Math.max(0, fromAdvancements?.cantrips ?? 0),
    // Spells-known comes from explicit Spells Known advancement, else fallback to spellsKnown.json.
    spells: Math.max(0, (fromAdvancements?.spells ?? fromTable?.spells ?? 0)),
    hasAllSpells: Boolean(fromAdvancements?.hasAllSpells || fromTable?.hasAllSpells)
  };
}

export function getSpellDeltaForClassLevel({
  classIdentifier,
  classItem,
  oldLevel,
  newLevel,
  rulesVersion = '2014'
}) {
  const oldLimits = getSpellLimitsForClassLevel({ classIdentifier, classItem, level: oldLevel, rulesVersion });
  const newLimits = getSpellLimitsForClassLevel({ classIdentifier, classItem, level: newLevel, rulesVersion });
  if (!oldLimits || !newLimits) return null;

  if (oldLimits.hasAllSpells || newLimits.hasAllSpells) {
    return {
      cantrips: Math.max(0, newLimits.cantrips - oldLimits.cantrips),
      spells: 0,
      hasAllSpells: true
    };
  }

  return {
    cantrips: Math.max(0, newLimits.cantrips - oldLimits.cantrips),
    spells: Math.max(0, newLimits.spells - oldLimits.spells),
    hasAllSpells: false
  };
}
