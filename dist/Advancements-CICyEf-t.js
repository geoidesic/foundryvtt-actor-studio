import { S as SvelteComponent, i as init, s as safe_not_equal, e as element, b as attr, c as insert, d as append, A as noop, j as detach, k as component_subscribe, H as dropItemRegistry, n as getContext, o as onMount, r as readOnlyTabs, z as ensure_array_like, B as destroy_each, F as text, G as set_data } from "./index-CIsGgT48.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[4] = list[i];
  return child_ctx;
}
function create_if_block(ctx) {
  let div;
  let each_value = ensure_array_like(
    /*itemsWithoutAdvancements*/
    ctx[0]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  return {
    c() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(div, "class", "warnings p-2 svelte-gas-rs4dyo");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div, null);
        }
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*itemsWithoutAdvancements*/
      1) {
        each_value = ensure_array_like(
          /*itemsWithoutAdvancements*/
          ctx2[0]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(div, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_each_block(ctx) {
  let div;
  let t0_value = (
    /*item*/
    ctx[4].itemData.name + ""
  );
  let t0;
  let t1;
  return {
    c() {
      div = element("div");
      t0 = text(t0_value);
      t1 = text(" has no advancements at this level.");
      attr(div, "class", "warning notification");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t0);
      append(div, t1);
    },
    p(ctx2, dirty) {
      if (dirty & /*itemsWithoutAdvancements*/
      1 && t0_value !== (t0_value = /*item*/
      ctx2[4].itemData.name + "")) set_data(t0, t0_value);
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_fragment(ctx) {
  let div1;
  let div0;
  let if_block = (
    /*itemsWithoutAdvancements*/
    ctx[0].length > 0 && create_if_block(ctx)
  );
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      if (if_block) if_block.c();
      attr(div0, "class", "content svelte-gas-rs4dyo");
      attr(div1, "class", "container");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, div0);
      if (if_block) if_block.m(div1, null);
    },
    p(ctx2, [dirty]) {
      if (
        /*itemsWithoutAdvancements*/
        ctx2[0].length > 0
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          if_block.m(div1, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div1);
      }
      if (if_block) if_block.d();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let currentDrops;
  let itemsWithoutAdvancements;
  let $dropItemRegistry;
  component_subscribe($$self, dropItemRegistry, ($$value) => $$invalidate(2, $dropItemRegistry = $$value));
  getContext("#doc");
  onMount(() => {
    Hooks.call("gas.captureAdvancement", true);
    readOnlyTabs.set(["race", "background", "abilities", "class"]);
  });
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$dropItemRegistry*/
    4) {
      $$invalidate(1, currentDrops = $dropItemRegistry?.currentProcess || []);
    }
    if ($$self.$$.dirty & /*currentDrops*/
    2) {
      $$invalidate(0, itemsWithoutAdvancements = currentDrops.filter((drop) => !drop.itemData.advancement || drop.itemData.advancement.length === 0));
    }
    if ($$self.$$.dirty & /*currentDrops*/
    2) {
      console.log("currentDrops", currentDrops);
    }
    if ($$self.$$.dirty & /*itemsWithoutAdvancements*/
    1) {
      console.log("itemsWithoutAdvancements", itemsWithoutAdvancements);
    }
    if ($$self.$$.dirty & /*$dropItemRegistry*/
    4) {
      console.log("$dropItemRegistry", $dropItemRegistry);
    }
  };
  return [itemsWithoutAdvancements, currentDrops, $dropItemRegistry];
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
//# sourceMappingURL=Advancements-CICyEf-t.js.map
