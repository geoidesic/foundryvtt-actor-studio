<script lang="ts">
	import { offset, flip, shift } from "svelte-floating-ui/dom";
	import { createFloatingActions } from "svelte-floating-ui";
  
	const [ floatingRef, floatingContent ] = createFloatingActions({
	  strategy: "absolute",
	  placement: "bottom",
	  middleware: [
		offset(6),
	  ]
	});
  
	let showTooltip: boolean = false;
  </script>
  
  <button
	on:mousedown={() => showTooltip = true}
	on:mouseup={() => showTooltip = false}
	use:floatingRef
  >Hover me</button>
  
  {#if showTooltip}
	<div style="position:absolute" use:floatingContent>
	  Tooltip
	</div>
  {/if}