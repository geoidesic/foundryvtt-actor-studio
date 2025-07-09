# Component Structure (Atomic Design)

This project utilizes the Atomic Design methodology to organize its Svelte components, promoting reusability, maintainability, and a clear structure. Components are categorized based on their complexity and role within the UI hierarchy.

## Directory Structure

The components are located within the `src/components/` directory and are organized as follows:

```
foundryvtt-actor-studio
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   │   └── ... # Existing atoms (potentially new +/- buttons if needed)
│   │   ├── molecules/
│   │   │   ├── GoldDisplay.svelte  # New: Displays formatted gold/silver/copper
│   │   │   └── ... # Existing molecules
│   │   ├── organisms/
│   │   │   ├── ShopTab.svelte      # New: The main component for the Shop tab interface
│   │   │   └── ... # Existing organisms
│   │   └── pages/
│   │       └── ... # Existing pages
│   ├── plugins/
│   │   ├── equipment-purchase/     # New: Feature plugin folder
│   │   │   ├── handlers/
│   │   │   │   └── PurchaseHandler.js # New: Logic for currency conversion, item cost calculation
│   │   │   ├── index.js             # New: Entry point, hooks into the main app flow
│   │   │   └── settings.js          # New: Registers the 'enableEquipmentPurchase' setting
│   │   └── ... # Other existing plugins (like level-up)
│   ├── settings/
│   │   ├── compendiumSourcesSubmenu.js # Needs modification: Add 'Equipment' collapsible/setting
│   │   └── ... # Existing settings files
│   ├── stores/
│   │   ├── equipmentShop.js       # New: Manages shop items, cart state, available gold
│   │   └── ... # Existing stores
│   └── ... # Other existing src files (app, helpers, etc.)
├── styles/
│   ├── features/                  # Suggestion: Create subfolder for feature styles
│   │   └── equipment-purchase.scss # New: Styles specific to the Shop tab and components
│   └── init.sass                  # Needs modification: Import the new SCSS file
├── lang/
│   └── en.json                    # Needs modification: Add translations for "Shop", settings, etc.
├── docs/
│   ├── features/
│   │   └── equipment_purchase.md  # New: Documentation for this feature
│   └── ... # Existing docs
└── module.json                    # Needs modification: Add new JS/CSS files, potentially update dependencies
```

## Levels Explained

### 1. Atoms (`src/components/atoms/`)

- **Definition:** The most basic building blocks of the UI. These are fundamental HTML elements styled or enhanced, like buttons, inputs, labels, icons, etc.
- **Characteristics:**
    - Cannot be broken down further without losing functionality.
    - Highly reusable across the entire application.
    - Should have no dependency on application state or business logic directly.
- **Examples:** `EfxButton.svelte`, `IconButton.svelte`, `IconSelect.svelte`

### 2. Molecules (`src/components/molecules/`)

- **Definition:** Simple groups of atoms functioning together as a unit. They do one thing and do it well.
- **Characteristics:**
    - Composed of two or more atoms.
    - Form more tangible pieces of the interface.
    - Can be reused in multiple contexts.
- **Examples:** `Footer.svelte`, `ProgressBar.svelte`, `Tabs.svelte`

### 3. Organisms (`src/components/organisms/`)

- **Definition:** Relatively complex UI components assembled from groups of molecules and/or atoms. They form distinct sections of an interface.
- **Characteristics:**
    - Represent more specific parts of the application (e.g., a character sheet section, a settings panel).
    - Can be complex but should remain context-agnostic enough for potential reuse.
- **Examples:** (Specific examples would depend on the content within `src/components/organisms/dnd5e/`)

### 4. Pages (`src/components/pages/`)

- **Definition:** Specific instances of pages, placing components (primarily organisms and molecules) into a layout. They represent a complete view within the application.
- **Characteristics:**
    - Provide context for the components they contain.
    - Often connected to routing and application state.
    - Least reusable component type, specific to a particular view.
- **Examples:** (Currently empty, but could include `CharacterCreationPage.svelte`, `SettingsPage.svelte`)

## System-Specific Components

Subdirectories like `dnd5e/` within `molecules/` and `organisms/` indicate components tailored specifically for the Dungeons & Dragons 5th Edition system ruleset, allowing for system-agnostic core components alongside system-specific implementations.
