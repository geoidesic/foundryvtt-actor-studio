---
copilot: 1.102.0
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
- Example:
  ```pug
  <template lang="pug">
    +if("condition")
      p Content
      +else
        p Else content
  </template>
  ```
- Use TypeScript: `<script lang="ts">`.
- Declare props: `type Props = { ... }; let { prop } = $props();`.

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

This is also necessary to pass callbacks:

```pug
button(on:click!="{(e) => doTheThing(e)}")
```

It is not possible to use template literals for attribute values. You can't write `` attr=`Hello ${value ? 'Foo' : 'Bar'}` ``, instead write `attr="Hello {value ? 'Foo' : 'Bar'}"`.

**Spreading props:**

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