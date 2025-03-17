import { writable } from 'svelte/store';

// Basic store definitions without dependencies
export const race = writable(false); //- tracks race selection
export const subRace = writable(false); //- tracks subrace selection
export const background = writable(false); //- tracks background selection
export const characterClass = writable(false); //- tracks class selection
export const characterSubClass = writable(false); //- tracks subclass selection
export const abilities = writable(false); //- tracks abilities selection
export const spells = writable(false); //- tracks spells selection
export const pointBuyScoreTotal = writable(12); //- tracks the total point buy score
export const pointBuyLimit = writable(27); //- tracks the point buy limit
export const abilityRolls = writable(false); //- tracks ability rolls
export const isStandardArrayValues = writable(false); //- tracks if the character is using standard array values
export const level = writable(1); //- tracks the current level of the character
export const activeTab = writable(''); //- tracks the active tab
export const selectedMultiClass = writable(false); //- tracks the selected multi class
export const isActorCreated = writable(false); //- tracks if the actor has been created
export const tabs = writable([]); //- tracks the tabs
export const levelUpTabs = writable([]); //- tracks the level up tabs
export const actorInGame = writable(null); //- tracks the actor in game
export const abilityGenerationMethod = writable(null); //- tracks the ability generation method
export const subClassesForClass = writable([]); //- tracks the subclasses for the class
export const goldRoll = writable(0); //- tracks the gold roll
export const readOnlyTabs = writable([]); //- tracks the read only tabs

//- level-up store definitions
export const isLevelUp = writable(false); //- tracks if the character is in level up mode
export const classUuidForLevelUp = writable(null); //- tracks the class uuid for level up
export const newLevelValueForExistingClass = writable(false); //- tracks if the character is leveling up