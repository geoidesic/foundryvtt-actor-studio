// Class for general global variables.

export const MODULE_ID = 'foundryvtt-actor-studio';
export const MODULE_CODE = 'GAS';
export const MODULE_TITLE = 'Actor Studio';
export const MYSTERY_MAN = 'icons/svg/mystery-man.svg';
export const NONE_ICON = 'icons/svg/cancel.svg';
export const LOG_PREFIX = 'ACTOR STUDIO |';
export const LOG_PREFIX_COLOR = `%c[${MODULE_CODE}] |`;

export const LOG_STYLES = {
  go: 'color: goldenrod;',
  q: 'color: aqua;',
  p: 'color: purple;',
  s: 'color: steelblue;',
  g: 'color: green;',
  r: 'color: red;',
  o: 'color: orange;',
  b: 'color: blue;',
  y: 'color: yellow;',
  c: 'color: cyan;',
  m: 'color: magenta;',
  gr: 'color: gray;',
  br: 'color: brown;',
  pi: 'color: pink;',
  t: 'color: teal;'
};

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
  npcFeatures: [],
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


// Condition definitions used across the module. Each entry may include a compendium UUID
// for enrichment (the dnd5e rules compendium pages for each condition).
export const CONDITION_DEFS = [
  { key: 'blinded', label: 'Blinded', icon: 'systems/dnd5e/icons/svg/statuses/blinded.svg', uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.0b8N4FymGGfbZGpJ' },
  { key: 'charmed', label: 'Charmed', icon: 'systems/dnd5e/icons/svg/statuses/charmed.svg', uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.zZaEBrKkr66OWJvD' },
  { key: 'deafened', label: 'Deafened', icon: 'systems/dnd5e/icons/svg/statuses/deafened.svg', uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.6G8JSjhn701cBITY' },
  { key: 'exhaustion', label: 'Exhaustion', icon: 'systems/dnd5e/icons/svg/statuses/exhaustion.svg', uuid: 'Compendium.dnd5e.rules.JournalEntry.w7eitkpD7QQTB6j0.JournalEntryPage.cspWveykstnu3Zcv' },
  { key: 'frightened', label: 'Frightened', icon: 'systems/dnd5e/icons/svg/statuses/frightened.svg', uuid: 'Compendium.dnd-players-handbook.content.JournalEntry.phbAppendixCRule.JournalEntryPage.93uaingTESo8N1qL' },
  { key: 'grappled', label: 'Grappled', icon: 'systems/dnd5e/icons/svg/statuses/grappled.svg', uuid: 'Compendium.dnd-players-handbook.content.JournalEntry.phbAppendixCRule.JournalEntryPage.KbQ1k0OIowtZeQgp' },
  { key: 'incapacitated', label: 'Incapacitated', icon: 'systems/dnd5e/icons/svg/statuses/incapacitated.svg', uuid: 'Compendium.dnd-players-handbook.content.JournalEntry.phbAppendixCRule.JournalEntryPage.4i3G895hy99piand' },
  { key: 'invisible', label: 'Invisible', icon: 'systems/dnd5e/icons/svg/statuses/invisible.svg', uuid: 'Compendium.dnd-players-handbook.content.JournalEntry.phbAppendixCRule.JournalEntryPage.MQIZ1zRLWRcNOtPN' },
  { key: 'paralyzed', label: 'Paralyzed', icon: 'systems/dnd5e/icons/svg/statuses/paralyzed.svg', uuid: 'Compendium.dnd-players-handbook.content.JournalEntry.phbAppendixCRule.JournalEntryPage.RnxZoTglPnLc6UPb' },
  { key: 'petrified', label: 'Petrified', icon: 'systems/dnd5e/icons/svg/statuses/petrified.svg', uuid: 'Compendium.dnd-players-handbook.content.JournalEntry.phbAppendixCRule.JournalEntryPage.6vtLuQT9lwZ9N299' },
  { key: 'poisoned', label: 'Poisoned', icon: 'systems/dnd5e/icons/svg/statuses/poisoned.svg', uuid: 'Compendium.dnd-players-handbook.content.JournalEntry.phbAppendixCRule.JournalEntryPage.HWs8kEojffqwTSJz' },
  { key: 'prone', label: 'Prone', icon: 'systems/dnd5e/icons/svg/statuses/prone.svg', uuid: 'Compendium.dnd-players-handbook.content.JournalEntry.phbAppendixCRule.JournalEntryPage.QxCrRcgMdUd3gfzz' },
  { key: 'restrained', label: 'Restrained', icon: 'systems/dnd5e/icons/svg/statuses/restrained.svg', uuid: 'Compendium.dnd-players-handbook.content.JournalEntry.phbAppendixCRule.JournalEntryPage.dqLeGdpHtb8FfcxX' },
  { key: 'stunned', label: 'Stunned', icon: 'systems/dnd5e/icons/svg/statuses/stunned.svg', uuid: 'Compendium.dnd-players-handbook.content.JournalEntry.phbAppendixCRule.JournalEntryPage.EjbXjvyQAMlDyANI' },
  { key: 'unconscious', label: 'Unconscious', icon: 'systems/dnd5e/icons/svg/statuses/unconscious.svg', uuid: 'Compendium.dnd-players-handbook.content.JournalEntry.phbAppendixCRule.JournalEntryPage.fZCRaKEJd4KoQCqH' }
];

