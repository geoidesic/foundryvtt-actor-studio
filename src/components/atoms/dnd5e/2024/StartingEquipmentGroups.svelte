<script>
  import { getEquipmentIcon, getEquipmentItemClasses, getOptionClasses, handleSelection, isOptionDisabled, isGroupFromSource, isGroupEditable, matchingGroupsForSource } from "~/src/stores/equipmentSelections";
  import IconButton from "~/src/components/atoms/button/IconButton.svelte";

  export let equipmentBySource;
  export let sortedGroups;
  export let handleEditGroup;
  export let disabled;
  export let selectedItems;
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
                    .flex3.left
                      +if("group.completed")
                        +if("group.items?.length > 0")
                        +else()
                          span.group-label None selected
                    +each("group.items as item")
                      .equipment-item.option(
                        class="{getOptionClasses(disabled, group, item)}"
                        on:click!="{handleSelection(disabled, group.id, item)}"
                      )
                        .flexrow.justify-flexrow-vertical.no-wrap
                          .flex0.relative.icon
                            img.icon(src="{getEquipmentIcon(item.type, group)}" alt="{item.type}")
                          .flex2.left.name.black-link
                            span {@html item.label}
                            +if("group.selectedItemId === item._id && $selectedItems[group.id]")
                              span.selected-name &nbsp;({$selectedItems[group.id].name})
</template>

<style lang="scss">
  @import '../../../../../styles/features/starting-equipment.sass';
</style>
  