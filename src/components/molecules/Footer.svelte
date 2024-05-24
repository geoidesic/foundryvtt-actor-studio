<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { MODULE_ID } from "~/src/helpers/constants";

  export let value = null;

  const actor = getContext("#doc");

  $: value = $actor?.name || '';
  $: tokenValue = $actor?.flags?.[MODULE_ID]?.tokenName || value ;

  const handleNameInput = (e) => {
    $actor.name = e.target.value;
    console.log($actor)
  }
  const handleTokenNameInput = (e) => {
    console.log(e.target.value);
    if(!$actor.flags[MODULE_ID]) $actor.flags[MODULE_ID] = {};
    $actor.flags[MODULE_ID].tokenName = e.target.value;
    console.log($actor)
  }

</script>

<template lang="pug">
  .flexrow.gap-10
    .flex2
      .flexcol
        .flexrow.gap-10
          .flex1.right.mt-xs
            label Character Name
          .flex2
            input.left(type="text" value="{value}" on:input="{handleNameInput}")
        .flexrow.gap-10
          .flex1.right.mt-xs
            label Token Name
          .flex2
            input.left(type="text" value="{tokenValue}" on:input="{handleTokenNameInput}")
    .flex1
      button(type="button" role="button") Create
</template>


<style lang="sass">
.gap-10
  gap: 10px
label
  margin: 10px 0 0 0
</style>