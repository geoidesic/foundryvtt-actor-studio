<script>
  import { localize as t } from "~/src/helpers/Utility";
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
  import { setEquipmentGoldChoice } from "~/src/stores/equipmentGold";
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
  export let parsedEquipmentGold = null;
  export let equipmentGoldOptions = null;

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
      const classGroup = {
        source: "class",
        label: characterClass?.name || "Class",
        equipment: classEquipment,
      };
      
      // Add variable gold options for class if available
      if (parsedEquipmentGold?.fromClass?.hasVariableGold && parsedEquipmentGold.fromClass.goldOptions?.length > 0) {
        classGroup.variableGoldOptions = parsedEquipmentGold.fromClass.goldOptions;
        classGroup.selectedVariableGold = equipmentGoldOptions?.fromClass?.selectedChoice;
      }
      
      groups.push(classGroup);
    }

    // Add background equipment if available
    if (backgroundEquipment?.length > 0) {
      const backgroundGroup = {
        source: "background",
        label: background?.name || "Background",
        equipment: backgroundEquipment,
      };
      
      // Add variable gold options for background if available (though unlikely)
      if (parsedEquipmentGold?.fromBackground?.hasVariableGold && parsedEquipmentGold.fromBackground.goldOptions?.length > 0) {
        backgroundGroup.variableGoldOptions = parsedEquipmentGold.fromBackground.goldOptions;
        backgroundGroup.selectedVariableGold = equipmentGoldOptions?.fromBackground?.selectedChoice;
      }
      
      groups.push(backgroundGroup);
    }

    return groups;
  })();

  let previousGroupId = null;
  
  // Reactive statement to initialize groups when equipment data changes
  $: {
    startingEquipment.forEach((entry, index) => {

        // For each entry in startingEquipment, process based on its type
    // Only process OR entries that are at the top level (no parent group)
    if (entry.type === "OR") {
      if (entry.group) {
        // Skip OR entries that belong to a parent group
      } else {
        
        // Find all children belonging to this OR group
        const children = startingEquipment.filter(
          (item) => item.group === entry._id,
        );

        // If there's only one child in this OR group, treat it as a standalone entry
        if (children.length === 1) {
          const singleChild = children[0];
          initializeGroup(entry._id, {
            type: "standalone",
            label: singleChild.label || entry.label,
            items: [singleChild],
            sort: entry.sort,
          });
        } else if (children.length > 1) {
          // Normal OR group with multiple choices: initialize as a choice group
          initializeGroup(entry._id, {
            type: "choice",
            label: t('Equipment.ChooseOne'),
            items: children,
            sort: entry.sort,
          });
        }
        // Update previousGroupId to the current OR group's id for the next iteration
        previousGroupId = entry._id;
      }
    } else if (entry.type === "AND" && !entry.group) {
      // Process top-level AND groups - find all children and build the group
      const children = startingEquipment.filter(
        (item) => item.group === entry._id,
      );

      // Separate OR children from regular children
      const orChildren = children.filter(child => child.type === "OR");
      const regularChildren = children.filter(child => child.type !== "OR");

      window.GAS.log.d('[StartingEquipment] Processing AND group', {
        andEntryId: entry._id,
        childrenCount: children.length,
        orChildrenCount: orChildren.length,
        regularChildrenCount: regularChildren.length
      });

      // Create choice groups for each OR child
      orChildren.forEach(orChild => {
        const orGrandchildren = startingEquipment.filter(
          (item) => item.group === orChild._id,
        );
        
        if (orGrandchildren.length > 1) {
          // Create a separate choice group for this OR
          initializeGroup(orChild._id, {
            type: "choice",
                          label: orChild.label || t('Equipment.ChooseOne'),
            items: orGrandchildren,
            sort: orChild.sort || entry.sort, // Use OR's sort or fallback to AND's sort
            parentGroup: entry._id // Track that this belongs to the AND group
          });
          
          window.GAS.log.d('[StartingEquipment] Created choice group for OR', {
            orChildId: orChild._id,
            orChildLabel: orChild.label,
            orGrandchildrenCount: orGrandchildren.length,
            parentGroupId: entry._id,
            parentGroupLabel: entry.label
          });
        }
      });

      // Build the AND item with ALL children (including OR items for display)
      // The OR items won't be interactive but will show what choice needs to be made
      const andItemWithChildren = {
        ...entry,
        children: children // Keep all children for display
      };

      window.GAS.log.d('[StartingEquipment] Final AND item with all children', {
        andItemId: entry._id,
        totalChildrenCount: children.length
      });

      initializeGroup(entry._id, {
        type: "standalone",
        label: entry.label,
        items: [andItemWithChildren],
        sort: entry.sort,
      });
      
      previousGroupId = entry._id;
    } else if (!entry.group) {
      // Standalone entry (not part of a group): initialize as its own group
      initializeGroup(entry._id || "standalone", {
        type: "standalone",
        label: entry.label,
        items: [entry],
        sort: entry.sort,
      });
      // Update previousGroupId to this standalone's id
      previousGroupId = entry._id || "standalone";
    }
  });
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

  function handleVariableGoldChoice(source, choice, goldAmount) {
    if (disabled) return;
    setEquipmentGoldChoice(source, choice, goldAmount);
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
          h2.left {t('Equipment.Label')}
      
      //- For 2024 rules, group by source
      +if("window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === '2024' && equipmentBySource.length > 1")
        StartingEquipmentGroups2024(
          equipmentBySource="{equipmentBySource}"
          sortedGroups="{sortedGroups}"
          handleEditGroup="{handleEditGroup}"
          disabled="{disabled}"
          selectedItems="{selectedItems}"
          handleVariableGoldChoice="{handleVariableGoldChoice}"
          parsedEquipmentGold="{parsedEquipmentGold}"
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

