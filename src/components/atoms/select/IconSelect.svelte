<script>
  import { onMount, onDestroy } from "svelte";
  import { truncate } from "~/src/helpers/Utility.js";

  export let options = [];
  export let value = "";
  export let disabled = false;
  export let key = "";
  export let handle = void 0;
  export let item = {};
  export let active = void 0;

  let isOpen = false;

  export let handleSelect = (item, option) => {
    if (handle) {
      if (handle(item, option.value)) {
        value = option.value;
      }
    } else {
      value = option.value;
      item.update({
        [`${key}`]: value,
      });
    }
    toggleDropdown();
  };

  function toggleDropdown() {
    isOpen = !isOpen;
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
    const isClickOutside = isClickOutsideContainer(event, document.getElementById(item._id));
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

  
</script>


<template lang="pug">
div.custom-select({...$$restProps} id="{item._id}")
  div.selected-option(on:click="{toggleDropdown}" class:selected="{isOpen}")
    +each("options as option, index")
      +if("option && option?.value === value")
        div.option-icon(class="{option.img ? option.img : ''}")
          +if("option.icon != undefined")
            i(class="{option.icon}")
            +else
              img(src="{option.img}")
        div.option-label {truncate(option.label, 10)}
    div.chevron-icon
      i(class="fas fa-chevron-down")

  +if("isOpen")
    div.options-dropdown.dropshadow
      +each("options as option, index")
        +if("option && option?.value !== value")
          div.option(class="{active === option.value ? 'active' : ''}" on:click="{handleSelect(item, option)}")
            div.option-icon(class="{option.img ? option.img : ''}")
              +if("option.icon != undefined")
                i(class="{option.icon}")
                +else
                  img(src="{option.img}")
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
    padding: 0.35rem 0.75rem 0.35rem 0.15rem;
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
    padding: 0.375rem 0.75rem;
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
