<script>
  import preventDefault from "~/src/helpers/svelte-actions/PreventDefault.js";
  import { ripple } from "@typhonjs-fvtt/runtime/svelte/action/animate";

  // List of tabs
  export let tabs = [];
  // type of sheet
  export let sheet;

  // The active tab
  export let activeTab = void 0;

  export let efx = ripple();
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
        <svelte:component this={tab.component} {sheet} />
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
          background: #f9f9f9;
        }
      }
    }
  }


  .tab-content {
    @include flex-column;
    flex: 2;
    width: 100%;
  }
</style>
