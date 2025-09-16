<svelte:options accessors={true} />

<script>
  import { TJSProseMirror } from "@typhonjs-fvtt/standard/component/fvtt/editor";
  import { getContext } from "svelte";

  export let content = "";
  export let attr = "";
  export let classes = "";
  export let editable = true;
  export let inMemory = false; // Flag to handle in-memory actors vs documents


  const doc = getContext("#doc");
  
  // console.log("ProseMirror component mounting, doc:", $doc, "attr:", attr);

  function doSomethingWithEnrichedContent(event) {
    // console.log(`! event - editor:enrichedContent - ${event.detail.enrichedContent}`)
  }

  function handleSave(event) {
    if (inMemory && $doc) {
      // For in-memory actors, use updateSource to save changes
      const newContent = event.detail.content;
      // console.log(`Saving in-memory content for ${attr}:`, newContent);
      
      // Update the actor's data directly using updateSource
      import("~/src/helpers/Utility").then(({ updateSource }) => {
        const updateData = {};
        updateData[attr] = newContent;
        updateSource($doc, updateData);
      });
    }
    
    // console.log(`! event - editor:save - ${event.detail.content}`);
  }



  /**
   * You can set a document to load / save content from given a `fieldName` in the format of `a.b.c`.
   * When you set a document you can also enable collaboration.
   *
   * The simplest example is:
   *
   * <TJSProseMirror options={{document: <doc>, fieldName: 'some.data.path'}} />
   */
  // Create reactive options that update when doc or attr changes
  $: options = {
    document: $doc, // Always pass the document
    fieldName: attr, // Always use the real field path for reading content
    button: true,      // Show edit button to launch editor when hovered
    classes: classes ? [classes] : undefined,   // Convert string to array for classes
    clickToEdit: true,  // Clicking editor content initializes the editor
    editable,   // Enable / disable editing
  };

  /**
   * Just an example that you can also bind the content / enrichedContent. You can also bind Svelte stores.
   */
  let enrichedContent;

  // $: if (content) {
  //   console.log(`! bound content changed: ${content}`);
  // }
  // $: if (enrichedContent) {
  //   console.log(`! bound enrichedContent changed: ${enrichedContent}`);
  // }
</script>

<TJSProseMirror
  {options}
  {...$$restProps}
  bind:content
  bind:enrichedContent
  on:editor:cancel={() => console.log("! event - editor:cancel")}
  on:editor:enrichedContent={doSomethingWithEnrichedContent}
  on:editor:save={handleSave}
  on:editor:start={() => console.log("! event - editor:start")}
/>

<style>
  /* Force ProseMirror to be tall */
  :global(.ProseMirror) {
    height: 600px !important;
    min-height: 600px !important;
    max-height: none !important;
  }
  
  :global(.editor) {
    height: 600px !important;
    min-height: 600px !important;
    max-height: none !important;
  }
  
  :global(.tjs-prosemirror) {
    height: 600px !important;
    min-height: 600px !important;
    max-height: none !important;
  }
</style>
