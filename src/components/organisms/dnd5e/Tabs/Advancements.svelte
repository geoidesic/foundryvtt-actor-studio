<script>
  import { onMount } from "svelte";
  import { log, dropItemOnCharacter } from "~/src/helpers/Utility";
  import { dropItemRegistry, isLevelUp } from "~/src/helpers/store.js";
  import { getContext } from "svelte";

  const doc = getContext("#doc");

  //- for debugging purposes only
  // async function addAdvancement() {
  //   log.d("currentProcess", $dropItemRegistry.currentProcess);
  //   let item = await fromUuid(
  //     "Compendium.dnd5e.subclasses.Item.sprHbe7cRg9osTzf",
  //   );
  //   log.d("item", item);
  //   dropItemOnCharacter({
  //     actor: $doc,
  //     itemData: item,
  //     isLevelUp: $isLevelUp
  //   });
  // }
  onMount(() => {
    log.d("Advancements tab mounted");
    Hooks.call("gas.renderAdvancement");
  });
</script>

<template lang="pug">
.container
  //- button for debugging only
  //- button.btn.btn-primary.mt-sm(on:click="{addAdvancement}") Add Advancement
  .content

</template>

<style lang="sass">
@import "../../../../../styles/Mixins.scss"
.content
  padding: 1rem

:global(.gas-advancements)
  display: inline
  text-align: left
  
:global(.gas-advancements nav)
  display: flex

:global(.gas-advancements .step h2)
  border: none

:global(.gas-advancements .step ol.trait-slots)
  @include inset
  font-size: 1rem

:global(.gas-advancements .step ol.trait-slots li.trait-slot)
  margin: 2px 0

:global(.gas-advancements .step ol.trait-slots li.trait-slot label::before)
  content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M9 16.17l-3.5-3.5 1.17-1.17L9 13.83l6.33-6.33L16.5 8.5 9 16.17zM5 5v14h14V5H5z"/></svg>') /* SVG icon */
  margin-right: 5px

:global(.gas-advancements .step ol.trait-slots li.trait-slot a)
  text-align: right

:global(.gas-advancements .step ul)
  padding: 0

:global(.gas-advancements .step ul.ability-scores li)
  @include inset
  display: flex
  gap: 0.5rem
  align-items: center
  font-size: 1rem

:global(.gas-advancements .step ul.ability-scores li label)
  flex-grow: 1

:global(.gas-advancements .step ul.ability-scores li input)
  width: 40px
  text-align: center

:global(.gas-advancements .step ul.ability-scores li a)
  text-align: right

:global(.gas-advancements .step ul.ability-scores li .delta)
  min-width: 35px

:global(.gas-advancements .step ul li)
  border: 1px solid #ccc
  padding: 0
  margin: 0.6rem 0
  list-style-type: none

:global(.gas-advancements form[data-type="ItemGrant"])
  min-height: 20px
  padding: 0

:global(.gas-advancements form[data-type="ItemGrant"] .item-name)
  @include inset
  font-size: 1.5rem

:global(.gas-advancements form[data-type="ItemGrant"] .item-name h4)
  padding: 0
  margin: 6px 0 0 0

:global(.gas-advancements form[data-type="ItemGrant"] .item-image)
  height: 40px
  width: 40px
  background-size: contain
  background-repeat: no-repeat

:global(.gas-advancements form[data-type="ItemChoice"] .drop-target .item-name)
  @include inset
  font-size: 1.5rem

:global(.gas-advancements form[data-type="ItemChoice"] .drop-target .item-name label)
  padding: 0
  margin: 6px 0 0 0

:global(.gas-advancements form[data-type="ItemChoice"] .drop-target .item-image)
  height: 40px
  width: 40px
  background-size: contain
  background-repeat: no-repeat

:global(.step form[data-type="HitPoints"] .rolls)
    display: grid
    grid-template-columns: 50% 1fr 1fr
    align-items: center
    gap: 2px
</style>
