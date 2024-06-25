import { S as SvelteComponent, i as init, s as safe_not_equal, z as ensure_array_like, e as element, b as attr, c as insert, d as append, A as noop, j as detach, B as destroy_each, o as onMount, F as text, L as src_url_equal, G as set_data } from "./index-FqPKwT-p.js";
import { h as handle_promise, u as update_await_block_branch } from "./await_block-BB3H1wLQ.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[4] = list[i];
  return child_ctx;
}
function create_catch_block(ctx) {
  return { c: noop, m: noop, p: noop, d: noop };
}
function create_then_block(ctx) {
  let div2;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div1;
  let t_value = (
    /*item*/
    ctx[4].name + ""
  );
  let t;
  let div2_data_tooltip_value;
  return {
    c() {
      div2 = element("div");
      div0 = element("div");
      img = element("img");
      div1 = element("div");
      t = text(t_value);
      attr(img, "class", "icon");
      if (!src_url_equal(img.src, img_src_value = /*item*/
      ctx[4].img)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[4].name);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow");
      attr(div2, "data-tooltip", div2_data_tooltip_value = /*Html*/
      ctx[7] || null);
      attr(div2, "data-tooltip-class", "gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip");
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, div0);
      append(div0, img);
      append(div2, div1);
      append(div1, t);
    },
    p(ctx2, dirty) {
      if (dirty & /*items*/
      2 && !src_url_equal(img.src, img_src_value = /*item*/
      ctx2[4].img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*items*/
      2 && img_alt_value !== (img_alt_value = /*item*/
      ctx2[4].name)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty & /*items*/
      2 && t_value !== (t_value = /*item*/
      ctx2[4].name + "")) set_data(t, t_value);
      if (dirty & /*items*/
      2 && div2_data_tooltip_value !== (div2_data_tooltip_value = /*Html*/
      ctx2[7] || null)) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div2);
      }
    }
  };
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
    catch: create_catch_block,
    value: 7
  };
  handle_promise(promise = TextEditor.enrichHTML(
    /*item*/
    ctx[4].system.description.value || ""
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
        ctx[4].system.description.value || ""
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
      attr(div, "class", "advancement mt-sm svelte-gas-o2pwds");
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
  let items;
  let { advancement = null } = $$props;
  let initialId = null;
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
  $$invalidate(1, items = []);
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
//# sourceMappingURL=ItemGrant-BITMg3W9.js.map
