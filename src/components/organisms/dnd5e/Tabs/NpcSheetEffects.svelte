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
    { key: 'blinded', label: 'Blinded', icon: 'icons/svg/blind.svg' },
    { key: 'charmed', label: 'Charmed', icon: 'icons/svg/charm.svg' },
    { key: 'deafened', label: 'Deafened', icon: 'icons/svg/deaf.svg' },
    { key: 'exhaustion', label: 'Exhaustion', icon: 'icons/svg/exhaust.svg' },
    { key: 'frightened', label: 'Frightened', icon: 'icons/svg/frightened.svg' },
    { key: 'grappled', label: 'Grappled', icon: 'icons/svg/grapple.svg' },
    { key: 'incapacitated', label: 'Incapacitated', icon: 'icons/svg/incapacitated.svg' },
    { key: 'invisible', label: 'Invisible', icon: 'icons/svg/invisible.svg' },
    { key: 'paralyzed', label: 'Paralyzed', icon: 'icons/svg/paralysis.svg' },
    { key: 'petrified', label: 'Petrified', icon: 'icons/svg/petrified.svg' },
    { key: 'poisoned', label: 'Poisoned', icon: 'icons/svg/poison.svg' },
    { key: 'prone', label: 'Prone', icon: 'icons/svg/prone.svg' },
    { key: 'restrained', label: 'Restrained', icon: 'icons/svg/restrain.svg' },
    { key: 'stunned', label: 'Stunned', icon: 'icons/svg/stunned.svg' },
    { key: 'unconscious', label: 'Unconscious', icon: 'icons/svg/unconscious.svg' }
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
    h2 Temporary Effects
    +if("featureEffects.length === 0")
      p No temporary effects
    +if("featureEffects.length > 0")
      FeatureItemList(items="{featureEffects}" showImage="{true}" showActions="{false}" trashable="{false}" extraAction="{handleEffectToggle}" extraActionIcon="fas fa-toggle-on" extraActionTitle="Toggle Effect")

    h2 Conditions
    FeatureItemList(items="{conditionItems}" showImage="{true}" showActions="{false}" trashable="{false}" extraAction="{handleConditionAction}" extraActionIcon="fas fa-toggle-on" extraActionTitle="Toggle Condition")
</template>

<style lang="sass">
section
  padding: .25rem
ul.temp-effects
  list-style: none
  padding: 0
  margin: 0 0 1rem 0
  li
    display: grid
    grid-template-columns: 80px 1fr auto
    grid-template-rows: auto auto
    gap: 6px 12px
    align-items: center
    padding: 8px 0
    border-bottom: 1px solid rgba(255,255,255,0.04)
  .icon
    width: 100%
    max-width: 120px
    height: 120px
    object-fit: cover
    border-radius: 4px
    grid-row: span 2
  .name
    font-weight: 600
    font-size: 1rem
    line-height: 1.1
    color: #fff
  .duration
    color: rgba(255,255,255,0.8)
    font-size: 0.85rem
  .source
    color: rgba(255,255,255,0.7)
    font-size: 0.75rem
    grid-column: 1 / -1
  .state
    font-size: 0.85rem
  .small
    font-size: .8rem
    padding: 4px 8px

/* Conditions grid */
.conditions-grid
  display: grid
  grid-template-columns: repeat(3, 1fr)
  gap: 16px
  align-items: center
  margin-top: 1rem
.cond
  text-align: center
  color: #fff
  display: flex
  flex-direction: column
  align-items: center
  gap: 6px
.cond-icon
  width: 96px
  height: 96px
  object-fit: contain
  opacity: 0.95
.cond-label
  font-weight: 600
  font-size: 0.9rem

/* Simple switch style */
label.switch
  display: inline-block
  position: relative
  width: 28px
  height: 18px
  input
    opacity: 0
    width: 0
    height: 0
  span.slider
    position: absolute
    cursor: pointer
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: rgba(255,255,255,0.12)
    border-radius: 18px
    transition: .2s
    &:before
      content: ''
      position: absolute
      height: 14px
      width: 14px
      left: 2px
      top: 2px
      background: #222
      border-radius: 50%
      transition: .2s
  input:checked + span.slider
    background: #3b82f6
    &:before
      transform: translateX(10px)
</style>
