<script>
  import { onMount } from "svelte";

  export let progress;
  

  $: cssClass = $progress == 0 ? "center" : "";
  

</script>

<template lang="pug">
  .component
    .progress-bar(class="{cssClass}")
      .outer
        .progress-bar(style="width: {$progress}%")
      .inner
        .center {$progress}% Complete
</template>

<style lang="sass">
  @import '../../../styles/Mixins.scss'

  .progress-bar
    width: 100%
    background-color: #e0e0e0
    border-radius: 5px
    position: relative
    display: flex
    .inner
      align-items: center
      justify-content: center
      mix-blend-mode: multiply
      width: 100%

    .outer .progress-bar
      position: absolute
      height: 100%
      width: 0
      background-color: rgba(10, 144, 50, 0.5)
      border-radius: 5px
      transition: width 0.5s

</style>
