// Class for general global variables.

export const MODULE_ID = 'foundryvtt-actor-studio';
export const MODULE_CODE = 'RTAS';
export const LOG_PREFIX = 'ACTOR STUDIO |';
export const MYSTERY_MAN = 'icons/svg/mystery-man.svg';
export const NONE_ICON = 'icons/svg/cancel.svg';

export const enum DEFAULT_PACKS {
  RACES = 'dnd5e.races',
  RACE_FEATURES = 'dnd5e.races',
  CLASSES = 'dnd5e.classes',
  CLASS_FEATURES = 'dnd5e.classfeatures',
  SUBCLASSES = 'dnd5e.subclasses',
  ITEMS = 'dnd5e.items',
  SPELLS = 'dnd5e.spells',
  RULES = 'dnd5e.rules',
  BACKGROUNDS = 'dnd5e.backgrounds',
}

export const sessionConstants = {
  appState: `${MODULE_ID}.settings.appState`
};

export const DEFAULT_SOURCES = {
  races: [DEFAULT_PACKS.RACES],
  racialFeatures: [DEFAULT_PACKS.RACE_FEATURES],
  classes: [DEFAULT_PACKS.CLASSES],
  subclasses: [DEFAULT_PACKS.SUBCLASSES],
  backgrounds: [DEFAULT_PACKS.BACKGROUNDS],
  spells: [DEFAULT_PACKS.SPELLS],
  feats: [],
  items: [DEFAULT_PACKS.ITEMS],
};

export const INTEGRATION = {
  TOKENIZER: {
    VERSION: '3.3.0',
  },
};

export const MERGE_OPTIONS = {
  insertKeys: true,
  insertValues: true,
  overwrite: true,
  recursive: true,
  inplace: false,
};

export const POINT_BUY_COSTS = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9
}

export const STANDARD_ARRAY = {
  str: 15, 
  dex: 14, 
  con: 13, 
  int: 12, 
  wis: 10, 
  cha: 8
};

export type CLASS_LEVEL = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20;

