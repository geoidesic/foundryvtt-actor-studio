<script>
  import SvelteSelect from "svelte-select";
  import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
  import {
    extractMapIteratorObjectProperties,
    extractItemsFromPacksSync,
    extractItemsFromPacksAsync,
    getPacksFromSettings,
    getAdvancementValue,
    getSubclassLevel,
    illuminatedDescription
  } from "~/src/helpers/Utility.js";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import {
    characterClass,
    characterSubClass,
    level,
    subClassesForClass,
    readOnlyTabs
  } from "~/src/stores/index";
  import { localize } from "#runtime/svelte/helper";
  import { TJSSelect } from "@typhonjs-fvtt/svelte-standard/component";
  import { MODULE_ID } from "~/src/helpers/constants";
  import DonationTracker from "~/src/plugins/donation-tracker";
  import StartingEquipment from "~/src/components/molecules/dnd5e/StartingEquipment.svelte";
  import StartingGold from "~/src/components/molecules/dnd5e/StartingGold.svelte";
  import { clearEquipmentSelections } from "~/src/stores/equipmentSelections";
  import { goldRoll } from "~/src/stores/goldRoll";

  let richHTML = "",
    html = "",
    richSubClassHTML = "",
    activeClass = null,
    activeSubClass = null,
    classValue = null,
    subclassValue = null,
    subClassesIndex,
    subclasses,
    classesPlaceholder = "Classes",
    subclassesPlaceholder = "Subclasses",
    packs = getPacksFromSettings("classes"),
    subClassesPacks = getPacksFromSettings("subclasses"),
    classAdvancementArrayFiltered = [],
    classAdvancmentExpanded = false,
    equipmentSelectionExpanded = false,
    subClassAdvancementArrayFiltered = [],
    subClassAdvancmentExpanded = false,
    mappedClassIndex = extractItemsFromPacksSync(packs, [
      "name->label",
      "img",
      "type",
      "folder",
      "uuid->value",
      "_id"
    ]),
    filteredClassIndex
  ;

  const showPackLabelInSelect = game.settings.get(MODULE_ID, 'showPackLabelInSelect');

  filteredClassIndex = mappedClassIndex
    .filter((i) => {
      return i.type == "class";
    })
    .sort((a, b) => a.label.localeCompare(showPackLabelInSelect ? b.compoundLabel : b.label));

    
  // window.GAS.log.d('packs', packs);
  // window.GAS.log.d('mappedClassIndex', mappedClassIndex);
  // window.GAS.log.d('subClassesPacks', subClassesPacks);


  const levelOptions = [];
  for (let i = 1; i <= 20; i++) {
    levelOptions.push({ label: "Level " + i, value: i });
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
    
    // window.GAS.log.d('mappedSubClassIndex', mappedSubClassIndex);
    mappedSubClassIndex = mappedSubClassIndex.filter((x) => {
      // window.GAS.log.d("subclass", x);
      // window.GAS.log.d("$characterClass.system.identifier", $characterClass.system.identifier);
      return x.system.classIdentifier == $characterClass.system.identifier;
    });

    // window.GAS.log.d('mappedSubClassIndex', mappedSubClassIndex);
    const output = mappedSubClassIndex
      .flat()
      .sort((a, b) => a.label.localeCompare(showPackLabelInSelect ? b.compoundLabel : b.label));
    // window.GAS.log.d("subclass output", output);
    return output;

  };

  const selectClassHandler = async (option) => {
    activeSubClass = null;
    $characterSubClass = null;
    subclassValue = null;
    subClassAdvancementArrayFiltered = [];
    richSubClassHTML = "";
    
    // Reset gold roll when changing class
    goldRoll.set(0);
    
    const selectedClass = await fromUuid(option);
    $characterClass = selectedClass;
    activeClass = option;

    clearEquipmentSelections();

    await tick();
    subClassesIndex = await getFilteredSubclassIndex();
    $subClassesForClass = subClassesIndex;
    // window.GAS.log.d('subClassesForClass', $subClassesForClass);

    await tick();
    await importClassAdvancements();
    richHTML = await illuminatedDescription(html, $characterClass);
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
        window.GAS.log.e(`Failed to load component for ${classAdvancement.type}:`, error);
      }
    }
  };

  const selectSubClassHandler = async (option) => {
    const selectedSubClass = await fromUuid(option);
    $characterSubClass = selectedSubClass;
    activeSubClass = option;
    await tick();
    importClassAdvancements();
    importSubClassAdvancements();
    richSubClassHTML = await illuminatedDescription(
        $characterSubClass.system.description.value,
        $characterSubClass
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
    classAdvancmentExpanded = !classAdvancmentExpanded;
  };
  const toggleEquipmentSelection = () => {
    equipmentSelectionExpanded = !equipmentSelectionExpanded;
  };

  const toggleSubClassAdvancements = () => {
    subClassAdvancmentExpanded = !subClassAdvancmentExpanded;
  };

  $: if(isDisabled) {
    classAdvancmentExpanded = true
  }

  $: html = $characterClass?.system?.description.value || "";
  $: subClassProp = activeSubClass;
  $: classProp = activeClass;
  $: combinedHtml = $characterClass ? `
      ${richHTML}
      ${richSubClassHTML ? `<h1>${localize("GAS.SubClass")}</h1>${richSubClassHTML}` : ""}
  ` : "";
  $: classAdvancementComponents = {};
  $: subClassAdvancementComponents = {};

  $: if (subClassesIndex?.length) {
    subclasses = subClassesIndex
      .flat()
      .sort((a, b) => a.label.localeCompare(b.label));
  } else {
    subclasses = [];
  }

  // $: window.GAS.log.d('subclasses', subclasses);

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

  $: subClassLevel = $characterClass ? getSubclassLevel($characterClass, MODULE_ID) : false;
  $: classGetsSubclassThisLevel = subClassLevel && subClassLevel === $level;

  $: isDisabled = $readOnlyTabs.includes("class");

  onMount(async () => {
    if ($characterClass) {
      window.GAS.log.d($characterClass);

      classValue = $characterClass.uuid;
      await tick();
      importClassAdvancements();
      richHTML = await illuminatedDescription(html, $characterClass);
      subClassesIndex = await getFilteredSubclassIndex();
    }
    if ($characterSubClass) {
      subclassValue = $characterSubClass.uuid;
      await tick();
      importSubClassAdvancements();
      richSubClassHTML = await illuminatedDescription(
        $characterSubClass.system.description.value,
        $characterSubClass
      );
    }
  });
</script>

<template lang="pug">
  .content
    .flexrow
      .flex2.pr-sm.col-a
        .flexrow
          .flex0.required(class="{$characterClass ? '' : 'active'}") *
          .flex3 
            IconSelect.icon-select(active="{classProp}" options="{filteredClassIndex}"  placeHolder="{classesPlaceholder}" handler="{selectClassHandler}" id="characterClass-select" bind:value="{classValue}" disabled="{isDisabled}")
        +if("$characterClass")
          +if("subclasses.length && classGetsSubclassThisLevel")
            h3.left.mt-md {localize('GAS.SubClass')}
            .flexrow
              .flex0.required(class="{$characterSubClass ? '' : 'active'}") *
              .flex3
                IconSelect.icon-select(active="{subClassProp}" options="{subclasses}"  placeHolder="{subclassesPlaceholder}" handler="{selectSubClassHandler}" id="subClass-select" bind:value="{subclassValue}" truncateWidth="17" disabled="{isDisabled}")
          +if("!isDisabled")
            h3.left.mt-sm {localize('GAS.Tabs.Classes.FilterByLevel')}
            .flexrow
              .flex2.left
                TJSSelect( options="{levelOptions}" store="{level}" on:change="{levelSelectHandler}" styles="{selectStyles}" )
          +if("classAdvancementArrayFiltered")
            h3.left.mt-sm.flexrow
              .flex0(on:click="{toggleClassAdvancements}")
                +if("classAdvancmentExpanded")
                  span [-]
                +if("!classAdvancmentExpanded")
                  spen [+]
              .flex {localize('GAS.Tabs.Classes.Class')} {localize('GAS.Advancements')}
              .flex0.div.badge.right.inset.ml-sm.mb-xs {localize('GAS.Level')} {$level}
            ul.icon-list
              +if("!classAdvancementArrayFiltered.length && !classGetsSubclassThisLevel")
                li.left {localize('GAS.NoAdvancements')}
              +if("!classAdvancementArrayFiltered.length && classGetsSubclassThisLevel && classAdvancmentExpanded")
                li.left 
                  .flexrow
                    .flex0.relative.image
                      img.icon(src="systems/dnd5e/icons/svg/items/subclass.svg" alt="Subclass")
                    .flex2 {localize('GAS.SubClass')}
              +if("classAdvancementArrayFiltered.length && classAdvancmentExpanded")
                +each("classAdvancementArrayFiltered as advancement")
                  //- @todo: this should be broken out into components for each advancement.type
                  li.left(data-type="{advancement.type}")
                    .flexrow(data-tooltip="{getAdvancementValue(advancement)}" data-tooltip-class="gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip")
                      .flex0.relative.image
                        img.icon(src="{advancement.icon}" alt="{advancement.title}")
                      .flex2 {advancement.title}
                    .flexrow
                      //- pre {JSON.stringify(advancement, null, 2)}
                      svelte:component(this="{classAdvancementComponents[advancement.type]}" advancement="{advancement}")
          
          +if("$characterClass?.system?.startingEquipment?.length")
            h3.left.mt-sm.flexrow
              .flex0(on:click="{toggleEquipmentSelection}")
                +if("equipmentSelectionExpanded")
                  span [-]
                +if("!equipmentSelectionExpanded")
                  spen [+]
              .flex Starting Equipment
            +if("equipmentSelectionExpanded && !isDisabled")
              .flexrow
                StartingGold(characterClass="{$characterClass}")
              .flexrow
                StartingEquipment(startingEquipment="{$characterClass.system.startingEquipment}")
            +if("equipmentSelectionExpanded && isDisabled")
              p.left See Equipment tab
  
          +if("subclasses.length")
            //- h3.left.mt-sm Description
            //- .left.sub-class(bind:innerHTML="{richSubClassHTML}" contenteditable)
            +if("subClassAdvancementArrayFiltered.length")
              h3.left.mt-sm.flexrow
                .flex0(on:click="{toggleSubClassAdvancements}")
                  +if("subClassAdvancmentExpanded")
                    span [-]
                  +if("!subClassAdvancmentExpanded")
                    spen [+]
                .flex {localize('GAS.Tabs.Classes.SubClass')} {localize('GAS.Advancements')}
                .flex0.div.badge.right.inset.ml-sm.mb-xs {localize('GAS.Level')} {$level}
              ul.icon-list
                +if("!subClassAdvancementArrayFiltered.length")
                  li.left {localize('GAS.NoAdvancements')}
                +if("subClassAdvancementArrayFiltered.length && subClassAdvancmentExpanded")
                  +each("subClassAdvancementArrayFiltered as advancement")
                      //- @todo: this should be broken out into components for each advancement.type
                      li.left(data-type="{advancement.type}")
                        .flexrow(data-tooltip="{getAdvancementValue(advancement)}" data-tooltip-locked="true" data-tooltip-class="gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip" )
                          .flex0.relative.image
                            img.icon(src="{advancement.icon}" alt="{advancement.title}")
                          .flex2 {advancement.title}
                        .flexrow
                          svelte:component(this="{subClassAdvancementComponents[advancement.type]}" advancement="{advancement}")
  
      .flex0.border-right.right-border-gradient-mask 
      .flex3.left.pl-md.scroll.col-b {@html combinedHtml}

</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .content 
    @include staticOptions

    .badge.inset
      @include badge()
      @include inset
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
