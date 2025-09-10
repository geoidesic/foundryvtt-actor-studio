<script>
  import { getContext } from 'svelte';
  import FeatureItemList from "~/src/components/molecules/dnd5e/NPC/FeatureItemList.svelte";
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

  // Standard D&D condition definitions used for the Conditions grid
  const CONDITION_DEFS = [
  { key: 'blinded', label: 'Blinded', icon: 'systems/dnd5e/icons/svg/statuses/blinded.svg' },
  { key: 'charmed', label: 'Charmed', icon: 'systems/dnd5e/icons/svg/statuses/charmed.svg' },
  { key: 'deafened', label: 'Deafened', icon: 'systems/dnd5e/icons/svg/statuses/deafened.svg' },
  { key: 'exhaustion', label: 'Exhaustion', icon: 'systems/dnd5e/icons/svg/statuses/exhaustion.svg' },
  { key: 'frightened', label: 'Frightened', icon: 'systems/dnd5e/icons/svg/statuses/frightened.svg' },
  { key: 'grappled', label: 'Grappled', icon: 'systems/dnd5e/icons/svg/statuses/grappled.svg' },
  { key: 'incapacitated', label: 'Incapacitated', icon: 'systems/dnd5e/icons/svg/statuses/incapacitated.svg' },
  { key: 'invisible', label: 'Invisible', icon: 'systems/dnd5e/icons/svg/statuses/invisible.svg' },
  { key: 'paralyzed', label: 'Paralyzed', icon: 'systems/dnd5e/icons/svg/statuses/paralyzed.svg' },
  { key: 'petrified', label: 'Petrified', icon: 'systems/dnd5e/icons/svg/statuses/petrified.svg' },
  { key: 'poisoned', label: 'Poisoned', icon: 'systems/dnd5e/icons/svg/statuses/poisoned.svg' },
  { key: 'prone', label: 'Prone', icon: 'systems/dnd5e/icons/svg/statuses/prone.svg' },
  { key: 'restrained', label: 'Restrained', icon: 'systems/dnd5e/icons/svg/statuses/restrained.svg' },
  { key: 'stunned', label: 'Stunned', icon: 'systems/dnd5e/icons/svg/statuses/stunned.svg' },
  { key: 'unconscious', label: 'Unconscious', icon: 'systems/dnd5e/icons/svg/statuses/unconscious.svg' }
  ];

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
  $: conditionItems = CONDITION_DEFS.map(c => ({
    id: c.key,
    img: c.icon,
    name: c.label,
    link: c.label,
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
