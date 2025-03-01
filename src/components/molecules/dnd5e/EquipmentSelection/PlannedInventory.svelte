<script>
import { getContext, onMount } from "svelte";
import { equipmentSelections, flattenedSelections } from "~/src/stores/equipmentSelections";
import { localize } from "#runtime/svelte/helper";

let plannedItems = [];

// Track the raw selections
$: rawSelections = $flattenedSelections || [];

// Handle async updates when selections change
$: {
  Promise.all(rawSelections
  .filter(selection => selection.type === 'linked')
  .map(async (selection) => {
    if(selection.type === 'linked') {
      return await fromUuid(selection.key);
    }
    return selection;
  })).then(items => {
    plannedItems = items;
  });
}

// $: window.GAS.log.d('[PlannedInventory] flattenedSelections', $flattenedSelections);
// $: window.GAS.log.d('[PlannedInventory] plannedItems', plannedItems);
let unsubscribe;

onMount(() => {

});
</script>

<template lang="pug">
.planned-inventory
  h3 {localize('GAS.Equipment.PlannedInventory')}
  table.inventory-table
    thead
      tr
        th 
        th {localize('GAS.Name')}
        th {localize('GAS.Equipment.Weight')}
        th {localize('GAS.Equipment.Quantity')}
    tbody
      +if('plannedItems.length === 0')
        tr
          td(colspan="4").empty-message {localize('GAS.Equipment.NoItemsSelected')}
        +else()
          +each('plannedItems as item')
            tr
              td
                img(src="{item.img}" width="32" height="32")
              td= "{item.name || '--'}"
              td.weight= "{item.system.weight.value || 0}"
              td.quantity= "{item.system.quantity || 1}"
</template>

<style lang="sass">
.planned-inventory
  margin-top: 1rem
  padding: 1rem
  background: rgba(0, 0, 0, 0.05)
  border-radius: var(--border-radius)

.inventory-table
  width: 100%
  border-collapse: collapse
  margin-top: 0.5rem

  th, td
    text-align: left
    padding: 0.5rem
    border-bottom: 1px solid rgba(0, 0, 0, 0.1)

  th
    font-weight: bold
    color: var(--color-text-dark-primary)

  td.quantity, td.weight
    text-align: center

  tbody tr:hover
    background: rgba(0, 0, 0, 0.03)

  .empty-message
    text-align: center
    color: var(--color-text-dark-secondary)
    font-style: italic
</style>