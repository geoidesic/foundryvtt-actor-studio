# [foundryvtt-actor-studio](https://foundryvtt.com/packages/foundryvtt-actor-studio)
A FoundryVTT module for creating Actors. Join the community on [Discord](https://discord.gg/sQgVnSGRUj).

## New feature donations
There are [features waiting for funding](https://github.com/geoidesic/foundryvtt-actor-studio/milestone/6).
If you would like to fund these features, you can do so by [donating here](https://github.com/sponsors/geoidesic?frequency=one-time), just include the feature # number in your reference, or hit me up on Discord (geoidesic).

# Coming soon
These are scheduled for work imminently: [Upcoming](https://github.com/geoidesic/foundryvtt-actor-studio/milestone/7).

## Documentation

For detailed setup and usage instructions, please refer to the full documentation:

*   **[GM Guide](./docs/gm/README.md):** Installation, configuration, and permissions.
*   **[Player Guide](./docs/player/README.md):** Character creation and leveling up.

## Key Features (dnd5e)

- Supports dnd5e versions: v3.x, v4.x and v5.x
- Supports Foundry versions: 12, 13
- The DM / GM can set which compendiums are available to Actor Studio (See [GM Configuration](./docs/gm/configuration.md))
- Set your Ability Scores using either: point buy, manual entry, standard array or dice rolls (See [Player Guide](./docs/player/ability_scores.md))
- Preview and select your race, background, class and subclass (See [Player Guide](./docs/player/README.md))
- Preview available advancements by level for class and subclass (See [Player Guide](./docs/player/advancements.md))
- Creates the actor and triggers the dnd5e Advancement workflow for selecting features, skills, etc.
- **NB:** For advancements to work you must have the "Disable level-up automation" setting switched off in dnd5e system settings! (See [GM Configuration](./docs/gm/configuration.md))
- Level Up! Supports multi-classing and leveling up via a button on the character sheet. (See [Player Guide](./docs/player/leveling_up.md))
- Supports standard dnd5e (v3+) character sheet
- Supports [Tidy5eSheet](https://github.com/kgar/foundry-vtt-tidy-5e-sheets)
- Supports Subclass Advancements and selection in dnd5e (system v3.x) where this wasn't something available in the 3.x system.
- Also support native Subclass selection v4.x+

## Basic Usage Overview (Player)

1.  **Launch:** Start Actor Studio via the "Create Actor" button (requires GM permission - see [GM Guide](./docs/gm/player_permissions.md)).
2.  **Tabs:** Work through the tabs (Ability Scores, Race, Background, Class/Subclass) making selections. You can go back and change choices.
3.  **Create:** Click "Create Character".
4.  **Advancements:** Follow the pop-up prompts to make choices (skills, languages, etc.).
5.  **Equipment Selection:** Select starting equipment/gold if prompted.
6.  **Equipment Shop** Buy equipment using your starting gold
7.  **Spell Selection** Select spells for your level
8.  **Level Up:** When you gain a level, use the "Level Up" button on your character sheet.

*(See the [Player Guide](./docs/player/README.md) for full details)*

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
