---
applyTo: "**/*.svelte"
description: Instructions for Svelte components using Pug preprocessing
---

# GitHub Copilot Instructions for Svelte with Pug Preprocessing

## Project Setup
- Use `svelte-preprocess` for Pug support in Svelte/SvelteKit.
- Configure in `svelte.config.js`.
- Install: `npm install --save-dev svelte-preprocess pug`.

## File Organization
- Svelte components: `src/lib/components`.
- Page routes: `src/routes`.
- Shared logic/stores: `$lib`.

## Svelte and Pug Guidelines
- Use Svelte 5 with Pug for markup.
- Use `<template lang="pug">` for Pug templates.
- Support Svelte directives with Pug mixins: `+if("condition")`, `+each("items as item")`, `+await("promise")`.
- **CRITICAL**: `+else()` and `+elseif()` must be indented one level deeper than their `+if()`.
- Example:
  ```pug
  <template lang="pug">
    +if("condition")
      p Content
      +else()
        p Else content
  </template>
  ```
- Use TypeScript: `<script lang="ts">`.
- Declare props: `type Props = { ... }; let { prop } = $props();`.

## Organism Component Structure
**Top-level components (organisms) should follow this pattern:**
- Organisms contain only **containers and display conditionals**
- Each container has a **header plus a single element or sub-components**
- **Actions belong in Footer.svelte** controlled via stores, not in organism templates
- Sub-components (molecules/atoms) handle specific functionality

**Example organism structure:**
```pug
.main-container.flexrow
  +if("isLoading")
    Loading
  .left-panel
    h3 Panel Title
    SubComponentA
    SubComponentB
  .right-panel  
    h3 Another Title
    SubComponentC
```

**Actions Pattern:**
- Move all buttons/actions from organisms to Footer.svelte
- Use conditional rendering in Footer based on active tab/state
- Control via stores rather than direct function calls in organisms

## Element Attributes
- Static attributes: `div(class="class" data-id="id")`.
- Dynamic attributes: Use array or string-interpolated object syntax.
  - Array: `div(class="{[condition ? 'active' : '']}")`.
  - Object: `div(class="{ active: condition, hidden: !visible }")`.
- Bind Svelte props: `input(bind:value="{variable}")`.
- Spread attributes: `div(...="{ id: dynamicId, class: 'static' }")`.
- Boolean attributes: `input(disabled="{true}")`.

## Template Literals
- Pug interpolation: `p #{variable}`.
- Svelte expressions: `p {variable}`.
- In attributes: `div(class="{condition ? 'active' : ''}")`.
- Keep logic in `<script>`; avoid inline JavaScript.

## Styling
- Use Tailwind CSS with utility classes.
- Avoid raw CSS or `<style>` unless necessary.
- Global styles: `:global` in `<style lang="scss">`.

## Accessibility
- Use semantic HTML in Pug.
- Add ARIA: `div(role="button" aria-label="Close")`.
- Ensure keyboard navigation and focus states.

## Best Practices
- Write concise, readable code.
- Comment complex logic only.
- Use named imports (e.g., `@lucide/svelte`).
- Avoid legacy Svelte patterns (`$:` for reactivity).

## Preprocessor Configuration
- Example `svelte.config.js`:
  ```javascript
  import { sveltePreprocess } from 'svelte-preprocess';
  export default {
    preprocess: sveltePreprocess({
      pug: true,
      defaults: { markup: 'pug' }
    })
  };
  ```

## Notes
- Align Pug syntax with `svelte-preprocess` mixins for directives.
- Reference Pug API: https://pugjs.org/api/reference.html.
- For Webpack, add `pug-plain-loader` for single-file components.



### Pug

You can check the [Pug API reference](https://pugjs.org/api/reference.html) for information about its options. The only overridden property is `doctype`, which is set to HTML.

Apart from those, the Pug preprocessor accepts:

| Option           | Default     | Description                                                                                                         |
| ---------------- | ----------- | ------------------------------------------------------------------------------------------------------------------- |
| `markupTagName`  | `template`  | the tag name used to look for the optional markup wrapper. If none is found, `pug` is executed over the whole file. |
| `configFilePath` | `undefined` | the path of the directory containing the Pug configuration.                                                         |

**Template blocks:**

Some of Svelte's template syntax is invalid in Pug. `svelte-preprocess` provides some pug mixins to represent svelte's `{#...}{/...}` and `{@...}` blocks: `+if()`, `+else()`, `+elseif()`, `+each()`, `+key()`, `+await()`, `+then()`, `+catch()`, `+html()`, `+const()`, `+debug()`, `+snippet()`, `+render()`.

**CRITICAL INDENTATION RULE**: In Pug conditional blocks within Svelte, `+else()` and `+elseif()` must be indented ONE LEVEL DEEPER than their corresponding `+if()`. When you have nested conditionals (like `+elseif()` followed by `+else()`), the `+else()` must be indented under the `+elseif()`.

CORRECT:
```pug
+if("condition")
  .content
    p Some content
  +elseif("otherCondition") 
    .other-content
      p Other content
    +else()
      .default-content
        p Default content
```

INCORRECT (will cause compilation errors):
```pug
+if("condition")
  .content
    p Some content
+elseif("otherCondition")  // ❌ Wrong indentation - same level as +if
  .other-content
    p Other content
+else()  // ❌ Wrong indentation - same level as +if
  .default-content
    p Default content
```

ALSO INCORRECT (nested else not properly indented):
```pug
+if("condition")
  .content
    p Some content
  +elseif("otherCondition") 
    .other-content
      p Other content
  +else()  // ❌ Wrong - should be under +elseif, not +if
    .default-content
      p Default content
```

Example with nested structure:
```pug
ul
  +if('posts && posts.length > 1')
    +each('posts as post')
      li
        a(rel="prefetch" href="blog/{post.slug}") {post.title}
    +else()
      span No posts :c
```

**Element attributes:**

Pug encodes everything inside an element attribute to html entities, so `attr="{foo && bar}"` becomes `attr="foo &amp;&amp; bar"`. To prevent this from happening, instead of using the `=` operator use `!=` which won't encode your attribute value:

```pug
button(disabled!="{foo && bar}")
```

**CRITICAL**: This is also necessary to pass callbacks and event handlers:

```pug
button(on:click!="{(e) => doTheThing(e)}")
input(on:change!="{(e) => handleChange(e)}")
```

**WRONG** (will cause encoding issues):
```pug
button(on:click="{(e) => doTheThing(e)}")  // ❌ Will encode the function
```

It is not possible to use template literals for attribute values. You can't write `` attr=`Hello ${value ? 'Foo' : 'Bar'}` ``, instead write `attr="Hello {value ? 'Foo' : 'Bar'}"`.

**Event Handler Rule**: ALWAYS use `!=` for event handlers (`on:click`, `on:change`, `on:input`, etc.) to prevent HTML entity encoding.

To spread props into a pug element, wrap the `{...object}` expression with quotes `"`.

This:

```pug
button.big(type="button" disabled "{...slide.props}") Send
```

Becomes:

```svelte
<button class="big" type="button" disabled {...slide.props}> Send </button>
```

**Svelte Element directives:**

Syntax to use Svelte Element directives with Pug

```pug
input(bind:value="{foo}")
input(on:input="{bar}")
```

## Common Issues and Troubleshooting

### Compilation Errors with Conditionals
- **Error**: "Cannot have an {:else if ...} block outside an {#if ...} block"
- **Cause**: Incorrect indentation of `+elseif()` or `+else()` blocks
- **Solution**: Ensure `+elseif()` and `+else()` are indented one level deeper than their corresponding `+if()`
- **Complex nesting**: When `+else()` follows `+elseif()`, the `+else()` must be indented under the `+elseif()`, not the original `+if()`

### Template Structure Problems
- **Error**: HTTP 500 errors when loading Svelte components
- **Cause**: Malformed Pug template due to incorrect conditional nesting
- **Solution**: Check indentation of all conditional blocks and ensure proper nesting structure

### Event Handler Issues
- **Issue**: Event handlers not working or causing encoding issues
- **Cause**: Using `=` instead of `!=` for event handlers
- **Solution**: Use `!=` operator for ALL event handlers: `on:click!="{() => handleClick()}"`
- **Examples of correct usage**:
  ```pug
  button(on:click!="{() => doSomething()}")
  input(on:change!="{(e) => handleChange(e)}")
  select(on:change!="{(e) => onClassSelected(e.target.value)}")
  ```

### Indentation Debugging
- **Problem**: Confusing nested conditional structures
- **Solution**: Each conditional level should be clearly indented:
  ```pug
  +if("level1")
    content
    +elseif("level1-alt")
      content
      +else()
        content
  ```
- **Rule**: `+else()` always belongs to the most recent conditional at the same or deeper level

### FINAL CHECK: Indentation Purpose
**Remember: Indentation in Pug replaces closing tags!** 

If a conditional (+elseif, +else) is at the same indentation level as its counterpart (+if), then the counterpart will NOT get its proper closing tag. This is the root cause of most conditional indentation errors.

Before finalizing any conditional structure, ask yourself:
- "Which element should contain the closing tag for this conditional?"
- "Is my indentation creating the proper parent-child scope relationship?"  
- "Will this indentation generate the correct HTML structure with proper opening/closing tags?"

This mental model helps catch indentation errors before they cause template compilation failures.