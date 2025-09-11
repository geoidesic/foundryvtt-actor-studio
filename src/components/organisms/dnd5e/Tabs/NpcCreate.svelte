<script>
  import { getContext } from "svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import FeatureItemList from "~/src/components/molecules/dnd5e/NPC/FeatureItemList.svelte";
  import NPCStatBlock from "~/src/components/molecules/dnd5e/NPC/NPCStatBlock.svelte";
  import CRAdjuster from "~/src/components/molecules/dnd5e/NPC/CRAdjuster.svelte";
  import { updateSource, getItemSourcesFromActor } from "~/src/helpers/Utility";
  import { MODULE_ID } from "~/src/helpers/constants";

  const actor = getContext("#doc");
  
  // Handle CR adjustment events
  function handleCRAdjusted(event) {
    console.log('CR adjusted:', event.detail);
    // The CR adjuster will have already updated the actor
    // We can add additional logic here if needed
  }

  // Open an item's sheet for editing from the feature list
  // Accepts either an embedded Item Document or a raw data object that may contain a uuid
  async function openFeatureEditor(item, event) {
    window.GAS.log.q(item)
    try {
      if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
      }
      // If this is a live Item document that is embedded on our actor, open its sheet
      if (item?.sheet && item?.parent && item.parent === actor && typeof item.sheet.render === 'function') {
        item.sheet.render(true);
        return;
      }

      // Try to determine a source UUID to find the embedded actor item
      const sourceUuid = item?.uuid || item?.flags?.[MODULE_ID]?.sourceUuid || item?.flags?.core?.sourceId || item?.system?.sourceId || null;

      // Try to find an embedded item on the in-memory actor that matches the sourceUuid or name/type
      if (actor?.items) {
        let embeddedFound = null;
        try {
          actor.items?.forEach?.((doc) => {
            if (embeddedFound) return;
            try {
              const docSrc = doc.getFlag?.(MODULE_ID, 'sourceUuid') || doc.flags?.core?.sourceId || doc.system?.sourceId || doc.uuid;
              if (sourceUuid && docSrc && (docSrc === sourceUuid)) {
                embeddedFound = doc;
                return;
              }
              // Fallback: match by name and type
              if (!embeddedFound && item?.name && doc?.name === item.name && doc?.type === item.type) {
                embeddedFound = doc;
                return;
              }
            } catch (_) {}
          });
        } catch (_) {}

        if (embeddedFound) {
          try { embeddedFound.sheet.render(true); } catch (e) { console.error(e); }
          return;
        }
      }

      // If we couldn't find an embedded item but have a compendium/source item, add it to the in-memory actor using updateSource
      const isCompendium = !!(item?.pack || item?.flags?.core?.sourceId || sourceUuid && String(sourceUuid).startsWith('Compendium'));
      if (isCompendium) {
        try {
          // Get a plain data source for the item
          const itemData = item?.toObject ? item.toObject() : { ...(item || {}) };
          if (itemData && itemData._id) delete itemData._id;
          // Ensure we preserve the original compendium/source uuid under our module flags
          try {
            itemData.flags = itemData.flags || {};
            itemData.flags[MODULE_ID] = { ...(itemData.flags[MODULE_ID] || {}), sourceUuid: sourceUuid };
          } catch (_) {}

          // Append to the actor's current item sources and update via Utility.updateSource
          const current = getItemSourcesFromActor(actor) || [];
          current.push(itemData);
          await updateSource(actor, { items: current });

          // After updating, try to find the new embedded item and open its sheet
          try {
            let newEmbedded = null;
            actor.items?.forEach?.((doc) => {
              if (newEmbedded) return;
              try {
                const docSrc = doc.getFlag?.(MODULE_ID, 'sourceUuid') || doc.flags?.core?.sourceId || doc.system?.sourceId || doc.uuid;
                if (docSrc && sourceUuid && docSrc === sourceUuid) {
                  newEmbedded = doc;
                }
                if (!newEmbedded && doc.name === itemData.name && doc.type === itemData.type) {
                  newEmbedded = doc;
                }
              } catch (_) {}
            });
            if (newEmbedded) {
              newEmbedded.sheet.render(true);
              return;
            }
          } catch (_) {}
        } catch (err) {
          console.error('[NpcCreate] failed to add compendium item to actor', err);
        }
      }
    } catch (err) {
      console.error('[NpcCreate] openFeatureEditor failed', err);
      ui.notifications?.error?.('Unable to open feature editor');
    }
  }
</script>

<template lang="pug">
StandardTabLayout(title="Create NPC" showTitle="true" tabName="npc-create")
  div(slot="left")
    FeatureItemList(trashable="{true}" uuidFromFlags="{true}"  dedupe="{true}" sort="{true}" extraAction="{openFeatureEditor}" extraActionIcon="{'fas fa-edit'}" extraActionTitle="{'Edit Feature'}")
  
  div(slot="right")
    // CR Adjustment Tool
    //- CRAdjuster(
    //-   actor="{$actor}"
    //-   readonly="{false}"
    //-   on:crAdjusted="{handleCRAdjusted}"
    //- )
    
    hr.my-md
    
    // NPC Stat Block
    NPCStatBlock(
      name="{$actor.name || 'Unnamed NPC'}"
      npc="{$actor}"
      readonly="{false}"
      enableCrCalculator="{true}"
    )
</template>

<style lang="sass" scoped>
// Add any specific styling here if needed
</style>
