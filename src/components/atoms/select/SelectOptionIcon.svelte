<script>
  export let option;
</script>

<template lang="pug">
div.option-icon.mr-md.my-xs(class="{option.img ? option.img : ''}")
  +if("option.icon != undefined")
    i(class="{option.icon}")
    +else
      img(src="{option.img}" alt="{option.label} icon")
</template>

<style lang="sass">
.option-icon
  display: inline-block
  flex: 0 0 24px
  width: 24px
  height: 24px
  line-height: 24px
  vertical-align: middle

  img
    display: block
    width: 24px
    height: 24px
    object-fit: cover
    vertical-align: middle
</style>
