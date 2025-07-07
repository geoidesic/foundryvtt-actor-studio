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
  import { localize } from "@typhonjs-fvtt/runtime/util/i18n";
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
  const importPath = "components/molecules/dnd5e/Advancements/";

  // window.GAS.log.d('allRaceItems', allRaceItems)
  let raceDefinitions = allRaceItems
    .filter((x) => x.type == "race")
    .sort((a, b) => a.label.localeCompare(showPackLabelInSelect ? b.compoundLabel : b.label));

  const actor = getContext("#doc");
  let advancementComponents = {};

  async function importAdvancements(advancements) {
    if (!advancements || !Array.isArray(advancements)) return;
    
    // window.GAS.log.d('advancementArray',advancements)
    for (const advancement of advancements) {
      try {
        const module = await import(`~/src/components/molecules/dnd5e/Advancements/${advancement.type}.svelte`);
        advancementComponents[advancement.type] = module.default;
      } catch (error) {
        window.GAS.log.e(`Failed to load component for ${advancement.type}:`, error);
      }
    }
  };

  async function selectRaceHandler(option) {
    if (isDisabled) return; // Don't allow changes in readonly mode
    
    const selectedRace = await fromUuid(option);
    $race = selectedRace;
    active = option;
    if(!value) {
      value = option;
    }
    
    const advancements = getAdvancements($race);
    await importAdvancements(advancements);
    richHTML = await illuminatedDescription(html, $race);

    Hooks.call('gas.richhtmlReady', richHTML);
  };

  // Get the advancement array safely
  function getAdvancements(race) {
    if (!race || !race.system || !race.system.advancement) return [];
    
    return race.system.advancement.filter(
      (value) => !(value.type == "Trait" && value.title == "Dwarven Resilience")
    );
  }

  // Function to update richHTML based on current race
  async function updateRichHTML() {
    if ($race) {
      const advancements = getAdvancements($race);
      await importAdvancements(advancements);
      richHTML = await illuminatedDescription($race.system?.description?.value || "", $race);
    }
  }

  $: actorObject = $actor.toObject();
  $: options = raceDefinitions;
  $: html = $race?.system?.description?.value || "";
  $: movement = $race?.system?.movement;
  $: senses = $race?.system?.senses;
  $: units = $race?.system?.movement?.units || "";
  $: type = $race?.system?.type || "";
  $: source = $race?.system?.source || "";
  $: book = source?.book || "";
  $: page = source?.page ? ", p. " + source.page : "";
  $: isDisabled = $readOnlyTabs.includes("race");
  
  // Calculate advancements
  $: advancementArray = getAdvancements($race);
  
  // Make sure to update active/value when race changes to ensure display in readonly mode
  $: if ($race && (!active || !value)) {
    active = $race.uuid;
    value = $race.uuid;
    updateRichHTML();
  }

  // Also update richHTML when html changes (dependency of illuminatedDescription)
  $: if ($race && html) {
    updateRichHTML();
  }

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

  // Debug logs
  $: window.GAS.log.d("Race component:", { 
    isDisabled, 
    race: $race, 
    active, 
    value, 
    readOnlyTabs: $readOnlyTabs,
    richHTML: richHTML ? richHTML.substring(0, 50) + "..." : "", // truncate for logging
    advancementArray: advancementArray?.length || 0
  });

  onMount(async () => {
    // Log mount
    window.GAS.log.d("Race tab mounted");
    
    let raceUuid;
    if (window.GAS.debug) {
      raceUuid = window.GAS.race;
    }
    if (raceUuid) {
      await selectRaceHandler(raceUuid);
    }
    
    // If we have a race in the store but no active selection, set the active selection
    if ($race && (!active || !value)) {
      window.GAS.log.d("Setting active/value from $race:", $race);
      active = $race.uuid;
      value = $race.uuid;
      await updateRichHTML();
    }
  });

</script>

<template lang="pug">
div.content
  .flexrow
    .flex2.pr-sm.col-a
      .flexrow
        .flex0.required(class="{$race ? '' : 'active'}") *
        .flex3 
          IconSelect.mb-md.icon-select({options} {active} {placeHolder} handler="{selectRaceHandler}" id="race-select" bind:value disabled="{isDisabled}")
          +if("isDisabled")
            .info-message This tab is read-only during advancement selection
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
  @use "../../../../../styles/Mixins.scss" as mixins
  .content 
    +mixins.staticOptions

    .col-a
      // max-width: 325px

  :global(.icon-select)
    position: relative

  .info-message
    font-size: 0.8rem
    color: #666
    font-style: italic
    margin-top: -0.5rem
    margin-bottom: 0.5rem
</style>
