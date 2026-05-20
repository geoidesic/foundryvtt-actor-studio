<script>
  import preventDefault from "~/src/helpers/svelte-actions/PreventDefault.js";

  export let image = void 0;
  export let alt = "";
  export let disabled = false;
</script>

<button on:click on:mousedown={preventDefault} {disabled}>
  <img src={image} alt={alt} />
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
    background: radial-gradient(var(--gas-button-background-highlight, rgba(255, 255, 255, 0.2)), var(--gas-button-background, #f0f0f0));
    clip-path: var(--tjs-icon-button-clip-path-hover, var(--tjs-icon-button-clip-path, none));
  }
</style>
