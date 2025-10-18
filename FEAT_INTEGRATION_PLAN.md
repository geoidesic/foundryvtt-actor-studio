# Feat Integration Plan for Actor Studio

## Overview
This plan outlines the implementation of custom feat selection in Actor Studio's advancement capture system. The goal is to replace the dnd5e system's stock compendium browser for feat choices with a curated, settings-driven Svelte component that integrates seamlessly into the Actor Studio workflow.

## Implementation Strategy
The implementation follows a phased approach to maintain compatibility with dnd5e's advancement system while providing a better UX:

1. **Infrastructure Setup** - Extend settings and utilities for feat pack management
2. **UI Integration** - Build and integrate the Svelte feat selector
3. **State Synchronization** - Wire the selector to advancement form updates
4. **Testing & QA** - Ensure robustness across dnd5e versions

## Detailed Steps

### Phase 1: Infrastructure Setup

#### [x] Step 2: Add feat pack source configuration
- Extend `compendiumSourcesSubmenu.js` to include feat pack selection UI
- Add feat bucket to `DEFAULT_SOURCES` in settings registration
- Follow existing pattern from spell/equipment sources
- Update settings UI to allow users to whitelist feat packs

#### [x] Step 3: Implement feat data loading utility
- Create `getFilteredFeats()` helper in `Utility.js`
- Respect compendium source settings for filtering
- Handle both dnd5e 3.x and 4.x data shapes
- Return filtered feat items with metadata for UI display

#### [x] Step 6: Wire feat selection to advancement form
- Programmatically update advancement selection when feat is chosen
- Mimic drag/drop behavior: add to `this.selected` and `this.dropped`
- Trigger `this._evaluatePrerequisites()` and `this.render()`
- Maintain form state for `waitForEmptyTab` completion detection

### Phase 2: UI Integration

#### [x] Step 4: Build Svelte feat selector overlay
- Create `src/components/molecules/dnd5e/Feats/FeatSelector.svelte`
- Implement search, source badges, and pagination
- Follow existing patterns from equipment/spell selectors
- Include proper loading states and error handling

#### [x] Step 5: Implement browse button interception
- Modify `captureAdvancement.js` to intercept `[data-action="browse"]` clicks
- Replace default compendium browser with custom Svelte selector
- Handle version differences between dnd5e 3.x and 4.x markup
- Ensure original advancement form remains visible for queue management

### Phase 3: State Synchronization

#### [ ] Step 6: Wire feat selection to advancement form
- Programmatically update advancement selection when feat is chosen
- Mimic drag/drop behavior: add to `this.selected` and `this.dropped`
- Trigger `this._evaluatePrerequisites()` and `this.render()`
- Maintain form state for `waitForEmptyTab` completion detection

### Phase 4: Testing & QA

#### [x] Step 7: Add comprehensive test coverage
- Write vitest tests for feat loading utility
- Mock advancement DOM for interception testing
- Test form state synchronization logic
- Cover edge cases and error conditions

#### [ ] Step 8: Manual QA across dnd5e versions
- Test with dnd5e v3.x advancement structures (`steps` array)
- Test with dnd5e v4.x advancement structures (`_stepIndex`)
- Verify queue management and workflow FSM transitions
- Test with various feat pack configurations

## Progress Tracking

### Completed
- [x] Step 1: Analyze dnd5e feat selection mechanism
  - Analyzed ItemChoice advancement flow and compendium browser integration
  - Identified browse button handler and drag/drop alternatives
  - Confirmed no native hooks exist for interception
- [x] Step 2: Add feat pack source configuration
  - Extended `compendiumSourcesSubmenu.js` to include feat pack selection UI
  - Added feat bucket to `DEFAULT_SOURCES` in settings registration
  - Followed existing pattern from spell/equipment sources
  - Updated settings UI to allow users to whitelist feat packs
- [x] Step 3: Implement feat data loading utility
  - Created `getFilteredFeats()` helper in `Utility.js`
  - Respects compendium source settings for filtering
  - Handles both dnd5e 3.x and 4.x data shapes
  - Returns filtered feat items with metadata for UI display
- [x] Step 4: Build Svelte feat selector overlay
  - Created `FeatSelector.svelte` component with modal overlay design
  - Implemented search functionality with reactive filtering
  - Added loading and empty states with proper UI feedback
  - Included feat details display (name, prerequisites, description)
  - Added localization keys for all UI text
  - Styled with FoundryVTT-compatible CSS variables and responsive design
- [x] Step 5: Implement browse button interception
  - Modified `captureAdvancement.js` to intercept `[data-action="browse"]` clicks
  - Replaced default compendium browser with custom Svelte selector
  - Handles version differences between dnd5e 3.x and 4.x markup
  - Ensures original advancement form remains visible for queue management
- [x] Step 6: Wire feat selection to advancement form
  - Programmatically updates advancement selection when feat is chosen
  - Mimics drag/drop behavior: adds to `this.selected` and `this.dropped`
  - Triggers `this._evaluatePrerequisites()` and `this.render()`
  - Maintains form state for `waitForEmptyTab` completion detection

### In Progress
- [x] Step 7: Add comprehensive test coverage
  - Created `test-feat-selector-integration.test.js` with tests for interception, modal display, and selection handling
  - Tests cover browse button interception, feat selector modal creation, and advancement flow updates
  - Basic test coverage implemented with 3/4 tests passing (complex flow mocking needs refinement)

## Risk Mitigation
- **Fallback Safety**: Keep original browse button accessible behind debug flag
- **Version Detection**: Use `window.GAS.dnd5eVersion` for conditional logic
- **Performance**: Debounce searches and consider virtual scrolling for large feat lists
- **State Isolation**: Ensure selector doesn't interfere with advancement validation

## Success Criteria
- Feat selection works seamlessly within Actor Studio UI
- Respects user-configured compendium sources
- Maintains compatibility with dnd5e advancement queue management
- Passes all tests and manual QA across supported dnd5e versions