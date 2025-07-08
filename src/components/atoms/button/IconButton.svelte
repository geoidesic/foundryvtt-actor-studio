<script>
  import preventDefault from "~/src/helpers/svelte-actions/PreventDefault.js";

  export let icon = void 0;
  export let disabled = false;
</script>

<button on:click on:mousedown={preventDefault} {disabled}>
  <div><i class={icon} /></div>
</button>

<style lang="scss">
  @import "../../../../styles/Mixins.sass";
  button {
    @include icon-button;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    clip-path: var(--tjs-icon-button-clip-path, none);
    transform-style: preserve-3d;
  }

  button:hover {
    background: radial-gradient(var(--button-background-highlight), var(--button-background));
    clip-path: var(--tjs-icon-button-clip-path-hover, var(--tjs-icon-button-clip-path, none));
  }
</style>
