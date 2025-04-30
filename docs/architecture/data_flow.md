# Data Flow in the FoundryVTT Actor Studio Module

This document outlines the data flow within the FoundryVTT module for creating dnd5e Actors. Understanding the data flow is crucial for comprehending how data is processed and transferred between different components of the module.

## Overview of Data Flow

The data flow in the Actor Studio module can be broken down into several key components:

1. **User Input**: 
   - Users interact with the module through a user interface where they can input their choices for Ability Scores, race, background, class, subclass, and starting equipment.

2. **Data Processing**:
   - Once the user makes selections, the module processes this data. This includes validating inputs, calculating derived values (e.g., ability modifiers), and preparing the data for actor creation.

3. **Actor Creation**:
   - The processed data is then used to create a new Actor within FoundryVTT. This involves constructing the Actor object with all relevant attributes and properties based on user selections.

4. **Advancements Handling**:
   - After the Actor is created, the module triggers advancements based on the selected class and subclass. This includes applying any level-up mechanics and updating the Actor's attributes accordingly.

5. **Compendium Management**:
   - The DM/GM can set which compendiums are available, influencing the data that can be accessed during actor creation. The module checks these settings to ensure only valid options are presented to the user.

6. **Finalization**:
   - Once all selections are made and advancements are applied, the module finalizes the Actor creation process. If enabled, the starting equipment tab is opened for the user to select their initial gear.

## Data Flow Diagram

A visual representation of the data flow can be helpful. Below is a simplified diagram:

```
User Input --> Data Processing --> Actor Creation --> Advancements Handling --> Finalization
```

## Conclusion

Understanding the data flow within the Actor Studio module is essential for developers looking to modify or extend its functionality. This document serves as a reference for how data is managed throughout the actor creation process, ensuring a smooth user experience.