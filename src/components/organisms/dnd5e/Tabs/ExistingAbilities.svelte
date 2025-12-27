<script>
  import SvelteSelect from "svelte-select";
  import {
    extractMapIteratorObjectProperties,
    getPackFolders,
    getRules
  } from "~/src/helpers/Utility";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import Tabs from "~/src/components/molecules/Tabs.svelte";
  import ManualEntry from "~/src/components/molecules/dnd5e/AbilityEntry/ManualEntry.svelte";
  import PointBuy from "~/src/components/molecules/dnd5e/AbilityEntry/PointBuy.svelte";
  import Roll from "~/src/components/molecules/dnd5e/AbilityEntry/Roll.svelte";
  import StandardArray from "~/src/components/molecules/dnd5e/AbilityEntry/StandardArray.svelte";
  import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
  import { localize as t, safeGetSetting } from "~/src/helpers/Utility";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { abilityGenerationMethod } from "~/src/stores/index";

  const actor = getContext("#doc");
  const ruleConfig = {
    journalId: "0AGfrwZRzSG0vNKb",
    pageId: "yuSwUFIjK31Mr3DI",
  };
  const importAdvancements = async () => {
    // window.GAS.log.d('options',options)
    for (const option of options) {
      try {
        const module = await import(`~/src/components/molecules/dnd5e/AbilityEntry/${option.type}.svelte`);
        advancementComponents[option.type] = module.default;
      } catch (error) {
        log.e(`Failed to load component for ${option.type}:`, error);
      }
    }
  };

  const selectHandler = async (option) => {
    active = option.value;
    $abilityGenerationMethod = option.value;
    importAdvancements();
  };
  

  let rules = "", active, value, placeHolder = 'Ability Generation Method'

  $: actorObject = $actor.toObject();
  $: advancementComponents = {};
  $: richHTML = rules?.content || "";
  $: options = [
    {
      value: 1,
      label: t('Tabs.Abilities.ManualEntry'),
      type: "ManualEntry",
      setting: safeGetSetting(MODULE_ID, "allowManualInput", true),
    },
    {
      value: 2,
      label: t('Tabs.Abilities.PointBuy'),
      type: "PointBuy",
      setting: safeGetSetting(MODULE_ID, "allowPointBuy", '4d6kh3'),
    },
    {
      value: 3,
      label: t('Tabs.Abilities.Roll'),
      type: "Roll",
      setting: safeGetSetting(MODULE_ID, "allowRolling", false),
    },
    {
      value: 4,
      label: t('Tabs.Abilities.StandardArray'),
      type: "StandardArray",
      setting: safeGetSetting(MODULE_ID, "allowStandardArray", false),
    },
  ].filter((obj) => obj.setting);

  $: if (options.length === 1) {
    // value = options[0];
    $abilityGenerationMethod = options[0].value;
  }

  $: abilityModule = $abilityGenerationMethod ? advancementComponents[options.find(option => option.value === $abilityGenerationMethod).type] : null;

  onMount(async () => {
    rules = await getRules(ruleConfig);
    await tick();
    await importAdvancements();
  });

</script>

<template lang="pug">
  div.content
    .flexrow
      .flex2.pr-sm.col-a
        h3.left {t('Tabs.Abilities.HowCalculated')}
        +if("options.length > 1")
          IconSelect.icon-select({options} {active} {placeHolder} handler="{selectHandler}" id="ability-generation-method-select" bind:value="{$abilityGenerationMethod}" )
          +else()
            ol.properties-list
              +each("options as option")
                li {option.label}
        +if("$abilityGenerationMethod")
          svelte:component(this="{abilityModule}")
      .flex0.border-right.right-border-gradient-mask 
      .flex3.left.pl-md.scroll.col-b {@html richHTML}
</template>

<style lang="sass" scoped>
@import "../../../../../styles/Mixins.sass"
.content 
  @include staticOptions

  :global(.icon-select)
    position: relative
</style>
