<script>
  import { getContext, onMount, onDestroy } from "svelte";
  import IconSearchSelect from "~/src/components/atoms/select/IconSearchSelect.svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import FeatureItemList from "~/src/components/molecules/dnd5e/NPC/FeatureItemList.svelte";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { enrichHTML } from "~/src/helpers/Utility";

  const actor = getContext("#doc");

  let options = [];
  let active = null;
  let value = null;
  let placeHolder = "Add a Feature...";
  let rightPanelItems = [];

  const INDEX_KEY = `${MODULE_ID}-npc-feature-index-v1`;

  function replaceActorName(html, actorName) {
    try {
      if (!html || !actorName) return html || '';
      return html.replace(/@name\b/gi, actorName);
    } catch (_) {
      return html;
    }
  }

  function loadIndexOptions() {
    try {
      const raw = localStorage.getItem(INDEX_KEY);
      if (!raw) return [];
      const payload = JSON.parse(raw);
      const idx = payload?.index || [];
      // Flatten into simple options; allow duplicates by uuid
      const flattened = [];
      for (const row of idx) {
        const list = row?.items || [];
        for (const it of list) {
          if (it?.uuid && it?.name) {
            flattened.push({ label: it.name, value: it.uuid });
          }
        }
      }
      return flattened;
    } catch (_) {
      return [];
    }
  }

  function getItemSourcesFromActor(doc) {
    try {
      const src = doc?.toObject?.();
      if (!src) return [];
      return Array.isArray(src.items) ? src.items : [];
    } catch (_) {
      return [];
    }
  }

  async function refreshRightPanelFromActor(doc) {
    try {
      const items = getItemSourcesFromActor(doc);
      rightPanelItems = (items || []).map((it) => ({
        img: it?.img,
        name: it?.name,
        link: it?.link || (it?.uuid ? `@UUID[${it.uuid}]{${it.name}}` : it?.name)
      }));
    } catch (_) {
      rightPanelItems = [];
    }
  }

  const selectFeatureHandler = async (uuid) => {
    try {
      const item = await fromUuid(uuid);
      if (!item) return;
      const data = game.items.fromCompendium(item);
      if (data && data._id) delete data._id; // ensure fresh id

      const items = getItemSourcesFromActor($actor);
      items.push(data);
      $actor.updateSource({ items });
      value = uuid;
      active = uuid;
      // subscriber will refresh panel
    } catch (err) {
      window.GAS?.log?.e?.('[NPC Features] Failed adding feature', err);
    }
  };

  function removeFeatureAt(index) {
    try {
      const items = getItemSourcesFromActor($actor);
      if (index < 0 || index >= items.length) return;
      items.splice(index, 1);
      $actor.updateSource({ items });
    } catch (err) {
      window.GAS?.log?.e?.('[NPC Features] Failed removing feature', err);
    }
  }

  function handleRemoveClick(event) {
    try {
      const idxAttr = event?.currentTarget?.dataset?.index;
      const idx = Number(idxAttr);
      if (Number.isFinite(idx)) removeFeatureAt(idx);
    } catch (_) {}
  }

  // Async helpers used with +await for enrichment (ensures parity with tab 1 rendering)
  async function enrichNameInline(name, uuid, doc) {
    try {
      const inline = uuid ? `@UUID[${uuid}]{${name}}` : name;
      const rollData = typeof doc?.getRollData === 'function' ? doc.getRollData() : {};
      const html = await enrichHTML(inline, { async: true, rollData, relativeTo: doc });
      return replaceActorName(html, doc?.name);
    } catch (_) {
      return name;
    }
  }
  async function enrichTextWithActor(raw, doc) {
    try {
      const rollData = typeof doc?.getRollData === 'function' ? doc.getRollData() : {};
      const html = await enrichHTML(raw || '', { async: true, rollData, relativeTo: doc });
      return replaceActorName(html, doc?.name);
    } catch (_) {
      return raw || '';
    }
  }

  let unsubscribe;
  onMount(async () => {
    options = loadIndexOptions();
    // Subscribe to actor changes so the right panel reflects current in-memory items
    try {
      unsubscribe = actor.subscribe(async (doc) => {
        await refreshRightPanelFromActor(doc);
      });
    } catch (_) {}
  });
  onDestroy(() => { try { if (unsubscribe) unsubscribe(); } catch (_) {} });
</script>

<template lang="pug">
StandardTabLayout(title="NPC Features" showTitle="true" tabName="npc-features")
  div(slot="left")
    .flexrow
      .flex3
        IconSearchSelect.icon-select({options} {active} {placeHolder} handler="{selectFeatureHandler}" id="npc-feature-select" bind:value)
  div(slot="right")
    +if("rightPanelItems?.length")
      FeatureItemList(items="{rightPanelItems}" trashable)
    +if("!rightPanelItems?.length")
      .hint No features added yet.
</template>

<style lang="sass" scoped>
.icon-button
  background: var(--dnd5e-background-10)
  border: 1px solid var(--color-border-highlight)
  border-radius: 4px
  cursor: pointer
  padding: 4px 8px
  &:hover
    background: var(--dnd5e-background-20)

.mt-xxs
  margin-top: 0.25rem

.hint
  color: var(--color-text-dark-secondary)
  font-style: italic
  

  
</style>

