# Equipment Selections Test Suite

This test suite was created to prevent regressions in the granular selection functionality, specifically to ensure that a critical bug doesn't resurface.

## The Bug That Was Fixed

**Issue**: In the monk character creation, when selecting tools (artisan's tools vs musical instruments), the granular selection interface would appear correctly, but after making a selection, the interface would NOT disappear. Instead, it would remain visible and force the user to make another selection.

**Root Cause**: The `addChildGranularSelection` function was correctly marking the child choice group as completed (`completed: true, inProgress: false`), but then the "next group" logic was immediately finding the same child group and setting it back to `inProgress: true`, overriding the completion state.

**Fix**: Modified the next group selection logic to exclude both the parent group (`groupId`) AND the child group (`childId`) when looking for the next incomplete group:

```javascript
const nextGroup = isComplete ? sortedGroups.find(g =>
  !g.completed && g.id !== groupId && g.id !== childId
) : null;
```

## Test Coverage

The test suite covers:

1. **Main Bug Fix**: Ensures child choice groups remain completed and don't get reset to in-progress
2. **Granular Selection Storage**: Verifies selections are properly stored in parent group's children
3. **PlannedInventory Integration**: Tests that granular selections appear in flattened selections
4. **Edge Cases**: Handles non-existent groups gracefully and parent completion logic
5. **State Management**: Verifies correct state transitions for both parent and child groups

## Running Tests

```bash
# Run tests once
bun test:run

# Run tests in watch mode
bun test

# Run tests with UI
bun test:ui
```

## Test Structure

- **Setup**: Each test properly mocks FoundryVTT globals (`window.GAS`, `window.game`, etc.)
- **Isolation**: Tests are independent and reset the store between runs
- **Realistic Scenarios**: Tests use actual equipment group structures (monk tools, AND/OR groups)
- **Comprehensive Assertions**: Tests verify both immediate state changes and side effects

## Key Files

- `equipmentSelections.test.js`: Main test file
- `setup.js`: Global test setup and mocking
- `vitest.config.js`: Test configuration
- `../stores/equipmentSelections.js`: The module being tested

## Maintenance

When making changes to the equipment selection logic:

1. Run the test suite to ensure no regressions
2. Update tests if the expected behavior changes
3. Add new tests for new functionality
4. Pay special attention to the "next group" logic which was the source of the original bug 