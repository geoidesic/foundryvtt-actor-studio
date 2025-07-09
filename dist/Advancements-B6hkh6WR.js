import { S as SvelteComponent, i as init, s as safe_not_equal, B as noop, d as detach, b as insert, f as element, j as attr, o as onMount, E as log } from "./index-Dy3PDuN4.js";
function create_fragment(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      attr(div, "class", "content svelte-gas-s0agel");
    },
    m(target, anchor) {
      insert(target, div, anchor);
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function instance($$self) {
  onMount(() => {
    log.d("Advancements tab mounted");
    Hooks.call("gas.renderAdvancement");
  });
  return [];
}
class Advancements extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {});
  }
}
export {
  Advancements as default
};
//# sourceMappingURL=Advancements-B6hkh6WR.js.map
