<script>
  import { localize } from "#runtime/svelte/helper";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import {
    equipmentSelections,
    selectEquipment,
    initializeGroup,
    editGroup,
    getEquipmentIcon,
    selectedItems,
    getEquipmentItemClasses,
    getOptionClasses,
    handleSelection,
    isOptionDisabled,
    matchingGroupsForSource,
    isGroupFromSource,
    isGroupNonEditable,
  } from "~/src/stores/equipmentSelections";
  import { MODULE_ID } from "~/src/helpers/constants";
  import IconButton from "~/src/components/atoms/button/IconButton.svelte";
  import ImageButton from "~/src/components/atoms/button/ImageButton.svelte";
  import StartingEquipmentGroups2024 from "~/src/components/atoms/dnd5e/2024/StartingEquipmentGroups.svelte";
  import StartingEquipmentGroups2014 from "~/src/components/atoms/dnd5e/2014/StartingEquipmentGroups.svelte";
  // import EquipmentSelector from "~/src/components/molecules/dnd5e/EquipmentSelector.svelte";

  export let startingEquipment = [];
  export let classEquipment = [];
  export let backgroundEquipment = [];
  export let characterClass = null;
  export let background = null;
  export let disabled = false;
  export let allEquipmentItems = [];

  // Check if equipment selection is enabled in settings
  const equipmentSelectionEnabled = game.settings.get(
    MODULE_ID,
    "enableEquipmentSelection",
  );

  function getGroupFromSelection(groupId) {
    return $equipmentSelections[groupId];
  }

  $: window.GAS.log.d("StartingEquipment startingEquipment", startingEquipment);

  $: window.GAS.log.d(
    "StartingEquipment equipmentSelections",
    $equipmentSelections,
  );

  // Group equipment by source for 2024 rules - main grouping function
  $: equipmentBySource = (() => {
    if (window.GAS.dnd5eVersion < 4 || window.GAS.dnd5eRules !== "2024") {
      // For non-2024 rules, just return equipment without source grouping
      return [{ source: null, equipment: startingEquipment }];
    }

    const groups = [];

    // Add class equipment if available
    if (classEquipment?.length > 0) {
      groups.push({
        source: "class",
        label: characterClass?.name || "Class",
        equipment: classEquipment,
      });
    }

    // Add background equipment if available
    if (backgroundEquipment?.length > 0) {
      groups.push({
        source: "background",
        label: background?.name || "Background",
        equipment: backgroundEquipment,
      });
    }

    return groups;
  })();

  let previousGroupId = null;
  window.GAS.log.d("StartingEquipment startingEquipment", startingEquipment);
    startingEquipment.forEach((entry, index) => {
    window.GAS.log.d(`[DEBUG] Processing entry ${index}:`, {
      id: entry._id,
      type: entry.type,
      group: entry.group,
      label: entry.label,
      sort: entry.sort,
      entry: entry
    });

    // For each entry in startingEquipment, process based on its type
    if (entry.type === "OR") {
      // Find all children belonging to this OR group
      const children = startingEquipment.filter(
        (item) => item.group === entry._id,
      );

      window.GAS.log.d(`[DEBUG] OR group ${entry._id} has ${children.length} children:`, children);

      // If there's only one child in this OR group, treat it as a standalone entry
      if (children.length === 1) {
        const singleChild = children[0];
        window.GAS.log.d(`[DEBUG] Creating standalone group for single child:`, {
          groupId: entry._id,
          childLabel: singleChild.label,
          entryLabel: entry.label,
          child: singleChild
        });
        
        initializeGroup(entry._id, {
          type: "standalone",
          label: singleChild.label || entry.label,
          items: [singleChild],
          sort: entry.sort,
        });
      } else {
        // Normal OR group with multiple choices: initialize as a choice group
        window.GAS.log.d(`[DEBUG] Creating choice group for multiple children:`, {
          groupId: entry._id,
          childrenCount: children.length
        });
        
        initializeGroup(entry._id, {
          type: "choice",
          label: "Choose one...",
          items: children,
          sort: entry.sort,
        });
      }
      // Update previousGroupId to the current OR group's id for the next iteration
      previousGroupId = entry._id;
    } else if (!entry.group) {
      window.GAS.log.d(`[DEBUG] Creating standalone entry:`, {
        id: entry._id,
        label: entry.label,
        entry: entry
      });
      
      // Standalone entry (not part of a group): initialize as its own group
      initializeGroup(entry._id || "standalone", {
        type: "standalone",
        label: entry.label,
        items: [entry],
        sort: entry.sort,
      });
      // Update previousGroupId to this standalone's id
      previousGroupId = entry._id || "standalone";
    } else {
      window.GAS.log.d(`[DEBUG] Skipping entry (part of group):`, {
        id: entry._id,
        group: entry.group,
        type: entry.type,
        label: entry.label
      });
    }
  });

  // Sort groups by their sort value
  $: sortedGroups = Object.values($equipmentSelections).sort(
    (a, b) => (a.sort || 0) - (b.sort || 0),
  );

  $: {
    window.GAS.log.d(`[DEBUG] Final sortedGroups:`, sortedGroups);
    sortedGroups.forEach((group, index) => {
      window.GAS.log.d(`[DEBUG] Group ${index}:`, {
        id: group.id,
        type: group.type,
        label: group.label,
        sort: group.sort,
        completed: group.completed,
        inProgress: group.inProgress,
        itemCount: group.items?.length,
        items: group.items
      });
    });
  }

  // Group items by type for specialized handling
  $: groupedByType = sortedGroups.reduce((acc, group) => {
    // window.GAS.log.d("StartingEquipment groupedByType group", group);
    const itemTypes = group.items.map((item) => item.type);
    if (itemTypes.includes("focus")) {
      if (!acc.focus) acc.focus = [];
      acc.focus.push(group);
    } else if (itemTypes.includes("weapon")) {
      if (!acc.weapon) acc.weapon = [];
      acc.weapon.push(group);
    } else if (itemTypes.includes("armor")) {
      if (!acc.armor) acc.armor = [];
      acc.armor.push(group);
    } else if (itemTypes.includes("tool")) {
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
  // $: window.GAS.log.d('$equipmentSelections', $equipmentSelections);

  function handleEditGroup(groupId) {
    // window.GAS.log.d("[Starting Equipment] editGroup", { groupId });
    editGroup(groupId);
  }

  onMount(async () => {
    // window.GAS.log.d("StartingEquipment", startingEquipment);
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
      
      //- For 2024 rules, group by source
      +if("window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === '2024' && equipmentBySource.length > 1")
        StartingEquipmentGroups2024(
          equipmentBySource="{equipmentBySource}"
          sortedGroups="{sortedGroups}"
          handleEditGroup="{handleEditGroup}"
          disabled="{disabled}"
          selectedItems="{selectedItems}"
        )
        +else()
          //- Fallback for single source or non-2024 rules
          StartingEquipmentGroups2014(
            equipmentBySource="{equipmentBySource}"
            sortedGroups="{sortedGroups}"
            handleEditGroup="{handleEditGroup}"
            disabled="{disabled}"
            selectedItems="{selectedItems}"
          )
</template>

