<script>
  import { onMount, tick } from "svelte";
  import { localize } from "#runtime/svelte/helper";

  export let classAdvancementArrayFiltered = [];
  export let level = 0;

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

  $: classAdvancementComponents = {};

  onMount(async () => {
    await tick();
    await importClassAdvancements();
  });
</script>

<template lang="pug">
  .component
    +if("classAdvancementArrayFiltered")
      ul.icon-list
        +if("!classAdvancementArrayFiltered.length")
          li.left {localize('GAS.NoAdvancements')}
          +else()
            +each("classAdvancementArrayFiltered as advancement")
              //- @todo: this should be broken out into components for each advancement.type
              li.left(data-type="{advancement.type}")
                .flexrow(data-tooltip="{advancement.configuration?.hint || null}" data-tooltip-class="gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip")
                  .flex0.relative.image
                    img.icon(src="{advancement.icon}" alt="{advancement.title}")
                  .flex2 {advancement.title}
                .flexrow
                  svelte:component(this="{classAdvancementComponents[advancement.type]}" advancement="{advancement}")

</template>

<style lang="sass">
  @import '../../../../../styles/Mixins.scss'
</style>
