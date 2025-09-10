<script>
  // Simple header button that renders an FA icon and calls onPress.
  export let iconClass = '';
  export let title = '';
  export let extraClass = '';
  export let onPress = () => {};

  function handleClick(event) {
    try { onPress({ event }); } catch (_) {}
  }
</script>

<svelte:options accessors={true} />

<template lang="pug">
  //- Match Foundry / TRL header control look
  button.header-control(type="button" class="{extraClass}" data-tooltip="{title}" aria-label="{title}" on:click="{handleClick}")
    i(class="{iconClass}")
</template>

<style lang="sass">
// Ensure the <i> renders with proper spacing
.header-control i
  font-size: 0.9rem
  line-height: 1
</style>
