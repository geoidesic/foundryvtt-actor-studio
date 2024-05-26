<script>
import { getContext, onDestroy, onMount, tick } from "svelte";

export let advancement = null;

onMount(async () => {
  console.log('advancement'+advancement.type, advancement)

});

</script>

<template lang="pug">

</template>

<style lang="sass">

</style>