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
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import { localize as t } from "~/src/helpers/Utility";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { abilityGenerationMethod, abilityRolls, readOnlyTabs } from "~/src/stores/index";

  const actor = getContext("#doc");
  const ruleConfig = {
    journalId: "0AGfrwZRzSG0vNKb",
    pageId: "yuSwUFIjK31Mr3DI",
  };

  $: isDisabled = $readOnlyTabs.includes("abilities");

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
    active = option.value ?? option ?? null;
    await importAdvancements();
    tick();
    $abilityGenerationMethod = active;
    // window.GAS.log.d('option', option)
    // window.GAS.log.d('active', active)
    // window.GAS.log.d('abilityGenerationMethod', $abilityGenerationMethod)
  };
  

  let rules = "", active, value, placeHolder = t('Tabs.Abilities.AbilityGenerationMethod')

  $: actorObject = $actor.toObject();
  $: advancementComponents = {};
  $: richHTML = rules?.content || "";
  $: options = [
    {
      value: 1,
      label: t('Tabs.Abilities.ManualEntry'),
      type: "ManualEntry",
      setting: game.settings.get(MODULE_ID, "allowManualInput"),
    },
    {
      value: 2,
      label: t('Tabs.Abilities.PointBuy'),
      type: "PointBuy",
      setting: game.settings.get(MODULE_ID, "allowPointBuy"),
    },
    {
      value: 3,
      label: t('Tabs.Abilities.Roll'),
      type: "Roll",
      setting: game.settings.get(MODULE_ID, "allowRolling"),
    },
    {
      value: 4,
      label: t('Tabs.Abilities.StandardArray'),
      type: "StandardArray",
      setting: game.settings.get(MODULE_ID, "allowStandardArray"),
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
StandardTabLayout(
  title="{t('Tabs.Abilities.Title')}"
  showTitle="{true}"
  tabName="abilities"
)
  div(slot="left")
    h2.left {t('Tabs.Abilities.HowCalculated')}
    +if("options.length > 1")
      IconSelect.icon-select({options} {active} {placeHolder} handler="{selectHandler}" id="ability-generation-method-select" bind:value="{$abilityGenerationMethod}" disabled="{isDisabled}")
      +else()
        ol.properties-list
          +each("options as option")
            li {option.label}
    +if("$abilityGenerationMethod")
      .relative
        svelte:component(this="{abilityModule}")
        +if("isDisabled")
          .overlay
  div(slot="right") {@html richHTML}
</template>

<style lang="sass" scoped>
:global(.icon-select)
  position: relative

.relative
  position: relative

.overlay
  position: absolute
  top: 0
  left: 0
  right: 0
  bottom: 0
  background-color: rgba(200, 200, 200, 0.3)
  pointer-events: all
  cursor: not-allowed
  z-index: 100
  transition: background-color 0.2s ease
  &:hover
    background-color: rgba(200, 200, 200, 0.4)
</style>
