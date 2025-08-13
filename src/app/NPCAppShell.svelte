
<script>
  import { ApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/application';
  import { setContext, getContext, onMount, onDestroy } from "svelte";
  import { derived } from 'svelte/store';
  import { activeTab, npcTabs } from "~/src/stores/index";
  import { MODULE_ID } from "~/src/helpers/constants";
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import Footer from "~/src/components/molecules/Footer.svelte";

  export let elementRoot;
  export let documentStore;
  export let document;

  const application = getContext('#external').application;
  
  function gasClose() {
    if (application && typeof application.setClosingFromGasHook === 'function') {
      application.setClosingFromGasHook(true);
    }
    if (application && typeof application.close === 'function') {
      application.close();
    }
  }

  Hooks.once("gas.close", gasClose);

  // Provide the actor document store via context
  setContext("#doc", documentStore);

  console.log('documentStore', $documentStore);
  console.log('typeof documentStore.items', typeof $documentStore.items);

  // Provide a derived store of displayable items from the actor, via context, for reuse
  const itemsFromActor = derived(
    [documentStore],
    ([$doc], set) => {
      const toArray = (collection) => {
        if (!collection) return [];
        if (Array.isArray(collection)) return collection;
        if (collection.contents) return collection.contents;
        if (typeof collection.values === 'function') return Array.from(collection.values());
        try { return Array.from(collection); } catch (_) { return []; }
      };

      const compute = () => {
        try {
          const list = toArray($doc?.items);
          const mapped = list.map((itemDoc) => {
            let uuid = null;
            try {
              const flags = itemDoc?.flags || {};
              const fromModule = flags?.[MODULE_ID]?.sourceUuid || flags?.[MODULE_ID]?.sourceId;
              const fromCore = flags?.core?.sourceId;
              const fromSystem = itemDoc?.system?.sourceId;
              const direct = itemDoc?.uuid;
              const itemId = itemDoc?.id ?? itemDoc?._id;
              const parentUuid = $doc?.uuid;
              const embedded = itemId ? (parentUuid ? `${parentUuid}.Item.${itemId}` : `Item.${itemId}`) : null;
              uuid = fromModule || fromCore || fromSystem || direct || embedded || null;
            } catch (_) {
              uuid = null;
            }

            const link = uuid ? `@UUID[${uuid}]{${itemDoc?.name}}` : itemDoc?.name;
            return {
              id: itemDoc?.id ?? itemDoc?._id,
              img: itemDoc?.img,
              name: itemDoc?.name,
              link,
            };
          });
          set(mapped);
        } catch (err) {
          try { window.GAS?.log?.d?.('itemsFromActor error', err); } catch (_) {}
          set([]);
        }
      };

      compute();

      const items = $doc?.items;
      try {
        items?.on?.('create', compute);
        items?.on?.('update', compute);
        items?.on?.('delete', compute);
        $doc?.on?.('update', compute);
      } catch (_) {}

      return () => {
        try {
          items?.off?.('create', compute);
          items?.off?.('update', compute);
          items?.off?.('delete', compute);
          $doc?.off?.('update', compute);
        } catch (_) {}
      };
    },
    []
  );

  $: window.GAS.log.d('$$$itemsFromActor', $itemsFromActor);
  setContext("#itemsFromActor", itemsFromActor);

  $: stylesApp = {
    '--tjs-app-overflow': 'visible',
  };


  $: filteredTabs = $npcTabs;
  $activeTab = $npcTabs[0].id


</script>

<svelte:options accessors={true}/>


<template lang="pug">
  ApplicationShell(bind:elementRoot bind:stylesApp)
    main
      section.a
        Tabs.gas-tabs( tabs="{filteredTabs}" bind:activeTab="{$activeTab}" sheet="PC")
      section.b
        Footer
        
</template>

<style lang="sass">
main 
  text-align: center
  display: flex
  flex-direction: column
  height: 100%

section 
  padding: 0.5rem 0.2rem

.a
  flex: 1
  overflow-y: scroll
    min-width: 200px
</style>