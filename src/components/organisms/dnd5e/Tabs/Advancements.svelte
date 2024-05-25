<script>
  import { onMount } from 'svelte';

  onMount(() => {
    Hooks.call('gas.renderAdvancement');
  });
</script>


<template lang="pug">
.content
    
</template>

<style lang="sass">
.content
  padding: 1rem

:global(.gas-advancements)
  display: inline
  

</style>