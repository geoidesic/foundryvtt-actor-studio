<script>
  import { getContext, onMount, tick } from "svelte";
  import { localize as t, enrichHTML, deleteActorItem } from "~/src/helpers/Utility";
  import { MODULE_ID } from "~/src/helpers/constants";
  // itemsFromActor is provided by context from NPCAppShell

  // Items should be an array of objects with at least { img, name, link? }
  export let trashable;
  export let uuidFromFlags = false;
  export let items = null;
  export let sort = false;    // opt-in alphabetical sort
  export let dedupe = false;  // opt-in deduplication
  export let showActions = false; // show chat/roll actions
  export let showImage = true; // show item image column
  export let hideSpellDuplicates = false; // hide spells already represented by feature activities
  // Optional extra action to render per-item. If provided, should be a function(item) => void
  export let extraAction = null;
  export let extraActionIcon = null;
  export let extraActionTitle = null;
  export let customStyles = '--gas-item-list-height: 40px'

  const actor = getContext("#doc");
  import { actorInGame } from '~/src/stores/storeDefinitions';

  function capitalize(s) {
    try { return s ? (s.charAt(0).toUpperCase() + s.slice(1)) : ''; } catch (_) { return s || ''; }
  }

  // Resolve a user-facing label for an item's type (e.g., "Spell", "Feat")
  function typeLabelOf(it) {
    try {
      const rawType = it?.type || it?.system?.type || it?.source?.type || '';
      if (!rawType) return '';
      // Try common localization keys first
      const key1 = `TYPES.Item.${rawType}`;
      const key2 = `DND5E.ItemType${capitalize(rawType)}`;
      const loc1 = game?.i18n?.localize?.(key1);
      if (loc1 && loc1 !== key1) return loc1;
      const loc2 = game?.i18n?.localize?.(key2);
      if (loc2 && loc2 !== key2) return loc2;
      return capitalize(rawType);
    } catch (_) { return ''; }
  }

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
    await deleteActorItem($actor, id);
  }

  // Prefer the live in-game actor's embedded items (actor.items) when available so
  // list entries are the actual embedded Item Documents (with Actor-prefixed UUIDs).
  // Use actor.items.contents when present (Collection -> array of documents).
  // Fallback to the $actor store if the context provides a store instead.
  // Prefer the in-memory actor (actorInGame) when present during the workflow.
  // Otherwise prefer the live actor.items.contents if available, then fall back to actor snapshots.
  $: displayItems = items
    ? items
    : ($actorInGame?.items?.contents ? $actorInGame.items.contents : (actor?.items?.contents ? actor.items.contents : (actor?.items ?? $actor?.items)));
  $: whichDisplay = items
    ? 'items'
    : ($actorInGame?.items?.contents ? 'itemsFromActorInMemory' : (actor?.items?.contents ? 'itemsFromActorContents' : 'itemsFromActor'));

  function toArray(coll) {
    try {
      if (!coll) return [];
      if (Array.isArray(coll)) return [...coll];
      if (coll instanceof Map) return Array.from(coll.values());
      if (typeof coll.values === 'function') return Array.from(coll.values());
      if (Array.isArray(coll.contents)) return [...coll.contents];
      return Object.values(coll);
    } catch (_) { return []; }
  }

  function dedupeByKey(arr) {
    if (!dedupe) return arr;
    const seen = new Set();
    const out = [];
    for (const it of arr) {
      const key = (it?.flags?.[MODULE_ID]?.sourceUuid)
        || it?.flags?.core?.sourceId
        || it?.system?.sourceId
        || it?.uuid
        || it?._id
        || it?.id
        || `${(it?.name || '').toLowerCase()}|${it?.type || ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(it);
    }
    return out;
  }

  function maybeSort(arr) {
    if (!sort) return arr;
    return [...arr].sort((a, b) => (a?.name ?? '').localeCompare(b?.name ?? '', undefined, { sensitivity: 'base' }));
  }

  function getStableUuid(it) {
    try {
      return (
        it?.uuid ||
        it?.flags?.[MODULE_ID]?.sourceUuid ||
        it?.flags?.core?.sourceId ||
        it?.system?.sourceId ||
        it?._id ||
        it?.id ||
        null
      );
    } catch (_) {
      return null;
    }
  }

  function collectReferencedSpellUuids(arr) {
    const out = new Set();
    try {
      for (const it of arr) {
        if (!it || it?.type === 'spell') continue;
        const acts = it?.system?.activities || {};
        for (const key of Object.keys(acts)) {
          const act = acts[key];
          const uuid = act?.consumers?.spell?.uuid
            || act?.config?.spell?.uuid
            || act?.spell?.uuid
            || act?.uuid;
          if (uuid) out.add(uuid);
        }
      }
    } catch (_) {}
    return out;
  }

  function maybeHideSpellDuplicates(arr) {
    if (!hideSpellDuplicates) return arr;
    const referenced = collectReferencedSpellUuids(arr);
    return arr.filter((it) => {
      if (it?.type !== 'spell') return true;
      const uuid = getStableUuid(it) || getSourceUuidFromRaw(it, actor);
      if (uuid && referenced.has(uuid)) return false;
      // Fallback: hide same-named spell if a non-spell item with same name exists
      const name = (it?.name || '').toLowerCase();
      const hasSameNamedNonSpell = arr.some((x) => x !== it && x?.type !== 'spell' && (x?.name || '').toLowerCase() === name);
      return !hasSameNamedNonSpell;
    });
  }

  // Always render from an array, but only dedupe/sort when explicitly requested
  $: listItems = (() => {
  const base0 = toArray(displayItems);
  const base = maybeHideSpellDuplicates(base0);
  const uniq = dedupeByKey(base);
    return maybeSort(uniq);
  })();
  $: itemsLength = Array.isArray(listItems) ? listItems.length : 0;

  // Diagnostic logging: when the list changes, report the source and a few item metadata
  $: if (typeof window !== 'undefined' && listItems) {
    try {
      const logger = window?.GAS?.log?.d || console.debug || (() => {});
      logger(`[FeatureItemList] whichDisplay=${whichDisplay} count=${listItems.length}`);
      // Log the first 10 items with key metadata so we can see if the UUIDs are actor-prefixed
      const toLog = listItems.slice(0, 10).map((it, i) => ({
        idx: i,
        name: it?.name,
        uuid: getStableUuid(it) || it?.uuid || null,
        id: it?._id || it?.id || null,
        hasSheet: !!it?.sheet,
        isEmbedded: !!it?.isEmbedded || !!(actor?.items?.get?.(it?._id || it?.id)),
        fromActorItems: !!actor?.items?.get?.(it?._id || it?.id)
      }));
      const qlog = window?.GAS?.log?.q || console.dir || (() => {});
      qlog({ component: 'FeatureItemList', items: toLog });
    } catch (_) {}
  }

  // Per-item render logging (emit each item's uuid once)
  const _renderedItemUuids = new Set();
  $: if (typeof window !== 'undefined' && listItems) {
    try {
      const qlog = window?.GAS?.log?.q || console.dir || (() => {});
      for (let i = 0; i < listItems.length; i++) {
        const it = listItems[i];
        const uuid = getStableUuid(it) || it?.uuid || null;
        if (!uuid) continue;
        if (_renderedItemUuids.has(uuid)) continue;
        _renderedItemUuids.add(uuid);
        qlog({ rendered: { idx: i, name: it?.name, uuid, id: it?._id || it?.id || null } });
      }
    } catch (_) {}
  }

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

  // Ensure callers receive a live embedded Item document when available
  function getLiveEmbeddedItem(it) {
    try {
      // If it's already a live Document with a sheet, return it
      if (it?.sheet && typeof it.sheet.render === 'function') return it;

      // Try by _id / id on the actor
      const id = it?._id || it?.id;
      if (id && actor?.items?.get) {
        const doc = actor.items.get(id);
        if (doc) return doc;
      }

      // Try by stable source uuid or flags
      const src = it?.flags?.[MODULE_ID]?.sourceUuid || it?.flags?.core?.sourceId || it?.system?.sourceId || it?.uuid;
      if (src && actor?.items) {
        // If src looks like an unprefixed embedded uuid (Item.xxx), try actor-prefixed form first
        try {
          if (/^Item\.[A-Za-z0-9]+$/.test(src) && actor?.uuid) {
            const actorPref = `${actor.uuid}.${src}`;
            const byExact = actor.items.find(i => i?.uuid === actorPref);
            if (byExact) return byExact;
          }
        } catch (_) {}

        const bySrc = actor.items.find(i => (i.getFlag?.(MODULE_ID, 'sourceUuid') || i.flags?.core?.sourceId || i.system?.sourceId || i.uuid) === src);
        if (bySrc) return bySrc;
      }

      // Fallback: match by name and type
      if (it?.name && it?.type && actor?.items) {
        const byName = actor.items.find(i => i.name === it.name && i.type === it.type);
        if (byName) return byName;
      }
    } catch (_) {}
    return it;
  }

  // ...logging handled in reactive script; no template inline calls required

</script>

<template lang="pug">
ul.icon-list(style="{customStyles}")
  +if("itemsLength")
    +each("listItems as item, idx")
      li.left
        .flexrow
          .flexrow.relative
            +if("showImage")
              .flex0.relative.image.mr-sm
                img.icon(src="{item.img}" alt="{item.name}")
            +await("enrichHTML(uuidFromFlags ? '@UUID['+item._source?.flags?.[MODULE_ID]?.sourceUuid+']{'+item.name+'}' : item.uuid ? '@UUID['+item.uuid+']' : item.link  || item.name)")
              +then("Html")
                .flex2.text {@html Html}
            // Type badge (e.g., Spell / Feat)
            +if("typeLabelOf(item)")
              .flex0
                span.type-badge {typeLabelOf(item)}
            // Feature action buttons: chat + roll (optional)
            +if("showActions")
              .flex0
                button.icon-button.mr-sm(type="button" title="Send to Chat" data-tooltip="Send to Chat" on:click!="{() => sendItemToChat(item)}" aria-label="Send to Chat")
                  i(class="fas fa-comment")
              .flex0
                button.icon-button.mr-sm(type="button" title="Roll Feature" data-tooltip="Roll Feature" on:click!="{(ev) => rollFeatureAsAbility(item, ev)}" aria-label="Roll Feature")
                  i(class="fas fa-dice-d20")
            +if("extraAction")
              .flex0
                button.icon-button.mr-sm(type="button" title="{extraActionTitle || ''}" on:click!="{() => extraAction(getLiveEmbeddedItem(item))}" aria-label="Extra Action")
                  i(class="{extraActionIcon || 'fas fa-bolt'}")
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
  position: relative
  width: var(--gas-item-list-height)
  min-width: var(--gas-item-list-height)
  height: var(--gas-item-list-height)
  min-width: var(--gas-item-list-height)

// Keep the trash button centered vertically
button.icon-button
  margin-top: 0

.text
  display: flex
  align-items: center

.type-badge
  display: inline-block
  padding: 2px 6px
  margin-left: .25rem
  font-size: 10px
  line-height: 1
  text-transform: uppercase
  border-radius: 9999px
  background: var(--dnd5e-background-20)
  border: 1px solid var(--color-border-highlight)
  color: var(--color-text-light-0)
</style>


