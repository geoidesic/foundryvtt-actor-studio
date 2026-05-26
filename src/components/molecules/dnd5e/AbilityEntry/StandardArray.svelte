<script>
  import { Timing } from "@typhonjs-fvtt/runtime/util";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import {
    abilities,
    isStandardArrayValues,
    abilityRolls,
  } from "~/src/stores/index";
  import { MODULE_ID } from "~/src/helpers/constants";
  import {
    dnd5eModCalc,
    localize as t,
    safeGetSetting,
  } from "~/src/helpers/Utility";

  const doc = getContext("#doc");
  const updateDebounce = Timing.debounce(updateValue, 100);
  const options = { system: { abilities: {} } };

  // Track last reset document to ensure reset runs only once per actor/document
  let lastResetDocName = null;

  const settingValue = safeGetSetting(
    MODULE_ID,
    "standardArray",
    "15, 14, 13, 12, 10, 8",
  );
  const settingArray = settingValue
    .split(",")
    .map((v) => parseInt(v.trim()))
    .filter((v) => !isNaN(v));
  const abilityKeys = ["str", "dex", "con", "int", "wis", "cha"];

  const customStandardArray = abilityKeys.reduce((acc, key, index) => {
    acc[key] = settingArray[index] ?? 10;
    return acc;
  }, {});

  async function updateValue(attr, value) {
    // move the value to the next ability according to the direction of the arrow
    const abilities = Object.keys(customStandardArray);
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
    Object.keys(customStandardArray).forEach((key) => {
      options.system.abilities[key] = {
        value: customStandardArray[key],
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
  $: actorAbilities = Object.entries($doc.system.abilities);
  $: actorAbilityValues = Object.entries($doc.system.abilities).map(
    (x) => x[1].value,
  );
  $: allTens = actorAbilityValues.reduce((acc, curr) => {
    // window.GAS.log.p("curr", curr);
    if (curr == 10) {
      acc = true;
    }
    return acc;
  }, false);

  // Compute if current abilities match the standard array (order-insensitive)
  $: isStandardArrayCurrent = arraysMatch(
    Object.values(customStandardArray),
    Object.keys(customStandardArray).map(
      (key) => $doc.system.abilities[key]?.value,
    ),
  );

  // Update the isStandardArrayValues store for progress tracking
  $: isStandardArrayValues.set(isStandardArrayCurrent);

  $: if (
    $doc?.system?.abilities &&
    $doc?.name &&
    lastResetDocName !== $doc.name &&
    Object.keys(customStandardArray).every(
      (key) => $doc.system.abilities[key]?.value === 10,
    ) &&
    !arraysMatch(
      Object.keys(customStandardArray).map(
        (key) => $doc.system.abilities[key]?.value,
      ),
      Object.values(customStandardArray),
    )
  ) {
    // window.GAS.log.d('StandardArray: Triggering reset for doc name:', $doc.name);
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
          th.center Modifier
      tbody
        +each("systemAbilitiesArray as ability, index")
          tr
            td.ability {ability[1].label}
            td.center.score-cell
              input.left.small.mainscore(disabled type="number" value="{$doc.system.abilities[ability[0]]?.value}")
              .controls
                .up.chevron
                  +if("index != 0")
                    i.fas.fa-chevron-up(alt="{t('AltText.MoveUp')}" on:click!="{updateDebounce(ability[0], 1)}")
                .down.chevron
                  +if("index != 5")
                    i.fas.fa-chevron-down(alt="{t('AltText.MoveDown')}" on:click!="{updateDebounce(ability[0], -1)}")
            td.center
              +if("dnd5eModCalc(Number($doc.system.abilities[ability[0]]?.value)) > 0")
                span +
              span {dnd5eModCalc(Number($doc.system.abilities[ability[0]]?.value))}
        +if("!isStandardArrayCurrent")
          tr
            td(colspan="3")
              hr
              button.btn.btn-primary(on:click="{reset}") Reset to Standard Array
</template>

<style lang="sass">
  @import './ability-entry-controls.sass'

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

</style>
