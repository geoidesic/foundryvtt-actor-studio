import { S as SvelteComponent, i as init, s as safe_not_equal, e as element, b as attr, c as insert, A as noop, j as detach, o as onMount, N as getAdvancementValue, a as empty, d as append, F as text, G as set_data, z as ensure_array_like, B as destroy_each } from "./index-BBwHHhum.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[2] = list[i];
  return child_ctx;
}
function create_if_block(ctx) {
  let div;
  let show_if = getAdvancementValue(
    /*advancement*/
    ctx[0],
    "hint"
  );
  let if_block0_anchor;
  let if_block0 = show_if && create_if_block_2(ctx);
  let if_block1 = (
    /*sizes*/
    ctx[1]?.size > 0 && create_if_block_1(ctx)
  );
  return {
    c() {
      div = element("div");
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      attr(div, "class", "flexrow");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if (if_block0) if_block0.m(div, null);
      append(div, if_block0_anchor);
      if (if_block1) if_block1.m(div, null);
    },
    p(ctx2, dirty) {
      if (dirty & /*advancement*/
      1) show_if = getAdvancementValue(
        /*advancement*/
        ctx2[0],
        "hint"
      );
      if (show_if) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_2(ctx2);
          if_block0.c();
          if_block0.m(div, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (
        /*sizes*/
        ctx2[1]?.size > 0
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_1(ctx2);
          if_block1.c();
          if_block1.m(div, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
    }
  };
}
function create_if_block_2(ctx) {
  let div;
  let t_value = getAdvancementValue(
    /*advancement*/
    ctx[0],
    "hint"
  ) + "";
  let t;
  return {
    c() {
      div = element("div");
      t = text(t_value);
      attr(div, "class", "flex left");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
    },
    p(ctx2, dirty) {
      if (dirty & /*advancement*/
      1 && t_value !== (t_value = getAdvancementValue(
        /*advancement*/
        ctx2[0],
        "hint"
      ) + "")) set_data(t, t_value);
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_if_block_1(ctx) {
  let div;
  let each_value = ensure_array_like(
    /*sizes*/
    ctx[1]
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
      attr(div, "class", "flex0");
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
      if (dirty & /*game, sizes*/
      2) {
        each_value = ensure_array_like(
          /*sizes*/
          ctx2[1]
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
  let t_value = game.system.config.actorSizes[
    /*size*/
    ctx[2]
  ].label + "";
  let t;
  return {
    c() {
      div = element("div");
      t = text(t_value);
      attr(div, "class", "flex0 right badge svelte-gas-ecnfij");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
    },
    p(ctx2, dirty) {
      if (dirty & /*sizes*/
      2 && t_value !== (t_value = game.system.config.actorSizes[
        /*size*/
        ctx2[2]
      ].label + "")) set_data(t, t_value);
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_fragment(ctx) {
  let div;
  let div_data_type_value;
  let if_block = (
    /*advancement*/
    ctx[0].title === "Size" && create_if_block(ctx)
  );
  return {
    c() {
      div = element("div");
      if (if_block) if_block.c();
      attr(div, "class", "advancement mt-sm svelte-gas-ecnfij");
      attr(div, "data-type", div_data_type_value = /*advancement*/
      ctx[0].type);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if (if_block) if_block.m(div, null);
    },
    p(ctx2, [dirty]) {
      if (
        /*advancement*/
        ctx2[0].title === "Size"
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          if_block.m(div, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*advancement*/
      1 && div_data_type_value !== (div_data_type_value = /*advancement*/
      ctx2[0].type)) {
        attr(div, "data-type", div_data_type_value);
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      if (if_block) if_block.d();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let sizes;
  let { advancement = null } = $$props;
  onMount(async () => {
  });
  $$self.$$set = ($$props2) => {
    if ("advancement" in $$props2) $$invalidate(0, advancement = $$props2.advancement);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*advancement*/
    1) {
      $$invalidate(1, sizes = advancement.configuration.sizes);
    }
  };
  return [advancement, sizes];
}
class Size extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { advancement: 0 });
  }
}
export {
  Size as default
};
//# sourceMappingURL=Size-CZXiOL5Q.js.map
