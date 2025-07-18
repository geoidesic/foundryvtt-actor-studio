# StandardTabLayout Migration Guide

## Quick Reference

### StandardTabLayout Props
```javascript
{
  title: "",           // Page title
  showTitle: false,    // Show/hide title (hidden by default)
  tabName: "",         // For readonly checking
  leftPanelClass: "",  // Additional left panel classes
  rightPanelClass: "", // Additional right panel classes  
  contentClass: ""     // Additional content classes
}
```

## Conversion Examples

### Race Tab Conversion

**Before:**
```pug
div.content
  h1.center.mt-none.hide {t('Tabs.Races.Title')}
  .flexrow
    .flex2.pr-sm.col-a
      .flexrow
        .flex0.required(class="{$race ? '' : 'active'}") *
        .flex3 
          IconSelect.mb-md.icon-select({options} {active} {placeHolder} handler="{selectRaceHandler}" id="race-select" bind:value disabled="{isDisabled}")
          +if("isDisabled")
            .info-message This tab is read-only during advancement selection
      // ... more content
    .flex0.border-right.right-border-gradient-mask 
    .flex3.left.pl-md.scroll.col-b {@html richHTML}
```

**After:**
```pug
StandardTabLayout(
  title="{t('Tabs.Races.Title')}"
  showTitle="{true}"
  tabName="race"
)
  div(slot="left")
    .flexrow
      .flex0.required(class="{$race ? '' : 'active'}") *
      .flex3 
        IconSelect.mb-md.icon-select({options} {active} {placeHolder} handler="{selectRaceHandler}" id="race-select" bind:value disabled="{isDisabled}")
        +if("isDisabled")
          .info-message This tab is read-only during advancement selection
    // ... more content
  div(slot="right") {@html richHTML}
```

### Background Tab Conversion

**Before:**
```pug
.content
  h1.center.mt-none.hide {t('Tabs.Background.Title')}
  .flexrow
    .flex2.pr-sm.col-a
      .flexrow
        .flex0.required(class="{$background ? '' : 'active'}") *
        .flex3 
          IconSelect.icon-select({options} {active} {placeHolder} handler="{selectBackgroundHandler}" id="background-select" bind:value disabled="{isDisabled}")
      // ... advancement content
    .flex0.border-right.right-border-gradient-mask 
    .flex3.left.pl-md.scroll.col-b {@html richHTML}
```

**After:**
```pug
StandardTabLayout(
  title="{t('Tabs.Background.Title')}"
  showTitle="{true}"
  tabName="background"
)
  div(slot="left")
    .flexrow
      .flex0.required(class="{$background ? '' : 'active'}") *
      .flex3 
        IconSelect.icon-select({options} {active} {placeHolder} handler="{selectBackgroundHandler}" id="background-select" bind:value disabled="{isDisabled}")
    // ... advancement content
  div(slot="right") {@html richHTML}
```

## CSS Cleanup After Conversion

Once tabs are converted, remove these duplicate styles from individual components:

```sass
// Remove this from each tab:
.content 
  +mixins.staticOptions
  .col-a
    // max-width: 325px

// Keep only tab-specific styles like:
.overlay
  position: absolute
  // ... tab-specific styling
```

## Migration Checklist

For each tab conversion:

- [ ] Import StandardTabLayout
- [ ] Replace `.content > .flexrow` structure with StandardTabLayout
- [ ] Move left panel content to `slot="left"`
- [ ] Move right panel content to `slot="right"`
- [ ] Set appropriate `tabName` for readonly integration
- [ ] Remove duplicate `.content` and `.col-a` styles
- [ ] Test responsive behavior
- [ ] Verify all functionality preserved

## Problem Tabs Requiring Layout Fixes

These tabs use non-standard layouts and need structure fixes:

1. **Equipment.svelte** - Uses `.container > .content > .flexrow`
2. **ShopTab.svelte** - Uses `.shop-tab > .left-panel/.right-panel`  
3. **Spells.svelte** - Custom layout with different class names
4. **FeatSpells.svelte** - Uses `.feat-spells-container.flexrow`

For these, first standardize the layout to match the working pattern, then convert to StandardTabLayout.
