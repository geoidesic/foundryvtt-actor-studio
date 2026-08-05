<script>
  export let html = "";
</script>

<template lang="pug">
.description-fill.mt-sm
  | {@html html}
</template>

<style lang="sass">
  .description-fill
    overflow-y: auto
    font-size: smaller
    :global(img)
      max-width: 100%
      height: auto
</style>
