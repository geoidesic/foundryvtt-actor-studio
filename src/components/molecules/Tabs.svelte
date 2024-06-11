<script>
  import preventDefault from "~/src/helpers/svelte-actions/PreventDefault.js";
  import { ripple } from "@typhonjs-fvtt/runtime/svelte/action/animate";
    import { log } from "../../helpers/Utility";

  // List of tabs
  export let tabs = [];
  // type of sheet
  export let sheet;
  export let importPath = '';

  // The active tab
  export let activeTab = void 0;
  export let efx = ripple();

  const importComponent = async (componentName) => {
    const { default: Component } = await import( /* @vite-ignore */`${importPath}${componentName}.svelte`);
    return Component;
  };
</script>

<!--List of tabs-->
<div class="tabs {$$restProps.class}">
  <!--Tab List-->
  <div class="tabs-list">
    <!--For each tab-->
    {#each tabs as tab, idx}
      <button
        class={activeTab === tab.id ? "active " : ""}
        on:click={() => {
          activeTab = tab.id;
        }}
        on:mousedown={preventDefault}
        use:efx
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <!--Tab Content-->
  <div class="tab-content">
    {#each tabs as tab}
      {#if tab.id === activeTab}
        {#if typeof tab.component === 'object'}
        <svelte:component this={tab.component} />
        {/if}
        {#if typeof tab.component === 'string' && importPath}
          {#await importComponent(tab.component)}
            <i class="spinner fas fa-circle-notch fa-spin"></i>
          {:then Component}
            <svelte:component this={Component} />
          {:catch error}
            <p>Error loading component: {error.message}</p>
          {/await}
        {/if}
      {/if}
    {/each}
  </div>
</div>

<style lang="sass">
  @import "../../../styles/Mixins.scss"

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
        position: relative
        overflow: hidden
        width: 100%
        height: 200%
        margin: -10px 2px
        font-weight: normal
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
            bottom: 5px
  
          &:not(:hover)
            &:before
              border-top: 5px solid brown
  
        &.active
          &:hover
            background: #f9f9f9
            box-shadow: none
          background: #f9f9f9
  
  .tab-content
    position: relative
    +flex-column
    flex: 2
    width: 100%
  
  .spinner
    position: absolute
    top: 50%
    left: 50%
    transform: translate(-50%, -50%)
    font-size: 2rem
    color: var(--color-highlight)
  
</style>
