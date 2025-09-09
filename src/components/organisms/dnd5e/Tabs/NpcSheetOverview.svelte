<script>
  import { getContext } from 'svelte';
  import NPCStatBlock from "~/src/components/molecules/dnd5e/NPC/NPCStatBlock.svelte";
  const documentStore = getContext('#doc');
  const editStore = getContext('#editStore');
  $: npc = $documentStore;
  let isEditing = false;
  const unsub = editStore?.subscribe?.((v) => isEditing = !!v);
  $: npcName = npc?.name ?? '';
  $: readOnly = !isEditing;
  // Portrait data and handler (Overview-only)
  $: portraitSrc = npc?.img || npc?.prototypeToken?.texture?.src || npc?.prototypeToken?.img || '';
  $: hasPortrait = !!portraitSrc;
  function openPortrait() {
    try {
      // eslint-disable-next-line no-undef
      if (portraitSrc) new ImagePopout(portraitSrc, { title: npcName }).render(true);
    } catch (_) {}
  }
  import { onDestroy } from 'svelte';
  onDestroy(() => { try { unsub?.(); } catch (_) {} });
</script>

<template lang="pug">
  //- Top-right actor portrait (only on Overview)
  +if("hasPortrait")
    button.gas-portrait(type="button" class="header-control" on:click="{openPortrait}" data-tooltip="{npcName}" aria-label="{npcName}")
      img.gas-portrait-img(src="{portraitSrc}" alt="{npcName}")
  NPCStatBlock(
    name="{npcName}" 
    npc="{npc}" 
    readonly="{readOnly}"
    includeRollButtons="{true}"
  )
</template>

<style lang="sass">
// Portrait styles scoped to Overview
.gas-portrait
  position: absolute
  top: 30px
  right: 20px
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
  z-index: 999

.gas-portrait-img
  width: 100%
  height: 100%
  object-fit: cover
  display: block

:global(.themed.theme-dark .gas-portrait)
  background: rgba(255,255,255,0.1)
</style>
