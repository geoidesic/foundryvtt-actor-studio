<script>
import { getContext, onMount } from "svelte";
import { equipmentSelections } from "~/src/stores/equipmentSelections";
import { localize } from "#runtime/svelte/helper";

// Types that need additional configuration
const CONFIGURABLE_TYPES = ['tool', 'armor', 'weapon', 'focus'];

// Get the currently selected items that need configuration
$: configurableSelections = Object.values($equipmentSelections)
  .filter(group => group.completed && group.selectedItem)
  .filter(group => {
    const item = group.selectedItem;
    return CONFIGURABLE_TYPES.includes(item.type);
  });

// Group them by type for organized display
$: groupedSelections = configurableSelections.reduce((acc, group) => {
  const type = group.selectedItem.type;
  if (!acc[type]) acc[type] = [];
  acc[type].push(group);
  return acc;
}, {});

onMount(async () => {
  window.GAS.log.d('EquipmentSelectorDetail mounted', { 
    configurableSelections, 
    groupedSelections 
  });
});
</script>

<template lang="pug">
section.equipment-selector-detail
  .flexrow
    .flex3
      h2.left {localize('GAS.Equipment.ConfigureLabel')}
  
  +if("configurableSelections.length === 0")
    p.empty-state
      span {localize('GAS.Equipment.NoItemsToConfig')}

  +if("configurableSelections.length > 0")
    +each("Object.entries(groupedSelections) as [type, groups]")
      .equipment-type-section
        h3.type-header
          span {localize(`GAS.Equipment.Type.${type}`)}
        +each("groups as group")
          .equipment-config-item
            .flexrow.justify-flexrow-vertical.no-wrap
              .flex0.relative.icon
                img.icon(src="{group.selectedItem.img || `icons/svg/${type}.svg`}" alt="{type}")
              .flex2.left.name
                span {group.selectedItem.label}
            +if("type === 'tool'")
              .tool-config
                //- Tool-specific options here
            +if("type === 'armor'")
              .armor-config
                //- Armor-specific options here
            +if("type === 'weapon'")
              .weapon-config
                //- Weapon-specific options here
            +if("type === 'focus'")
              .focus-config
                //- Focus-specific options here
</template>

<style lang="sass">
.equipment-selector-detail
  background: rgba(0, 0, 0, 0.2)
  border-radius: var(--border-radius)
  padding: 1rem
  height: 100%

.empty-state
  text-align: center
  color: var(--color-text-dark-secondary)
  font-style: italic
  padding: 1rem

.equipment-type-section
  margin-bottom: 1.5rem
  
  &:last-child
    margin-bottom: 0

.type-header
  color: var(--color-text-highlight)
  border-bottom: 1px solid rgba(255, 255, 255, 0.1)
  padding-bottom: 0.5rem
  margin-bottom: 1rem

.equipment-config-item
  background: rgba(0, 0, 0, 0.3)
  border-radius: var(--border-radius)
  padding: 0.75rem
  margin-bottom: 0.75rem

  &:last-child
    margin-bottom: 0

.icon
  width: 32px
  height: 32px
  margin-right: 0.5rem
  filter: brightness(1) drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5))

.name
  font-size: 1.1em
  line-height: 32px
  color: var(--color-text-dark-primary)

// Configuration section styles
.tool-config,
.armor-config,
.weapon-config,
.focus-config
  margin-top: 0.75rem
  padding-top: 0.75rem
  border-top: 1px solid rgba(255, 255, 255, 0.1)
</style>