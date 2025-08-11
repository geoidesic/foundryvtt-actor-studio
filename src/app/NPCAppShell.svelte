<script>
  import { ApplicationShell } from '@typhonjs-fvtt/runtime/svelte/component/application';
  import { setContext, getContext, onMount, onDestroy } from "svelte";
  import { MODULE_ID } from "~/src/helpers/constants";

  export let elementRoot; //- passed in by SvelteApplication
  export let documentStore; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body
  export let document; //- passed in by DocumentSheet.js where it attaches DocumentShell to the DOM body

  //- register hooks
  console.log('[PCAPP] Registering gas.close hook (once)');
  Hooks.once("gas.close", gasClose);
  
  setContext("#doc", documentStore);
  const application = getContext('#external').application;

  $: stylesApp = {
    '--tjs-app-overflow': 'visible',
    '--illuminated-initial-height': illuminatedHeight,
    '--illuminated-initial-width': illuminatedWidth
  };

  onMount(async () => {

  });

</script>