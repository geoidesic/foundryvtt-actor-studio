<script>
  import { localize } from "#runtime/svelte/helper";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { equipmentSelections, selectEquipment, initializeGroup, editGroup, getEquipmentIcon, selectedItems } from "~/src/stores/equipmentSelections";
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

  $: window.GAS.log.d("StartingEquipment startingEquipment", startingEquipment);

  // Process and group equipment
  $: {
    if (startingEquipment?.length) {
      startingEquipment
        // @deprecated: this breaks the order of the items for v4 in the flattenedStartingEquipment store
        // .sort((a, b) => {
        //   // First sort by whether it's a standalone entry (not OR and no group)
        //   if (a.type !== 'OR' && !a.group && (b.type === 'OR' || b.group)) return -1;
        //   if (b.type !== 'OR' && !b.group && (a.type === 'OR' || a.group)) return 1;
        //   // Then by sort value
        // })
        .forEach(entry => {
          // window.GAS.log.d("StartingEquipment entry", entry);
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
    // .sort((a, b) => (a.sort || 0) - (b.sort || 0));


  // Group items by type for specialized handling
  $: groupedByType = sortedGroups.reduce((acc, group) => {
    // window.GAS.log.d("StartingEquipment groupedByType group", group);
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



  // $: window.GAS.log.d("StartingEquipment equipmentSelections", $equipmentSelections);
  // $: window.GAS.log.d("StartingEquipment sortedGroups", sortedGroups);
  // $: window.GAS.log.d("StartingEquipment groupedByType", groupedByType);

  $: dnd5eVersion = window.GAS.dnd5eVersion;
  $: console.log('$equipmentSelections', $equipmentSelections);


  function handleSelection(groupId, item) {
    window.GAS.log.d('[StartingEquipment] handleSelection ENTRY', {
      groupId,
      itemDetails: {
        id: item?._id,
        type: item?.type,
        label: item?.label
      },
      groupState: {
        type: $equipmentSelections[groupId]?.type,
        inProgress: $equipmentSelections[groupId]?.inProgress,
        completed: $equipmentSelections[groupId]?.completed,
        selectedItem: $equipmentSelections[groupId]?.selectedItem,
        items: $equipmentSelections[groupId]?.items?.map(i => ({
          id: i._id,
          type: i.type,
          isAND: i.type === 'AND'
        }))
      }
    });
    
    if (disabled) return;
    
    const group = $equipmentSelections[groupId];
    
    window.GAS.log.d('[StartingEquipment] Group evaluation', {
      isStandalone: group?.type === 'standalone',
      hasItems: !!group?.items?.length,
      firstItemType: group?.items?.[0]?.type,
      isFirstItemAND: group?.items?.[0]?.type === 'AND',
      isChoiceGroup: group?.type === 'choice'
    });

    // For standalone groups with AND items
    if (group?.type === 'standalone' && group.items[0]?.type === 'AND') {
      window.GAS.log.d('[StartingEquipment] Handling standalone AND group', {
        andItemDetails: {
          id: group.items[0]._id,
          children: group.items[0].children?.map(c => ({
            id: c._id,
            type: c.type,
            label: c.label
          }))
        },
        currentGranularSelections: group.granularSelections
      });
      selectEquipment(groupId, group.items[0]._id);
    } 
    // For choice groups
    else if (group?.type === 'choice') {
      window.GAS.log.d('[StartingEquipment] Handling choice group', {
        groupId,
        selectedItemId: item._id,
        selectedItemType: item.type,
        isSelectedItemAND: item.type === 'AND',
        groupItems: group.items.map(i => ({
          id: i._id,
          type: i.type
        }))
      });
      selectEquipment(groupId, item._id);
    }
  }

  function handleEditGroup(groupId) {
    // window.GAS.log.d("[Starting Equipment] editGroup", { groupId });
    editGroup(groupId);
  }

  onMount(async () => {
    // window.GAS.log.d("StartingEquipment", startingEquipment);
  });

  function isOptionDisabled(group, item) {
    return disabled || (group.inProgress && group.selectedItemId && group.selectedItemId !== item._id);
  }

  function getOptionClasses(group, item) {
    const classes = [];
    if (group.selectedItemId === item._id) classes.push('selected');
    if (isOptionDisabled(group, item)) classes.push('disabled');
    if (group.completed) classes.push('completed');
    return classes.join(' ');
  }

  function isGroupNonEditable(group) {
    // Check if it's a standalone group and all items are linked type
    return group.type === 'standalone' && group.items.every(item => {
      if (item.type === 'linked') return true;
      if (item.type === 'AND') {
        return item.children.every(child => child.type === 'linked');
      }
      return false;
    });
  }

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
        +if("group.completed || group.inProgress")
          .equipment-group(class="{group.inProgress ? 'in-progress' : ''}")
            .flexrow.justify-flexrow-vertical.no-wrap
              .flex3.left
                +if("group.type === 'choice'")
                  +if("group.completed")
                    span.group-label Completed:
                    +else()
                      span.group-label Choose one...
              +if("!group.inProgress && !isGroupNonEditable(group)")
                .flex0.right
                  IconButton.option(
                    on:click="{handleEditGroup(group.id)}"
                    disabled="{disabled}"
                    icon="fas fa-pencil"
                  )
            .options
              +if("group.type === 'standalone' && group.inProgress")
                .equipment-group
                  .flexrow.justify-flexrow-vertical.no-wrap
                    .flex3.left
                      +if("!group.completed")
                        span.group-label All of the following:
                  +if("group.items[0].type === 'AND'")
                    +each("group.items[0].children as item")
                      .equipment-item.option(
                        class="{item.type === 'linked' ? 'selected' : ''} {item.type === 'focus' ? 'focus' : ''} {disabled ? 'disabled' : ''}"
                        on:click!="{item.type !== 'linked' ? handleSelection(group.id, item) : null}"
                      )
                        .flexrow.justify-flexrow-vertical.no-wrap
                          .flex0.relative.icon
                            img.icon(src="{getEquipmentIcon(item.type, group)}" alt="{item.type}")
                          .flex2.left.name.black-link
                            span {@html item.label}
                    +else()
                      +each("group.items as item")
                        .equipment-item.option(
                          class="{item.type === 'linked' ? 'selected' : ''} {item.type === 'focus' ? 'focus' : ''} {disabled ? 'disabled' : ''}"
                          on:click!="{item.type !== 'linked' ? handleSelection(group.id, item) : null}"
                        )
                          .flexrow.justify-flexrow-vertical.no-wrap
                            .flex0.relative.icon
                              img.icon(src="{getEquipmentIcon(item.type, group)}" alt="{item.type}")
                            .flex2.left.name.black-link
                              span {@html item.label}
                +else()
                  +each("group.items as item")
                    button.option(
                      class="{getOptionClasses(group, item)}"
                      on:click!="{handleSelection(group.id, item)}"
                      disabled="{isOptionDisabled(group, item)}"
                    )
                      .flexrow.justify-flexrow-vertical.no-wrap
                        .flex0.relative.icon
                          img.icon(src="{getEquipmentIcon(item.type, group)}" alt="{item.type}")
                        .flex2.left.name.black-link
                          span {@html item.label}
                          +if("group.selectedItemId === item._id && $selectedItems[group.id]")
                            span.selected-name &nbsp;({$selectedItems[group.id].name})

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