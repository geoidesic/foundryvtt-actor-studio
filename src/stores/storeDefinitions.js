import { writable, derived } from 'svelte/store';

// Basic store definitions without dependencies
export const race = writable(false); //- tracks race selection
export const subRace = writable(false); //- tracks subrace selection
export const background = writable(false); //- tracks background selection
export const characterClass = writable(false); //- tracks class selection for Character level 1
export const characterSubClass = writable(false); //- tracks subclass selection for Character level 1
export const abilities = writable(false); //- tracks abilities selection
export const spells = writable(false); //- tracks spells selection
export const pointBuyScoreTotal = writable(12); //- tracks the total point buy score
export const pointBuyLimit = writable(27); //- tracks the point buy limit
export const abilityRolls = writable(false); //- tracks ability rolls
export const isStandardArrayValues = writable(false); //- tracks if the character is using standard array values
export const level = writable(1); //- tracks the current level of the character
export const isActorCreated = writable(false); //- tracks if the actor has been created
export const tabs = writable([]); //- tracks the tabs
export const activeTab = writable(''); //- tracks the active tab
export const readOnlyTabs = writable([]); //- tracks the read only tabs
export const tabDisabled = derived(
  [activeTab, readOnlyTabs],
  ([$activeTab, $readOnlyTabs]) => {
    return $readOnlyTabs && $readOnlyTabs.length && $readOnlyTabs.includes($activeTab)
});
export const levelUpTabs = writable([]); //- tracks the level up tabs
export const actorInGame = writable(null); //- tracks the actor in game
export const abilityGenerationMethod = writable(null); //- tracks the ability generation method
export const subClassesForClass = writable([]); //- tracks the subclasses for the class
export const goldRoll = writable(0); //- tracks the gold roll
export const startingWealthChoice = writable(null); //- tracks wealth choice for 2014 rules ('equipment' or 'gold')
//- level-up store definitions
export const isLevelUp = writable(false); //- tracks if the character is in level up mode
export const classUuidForLevelUp = writable(null); //- tracks the class uuid for level up
export const subClassUuidForLevelUp = writable(null); //- tracks the subclass uuid for level up
export const newLevelValueForExistingClass = writable(false); //- tracks new level value for existing class
export const selectedMultiClassUUID = writable(false); //- tracks the selected multi class
export const levelUpClassObject = writable(null); //- tracks the new multi class object
export const levelUpSubClassObject = writable(null); //- tracks the new multi class object
export const activeRowClassKey = writable(null); //- tracks the active row class key
export const levelUpCombinedHtml = writable(''); //- tracks the level up combined html
export const levelUpRichHTML = writable(''); //- tracks the level up rich html
export const levelUpRichSubClassHTML = writable(''); //- tracks the level up rich subclass html
