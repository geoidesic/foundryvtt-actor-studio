<script>
  import { ApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/application';
  import { getContext, setContext, onMount, onDestroy } from 'svelte';
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  // Overview tab will render the stat block molecule
  // Other tabs are standalone components loaded by Tabs.svelte

  // Props provided by the sheet class
  export let documentStore; // TJSDocument store
  export let document;      // Actor document
  export let canEdit = false; // ownership permission; controls if toggle is enabled
  export let editStore; // shared writable<boolean> from app
  export let elementRoot = void 0; // Required by TRL ApplicationShell contract

  // Provide standard GAS contexts used by molecules
  setContext('#doc', documentStore);
  // Provide edit store so tab components can derive readonly
  setContext('#editStore', editStore);

  onMount(() => {
    try { 
      console.debug('[GAS] NPCSheetShell mounted for', document?.name); 
      window.GAS.log.g('actor', $documentStore)
    } catch (_) {}
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

  // Tabs setup for NPC Sheet
  // Component names must exist under components/organisms/dnd5e/Tabs
  let activeTab = 'overview';
  $: sheetTabs = [
    { id: 'overview', label: 'Overview', icon: 'fas fa-id-card', component: 'NpcSheetOverview' },
    { id: 'features', label: 'Features', icon: 'fas fa-star', component: 'NpcSheetFeatures' },
    { id: 'equipment', label: 'Equipment', icon: 'fas fa-boxes', component: 'NpcSheetEquipment' },
    { id: 'skills', label: 'Skills', icon: 'fas fa-dice-d20', component: 'NpcSheetSkills' },
    { id: 'effects', label: 'Effects', icon: 'fas fa-bolt', component: 'NpcSheetEffects' }
  ];
</script>

<svelte:options accessors={true} />

<template lang="pug">
  ApplicationShell(bind:elementRoot)
    main.gas-npc-sheet-body
      //- Icon tabs for NPC sheet
      Tabs.gas-tabs( tabs="{sheetTabs}" bind:activeTab="{activeTab}" sheet="NPC-SHEET" labels="{false}")
</template>

<style lang="sass">
:global(.gas-npc-sheet .window-content)
  padding: 0
  --tabs-list-background: rgba(255,255,255,0.8)
:global(.gas-npc-sheet.theme-dark .window-content)
  --tabs-list-background: rgba(0,0,0,0.8)
.gas-npc-sheet-body
  position: relative
  overflow-y: auto
  max-height: 100%

</style>
