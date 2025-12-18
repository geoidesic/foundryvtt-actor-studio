<script>
  import preventDefault from "~/src/helpers/svelte-actions/PreventDefault.js";
  import { ripple } from "@typhonjs-fvtt/standard/action/animate/composable";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { dropItemRegistry } from "~/src/stores/index";

  // Import all tab components statically
  import Race from "~/src/components/organisms/dnd5e/Tabs/Race.svelte";
  import Class from "~/src/components/organisms/dnd5e/Tabs/Class.svelte";
  import Background from "~/src/components/organisms/dnd5e/Tabs/Background.svelte";
  import Abilities from "~/src/components/organisms/dnd5e/Tabs/Abilities.svelte";
  import Equipment from "~/src/components/organisms/dnd5e/Tabs/Equipment.svelte";
  import Spells from "~/src/components/organisms/dnd5e/Tabs/Spells.svelte";
  import Advancements from "~/src/components/organisms/dnd5e/Tabs/Advancements.svelte";
  import LevelUp from "~/src/components/organisms/dnd5e/Tabs/LevelUp.svelte";
  import ShopTab from "~/src/components/organisms/dnd5e/Tabs/ShopTab.svelte";
  import StartingWealthChoice from "~/src/components/molecules/dnd5e/StartingWealthChoice.svelte";
  import Biography from "~/src/components/organisms/dnd5e/Tabs/Biography.svelte";

  export let tabs = [];
  export let sheet;
  export let activeTab = void 0;
  export let efx = ripple();

  // Map component names to their imported classes
  const componentMap = {
    Race,
    Class,
    Background,
    Abilities,
    Equipment,
    Spells,
    Advancements,
    LevelUp,
    ShopTab,
    StartingWealthChoice,
    Biography
  };

  let initialTabs = [];
  let tabComponents = {};

  // Load tab components from the static map
  $: if(initialTabs !== tabs) {
    initialTabs = tabs;
    for (const tab of tabs) {
      const Component = componentMap[tab.component];
      if (Component) {
        tabComponents[tab.component] = Component;
      } else {
        window.GAS?.log?.w(`Tab component ${tab.component} not found in componentMap`);
      }
    }
  }
</script>

<!--List of tabs-->
<div class="tabs {$$restProps.class}">
  <!--Tab List-->
  <div class="tabs-list">
    <!--For each tab-->
    {#each tabs as tab, idx}
      <button
        class="{activeTab === tab.id ? 'active ' : ''}"
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
      {#if tab.id === activeTab && tabComponents[tab.component]}
        {#if tab.component === 'StartingWealthChoice'}
          <svelte:component this={tabComponents[tab.component]} on:confirm on:edit />
        {:else}
          <svelte:component this={tabComponents[tab.component]} {sheet} />
        {/if}
      {/if}
    {/each}
  </div>
</div>

<style lang="scss">
  @import "../../../styles/Mixins.sass";

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
