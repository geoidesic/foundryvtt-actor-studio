<script>

  /**
   * @author: Noel da Costa
   * @copyright: Arc Digital Limited 11-05-2024
   * @license: https://creativecommons.org/licenses/by/4.0/
   */

    import { onMount, onDestroy, getContext } from "svelte";
    import { truncate, safeGetSetting } from "~/src/helpers/Utility.js";
    import { MODULE_ID } from "~/src/helpers/constants";
    import { getExternalApplication, subscribeToPositionStores, calculateDropdownMaxHeight, isClickOutsideContainer } from './selectDropdownUtils.js';

    export let options = []; //- {value, label, icon || img}
    export let value = ""; //- the currently selected uuid
    export let disabled = false;
    export let handler = void 0;
    export let shrinkIfNoIcon = true;
    export let placeHolder = false;
    export let id = void 0;
    export let noImg = false;
    export let truncateWidth = 20;

    let isOpen = false;

    // Dynamic dropdown height based on available vertical space
    let containerEl;
    let maxDropdownHeight = 300;
    let _unsubscribePositionStores = null;
    const _application = getExternalApplication(getContext);
    let _appTop = null;
    let _appHeight = null;

    function calculateMaxHeight() {
      maxDropdownHeight = calculateDropdownMaxHeight({
        containerEl,
        application: _application,
        appTop: _appTop,
        appHeight: _appHeight
      });
    }

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

    const showPackLabelInSelect = safeGetSetting(MODULE_ID, 'showPackLabelInSelect', true);

    function getLabel(option) {
      if (showPackLabelInSelect && option.packLabel) {
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
          // reset search when opening dropdown
          if (isOpen) {
            searchTerm = '';
          }
    }

    function handleKeydown(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (event.currentTarget.getAttribute('role') === 'option') {
          this.handleSelect(event.currentTarget.option);
        } else {
          this.toggleDropdown();
        }
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

      _unsubscribePositionStores = subscribeToPositionStores(_application, (type, value) => {
        if (type === 'top') _appTop = value;
        if (type === 'height') _appHeight = value;
        requestAnimationFrame(calculateMaxHeight);
      });
    });
    onDestroy(() => {
      window.removeEventListener("click", handleClickOutside);
      if (_unsubscribePositionStores) _unsubscribePositionStores();
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
    // Filter options by search term
    $: filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Recalculate dropdown max-height when it opens
    $: if (isOpen) calculateMaxHeight();

    
  </script>

<template lang="pug">
div.custom-select({...$$restProps} {id} role="combobox" aria-expanded="{isOpen}" aria-haspopup="listbox" aria-controls="options-list" tabindex="0" bind:this="{containerEl}" style="--dropdown-max-height: {maxDropdownHeight}px")
  div.selected-option(on:click="{toggleDropdown}" on:keydown="{handleKeydown}" role="button" aria-expanded="{isOpen}" aria-haspopup="listbox" tabindex="0" class:selected="{isOpen}" class:disabled="{disabled}")
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
    div.options-dropdown.dropshadow(id="options-list" role="listbox" on:wheel|stopPropagation)
      // search input for filtering options
      input.search-input(type="text" value="{searchTerm}" on:input="{handleInput}" placeholder="Search...")
      +each("filteredOptions as option, index")
        +if("option && option?.value !== value")
          div.option(role="option"  on:click="{handleSelect(option)}" on:keydown="{handleKeydown}" tabindex="0")
            +if("!textOnly(option) && shrinkIfNoIcon")
              div.option-icon(class="{option.img ? option.img : ''}")
                +if("option.icon != undefined")
                  i(class="{option.icon}")
                  +else
                    img(src="{option.img}" alt="{option.label}")
            div.option-label {getLabel(option)}
</template>

<style lang="sass">
@import './selectShared.sass'
</style>
