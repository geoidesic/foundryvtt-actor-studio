<script>
  import SvelteSelect from "svelte-select";
  import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import {
    getFoldersFromMultiplePacks,
    extractItemsFromPacksSync,
    getPacksFromSettings,
    getAdvancementValue,
    illuminatedDescription
  } from "~/src/helpers/Utility.js";
  import { safeGetSetting } from '~/src/helpers/Utility';
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { localize as t } from "~/src/helpers/Utility";
  import { race, subRace, tabDisabled } from "~/src/stores/index";
  import { MODULE_ID } from "~/src/helpers/constants";

  const isDisabled = getContext('isDisabled') || false;

  let active = null,
    value = null,
    placeHolder = t('Tabs.Races.Placeholder'),
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
  const showPackLabelInSelect = safeGetSetting(MODULE_ID, 'showPackLabelInSelect', true);
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
  // $: window.GAS.log.d("Race component:", { 
  //   race: $race, 
  //   active, 
  //   value, 
  //   readOnlyTabs: $readOnlyTabs,
  //   richHTML: richHTML ? richHTML.substring(0, 50) + "..." : "", // truncate for logging
  //   advancementArray: advancementArray?.length || 0
  // });

  onMount(async () => {
    // Log mount
    // window.GAS.log.d("Race tab mounted");
    
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
StandardTabLayout(title="{t('Tabs.Races.Title')}" showTitle="{true}" tabName="race")
  div(slot="left")
    .flexrow
      .flex0.required(class="{$race ? '' : 'active'}") *
      .flex3 
        IconSelect.mb-md.icon-select({options} {active} {placeHolder} groupBy="{['sourceBook','packLabel']}" handler="{selectRaceHandler}" id="race-select" bind:value)
    +if("value")
      +if("source")
        //- h3.left {t('Source')}
        ol.properties-list
          li {book} {page} {type.value ? ', ' + type.value : ''} 

      +if("filteredMovement")
        h2.left {t('Tabs.Races.Movement')}
        ol.properties-list
          +each("filteredMovement as movement")
            li.left {movement.label} : {movement.value} {units}
      +if("filteredSenses.length")
        h2.left {t('Tabs.Races.Senses')}
        ol.properties-list
          +each("filteredSenses as senses")
            li.left {senses.label} : {senses.value} {units}
      +if("advancementArray")
        h2.left {t('Advancements')}
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
  
  div(slot="right") {@html richHTML}
</template>

<style lang="sass">
  :global(.icon-select)
    position: relative
</style>
