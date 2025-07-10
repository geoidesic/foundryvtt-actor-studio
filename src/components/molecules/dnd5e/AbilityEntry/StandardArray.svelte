<script>
  import { Timing } from "@typhonjs-fvtt/runtime/util";
  import {
    createEventDispatcher,
    getContext,
    onDestroy,
    onMount,
    tick,
  } from "svelte";
  import { abilities, race, isStandardArrayValues, abilityRolls } from "~/src/stores/index";
  import { MODULE_ID, STANDARD_ARRAY } from "~/src/helpers/constants";
  import { dnd5eModCalc, localize } from "~/src/helpers/Utility";

  export let document = false;

  const dispatch = createEventDispatcher();
  const doc = document || getContext("#doc");
  const updateDebounce = Timing.debounce(updateValue, 100);

  async function updateValue(attr, value) {
    // move the value to the next ability according to the direction of the arrow
    const abilities = Object.keys(STANDARD_ARRAY);
    // get index of attr from abilities
    const index = abilities.indexOf(attr);
    // window.GAS.log.d('abilities', abilities)
    // window.GAS.log.d('index', index)
    // window.GAS.log.d('value', value)
    // window.GAS.log.d('attr', attr)
    
    switch (value) {
      case -1:
        // move the value to the next ability according to the direction of the arrow
        if (index < abilities.length - 1) {
          const nextAbility = abilities[index + 1];
          // window.GAS.log.d('nextAbility', nextAbility)
          const options = {
            system: {
              abilities: {
                [attr]: { value: $doc.system.abilities[nextAbility].value },
                [nextAbility]: { value: $doc.system.abilities[attr].value },
              },
            },
          };
          // window.GAS.log.d('options', options)
          await $doc.updateSource(options);
          $doc = $doc;
        }
        break;

      default:
        // move the value to the next ability according to the direction of the arrow
        if (index > 0) {
          const nextAbility = abilities[index - 1];
          // window.GAS.log.d('nextAbility', nextAbility)
          const options = {
            system: {
              abilities: {
                [attr]: { value: $doc.system.abilities[nextAbility].value },
                [nextAbility]: { value: $doc.system.abilities[attr].value },
              },
            },
          };
          // window.GAS.log.d('options', options)
          await $doc.updateSource(options);
          $doc = $doc;
        }
        break;
    }

    // window.GAS.log.d(abilities)
    // const options = {system: {abilities: { [attr]: {value: Number(event.target.value)}}}};
    // $doc.updateSource(options)
    // $doc = $doc
  }

  async function reset() {
    $abilityRolls = {};

    const options = { system: { abilities: {} } };
    Object.keys(STANDARD_ARRAY).forEach((key) => {
      options.system.abilities[key] = {
        value: STANDARD_ARRAY[key],
      };
    });
    await $doc.updateSource(options);
    $doc = $doc;
  }

  function arraysMatch(array1, array2) {
    if (array1.length !== array2.length) return false;

    const sortedArray1 = array1.slice().sort((a, b) => a - b);
    const sortedArray2 = array2.slice().sort((a, b) => a - b);

    return sortedArray1.every((value, index) => value === sortedArray2[index]);
  }

  $: systemAbilities = game.system.config.abilities;
  $: systemAbilitiesArray = Object.entries(systemAbilities);
  $: raceFeatScore = 0;
  $: abilityAdvancements =
    $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration
      ?.fixed;
  // $: isStandardArrayValues = arraysMatch(
  //   Object.values(STANDARD_ARRAY),
  //   systemAbilitiesArray.map(
  //     (ability) => $doc.system.abilities[ability[0]].value,
  //   ),
  // );
  $: $isStandardArrayValues = arraysMatch(
    Object.values(STANDARD_ARRAY),
    Object.keys(STANDARD_ARRAY).map(
      (key) => $doc.system.abilities[key]?.value
    )
  );
  // $: {
  //   const currentAbilities = systemAbilitiesArray.map(
  //     (ability) => {
  //       window.GAS.log.d(ability) 
  //       return $doc.system.abilities[ability[0]].value
  //     }
  //   );
  //   const match = arraysMatch(STANDARD_ARRAY, currentAbilities);
  //   isStandardArrayValues.set(match);
  // }
  onMount(async () => {
    // window.GAS.log.d($doc.system.abilities)
    // window.GAS.log.d(Object.keys($doc.system.abilities))
    // window.GAS.log.d(isStandardArrayValues)
    // if all the abilities are 10, set them to the standard array
    if (
      systemAbilitiesArray.every(
        (ability) =>
          $doc.system.abilities[ability[0]]?.value === 10,
      )
    ) {
      reset();
    }
  });
</script>

<template lang="pug">
.attribute-entry.mt-sm
  table
    thead
      tr
        th.ability Ability
        th.center Race / Feat
        th.center Base Score
        th.center Score
        th.center Modifier
    tbody
      +each("systemAbilitiesArray as ability, index")
        tr
          td.ability {ability[1].label}
          td.center
            +if("abilityAdvancements?.[ability[0]] > 0")
              span +
            span {abilityAdvancements?.[ability[0]] || 0}
          td.center.relative
            input.left.small.mainscore(disabled type="number" value="{$doc.system.abilities[ability[0]]?.value}")
            .controls
              .up.chevron
                +if("index != 0")
                  i.fas.fa-chevron-up(alt="{localize('GAS.AltText.MoveUp')}" on:click!="{updateDebounce(ability[0], 1)}")
              .down.chevron
                +if("index != 5")
                  i.fas.fa-chevron-down(alt="{localize('GAS.AltText.MoveDown')}" on:click!="{updateDebounce(ability[0], -1)}")
          td.center {(Number(abilityAdvancements?.[ability[0]]) || 0) + Number($doc.system.abilities[ability[0]]?.value || 0)}
          td.center
            +if("dnd5eModCalc(Number($doc.system.abilities[ability[0]]?.value) + (Number(abilityAdvancements?.[ability[0]]) || 0)) > 0")
              span +
            span {dnd5eModCalc(Number($doc.system.abilities[ability[0]]?.value) + (Number(abilityAdvancements?.[ability[0]]) || 0))}
          
      +if("!$isStandardArrayValues")
        tr
          td(colspan="5")
            hr
            button.btn.btn-primary(on:click="{reset}") Reset to Standard Array

</template>

<style lang="sass">
  table
    width: 100%
    border-collapse: separate
   
  th
    padding: 0.1rem 0.5rem
    text-align: left
    font-family: var(--dnd5e-font-modesto)
    &.center
      text-align: center
    &.ability
      width: 25%
   
  td
    text-align: left
    &.center
      text-align: center
    &.ability
      width: 25%
 
  .green
    color: green
  .red
    color: red
  .mainscore
    min-width: 40px
  .controls
    .chevron
      position: absolute
      font-size: 0.75rem
      right: 0
      cursor: pointer
      background-color: rgba(0, 0, 0, 0.1)
      &.up
        padding: 1px 3px 0px 3px
        top: 8px
        &:hover
          background-color: rgba(140, 90, 0, 0.2)
      &.down
        padding: 1px 3px 0px 3px
        bottom: 8px
        &:hover
          background-color: rgba(140, 90, 0, 0.2)

</style>
