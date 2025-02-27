# foundryvtt-actor-studio
A FoundryVTT module for creating Actors 

## New feature donations
There are [features waiting for funding](https://github.com/geoidesic/foundryvtt-actor-studio/milestone/6).
If you would like to fund these features, you can do so by [donating here](https://github.com/sponsors/geoidesic?frequency=one-time), just include the feature # number in your reference, or hit me up on Discord (geoidesic).

## Player permissions
Actor Studio is most useful for players to create their own characters. To enable this, you must give your players the `Create New Actors` permission. Probably you should assign this to `Trusted Players` only.

## dnd5e
- Supports both dnd5e v3.x and v4.x
- The DM / GM can set which compendiums are available to Actor Studio
- Set your Ability Scores using either: point buy, manual entry, standard array or dice rolls
- Preview and select your race, background, class and subclass
- You can preview available advancements by level for class and subclass
- Once your've made your selections, the actor will be created and the advancements triggered for completion
- NB: for the advancements to work you must have the "Disable level-up automation" setting switched off!
- Level Up! as of v1.2.1 this module now supports multi-classing and leveling up. Look for the level up button
- Supports standard dnd5e (v3+) character sheet
- Supports [Tidy5eSheet](https://github.com/kgar/foundry-vtt-tidy-5e-sheets) 
- Supports Subclass Advancements and selection in dnd5e (system v3.x) where this wasn't something available in the 3.x system. This is effectively a smoke & mirrors backport of the functionality available in dnd5e system v4.x
- Also supports Subclass selection for dnd5e system v4.x

## SRD Screenshots
![ability-score-generation-tab](https://github.com/user-attachments/assets/c651d816-7a61-48e8-a12b-1431b5fdf4ea)
![race-tab](https://github.com/user-attachments/assets/691a9da9-1ebf-4c0a-8f4e-001c9a325fb5)
![background-tab](https://github.com/user-attachments/assets/7ae21506-4b96-4471-a192-bc4718ab7b6f)
![class-and-subclass-tab](https://github.com/user-attachments/assets/841db4d3-bed0-4405-b883-96c954b570ae)
![advancements-tab](https://github.com/user-attachments/assets/a5e10640-fa5e-4ad3-9122-78204a437d40)
![tidy5e-sheet-level-up](https://github.com/user-attachments/assets/6ea020df-7533-4a75-b1f6-1e152927d355)
![default-sheet-level-up](https://github.com/user-attachments/assets/5d0dace6-7148-41ab-b8a3-44e2e05eeca5)

## Credits
- https://github.com/HeroCreationLab/hero-creation-tool (by ccjmk on discord) was the original inspiration for Actor Studio and the development of Actor Studio as a spiritual successor to Hero Creation Tool has been blessed by that original creator. Actor Studio still contains some of the excellent original code from HCT, where it wasn't necesarry to refactor it for Svelte reactivity. This footprint may change over time but as of writing:
  - the module settings application and config
  - the button creation code for the main buttons in the sidebar and new actor dialog
  - some of the indexing code for fetching items from compendia
  - and of course the visual layout is not dissimilar to the original
