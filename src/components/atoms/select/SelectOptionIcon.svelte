<script>
  export let option;
</script>

<template lang="pug">
div.option-icon.mr-xs.my-xs(class="{option.img ? option.img : ''}")
  +if("option.icon != undefined")
    i(class="{option.icon}")
    +else
      img(src="{option.img}" alt="<{option.label} icon>")
</template>

<style lang="sass">
.option-icon
  display: inline-block
</style>
