# Configuration Guide (GM)

As a Gamemaster (GM), you have several configuration options to tailor Actor Studio to your game world.

## Accessing Module Settings

1.  Log in to your Foundry VTT world as the Gamemaster.
2.  Navigate to the "Game Settings" tab (cog icon).
3.  Click on "Configure Settings".
4.  Select the "Module Settings" tab.
5.  Find the settings section for "Actor Studio".

## Key Configuration Options

### Compendium Selection

This is the most crucial setting. Actor Studio relies on compendiums to provide options for races, classes, backgrounds, spells, items, etc.

-   **Allowed Compendiums:** You must select which compendiums Actor Studio should use. Only content from the selected compendiums will be available to players during character creation.
    -   It is recommended to include the core dnd5e compendiums (e.g., `dnd5e.races`, `dnd5e.classes`, `dnd5e.backgrounds`, `dnd5e.spells`, `dnd5e.items`).
    -   You can also include compendiums from other installed modules or custom compendiums you have created, provided they contain compatible dnd5e documents (Actors for races/subclasses, Items for backgrounds/classes/features/spells/equipment).
-   **Indexing:** After changing compendium selections, Actor Studio may need to re-index the content. This usually happens automatically, but if options seem missing, reloading the world (F5) might help.

### dnd5e System Settings Interaction

-   **Disable Level Up Automation:** For the advancement features of Actor Studio (both initial creation and leveling up) to function correctly, you **must** ensure the dnd5e system setting "Disable Experience Tracking" is **unchecked** and "Disable Level Up Automation" (or similar wording depending on system version) is also **unchecked**. Actor Studio relies on the system's advancement framework.

### Other Settings

Review other available settings within the Actor Studio configuration panel, which might include options for:

-   Default ability score generation method.
-   UI tweaks or behavior adjustments.

Carefully review and select the compendiums that match the content you want available in your campaign.
