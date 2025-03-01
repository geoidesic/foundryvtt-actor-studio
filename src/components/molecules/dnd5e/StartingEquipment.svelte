<script>
  import { localize } from "#runtime/svelte/helper";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { equipmentSelections, selectEquipment, initializeGroup, editGroup } from "~/src/stores/equipmentSelections";
  import { MODULE_ID } from "~/src/helpers/constants";
  import IconButton from "~/src/components/atoms/button/IconButton.svelte";
  import ImageButton from "~/src/components/atoms/button/ImageButton.svelte";
  // import EquipmentSelector from "~/src/components/molecules/dnd5e/EquipmentSelector.svelte";

  export let startingEquipment = [];
  export let disabled = false;
  export let allEquipmentItems = [];

  // Check if equipment selection is enabled in settings
  const equipmentSelectionEnabled = game.settings.get(MODULE_ID, "enableEquipmentSelection");

  function getGroupFromSelection(groupId) {
    return $equipmentSelections[groupId];
  }


  // Process and group equipment
  $: {
    if (startingEquipment?.length) {
      startingEquipment.forEach(entry => {
        window.GAS.log.d("StartingEquipment entry", entry);
        if (entry.type === 'OR') {
          initializeGroup(entry._id, {
            type: 'choice',
            label: 'Choose one...',
            items: startingEquipment.filter(item => item.group === entry._id),
            sort: entry.sort
          });
        } else if (!entry.group) {
          initializeGroup(entry._id || 'standalone', {
            type: 'standalone',
            label: entry.label,
            items: [entry],
            sort: entry.sort
          });
        }
      });
    }
  }

  // Sort groups by their sort value
  $: sortedGroups = Object.values($equipmentSelections)
    .sort((a, b) => (a.sort || 0) - (b.sort || 0));


  // Group items by type for specialized handling
  $: groupedByType = sortedGroups.reduce((acc, group) => {
    window.GAS.log.d("StartingEquipment groupedByType group", group);
    const itemTypes = group.items.map(item => item.type);
    if (itemTypes.includes('focus')) {
      if (!acc.focus) acc.focus = [];
      acc.focus.push(group);
    } else if (itemTypes.includes('weapon')) {
      if (!acc.weapon) acc.weapon = [];
      acc.weapon.push(group);
    } else if (itemTypes.includes('armor')) {
      if (!acc.armor) acc.armor = [];
      acc.armor.push(group);
    } else if (itemTypes.includes('tool')) {
      if (!acc.tool) acc.tool = [];
      acc.tool.push(group);
    } else {
      if (!acc.standard) acc.standard = [];
      acc.standard.push(group);
    }
    return acc;
  }, {});



  $: window.GAS.log.d("StartingEquipment equipmentSelections", $equipmentSelections);
  $: window.GAS.log.d("StartingEquipment sortedGroups", sortedGroups);
  $: window.GAS.log.d("StartingEquipment groupedByType", groupedByType);

  $: dnd5eVersion = window.GAS.dnd5eVersion;


  function getEquipmentIcon(type) {
    switch(type) {
      case 'armor':
        return 'icons/svg/shield.svg';
      case 'weapon':
        return 'icons/svg/sword.svg';
      case 'tool':
        return 'icons/svg/padlock.svg';
      case 'focus':
        return 'icons/svg/book.svg';
      case 'linked':
        return 'icons/svg/item-bag.svg';
      case 'OR':
        return 'icons/svg/dice-target.svg';
      default:
        return 'icons/svg/item-bag.svg';
    }
  }

  function handleSelection(groupId, item) {
    if (disabled) return;
    window.GAS.log.d("[Starting Equipment] handleSelection", { groupId, item });
    selectEquipment(groupId, item._id);
  }

  function handleEditGroup(groupId) {
    window.GAS.log.d("[Starting Equipment] editGroup", { groupId });
    editGroup(groupId);
  }

  onMount(async () => {
    window.GAS.log.d("StartingEquipment", startingEquipment);
  });

</script>

<template lang="pug">
  +if("startingEquipment?.length")
    section.starting-equipment
      .flexrow
        +if("!disabled")
          .flex0.required(class="{equipmentSelectionEnabled ? 'active' : ''}") *
        .flex3
          h2.left {localize('GAS.Equipment.Label')}
      
      //- Process each group
      +each("sortedGroups as group")
        +if("group.type === 'choice'")
          //- pre groupCompleted: {group.completed} groupInProgress: {group.inProgress}
          +if("(group.completed || group.inProgress)")
            .equipment-group(class="{group.inProgress ? 'in-progress' : ''}")
              .flexrow.justify-flexrow-vertical.no-wrap
                .flex3.left
                  +if("group.completed")
                    span.group-label One chosen:
                  +if("!group.completed")
                    span.group-label Choose one...
                +if("!group.inProgress")
                  .flex0.right
                    IconButton.option(
                      on:click="{handleEditGroup(group.id)}"
                      disabled="{disabled}"
                      icon="fas fa-pencil"
                    )
              .options
                +each("group.items as item")
                  button.option(
                    class="{group.selectedItemId === item._id ? 'selected' : ''} {disabled  ? 'disabled' : ''} {group.completed ? 'completed' : ''}"
                    on:click="{handleSelection(group.id, item)}"
                    disabled="{disabled}"
                  )
                    .flexrow.justify-flexrow-vertical.no-wrap
                      .flex0.relative.icon
                        img.icon(src="{getEquipmentIcon(item.type)}" alt="{item.type}")
                      .flex2.left.name.black-link {@html item.label}
                    +if("item.count")
                      span.count (x{item.count})
          +else()
            +each("group.items as item")
              .equipment-item.option.selected(class="{item.type === 'focus' ? 'focus' : ''} {disabled ? 'disabled' : ''}")
                .flexrow.justify-flexrow-vertical.no-wrap
                  .flex0.relative.icon
                    img.icon(src="{getEquipmentIcon(item.type)}" alt="{item.type}")
                  .flex2.left.name.black-link {@html item.label}
                  +if("item.count")
                    span.count (x{item.count})

</template>

<style lang="sass">
.starting-equipment
  background: rgba(0, 0, 0, 0.2)
  border-radius: var(--border-radius)
  padding: 0.5rem
  margin-top: 1rem

.section-header
  font-size: 1.2em
  font-weight: bold
  margin-bottom: 1rem
  color: var(--color-text-highlight)
  border-bottom: 1px solid rgba(255, 255, 255, 0.1)
  padding-bottom: 0.5rem

.equipment-group
  margin-bottom: 0.75rem
  margin-right: 0.2rem
  padding: 0.5rem
  border-radius: var(--border-radius)
  background: rgba(0, 0, 0, 0.2)
  
  &:last-child
    margin-bottom: 0

  &.in-progress
    box-shadow: 0px 0px 15px var(--color-highlight)
    border: 1px solid var(--dnd5e-color-gold)

.group-label
  display: block
  font-size: 1em
  color: var(--color-text-dark-secondary)
  margin-bottom: 0.5rem
  font-style: italic

.options
  display: grid
  grid-template-columns: repeat(1, 1fr)
  gap: 0.2rem

.option, .equipment-item
  display: flex
  padding: 0.3rem 0.5rem
  border: 1px solid rgba(255, 255, 255, 0.1)
  border-radius: 4px
  background: rgba(0, 0, 0, 0.4)
  color: var(--li-background-color)
  transition: all 0.2s ease

.option
  cursor: pointer
  
  &:hover:not(.disabled, .selected, .completed)
    background: rgba(0, 0, 0, 0.6)
    border-color: rgba(255, 255, 255, 0.2)

  &.selected
    background: rgba(0, 0, 0, 0.8)
    border-color: #b59e54
    box-shadow: 0 0 10px rgba(181, 158, 84, 0.2)

  &.completed
    cursor: auto
    &:hover
      box-shadow: none

  &.disabled
    cursor: auto
    &:not(.completed)
      opacity: 0.7

    &:hover
      box-shadow: none
    

.equipment-item
  margin-bottom: 0.5rem
  
  &.focus
    border-left: 3px solid var(--color-text-highlight)


.icon
  filter: brightness(1) drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5))
  border: none
  min-width: 32px
  max-height: 32px
  margin-right: 0.2rem
  width: 90%
  height: 90%
  object-fit: cover
  object-position: center

.name
  font-size: smaller
  line-height: 0.8rem

.count
  margin-left: 0.75rem
  color: var(--color-text-dark-secondary)
  font-size: 0.9em
</style> 