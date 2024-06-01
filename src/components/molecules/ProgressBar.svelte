<script>
  import { onMount } from "svelte";

  export let progress;
  

  $: cssClass = $progress == 0 ? "center" : "";
  

</script>

<template lang="pug">
  .component
    .progress-bar(class="{cssClass}")
      +if("$progress == 0")
        .flexrow
          .flex.progress-text progress
      .progress-bar-inner(style="width: {$progress}%")
</template>

<style lang="sass">
  @import '../../../styles/Mixins.scss'

  .progress-bar
    width: 100%
    background-color: #e0e0e0
    border-radius: 5px
    position: relative
    display: flex
    &.center
      align-items: center
      justify-content: center

    .progress-bar-inner
      height: 25px
      width: 0
      background-color: #76c7c0
      border-radius: 5px
      transition: width 0.5s

</style>
