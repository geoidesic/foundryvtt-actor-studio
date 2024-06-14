<script>
  import SvelteSelect from "svelte-select";
  import {
    extractMapIteratorObjectProperties,
    getPackFolders,
    addItemToCharacter,
    log,
    getRules,
    importComponent
  } from "~/src/helpers/Utility";
  import { getContext, onDestroy, onMount } from "svelte";
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import ManualEntry from "~/src/components/molecules/dnd5e/AbilityEntry/ManualEntry.svelte";
  import PointBuy from "~/src/components/molecules/dnd5e/AbilityEntry/PointBuy.svelte";
  import Roll from "~/src/components/molecules/dnd5e/AbilityEntry/Roll.svelte";
  import StandardArray from "~/src/components/molecules/dnd5e/AbilityEntry/StandardArray.svelte";
  import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
  import { localize } from "#runtime/svelte/helper";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { abilityGenerationMethod } from "~/src/helpers/store";

  const actor = getContext("#doc");
  const ruleConfig = {
    journalId: "0AGfrwZRzSG0vNKb",
    pageId: "yuSwUFIjK31Mr3DI",
  };
  const importPath = "components/molecules/dnd5e/AbilityEntry/";

  const selectHandler = async (option) => {
    active = option.value;
    $abilityGenerationMethod = option.value;
  };

  let rules = "", active, value, placeHolder = 'Ability Generation Method'

  $: actorObject = $actor.toObject();
  $: richHTML = rules?.content || "";
  $: options = [
    {
      value: 1,
      label: "Manual Entry",
      type: "ManualEntry",
      setting: game.settings.get(MODULE_ID, "allowManualInput"),
    },
    {
      value: 2,
      label: "Point Buy",
      type: "PointBuy",
      setting: game.settings.get(MODULE_ID, "allowPointBuy"),
    },
    {
      value: 3,
      label: "Roll",
      type: "Roll",
      setting: game.settings.get(MODULE_ID, "allowRolling"),
    },
    {
      value: 4,
      label: "Standard Array",
      type: "StandardArray",
      setting: game.settings.get(MODULE_ID, "allowStandardArray"),
    },
  ].filter((obj) => obj.setting);

  $: if (options.length === 1) {
    // value = options[0];
    $abilityGenerationMethod = options[0].value;
  }

  onMount(async () => {
    rules = await getRules(ruleConfig);
    
  });

</script>

<template lang="pug">
  div.content
    .flexrow
      .flex2.pr-sm.col-a
        h3.left {localize('GAS.Tabs.Abilities.HowCalculated')}
        +if("options.length > 1")
          IconSelect.icon-select({options} {active} {placeHolder} handler="{selectHandler}" id="ability-generation-method-select" bind:value="{$abilityGenerationMethod}" )
          +else()
            ol.properties-list
              +each("options as option")
                li {option.label}
        +if("$abilityGenerationMethod")
          +await("importComponent(importPath, options.find(x => x.value == $abilityGenerationMethod).type)")
            +then("Component")
              svelte:component(this="{Component}")
      .flex0.border-right.right-border-gradient-mask 
      .flex3.left.pl-md.scroll.col-b {@html richHTML}
</template>

<style lang="sass" scoped>
@import "../../../../../styles/Mixins.scss"
.content 
  @include staticOptions

  :global(.icon-select)
    position: relative
</style>
