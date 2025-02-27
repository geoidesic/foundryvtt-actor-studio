<script>
  import { log } from "~/src/helpers/Utility";
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

  export let document = false;

  const dispatch = createEventDispatcher();
  const doc = document || getContext("#doc");
  const updateDebounce = Timing.debounce(updateValue, 100);

  async function updateValue(attr, value) {
    // move the value to the next ability according to the direction of the arrow
    const abilities = Object.keys(STANDARD_ARRAY);
    // get index of attr from abilities
    const index = abilities.indexOf(attr);
    // game.system.log.d('abilities', abilities)
    // game.system.log.d('index', index)
    // game.system.log.d('value', value)
    // game.system.log.d('attr', attr)
    
    switch (value) {
      case -1:
        // move the value to the next ability according to the direction of the arrow
        if (index < abilities.length - 1) {
          const nextAbility = abilities[index + 1];
          // game.system.log.d('nextAbility', nextAbility)
          const options = {
            system: {
              abilities: {
                [attr]: { value: $doc.system.abilities[nextAbility].value },
                [nextAbility]: { value: $doc.system.abilities[attr].value },
              },
            },
          };
          // game.system.log.d('options', options)
          await $doc.updateSource(options);
          $doc = $doc;
        }
        break;

      default:
        // move the value to the next ability according to the direction of the arrow
        if (index > 0) {
          const nextAbility = abilities[index - 1];
          // game.system.log.d('nextAbility', nextAbility)
          const options = {
            system: {
              abilities: {
                [attr]: { value: $doc.system.abilities[nextAbility].value },
                [nextAbility]: { value: $doc.system.abilities[attr].value },
              },
            },
          };
          // game.system.log.d('options', options)
          await $doc.updateSource(options);
          $doc = $doc;
        }
        break;
    }

    // game.system.log.d(abilities)
    // const options = {system: {abilities: { [attr]: {value: Number(event.target.value)}}}};
    // $doc.updateSource(options)
    // $doc = $doc
  }

  function reset() {
    $abilityRolls = {};

    const options = { system: { abilities: {} } };
    systemAbilitiesArray.forEach((ability) => {
      options.system.abilities[ability[1].abbreviation] = {
        value: STANDARD_ARRAY[ability[1].abbreviation],
      };
    });
    $doc.updateSource(options);
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
  //     (ability) => $doc.system.abilities[ability[1].abbreviation].value,
  //   ),
  // );
  $: $isStandardArrayValues = arraysMatch(
    Object.values(STANDARD_ARRAY),
    systemAbilitiesArray.map(
      (ability) => $doc.system.abilities[ability[1].abbreviation]?.value,
    ),
  );
  // $: {
  //   const currentAbilities = systemAbilitiesArray.map(
  //     (ability) => {
  //       game.system.log.d(ability) 
  //       return $doc.system.abilities[ability[1].abbreviation].value
  //     }
  //   );
  //   const match = arraysMatch(STANDARD_ARRAY, currentAbilities);
  //   isStandardArrayValues.set(match);
  // }
  onMount(async () => {
    // game.system.log.d($doc.system.abilities)
    // game.system.log.d(Object.keys($doc.system.abilities))
    // game.system.log.d(isStandardArrayValues)
    // if all the abilities are 10, set them to the standard array
    if (
      systemAbilitiesArray.every(
        (ability) =>
          $doc.system.abilities[ability[1].abbreviation]?.value === 10,
      )
    ) {
      reset();
    }
  });
</script>

<template lang="pug">
.attribute-entry.mt-sm
  h5.flexrow.mb-sm
    .flex2.left Ability
    .flex1.center Race / Feat
    .flex1.center Base Score
    .flex1.center Score
    .flex1.center Modifier
  .indent
    +each("systemAbilitiesArray as ability, index")
      .flexrow.mb-sm
        .flex2.left {ability[1].label}
        .flex1.center.align-text-with-input
          +if("abilityAdvancements?.[ability[1].abbreviation] > 0")
            span +
          span {abilityAdvancements?.[ability[1].abbreviation] || 0}
        .flex1.center.relative
          input.left.small.mainscore(disabled type="number" value="{$doc.system.abilities[ability[1].abbreviation]?.value}")
          .controls
            .up.chevron
              +if("index != 0")
                i.fas.fa-chevron-up(alt="Decrease" on:click!="{updateDebounce(ability[1].abbreviation, 1)}")
            .down.chevron
              +if("index != 5")
                i.fas.fa-chevron-down(alt="Increase" on:click!="{updateDebounce(ability[1].abbreviation, -1)}")
        .flex1.center.align-text-with-input {(Number(abilityAdvancements?.[ability[1].abbreviation]) || 0) + Number($doc.system.abilities[ability[1].abbreviation]?.value || 0)}
        .flex1.center.align-text-with-input 
          +if("$doc.system.abilities[ability[1].abbreviation]?.mod > 0")
            span +
          span {$doc.system.abilities[ability[1].abbreviation]?.mod}
    +if("!$isStandardArrayValues")
      hr
      button.btn.btn-primary(on:click="{reset}") Reset to Standard Array

</template>

<style lang="sass">
  .align-text-with-input
    margin-top: 0.3rem
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
        top: 0
        &:hover
          background-color: rgba(140, 90, 0, 0.2)
      &.down
        padding: 1px 3px 0px 3px
        bottom: 0
        &:hover
          background-color: rgba(140, 90, 0, 0.2)

</style>
