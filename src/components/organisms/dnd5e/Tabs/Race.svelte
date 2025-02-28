<script>
  import SvelteSelect from "svelte-select";
  import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
  import {
    getFoldersFromMultiplePacks,
    extractItemsFromPacksSync,
    getPacksFromSettings,
    getAdvancementValue,
    illuminatedDescription
  } from "~/src/helpers/Utility.js";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { localize } from "#runtime/svelte/helper";
  import { race, subRace, readOnlyTabs } from "~/src/stores/index";
  import { MODULE_ID } from "~/src/helpers/constants";

  let active = null,
    value = null,
    placeHolder = "Races",
    richHTML = "";
  let packs = getPacksFromSettings("races");
  let allRaceItems = extractItemsFromPacksSync(packs, [
    "name->label",
    "img",
    "type",
    "folder",
    "uuid->value",
    "_id",
  ]);
  const showPackLabelInSelect = game.settings.get(MODULE_ID, 'showPackLabelInSelect');

  // window.GAS.log.d('allRaceItems', allRaceItems)
  let raceDefinitions = allRaceItems
    .filter((x) => x.type == "race")
    .sort((a, b) => a.label.localeCompare(showPackLabelInSelect ? b.compoundLabel : b.label));

  const actor = getContext("#doc");

  const importAdvancements = async () => {
    // window.GAS.log.d('advancementArray',advancementArray)
    for (const advancement of advancementArray) {
      try {
        const module = await import(`~/src/components/molecules/dnd5e/Advancements/${advancement.type}.svelte`);
        advancementComponents[advancement.type] = module.default;
      } catch (error) {
        log.e(`Failed to load component for ${advancement.type}:`, error);
      }
    }
  };

  const selectHandler = async (option) => {
    window.GAS.log.d('RACE TAB | Selection Change:', {
      previousValue: value,
      newValue: option,
      currentRace: $race,
      active
    });

    const selectedRace = await fromUuid(option);
    $race = selectedRace;
    active = option;
    await tick();
    
    window.GAS.log.d('RACE TAB | After Update:', {
      value,
      active,
      race: $race
    });
    await importAdvancements();
    richHTML = await illuminatedDescription(html, $race);
  };

  const importPath = "components/molecules/dnd5e/Advancements/";

  $: actorObject = $actor.toObject();
  $: options = raceDefinitions;
  $: html = $race?.system?.description?.value || "";
  $: movement = $race?.system?.movement;
  $: senses = $race?.system?.senses;
  $: advancementComponents = {};

  $: filteredMovement = movement
    ? Object.keys(movement)
        .filter((key) => key !== "units" && movement[key])
        .map((key) => ({ label: key, value: movement[key] }))
    : [];

  $: filteredSenses = senses
    ? Object.keys(senses)
        .filter((key) => key !== "units" && senses[key])
        .map((key) => ({ label: key, value: senses[key] }))
    : [];

  $: units = $race?.system?.movement?.units || "";
  $: type = $race?.system?.type || "";
  $: source = $race?.system?.source || "";
  $: book = source?.book || "";
  $: page = source?.page ? ", p. " + source.page : "";
  $: advancementArray = $race?.system?.advancement
    ? $race.system.advancement
        .filter(
          (value) =>
            !(value.type == "Trait" && value.title == "Dwarven Resilience"),
        )
    : [];

  $: window.GAS.log.d(advancementArray)

  $: isDisabled = $readOnlyTabs.includes("race");



  onMount(async () => {
    if ($race) {
      value = $race.uuid;
    }
    await tick();
    await importAdvancements();
    richHTML = await illuminatedDescription(html, $race);
  });

</script>

<template lang="pug">
div.content
  .flexrow
    .flex2.pr-sm.col-a
      .flexrow
        .flex0.required(class="{$race ? '' : 'active'}") *
        .flex3 
          IconSelect.mb-md.icon-select({options} {active} {placeHolder} handler="{selectHandler}" id="race-select" bind:value disabled="{isDisabled}")
      +if("value")
        +if("source")
          //- h3.left {localize('GAS.Source')}
          ol.properties-list
            li {book} {page} {type.value ? ', ' + type.value : ''} 

        +if("filteredMovement")
          h3.left {localize('GAS.Tabs.Races.Movement')}
          ol.properties-list
            +each("filteredMovement as movement")
              li.left {movement.label} : {movement.value} {units}
        +if("filteredSenses")
          h3.left {localize('GAS.Tabs.Races.Senses')}
          ol.properties-list
            +each("filteredSenses as senses")
              li.left {senses.label} : {senses.value} {units}
        +if("advancementArray")
          h3.left {localize('GAS.Advancements')}
          ul.icon-list
            +each("advancementArray as advancement")
              //- @todo: this should be broken out into components for each advancement.type
              li.left
                .flexrow(data-tooltip="{getAdvancementValue(advancement, 'hint')}" data-tooltip-class="gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip")
                  .flex0.relative.image
                    img.icon(src="{advancement.icon}" alt="{advancement.title}")
                  .flex2 {advancement.title}
                .flexrow
                  svelte:component(this="{advancementComponents[advancement.type]}" advancement="{advancement}")
                    
                  
                
    .flex0.border-right.right-border-gradient-mask 
    .flex3.left.pl-md.scroll.col-b {@html richHTML}

</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .content 
    @include staticOptions

  :global(.icon-select)
    position: relative



</style>
