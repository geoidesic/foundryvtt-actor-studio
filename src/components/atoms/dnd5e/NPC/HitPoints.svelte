<script>
  import { getContext, createEventDispatcher } from "svelte";
  import { updateSource } from "~/src/helpers/Utility";
  import EditableValue from "~/src/components/atoms/EditableValue.svelte";
  import { enrichHTML } from "~/src/helpers/Utility";

  export let readonly = false;
  
  const actor = getContext("#doc");
  const dispatch = createEventDispatcher();
  
  $: hp = $actor?.system?.attributes?.hp;
  
  async function handleMaxHPSave(newValue) {
    const numValue = parseInt(newValue);
    if (!isNaN(numValue) && numValue >= 1) {
      try {
        await updateSource($actor, { 
          'system.attributes.hp.max': numValue,
          'system.attributes.hp.value': numValue
        });
        dispatch('hpUpdate', {
          type: 'max',
          value: numValue
        });
      } catch (error) {
        console.error('Failed to update HP:', error);
      }
    }
  }
  
  async function handleFormulaSave(newValue) {
    try {
      await updateSource($actor, { 'system.attributes.hp.formula': newValue });
      dispatch('hpUpdate', {
        type: 'formula',
        value: newValue
      });
    } catch (error) {
      console.error('Failed to update HP formula:', error);
    }
  }
  
  // Open the built-in dnd5e hit points configuration dialog
  function openHitPointsConfig() {
    if (readonly || !$actor) return;
    
    try {
      // Use the built-in dnd5e HitPointsConfig
      // eslint-disable-next-line no-undef
      new dnd5e.applications.actor.HitPointsConfig({ document: $actor }).render({ force: true });
    } catch (error) {
      console.error('Failed to open hit points configuration:', error);
      ui.notifications?.error?.('Failed to open hit points configuration dialog');
    }
  }
</script>

<template lang="pug">
  .hit-points
    .label.inline
      strong Hit Points  
    +if("hp?.formula")
      +await("enrichHTML(`[[/r ${hp.formula}]]`)")
        +then("Html")
          .value
            EditableValue(
              value="{hp?.max || 10}"
              type="number"
              readonly="{readonly}"
              onSave!="{handleMaxHPSave}"
              placeholder="10"
            )
            span {@html Html}
            +if("!readonly")
              button.hp-config-btn(
                on:click!="{openHitPointsConfig}"
                title="Configure Hit Points"
                aria-label="Configure Hit Points"
              )
                i.fas.fa-cog
      +else()
        .value
          EditableValue(
            value="{hp?.max || 10}"
            type="number"
            readonly="{readonly}"
            onSave!="{handleMaxHPSave}"
            placeholder="10"
          )
          +if("!readonly")
            button.hp-config-btn(
              on:click!="{openHitPointsConfig}"
              title="Configure Hit Points"
              aria-label="Configure Hit Points"
            )
              i.fas.fa-cog
    +if("hp?.temp")
      span &nbsp;Temp: {hp.temp}/{hp.tempmax}
</template>

<style lang="sass">
  @import "/Users/noeldacosta/code/foundryvtt-actor-studio/styles/Mixins.sass"

.hit-points 
  margin: 0.5em 0
  
  .hp-config-btn
    @include config-cog-btn
</style>