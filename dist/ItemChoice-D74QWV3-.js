import { S as SvelteComponent, i as init, s as safe_not_equal, C as noop, d as detach, j as attr, b as insert, f as element, o as onMount, O as getAdvancementValue, F as set_data, e as append, G as text, B as ensure_array_like, D as destroy_each, h as empty, N as src_url_equal } from "./index-1Yfxbk5l.js";
import { h as handle_promise, u as update_await_block_branch } from "./await_block-PyXAg-ym.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[2] = list[i];
  return child_ctx;
}
function create_else_block(ctx) {
  let div;
  let h3;
  let span0;
  let span1;
  let t1;
  let t2;
  let span2;
  let ul;
  let each_value = ensure_array_like(
    /*advancement*/
    ctx[0].configuration.pool
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  return {
    c() {
      div = element("div");
      h3 = element("h3");
      span0 = element("span");
      span0.textContent = "Choose ";
      span1 = element("span");
      t1 = text(
        /*count*/
        ctx[1]
      );
      t2 = text(" ");
      span2 = element("span");
      span2.textContent = "from: ";
      ul = element("ul");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(h3, "class", "flex left");
      attr(div, "class", "flexrow svelte-gas-h59hi0");
      attr(ul, "class", "icon-list svelte-gas-h59hi0");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, h3);
      append(h3, span0);
      append(h3, span1);
      append(span1, t1);
      append(span1, t2);
      append(h3, span2);
      insert(target, ul, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(ul, null);
        }
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*count*/
      2) set_data(
        t1,
        /*count*/
        ctx2[1]
      );
      if (dirty & /*fromUuid, advancement*/
      1) {
        each_value = ensure_array_like(
          /*advancement*/
          ctx2[0].configuration.pool
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(ul, null);
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
        detach(ul);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_if_block(ctx) {
  let div1;
  let div0;
  let t_value = getAdvancementValue(
    /*advancement*/
    ctx[0],
    "hint"
  ) + "";
  let t;
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      t = text(t_value);
      attr(div0, "class", "flex left");
      attr(div1, "class", "flexrow svelte-gas-h59hi0");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, div0);
      append(div0, t);
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
        detach(div1);
      }
    }
  };
}
function create_catch_block(ctx) {
  return { c: noop, m: noop, p: noop, d: noop };
}
function create_then_block(ctx) {
  let li;
  let div2;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div1;
  let t_value = (
    /*item*/
    ctx[5].name + ""
  );
  let t;
  return {
    c() {
      li = element("li");
      div2 = element("div");
      div0 = element("div");
      img = element("img");
      div1 = element("div");
      t = text(t_value);
      attr(img, "class", "icon svelte-gas-h59hi0");
      if (!src_url_equal(img.src, img_src_value = /*item*/
      ctx[5].img)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[5].name);
      attr(div0, "class", "flex0 relative image svelte-gas-h59hi0");
      attr(div1, "class", "flex2 svelte-gas-h59hi0");
      attr(div2, "class", "flexrow svelte-gas-h59hi0");
      attr(li, "class", "left svelte-gas-h59hi0");
    },
    m(target, anchor) {
      insert(target, li, anchor);
      append(li, div2);
      append(div2, div0);
      append(div0, img);
      append(div2, div1);
      append(div1, t);
    },
    p(ctx2, dirty) {
      if (dirty & /*advancement*/
      1 && !src_url_equal(img.src, img_src_value = /*item*/
      ctx2[5].img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*advancement*/
      1 && img_alt_value !== (img_alt_value = /*item*/
      ctx2[5].name)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty & /*advancement*/
      1 && t_value !== (t_value = /*item*/
      ctx2[5].name + "")) set_data(t, t_value);
    },
    d(detaching) {
      if (detaching) {
        detach(li);
      }
    }
  };
}
function create_pending_block(ctx) {
  return { c: noop, m: noop, p: noop, d: noop };
}
function create_each_block(ctx) {
  let await_block_anchor;
  let promise;
  let info = {
    ctx,
    current: null,
    token: null,
    hasCatch: false,
    pending: create_pending_block,
    then: create_then_block,
    catch: create_catch_block,
    value: 5
  };
  handle_promise(promise = fromUuid(
    /*pool*/
    ctx[2].uuid
  ), info);
  return {
    c() {
      await_block_anchor = empty();
      info.block.c();
    },
    m(target, anchor) {
      insert(target, await_block_anchor, anchor);
      info.block.m(target, info.anchor = anchor);
      info.mount = () => await_block_anchor.parentNode;
      info.anchor = await_block_anchor;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      info.ctx = ctx;
      if (dirty & /*advancement*/
      1 && promise !== (promise = fromUuid(
        /*pool*/
        ctx[2].uuid
      )) && handle_promise(promise, info)) ;
      else {
        update_await_block_branch(info, ctx, dirty);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(await_block_anchor);
      }
      info.block.d(detaching);
      info.token = null;
      info = null;
    }
  };
}
function create_fragment(ctx) {
  let div;
  let div_data_type_value;
  function select_block_type(ctx2, dirty) {
    if (
      /*advancement*/
      ctx2[0].title === "Cantrip"
    ) return create_if_block;
    return create_else_block;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      div = element("div");
      if_block.c();
      attr(div, "class", "advancement mt-sm svelte-gas-h59hi0");
      attr(div, "data-type", div_data_type_value = /*advancement*/
      ctx[0].type);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if_block.m(div, null);
    },
    p(ctx2, [dirty]) {
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(div, null);
        }
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
      if_block.d();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let count;
  let { advancement = null } = $$props;
  onMount(async () => {
  });
  $$self.$$set = ($$props2) => {
    if ("advancement" in $$props2) $$invalidate(0, advancement = $$props2.advancement);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*advancement*/
    1) {
      $$invalidate(1, count = advancement?.configuration?.choices?.[0] ? typeof advancement.configuration.choices[0] === "object" && advancement.configuration.choices[0] !== null ? advancement.configuration.choices[0].count : advancement.configuration.choices[0] : "-");
    }
  };
  return [advancement, count];
}
class ItemChoice extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { advancement: 0 });
  }
}
export {
  ItemChoice as default
};
//# sourceMappingURL=ItemChoice-D74QWV3-.js.map
