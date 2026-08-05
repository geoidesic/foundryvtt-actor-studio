<script>
  import SvelteSelect from "svelte-select";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import {
    extractMapIteratorObjectProperties,
    extractItemsFromPacksSync,
    extractItemsFromPacksAsync,
    getPacksFromSettings,
    getAdvancementValue,
    getSubclassLevel,
    getAdvancementEntryCount,
    advancementEntriesToArray,
    illuminatedDescription, safeGetSetting,
    isSelectionAutomationEnabled,
    getSelectionAutomationValue,
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
  import ClassDescriptionPanel from "~/src/components/molecules/dnd5e/ClassDescriptionPanel.svelte";
  import ClassSelector from "~/src/components/molecules/dnd5e/ClassSelector.svelte";
  import SubclassSelector from "~/src/components/molecules/dnd5e/SubclassSelector.svelte";
  import AdvancementIconList from "~/src/components/molecules/dnd5e/AdvancementIconList.svelte";
  import CollapsibleSectionHeader from "~/src/components/atoms/dnd5e/CollapsibleSectionHeader.svelte";
  import { clearEquipmentSelections } from "~/src/stores/equipmentSelections";

  const isDisabled = getContext('isDisabled') || false;
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

  const showPackLabelInSelect = safeGetSetting(
    MODULE_ID,
    "showPackLabelInSelect",
    false
  );

  const hideLevelPreview = safeGetSetting(
    MODULE_ID,
    "hideLevelPreview",
    false
  );

  const showLevelPreviewDropdown = safeGetSetting(
    MODULE_ID,
    "showLevelPreviewDropdown",
    false
  );

  const hideLeftSidebar = safeGetSetting(
    MODULE_ID,
    "hideLeftSidebar",
    false
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
    // Reset workflow state when class changes
    const fsm = window.GAS?.workflowFSM;
    if (fsm) {
      const currentState = fsm.getCurrentState();
      if (currentState === 'creating_character') {
        fsm.handle('reset');
      }
    }

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
    await updateClassRichHTML();
  };

  async function updateClassRichHTML() {
    if (!$characterClass) {
      richHTML = "";
      return;
    }
    const descriptionHtml = $characterClass?.system?.description?.value || "";
    richHTML = await illuminatedDescription(descriptionHtml, $characterClass);
    Hooks.call("gas.richhtmlReady", richHTML);
  }

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

  $: if ($characterClass && html) {
    updateClassRichHTML();
  }


  $: subClassHeader = hideLeftSidebar ? `<h1>${t("SubClass")}</h1>` : "";

  $: showSubclassSelect = $characterClass && subclasses.length && subClassLevel == 1;

  $: wrappedSubClassHTML = $characterClass
    ? `${richSubClassHTML ? `<div class="actor-studio-subclass">${subClassHeader}${richSubClassHTML}</div>` : ""}` : "";

  $: combinedHtml = $characterClass
    ? `${wrappedSubClassHTML}${richHTML}`
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

  $: if (getAdvancementEntryCount($characterSubClass?.system?.advancement)) {
    subClassAdvancementArrayFiltered = advancementEntriesToArray(
      $characterSubClass.system.advancement,
    ).filter((value) => value.level === $level);
  } else {
    subClassAdvancementArrayFiltered = [];
  }

  $: if (getAdvancementEntryCount($characterClass?.system?.advancement)) {
    classAdvancementArrayFiltered = advancementEntriesToArray(
      $characterClass.system.advancement,
    ).filter((value) => value.level === $level);
  } else {
    classAdvancementArrayFiltered = [];
  }



  // The two-panel layout is available only after class and subclass selection.
  // The responsive layout determines how the panels fit; these state flags determine
  // which content is allowed in each panel.
  $: classSelected = Boolean($characterClass);
  $: isSubclassSelectVisible = Boolean(showSubclassSelect);
  $: subClassSelected = Boolean($characterSubClass);
  $: canRenderTwoPanels =
    !hideLeftSidebar && classSelected && isSubclassSelectVisible && subClassSelected;
  $: singlePanel = !canRenderTwoPanels;


  onMount(async () => {
    let classUuid, subclassUuid;
    if (isSelectionAutomationEnabled()) {
      classUuid = getSelectionAutomationValue('characterClass');
      subclassUuid = getSelectionAutomationValue('characterSubClass');
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
StandardTabLayout(title="{t('Tabs.Classes.Title')}" showTitle="{true}" tabName="class" singlePanel="{singlePanel}" contentClass="{hideLeftSidebar ? 'class-tab-single-panel' : ''}")
  div(slot="left")
    .class-tab-selects
      ClassSelector(
        active="{classProp}"
        options="{filteredClassIndex}"
        value="{classValue}"
        handler="{handleSelectClass}"
        disabled="{isDisabled}"
      )
      +if("showSubclassSelect")
        h2.left {t('SubClass')}
        SubclassSelector(
          active="{subClassProp}"
          options="{subclasses}"
          value="{subclassValue}"
          handler="{handleSelectSubClass}"
          disabled="{isDisabled}"
        )
    +if("$characterClass")
      +if("singlePanel")
        ClassDescriptionPanel(html="{combinedHtml}")
      +if("canRenderTwoPanels && richSubClassHTML")
        ClassDescriptionPanel(html="{wrappedSubClassHTML}")
      +if("canRenderTwoPanels && classAdvancementArrayFiltered")
        +if("showLevelPreviewDropdown")
          CollapsibleSectionHeader(
            className="left mt-sm"
            label="{t('Tabs.Classes.LevelPreview')}"
            expanded="{classAdvancementExpanded}"
            on:toggle="{toggleClassAdvancements}"
          )
          +if("!$readOnlyTabs.includes('class') && showLevelPreviewDropdown && classAdvancementExpanded")
            li.flexrow
              .flex2.left
                TJSSelect( options="{levelOptions}" store="{level}" on:change="{levelSelectHandler}" styles="{selectStyles}" )
          +if("classAdvancementExpanded")
            AdvancementIconList(advancements="{classAdvancementArrayFiltered}" components="{classAdvancementComponents}")
    +if("subclasses.length")
      +if("subClassAdvancementArrayFiltered.length")
        +if("canRenderTwoPanels")
          +if("showLevelPreviewDropdown")
            CollapsibleSectionHeader(
              className="left mt-sm"
              label="{`${t('Tabs.Classes.SubClass')} ${t('Advancements')}`}"
              expanded="{subClassAdvancementExpanded}"
              on:toggle="{toggleSubClassAdvancements}"
            )
              span(slot="right").badge.right.inset.ml-sm.mb-xs {t('Level')} {$level}
            +if("subClassAdvancementExpanded")
              AdvancementIconList(advancements="{subClassAdvancementArrayFiltered}" components="{subClassAdvancementComponents}" tooltipLocked="{true}")
  div(slot="right")
    ClassDescriptionPanel(html="{richHTML}")
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

  .class-tab-selects
    flex-shrink: 0

  .description-fill
    overflow-y: auto
    font-size: smaller
    :global(img)
      max-width: 100%
      height: auto

  :global(.class-tab-single-panel .col-a)
    flex: 1 1 100%
    max-width: 100%
    width: 100%

  :global(.class-tab-single-panel .description-fill)
    width: 100%

  // Subclass visibility: show in left column when wide (two-column),
  // and in the single column when narrow.
  :global(.col-a .actor-studio-subclass)
    display: block
  :global(.class-tab-single-panel .col-a .actor-studio-subclass)
    display: block
</style>
