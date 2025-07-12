<script>
import { getContext, onMount } from "svelte";
import { equipmentSelections, flattenedSelections } from "~/src/stores/equipmentSelections";
import { localize as t } from "~/src/helpers/Utility";
import { readOnlyTabs } from "~/src/stores/index";

let plannedItems = [];

// Track the raw selections
$: rawSelections = $flattenedSelections || [];

// $: window.GAS.log.d('PLANNED INVENTORY | flattenedSelections', $flattenedSelections);

// Handle async updates when selections change and group identical items
$: {
  Promise.all(rawSelections.map(async (selection) => {
    if(selection.type === 'linked') {
      return await fromUuid(selection.key);
    }
    if(selection.key) {
      return await fromUuid(selection.key);
    }
    return selection;
  })).then(items => {
    // Group identical items and sum their quantities
    const groupedItems = items.reduce((acc, item) => {
      if (!item) return acc;
      
      const key = item.uuid || item._id;
      if (!acc[key]) {
        acc[key] = {
          ...item,
          system: {
            ...item.system,
            quantity: 1
          },
          uuid: key
        };
      } else {
        acc[key].system.quantity = (acc[key].system.quantity || 1) + 1;
      }
      return acc;
    }, {});

    plannedItems = Object.values(groupedItems);
  });
}

function getItemName(item) {
  // window.GAS.log.d('PLANNED INVENTORY | getItemName', item);
  return `@UUID[${item?.uuid}]{${item?.name}}`
}

// $: window.GAS.log.d('[PlannedInventory] flattenedSelections', $flattenedSelections);
// $: window.GAS.log.d('[PlannedInventory] plannedItems', plannedItems);
let unsubscribe;


// Check if equipment tab is readonly
$: isDisabled = $readOnlyTabs.includes("equipment");

onMount(() => {

});
</script>

<template lang="pug">
.planned-inventory
  h3 {t('Equipment.PlannedInventory')}
  +if('!isDisabled')
    table.inventory-table
      thead
        tr
          th 
          th.white {t('Item')}
          th.white {t('Equipment.Weight')}
          th.white {t('Equipment.Quantity')}
      tbody
        +if('plannedItems.length === 0')
          tr
            td(colspan="4").empty-message {t('Equipment.NoItemsSelected')}
          +else()
            +each('plannedItems as item')
              tr
                td(width="50")
                  +if('item && item.img')
                    img(src="{item.img}" width="32" height="32")
                    +else()
                      img(src="icons/svg/item-bag.svg" width="32" height="32")
                +await("foundry.applications.ux.TextEditor.implementation.enrichHTML(getItemName(item) || '')")
                  +then("Html")
                    td= "{@html Html || '--'}"
                td.weight= "{item?.system?.weight?.value || 0}"
                td.quantity= "{item?.system?.quantity || 1}"
  +if('isDisabled')
    .info-message {t('Equipment.EquipmentConfirmed')}
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
    padding: 0 0.5rem
    border-bottom: 1px solid rgba(0, 0, 0, 0.1)

    img
      margin-top: 0.3rem
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

.inventory-table th:first-child,
.inventory-table td:first-child
  width: 50px
  min-width: 50px
  max-width: 50px
</style>