<script>
  import { onMount, getContext } from "svelte";
  import { fade, scale }        from 'svelte/transition';
  import { ApplicationShell }   from '#runtime/svelte/component/core';
  import { localize } from "~/src/helpers/Utility";
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
      .inset
        .flexrow.justify-flexrow-vertical
          .flex2
            img(src="modules/foundryvtt-actor-studio/assets/actor-studio-blue.svg" alt="Actor Studio" style="height: 100%; max-height: 50px; border: none; width: auto;")
          .flex3
            p.thanks Thank you for using Actor Studio!
        h1 {localize("Welcome.IntroductionTitle")}
        p {localize("Welcome.Introduction")}
        a(href="https://github.com/geoidesic/foundryvtt-actor-studio?tab=readme-ov-file#usage-instructions") {localize("Welcome.UsageTitle")}
        p.lighter
          i.fa-solid.fa-bug.mr-sm
          | {localize('Welcome.Issues')} <a href="https://github.com/geoidesic/foundryvtt-actor-studio/issues"> {localize('Welcome.IssuesLinkText')} </a>
        p 
          i.fa-solid.fa-heart.mr-sm(style="color: #660000;")
          | {localize('Welcome.Support')} <a href='https://github.com/sponsors/geoidesic'> {localize('Welcome.SponsorLinkText')} </a> or <a href='https://https://paypal.me/geoidesic'>PayPal</a>
        
        p 
          i.fa-solid.fa-star.mr-sm(style="color: #996600;")
          | {localize('Welcome.JoinDiscord')} <a href='https://discord.gg/sQgVnSGRUj'> {localize('Welcome.DiscordLinkText')} </a>
      .flexrow.justify-flexrow-vertical(data-tooltip="{localize('Setting.DontShowWelcome.Hint')}")
        .flex0
          input(type="checkbox" on:change="{handleChange}" label="{localize('Setting.DontShowWelcome.Name')}" bind:checked="{dontShowWelcome}") 
        .flex.dont-show
          span {localize('Setting.DontShowWelcome.Name') }
    footer
      div.right.bg-green
        a(href="https://www.aardvark.games")
          img.white(src="/systems/foundryvtt-final-fantasy/assets/aardvark-logo.webp" alt="Aardvark Game Studios Logo" height="50" width="50" style="fill: white; border: none; width: auto;")
      div.left
        div {localize("Title")} {localize("Welcome.CreatedBy")} 
        //- a(href="https://www.round-table.games") Round Table Games
        a(href="https://www.aardvark.games") Aardvark Game Studios
    

</template>

<style lang="sass">
  @import "../styles/Mixins.scss"

  main
    overflow-y: auto
    i
      margin-right: 0.5em
    .inset
      @include inset
  .dont-show
    font-size: smaller

  p.thanks
    font-size: 1.2em
    font-weight: bold

  footer
    border-top: 8px ridge var(--border-shadow)
    display: grid
    grid-template-columns: 2fr 4fr
    position: fixed
    bottom: 0
    align-items: center
    gap: 1em
    line-height: 2em
    left: 0
    right: 0
    background-color: #333
    color: white
    padding: 1em
    font-size: 0.8em
    z-index: 3
    a
      color: white
      text-decoration: underline
      &:hover
        color: #ccc

  
</style>
