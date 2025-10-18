# Feat Selector UI Redesign - Compact List Format

## Before
Thick rows with:
- Large feat images (40x40px)
- Feat name as heading
- Level prerequisite displayed separately
- Description snippet (100 chars)
- Multiple lines per feat
- Hard to scan long lists

## After
Compact rows with:
- Single-line enriched HTML links
- Foundry tooltip on hover (shows full description, stats, etc.)
- Ineligibility warnings only when applicable (inline, right-aligned)
- Minimal height (~32px per row)
- Easy to scan long lists
- Matches the pattern used for features elsewhere in Actor Studio

## Design Pattern
Following the existing pattern from `ItemGrant.svelte`:
```svelte
+await("enrichHTML(item.link || '')")
  +then("Html")
    .flex2 {@html Html}
```

## Benefits
1. **More compact** - Can see more feats at once without scrolling
2. **Consistent UX** - Matches how features are displayed in advancements
3. **Better tooltips** - Foundry's built-in tooltips show complete feat information on hover
4. **Cleaner visual** - Less visual noise, easier to scan
5. **Faster rendering** - No image loading delays, simpler DOM structure

## CSS Changes
- Row height: `0.75rem` → `0.4rem` padding (32px min-height)
- Removed `.feat-image` and `.feat-details` structure
- Simplified to `.feat-link` + optional `.feat-ineligibility-reason`
- Ineligibility reason positioned on the right with `white-space: nowrap`

## Example Row Structure
```pug
.feat-item(class:selected class:ineligible)
  .feat-link {@html enrichedFeatLinks[feat._id]}
  +if("!meetsAllPrerequisites(feat)")
    .feat-ineligibility-reason
      i.fa-solid.fa-exclamation-triangle
      span Requires level 4
```

## User Experience
- **Hover over feat name** → Foundry tooltip appears with full details
- **Click anywhere on row** → Selects the feat
- **Ineligible feats** → Grayed out with reason shown, cannot be selected
- **Toggle** → "Show ineligible feats" checkbox to optionally view all
