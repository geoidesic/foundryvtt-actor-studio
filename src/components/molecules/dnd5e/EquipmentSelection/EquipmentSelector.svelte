<script>
  import { localize } from "@typhonjs-fvtt/runtime/util/i18n";
  import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
  import { equipmentSelections, selectEquipment } from "~/src/stores/equipmentSelections";

  export let items = [];
  export let groupId;
  export let disabled = false;
  export let type = 'focus';

  $: filteredItems = items.filter(item => item.system?.type === type)
    .map(item => ({
      label: item.label,
      value: item._id,
      img: item.img,
      type: item.type
    }));

  function handleSelection(option) {
    if (disabled) return;
    
    selectEquipment(groupId, {
      selectedItem: items.find(i => i._id === option),
      type
    });
  }

  $: selectedValue = $equipmentSelections[groupId]?.selectedItem?._id;
</script>

<template lang="pug">
section.focus-selector
  h3 {localize('GAS.Equipment.Focus')}
  IconSelect.icon-select(
    active="{selectedValue}"
    options="{filteredItems}"
    placeHolder=`Select ${ucfirst(type)}`
    handler="{handleSelection}"
    id=`${type}-${groupId}`
    bind:value="{selectedValue}"
    disabled="{disabled}"
  )
</template>

<style lang="sass">
.equipment-selector
  margin-top: 1rem
  padding: 0.5rem
  background: rgba(0, 0, 0, 0.2)
  border-radius: var(--border-radius)

  h3
    font-size: 1em
    color: var(--color-text-dark-secondary)
    margin-bottom: 0.5rem

:global(.equipment-selector .icon-select)
  position: relative
</style> 