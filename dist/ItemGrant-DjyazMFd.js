import { S as SvelteComponent, i as init, s as safe_not_equal, B as ensure_array_like, C as noop, d as detach, D as destroy_each, j as attr, b as insert, e as append, f as element, o as onMount, N as src_url_equal, h as empty, F as set_data, G as text } from "./index-DP0LRSmf.js";
import { h as handle_promise, u as update_await_block_branch } from "./await_block-B8OGkR-w.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[4] = list[i];
  return child_ctx;
}
function create_catch_block_1(ctx) {
  return { c: noop, m: noop, p: noop, d: noop };
}
function create_then_block(ctx) {
  let div1;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  function select_block_type(ctx2, dirty) {
    if (
      /*item*/
      ctx2[4]?.link
    ) return create_if_block;
    return create_else_block;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      img = element("img");
      if_block.c();
      attr(img, "class", "icon");
      if (!src_url_equal(img.src, img_src_value = /*item*/
      ctx[4]?.img)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[4]?.name);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flexrow gap-4");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, div0);
      append(div0, img);
      if_block.m(div1, null);
    },
    p(ctx2, dirty) {
      if (dirty & /*items*/
      2 && !src_url_equal(img.src, img_src_value = /*item*/
      ctx2[4]?.img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*items*/
      2 && img_alt_value !== (img_alt_value = /*item*/
      ctx2[4]?.name)) {
        attr(img, "alt", img_alt_value);
      }
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(div1, null);
        }
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div1);
      }
      if_block.d();
    }
  };
}
function create_else_block(ctx) {
  let div;
  let t_value = (
    /*item*/
    ctx[4]?.name + ""
  );
  let t;
  return {
    c() {
      div = element("div");
      t = text(t_value);
      attr(div, "class", "flex2");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
    },
    p(ctx2, dirty) {
      if (dirty & /*items*/
      2 && t_value !== (t_value = /*item*/
      ctx2[4]?.name + "")) set_data(t, t_value);
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_if_block(ctx) {
  let await_block_anchor;
  let promise;
  let info = {
    ctx,
    current: null,
    token: null,
    hasCatch: false,
    pending: create_pending_block_1,
    then: create_then_block_1,
    catch: create_catch_block,
    value: 7
  };
  handle_promise(promise = TextEditor.enrichHTML(
    /*item*/
    ctx[4].link || ""
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
      if (dirty & /*items*/
      2 && promise !== (promise = TextEditor.enrichHTML(
        /*item*/
        ctx[4].link || ""
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
function create_catch_block(ctx) {
  return { c: noop, m: noop, p: noop, d: noop };
}
function create_then_block_1(ctx) {
  let div;
  let raw_value = (
    /*Html*/
    ctx[7] + ""
  );
  return {
    c() {
      div = element("div");
      attr(div, "class", "flex2");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      div.innerHTML = raw_value;
    },
    p(ctx2, dirty) {
      if (dirty & /*items*/
      2 && raw_value !== (raw_value = /*Html*/
      ctx2[7] + "")) div.innerHTML = raw_value;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_pending_block_1(ctx) {
  return { c: noop, m: noop, p: noop, d: noop };
}
function create_pending_block(ctx) {
  return { c: noop, m: noop, p: noop, d: noop };
}
function create_each_block(ctx) {
  let li;
  let promise;
  let info = {
    ctx,
    current: null,
    token: null,
    hasCatch: false,
    pending: create_pending_block,
    then: create_then_block,
    catch: create_catch_block_1,
    value: 7
  };
  handle_promise(promise = TextEditor.enrichHTML(
    /*item*/
    ctx[4]?.system?.description?.value || ""
  ), info);
  return {
    c() {
      li = element("li");
      info.block.c();
      attr(li, "class", "left");
    },
    m(target, anchor) {
      insert(target, li, anchor);
      info.block.m(li, info.anchor = null);
      info.mount = () => li;
      info.anchor = null;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      info.ctx = ctx;
      if (dirty & /*items*/
      2 && promise !== (promise = TextEditor.enrichHTML(
        /*item*/
        ctx[4]?.system?.description?.value || ""
      )) && handle_promise(promise, info)) ;
      else {
        update_await_block_branch(info, ctx, dirty);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(li);
      }
      info.block.d();
      info.token = null;
      info = null;
    }
  };
}
function create_fragment(ctx) {
  let div;
  let ul;
  let div_data_type_value;
  let each_value = ensure_array_like(
    /*items*/
    ctx[1]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  return {
    c() {
      div = element("div");
      ul = element("ul");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(ul, "class", "icon-list");
      attr(div, "class", "advancement mt-sm");
      attr(div, "data-type", div_data_type_value = /*advancement*/
      ctx[0].type);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, ul);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div, null);
        }
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*TextEditor, items*/
      2) {
        each_value = ensure_array_like(
          /*items*/
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
      destroy_each(each_blocks, detaching);
    }
  };
}
async function getItemsFromUUIDs(uuids) {
  const itemPromises = uuids.map(async (uuid) => {
    const item = await fromUuid(uuid);
    return item;
  });
  return Promise.all(itemPromises);
}
function instance($$self, $$props, $$invalidate) {
  let { advancement = null } = $$props;
  let initialId = null;
  let items = [];
  async function getItems() {
    if (advancement.configuration.items && Array.isArray(advancement.configuration.items)) {
      $$invalidate(1, items = await getItemsFromUUIDs(advancement.configuration.items.map((item) => item.uuid)));
    }
  }
  onMount(async () => {
    $$invalidate(2, initialId = advancement.id);
  });
  $$self.$$set = ($$props2) => {
    if ("advancement" in $$props2) $$invalidate(0, advancement = $$props2.advancement);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*advancement, initialId*/
    5) {
      if (advancement.id != initialId) {
        getItems();
        $$invalidate(2, initialId = advancement.id);
      }
    }
  };
  return [advancement, items, initialId];
}
class ItemGrant extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { advancement: 0 });
  }
}
export {
  ItemGrant as default
};
//# sourceMappingURL=ItemGrant-DjyazMFd.js.map
