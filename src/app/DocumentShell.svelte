<svelte:options accessors={true} />

<script>
  import { ApplicationShell } from "@typhonjs-fvtt/runtime/svelte/component/core";
  export let elementRoot;
</script>

<ApplicationShell bind:elementRoot />
