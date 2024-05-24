import { writable, get, derived } from 'svelte/store';

export const race = writable(false); 
export const subRace = writable(false); 
export const characterClass = writable(false); 
export const characterSubClass = writable(false); 
export const background = writable(false); 
export const abilities = writable(false); 
export const spells = writable(false); 
export const level = writable(1); 