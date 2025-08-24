<script>
  import { TJSProseMirror } from "@typhonjs-fvtt/standard/component/fvtt/editor";
  
  let content = "Test content";
  let enrichedContent = "";
  
  const options = {
    button: true,
    clickToEdit: true,
    editable: true
  };
</script>

<div>
  <h3>ProseMirror Test</h3>
  <TJSProseMirror
    {options}
    bind:content
    bind:enrichedContent
    on:editor:cancel={() => console.log("! event - editor:cancel")}
    on:editor:enrichedContent={(event) => console.log("! event - editor:enrichedContent", event.detail.enrichedContent)}
    on:editor:save={(event) => console.log("! event - editor:save", event.detail.content)}
    on:editor:start={() => console.log("! event - editor:start")}
  />
  
  <div>
    <p>Content: {content}</p>
    <p>Enriched: {@html enrichedContent}</p>
  </div>
</div>
