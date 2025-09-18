<script>
  import { onMount } from "svelte";
  import { dropItemOnCharacter } from "~/src/helpers/Utility";
  import { dropItemRegistry, isLevelUp, readOnlyTabs } from "~/src/stores/index.js";
  import { getContext } from "svelte";

  const doc = getContext("#doc");

  $: currentDrops = $dropItemRegistry?.currentProcess || [];
  $: itemsWithoutAdvancements = currentDrops.filter(drop => 
    !drop.itemData.advancement || drop.itemData.advancement.length === 0
  );

  // $: console.log('currentDrops', currentDrops);
  // $: console.log('itemsWithoutAdvancements', itemsWithoutAdvancements);
  // $: console.log('$dropItemRegistry', $dropItemRegistry);
  //- for debugging purposes only
  // async function addAdvancement() {
  //   window.GAS.log.d("currentProcess", $dropItemRegistry.currentProcess);
  //   let item = await fromUuid(
  //     "Compendium.dnd5e.subclasses.Item.sprHbe7cRg9osTzf",
  //   );
  //   window.GAS.log.d("item", item);
  //   dropItemOnCharacter({
  //     actor: $doc,
  //     itemData: item,
  //     isLevelUp: $isLevelUp
  //   });
  // }
  
  onMount(() => {
    // window.GAS.log.d("Advancements tab mounted");
    Hooks.call("gas.captureAdvancement", true);
    
    // Set read-only state for other tabs
    readOnlyTabs.set(["race", "background", "abilities", "class"]);
  });
</script>

<template lang="pug">
.container
  //- button for debugging only
  //- button.btn.btn-primary.mt-sm(on:click="{addAdvancement}") Add Advancement
  .content
  +if('itemsWithoutAdvancements.length > 0')
    .warnings.p-2
      +each('itemsWithoutAdvancements as item')
        .warning.notification {item.itemData.name} has no advancements at this level.

</template>

<style lang="sass">
@import "../../../../../styles/Mixins.sass"
.content
  padding: 1rem
:global(#foundryvtt-actor-studio-pc-sheet .gas-advancements .window-header .window-title)
  display: none
:global(#foundryvtt-actor-studio-pc-sheet .gas-advancements .window-header .window-icon)
  display: none
:global(#foundryvtt-actor-studio-pc-sheet .gas-advancements .window-header .header-control)
  display: none

:global(.gas-advancements)
  display: inline
  text-align: left
  
:global(.gas-advancements nav)
  display: flex

:global(.gas-advancements .step h2)
  border: none

:global(.gas-advancements .step h4)
  border: none
  margin: 0

// Styling for trait slots and fighting style selections
:global(.gas-advancements .step ol.trait-slots)
  @include inset
  font-size: 1rem

:global(.gas-advancements .step ol.trait-slots li.trait-slot)
  margin: 2px 0
  align-items: center

:global(.theme-dark .gas-advancements .step ol.trait-slots )
  border: 1px solid var(--dnd5e-color-gold)

:global(.gas-advancements .step ol.trait-slots li.trait-slot label)
  display: flex
  align-items: center
  position: relative
  padding-left: 30px  /* Make room for the checkbox */

:global(.gas-advancements .step ol.trait-slots li.trait-slot label::before)
  content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" fill="currentColor" height="20" viewBox="0 0 24 24"><path d="M9 16.17l-3.5-3.5 1.17-1.17L9 13.83l6.33-6.33L16.5 8.5 9 16.17zM5 5v14h14V5H5z"/></svg>') /* SVG icon */
  position: absolute
  left: 0
  top: 50%
  transform: translateY(-35%) scale(1.5)
  margin-right: 5px

// Dark theme override for checkbox visibility
:global(.theme-dark .gas-advancements .step ol.trait-slots li.trait-slot label::before)
  content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" fill="%23ffffff" height="20" viewBox="0 0 24 24"><path d="M9 16.17l-3.5-3.5 1.17-1.17L9 13.83l6.33-6.33L16.5 8.5 9 16.17zM5 5v14h14V5H5z"/></svg>') /* White SVG for dark theme */

:global(.theme-dark .GAS.application input[type="checkbox"]::before)
  // color: var(--dnd5e-color-gold)

:global(.gas-advancements .step ol.trait-slots li.trait-slot a)
  text-align: right

// General styling for all lists in advancements
:global(.gas-advancements .step ul)
  padding: 0

:global(.gas-advancements .step .pill-lg)
  margin: 0.5rem 0
  border: 1px solid var(--dnd5e-color-gold)
  padding: 0.5rem 1rem
  cursor: pointer
  background-color: #000
  border-radius: var(--border-radius)
  color: var(--dnd5e-color-gold)
  display: flex
  justify-content: space-between
  align-items: center
  
:global(.gas-advancements .step .pill-lg img)
  max-height: 30px
:global(.gas-advancements .step .pill-lg[data-action="browse"]:after)
  content: ">"

// Fighting style specific styles
:global(.gas-advancements form[data-type="ItemChoice"] ol),
:global(.gas-advancements .advancement[data-type="ItemChoice"] ul.icon-list)
  @include inset
  font-size: 1rem
  padding: 0
  margin: 0
  list-style-type: none

:global(.gas-advancements form[data-type="ItemChoice"] li),
:global(.gas-advancements .advancement[data-type="ItemChoice"] ul.icon-list li)
  display: flex
  align-items: center
  margin: 2px 0
  padding: 0
  border: 1px solid #ccc
  border-radius: 4px
  height: 30px
  overflow: hidden

:global(.gas-advancements .advancement[data-type="ItemChoice"] ul.icon-list li .flexrow)
  display: flex
  align-items: center
  width: 100%
  height: 100%

:global(.gas-advancements form[data-type="ItemChoice"] li label),
:global(.gas-advancements .advancement[data-type="ItemChoice"] ul.icon-list li .flex2)
  display: flex
  align-items: center
  padding: 0 8px
  flex-grow: 1
  height: 100%
  font-size: 0.9rem

:global(.gas-advancements form[data-type="ItemChoice"] li input[type="radio"]),
:global(.gas-advancements form[data-type="ItemChoice"] li input[type="checkbox"])
  margin-right: 8px

:global(.gas-advancements form[data-type="ItemChoice"] .item-image),
:global(.gas-advancements .advancement[data-type="ItemChoice"] .image img.icon)
  width: 30px
  height: 30px
  margin-right: 8px
  object-fit: cover
  background-size: cover
  background-position: center
  background-repeat: no-repeat

:global(.gas-advancements form[data-type="ItemChoice"] .choice-hint),
:global(.gas-advancements .advancement[data-type="ItemChoice"] .hint)
  font-style: italic
  font-size: 0.9em
  margin: 4px 0
  padding-left: 5px

:global(.gas-advancements .advancement[data-type="ItemChoice"] .flexrow)
  display: flex
  align-items: center
  margin-bottom: 4px

:global(.gas-advancements .advancement[data-type="ItemChoice"] h3)
  margin: 0
  padding: 0
  font-size: 1rem

:global(.gas-advancements .advancement[data-type="ItemChoice"] ul.icon-list)
  margin-top: 4px
  
:global(.gas-advancements .advancement[data-type="ItemChoice"] .flex0.image)
  flex: 0 0 30px
  height: 30px
  display: flex
  align-items: center
  justify-content: center

:global(.theme-dark .gas-advancements form[data-type="ItemChoice"] .drop-target .item-name)
  background: black
  border: 1px solid var(--dnd5e-color-gold)
  margin-bottom: 0.3rem
:global(.theme-dark .GAS .gas-advancements .item-name )
  border: 1px solid var(--dnd5e-color-gold)
  background: black
:global(.theme-dark .GAS .gas-advancements .item-name h4 a)
  color: var(--dnd5e-color-gold)


:global(.gas-advancements .header-button.control.close)
  display: none

// Ability scores styling
:global(.gas-advancements .step ul.ability-scores li)
  @include inset(var(--color-border-light), 0.2rem)
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

  :global(.gas-advancements flexrow)
    display: flex
    align-items: center

:global(.gas-advancements form[data-type="ItemGrant"])
  min-height: 20px
  padding: 0

:global(.gas-advancements form[data-type="ItemGrant"] .item-name)
  @include inset
  font-size: 1.5rem
  padding: 0
  margin: 0.5rem 0
  border-radius: 4px

:global(.gas-advancements form[data-type="ItemGrant"] .item-name h4)
  padding: 0
  margin: 0

:global(.gas-advancements form[data-type="ItemGrant"] .item-name label)
  padding: 0
  margin: 6px 0 0 0

:global(.gas-advancements form[data-type="ItemGrant"] .item-image)
  height: 40px
  width: 40px
  max-width: 40px
  margin-right: 8px 
  background-size: contain
  background-repeat: no-repeat
  flex: 0
  min-width: 40px

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
  flex: 0
  min-width: 40px
  
:global(.gas-advancements form[data-type="ItemChoice"] .drop-target input[type="checkbox"])
  text-align: right
  margin-right: 0.5rem

:global(.gas-advancements form[data-type="AbilityScoreImprovement"] .ability-scores li)
  display: grid
  grid-template: "label label label" "minus value plus" "minus delta plus"
  align-items: center

:global(.gas-advancements form[data-type="AbilityScoreImprovement"] .ability-scores li input)
  width: unset
  text-align: unset
  padding-left: 0.6rem

:global(.step form[data-type="HitPoints"] .rolls)
    display: grid
    grid-template-columns: 50% 1fr 1fr
    align-items: center
    gap: 2px

:global(.gas-advancements .gas-header)
  border-bottom: 1px solid var(--color-border-light)
  
:global(.gas-advancements .gas-content)
  padding: 0.5rem

:global(.warning.notification)
  background: rgba(var(--color-warning-rgb), 0.1)
  border: 1px solid var(--color-warning)
  border-radius: 4px
  padding: 0.5rem
  margin-bottom: 0.5rem

:global(.gas-advancements .header-control)
  display: none

:global(.gas-advancements .dnd5e.advancement select)
  color: unset

:global(.gas-advancements .window-header h2)
  margin: 0.2rem 0

:global(.theme-dark .gas-advancements .content-link)
  color: var(--dnd5e-color-gold)

.warnings
  margin-top: 1rem
</style>
