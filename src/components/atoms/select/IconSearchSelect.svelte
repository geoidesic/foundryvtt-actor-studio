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

    let isOpen = false;
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

    
  </script>

<template lang="pug">
div.custom-select({...$$restProps} {id} role="combobox" aria-expanded="{isOpen}" aria-haspopup="listbox" aria-controls="options-list" tabindex="0")
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
    div.options-dropdown.dropshadow(id="options-list" role="listbox")
      // search input for filtering options
      input.search-input(type="text" value="{searchTerm}" on:input="{handleInput}" placeholder="Search...")
      +each("filteredOptions as option, index")
        +if("option && option?.value !== value")
          div.option(role="option"  on:click|stopPropagation|preventDefault="{handleSelect(option)}" on:keydown="{handleKeydown}" tabindex="0")
            +if("!textOnly(option) && shrinkIfNoIcon")
              div.option-icon(class="{option.img ? option.img : ''}")
                +if("option.icon != undefined")
                  i(class="{option.icon}")
                  +else
                    img(src="{option.img}" alt="{option.label}")
            +if("enableEnrichment")
              +await("enrichHTML(getLabel(option) || option.label || option.link)")
                +then("Html")
                  div.option-label {@html Html}
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
</style>
