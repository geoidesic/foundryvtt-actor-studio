import { S as SvelteComponent, i as init, s as safe_not_equal, C as noop, k as detach, F as set_data, q as insert, u as append, v as element, W as space, G as text, x as attr, l as localize, d as destroy_component, t as transition_out, a as transition_in, m as mount_component, c as create_component, b as component_subscribe, bd as remainingGold, be as shopItems, bf as shopCart, bg as cartTotalCost, bh as availableGold, r as readOnlyTabs, o as onMount, bi as initializeGold, bj as loadShopItems, b5 as onDestroy, a0 as assign, Z as get_spread_update, $ as get_spread_object, Y as toggle_class, ac as set_input_value, a5 as listen, aL as enrichHTML, bk as get_store_value, bl as updateCart, B as ensure_array_like, D as destroy_each, w as empty, N as src_url_equal, aU as HtmlTag, bm as update_keyed_each, bc as prevent_default, bn as destroy_block } from "./index-BvUQyTh7.js";
import { h as handle_promise, u as update_await_block_branch } from "./await_block-De0yPkJz.js";
import { S as StandardTabLayout } from "./StandardTabLayout-CTsal1qd.js";
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
  // Helper to get total copper value for a single item and quantity
  static getItemCopperValue(item, quantity) {
    if (!item || !item.system?.price) return 0;
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
    return value * multiplier * quantity;
  }
  // Calculate the total cost of items in cart
  static calculateTotalCost(items, cart) {
    let totalCopper = 0;
    cart.forEach((quantity, itemId) => {
      const item = items.find((i) => i.id === itemId);
      totalCopper += PurchaseHandler.getItemCopperValue(item, quantity);
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
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[37] = list[i];
  return child_ctx;
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[30] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[33] = list[i];
  return child_ctx;
}
function create_if_block_5(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      div.textContent = `${localize("Shop.ShopReadOnly")}`;
      attr(div, "class", "info-message svelte-gas-o4nvpy");
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
      if (dirty[0] & /*isDisabled, removeFromCart, cartItems, getEnrichedName*/
      22656) {
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
function create_if_block_4(ctx) {
  let div;
  let p;
  return {
    c() {
      div = element("div");
      p = element("p");
      p.textContent = `${localize("Shop.CartEmpty")}`;
      attr(div, "class", "empty-cart svelte-gas-o4nvpy");
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
function create_catch_block_1(ctx) {
  return { c: noop, m: noop, p: noop, d: noop };
}
function create_then_block_1(ctx) {
  let html_tag;
  let raw_value = (
    /*Html*/
    ctx[36] + ""
  );
  let html_anchor;
  return {
    c() {
      html_tag = new HtmlTag(false);
      html_anchor = empty();
      html_tag.a = html_anchor;
    },
    m(target, anchor) {
      html_tag.m(raw_value, target, anchor);
      insert(target, html_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*cartItems*/
      128 && raw_value !== (raw_value = /*Html*/
      ctx2[36] + "")) html_tag.p(raw_value);
    },
    d(detaching) {
      if (detaching) {
        detach(html_anchor);
        html_tag.d();
      }
    }
  };
}
function create_pending_block_1(ctx) {
  let t_1_value = (
    /*cartItem*/
    ctx[37].item.name + ""
  );
  let t_1;
  return {
    c() {
      t_1 = text(t_1_value);
    },
    m(target, anchor) {
      insert(target, t_1, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*cartItems*/
      128 && t_1_value !== (t_1_value = /*cartItem*/
      ctx2[37].item.name + "")) set_data(t_1, t_1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(t_1);
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
  let promise;
  let t1;
  let div2;
  let span0;
  let t2_value = (
    /*cartItem*/
    ctx[37].price.value + ""
  );
  let t2;
  let t3;
  let t4_value = (
    /*cartItem*/
    ctx[37].price.denomination + ""
  );
  let t4;
  let t5;
  let span1;
  let t6;
  let t7_value = (
    /*cartItem*/
    ctx[37].quantity + ""
  );
  let t7;
  let t8;
  let div4;
  let button;
  let i;
  let t9;
  let mounted;
  let dispose;
  let info = {
    ctx,
    current: null,
    token: null,
    hasCatch: false,
    pending: create_pending_block_1,
    then: create_then_block_1,
    catch: create_catch_block_1,
    value: 36
  };
  handle_promise(promise = /*getEnrichedName*/
  ctx[12](
    /*cartItem*/
    ctx[37].item
  ), info);
  function click_handler_2() {
    return (
      /*click_handler_2*/
      ctx[24](
        /*cartItem*/
        ctx[37]
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
      info.block.c();
      t1 = space();
      div2 = element("div");
      span0 = element("span");
      t2 = text(t2_value);
      t3 = space();
      t4 = text(t4_value);
      t5 = space();
      span1 = element("span");
      t6 = text("×");
      t7 = text(t7_value);
      t8 = space();
      div4 = element("div");
      button = element("button");
      i = element("i");
      t9 = space();
      if (!src_url_equal(img.src, img_src_value = /*cartItem*/
      ctx[37].item.img)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*cartItem*/
      ctx[37].item.name);
      attr(img, "class", "item-icon svelte-gas-o4nvpy");
      attr(div0, "class", "cart-item-col1 svelte-gas-o4nvpy");
      attr(div1, "class", "cart-item-name svelte-gas-o4nvpy");
      attr(span0, "class", "cart-item-price svelte-gas-o4nvpy");
      attr(span1, "class", "quantity-display svelte-gas-o4nvpy");
      attr(div2, "class", "cart-item-subdetails svelte-gas-o4nvpy");
      attr(div3, "class", "cart-item-col2 left svelte-gas-o4nvpy");
      attr(i, "class", "fas fa-trash");
      attr(button, "class", "remove-btn svelte-gas-o4nvpy");
      button.disabled = /*isDisabled*/
      ctx[11];
      attr(div4, "class", "cart-item-col3 svelte-gas-o4nvpy");
      attr(div5, "class", "cart-item svelte-gas-o4nvpy");
    },
    m(target, anchor) {
      insert(target, div5, anchor);
      append(div5, div0);
      append(div0, img);
      append(div5, t0);
      append(div5, div3);
      append(div3, div1);
      info.block.m(div1, info.anchor = null);
      info.mount = () => div1;
      info.anchor = null;
      append(div3, t1);
      append(div3, div2);
      append(div2, span0);
      append(span0, t2);
      append(span0, t3);
      append(span0, t4);
      append(div2, t5);
      append(div2, span1);
      append(span1, t6);
      append(span1, t7);
      append(div5, t8);
      append(div5, div4);
      append(div4, button);
      append(button, i);
      append(div5, t9);
      if (!mounted) {
        dispose = listen(button, "click", click_handler_2);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*cartItems*/
      128 && !src_url_equal(img.src, img_src_value = /*cartItem*/
      ctx[37].item.img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty[0] & /*cartItems*/
      128 && img_alt_value !== (img_alt_value = /*cartItem*/
      ctx[37].item.name)) {
        attr(img, "alt", img_alt_value);
      }
      info.ctx = ctx;
      if (dirty[0] & /*cartItems*/
      128 && promise !== (promise = /*getEnrichedName*/
      ctx[12](
        /*cartItem*/
        ctx[37].item
      )) && handle_promise(promise, info)) ;
      else {
        update_await_block_branch(info, ctx, dirty);
      }
      if (dirty[0] & /*cartItems*/
      128 && t2_value !== (t2_value = /*cartItem*/
      ctx[37].price.value + "")) set_data(t2, t2_value);
      if (dirty[0] & /*cartItems*/
      128 && t4_value !== (t4_value = /*cartItem*/
      ctx[37].price.denomination + "")) set_data(t4, t4_value);
      if (dirty[0] & /*cartItems*/
      128 && t7_value !== (t7_value = /*cartItem*/
      ctx[37].quantity + "")) set_data(t7, t7_value);
      if (dirty[0] & /*isDisabled*/
      2048) {
        button.disabled = /*isDisabled*/
        ctx[11];
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div5);
      }
      info.block.d();
      info.token = null;
      info = null;
      mounted = false;
      dispose();
    }
  };
}
function create_left_slot(ctx) {
  let div4;
  let t0;
  let div0;
  let golddisplay0;
  let t1;
  let div2;
  let h30;
  let t3;
  let div1;
  let golddisplay1;
  let t4;
  let h31;
  let t6;
  let golddisplay2;
  let t7;
  let h32;
  let t9;
  let div3;
  let current;
  let if_block0 = (
    /*isDisabled*/
    ctx[11] && create_if_block_5()
  );
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
  function select_block_type_2(ctx2, dirty) {
    if (
      /*cartItems*/
      ctx2[7].length === 0
    ) return create_if_block_4;
    return create_else_block_2;
  }
  let current_block_type = select_block_type_2(ctx);
  let if_block1 = current_block_type(ctx);
  return {
    c() {
      div4 = element("div");
      if (if_block0) if_block0.c();
      t0 = space();
      div0 = element("div");
      create_component(golddisplay0.$$.fragment);
      t1 = space();
      div2 = element("div");
      h30 = element("h3");
      h30.textContent = `${localize("Shop.AvailableGold")}`;
      t3 = space();
      div1 = element("div");
      create_component(golddisplay1.$$.fragment);
      t4 = space();
      h31 = element("h3");
      h31.textContent = `${localize("Shop.SpentGold")}`;
      t6 = space();
      create_component(golddisplay2.$$.fragment);
      t7 = space();
      h32 = element("h3");
      h32.textContent = `${localize("Shop.CartItems")}`;
      t9 = space();
      div3 = element("div");
      if_block1.c();
      attr(div0, "class", "sticky-header svelte-gas-o4nvpy");
      toggle_class(div0, "hidden", !/*scrolled*/
      ctx[9]);
      attr(h30, "class", "left no-margin svelte-gas-o4nvpy");
      attr(div1, "class", "remaining-currency svelte-gas-o4nvpy");
      toggle_class(
        div1,
        "negative",
        /*$remainingGold*/
        ctx[3] < 0
      );
      attr(h31, "class", "left no-margin svelte-gas-o4nvpy");
      attr(div2, "class", "panel-header svelte-gas-o4nvpy");
      toggle_class(
        div2,
        "hidden",
        /*scrolled*/
        ctx[9]
      );
      attr(h32, "class", "svelte-gas-o4nvpy");
      attr(div3, "class", "cart-items svelte-gas-o4nvpy");
      attr(div4, "slot", "left");
      attr(div4, "class", "shop-left-panel svelte-gas-o4nvpy");
    },
    m(target, anchor) {
      insert(target, div4, anchor);
      if (if_block0) if_block0.m(div4, null);
      append(div4, t0);
      append(div4, div0);
      mount_component(golddisplay0, div0, null);
      append(div4, t1);
      append(div4, div2);
      append(div2, h30);
      append(div2, t3);
      append(div2, div1);
      mount_component(golddisplay1, div1, null);
      append(div2, t4);
      append(div2, h31);
      append(div2, t6);
      mount_component(golddisplay2, div2, null);
      append(div4, t7);
      append(div4, h32);
      append(div4, t9);
      append(div4, div3);
      if_block1.m(div3, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*isDisabled*/
        ctx2[11]
      ) {
        if (if_block0) ;
        else {
          if_block0 = create_if_block_5();
          if_block0.c();
          if_block0.m(div4, t0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
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
      if (current_block_type === (current_block_type = select_block_type_2(ctx2)) && if_block1) {
        if_block1.p(ctx2, dirty);
      } else {
        if_block1.d(1);
        if_block1 = current_block_type(ctx2);
        if (if_block1) {
          if_block1.c();
          if_block1.m(div3, null);
        }
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
        detach(div4);
      }
      if (if_block0) if_block0.d();
      destroy_component(golddisplay0);
      destroy_component(golddisplay1);
      destroy_component(golddisplay2);
      if_block1.d();
    }
  };
}
function create_else_block(ctx) {
  let each_1_anchor;
  let each_value = ensure_array_like(
    /*categories*/
    ctx[10]
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
      if (dirty[0] & /*categoryGroups, categories, isDisabled, addToCart, getEnrichedName, expandedCategories, toggleCategory*/
      48386) {
        each_value = ensure_array_like(
          /*categories*/
          ctx2[10]
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
function create_if_block_1(ctx) {
  let div;
  let p;
  let t_1_value = (
    /*keywordFilter*/
    (ctx[0] ? localize("Shop.NoMatchingEquipment") : localize("Shop.NoEquipment")) + ""
  );
  let t_1;
  return {
    c() {
      div = element("div");
      p = element("p");
      t_1 = text(t_1_value);
      attr(div, "class", "empty-state svelte-gas-o4nvpy");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, p);
      append(p, t_1);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*keywordFilter*/
      1 && t_1_value !== (t_1_value = /*keywordFilter*/
      (ctx2[0] ? localize("Shop.NoMatchingEquipment") : localize("Shop.NoEquipment")) + "")) set_data(t_1, t_1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_if_block(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      div.textContent = `${localize("Shop.Loading")}`;
      attr(div, "class", "loading svelte-gas-o4nvpy");
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
function create_if_block_3(ctx) {
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
function create_if_block_2(ctx) {
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_1_anchor;
  let each_value_1 = ensure_array_like(
    /*categoryGroups*/
    ctx[1][
      /*category*/
      ctx[30]
    ]
  );
  const get_key = (ctx2) => (
    /*item*/
    ctx2[33].uuid || /*item*/
    ctx2[33]._id
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
      if (dirty[0] & /*isDisabled, addToCart, categoryGroups, categories, getEnrichedName*/
      15362) {
        each_value_1 = ensure_array_like(
          /*categoryGroups*/
          ctx2[1][
            /*category*/
            ctx2[30]
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
function create_catch_block(ctx) {
  return { c: noop, m: noop, p: noop, d: noop };
}
function create_then_block(ctx) {
  let html_tag;
  let raw_value = (
    /*Html*/
    ctx[36] + ""
  );
  let html_anchor;
  return {
    c() {
      html_tag = new HtmlTag(false);
      html_anchor = empty();
      html_tag.a = html_anchor;
    },
    m(target, anchor) {
      html_tag.m(raw_value, target, anchor);
      insert(target, html_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*categoryGroups, categories*/
      1026 && raw_value !== (raw_value = /*Html*/
      ctx2[36] + "")) html_tag.p(raw_value);
    },
    d(detaching) {
      if (detaching) {
        detach(html_anchor);
        html_tag.d();
      }
    }
  };
}
function create_pending_block(ctx) {
  let t_1_value = (
    /*item*/
    ctx[33].name + ""
  );
  let t_1;
  return {
    c() {
      t_1 = text(t_1_value);
    },
    m(target, anchor) {
      insert(target, t_1, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*categoryGroups, categories*/
      1026 && t_1_value !== (t_1_value = /*item*/
      ctx2[33].name + "")) set_data(t_1, t_1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(t_1);
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
  let promise;
  let t1;
  let div1;
  let span1;
  let t2_value = (
    /*item*/
    (ctx[33].system?.price?.value || 0) + ""
  );
  let t2;
  let t3;
  let t4_value = (
    /*item*/
    (ctx[33].system?.price?.denomination || "cp") + ""
  );
  let t4;
  let t5;
  let button;
  let i;
  let t6;
  let mounted;
  let dispose;
  let info = {
    ctx,
    current: null,
    token: null,
    hasCatch: false,
    pending: create_pending_block,
    then: create_then_block,
    catch: create_catch_block,
    value: 36
  };
  handle_promise(promise = /*getEnrichedName*/
  ctx[12](
    /*item*/
    ctx[33]
  ), info);
  function click_handler_1() {
    return (
      /*click_handler_1*/
      ctx[23](
        /*item*/
        ctx[33]
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
      info.block.c();
      t1 = space();
      div1 = element("div");
      span1 = element("span");
      t2 = text(t2_value);
      t3 = space();
      t4 = text(t4_value);
      t5 = space();
      button = element("button");
      i = element("i");
      t6 = space();
      if (!src_url_equal(img.src, img_src_value = /*item*/
      ctx[33].img)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[33].name);
      attr(img, "class", "item-icon svelte-gas-o4nvpy");
      attr(span0, "class", "item-name");
      attr(div0, "class", "item-details svelte-gas-o4nvpy");
      attr(span1, "class", "item-price svelte-gas-o4nvpy");
      attr(i, "class", "fas fa-plus svelte-gas-o4nvpy");
      attr(button, "class", "add-btn svelte-gas-o4nvpy");
      button.disabled = /*isDisabled*/
      ctx[11];
      attr(div1, "class", "item-actions svelte-gas-o4nvpy");
      attr(div2, "class", "item-row svelte-gas-o4nvpy");
      this.first = div2;
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, div0);
      append(div0, img);
      append(div0, t0);
      append(div0, span0);
      info.block.m(span0, info.anchor = null);
      info.mount = () => span0;
      info.anchor = null;
      append(div2, t1);
      append(div2, div1);
      append(div1, span1);
      append(span1, t2);
      append(span1, t3);
      append(span1, t4);
      append(div1, t5);
      append(div1, button);
      append(button, i);
      append(div2, t6);
      if (!mounted) {
        dispose = listen(button, "click", prevent_default(click_handler_1));
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*categoryGroups, categories*/
      1026 && !src_url_equal(img.src, img_src_value = /*item*/
      ctx[33].img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty[0] & /*categoryGroups, categories*/
      1026 && img_alt_value !== (img_alt_value = /*item*/
      ctx[33].name)) {
        attr(img, "alt", img_alt_value);
      }
      info.ctx = ctx;
      if (dirty[0] & /*categoryGroups, categories*/
      1026 && promise !== (promise = /*getEnrichedName*/
      ctx[12](
        /*item*/
        ctx[33]
      )) && handle_promise(promise, info)) ;
      else {
        update_await_block_branch(info, ctx, dirty);
      }
      if (dirty[0] & /*categoryGroups, categories*/
      1026 && t2_value !== (t2_value = /*item*/
      (ctx[33].system?.price?.value || 0) + "")) set_data(t2, t2_value);
      if (dirty[0] & /*categoryGroups, categories*/
      1026 && t4_value !== (t4_value = /*item*/
      (ctx[33].system?.price?.denomination || "cp") + "")) set_data(t4, t4_value);
      if (dirty[0] & /*isDisabled*/
      2048) {
        button.disabled = /*isDisabled*/
        ctx[11];
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div2);
      }
      info.block.d();
      info.token = null;
      info = null;
      mounted = false;
      dispose();
    }
  };
}
function create_each_block(ctx) {
  let div2;
  let button;
  let div0;
  let t0;
  let div1;
  let t1_value = (
    /*category*/
    ctx[30] + ""
  );
  let t1;
  let t2;
  let t3;
  let mounted;
  let dispose;
  function select_block_type_1(ctx2, dirty) {
    if (
      /*expandedCategories*/
      ctx2[8][
        /*category*/
        ctx2[30]
      ]
    ) return create_if_block_3;
    return create_else_block_1;
  }
  let current_block_type = select_block_type_1(ctx);
  let if_block0 = current_block_type(ctx);
  function click_handler() {
    return (
      /*click_handler*/
      ctx[22](
        /*category*/
        ctx[30]
      )
    );
  }
  let if_block1 = (
    /*expandedCategories*/
    ctx[8][
      /*category*/
      ctx[30]
    ] && create_if_block_2(ctx)
  );
  return {
    c() {
      div2 = element("div");
      button = element("button");
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
      attr(button, "class", "category-header left mt-sm flexrow pointer svelte-gas-o4nvpy");
      attr(div2, "class", "category svelte-gas-o4nvpy");
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, button);
      append(button, div0);
      if_block0.m(div0, null);
      append(button, t0);
      append(button, div1);
      append(div1, t1);
      append(div2, t2);
      if (if_block1) if_block1.m(div2, null);
      append(div2, t3);
      if (!mounted) {
        dispose = listen(button, "click", click_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (current_block_type !== (current_block_type = select_block_type_1(ctx))) {
        if_block0.d(1);
        if_block0 = current_block_type(ctx);
        if (if_block0) {
          if_block0.c();
          if_block0.m(div0, null);
        }
      }
      if (dirty[0] & /*categories*/
      1024 && t1_value !== (t1_value = /*category*/
      ctx[30] + "")) set_data(t1, t1_value);
      if (
        /*expandedCategories*/
        ctx[8][
          /*category*/
          ctx[30]
        ]
      ) {
        if (if_block1) {
          if_block1.p(ctx, dirty);
        } else {
          if_block1 = create_if_block_2(ctx);
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
function create_right_slot(ctx) {
  let div1;
  let h3;
  let t1;
  let div0;
  let input;
  let t2;
  let mounted;
  let dispose;
  function select_block_type(ctx2, dirty) {
    if (
      /*loading*/
      ctx2[6]
    ) return create_if_block;
    if (
      /*filteredItems*/
      ctx2[2].length === 0
    ) return create_if_block_1;
    return create_else_block;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      div1 = element("div");
      h3 = element("h3");
      h3.textContent = `${localize("Shop.AvailableEquipment")}`;
      t1 = space();
      div0 = element("div");
      input = element("input");
      t2 = space();
      if_block.c();
      attr(h3, "class", "svelte-gas-o4nvpy");
      attr(input, "type", "text");
      attr(input, "placeholder", localize("Shop.FilterPlaceholder"));
      attr(input, "class", "keyword-filter svelte-gas-o4nvpy");
      input.disabled = /*isDisabled*/
      ctx[11];
      attr(div0, "class", "filter-container mb-sm svelte-gas-o4nvpy");
      attr(div1, "slot", "right");
      attr(div1, "class", "shop-right-panel svelte-gas-o4nvpy");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, h3);
      append(div1, t1);
      append(div1, div0);
      append(div0, input);
      set_input_value(
        input,
        /*keywordFilter*/
        ctx[0]
      );
      append(div1, t2);
      if_block.m(div1, null);
      if (!mounted) {
        dispose = listen(
          input,
          "input",
          /*input_input_handler*/
          ctx[21]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*isDisabled*/
      2048) {
        input.disabled = /*isDisabled*/
        ctx2[11];
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
      mounted = false;
      dispose();
    }
  };
}
function create_fragment(ctx) {
  let standardtablayout;
  let current;
  standardtablayout = new StandardTabLayout({
    props: {
      title: localize("Shop.Title"),
      showTitle: true,
      tabName: "shop",
      $$slots: {
        right: [create_right_slot],
        left: [create_left_slot]
      },
      $$scope: { ctx }
    }
  });
  return {
    c() {
      create_component(standardtablayout.$$.fragment);
    },
    m(target, anchor) {
      mount_component(standardtablayout, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const standardtablayout_changes = {};
      if (dirty[0] & /*loading, keywordFilter, filteredItems, categories, categoryGroups, isDisabled, expandedCategories, cartItems, scrolled, cartCurrency, $remainingGold, remainingCurrency*/
      4095 | dirty[1] & /*$$scope*/
      512) {
        standardtablayout_changes.$$scope = { dirty, ctx: ctx2 };
      }
      standardtablayout.$set(standardtablayout_changes);
    },
    i(local) {
      if (current) return;
      transition_in(standardtablayout.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(standardtablayout.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(standardtablayout, detaching);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let isDisabled;
  let filteredItems;
  let categoryGroups;
  let categories;
  let $remainingGold;
  let $shopItems;
  let $shopCart;
  let $cartTotalCost;
  let $availableGold;
  let $readOnlyTabs;
  component_subscribe($$self, remainingGold, ($$value) => $$invalidate(3, $remainingGold = $$value));
  component_subscribe($$self, shopItems, ($$value) => $$invalidate(16, $shopItems = $$value));
  component_subscribe($$self, shopCart, ($$value) => $$invalidate(17, $shopCart = $$value));
  component_subscribe($$self, cartTotalCost, ($$value) => $$invalidate(18, $cartTotalCost = $$value));
  component_subscribe($$self, availableGold, ($$value) => $$invalidate(19, $availableGold = $$value));
  component_subscribe($$self, readOnlyTabs, ($$value) => $$invalidate(20, $readOnlyTabs = $$value));
  let cartCurrency = { gp: 0, sp: 0, cp: 0 };
  let remainingCurrency = { gp: 0, sp: 0, cp: 0 };
  let loading = true;
  let cartItems = [];
  let keywordFilter = "";
  let expandedCategories = {};
  let enrichedNames = {};
  async function getEnrichedName(item) {
    const key = item.uuid || item._id || item.id;
    if (!enrichedNames[key]) {
      enrichedNames[key] = await enrichHTML(item.enrichedName || item.name || "", { async: true });
    }
    return enrichedNames[key];
  }
  async function addToCart(item) {
    try {
      const itemId = item.id || item._id;
      if (!itemId) {
        console.error("Item has no id:", item);
        ui.notifications?.warn(localize("Shop.ErrorItemNoId"));
        return;
      }
      const fullItemData = await fromUuid(item.uuid);
      if (!fullItemData) {
        console.error("Could not load full item data for UUID:", item.uuid);
        ui.notifications?.warn(localize("Shop.ErrorLoadingItem"));
        return;
      }
      const cart = get_store_value(shopCart);
      const currentQuantity = cart.has(itemId) ? cart.get(itemId).quantity : 0;
      const bundleQuantity = fullItemData.system?.quantity || 1;
      const newQuantity = currentQuantity + bundleQuantity;
      updateCart(itemId, newQuantity, fullItemData, item.uuid);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      ui.notifications?.warn(localize("Shop.ErrorAddToCart"));
    }
  }
  function removeFromCart(itemId) {
    try {
      updateCart(itemId, 0, null);
    } catch (error) {
      console.error("Error removing item from cart:", error);
      ui.notifications?.warn(localize("Shop.ErrorRemoveFromCart"));
    }
  }
  function toggleCategory(category) {
    $$invalidate(8, expandedCategories[category] = !expandedCategories[category], expandedCategories);
    $$invalidate(8, expandedCategories = { ...expandedCategories });
  }
  let scrolled = false;
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
  function input_input_handler() {
    keywordFilter = this.value;
    $$invalidate(0, keywordFilter);
  }
  const click_handler = (category) => toggleCategory(category);
  const click_handler_1 = (item) => addToCart(item);
  const click_handler_2 = (cartItem) => removeFromCart(cartItem.id);
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*$readOnlyTabs*/
    1048576) {
      $$invalidate(11, isDisabled = $readOnlyTabs.includes("shop"));
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
    if ($$self.$$.dirty[0] & /*$shopItems, keywordFilter, $remainingGold*/
    65545) {
      $$invalidate(2, filteredItems = $shopItems.filter((item) => item.name.toLowerCase().includes(keywordFilter.toLowerCase()) && PurchaseHandler.getItemCopperValue(item, 1) <= $remainingGold));
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
      $$invalidate(10, categories = Object.keys(categoryGroups).sort());
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
    categories,
    isDisabled,
    getEnrichedName,
    addToCart,
    removeFromCart,
    toggleCategory,
    $shopItems,
    $shopCart,
    $cartTotalCost,
    $availableGold,
    $readOnlyTabs,
    input_input_handler,
    click_handler,
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
//# sourceMappingURL=ShopTab-D9ogePn2.js.map
