<script>
  import { getContext, createEventDispatcher } from "svelte";
  import EditableValue from "~/src/components/atoms/EditableValue.svelte";
  
  export let abbreviation;
  export let score;
  export let readonly = false;
  
  const actor = getContext("#doc");
  const dispatch = createEventDispatcher();
  
  const mod = Math.floor((score - 10) / 2);
  const modString = mod >= 0 ? `+${mod}` : `${mod}`;
  
  async function rollAbility() {
    try {
      const a = $actor;
      if (a?.rollAbilityTest) return a.rollAbilityTest(abbreviation);
      // fallback dnd5e v4 ability object roll
      if (a?.abilities?.[abbreviation]?.roll) return a.abilities[abbreviation].roll();
      ui?.notifications?.warn?.(`Ability roll not supported: ${abbreviation}`);
    } catch (err) {
      console.warn('Ability roll failed', abbreviation, err);
    }
  }
  
  function handleScoreSave(newValue) {
    console.log('AttributeScore - handleScoreSave called with:', newValue);
    const numValue = parseInt(newValue);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 30) {
      console.log('AttributeScore - Dispatching scoreUpdate event:', { ability: abbreviation, value: numValue });
      // Dispatch an event to let the parent component handle the update
      dispatch('scoreUpdate', {
        ability: abbreviation,
        value: numValue
      });
    } else {
      console.log('AttributeScore - Invalid value, not dispatching:', newValue);
    }
  }
</script>

<template lang="pug">
  .stat
    .flexcol.center
      .flex1.label
        button.roll(title="Roll {abbreviation}" on:click!="{rollAbility}")
          i.fas.fa-dice-d20
        span {abbreviation}
      .flex1.value
        EditableValue(
          value="{score}"
          type="number"
          readonly="{readonly}"
          onSave="{handleScoreSave}"
          placeholder="10"
        ) ({modString})
</template>

<style lang="sass">
.stat 
  .label
    font-weight: bold
    text-transform: uppercase

  .roll
    display: inline-flex
    align-items: center
    justify-content: center
    width: 22px
    height: 22px
    margin-right: 4px
    border: 1px solid var(--color-border, rgba(0,0,0,.2))
    border-radius: 4px
    background: rgba(0,0,0,.05)

// Removed unused CSS selector

</style>
