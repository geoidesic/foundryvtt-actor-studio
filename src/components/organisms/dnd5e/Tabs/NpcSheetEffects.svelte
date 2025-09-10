<script>
  import { getContext, onMount, tick } from 'svelte';
  import FeatureItemList from "~/src/components/molecules/dnd5e/NPC/FeatureItemList.svelte";
  import { CONDITION_DEFS } from '~/src/helpers/constants';
  const documentStore = getContext('#doc');
  // ensure defaults to avoid runtime undefined errors during reactive updates
  let actor = null;
  $: actor = $documentStore;

  let effects = [];
  $: effects = Array.from(actor?.effects ?? []);

  async function toggle(effect){
    try { await effect.update?.({ disabled: !effect.disabled }); }
    catch(err){ console.warn('Failed toggling effect', err); }
  }

  // CONDITION_DEFS imported from constants.ts

  // Helper to find a condition active effect by key
  function findConditionEffect(key){
    return effects.find(e => e?.flags?.['dnd5e']?.condition === key || e?.label?.toLowerCase?.().includes(key));
  }

  // Toggle a condition: create an ActiveEffect when enabling, delete when disabling
  async function toggleCondition(key){
    try{
      const existing = findConditionEffect(key);
      if (existing) {
        await actor.deleteEmbeddedDocuments?.('ActiveEffect', [existing.id]);
      } else {
        const def = CONDITION_DEFS.find(c => c.key === key);
        const payload = {
          label: def?.label ?? key,
          icon: def?.icon ?? 'icons/svg/aura.svg',
          origin: actor?.uuid ?? null,
          disabled: false,
          // mark flag so we can find it later
          flags: { dnd5e: { condition: key } }
        };
        await actor.createEmbeddedDocuments?.('ActiveEffect', [payload]);
      }
    } catch(err){ console.warn('Failed toggling condition', key, err); }
  }

  // Derived view model for effects to keep Pug simple
  $: effectsView = effects.map(e => ({
    id: e.id,
    icon: e.icon || e.img || 'icons/svg/aura.svg',
    label: e.label ?? e?.name ?? 'Unnamed Effect',
    disabled: !!e.disabled,
    durationText: (e.duration && e.duration.seconds) ? `${Math.round((e.duration.seconds||0)/60)} minutes` : '',
    source: (function(){
      const raw = e.source ?? e.origin ?? '';
      if (!raw) return '';
      // Try to extract a human-friendly name from origin strings like
      // "Compendium.dnd5e.spells.Item.phbsplMageArmor" or "Actor.<id>"
      const parts = String(raw).split('.');
      const last = parts[parts.length-1] || raw;
      // If the last part contains a camel-cased item id like phbsplMageArmor, try to split by uppercase
      const pretty = last.replace(/([a-z])([A-Z])/g, '$1 $2');
      return pretty;
    })(),
    original: e
  }));

  // Map of condition presence for template binding
  $: conditionFound = CONDITION_DEFS.reduce((m, c) => { m[c.key] = !!findConditionEffect(c.key); return m; }, {});

  // Map actor.effects to FeatureItemList-friendly objects
  $: featureEffects = effects.map(e => ({
    id: e.id,
    img: e.icon || e.img || 'icons/svg/aura.svg',
    name: e.label ?? e?.name ?? 'Unnamed Effect',
    link: e.label ?? e?.name ?? 'Effect',
    raw: e
  }));

  // Handler to toggle enable/disable using FeatureItemList extraAction
  function handleEffectToggle(it) {
    const e = it?.raw;
    if (e) toggle(e);
  }

  // Build condition items for FeatureItemList
  // If the optional Player's Handbook module isn't installed, filter out
  // any condition defs that reference the PHB compendium to avoid broken UUIDs.
  $: availableConditionDefs = (function(){
    try {
      const phbInstalled = !!(game?.modules?.get && game.modules.get('dnd-players-handbook')?.active);
      if (phbInstalled) return CONDITION_DEFS;
      return CONDITION_DEFS.filter(c => !(c.uuid && String(c.uuid).includes('Compendium.dnd-players-handbook')));
    } catch (err) {
      return CONDITION_DEFS;
    }
  })();

  $: conditionItems = availableConditionDefs.map(c => ({
    id: c.key,
    img: c.icon,
    name: c.label,
    // prefer compendium uuid enrichment when available
    link: c.uuid ? `@UUID[${c.uuid}]{${c.label}}` : c.label,
    checked: conditionFound[c.key],
    _condKey: c.key
  }));

  async function handleConditionAction(it) {
    const key = it?._condKey;
    if (!key) return;
    await toggleCondition(key);
  }

</script>

<template lang="pug">
  section
    +if("featureEffects.length === 0")
      p No temporary effects
    +if("featureEffects.length > 0")
      FeatureItemList(customStyles="--gas-item-list-height: 30px" items="{featureEffects}" showImage="{true}" showActions="{false}" trashable="{false}" extraAction="{handleEffectToggle}" extraActionIcon="fas fa-toggle-on" extraActionTitle="Toggle Effect")
    +if("conditionItems.length > 0")
      FeatureItemList(customStyles="--gas-item-list-height: 30px" items="{conditionItems}" showImage="{true}" showActions="{false}" trashable="{false}" extraAction="{handleConditionAction}" extraActionIcon="fas fa-toggle-on" extraActionTitle="Toggle Condition")
</template>

<style lang="sass">
section
  padding: .25rem

</style>
