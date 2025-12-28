import { writable } from 'svelte/store';

export const aiPreview = writable(null);
export const isGenerating = writable(false);
