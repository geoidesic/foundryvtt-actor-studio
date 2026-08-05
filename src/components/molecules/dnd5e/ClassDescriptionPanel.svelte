<script>
  import RichDescription from "~/src/components/atoms/dnd5e/RichDescription.svelte";

  export let html = "";
</script>

<template lang="pug">
RichDescription(html="{html}")
</template>
