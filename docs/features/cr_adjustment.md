# CR Adjustment System

The CR Adjustment System is a powerful tool that allows Game Masters to automatically adjust NPCs to different Challenge Ratings (CR) according to the rules. This system automatically recalculates and updates the NPC's stats, features, and abilities to match the target CR.

## Overview

The CR Adjustment System implements the official D&D 5e challenge rating calculation rules It provides:

- **Automatic CR calculation** based on current NPC stats
- **CR adjustment** to any valid challenge rating
- **Stat recalculation** including HP, AC, ability scores, and feature damage

## How It Works

### 1. CR Calculation

The system calculates the current CR by analyzing:

- **Defensive CR**: Based on HP and AC, with adjustments for resistances
- **Offensive CR**: Based on damage per round (DPR) and attack bonuses/save DCs
- **Final CR**: Average of defensive and offensive CRs, rounded to nearest valid CR

### 2. CR Adjustment

When adjusting to a target CR, the system:

- Updates HP to match the target CR's expected range
- Adjusts AC to the target CR's expected value
- Modifies ability scores to provide appropriate proficiency bonuses
- Recalculates feature damage to match target DPR expectations
- Updates XP value and proficiency bonus

### 3. Tables

The system uses custom tables for:

- **Defensive CR**: HP ranges and expected AC values
- **Offensive CR**: DPR ranges, attack bonuses, and save DCs
- **XP Values**: Experience point rewards for each CR
- **Proficiency Bonuses**: Expected proficiency bonus by CR

## Usage

### In the NPC Application

1. **Navigate to the "Stats" tab** in the NPC application
2. **Click the magic wand button** next to the Challenge Rating field
3. **Select your target CR** from the dropdown
4. **Click "Adjust to CR X"** to apply changes
5. **Review the changes** in the NPC stat block

### In the NPC Stat Block

1. **Find the Challenge Rating field** in any NPC stat block
2. **Click the magic wand button** (🔮) next to the CR value
3. **Use the CR adjustment interface** to modify the NPC
4. **Apply changes** to automatically update all stats

## Features

### CR Analysis

- **Current CR Breakdown**: Shows defensive, offensive, and calculated CRs
- **Stat Analysis**: Displays current HP, AC, DPR, and proficiency bonus
- **Target Preview**: Shows what stats will be after adjustment

### Automatic Adjustments

- **HP Formula**: Automatically calculates appropriate HP for target CR
- **AC Adjustment**: Sets AC to expected value for target CR
- **Ability Scores**: Adjusts primary attack ability for appropriate bonuses
- **Feature Damage**: Recalculates damage formulas to match target DPR
- **Proficiency Bonus**: Updates to match target CR

### Advanced Options

- **Calculation Details**: See how CR is calculated
- **Warning System**: Alerts before making significant changes

## Technical Details

### Files

- `src/helpers/CRCalculator.js` - Core CR calculation logic
- `src/components/molecules/dnd5e/NPC/CRAdjuster.svelte` - CR adjustment UI
- `src/components/organisms/dnd5e/Tabs/NpcCreate.svelte` - Integration in NPC creation
- `src/components/molecules/dnd5e/NPC/NPCStatBlock.svelte` - Integration in stat blocks

### Dependencies

- **Svelte**: For reactive UI components
- **Foundry VTT**: For actor updates and notifications

## Examples

### Example 1: Scaling Up a Goblin

**Starting NPC**: Goblin (CR 1/4)
- HP: 7, AC: 15, DPR: ~6

**Target**: CR 1
- **Result**: HP: 78, AC: 13, DPR: ~12
- **Changes**: Increased HP significantly, adjusted AC, boosted damage

### Example 2: Scaling Down a Dragon

**Starting NPC**: Young Dragon (CR 7)
- HP: 136, AC: 17, DPR: ~47

**Target**: CR 3
- **Result**: HP: 108, AC: 13, DPR: ~24
- **Changes**: Reduced HP, lowered AC, decreased damage

## Best Practices

### Before Adjustment

1. **Backup your NPC** if it's important
2. **Review current stats** to understand the baseline
3. **Consider the story** - does the CR change make sense?

### During Adjustment

1. **Start with small changes** to see the impact
2. **Use the preview** to understand what will change
3. **Check the advanced options** for detailed information

### After Adjustment

1. **Review all changes** in the stat block
2. **Test the NPC** in a simple encounter
3. **Fine-tune manually** if needed

## Limitations

### Current Limitations

- **Damage Formulas**: Only handles simple dice formulas (e.g., "2d6+3")
- **Complex Features**: May not perfectly adjust multi-attack or legendary actions
- **Resistances**: Limited handling of damage resistance/immunity effects

### Future Enhancements

- **Advanced Damage**: Support for complex damage formulas
- **Feature Analysis**: Better handling of special abilities
- **Resistance Calculation**: Improved defensive CR calculations
- **Legendary Actions**: Better support for high-CR creatures

## Troubleshooting

### Common Issues

**"Invalid target CR" error**
- Ensure the target CR is a valid value (0, 0.125, 0.25, 0.5, 1, 2, etc.)
- Check that the CR exists in the CR tables

**Stats not updating**
- Verify the NPC is editable (not in readonly mode)
- Check the browser console for error messages
- Ensure you have permission to edit the actor

**Unexpected results**
- Review the CR breakdown to understand the calculation
- Check that the NPC has the expected features and items
- Use the "Analyze Current CR" button to verify calculations

### Getting Help

If you encounter issues:

1. **Check the console** for error messages
2. **Verify NPC structure** matches expected format
3. **Test with a simple NPC** first
4. **Report bugs** with detailed information

## Conclusion

The CR Adjustment System provides a powerful, rules-accurate way to scale NPCs up or down in challenge rating. By following the CR guidelines, it ensures that adjusted NPCs maintain appropriate balance and challenge for your players.

Remember that while the system provides excellent baseline adjustments, you may want to fine-tune specific aspects based on your campaign's needs and your players' preferences.
