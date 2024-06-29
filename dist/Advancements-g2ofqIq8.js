import { S as SvelteComponent, i as init, s as safe_not_equal, e as element, b as attr, c as insert, A as noop, j as detach, k as component_subscribe, H as dropItemRegistry, n as getContext, o as onMount, x as log } from "./index-DPYYAGzd.js";
function create_fragment(ctx) {
  let div1;
  return {
    c() {
      div1 = element("div");
      div1.innerHTML = `<div class="content svelte-gas-s0agel"></div>`;
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
function instance($$self, $$props, $$invalidate) {
  component_subscribe($$self, dropItemRegistry, ($$value) => $$invalidate(2, $$value));
  const doc = getContext("#doc");
  component_subscribe($$self, doc, (value) => $$invalidate(1, value));
  onMount(() => {
    log.d("Advancements tab mounted");
    Hooks.call("gas.renderAdvancement");
  });
  return [doc];
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
//# sourceMappingURL=Advancements-g2ofqIq8.js.map
