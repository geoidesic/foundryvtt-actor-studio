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

  // Group equipment by source for 2024 rules
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
        .forEach((entry) => {
          // window.GAS.log.d("StartingEquipment entry", entry);
          if (entry.type === "OR") {
            const children = startingEquipment.filter(
              (item) => item.group === entry._id,
            );

            // If there's only one child in this OR group, treat it as a standalone entry
            if (children.length === 1) {
              const singleChild = children[0];
              window.GAS.log.d(
                "StartingEquipment flattening single-child OR group",
                {
                  orGroupId: entry._id,
                  childType: singleChild.type,
                  childLabel: singleChild.label,
                },
              );

              // Initialize as standalone instead of choice
              initializeGroup(entry._id, {
                type: "standalone",
                label: singleChild.label || entry.label,
                items: [singleChild],
                sort: entry.sort,
              });
            } else {
              // Normal OR group with multiple choices
              initializeGroup(entry._id, {
                type: "choice",
                label: "Choose one...",
                items: children,
                sort: entry.sort,
              });
            }
          } else if (!entry.group) {
            initializeGroup(entry._id || "standalone", {
              type: "standalone",
              label: entry.label,
              items: [entry],
              sort: entry.sort,
            });
          }
        });
    }
  }

  // Sort groups by their sort value
  $: sortedGroups = Object.values($equipmentSelections).sort(
    (a, b) => (a.sort || 0) - (b.sort || 0),
  );

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

  // Helper function to check if a group belongs to a specific equipment source
  function isGroupFromSource(group, sourceEquipment) {
    if (!group?.items?.length || !sourceEquipment?.length) return false;

    // Check if any of the group's items match items from the source equipment
    return group.items.some((groupItem) =>
      sourceEquipment.some(
        (sourceItem) =>
          groupItem._id === sourceItem._id ||
          (groupItem.group && sourceItem._id === groupItem.group),
      ),
    );
  }

  function isGroupNonEditable(group) {
    // Check if it's a standalone group and all items are linked type
    return (
      group.type === "standalone" &&
      group.items.every((item) => {
        if (item.type === "linked") return true;
        if (item.type === "AND") {
          return item.children.every((child) => child.type === "linked");
        }
        return false;
      })
    );
  }
  function matchingGroupsForSource(sourceGroup) {
    if (!sourceGroup || !sourceGroup.equipment) return [];
    return sortedGroups.filter(
      (g) =>
        (g.completed || g.inProgress) &&
        isGroupFromSource(g, sourceGroup.equipment) &&
        Array.isArray(g.items) &&
        g.items.length > 0,
    );
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
      
      //- For 2024 rules, group by source
      +if("window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === '2024' && equipmentBySource.length > 1")
        StartingEquipmentGroups2024(
          equipmentBySource="{equipmentBySource}"
          sortedGroups="{sortedGroups}"
          matchingGroupsForSource="{matchingGroupsForSource}"
          isGroupFromSource="{isGroupFromSource}"
          isGroupNonEditable="{isGroupNonEditable}"
          handleEditGroup="{handleEditGroup}"
          disabled="{disabled}"
          selectedItems="{selectedItems}"
        )
        +else()
          //- Fallback for single source or non-2024 rules
          StartingEquipmentGroups2014(
            equipmentBySource="{equipmentBySource}"
            sortedGroups="{sortedGroups}"
            matchingGroupsForSource="{matchingGroupsForSource}"
            isGroupFromSource="{isGroupFromSource}"
            isGroupNonEditable="{isGroupNonEditable}"
            handleEditGroup="{handleEditGroup}"
            disabled="{disabled}"
            selectedItems="{selectedItems}"
          )
</template>

