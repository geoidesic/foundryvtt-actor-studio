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
  import { onDestroy } from 'svelte';
  onDestroy(() => { try { unsub?.(); } catch (_) {} });
</script>

<template lang="pug">
  NPCStatBlock(name="{npcName}" npc="{npc}" readonly="{readOnly}")
</template>

<style lang="sass">
// no-op wrapper
</style>
