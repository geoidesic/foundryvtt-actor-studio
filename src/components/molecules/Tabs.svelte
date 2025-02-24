<script>
  import preventDefault from "~/src/helpers/svelte-actions/PreventDefault.js";
  import { ripple } from "@typhonjs-fvtt/runtime/svelte/action/animate";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { log } from "~/src/helpers/Utility";
  import { dropItemRegistry } from "~/src/helpers/store";

  export let tabs = [];
  export let sheet;
  export let activeTab = void 0;
  export let efx = ripple();

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
    initialTabs = tabs;
    for (const tab of tabs) {
      const module = await import(`~/src/components/organisms/dnd5e/Tabs/${tab.component}.svelte`);
      tabComponents[tab.component] = module.default;
    }
  });
  
  // Subscribe to the currentProcess to know when advancements are active
  $: isAdvancementInProgress = $dropItemRegistry.currentProcess;
  $: isAdvancementTab = activeTab === 'advancements';
</script>

<!--List of tabs-->
<div class="tabs {$$restProps.class}">
  <!--Tab List-->
  <div class="tabs-list">
    <!--For each tab-->
    {#each tabs as tab, idx}
      <button
        class="{activeTab === tab.id ? 'active ' : ''} {isAdvancementInProgress && !isAdvancementTab ? 'readonly' : ''}"
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
    {#if isAdvancementInProgress && !isAdvancementTab}
      <div class="readonly-overlay">
        <div class="overlay-message">
          Please complete your advancements before making other changes
        </div>
      </div>
    {/if}
    {#each tabs as tab}
      {#if tab.id === activeTab && tabComponents[tab.component]}
        <svelte:component this={tabComponents[tab.component]} {sheet} />
      {/if}
    {/each}
  </div>
</div>

<style lang="scss">
  @import "../../../styles/Mixins.scss";

  .tabs {
    @include flex-column;
    @include flex-group-top;
    @include border;
    height: 100%;
    width: 100%;

    .tabs-list {
      @include flex-row;
      @include flex-space-evenly;
      @include border-bottom;
      @include panel-1;
      list-style: none;
      width: 100%;
      margin: 0;
      padding: 0.25rem;
      height: 100%;
      flex: 0;

      button {
        --button-border-radius: 5px;
        --button-line-height: var(--tab-line-height);
        --button-font-size: var(--tab-font-size);
        @include button;
        position: relative;
        overflow: hidden;
        width: 100%;
        height: 200%;
        margin: -10px 2px;
        font-weight: normal;
        font-size: larger;
        margin-bottom: -10px;
        padding: 10px 0;
        align-items: end;

        &:not(:first-child) {
          border-left: none;
        }

        &:not(.active) {
          &:before {
            content: "";
            border-top: 5px solid var(--color-border-highlight);
            position: absolute;
            width: 100%;
            bottom: 5px;
          } 
          &:not(:hover) {
            &:before {
              border-top: 5px solid brown;
            }
          }
        }

        &.active {
          &:hover {
            background: #f9f9f9;
            box-shadow: none;
          }
          font-weight: bold;
          background: #f9f9f9;
          color: var(--dnd5e-color-gold)
        }
      }
    }
  }


  .tab-content {
    @include flex-column;
    flex: 2;
    width: 100%;
    position: relative;
  }

  .readonly-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .overlay-message {
    background: #fff;
    padding: 1rem;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  }

  button.readonly {
    opacity: 0.7;
    cursor: not-allowed;

    &:hover {
      box-shadow: none;
      background: inherit;
    }
  }
</style>
