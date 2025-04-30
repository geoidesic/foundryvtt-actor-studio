# Module Structure

## Overview

This document outlines the overall structure of the FoundryVTT module for creating dnd5e Actors. It provides a detailed description of the organization of files and directories, as well as the relationships between various components of the module.

## Directory Structure

The module is organized into several key directories, each serving a specific purpose:

- **docs/**: Contains all documentation related to the module, including architecture, features, setup instructions, and an overview.
  - **architecture/**: Holds documents that describe the internal workings and structure of the module.
    - **data_flow.md**: Details the flow of data within the application.
    - **module_structure.md**: Describes the organization of the module.
  - **features/**: Contains documentation for each feature of the module.
    - **ability_scores.md**: Information on setting Ability Scores.
    - **advancements.md**: Explanation of how advancements are handled.
    - **actor_creation.md**: Details the actor creation process.
    - **class_subclass.md**: Information on class and subclass selection.
    - **compendiums.md**: Details on setting available compendiums.
    - **race_background.md**: Information on selecting race and background.
    - **starting_equipment.md**: Details on handling starting equipment.
  - **setup/**: Contains setup and configuration documentation.
    - **configuration.md**: Information on configuration settings.
    - **installation.md**: Instructions for installing the module.
  - **app_overview.md**: A high-level overview of the module's features and functionalities.
  - **README.md**: Main documentation file providing an introduction and links to other documents.

## Component Relationships

- The **app_overview.md** provides a summary of the module's capabilities, which are further detailed in the **features/** directory.
- The **architecture/** directory documents the internal structure and data flow, which is essential for understanding how the module operates.
- Each feature document in the **features/** directory is interconnected, as they collectively contribute to the actor creation process and overall functionality of the module.

## Conclusion

Understanding the module structure is crucial for developers and users alike, as it provides insights into how the module is organized and how its components interact. This structured approach facilitates easier navigation and comprehension of the module's functionalities.