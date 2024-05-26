import { writable, get, derived } from 'svelte/store';;

const initialTabs = [
  { label: "Abilities", id: "abilities", component: "Abilities" },
  { label: "Race", id: "race", component: "Race" },
  { label: "Background", id: "background", component: "Background" },
  { label: "Class", id: "class", component: "Class" },
]

export const race = writable(false); 
export const subRace = writable(false); 
export const characterClass = writable(false); 
export const characterSubClass = writable(false); 
export const background = writable(false); 
export const abilities = writable(false); 
export const spells = writable(false); 
export const level = writable(1); 
export const activeTab = writable(''); 
export const isActorCreated = writable(false);
export const advancementApps = writable([]); 

export const tabs = writable(initialTabs);

// Function to reset all stores
export function resetStores() {
  race.set(false);
  subRace.set(false);
  characterClass.set(false);
  characterSubClass.set(false);
  background.set(false);
  abilities.set(false);
  spells.set(false);
  level.set(1);
  activeTab.set('');
  tabs.set(initialTabs);
  advancementApps.set([]);
  isActorCreated.set(false);
}