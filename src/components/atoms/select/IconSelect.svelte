<script>

  /**
   * @author: Noel da Costa
   * @copyright: Arc Digital Limited 11-05-2024
   * @license: https://creativecommons.org/licenses/by/4.0/
   */

    import { onMount, onDestroy } from "svelte";
    import { truncate } from "~/src/helpers/Utility.js";
    import { MODULE_ID } from "~/src/helpers/constants";
    import { enrichHTML } from "~/src/helpers/Utility.js";
    import { derived } from 'svelte/store';

    export let options = []; //- {value, label, link, icon || img}
    export let value = ""; //- the currently selected uuid
    export let disabled = false;
    export let handler = void 0;
    export let shrinkIfNoIcon = true;
    export let placeHolder = false;
    export let id = void 0;
    export let noImg = false;
    export let truncateWidth = 20;
    export let enableEnrichment = false;
    export let searchable = true
    // groupBy: false (no grouping) or a string path into the option object (e.g. "packLabel" or "pack.name")
    export let groupBy = false;

    let isOpen = false;
    let searchInput;
    let highlightedIndex = -1; // Track the currently highlighted option index
    
    export let handleSelect = (option) => {
      if (handler) {
        if (handler(option.value)) {
          value = option.value;
        }
      } else {
        console.warn('You need to pass a click handler in')
      }
      toggleDropdown();
    };

    const showPackLabelInSelect = game.settings.get(MODULE_ID, 'showPackLabelInSelect');

    function getLabel(option) {
      if (!groupBy && showPackLabelInSelect && option.packLabel) {
        return `[${option.packLabel}] ${option.label}`;
      }
      return option.label;
    }

    function toggleDropdown() {
          if (disabled) {
            isOpen = false;
            return;
          }
          isOpen = !isOpen;
          // reset search and highlight when opening dropdown
          if (isOpen) {
            searchTerm = '';
            highlightedIndex = -1;
          }
    }

    function handleKeydown(event) {
      // Only handle keyboard navigation when dropdown is open
      if (!isOpen) {
        if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
          event.preventDefault();
          toggleDropdown();
        }
        return;
      }

      // Handle keyboard navigation when dropdown is open
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (navigableOptions.length > 0) {
            highlightedIndex = highlightedIndex >= 0 ? highlightedIndex + 1 : 0;
          }
          break;
        case 'ArrowUp':
            event.preventDefault();
            if (navigableOptions.length > 0) {
              highlightedIndex = highlightedIndex > 0 ? highlightedIndex - 1 : navigableOptions.length - 1;
            }
            break;
        case 'Enter':
          event.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < navigableOptions.length) {
            handleSelect(navigableOptions[highlightedIndex]);
          }
          break;
        case 'Escape':
          isOpen = false;
          highlightedIndex = -1;
          break;
        case 'Tab':
          // Allow tab to work normally for accessibility
          isOpen = false;
          highlightedIndex = -1;
          break;
      }
    }


    function isClickOutsideContainer(event, containerElement) {
      try {
        const targetElement = event.target;

        // Check if the target element is the container itself
        if (targetElement === containerElement) {
          return false;
        }

        // Guard: if containerElement is null, treat as click outside
        if (!containerElement) {
          console.warn('[IconSelect] containerElement is null, treating as click outside');
          return true;
        }

        // Guard: if targetElement is null, treat as click outside
        if (!targetElement) {
          console.warn('[IconSelect] targetElement is null, treating as click outside');
          return true;
        }

        // Check if the target element is inside the container
        return !containerElement.contains(targetElement);
      } catch (error) {
        console.error('[IconSelect] Error in isClickOutsideContainer:', error);
        return true; // Treat as click outside on error
      }
    }

    function handleClickOutside(event) {
      try {
        const containerElement = document.getElementById(id);
        if (!containerElement) {
          console.warn('[IconSelect] Element with id', id, 'not found, treating as click outside');
          // Element not found, treat as click outside and close
          isOpen = false;
          return;
        }
        const isClickOutside = isClickOutsideContainer(event, containerElement);
        if(isClickOutside) {
          isOpen = false;
        }
      } catch (error) {
        console.error('[IconSelect] Error in handleClickOutside:', error);
        isOpen = false; // Close on error
      }
    }


    onMount(() => {
      window.addEventListener("click", handleClickOutside);
    });
    onDestroy(() => {
      window.removeEventListener("click", handleClickOutside);
    });


    let textOnly = (option) => {
      return option.icon || option.img ? false : true;
    }
    // Autocomplete state
    let searchTerm = '';
    let debounceTimeout;
    // Debounced input handler
    function handleInput(event) {
      clearTimeout(debounceTimeout);
      const val = event.target.value;
      debounceTimeout = setTimeout(() => {
        searchTerm = val;
      }, 300);
    }

    let filteredOptions = [];
    // Filter options by search term
    $: filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper to get nested value by a path like "pack.name"
    function getValueAtPath(obj, path) {
      if (!path || !obj) return undefined;
      return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : undefined, obj);
    }

    // Resolve group key. `groupBy` may be a string path or an array of string paths.
    function getGroupKey(option, groupBySpec) {
      if (!groupBySpec) return undefined;
      if (Array.isArray(groupBySpec)) {
        const parts = groupBySpec.map(p => {
          const v = getValueAtPath(option, p);
          return (v === undefined || v === null) ? '' : String(v).trim();
        }).filter(Boolean);
        return parts.length ? parts.join(' ') : undefined;
      }
      const v = getValueAtPath(option, groupBySpec);
      return (v === undefined || v === null) ? undefined : String(v);
    }

    // Grouping state
    let groupedOptions = {};
    let groupedOptionKeys = [];

    // When groupBy is provided, build groupedOptions and keys sorted alphabetically
    $: if (groupBy) {
      const map = {};
      for (const opt of filteredOptions) {
        const raw = getGroupKey(opt, groupBy);
        const key = (raw === undefined || raw === null || raw === '') ? 'Other' : String(raw);
        if (!map[key]) map[key] = [];
        map[key].push(opt);
      }
      // sort options in each group
      for (const k of Object.keys(map)) {
        map[k].sort((a, b) => (a.label || '').localeCompare(b.label || ''));
      }
      const keys = Object.keys(map).sort((a, b) => a.localeCompare(b));
      const sorted = {};
      for (const k of keys) sorted[k] = map[k];
      groupedOptions = sorted;
      groupedOptionKeys = keys;
    } else {
      groupedOptions = {};
      groupedOptionKeys = [];
    }

    // Flattened display list used by template. When grouping is enabled, insert group header objects
    let displayOptions = [];
    $: {
      if (groupBy && groupedOptionKeys.length > 0) {
        const arr = [];
        for (const key of groupedOptionKeys) {
          arr.push({ __group: true, label: key });
          for (const opt of groupedOptions[key]) arr.push(opt);
        }
        displayOptions = arr;
      } else {
        displayOptions = filteredOptions.slice();
      }
    }

    // Reset highlighted index when navigable options change
    $: if (navigableOptions.length > 0 && highlightedIndex >= navigableOptions.length) {
      highlightedIndex = navigableOptions.length - 1;
    } else if (navigableOptions.length === 0) {
      highlightedIndex = -1;
    }

    // Create a filtered list that excludes the currently selected option for keyboard navigation
    $: navigableOptions = filteredOptions.filter(option => option?.value !== value);

    // Focus search input when dropdown opens
    $: if (isOpen && searchInput) {
      searchInput.focus();
    }

  </script>

<template lang="pug">
div.custom-select({...$$restProps} id="{id}" role="combobox" aria-expanded="{isOpen}" aria-haspopup="listbox" aria-controls="options-list" tabindex="0" on:keydown="{handleKeydown}")
  div.selected-option(on:click="{toggleDropdown}" role="button" aria-expanded="{isOpen}" aria-haspopup="listbox" tabindex="0" class:selected="{isOpen}" class:disabled="{disabled}")
    +if("placeHolder && !value")
      div.placeholder {placeHolder}
    +each("options as option, index")
      +if("option && option?.value === value")
        +if("!noImg && !textOnly(option) && shrinkIfNoIcon")
          div.option-icon(class="{option.img ? option.img : ''}")
            +if("option.icon != undefined")
              i(class="{option.icon}")
              +else
                img(src="{option.img}" alt="{option.label}")
        div.option-label {truncate(option.label, truncateWidth)}
    div.chevron-icon
      i(class="fas fa-chevron-down")

  +if("isOpen")
    div.options-dropdown.dropshadow(id="options-list" role="listbox")
      // search input for filtering options
      +if("searchable")
        input.search-input(type="text" value="{searchTerm}" on:input="{handleInput}" placeholder="Search..." bind:this="{searchInput}")

      // Grouped rendering
      +if("groupBy")
        +each("groupedOptionKeys as groupName")
          div.group-label {groupName}
          +each("groupedOptions[groupName] as option")
            +if("option && option?.value !== value")
              div.option(
                role="option"
                on:click|stopPropagation|preventDefault!="{handleSelect(option)}"
                tabindex="0"
                class:highlighted="{navigableOptions.indexOf(option) === highlightedIndex}"
                data-index="{navigableOptions.indexOf(option)}"
                aria-selected="{navigableOptions.indexOf(option) === highlightedIndex}"
              )
                +if("!textOnly(option) && shrinkIfNoIcon")
                  div.option-icon(class="{option.img ? option.img : ''}")
                    +if("option.icon != undefined")
                      i(class="{option.icon}")
                      +else
                        img(src="{option.img}" alt="{option.label}")
                +if("enableEnrichment")
                  div.option-label {@html option.enrichedLabel}
                  +else
                    div.option-label {getLabel(option)}
        +else
          +each("filteredOptions as option")
            +if("option && option?.value !== value")
              div.option(
                role="option"
                on:click|stopPropagation|preventDefault!="{handleSelect(option)}"
                tabindex="0"
                class:highlighted="{navigableOptions.indexOf(option) === highlightedIndex}"
                data-index="{navigableOptions.indexOf(option)}"
                aria-selected="{navigableOptions.indexOf(option) === highlightedIndex}"
              )
                +if("!textOnly(option) && shrinkIfNoIcon")
                  div.option-icon(class="{option.img ? option.img : ''}")
                    +if("option.icon != undefined")
                      i(class="{option.icon}")
                      +else
                        img(src="{option.img}" alt="{option.label}")
                +if("enableEnrichment")
                  div.option-label {@html option.enrichedLabel}
                  +else
                    div.option-label {getLabel(option)}
</template>

<style lang="sass">


.custom-select
  position: relative
  display: inline-block
  min-height: var(--tjs-select-height, 32px)

.selected-option
  display: flex
  align-items: left
  padding: 0.35rem 1.75rem 0.35rem 0.15rem
  font-size: 0.875rem
  font-weight: 400
  color: #212529
  background-color: #fff
  border: 1px solid #ced4da
  border-radius: 0.25rem
  cursor: pointer
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
  position: relative

img
  position: absolute
  top: -3px
  left: 0
  width: 24px
  height: 24px
  vertical-align: middle

.selected-option
  &.disabled
    cursor: not-allowed
    opacity: 0.6
    .chevron-icon
      i
        color: var(--color-text-disabled)
        
  &:selected
    display: none
    border-color: #80bdff
  
        
.option-icon
  position: relative
  min-width: 24px
  margin-right: 8px

.option-label
  flex-grow: 1
  text-align: left

.chevron-icon
  position: absolute
  right: 0.5rem

.options-dropdown
  position: absolute
  top: calc(100% + 4px)
  left: 0
  width: 100%
  background-color: #fff
  border: 1px solid #ced4da
  border-radius: 0.25rem
  overflow: hidden
  z-index: 999

.group-label
  margin-top: 1rem
  color: var(--gas-color-text)
  align-items: left
  text-align: left
  padding: 4px
  font-weight: bold
  font-size: 2rem
  font-family: var(--dnd5e-font-modesto)
.option
  display: flex
  align-items: left
  padding: 4px
  font-size: 0.875rem
  font-weight: 400
  line-height: 1.5
  color: #212529
  cursor: pointer

  &:hover
    background-color: var(--select-option-highlight-color)

  &.highlighted
    background-color: rgba(0, 0, 0, 0.3)
    color: var(--gas-color-text)

    &:hover
      background-color: rgba(0, 0, 0, 0.4)

.search-input
  width: calc(100% - 8px)
  padding: 4px 4px 4px 8px
  font-size: 0.875rem
  border: 1px solid #ced4da
  border-radius: 0.25rem
  margin: 4px
  box-shadow: none
  transition: border-color 0.2s

  &:focus
    outline: none
    border-color: #80bdff

:global(.theme-dark) .option.highlighted
  background-color: rgba(255, 255, 255, 0.3)
  color: var(--gas-color-text)

  &:hover
    background-color: rgba(255, 255, 255, 0.4)
</style>
