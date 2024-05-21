
  <script>

  /**
   * @author: Noel da Costa
   * @copyright: Arc Digital Limited 11-05-2024
   * @license: https://creativecommons.org/licenses/by/4.0/
   */

    import { onMount, onDestroy } from "svelte";
    import { truncate } from "~/src/helpers/Utility.js";

    export let options = []; //- {value, label, icon || img}
    export let value = ""; //
    export let disabled = false;
    export let handler = void 0;
    export let active = void 0;
    export let shrinkIfNoIcon = true;
    export let placeHolder = false;
    export let id = void 0;

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

    function toggleDropdown() {
      isOpen = !isOpen;
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

    function isClickOutsideContainer(event, containerElement) {
      const targetElement = event.target;

      // Check if the target element is the container itself
      if (targetElement === containerElement) {
        return false;
      }

      // Check if the target element is inside the container
      return !containerElement.contains(targetElement);
    }

    function handleClickOutside(event) {
      const isClickOutside = isClickOutsideContainer(event, document.getElementById(id));
      if(isClickOutside) {
        isOpen = false;
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


    
  </script>

<template lang="pug">
div.custom-select({...$$restProps} {id} role="combobox" aria-expanded="{isOpen}" aria-haspopup="listbox" aria-controls="options-list" tabindex="0")
  div.selected-option(on:click="{toggleDropdown}" on:keydown="{handleKeydown}" role="button" aria-expanded="{isOpen}" aria-haspopup="listbox" tabindex="0" class:selected="{isOpen}")
    +if("placeHolder && !value")
      div.placeholder {placeHolder}
    +each("options as option, index")
      +if("option && option?.value === value")
        +if("!textOnly(option) && shrinkIfNoIcon")
          div.option-icon(class="{option.img ? option.img : ''}")
            +if("option.icon != undefined")
              i(class="{option.icon}")
              +else
                img(src="{option.img}" alt="{option.label}")
        div.option-label {truncate(option.label, 10)}
    div.chevron-icon
      i(class="fas fa-chevron-down")

  +if("isOpen")
    div.options-dropdown.dropshadow(id="options-list" role="listbox")
      +each("options as option, index")
        +if("option && option?.value !== value")
          div.option(role="option" aria-selected="{active === option.value}" class="{active === option.value ? 'active' : ''}" on:click="{handleSelect(option)}" on:keydown="{handleKeydown}" tabindex="0")
            +if("!textOnly(option) && shrinkIfNoIcon")
              div.option-icon(class="{option.img ? option.img : ''}")
                +if("option.icon != undefined")
                  i(class="{option.icon}")
                  +else
                    img(src="{option.img}" alt="{option.label}")
            div.option-label {option.label}
</template>

<style lang="scss">
  .custom-select {
    position: relative;
    display: inline-block;
  }

  .selected-option {
    display: flex;
    align-items: left;
    padding: 0.35rem 1.75rem 0.35rem 0.15rem;
    font-size: 0.875rem;
    font-weight: 400;
    color: #212529;
    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;
  }

  img {
    position: absolute;
    top: -3px;
    left: 0;
    width: 24px;
    height: 24px;
    vertical-align: middle;
  }

  .selected-option:selected {
    border-color: #80bdff;
  }

  .option-icon {
    position: relative;
    min-width: 24px;
    margin-right: 8px;
  }

  .option-label {
    flex-grow: 1;
    text-align: left;
  }

  .chevron-icon {
    position: absolute;
    right: 0.5rem;
  }

  .options-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    overflow: hidden;
    z-index: 999;
  }

  .option {
    display: flex;
    align-items: left;
    padding: 4px;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.5;
    color: #212529;
    cursor: pointer;
    &.active {
      background-color: rgba(0, 0, 0, 0.2);
    }
    
  }

  .option:hover {
    background-color: #f8f9fa;
  }
</style>
