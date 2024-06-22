import { S as SvelteComponent, i as init, s as safe_not_equal, e as element, b as attr, c as insert, A as noop, j as detach, o as onMount } from "./index-Dgg4Pc5d.js";
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
//# sourceMappingURL=Advancements-CaUWUW58.js.map
