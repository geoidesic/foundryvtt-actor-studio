<script>
  import { getContext } from 'svelte';
  const documentStore = getContext('#doc');
  $: actor = $documentStore;

  $: effects = Array.from(actor?.effects ?? []);

  async function toggle(effect){
    try { await effect.update?.({ disabled: !effect.disabled }); }
    catch(err){ console.warn('Failed toggling effect', err); }
  }
</script>

<template lang="pug">
  section
    +if("!effects || effects.length === 0")
      p (no effects)
    +if("effects && effects.length > 0")
      ul.effects
        +each("effects as e")
          li
            img.icon(src="{e.icon || e.img || 'icons/svg/aura.svg'}" alt="{e.label}")
            span.name {e.label}
            span.state {e.disabled ? 'Disabled' : 'Active'}
            button.small(on:click!="{() => toggle(e)}") {e.disabled ? 'Enable' : 'Disable'}
</template>

<style lang="sass">
section
  padding: .25rem
ul.effects
  list-style: none
  padding: 0
  margin: 0
  li
    display: grid
    grid-template-columns: 22px 1fr auto auto
    align-items: center
    gap: 6px
    padding: 3px 0
  .icon
    width: 20px
    height: 20px
    border-radius: 2px
    object-fit: cover
  .name
    font-weight: 500
  .small
    font-size: .8rem
    padding: 2px 6px
</style>
