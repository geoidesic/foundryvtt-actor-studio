import { S as SvelteComponent, i as init, s as safe_not_equal, C as noop, d as detach, F as set_data, b as insert, e as append, f as element, Z as space, G as text, j as attr, aL as assign, x as destroy_component, t as transition_out, a as transition_in, aO as get_spread_update, aS as get_spread_object, aM as toggle_class, aT as set_input_value, z as mount_component, Y as listen, A as create_component, l as localize, k as component_subscribe, aU as shopItems, aV as shopCart, aW as remainingGold, aX as cartTotalCost, aY as availableGold, r as readOnlyTabs, o as onMount, aZ as initializeGold, a_ as loadShopItems, aH as onDestroy, a$ as get_store_value, b0 as updateCart, v as binding_callbacks, B as ensure_array_like, D as destroy_each, h as empty, N as src_url_equal, b1 as update_keyed_each, b2 as destroy_block, b3 as prevent_default } from "./index-mC2l1kYX.js";
function create_if_block_1$1(ctx) {
  let span;
  let t0;
  let t1;
  let i;
  return {
    c() {
      span = element("span");
      t0 = text(
        /*gp*/
        ctx[0]
      );
      t1 = space();
      i = element("i");
      attr(i, "class", "fas fa-coins gold-coin svelte-gas-xw5e4p");
      attr(span, "class", "gold svelte-gas-xw5e4p");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t0);
      append(span, t1);
      append(span, i);
    },
    p(ctx2, dirty) {
      if (dirty & /*gp*/
      1) set_data(
        t0,
        /*gp*/
        ctx2[0]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block$1(ctx) {
  let span;
  let t0;
  let t1;
  let i;
  return {
    c() {
      span = element("span");
      t0 = text(
        /*sp*/
        ctx[1]
      );
      t1 = space();
      i = element("i");
      attr(i, "class", "fas fa-coins silver-coin svelte-gas-xw5e4p");
      attr(span, "class", "silver svelte-gas-xw5e4p");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t0);
      append(span, t1);
      append(span, i);
    },
    p(ctx2, dirty) {
      if (dirty & /*sp*/
      2) set_data(
        t0,
        /*sp*/
        ctx2[1]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_fragment$1(ctx) {
  let div;
  let t0;
  let t1;
  let span;
  let t2;
  let t3;
  let i;
  let if_block0 = (
    /*gp*/
    ctx[0] !== 0 && create_if_block_1$1(ctx)
  );
  let if_block1 = (
    /*sp*/
    (ctx[1] !== 0 || /*gp*/
    ctx[0] !== 0) && create_if_block$1(ctx)
  );
  return {
    c() {
      div = element("div");
      if (if_block0) if_block0.c();
      t0 = space();
      if (if_block1) if_block1.c();
      t1 = space();
      span = element("span");
      t2 = text(
        /*cp*/
        ctx[2]
      );
      t3 = space();
      i = element("i");
      attr(i, "class", "fas fa-coins copper-coin svelte-gas-xw5e4p");
      attr(span, "class", "copper svelte-gas-xw5e4p");
      attr(div, "class", "currency-display svelte-gas-xw5e4p");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if (if_block0) if_block0.m(div, null);
      append(div, t0);
      if (if_block1) if_block1.m(div, null);
      append(div, t1);
      append(div, span);
      append(span, t2);
      append(span, t3);
      append(span, i);
    },
    p(ctx2, [dirty]) {
      if (
        /*gp*/
        ctx2[0] !== 0
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_1$1(ctx2);
          if_block0.c();
          if_block0.m(div, t0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (
        /*sp*/
        ctx2[1] !== 0 || /*gp*/
        ctx2[0] !== 0
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block$1(ctx2);
          if_block1.c();
          if_block1.m(div, t1);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (dirty & /*cp*/
      4) set_data(
        t2,
        /*cp*/
        ctx2[2]
      );
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
    }
  };
}
function instance$1($$self, $$props, $$invalidate) {
  let { gp = 0 } = $$props;
  let { sp = 0 } = $$props;
  let { cp = 0 } = $$props;
  $$self.$$set = ($$props2) => {
    if ("gp" in $$props2) $$invalidate(0, gp = $$props2.gp);
    if ("sp" in $$props2) $$invalidate(1, sp = $$props2.sp);
    if ("cp" in $$props2) $$invalidate(2, cp = $$props2.cp);
  };
  return [gp, sp, cp];
}
class GoldDisplay extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, { gp: 0, sp: 1, cp: 2 });
  }
}
class PurchaseHandler {
  constructor() {
  }
  // Format a copper value to display GP, SP, CP
  static formatCurrency(totalCopper) {
    const isNegative = totalCopper < 0;
    const absCopper = Math.abs(totalCopper);
    let gp = Math.floor(absCopper / 100);
    let sp = Math.floor(absCopper % 100 / 10);
    let cp = absCopper % 10;
    if (isNegative) {
      if (gp > 0) {
        gp = -gp;
      } else if (sp > 0) {
        sp = -sp;
      } else {
        cp = -cp;
      }
    }
    return { gp, sp, cp };
  }
  // Calculate the total cost of items in cart
  static calculateTotalCost(items, cart) {
    let totalCopper = 0;
    cart.forEach((quantity, itemId) => {
      const item = items.find((i) => i.id === itemId);
      if (item && item.system?.price) {
        const value = item.system.price.value || 0;
        const denomination = item.system.price.denomination || "cp";
        let multiplier = 1;
        switch (denomination) {
          case "gp":
            multiplier = 100;
            break;
          case "sp":
            multiplier = 10;
            break;
          case "pp":
            multiplier = 1e3;
            break;
          case "ep":
            multiplier = 50;
            break;
          default:
            multiplier = 1;
        }
        totalCopper += value * multiplier * quantity;
      }
    });
    return totalCopper;
  }
  // Format price for display
  static formatPrice(value, denomination) {
    if (!value) return "0 cp";
    denomination = denomination || "cp";
    return `${value} ${denomination}`;
  }
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[29] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[32] = list[i];
  return child_ctx;
}
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[35] = list[i];
  return child_ctx;
}
function create_else_block_2(ctx) {
  let each_1_anchor;
  let each_value_2 = ensure_array_like(
    /*cartItems*/
    ctx[7]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_2.length; i += 1) {
    each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
  }
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert(target, each_1_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*isDisabled, removeFromCart, cartItems*/
      20608) {
        each_value_2 = ensure_array_like(
          /*cartItems*/
          ctx2[7]
        );
        let i;
        for (i = 0; i < each_value_2.length; i += 1) {
          const child_ctx = get_each_context_2(ctx2, each_value_2, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_2(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_2.length;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(each_1_anchor);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_if_block_5(ctx) {
  let div;
  let p;
  return {
    c() {
      div = element("div");
      p = element("p");
      p.textContent = `${localize("GAS.Shop.CartEmpty")}`;
      attr(div, "class", "empty-cart svelte-gas-1d2vv1c");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, p);
    },
    p: noop,
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_each_block_2(ctx) {
  let div5;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let t0;
  let div3;
  let div1;
  let t1_value = getItemDisplayName(
    /*cartItem*/
    ctx[35].item
  ) + "";
  let t1;
  let t2;
  let div2;
  let span0;
  let t3_value = (
    /*cartItem*/
    ctx[35].price.value + ""
  );
  let t3;
  let t4;
  let t5_value = (
    /*cartItem*/
    ctx[35].price.denomination + ""
  );
  let t5;
  let t6;
  let span1;
  let t7;
  let t8_value = (
    /*cartItem*/
    ctx[35].quantity + ""
  );
  let t8;
  let t9;
  let div4;
  let button;
  let i;
  let t10;
  let mounted;
  let dispose;
  function click_handler() {
    return (
      /*click_handler*/
      ctx[21](
        /*cartItem*/
        ctx[35]
      )
    );
  }
  return {
    c() {
      div5 = element("div");
      div0 = element("div");
      img = element("img");
      t0 = space();
      div3 = element("div");
      div1 = element("div");
      t1 = text(t1_value);
      t2 = space();
      div2 = element("div");
      span0 = element("span");
      t3 = text(t3_value);
      t4 = space();
      t5 = text(t5_value);
      t6 = space();
      span1 = element("span");
      t7 = text("×");
      t8 = text(t8_value);
      t9 = space();
      div4 = element("div");
      button = element("button");
      i = element("i");
      t10 = space();
      if (!src_url_equal(img.src, img_src_value = /*cartItem*/
      ctx[35].item.img)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*cartItem*/
      ctx[35].item.name);
      attr(img, "class", "item-icon svelte-gas-1d2vv1c");
      attr(div0, "class", "cart-item-col1 svelte-gas-1d2vv1c");
      attr(div1, "class", "cart-item-name svelte-gas-1d2vv1c");
      attr(span0, "class", "cart-item-price svelte-gas-1d2vv1c");
      attr(span1, "class", "quantity-display svelte-gas-1d2vv1c");
      attr(div2, "class", "cart-item-subdetails svelte-gas-1d2vv1c");
      attr(div3, "class", "cart-item-col2 left svelte-gas-1d2vv1c");
      attr(i, "class", "fas fa-trash");
      attr(button, "class", "remove-btn svelte-gas-1d2vv1c");
      button.disabled = /*isDisabled*/
      ctx[12];
      attr(div4, "class", "cart-item-col3 svelte-gas-1d2vv1c");
      attr(div5, "class", "cart-item svelte-gas-1d2vv1c");
    },
    m(target, anchor) {
      insert(target, div5, anchor);
      append(div5, div0);
      append(div0, img);
      append(div5, t0);
      append(div5, div3);
      append(div3, div1);
      append(div1, t1);
      append(div3, t2);
      append(div3, div2);
      append(div2, span0);
      append(span0, t3);
      append(span0, t4);
      append(span0, t5);
      append(div2, t6);
      append(div2, span1);
      append(span1, t7);
      append(span1, t8);
      append(div5, t9);
      append(div5, div4);
      append(div4, button);
      append(button, i);
      append(div5, t10);
      if (!mounted) {
        dispose = listen(button, "click", click_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*cartItems*/
      128 && !src_url_equal(img.src, img_src_value = /*cartItem*/
      ctx[35].item.img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty[0] & /*cartItems*/
      128 && img_alt_value !== (img_alt_value = /*cartItem*/
      ctx[35].item.name)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty[0] & /*cartItems*/
      128 && t1_value !== (t1_value = getItemDisplayName(
        /*cartItem*/
        ctx[35].item
      ) + "")) set_data(t1, t1_value);
      if (dirty[0] & /*cartItems*/
      128 && t3_value !== (t3_value = /*cartItem*/
      ctx[35].price.value + "")) set_data(t3, t3_value);
      if (dirty[0] & /*cartItems*/
      128 && t5_value !== (t5_value = /*cartItem*/
      ctx[35].price.denomination + "")) set_data(t5, t5_value);
      if (dirty[0] & /*cartItems*/
      128 && t8_value !== (t8_value = /*cartItem*/
      ctx[35].quantity + "")) set_data(t8, t8_value);
      if (dirty[0] & /*isDisabled*/
      4096) {
        button.disabled = /*isDisabled*/
        ctx[12];
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div5);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_else_block(ctx) {
  let each_1_anchor;
  let each_value = ensure_array_like(
    /*categories*/
    ctx[11]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert(target, each_1_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*categoryGroups, categories, isDisabled, addToCart, expandedCategories, toggleCategory*/
      47362) {
        each_value = ensure_array_like(
          /*categories*/
          ctx2[11]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
        detach(each_1_anchor);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_if_block_2(ctx) {
  let div;
  let p;
  let t_value = (
    /*keywordFilter*/
    (ctx[0] ? localize("GAS.Shop.NoMatchingEquipment") : localize("GAS.Shop.NoEquipment")) + ""
  );
  let t;
  return {
    c() {
      div = element("div");
      p = element("p");
      t = text(t_value);
      attr(div, "class", "empty-state svelte-gas-1d2vv1c");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, p);
      append(p, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*keywordFilter*/
      1 && t_value !== (t_value = /*keywordFilter*/
      (ctx2[0] ? localize("GAS.Shop.NoMatchingEquipment") : localize("GAS.Shop.NoEquipment")) + "")) set_data(t, t_value);
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
  return {
    c() {
      div = element("div");
      div.textContent = `${localize("GAS.Shop.Loading")}`;
      attr(div, "class", "loading svelte-gas-1d2vv1c");
    },
    m(target, anchor) {
      insert(target, div, anchor);
    },
    p: noop,
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_else_block_1(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "[+]";
    },
    m(target, anchor) {
      insert(target, span, anchor);
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block_4(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "[-]";
    },
    m(target, anchor) {
      insert(target, span, anchor);
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block_3(ctx) {
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_1_anchor;
  let each_value_1 = ensure_array_like(
    /*categoryGroups*/
    ctx[1][
      /*category*/
      ctx[29]
    ]
  );
  const get_key = (ctx2) => (
    /*item*/
    ctx2[32].uuid || /*item*/
    ctx2[32]._id
  );
  for (let i = 0; i < each_value_1.length; i += 1) {
    let child_ctx = get_each_context_1(ctx, each_value_1, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
  }
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert(target, each_1_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*isDisabled, addToCart, categoryGroups, categories*/
      14338) {
        each_value_1 = ensure_array_like(
          /*categoryGroups*/
          ctx2[1][
            /*category*/
            ctx2[29]
          ]
        );
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value_1, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block_1, each_1_anchor, get_each_context_1);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(each_1_anchor);
      }
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d(detaching);
      }
    }
  };
}
function create_each_block_1(key_1, ctx) {
  let div2;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let t0;
  let span0;
  let t1_value = getItemDisplayName(
    /*item*/
    ctx[32]
  ) + "";
  let t1;
  let t2;
  let div1;
  let span1;
  let t3_value = (
    /*item*/
    (ctx[32].system?.price?.value || 0) + ""
  );
  let t3;
  let t4;
  let t5_value = (
    /*item*/
    (ctx[32].system?.price?.denomination || "cp") + ""
  );
  let t5;
  let t6;
  let button;
  let i;
  let t7;
  let mounted;
  let dispose;
  function click_handler_2() {
    return (
      /*click_handler_2*/
      ctx[25](
        /*item*/
        ctx[32]
      )
    );
  }
  return {
    key: key_1,
    first: null,
    c() {
      div2 = element("div");
      div0 = element("div");
      img = element("img");
      t0 = space();
      span0 = element("span");
      t1 = text(t1_value);
      t2 = space();
      div1 = element("div");
      span1 = element("span");
      t3 = text(t3_value);
      t4 = space();
      t5 = text(t5_value);
      t6 = space();
      button = element("button");
      i = element("i");
      t7 = space();
      if (!src_url_equal(img.src, img_src_value = /*item*/
      ctx[32].img)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[32].name);
      attr(img, "class", "item-icon svelte-gas-1d2vv1c");
      attr(span0, "class", "item-name");
      attr(div0, "class", "item-details svelte-gas-1d2vv1c");
      attr(span1, "class", "item-price svelte-gas-1d2vv1c");
      attr(i, "class", "fas fa-plus svelte-gas-1d2vv1c");
      attr(button, "class", "add-btn svelte-gas-1d2vv1c");
      button.disabled = /*isDisabled*/
      ctx[12];
      attr(div1, "class", "item-actions svelte-gas-1d2vv1c");
      attr(div2, "class", "item-row svelte-gas-1d2vv1c");
      this.first = div2;
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, div0);
      append(div0, img);
      append(div0, t0);
      append(div0, span0);
      append(span0, t1);
      append(div2, t2);
      append(div2, div1);
      append(div1, span1);
      append(span1, t3);
      append(span1, t4);
      append(span1, t5);
      append(div1, t6);
      append(div1, button);
      append(button, i);
      append(div2, t7);
      if (!mounted) {
        dispose = listen(button, "click", prevent_default(click_handler_2));
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*categoryGroups, categories*/
      2050 && !src_url_equal(img.src, img_src_value = /*item*/
      ctx[32].img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty[0] & /*categoryGroups, categories*/
      2050 && img_alt_value !== (img_alt_value = /*item*/
      ctx[32].name)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty[0] & /*categoryGroups, categories*/
      2050 && t1_value !== (t1_value = getItemDisplayName(
        /*item*/
        ctx[32]
      ) + "")) set_data(t1, t1_value);
      if (dirty[0] & /*categoryGroups, categories*/
      2050 && t3_value !== (t3_value = /*item*/
      (ctx[32].system?.price?.value || 0) + "")) set_data(t3, t3_value);
      if (dirty[0] & /*categoryGroups, categories*/
      2050 && t5_value !== (t5_value = /*item*/
      (ctx[32].system?.price?.denomination || "cp") + "")) set_data(t5, t5_value);
      if (dirty[0] & /*isDisabled*/
      4096) {
        button.disabled = /*isDisabled*/
        ctx[12];
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div2);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_each_block(ctx) {
  let div2;
  let h4;
  let div0;
  let t0;
  let div1;
  let t1_value = (
    /*category*/
    ctx[29] + ""
  );
  let t1;
  let t2;
  let t3;
  let mounted;
  let dispose;
  function select_block_type_2(ctx2, dirty) {
    if (
      /*expandedCategories*/
      ctx2[8][
        /*category*/
        ctx2[29]
      ]
    ) return create_if_block_4;
    return create_else_block_1;
  }
  let current_block_type = select_block_type_2(ctx);
  let if_block0 = current_block_type(ctx);
  function click_handler_1() {
    return (
      /*click_handler_1*/
      ctx[24](
        /*category*/
        ctx[29]
      )
    );
  }
  let if_block1 = (
    /*expandedCategories*/
    ctx[8][
      /*category*/
      ctx[29]
    ] && create_if_block_3(ctx)
  );
  return {
    c() {
      div2 = element("div");
      h4 = element("h4");
      div0 = element("div");
      if_block0.c();
      t0 = space();
      div1 = element("div");
      t1 = text(t1_value);
      t2 = space();
      if (if_block1) if_block1.c();
      t3 = space();
      attr(div0, "class", "flex0 mr-xs");
      attr(div1, "class", "flex");
      attr(h4, "class", "left mt-sm flexrow category-header pointer svelte-gas-1d2vv1c");
      attr(div2, "class", "category svelte-gas-1d2vv1c");
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, h4);
      append(h4, div0);
      if_block0.m(div0, null);
      append(h4, t0);
      append(h4, div1);
      append(div1, t1);
      append(div2, t2);
      if (if_block1) if_block1.m(div2, null);
      append(div2, t3);
      if (!mounted) {
        dispose = listen(h4, "click", click_handler_1);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (current_block_type !== (current_block_type = select_block_type_2(ctx))) {
        if_block0.d(1);
        if_block0 = current_block_type(ctx);
        if (if_block0) {
          if_block0.c();
          if_block0.m(div0, null);
        }
      }
      if (dirty[0] & /*categories*/
      2048 && t1_value !== (t1_value = /*category*/
      ctx[29] + "")) set_data(t1, t1_value);
      if (
        /*expandedCategories*/
        ctx[8][
          /*category*/
          ctx[29]
        ]
      ) {
        if (if_block1) {
          if_block1.p(ctx, dirty);
        } else {
          if_block1 = create_if_block_3(ctx);
          if_block1.c();
          if_block1.m(div2, t3);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div2);
      }
      if_block0.d();
      if (if_block1) if_block1.d();
      mounted = false;
      dispose();
    }
  };
}
function create_if_block(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      attr(div, "class", "overlay svelte-gas-1d2vv1c");
    },
    m(target, anchor) {
      insert(target, div, anchor);
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_fragment(ctx) {
  let div8;
  let div0;
  let golddisplay0;
  let t0;
  let div7;
  let div4;
  let div2;
  let h30;
  let t2;
  let div1;
  let golddisplay1;
  let t3;
  let h31;
  let t5;
  let golddisplay2;
  let t6;
  let h32;
  let t8;
  let div3;
  let t9;
  let div6;
  let h33;
  let t11;
  let div5;
  let input;
  let t12;
  let t13;
  let current;
  let mounted;
  let dispose;
  const golddisplay0_spread_levels = [
    /*remainingCurrency*/
    ctx[5]
  ];
  let golddisplay0_props = {};
  for (let i = 0; i < golddisplay0_spread_levels.length; i += 1) {
    golddisplay0_props = assign(golddisplay0_props, golddisplay0_spread_levels[i]);
  }
  golddisplay0 = new GoldDisplay({ props: golddisplay0_props });
  const golddisplay1_spread_levels = [
    /*remainingCurrency*/
    ctx[5]
  ];
  let golddisplay1_props = {};
  for (let i = 0; i < golddisplay1_spread_levels.length; i += 1) {
    golddisplay1_props = assign(golddisplay1_props, golddisplay1_spread_levels[i]);
  }
  golddisplay1 = new GoldDisplay({ props: golddisplay1_props });
  const golddisplay2_spread_levels = [
    /*cartCurrency*/
    ctx[4]
  ];
  let golddisplay2_props = {};
  for (let i = 0; i < golddisplay2_spread_levels.length; i += 1) {
    golddisplay2_props = assign(golddisplay2_props, golddisplay2_spread_levels[i]);
  }
  golddisplay2 = new GoldDisplay({ props: golddisplay2_props });
  function select_block_type(ctx2, dirty) {
    if (
      /*cartItems*/
      ctx2[7].length === 0
    ) return create_if_block_5;
    return create_else_block_2;
  }
  let current_block_type = select_block_type(ctx);
  let if_block0 = current_block_type(ctx);
  function select_block_type_1(ctx2, dirty) {
    if (
      /*loading*/
      ctx2[6]
    ) return create_if_block_1;
    if (
      /*filteredItems*/
      ctx2[2].length === 0
    ) return create_if_block_2;
    return create_else_block;
  }
  let current_block_type_1 = select_block_type_1(ctx);
  let if_block1 = current_block_type_1(ctx);
  let if_block2 = (
    /*isDisabled*/
    ctx[12] && create_if_block()
  );
  return {
    c() {
      div8 = element("div");
      div0 = element("div");
      create_component(golddisplay0.$$.fragment);
      t0 = space();
      div7 = element("div");
      div4 = element("div");
      div2 = element("div");
      h30 = element("h3");
      h30.textContent = `${localize("GAS.Shop.AvailableGold")}`;
      t2 = space();
      div1 = element("div");
      create_component(golddisplay1.$$.fragment);
      t3 = space();
      h31 = element("h3");
      h31.textContent = `${localize("GAS.Shop.SpentGold")}`;
      t5 = space();
      create_component(golddisplay2.$$.fragment);
      t6 = space();
      h32 = element("h3");
      h32.textContent = `${localize("GAS.Shop.CartItems")}`;
      t8 = space();
      div3 = element("div");
      if_block0.c();
      t9 = space();
      div6 = element("div");
      h33 = element("h3");
      h33.textContent = `${localize("GAS.Shop.AvailableEquipment")}`;
      t11 = space();
      div5 = element("div");
      input = element("input");
      t12 = space();
      if_block1.c();
      t13 = space();
      if (if_block2) if_block2.c();
      attr(div0, "class", "sticky-header svelte-gas-1d2vv1c");
      toggle_class(div0, "hidden", !/*scrolled*/
      ctx[9]);
      attr(h30, "class", "left no-margin svelte-gas-1d2vv1c");
      attr(div1, "class", "remaining-currency svelte-gas-1d2vv1c");
      toggle_class(
        div1,
        "negative",
        /*$remainingGold*/
        ctx[3] < 0
      );
      attr(h31, "class", "left no-margin svelte-gas-1d2vv1c");
      attr(div2, "class", "panel-header svelte-gas-1d2vv1c");
      toggle_class(
        div2,
        "hidden",
        /*scrolled*/
        ctx[9]
      );
      attr(h32, "class", "svelte-gas-1d2vv1c");
      attr(div3, "class", "cart-items svelte-gas-1d2vv1c");
      attr(div4, "class", "left-panel svelte-gas-1d2vv1c");
      attr(h33, "class", "svelte-gas-1d2vv1c");
      attr(input, "type", "text");
      attr(input, "placeholder", localize("GAS.Shop.FilterPlaceholder"));
      attr(input, "class", "keyword-filter svelte-gas-1d2vv1c");
      input.disabled = /*isDisabled*/
      ctx[12];
      attr(div5, "class", "filter-container mb-sm svelte-gas-1d2vv1c");
      attr(div6, "class", "right-panel item-list svelte-gas-1d2vv1c");
      attr(div7, "class", "shop-tab svelte-gas-1d2vv1c");
      attr(div8, "class", "shop-tab-container svelte-gas-1d2vv1c");
      toggle_class(
        div8,
        "disabled",
        /*isDisabled*/
        ctx[12]
      );
    },
    m(target, anchor) {
      insert(target, div8, anchor);
      append(div8, div0);
      mount_component(golddisplay0, div0, null);
      append(div8, t0);
      append(div8, div7);
      append(div7, div4);
      append(div4, div2);
      append(div2, h30);
      append(div2, t2);
      append(div2, div1);
      mount_component(golddisplay1, div1, null);
      append(div2, t3);
      append(div2, h31);
      append(div2, t5);
      mount_component(golddisplay2, div2, null);
      append(div4, t6);
      append(div4, h32);
      append(div4, t8);
      append(div4, div3);
      if_block0.m(div3, null);
      ctx[22](div4);
      append(div7, t9);
      append(div7, div6);
      append(div6, h33);
      append(div6, t11);
      append(div6, div5);
      append(div5, input);
      set_input_value(
        input,
        /*keywordFilter*/
        ctx[0]
      );
      append(div6, t12);
      if_block1.m(div6, null);
      append(div8, t13);
      if (if_block2) if_block2.m(div8, null);
      current = true;
      if (!mounted) {
        dispose = listen(
          input,
          "input",
          /*input_input_handler*/
          ctx[23]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      const golddisplay0_changes = dirty[0] & /*remainingCurrency*/
      32 ? get_spread_update(golddisplay0_spread_levels, [get_spread_object(
        /*remainingCurrency*/
        ctx2[5]
      )]) : {};
      golddisplay0.$set(golddisplay0_changes);
      if (!current || dirty[0] & /*scrolled*/
      512) {
        toggle_class(div0, "hidden", !/*scrolled*/
        ctx2[9]);
      }
      const golddisplay1_changes = dirty[0] & /*remainingCurrency*/
      32 ? get_spread_update(golddisplay1_spread_levels, [get_spread_object(
        /*remainingCurrency*/
        ctx2[5]
      )]) : {};
      golddisplay1.$set(golddisplay1_changes);
      if (!current || dirty[0] & /*$remainingGold*/
      8) {
        toggle_class(
          div1,
          "negative",
          /*$remainingGold*/
          ctx2[3] < 0
        );
      }
      const golddisplay2_changes = dirty[0] & /*cartCurrency*/
      16 ? get_spread_update(golddisplay2_spread_levels, [get_spread_object(
        /*cartCurrency*/
        ctx2[4]
      )]) : {};
      golddisplay2.$set(golddisplay2_changes);
      if (!current || dirty[0] & /*scrolled*/
      512) {
        toggle_class(
          div2,
          "hidden",
          /*scrolled*/
          ctx2[9]
        );
      }
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block0) {
        if_block0.p(ctx2, dirty);
      } else {
        if_block0.d(1);
        if_block0 = current_block_type(ctx2);
        if (if_block0) {
          if_block0.c();
          if_block0.m(div3, null);
        }
      }
      if (!current || dirty[0] & /*isDisabled*/
      4096) {
        input.disabled = /*isDisabled*/
        ctx2[12];
      }
      if (dirty[0] & /*keywordFilter*/
      1 && input.value !== /*keywordFilter*/
      ctx2[0]) {
        set_input_value(
          input,
          /*keywordFilter*/
          ctx2[0]
        );
      }
      if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx2)) && if_block1) {
        if_block1.p(ctx2, dirty);
      } else {
        if_block1.d(1);
        if_block1 = current_block_type_1(ctx2);
        if (if_block1) {
          if_block1.c();
          if_block1.m(div6, null);
        }
      }
      if (
        /*isDisabled*/
        ctx2[12]
      ) {
        if (if_block2) ;
        else {
          if_block2 = create_if_block();
          if_block2.c();
          if_block2.m(div8, null);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (!current || dirty[0] & /*isDisabled*/
      4096) {
        toggle_class(
          div8,
          "disabled",
          /*isDisabled*/
          ctx2[12]
        );
      }
    },
    i(local) {
      if (current) return;
      transition_in(golddisplay0.$$.fragment, local);
      transition_in(golddisplay1.$$.fragment, local);
      transition_in(golddisplay2.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(golddisplay0.$$.fragment, local);
      transition_out(golddisplay1.$$.fragment, local);
      transition_out(golddisplay2.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div8);
      }
      destroy_component(golddisplay0);
      destroy_component(golddisplay1);
      destroy_component(golddisplay2);
      if_block0.d();
      ctx[22](null);
      if_block1.d();
      if (if_block2) if_block2.d();
      mounted = false;
      dispose();
    }
  };
}
function getItemDisplayName(item) {
  return item.name;
}
function instance($$self, $$props, $$invalidate) {
  let isDisabled;
  let filteredItems;
  let categoryGroups;
  let categories;
  let $shopItems;
  let $shopCart;
  let $remainingGold;
  let $cartTotalCost;
  let $availableGold;
  let $readOnlyTabs;
  component_subscribe($$self, shopItems, ($$value) => $$invalidate(16, $shopItems = $$value));
  component_subscribe($$self, shopCart, ($$value) => $$invalidate(17, $shopCart = $$value));
  component_subscribe($$self, remainingGold, ($$value) => $$invalidate(3, $remainingGold = $$value));
  component_subscribe($$self, cartTotalCost, ($$value) => $$invalidate(18, $cartTotalCost = $$value));
  component_subscribe($$self, availableGold, ($$value) => $$invalidate(19, $availableGold = $$value));
  component_subscribe($$self, readOnlyTabs, ($$value) => $$invalidate(20, $readOnlyTabs = $$value));
  let cartCurrency = { gp: 0, sp: 0, cp: 0 };
  let remainingCurrency = { gp: 0, sp: 0, cp: 0 };
  let loading = true;
  let cartItems = [];
  let keywordFilter = "";
  let expandedCategories = {};
  async function addToCart(item) {
    try {
      const itemId = item.id || item._id;
      if (!itemId) {
        console.error("Item has no id:", item);
        ui.notifications?.warn(localize("GAS.Shop.ErrorItemNoId"));
        return;
      }
      const fullItemData = await fromUuid(item.uuid);
      if (!fullItemData) {
        console.error("Could not load full item data for UUID:", item.uuid);
        ui.notifications?.warn(localize("GAS.Shop.ErrorLoadingItem"));
        return;
      }
      const cart = get_store_value(shopCart);
      const currentQuantity = cart.has(itemId) ? cart.get(itemId).quantity : 0;
      const bundleQuantity = fullItemData.system?.quantity || 1;
      const newQuantity = currentQuantity + bundleQuantity;
      updateCart(itemId, newQuantity, fullItemData, item.uuid);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      ui.notifications?.warn(localize("GAS.Shop.ErrorAddToCart"));
    }
  }
  function removeFromCart(itemId) {
    try {
      updateCart(itemId, 0, null);
    } catch (error) {
      console.error("Error removing item from cart:", error);
      ui.notifications?.warn(localize("GAS.Shop.ErrorRemoveFromCart"));
    }
  }
  function toggleCategory(category) {
    $$invalidate(8, expandedCategories[category] = !expandedCategories[category], expandedCategories);
    $$invalidate(8, expandedCategories = { ...expandedCategories });
  }
  let scrolled = false;
  let shopContainer;
  let cleanup;
  onMount(async () => {
    $$invalidate(6, loading = true);
    initializeGold();
    await loadShopItems();
    $$invalidate(6, loading = false);
    const scrollingContainer = document.querySelector("#foundryvtt-actor-studio-pc-sheet section.a");
    if (scrollingContainer) {
      const handleScroll = () => {
        $$invalidate(9, scrolled = scrollingContainer.scrollTop > 0);
      };
      scrollingContainer.addEventListener("scroll", handleScroll);
      cleanup = () => {
        scrollingContainer.removeEventListener("scroll", handleScroll);
      };
    }
  });
  onDestroy(() => {
    if (cleanup) {
      cleanup();
    }
  });
  const click_handler = (cartItem) => removeFromCart(cartItem.id);
  function div4_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      shopContainer = $$value;
      $$invalidate(10, shopContainer);
    });
  }
  function input_input_handler() {
    keywordFilter = this.value;
    $$invalidate(0, keywordFilter);
  }
  const click_handler_1 = (category) => toggleCategory(category);
  const click_handler_2 = (item) => addToCart(item);
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*$readOnlyTabs*/
    1048576) {
      $$invalidate(12, isDisabled = $readOnlyTabs.includes("shop"));
    }
    if ($$self.$$.dirty[0] & /*$availableGold*/
    524288) {
      PurchaseHandler.formatCurrency($availableGold);
    }
    if ($$self.$$.dirty[0] & /*$cartTotalCost*/
    262144) {
      $$invalidate(4, cartCurrency = PurchaseHandler.formatCurrency($cartTotalCost));
    }
    if ($$self.$$.dirty[0] & /*$remainingGold*/
    8) {
      $$invalidate(5, remainingCurrency = PurchaseHandler.formatCurrency($remainingGold));
    }
    if ($$self.$$.dirty[0] & /*$shopCart*/
    131072) {
      {
        if ($shopCart) {
          $$invalidate(7, cartItems = Array.from($shopCart.entries()).map(([itemId, { quantity, itemData }]) => {
            if (itemData) {
              return {
                id: itemId,
                item: itemData,
                quantity,
                price: {
                  value: itemData.system?.price?.value || 0,
                  denomination: itemData.system?.price?.denomination || "cp"
                }
              };
            }
            return null;
          }).filter((item) => item !== null));
        }
      }
    }
    if ($$self.$$.dirty[0] & /*$shopItems, keywordFilter*/
    65537) {
      $$invalidate(2, filteredItems = $shopItems.filter((item) => item.name.toLowerCase().includes(keywordFilter.toLowerCase())));
    }
    if ($$self.$$.dirty[0] & /*filteredItems*/
    4) {
      $$invalidate(1, categoryGroups = filteredItems.reduce(
        (acc, item) => {
          const category = item.type.charAt(0).toUpperCase() + item.type.slice(1) + "s";
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
          return acc;
        },
        {}
      ));
    }
    if ($$self.$$.dirty[0] & /*categoryGroups*/
    2) {
      $$invalidate(11, categories = Object.keys(categoryGroups).sort());
    }
  };
  return [
    keywordFilter,
    categoryGroups,
    filteredItems,
    $remainingGold,
    cartCurrency,
    remainingCurrency,
    loading,
    cartItems,
    expandedCategories,
    scrolled,
    shopContainer,
    categories,
    isDisabled,
    addToCart,
    removeFromCart,
    toggleCategory,
    $shopItems,
    $shopCart,
    $cartTotalCost,
    $availableGold,
    $readOnlyTabs,
    click_handler,
    div4_binding,
    input_input_handler,
    click_handler_1,
    click_handler_2
  ];
}
class ShopTab extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);
  }
}
export {
  ShopTab as default
};
//# sourceMappingURL=ShopTab-sFMgZkyU.js.map
