<script>
  import { onMount, getContext } from "svelte";
  import { fade, scale }        from 'svelte/transition';
  import { ApplicationShell }   from '#runtime/svelte/component/core';

  export let elementRoot = void 0;
  export let version = void 0;

  const application = getContext('#external').application;


  let draggable = application.reactive.draggable;
  draggable = true

  $: application.reactive.draggable = draggable;
</script>

<svelte:options accessors={true}/>

<template lang="pug">
  ApplicationShell(bind:elementRoot)
    main
      img(src="modules/foundryvtt-actor-studio/assets/actor-studio-blue.svg" alt="Actor Studio" style="height: 100%; max-height: 50px; border: none; width: auto;")
      p Thank you for using Actor Studio!
    footer Actor Studio is sponsored by 
        a(href="https://www.round-table.games") Round Table Games

</template>

<style lang="sass">

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
