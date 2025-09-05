import { writable } from 'svelte/store';

// Store to track NPC feature index loading state
export const npcIndexLoading = writable(false);

// Function to set loading state
export function setNpcIndexLoading(loading) {
  npcIndexLoading.set(loading);
}

// Function to start loading
export function startNpcIndexLoading() {
  setNpcIndexLoading(true);
}

// Function to stop loading
export function stopNpcIndexLoading() {
  setNpcIndexLoading(false);
}
