<script>
  import SvelteSelect from "svelte-select";
  import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import {
    extractMapIteratorObjectProperties,
    extractItemsFromPacksSync,
    extractItemsFromPacksAsync,
    getPacksFromSettings,
    getAdvancementValue,
    getSubclassLevel,
    illuminatedDescription,
  } from "~/src/helpers/Utility.js";


  import { getContext, onDestroy, onMount, tick } from "svelte";
  import {
    characterClass,
    characterSubClass,
    level,
    subClassesForClass,
    readOnlyTabs,
  } from "~/src/stores/index";
  import { localize as t} from "~/src/helpers/Utility";
  import { TJSSelect } from "@typhonjs-fvtt/standard/component/form";
  import { MODULE_ID } from "~/src/helpers/constants";
  import DonationTracker from "~/src/plugins/donation-tracker";
  import StartingEquipment from "~/src/components/molecules/dnd5e/StartingEquipment.svelte";
  import StartingGold from "~/src/components/molecules/dnd5e/StartingGold.svelte";
  import { clearEquipmentSelections } from "~/src/stores/equipmentSelections";
  import { goldRoll } from "~/src/stores/storeDefinitions";

  let richHTML = "",
    html = "",
    richSubClassHTML = "",
    selectedCharacterClass = null,
    activeSubClass = null,
    classValue = null,
    subclassValue = null,
    subClassesIndex,
    subclasses,
    classesPlaceholder = t('Tabs.Classes.Placeholder'),
    subclassesPlaceholder = t('Tabs.Classes.SubclassPlaceholder'),
    packs = getPacksFromSettings("classes"),
    subClassesPacks = getPacksFromSettings("subclasses"),
    classAdvancementArrayFiltered = [],
    classAdvancementExpanded = false,
    equipmentSelectionExpanded = false,
    subClassAdvancementArrayFiltered = [],
    subClassAdvancementExpanded = false,
    mappedClassIndex = extractItemsFromPacksSync(packs, [
      "name->label",
      "img",
      "type",
      "folder",
      "uuid->value",
      "_id",
    ]),
    filteredClassIndex;

  const showPackLabelInSelect = game.settings.get(
    MODULE_ID,
    "showPackLabelInSelect",
  );

  filteredClassIndex = mappedClassIndex
    .filter((i) => {
      return i.type == "class";
    })
    .sort((a, b) =>
      a.label.localeCompare(showPackLabelInSelect ? b.compoundLabel : b.label),
    );

  // window.GAS.log.d('packs', packs);
  // window.GAS.log.d('mappedClassIndex', mappedClassIndex);
  // window.GAS.log.d('subClassesPacks', subClassesPacks);

  const levelOptions = [];
  for (let i = 1; i <= 20; i++) {
    levelOptions.push({ label: t('Tabs.Classes.Level') + " " + i, value: i });
  }

  const selectStyles = {
    // width: '50%',
    // display: 'inline-block',
    // fontSize: 'smaller',
  };

  const actor = getContext("#doc");

  const levelSelectHandler = async (option) => {
    subClassesIndex = await getFilteredSubclassIndex();
    await tick();
    importClassAdvancements();
    importSubClassAdvancements();
  };

  const getFilteredSubclassIndex = async () => {
    let filteredSubClassIndex = [];
    
    let mappedSubClassIndex = await extractItemsFromPacksAsync(
      subClassesPacks,
      ["name->label", "img", "type", "folder", "uuid->value", "_id"],
      ["system.classIdentifier"],
    );

    mappedSubClassIndex = mappedSubClassIndex.filter((x) => {
      return x.system?.classIdentifier == $characterClass?.system?.identifier;
    });

    const output = mappedSubClassIndex
      .flat()
      .sort((a, b) =>
        a.label.localeCompare(
          showPackLabelInSelect ? b.compoundLabel : b.label,
        ),
      );
    return output;
  };

  const handleSelectClass = async (option) => {
    activeSubClass = null;
    $characterSubClass = null;
    subclassValue = null;
    subClassAdvancementArrayFiltered = [];
    richSubClassHTML = "";

    // Reset gold roll when changing class
    goldRoll.set(0);

    const selectedClass = await fromUuid(option);
    window.GAS.log.d('handleSelectClass', selectedClass);




    $characterClass = selectedClass;
    selectedCharacterClass = option;
    if(!classValue) {
      classValue = option;
    }

    clearEquipmentSelections();

    await tick();
    subClassesIndex = await getFilteredSubclassIndex();
    $subClassesForClass = subClassesIndex;
    // window.GAS.log.d('subClassesForClass', $subClassesForClass);

    await tick();
    await importClassAdvancements();
    richHTML = await illuminatedDescription(html, $characterClass);

    Hooks.call('gas.richhtmlReady', richHTML);
  };

  const importClassAdvancements = async () => {
    // Reset the components object first
    classAdvancementComponents = {};

    for (const classAdvancement of classAdvancementArrayFiltered) {
      try {
        const module = await import(
          `~/src/components/molecules/dnd5e/Advancements/${classAdvancement.type}.svelte`
        );
        classAdvancementComponents[classAdvancement.type] = module.default;
        await tick();
      } catch (error) {
        window.GAS.log.e(
          `Failed to load component for ${classAdvancement.type}:`,
          error,
        );
      }
    }
  };

  const handleSelectSubClass = async (option) => {
    const selectedSubClass = await fromUuid(option);
    $characterSubClass = selectedSubClass;
    activeSubClass = option;
    if(!subclassValue) {
      subclassValue = option;
    }
    await tick();
    importClassAdvancements();
    importSubClassAdvancements();
    richSubClassHTML = await illuminatedDescription(
      $characterSubClass.system.description.value,
      $characterSubClass,
    );
  };

  const importSubClassAdvancements = async () => {
    for (const subClassAdvancement of subClassAdvancementArrayFiltered) {
      try {
        const module = await import(
          `~/src/components/molecules/dnd5e/Advancements/${subClassAdvancement.type}.svelte`
        );
        await tick();
        subClassAdvancementComponents[subClassAdvancement.type] =
          module.default;
      } catch (error) {
        window.GAS.log.e(
          `Failed to load component for ${subClassAdvancement.type}:`,
          error,
        );
      }
    }
  };

  const toggleClassAdvancements = () => {
    classAdvancementExpanded = !classAdvancementExpanded;
  };
  const toggleEquipmentSelection = () => {
    equipmentSelectionExpanded = !equipmentSelectionExpanded;
  };

  const toggleSubClassAdvancements = () => {
    subClassAdvancementExpanded = !subClassAdvancementExpanded;
  };

  // $: window.GAS.log.d('subclasses', subclasses);

  $: html = $characterClass?.system?.description.value || "";
  $: subClassProp = activeSubClass;
  $: classProp = selectedCharacterClass;
  $: classAdvancementComponents = {};
  $: subClassAdvancementComponents = {};
  $: subClassLevel = $characterClass
    ? getSubclassLevel($characterClass, MODULE_ID)
    : false;
  $: classGetsSubclassThisLevel = subClassLevel && subClassLevel === $level;
  // isDisabled now handled by StandardTabLayout

  $: combinedHtml = $characterClass
    ? `
      ${richHTML}
      ${richSubClassHTML ? `<h1>${t("SubClass")}</h1>${richSubClassHTML}` : ""}
  `
    : "";

  $: if (subClassesIndex?.length) {
    subclasses = subClassesIndex
      .flat()
      .sort((a, b) => a.label.localeCompare(b.label));
  } else {
    subclasses = [];
  }

  $: if ($readOnlyTabs.includes("class")) {
    classAdvancementExpanded = true;
  }

  $: if ($characterSubClass?.system?.advancement.length) {
    subClassAdvancementArrayFiltered =
      $characterSubClass.system.advancement.filter(
        (value) => value.level === $level,
      );
  } else {
    subClassAdvancementArrayFiltered = [];
  }

  $: if ($characterClass?.system?.advancement.length) {
    classAdvancementArrayFiltered = $characterClass.system.advancement.filter(
      (value) => value.level === $level,
    );
  } else {
    classAdvancementArrayFiltered = [];
  }

  onMount(async () => {
    let classUuid, subclassUuid;
    if (window.GAS.debug) {
      classUuid = window.GAS.characterClass;
      subclassUuid = window.GAS.characterSubClass;
    } else {
      classUuid = $characterClass?.uuid;
      subclassUuid = $characterSubClass?.uuid;
    }
    if (classUuid) {
      await handleSelectClass(classUuid);
    }
    if (subclassUuid) {
      await handleSelectSubClass(subclassUuid);
    }
  });
</script>

<template lang="pug">
StandardTabLayout(title="{t('Tabs.Classes.Title')}" showTitle="{true}" tabName="class")
  div(slot="left")
    .flexrow
      .flex0.required(class="{$characterClass ? '' : 'active'}") *
      .flex3 
        IconSelect.icon-select(active="{classProp}" options="{filteredClassIndex}"  placeHolder="{classesPlaceholder}" handler="{handleSelectClass}" id="characterClass-select" bind:value="{classValue}")
    +if("$characterClass")
      +if("subclasses.length && subClassLevel == 1")
        h2.left {t('SubClass')}
        .flexrow
          .flex0.required(class="{$characterSubClass ? '' : 'active'}") *
          .flex3
            IconSelect.icon-select(active="{subClassProp}" options="{subclasses}"  placeHolder="{subclassesPlaceholder}" handler="{handleSelectSubClass}" id="subClass-select" bind:value="{subclassValue}" truncateWidth="17")
      +if("!$readOnlyTabs.includes('class')")
        h2.left {t('Tabs.Classes.FilterByLevel')}
        .flexrow
          .flex2.left
            TJSSelect( options="{levelOptions}" store="{level}" on:change="{levelSelectHandler}" styles="{selectStyles}" )
      +if("classAdvancementArrayFiltered")
        h3.left.mt-sm.flexrow
          .flex0(on:click="{toggleClassAdvancements}")
            +if("classAdvancementExpanded")
              span [-]
            +if("!classAdvancementExpanded")
              span [+]
          .flex {t('Tabs.Classes.Class')} {t('Advancements')}
          .flex0.div.badge.right.inset.ml-sm.mb-xs {t('Level')} {$level}
        ul.icon-list
          +if("!classAdvancementArrayFiltered.length && !classGetsSubclassThisLevel")
            li.left {t('NoAdvancements')}
          +if("!classAdvancementArrayFiltered.length && classGetsSubclassThisLevel && classAdvancementExpanded")
            li.left 
              .flexrow
                .flex0.relative.image
                  img.icon(src="systems/dnd5e/icons/svg/items/subclass.svg" alt="{t('AltText.Subclass')}")
                .flex2 {t('SubClass')}
          +if("classAdvancementArrayFiltered.length && classAdvancementExpanded")
            +each("classAdvancementArrayFiltered as advancement")
              //- @todo: this should be broken out into components for each advancement.type
              li.left(data-type="{advancement.type}")
                .flexrow(data-tooltip="{getAdvancementValue(advancement)}" data-tooltip-class="gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip")
                  .flex0.relative.image
                    img.icon(src="{advancement.icon}" alt="{advancement.title}")
                  .flex2 {advancement.title}
                .flexrow
                  svelte:component(this="{classAdvancementComponents[advancement.type]}" advancement="{advancement}")
    +if("subclasses.length")
      +if("subClassAdvancementArrayFiltered.length")
        h2.left.mt-sm.flexrow
          .flex0.pointer(on:click="{toggleSubClassAdvancements}")
            +if("subClassAdvancementExpanded")
              span [-]
            +if("!subClassAdvancementExpanded")
              span [+]
          .flex {t('Tabs.Classes.SubClass')} {t('Advancements')}
          .flex0.div.badge.right.inset.ml-sm.mb-xs {t('Level')} {$level}
        ul.icon-list
          +if("!subClassAdvancementArrayFiltered.length")
            li.left {t('NoAdvancements')}
          +if("subClassAdvancementArrayFiltered.length && subClassAdvancementExpanded")
            +each("subClassAdvancementArrayFiltered as advancement")
                //- @todo: this should be broken out into components for each advancement.type
                li.left(data-type="{advancement.type}")
                  .flexrow(data-tooltip="{getAdvancementValue(advancement)}" data-tooltip-locked="true" data-tooltip-class="gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip" )
                    .flex0.relative.image
                      img.icon(src="{advancement.icon}" alt="{advancement.title}")
                    .flex2 {advancement.title}
                  .flexrow
                    svelte:component(this="{subClassAdvancementComponents[advancement.type]}" advancement="{advancement}")
  div(slot="right") {@html combinedHtml}
</template>

<style lang="sass">
  .badge.inset
    display: inline-block
    white-space: nowrap

  :global(.icon-select)
    position: relative
  
  .sub-class
    height: 100px
    overflow-y: auto
    padding: 0.5rem
    border: 1px solid transparent
    border-radius: 5px
    box-shadow: 0 0 5px rgba(0,0,0,0.3) inset
    font-size: smaller
</style>
