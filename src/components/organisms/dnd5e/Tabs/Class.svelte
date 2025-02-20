<script>
  import SvelteSelect from "svelte-select";
  import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
  import {
    extractMapIteratorObjectProperties,
    extractItemsFromPacksSync,
    extractItemsFromPacksAsync,
    getPacksFromSettings,
    getAdvancementValue,
  } from "~/src/helpers/Utility.js";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import {
    characterClass,
    characterSubClass,
    level,
    subClassesForClass,
  } from "~/src/helpers/store";
  import { localize } from "#runtime/svelte/helper";
  import { TJSSelect } from "@typhonjs-fvtt/svelte-standard/component";
  import DonationTracker from "~/src/plugins/donation-tracker";

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
    subClassesPack = game.packs.get("dnd5e.subclasses"),
    subClassesPacks = getPacksFromSettings("subclasses"),
    classAdvancementArrayFiltered = [],
    subClassAdvancementArrayFiltered = [],
    mappedClassIndex = extractItemsFromPacksSync(packs, [
      "name->label",
      "img",
      "type",
      "folder",
      "uuid->value",
      "_id",
    ]),
    filteredClassIndex = mappedClassIndex
      .filter((i) => {
        return i.type == "class";
      })
      .sort((a, b) => a.label.localeCompare(b.label));
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
    
    game.system.log.d('mappedSubClassIndex', mappedSubClassIndex);

    mappedSubClassIndex = mappedSubClassIndex.filter((x) => {
      game.system.log.d("subclass", x);
      game.system.log.d("$characterClass.system.identifier", $characterClass.system.identifier);
      return x.system.classIdentifier == $characterClass.system.identifier;
    });

    const output = mappedSubClassIndex
      .flat()
      .sort((a, b) => a.label.localeCompare(b.label));
    game.system.log.d("subclass output", output);
    return output;

  };

  const selectClassHandler = async (option) => {
    console.log('CLASS SELECTION START:', {
        option,
        optionType: typeof option
    });

    activeSubClass = null;
    $characterSubClass = null;
    subclassValue = null;
    subClassAdvancementArrayFiltered = [];
    richSubClassHTML = "";
    
    const selectedClass = await fromUuid(option);
    console.log('CLASS FROM UUID:', {
        selectedClass,
        properties: Object.keys(selectedClass || {}),
        system: selectedClass?.system,
        advancement: selectedClass?.system?.advancement
    });

    $characterClass = selectedClass;
    activeClass = option;

    await tick();
    subClassesIndex = await getFilteredSubclassIndex();
    $subClassesForClass = subClassesIndex;

    await tick();
    importClassAdvancements();
    richHTML = await TextEditor.enrichHTML(html);
  };

  const importClassAdvancements = async () => {
    for (const classAdvancement of classAdvancementArrayFiltered) {
      try {
        const module = await import(
          `~/src/components/molecules/dnd5e/Advancements/${classAdvancement.type}.svelte`
        );
        classAdvancementComponents[classAdvancement.type] = module.default;
      } catch (error) {
        log.e(`Failed to load component for ${classAdvancement.type}:`, error);
      }
    }
  };

  const selectSubClassHandler = async (option) => {
    console.log('SUBCLASS SELECTION START:', {
        option,
        optionType: typeof option,
        currentClass: $characterClass
    });

    const selectedSubClass = await fromUuid(option);
    console.log('SUBCLASS FROM UUID:', {
        selectedSubClass,
        properties: Object.keys(selectedSubClass || {}),
        system: selectedSubClass?.system,
        advancement: selectedSubClass?.system?.advancement,
        classIdentifier: selectedSubClass?.system?.classIdentifier
    });

    $characterSubClass = selectedSubClass;
    activeSubClass = option;
    await tick();
    importClassAdvancements();
    importSubClassAdvancements();
    richSubClassHTML = await TextEditor.enrichHTML(
        $characterSubClass.system.description.value,
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
        log.e(
          `Failed to load component for ${subClassAdvancement.type}:`,
          error,
        );
      }
    }
  };

  $: html = $characterClass?.system?.description.value || "";
  $: subClassProp = activeSubClass;
  $: classProp = activeClass;
  $: combinedHtml =
    richHTML +
    (richSubClassHTML
      ? `<h1>${localize("GAS.SubClass")}</h1>` + richSubClassHTML
      : "");
  $: classAdvancementComponents = {};
  $: subClassAdvancementComponents = {};

  $: if (subClassesIndex?.length) {
    subclasses = subClassesIndex
      .flat()
      .sort((a, b) => a.label.localeCompare(b.label));
  } else {
    subclasses = [];
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
    if ($characterClass) {
      game.system.log.d($characterClass);

      classValue = $characterClass.uuid;
      await tick();
      importClassAdvancements();
      richHTML = await TextEditor.enrichHTML(html);
      subClassesIndex = await getFilteredSubclassIndex();
    }
    if ($characterSubClass) {
      subclassValue = $characterSubClass.uuid;
      await tick();
      importSubClassAdvancements();
      richSubClassHTML = await TextEditor.enrichHTML(
        $characterSubClass.system.description.value,
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
            IconSelect.icon-select(active="{classProp}" options="{filteredClassIndex}"  placeHolder="{classesPlaceholder}" handler="{selectClassHandler}" id="characterClass-select" bind:value="{classValue}" )
        +if("$characterClass")
          +if("subclasses.length")
            h3.left.mt-md {localize('GAS.SubClass')}
            .flexrow
              .flex0.required(class="{$characterSubClass ? '' : 'active'}") *
              .flex3
                IconSelect.icon-select(active="{subClassProp}" options="{subclasses}"  placeHolder="{subclassesPlaceholder}" handler="{selectSubClassHandler}" id="subClass-select" bind:value="{subclassValue}" truncateWidth="17" )
          h3.left.mt-sm {localize('GAS.Tabs.Classes.FilterByLevel')}
          .flexrow
            .flex2.left
              TJSSelect( options="{levelOptions}" store="{level}" on:change="{levelSelectHandler}" styles="{selectStyles}" )
          +if("classAdvancementArrayFiltered")
            h3.left.mt-sm.flexrow
              .flex {localize('GAS.Tabs.Classes.Class')} {localize('GAS.Advancements')}
              .flex0.div.badge.right.inset.ml-sm.mb-xs {localize('GAS.Level')} {$level}
            ul.icon-list
              +if("!classAdvancementArrayFiltered.length")
                li.left {localize('GAS.NoAdvancements')}
                +else()
                  +each("classAdvancementArrayFiltered as advancement")
                    //- @todo: this should be broken out into components for each advancement.type
                    li.left(data-type="{advancement.type}")
                      .flexrow(data-tooltip="{getAdvancementValue(advancement)}" data-tooltip-class="gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip")
                        .flex0.relative.image
                          img.icon(src="{advancement.icon}" alt="{advancement.title}")
                        .flex2 {advancement.title}
                      .flexrow
                        //- pre advancement.type {advancement.type}
                        svelte:component(this="{classAdvancementComponents[advancement.type]}" advancement="{advancement}")
  
          +if("subclasses.length")
            //- h3.left.mt-sm Description
            //- .left.sub-class(bind:innerHTML="{richSubClassHTML}" contenteditable)
            +if("subClassAdvancementArrayFiltered")
              h3.left.mt-sm.flexrow
                .flex {localize('GAS.Tabs.Classes.SubClass')} {localize('GAS.Advancements')}
                .flex0.div.badge.right.inset.ml-sm.mb-xs {localize('GAS.Level')} {$level}
              ul.icon-list
                +if("!subClassAdvancementArrayFiltered.length")
                  li.left {localize('GAS.NoAdvancements')}
                  +else()
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
