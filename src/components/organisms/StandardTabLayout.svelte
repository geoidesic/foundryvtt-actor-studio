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
div.content(class="{contentClass}")
  +if("showTitle")
    h1.center.mt-none.hide {title}
  .flexrow
    .flex2.pr-sm.col-a(class="{leftPanelClass}")
      slot(name="left")
    .flex0.border-right.right-border-gradient-mask
    .flex3.left.pl-md.scroll.col-b(class="{rightPanelClass}")
      slot(name="right")
</template>

<style lang="sass" scoped>
@use "../../../styles/Mixins.sass" as mixins

.content 
  +mixins.staticOptions

  .col-a
    // max-width: 325px
</style>
