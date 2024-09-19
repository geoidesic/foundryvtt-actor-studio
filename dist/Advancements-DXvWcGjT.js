import { S as SvelteComponent, i as init, s as safe_not_equal, e as element, b as attr, c as insert, A as noop, j as detach, n as getContext, o as onMount } from "./index-BPrL5cXo.js";
function create_fragment(ctx) {
  let div1;
  return {
    c() {
      div1 = element("div");
      div1.innerHTML = `<div class="content svelte-gas-1483z69"></div>`;
      attr(div1, "class", "container");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div1);
      }
    }
  };
}
function instance($$self) {
  getContext("#doc");
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
//# sourceMappingURL=Advancements-DXvWcGjT.js.map
