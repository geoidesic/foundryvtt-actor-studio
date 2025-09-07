<script>
  import preventDefault from "~/src/helpers/svelte-actions/PreventDefault.js";
  import { ripple } from "@typhonjs-fvtt/standard/action/animate/composable";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { dropItemRegistry } from "~/src/stores/index";

  export let tabs = [];
  export let sheet;
  export let activeTab = void 0;
  export let efx = ripple();
  export let labels = true;

  let initialTabs = [];

  $: tabComponents = {}

  // if the tabs change, load the new components
  $: if(initialTabs !== tabs) {
    initialTabs = tabs;
    for (const tab of tabs) {
      import(`~/src/components/organisms/dnd5e/Tabs/${tab.component}.svelte`).then(module => {
        tabComponents[tab.component] = module.default;
      });
    }
  }

  onMount(async () => {
    window.GAS.log.d('tabs', tabs);
    initialTabs = tabs;
    for (const tab of tabs) {
      const module = await import(`~/src/components/organisms/dnd5e/Tabs/${tab.component}.svelte`);
      window.GAS.log.d('module', module);

      tabComponents[tab.component] = module.default;
    }
  });
  
  // Subscribe to the currentProcess to know when advancements are active
  $: isAdvancementTab = activeTab === 'advancements';
</script>

<template lang="pug">
.tabs(class="{$$restProps.class}")
  .tabs-list
    +each("tabs as tab, idx")
      button(
        class="{activeTab === tab.id ? 'active ' : ''}"
        on:click|preventDefault!="{() => { activeTab = tab.id }}"
        use:efx
        aria-label="{tab.label}"

      ) 
        +if("labels")
          span {tab.label}
        +if("tab.icon")
          i(class="{tab.icon}")
  .tab-content
    +each("tabs as tab")
      +if("tab.id === activeTab && tabComponents[tab.component]")
        svelte:component(this="{tabComponents[tab.component]}" sheet="{sheet}")
</template>

<style lang="sass">
  @import "../../../styles/Mixins.sass"


  :global(.theme-dark .tabs)
    --tabs-list-background: rgba(0,0,0,0.8)
  :global(.tabs)
    --tabs-list-background: rgba(255,255,255,0.8)
  .tabs

    +flex-column
    +flex-group-top
    +border
    height: 100%
    width: 100%

    .tabs-list
      +flex-row
      +flex-space-evenly
      +border-bottom
      +panel-1
      list-style: none
      width: 100%
      margin: 0
      padding: 0.25rem
      height: 100%
      flex: 0

      button
        --button-border-radius: 5px
        --button-line-height: var(--tab-line-height)
        --button-font-size: var(--tab-font-size)
        +button
        text-align: center
        position: relative
        overflow: hidden
        width: 100%
        height: 200%
        margin: -10px 2px
        font-weight: normal
        font-size: larger
        margin-bottom: -10px
        padding: 10px 0
        align-items: end

        &:not(:first-child)
          border-left: none

        &:not(.active)
          &:before
            content: ""
            border-top: 5px solid var(--color-border-highlight)
            position: absolute
            width: 100%
            bottom: -3px
          &:not(:hover)
            &:before
              border-top: 5px ridge brown

        &.active
          &:hover
            background: #f9f9f9
            box-shadow: none
          font-weight: bold
          background: #f9f9f9
          color: var(--dnd5e-color-gold)

  .tab-content
    +flex-column
    flex: 2
    width: 100%
    position: relative
    padding: 1.6rem 0.5rem

  .readonly-overlay
    position: absolute
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: rgba(0, 0, 0, 0.4)
    z-index: 100
    display: flex
    align-items: center
    justify-content: center

  .overlay-message
    background: #fff
    padding: 1rem
    border-radius: 5px
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3)

  button.readonly
    opacity: 0.7
    cursor: not-allowed

    &:hover
      box-shadow: none
      background: inherit
</style>
