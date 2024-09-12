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
      img(src="modules/foundryvtt-actor-studio/assets/actor-studio-blue.svg" alt="{localize('GAS.ActorStudio')}" style="height: 100%; max-height: 50px; border: none; width: auto;")
      p {localize('GAS.Welcome.Message.ThankYou')}
      h1 {localize('GAS.Welcome.Heading.News')}
      p {localize('GAS.Welcome.Message.News')}
      h1 {localize('GAS.Welcome.Heading.Intro')}
      p {localize('GAS.Welcome.Message.Intro')}
      h1 {localize('GAS.Welcome.Heading.Usage')}
      p {localize('GAS.Welcome.Message.Usage1')}
      p {localize('GAS.Welcome.Message.Usage2')}
      p {localize('GAS.Welcome.Message.Usage3')}
      p {localize('GAS.Welcome.Message.Usage4')}
      p {localize('GAS.Welcome.Message.Usage5')}
      h1 {localize('GAS.Welcome.Heading.Help')}
      p 
        span {localize('GAS.Welcome.Message.Usage6')}
        a(href="https://github.com/geoidesic/foundryvtt-actor-studio/issues") gi{localize('GAS.Welcome.Message.github')}thub
      .flexrow.inset.justify-flexrow-vertical(data-tooltip="{localize('GAS.Setting.DontShowWelcome.Hint')}")
        .flex0
          input(type="checkbox" on:change="{handleChange}" label="{localize('GAS.Setting.DontShowWelcome.Name')}" bind:checked="{dontShowWelcome}") 
        .flex
          span {localize('GAS.Setting.DontShowWelcome.Name') }
    footer
      p {localize('GAS.ActorStudio')} {localize('GAS.GAS.Welcome.Message.Sponsored')}
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
