<script>
  import { getContext, createEventDispatcher } from "svelte";
  import { updateSource } from "~/src/helpers/Utility";
  import EditableValue from "~/src/components/atoms/EditableValue.svelte";
  
  export let readonly = false;
  
  const actor = getContext("#doc");
  const dispatch = createEventDispatcher();
  
  $: ac = $actor?.system?.attributes?.ac;
  
  async function handleACSave(newValue) {
    const numValue = parseInt(newValue);
    if (!isNaN(numValue) && numValue >= 0) {
      try {
        await updateSource($actor, { 'system.attributes.ac.value': numValue });
        dispatch('acUpdate', {
          value: numValue
        });
      } catch (error) {
        console.error('Failed to update AC:', error);
      }
    }
  }
  
  // Open the built-in dnd5e armor class configuration dialog
  function openArmorClassConfig() {
    if (readonly || !$actor) return;
    
    try {
      // Use the built-in dnd5e ArmorClassConfig
      // eslint-disable-next-line no-undef
      new dnd5e.applications.actor.ArmorClassConfig({ document: $actor }).render({ force: true });
    } catch (error) {
      console.error('Failed to open armor class configuration:', error);
      ui.notifications?.error?.('Failed to open armor class configuration dialog');
    }
  }
</script>

<template lang="pug">
  .armor-class
    .label AC: 
      EditableValue(
        value="{ac?.value || 10}"
        type="number"
        readonly="{readonly}"
        onSave="{handleACSave}"
        placeholder="10"
      )
      +if("!readonly")
        button.ac-config-btn(
          on:click!="{openArmorClassConfig}"
          title="Configure Armor Class"
          aria-label="Configure Armor Class"
        )
          i.fas.fa-cog
    //- +if("ac?.calc")
    //-   span &nbsp;({ac.calc})
</template>

<style lang="sass">
  @import "/Users/noeldacosta/code/foundryvtt-actor-studio/styles/Mixins.sass"

.armor-class
  margin: 0.5em 0
  
  .ac-config-btn
    @include config-cog-btn
</style>
