import { writable } from 'svelte/store';

// Basic store definitions without dependencies
export const race = writable(false);
export const subRace = writable(false);
export const background = writable(false);
export const characterClass = writable(false);
export const characterSubClass = writable(false);
export const abilities = writable(false);
export const spells = writable(false);
export const isLevelUp = writable(false);
export const pointBuyScoreTotal = writable(12);
export const pointBuyLimit = writable(27);
export const abilityRolls = writable(false);
export const isStandardArrayValues = writable(false);
export const newClassLevel = writable(false);
export const level = writable(1);
export const activeTab = writable('');
export const activeClass = writable(false);
export const isActorCreated = writable(false);
export const tabs = writable([]);
export const levelUpTabs = writable([]);
export const actorInGame = writable(null);
export const abilityGenerationMethod = writable(null);
export const subClassesForClass = writable([]);
export const goldRoll = writable(0);
export const readOnlyTabs = writable([]); 