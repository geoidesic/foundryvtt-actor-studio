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

  // Roll an ability check: prefer 5e v4 (actor.rollAbilityCheck), fallback to 5e v3 (actor.rollAbilityTest)
  async function rollAbility(event) {
    try {
      const a = $actor;
      const ab = String(abbreviation || '').toLowerCase();
      if (!a || !ab) return;

      // DnD5e v4.x API (Foundry V13+)
      if (typeof a.rollAbilityCheck === 'function') {
        return a.rollAbilityCheck({ ability: ab, event });
      }

      // DnD5e v3.x API
      if (typeof a.rollAbilityTest === 'function') {
        return a.rollAbilityTest(ab, { event });
      }

      // Older/alternate fallbacks sometimes expose a direct roll on the ability
      const directRoll = a?.system?.abilities?.[ab]?.roll || a?.abilities?.[ab]?.roll;
      if (typeof directRoll === 'function') {
        return directRoll({ event });
      }

      ui?.notifications?.warn?.(`Ability roll not supported: ${ab}`);
    } catch (err) {
      console.warn('Ability roll failed', abbreviation, err);
    }
  }

  // Roll a saving throw: prefer 5e v4 (actor.rollSavingThrow), fallback to 5e v3 (actor.rollAbilitySave)
  async function rollSave(event) {
    try {
      const a = $actor;
      const ab = String(abbreviation || '').toLowerCase();
      if (!a || !ab) return;

      if (typeof a.rollSavingThrow === 'function') return a.rollSavingThrow({ ability: ab, event });
      if (typeof a.rollAbilitySave === 'function') return a.rollAbilitySave(ab, { event });
      if (a?.system?.abilities?.[ab]?.save?.roll) return a.system.abilities[ab].save.roll({ event });
      if (a?.saves?.[ab]?.roll) return a.saves[ab].roll({ event });
      ui?.notifications?.warn?.(`Save roll not supported: ${ab}`);
    } catch (err) {
      console.warn('Save roll failed', abbreviation, err);
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
        button.roll.rollable.ability-check(
          title="Roll {abbreviation}"
          data-ability="{abbreviation}"
          aria-label="{abbreviation} ability check"
          on:click!="{rollAbility}"
        )
          i.fas.fa-dice-d20
        span {abbreviation}
        button.roll.rollable.ability-save(
          title="Roll {abbreviation} Save"
          data-ability="{abbreviation}"
          aria-label="{abbreviation} saving throw"
          on:click!="{rollSave}"
        )
          i.fas.fa-shield-alt
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
