```mermaid
sequenceDiagram
    participant User
    participant Footer.svelte
    participant workflow.js
    participant Foundry VTT API

    User->>+Footer.svelte: Clicks "Add Equipment"
    Footer.svelte->>+workflow.js: Calls handleAddEquipment()
    workflow.js->>workflow.js: loop For each selected equipment item
    workflow.js->>+Foundry VTT API: Item.create(itemData, { parent: actor })
    Foundry VTT API-->>-workflow.js: Returns created item
    end
    alt Shop is disabled
        workflow.js->>+Foundry VTT API: actor.update({ "system.currency.gp": ... })
        Foundry VTT API-->>-workflow.js: 
        workflow.js->>workflow.js: Hooks.call("gas.close")
    else Shop is enabled
        workflow.js->>Footer.svelte: Updates tabs to show "Shop"
    end
    workflow.js-->>-Footer.svelte: 
    Footer.svelte-->>-User: UI updates, equipment/gold added
```
