<script>
  import { readOnlyTabs } from "~/src/stores/index";
  
  // Props for customizing the layout
  export let title = "";
  export let showTitle = false; // Hide title by default
  export let tabName = ""; // For read-only checking
  export let leftPanelClass = ""; // Additional classes for left panel
  export let rightPanelClass = ""; // Additional classes for right panel
  export let contentClass = ""; // Additional classes for content wrapper

  // Check if this tab is readonly
  $: isDisabled = tabName && $readOnlyTabs.includes(tabName);
</script>

<template lang="pug">
.content(class="{contentClass}")
  +if("showTitle")
    h1.center.mt-none.hide {title}
  .flexrow.relative.tall
    .flex2.pr-sm.col-a(class="{leftPanelClass}")
      slot(name="left")
    .flex0.border-right.right-border-gradient-mask.divider
    .flex3.left.pl-md.scroll.col-b(class="{rightPanelClass}")
      hr.vertical
      slot(name="right")
</template>

<style lang="sass" scoped>
@use "../../../styles/Mixins.sass" as mixins

.content 
  container-type: inline-size
  +mixins.staticOptions

  .divider
    height: 100%
    position: relative

  .col-a
    // max-width: 325px
  .vertical

@container (width < 497px) 
  .divider
    display: none
  .vertical
    display: block
    margin-top: 0
    padding-top: 0
    margin-bottom: 2.5rem

</style>
