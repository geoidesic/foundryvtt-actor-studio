# foundryvtt-actor-studio
A FoundryVTT module for creating Actors
## dnd5e
- The DM / GM can set which compendiums are available to Actor Studio
- Set your Ability Scores using either: point buy, manual entry, standard array or dice rolls
- Preview and select your race, background, class and subclass
- You can preview available advancements by level for class and subclass
- Once your've made your selections, the actor will be created and the advancements triggered for completion
- NB: for the advancements to work you must have the "Disable level-up automation" setting switched off!
- Level Up! as of v1.2.1 this module now supports multi-classing and leveling up. Look for the level up button (only currently available on the dnd5e standard sheet).

## New feature donations
There are [features waiting for funding](https://github.com/geoidesic/foundryvtt-actor-studio/milestone/6).
If you would like to fund these features, you can do so by [donating here](https://github.com/sponsors/geoidesic?frequency=one-time), just include the feature # number in your reference, or hit me up on Discord (geoidesic).

## Credits
- https://github.com/HeroCreationLab/hero-creation-tool (by ccjmk on discord) was the original inspiration for Actor Studio and the development of Actor Studio as a spiritual successor to Hero Creation Tool has been blessed by that original creator. Actor Studio still contains some of the excellent original code from HCT, where it wasn't necesarry to refactor it for Svelte reactivity. This footprint may change over time but as of writing:
  - the module settings application and config
  - the button creation code for the main buttons in the sidebar and new actor dialog
  - some of the indexing code for fetching items from compendia
  - and of course the visual layout is not dissimilar to the original
