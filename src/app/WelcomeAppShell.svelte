<script>
  import { onMount, getContext } from "svelte";
  import { fade, scale }        from 'svelte/transition';
  import { ApplicationShell }   from '#runtime/svelte/component/core';
  import { localize } from "#runtime/svelte/helper";
  import { MODULE_ID } from "~/src/helpers/constants";

  export let elementRoot = void 0;
  export let version = void 0;

  const application = getContext('#external').application;

  const handleChange = (event) => {
    alert('changed')
    game.settings.set(MODULE_ID, 'dontShowWelcome', event.target.checked);
  }


  let draggable = application.reactive.draggable;
  draggable = true

  $: application.reactive.draggable = draggable;
  $: dontShowWelcome = game.settings.get(MODULE_ID, 'dontShowWelcome');

  onMount(async () => {
  });
  
</script>

<svelte:options accessors={true}/>

<template lang="pug">
  ApplicationShell(bind:elementRoot)
    main
      img(src="modules/foundryvtt-actor-studio/assets/actor-studio-blue.svg" alt="Actor Studio" style="height: 100%; max-height: 50px; border: none; width: auto;")
      p Thank you for using Actor Studio!
      h1 Introduction
      p NB: <strong>Actor Studio</strong> is only currently intended for creating Level 1 player characters. This functionality will be expanded in the future.
      h1 Usage Instructions
      p To create your character, work your way through the tabs and select from the options available. You can always go back and change your choices. Use this as a way to preview what each choice does to your character.
      p Once you are happy with your character, click the "Create Character" button to create your character in Foundry VTT.
      p At this point the Actor will be created and then the Advancement workflows will begin, where you select the various advancements for each choice you've made for your character (e.g. languages, skills, etc.).
      h1 Help
      p 
        span If you have any issues, please report them on the 
        a(href="https://github.com/geoidesic/foundryvtt-actor-studio/issues") github
        span &nbsp;page.
      .flexrow.inset.justify-flexrow-vertical(data-tooltip="{localize('GAS.Setting.DontShowWelcome.Hint')}")
        .flex0
          input(type="checkbox" on:change="{handleChange}" label="{localize('GAS.Setting.DontShowWelcome.Name')}" bind:checked="{dontShowWelcome}") 
        .flex
          span {localize('GAS.Setting.DontShowWelcome.Name') }
    footer
      p Actor Studio is sponsored by 
      a(href="https://www.round-table.games") Round Table Games

</template>

<style lang="sass">
  @import "../styles/Mixins.scss"

  main
    @include inset
    overflow-y: auto
    margin-bottom: 5em

  footer
    position: fixed
    bottom: 0
    left: 0
    right: 0
    background-color: #333
    color: white
    text-align: center
    padding: 1em
    font-size: 0.8em
    a
      color: white
      text-decoration: underline
      &:hover
        color: #ccc
</style>
