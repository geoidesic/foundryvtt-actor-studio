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
  // Portrait source and helpers
  $: portraitSrc = npc?.img || npc?.prototypeToken?.texture?.src || npc?.prototypeToken?.img || '';
  $: hasPortrait = !!portraitSrc;
  function openPortrait() {
    try {
      // eslint-disable-next-line no-undef
      if (portraitSrc) new ImagePopout(portraitSrc, { title: npcName }).render(true);
    } catch (_) {}
  }
  onDestroy(() => { try { unsubEdit?.(); } catch (_) {} });
</script>

<svelte:options accessors={true} />

<template lang="pug">
  ApplicationShell(bind:elementRoot)
    main.gas-npc-sheet-body
      //- Top-right actor portrait
      +if("hasPortrait")
        button.gas-portrait(type="button" class="header-control" on:click="{openPortrait}" data-tooltip="{npcName}" aria-label="{npcName}")
          img.gas-portrait-img(src="{portraitSrc}" alt="{npcName}")
      //- Render the existing statblock molecule
      NPCStatBlock(name="{npcName}" npc="{npc}" readonly="{readOnly}")
</template>

<style lang="sass">
:global(.gas-npc-sheet .window-content)
  padding: 0
.gas-npc-sheet-body
  position: relative
  overflow-y: auto
  max-height: 100%

// Portrait styles
.gas-portrait
  position: absolute
  top: 8px
  right: 8px
  padding: 0
  border: none
  background: rgba(0,0,0,0.1)
  cursor: pointer
  display: inline-flex
  align-items: center
  justify-content: center
  width: 72px
  height: 72px
  border-radius: 8px
  box-shadow: 0 1px 3px rgba(0,0,0,0.4)
  overflow: hidden

.gas-portrait-img
  width: 100%
  height: 100%
  object-fit: cover
  display: block

:global(.themed.theme-dark .gas-portrait)
  background: rgba(255,255,255,0.1)

</style>
