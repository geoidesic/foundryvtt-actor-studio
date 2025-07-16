<script>
  import { getEquipmentIcon, getEquipmentItemClasses, getOptionClasses, handleSelection, isOptionDisabled, isGroupFromSource, isGroupEditable, matchingGroupsForSource } from "~/src/stores/equipmentSelections";
  import IconButton from "~/src/components/atoms/button/IconButton.svelte";

  export let equipmentBySource;
  export let sortedGroups;
  export let handleEditGroup;
  export let disabled;
  export let selectedItems;
  export let handleVariableGoldChoice;
  export let parsedEquipmentGold;

  // Helper function to get gold amount for a specific item within an equipment group
  function getGoldAmountForItem(group, sourceGroup, item) {
    if (!parsedEquipmentGold || !sourceGroup.source || group.type !== 'choice') return null;
    
    const goldData = sourceGroup.source === 'class' ? parsedEquipmentGold.fromClass : parsedEquipmentGold.fromBackground;
    if (!goldData?.hasVariableGold || !goldData.goldOptions?.length) return null;
    
    // Check if this group belongs to the source
    if (!isGroupFromSource(group, sourceGroup.equipment)) return null;
    
    // Find the index of this item within the group's items
    const itemIndex = group.items.findIndex(groupItem => groupItem._id === item._id);
    if (itemIndex === -1) return null;
    
    // Map item index to gold choice (A=0, B=1, C=2, etc.)
    if (itemIndex < goldData.goldOptions.length) {
      const choiceLetter = String.fromCharCode(65 + itemIndex); // A=65, B=66, C=67
      const goldOption = goldData.goldOptions.find(opt => opt.choice === choiceLetter);
      return goldOption?.goldAmount || null;
    }
    
    return null;
  }

  // Handle variable gold choice for equipment selection
  function handleEquipmentSelection(group, sourceGroup, item) {
    const goldAmount = getGoldAmountForItem(group, sourceGroup, item);
    handleSelection(disabled, group.id, item);
    
    if (goldAmount && handleVariableGoldChoice) {
      const source = sourceGroup.source === 'class' ? 'fromClass' : 'fromBackground';
      const choice = String.fromCharCode(65 + group.items.findIndex(groupItem => groupItem._id === item._id));
      handleVariableGoldChoice(source, choice, goldAmount);
    }
  }
</script>

<template lang="pug">
div
  +each("equipmentBySource as sourceGroup")
    +if("sourceGroup.equipment?.length")
      .equipment-source-section.ml-md
        h3.source-header.left {sourceGroup.label} Equipment
        +if("!matchingGroupsForSource(sortedGroups, sourceGroup).length") 
          p.left None selected
        //- Process each group within this source
        +each("sortedGroups as group")
          +if("(group.completed || group.inProgress) && isGroupFromSource(group, sourceGroup.equipment)")
            .equipment-group
              .flexrow.justify-flexrow-vertical.no-wrap
                .flex3.left
                  +if("group.type === 'choice'")
                    +if("group.completed")
                      span.group-label Completed:
                      +else()
                        span.group-label Choose one...
                +if("isGroupEditable(group)")
                  .flex0.right
                    IconButton.option(
                      on:click="{handleEditGroup(group.id)}"
                      disabled="{disabled}"
                      icon="fas fa-pencil"
                    )
              .options
                +if("group.type === 'standalone'")
                  .equipment-group
                    .flexrow.justify-flexrow-vertical.no-wrap
                      .flex3.left
                        +if("!group.completed")
                          span.group-label All of the following:
                    +if("group.items[0].type === 'AND'")
                      +each("group.items[0].children as item")
                        .equipment-item.option(
                          class="{getEquipmentItemClasses(group, item, disabled)}"
                          on:click!="{item.type !== 'linked' ? handleSelection(disabled, group.id, item) : null}"
                        )
                          .flexrow.justify-flexrow-vertical.no-wrap
                            .flex0.relative.icon
                              img.icon(src="{getEquipmentIcon(item.type, group)}" alt="{item.type}")
                            .flex2.left.name.black-link
                              span {@html item.label}
                      +else()
                        +each("group.items as item")
                          .equipment-item.option(
                            class="{getEquipmentItemClasses(group, item, disabled)}"
                            on:click!="{item.type !== 'linked' ? handleSelection(disabled, group.id, item) : null}"
                          )
                            .flexrow.justify-flexrow-vertical.no-wrap
                              .flex0.relative.icon
                                img.icon(src="{getEquipmentIcon(item.type, group)}" alt="{item.type}")
                              .flex2.left.name.black-link
                                span {@html item.label}
                  +else()
                    +each("group.items as item")
                      .equipment-item.option(
                        class="{getOptionClasses(disabled, group, item)}"
                        on:click!="{() => handleEquipmentSelection(group, sourceGroup, item)}"
                      )
                        .flexrow.justify-flexrow-vertical.no-wrap
                          .flex0.relative.icon
                            img.icon(src="{getEquipmentIcon(item.type, group)}" alt="{item.type}")
                          .flex2.left.name.black-link
                            span {@html item.label}
                            +if("group.selectedItemId === item._id && $selectedItems[group.id]")
                              span.selected-name &nbsp;({$selectedItems[group.id].name})
                            //- Add gold amount for variable gold choice items
                            +if("getGoldAmountForItem(group, sourceGroup, item)")
                              span.gold-amount(style="color: var(--dnd5e-color-gold); font-weight: bold; margin-left: 10px;") + {getGoldAmountForItem(group, sourceGroup, item)} GP
</template>

<style lang="scss">
  @import '../../../../../styles/features/starting-equipment.sass';
</style>
  