The UI provides selects to choose which items to drop on the actor sheet. We register these to the dropItemRegistry in Footer.svelte.

The dropItemRegistry is a store that includes that data plus a queue handler.

When the Create button is clicked, we trigger the queueHandler with dropItemRegistry.advanceQueue

advanceQueue is expected to fulfill these functions:

-  Stop if the queue is completed
-  prepareItemForDrop (which processes the item as necessary for the drophandler to understand it)
- dropItemOnCharacter. This will cause the dnd5e system to open an advancements dialog (if there are advancements for that item)
-  based on settings decide whether to capture advancements or not using skipDomMove
-  if skipping then continue with the queue
-  if capturing, then check if the activeTab is 'advancements', if not, then add the tab if it's missing and activate the tab
-  The advancement tab will call the gas.renderAdvancement hook onMount. The listener for that is in src/index.js, which gets the currentProcess from dropItemRegistry. If it exists, then it uses jquery to capture the advancement dialog and move it into Actor Studio's scope in the DOM. This is done to make the UX less fragmented and more curated.
- That only works when initialising the advancements tab. Other advancements in the queue are handled by the `renderAdvancementManager` listener in src/index.js which is called by dnd5e when rendering the advancement dialog. Therein we once more process the cature via calling the renderAdvancement with some other side effects that are important but beyond the scope of this description
- advanceQueue then processes a timeout to prevent any race conditions during the capture (there might be a better way to avoid them but I couldnt find it) after which is calls the closeAdvancementManager hook, which will use the DOM to evaluate whether its time to close the Actor Studio. It does this by detecting whether the dialog is present in the Advancements tab. We do this because its a short-hand way of knowing when the advancement process is complete. There may be a better way via the dnd5e system's AdvancementManager's API, which you can investigate in FoundryVTT-Data-12/Data/systems/dnd5e, however, I suggest we solve one problem at a time to avoid multiplicity of bugs.
- the closeAdvancementManager listener also has a setTimeout to avoid closing the Actor Studio during the moment when one advancment dialog (which incidentallyl has it's own state machine built into dnd5e system) closes and the next one opens and is captured. Again there may be a more reliable way to manage that but I couldn't find it.

