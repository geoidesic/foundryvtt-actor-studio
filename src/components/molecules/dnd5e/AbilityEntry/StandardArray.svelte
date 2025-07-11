<script>
  import { Timing } from "@typhonjs-fvtt/runtime/util";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import {
    abilities,
    race,
    isStandardArrayValues,
    abilityRolls,
  } from "~/src/stores/index";
  import { MODULE_ID, STANDARD_ARRAY } from "~/src/helpers/constants";
  import { dnd5eModCalc, localize as t } from "~/src/helpers/Utility";

  const doc = getContext("#doc");
  const updateDebounce = Timing.debounce(updateValue, 100);
  const options = { system: { abilities: {} } };

  // Track last reset document to ensure reset runs only once per actor/document
  let lastResetDocName = null;

  async function updateValue(attr, value) {
    // move the value to the next ability according to the direction of the arrow
    const abilities = Object.keys(STANDARD_ARRAY);
    // get index of attr from abilities
    const index = abilities.indexOf(attr);
    switch (value) {
      case -1:
        // move the value to the next ability according to the direction of the arrow
        if (index < abilities.length - 1) {
          const nextAbility = abilities[index + 1];
          const options = {
            system: {
              abilities: {
                [attr]: { value: $doc.system.abilities[nextAbility].value },
                [nextAbility]: { value: $doc.system.abilities[attr].value },
              },
            },
          };
          await $doc.updateSource(options);
          if ($doc.render) {
            $doc.render();
          }
        }
        break;

      default:
        // move the value to the next ability according to the direction of the arrow
        if (index > 0) {
          const nextAbility = abilities[index - 1];
          const options = {
            system: {
              abilities: {
                [attr]: { value: $doc.system.abilities[nextAbility].value },
                [nextAbility]: { value: $doc.system.abilities[attr].value },
              },
            },
          };
          await $doc.updateSource(options);
          if ($doc.render) {
            $doc.render();
          }
        }
        break;
    }
  }

  //- sets the values to the standard array
  async function reset() {
    $abilityRolls = {}; //- reset any existin rolls if that option is enabled
    Object.keys(STANDARD_ARRAY).forEach((key) => {
      options.system.abilities[key] = {
        value: STANDARD_ARRAY[key],
      };
    });

    await $doc.updateSource(options);
    await tick();

    if ($doc.render) {
      $doc.render();
    }
  }

  //- checks if the values match the standard array requirements
  function arraysMatch(array1, array2) {
    if (array1.length !== array2.length) return false;

    const sortedArray1 = array1.slice().sort((a, b) => a - b);
    const sortedArray2 = array2.slice().sort((a, b) => a - b);

    return sortedArray1.every((value, index) => value === sortedArray2[index]);
  }

  $: systemAbilities = game.system.config.abilities;
  $: systemAbilitiesArray = Object.entries(systemAbilities);
  $: abilityAdvancements =
    $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration
      ?.fixed;
  $: actorAbilities = Object.entries($doc.system.abilities);
  $: actorAbilityValues = Object.entries($doc.system.abilities).map(
    (x) => x[1].value,
  );
  $: allTens = actorAbilityValues.reduce((acc, curr) => {
    window.GAS.log.p("curr", curr);
    if (curr == 10) {
      acc = true;
    }
    return acc;
  }, false);

  // Compute if current abilities match the standard array (order-insensitive)
  $: isStandardArrayCurrent = arraysMatch(
    Object.values(STANDARD_ARRAY),
    Object.keys(STANDARD_ARRAY).map((key) => $doc.system.abilities[key]?.value),
  );


  // Update the isStandardArrayValues store for progress tracking
  $: isStandardArrayValues.set(isStandardArrayCurrent);


  $: if (
    $doc?.system?.abilities &&
    $doc?.name &&
    lastResetDocName !== $doc.name &&
    Object.keys(STANDARD_ARRAY).every(key => $doc.system.abilities[key]?.value === 10) &&
    !arraysMatch(
      Object.keys(STANDARD_ARRAY).map(key => $doc.system.abilities[key]?.value),
      Object.values(STANDARD_ARRAY)
    )
  ) {
    window.GAS.log.d('StandardArray: Triggering reset for doc name:', $doc.name);
    lastResetDocName = $doc.name;
    reset();
  }

  onMount(async () => {
    if (allTens) {
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
          th.center Base
          +if("window.GAS.dnd5eRules == '2014'")
            th.center Origin
          th.center Score
          th.center Modifier
      tbody
        +each("systemAbilitiesArray as ability, index")
          tr
            td.ability {ability[1].label}
            td.center.relative
              input.left.small.mainscore(disabled type="number" value="{$doc.system.abilities[ability[0]]?.value}")
              .controls.ml-lg
                .up.chevron
                  +if("index != 0")
                    i.fas.fa-chevron-up(alt="{t('AltText.MoveUp')}" on:click!="{updateDebounce(ability[0], 1)}")
                .down.chevron
                  +if("index != 5")
                    i.fas.fa-chevron-down(alt="{t('AltText.MoveDown')}" on:click!="{updateDebounce(ability[0], -1)}")
            +if("window.GAS.dnd5eRules == '2014'")
              td.center
                +if("abilityAdvancements?.[ability[0]] > 0")
                  span +
                span {abilityAdvancements?.[ability[0]] || 0}
            td.center {(Number(abilityAdvancements?.[ability[0]]) || 0) + Number($doc.system.abilities[ability[0]]?.value || 0)}
            td.center
              +if("dnd5eModCalc(Number($doc.system.abilities[ability[0]]?.value) + (Number(abilityAdvancements?.[ability[0]]) || 0)) > 0")
                span +
              span {dnd5eModCalc(Number($doc.system.abilities[ability[0]]?.value) + (Number(abilityAdvancements?.[ability[0]]) || 0))}
        +if("!isStandardArrayCurrent")
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
    min-width: 33px
    max-width: 33px
  .controls
    .chevron
      position: absolute
      font-size: 0.75rem
      left: 70%
      cursor: pointer
      background-color: rgba(0, 0, 0, 0.1)
      &:hover
        background-color: rgba(140, 90, 0, 0.2)
      &.up
        padding: 1px 3px 0px 3px
        top: 8px
      &.down
        padding: 1px 3px 0px 3px
        bottom: 8px


</style>
