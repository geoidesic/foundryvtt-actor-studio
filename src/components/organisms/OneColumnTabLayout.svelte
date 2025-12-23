<script>
  import { setContext } from "svelte";
  import { tabDisabled } from "~/src/stores/index";
  
  // Props for customizing the layout
  export let title = "";
  export let showTitle = false; // Hide title by default
  export let tabName = ""; // For read-only checking
  export let leftPanelClass = ""; // Additional classes for left panel
  export let rightPanelClass = ""; // Additional classes for right panel
  export let contentClass = ""; // Additional classes for content wrapper

</script>

<template lang="pug">
div.content(class="{contentClass}")
  +if("showTitle")
    h1.center.mt-none.hide {title}
  .flexrow
    .flex3.left.pl-md.scroll.col-b(class="{rightPanelClass}")
      slot(name="right")

  +if("$tabDisabled")
    .overlay
</template>

<style lang="sass" scoped>
@use "../../../styles/Mixins.sass" as mixins



.content 
  +mixins.staticOptions

  .col-a
    // max-width: 325px

  
  .overlay
    position: absolute
    top: 0
    left: 0
    right: 0
    bottom: 0
    pointer-events: all
    cursor: not-allowed
    z-index: 100
    transition: background-color 0.2s ease
    &:hover
      background-color: rgba(200, 200, 200, 0.1)
</style>
