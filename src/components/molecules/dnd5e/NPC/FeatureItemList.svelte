<script>
  import { getContext } from "svelte";
  import { localize as t, enrichHTML, deleteActorItem } from "~/src/helpers/Utility";
  import { MODULE_ID } from "~/src/helpers/constants";
  // itemsFromActor is provided by context from NPCAppShell

  // Items should be an array of objects with at least { img, name, link? }
  export let trashable = true;
  export let items = null;

  const actor = getContext("#doc");

  // Derive a best-effort UUID for enrichment from raw item source
  function getSourceUuidFromRaw(it, doc) {
    try {
      const flags = it?.flags || {};
      const fromModule = flags?.[MODULE_ID]?.sourceUuid;
      const fromCore = flags?.core?.sourceId;
      const fromSystem = it?.system?.sourceId;
      const direct = it?.uuid;
      const itemId = it?._id || it?.id;
      const parentUuid = doc?.uuid;
      const embedded = itemId ? (parentUuid ? `${parentUuid}.Item.${itemId}` : `Item.${itemId}`) : null;
      return fromModule || fromCore || fromSystem || direct || embedded || null;
    } catch (_) {
      return null;
    }
  }
  async function handleTrash(id) {
    await deleteActorItem(actor, id);
  }

  $: displayItems = items ? items : $actor.items;
  $: whichDisplay = items ? 'items' : 'itemsFromActor';
  $: itemsLength = displayItems instanceof Map ? displayItems?.size : displayItems?.length;

  // --- Feature actions: Send to Chat & Roll ---
  async function sendItemToChat(it) {
    try {
      // Prefer embedded item on actor
      if (typeof it?.displayCard === 'function') {
        await it.displayCard();
        return;
      }
      // Try resolving a source UUID to a compendium/world item
      const uuid = getSourceUuidFromRaw(it, actor);
      if (uuid) {
        const doc = await fromUuid(uuid);
        if (typeof doc?.displayCard === 'function') {
          await doc.displayCard();
          return;
        }
      }
      // Fallback simple chat message
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<h3>${it?.name ?? 'Feature'}</h3>`
      });
    } catch (e) {
      console.error('[GAS][NPC FeatureItemList] sendItemToChat failed', e);
      ui.notifications?.error?.('Failed to send to chat');
    }
  }

  function findActivityAbility(it) {
    const sys = it?.system ?? {};
    // dnd5e v4 activities are an object of activity definitions
    const acts = Object.values(sys.activities ?? {});
    for (const act of acts) {
      const checkAbility = act?.check?.ability ?? act?.attack?.ability ?? act?.ability;
      if (checkAbility) return { type: 'check', ability: checkAbility };
      const saveAbility = act?.save?.ability;
      if (saveAbility) return { type: 'save', ability: saveAbility };
    }
    // Legacy / fallback hints
    if (sys?.check?.ability) return { type: 'check', ability: sys.check.ability };
    if (sys?.save?.ability) return { type: 'save', ability: sys.save.ability };
    if (sys?.ability) return { type: 'check', ability: sys.ability };
    return null;
  }

  async function rollFeatureAsAbility(it, event) {
    try {
      // Use item.use if available (v4 activity flow)
      if (typeof it?.use === 'function') {
        await it.use({ event });
        return;
      }
      // Try resolving a UUID to a real Document with use()
      const uuid = getSourceUuidFromRaw(it, actor);
      if (uuid) {
        const doc = await fromUuid(uuid);
        if (typeof doc?.use === 'function') {
          await doc.use({ event });
          return;
        }
      }
      // Fallback: infer an ability and roll with actor
      const info = findActivityAbility(it);
      if (info?.ability) {
        const ability = info.ability;
        // v4 preferred
        if (info.type === 'save') {
          if (typeof actor?.rollSavingThrow === 'function') {
            await actor.rollSavingThrow({ ability, event });
            return;
          }
          if (typeof actor?.rollAbilitySave === 'function') {
            await actor.rollAbilitySave(ability, { event });
            return;
          }
        } else {
          if (typeof actor?.rollAbilityCheck === 'function') {
            await actor.rollAbilityCheck({ ability, event });
            return;
          }
          if (typeof actor?.rollAbilityTest === 'function') {
            await actor.rollAbilityTest(ability, { event });
            return;
          }
        }
      }
      // Last resort: post to chat
      ui.notifications?.warn?.('No rollable activity; posting to chat');
      await sendItemToChat(it);
    } catch (e) {
      console.error('[GAS][NPC FeatureItemList] rollFeatureAsAbility failed', e);
      ui.notifications?.error?.('Failed to roll feature');
    }
  }

</script>

<template lang="pug">
ul.icon-list
  +if("itemsLength")
    +each("displayItems as item, idx")
      li.left
        .flexrow
        .flexrow.relative
          .flex0.relative.image.mr-sm
            img.icon(src="{item.img}" alt="{item.name}")
          +await("enrichHTML(trashable ? '@UUID['+item._source?.flags?.[MODULE_ID]?.sourceUuid+']{'+item.name+'}' : item.link || item.name)")
            +then("Html")
              .flex2.text {@html Html}
          // Feature action buttons: chat + roll
          .flex0
            button.icon-button.mr-sm(type="button" title="Send to Chat" data-tooltip="Send to Chat" on:click!="{() => sendItemToChat(item)}" aria-label="Send to Chat")
              i(class="fas fa-comment")
          .flex0
            button.icon-button.mr-sm(type="button" title="Roll Feature" data-tooltip="Roll Feature" on:click!="{(ev) => rollFeatureAsAbility(item, ev)}" aria-label="Roll Feature")
              i(class="fas fa-dice-d20")
          +if("trashable")
            .flex0
              button.icon-button.mr-sm(type="button" on:click!="{() => handleTrash(item.id)}" aria-label="Remove")
                i(class="fas fa-trash")
</template>

<style lang="sass" scoped>
ul.icon-list
  list-style: none
  margin: 0
  padding: 0

ul.icon-list > li
  padding: 0
  &:hover
    box-shadow: 4px 0px 8px 3px var(--actor-studio-color-primary) inset

// Ensure content aligns nicely per Foundry flex helpers
.flexrow
  align-items: center

.image
  position: relative
  width: 40px
  min-width: 40px
  height: 40px

.tab-content ul.icon-list .image img.icon
  position: absolute
  top: 0
  left: 0
  bottom: 0
  right: 0
  width: 100%
  height: 100%
  object-fit: cover

.tab-content ul.icon-list .image
  min-width: 40px
// Keep the trash button centered vertically
button.icon-button
  margin-top: 0

.text
  display: flex
  align-items: center
</style>


