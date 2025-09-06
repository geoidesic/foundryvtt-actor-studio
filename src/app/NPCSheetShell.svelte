<script>
  import { ApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/application';
  import { getContext, setContext, onMount, onDestroy } from 'svelte';
  import NPCStatBlock from "~/src/components/molecules/dnd5e/NPC/NPCStatBlock.svelte";

  // Props provided by the sheet class
  export let documentStore; // TJSDocument store
  export let document;      // Actor document
  export let canEdit = false; // ownership permission; controls if toggle is enabled
  export let editStore; // shared writable<boolean> from app
  export let elementRoot = void 0; // Required by TRL ApplicationShell contract

  // Provide standard GAS contexts used by molecules
  setContext('#doc', documentStore);

  onMount(() => {
    try { console.debug('[GAS] NPCSheetShell mounted for', document?.name); } catch (_) {}
  });

  $: npc = $documentStore;
  // Local read-only derived from shared store
  let isEditing = false;
  const unsubEdit = editStore?.subscribe?.((v) => { isEditing = !!v && !!canEdit; });
  // Precompute for Pug attributes (avoid complex expressions inline)
  $: npcName = npc?.name ?? '';
  $: readOnly = !isEditing;
  $: toggleTitle = isEditing ? (game?.i18n?.localize?.('GAS.EditModeOn') ?? 'Editing')
                             : (game?.i18n?.localize?.('GAS.EditModeOff') ?? 'View');
  $: toggleIcon = isEditing ? 'fa-unlock' : 'fa-lock';
  $: toggleDisabled = !canEdit;
  onDestroy(() => { try { unsubEdit?.(); } catch (_) {} });
</script>

<svelte:options accessors={true} />

<template lang="pug">
  ApplicationShell(bind:elementRoot)
    main.gas-npc-sheet-body
      //- Render the existing statblock molecule
      NPCStatBlock(name="{npcName}" npc="{npc}" readonly="{readOnly}")
</template>

<style lang="sass">
.gas-npc-sheet-body
  position: relative
  padding: .5rem
  overflow-y: auto
  max-height: 100%
</style>
