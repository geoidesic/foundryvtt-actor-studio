<script>
  import { getContext } from 'svelte';
  import { MODULE_ID } from '~/src/helpers/constants';
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
  // Open portrait viewer/editor depending on edit mode and Tokenizer availability
  function openPortrait() {
    try {
      // If in edit mode, prefer to open an editor. Use Tokenizer only for edit mode.
      if (isEditing) {
        // If tokenizer is installed and user enabled it, open tokenizer for actor
        if (game?.modules?.has && game.modules.has('vtta-tokenizer') && game.settings?.get && game.settings.get(MODULE_ID, 'useTokenizer')) {
          if (typeof Tokenizer !== 'undefined' && Tokenizer?.tokenizeActor) {
            try { Tokenizer.tokenizeActor($documentStore || npc); return; } catch (_) {}
          }
        }

        // Tokenizer not available or failed — open the standard Image/File editor (FilePicker)
        try {
          // Prefer FilePicker if available (standard Foundry editor flow)
          const current = $documentStore?.img || portraitSrc;
          // If there is an available FilePicker API, use it to edit image
          if (typeof FilePicker !== 'undefined') {
            const app = getContext('#external')?.application;
            // Create a FilePicker bound to this application position if possible
            const fp = new FilePicker({
              type: 'image',
              current: current,
              callback: (path) => { $documentStore.update?.({ img: path }); },
              top: app?.position?.top + 40,
              left: app?.position?.left + 10
            });
            return fp.browse();
          }
        } catch (_) {}

        // Fallback: if no FilePicker, just open ImagePopout in edit mode as last resort
        // eslint-disable-next-line no-undef
        if (portraitSrc) new ImagePopout(portraitSrc, { title: npcName }).render(true);
        return;
      }

      // Not editing: open the standard profile viewer (ImagePopout)
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
