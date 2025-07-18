import { S as SvelteComponent, i as init, s as safe_not_equal, l as localize, C as noop, d as detach, F as set_data, aT as toggle_class, a_ as set_input_value, b as insert, e as append, Y as listen, f as element, G as text, j as attr, bb as set_custom_element_data, aA as null_to_empty, k as component_subscribe, bc as spellLimits, bd as currentSpellCounts, be as maxSpellLevel, bf as availableSpells, bg as selectedSpells, R as level, bh as spellProgress, bi as isLevelUp, aI as newLevelValueForExistingClass, Q as characterClass, r as readOnlyTabs, n as getContext, o as onMount, bj as initializeSpellSelection, bk as loadAvailableSpells, aP as onDestroy, at as enrichHTML, q as tick, b6 as get_store_value, bl as addSpell, bm as removeSpell, v as binding_callbacks, B as ensure_array_like, D as destroy_each, h as empty, N as src_url_equal, b8 as update_keyed_each, b9 as destroy_block, ba as prevent_default } from "./index-wTwGMCER.js";
import { h as handle_promise, u as update_await_block_branch } from "./await_block-2apYt8DI.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[44] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[47] = list[i];
  return child_ctx;
}
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[52] = list[i];
  return child_ctx;
}
function create_if_block_6(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      div.textContent = `${localize("Spells.SpellsReadOnly")}`;
      attr(div, "class", "info-message svelte-gas-1nd59dg");
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
    /*selectedSpellsList*/
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
      if (dirty[0] & /*isDisabled, removeFromSelection, selectedSpellsList, getSpellLevelDisplay, getEnrichedName*/
      410752) {
        each_value_2 = ensure_array_like(
          /*selectedSpellsList*/
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
      p.textContent = `${localize("Spells.NoSpellsSelected")} `;
      attr(div, "class", "empty-selection svelte-gas-1nd59dg");
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
  let span;
  let t_1_value = (
    /*selectedSpell*/
    ctx[52].spell.name + ""
  );
  let t_1;
  return {
    c() {
      span = element("span");
      t_1 = text(t_1_value);
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t_1);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*selectedSpellsList*/
      128 && t_1_value !== (t_1_value = /*selectedSpell*/
      ctx2[52].spell.name + "")) set_data(t_1, t_1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_then_block_1(ctx) {
  let span;
  let raw_value = (
    /*Html*/
    ctx[50] + ""
  );
  return {
    c() {
      span = element("span");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      span.innerHTML = raw_value;
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*selectedSpellsList*/
      128 && raw_value !== (raw_value = /*Html*/
      ctx2[50] + "")) span.innerHTML = raw_value;
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_pending_block_1(ctx) {
  let span;
  let t_1_value = (
    /*selectedSpell*/
    ctx[52].spell.name + ""
  );
  let t_1;
  return {
    c() {
      span = element("span");
      t_1 = text(t_1_value);
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t_1);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*selectedSpellsList*/
      128 && t_1_value !== (t_1_value = /*selectedSpell*/
      ctx2[52].spell.name + "")) set_data(t_1, t_1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_each_block_2(ctx) {
  let div5;
  let div0;
  let img;
  let img_alt_value;
  let img_src_value;
  let div3;
  let div1;
  let promise;
  let div2;
  let span0;
  let t0_value = (
    /*getSpellLevelDisplay*/
    ctx[18](
      /*selectedSpell*/
      ctx[52].spell
    ) + ""
  );
  let t0;
  let span1;
  let t1_value = getSchoolName(
    /*selectedSpell*/
    ctx[52].spell
  ) + "";
  let t1;
  let div4;
  let button;
  let i;
  let mounted;
  let dispose;
  let info = {
    ctx,
    current: null,
    token: null,
    hasCatch: true,
    pending: create_pending_block_1,
    then: create_then_block_1,
    catch: create_catch_block_1,
    value: 50,
    error: 51
  };
  handle_promise(promise = /*getEnrichedName*/
  ctx[14](
    /*selectedSpell*/
    ctx[52].spell
  ), info);
  function click_handler() {
    return (
      /*click_handler*/
      ctx[35](
        /*selectedSpell*/
        ctx[52]
      )
    );
  }
  return {
    c() {
      div5 = element("div");
      div0 = element("div");
      img = element("img");
      div3 = element("div");
      div1 = element("div");
      info.block.c();
      div2 = element("div");
      span0 = element("span");
      t0 = text(t0_value);
      span1 = element("span");
      t1 = text(t1_value);
      div4 = element("div");
      button = element("button");
      i = element("i");
      attr(img, "class", "spell-icon svelte-gas-1nd59dg");
      attr(img, "alt", img_alt_value = /*selectedSpell*/
      ctx[52].spell.name);
      if (!src_url_equal(img.src, img_src_value = /*selectedSpell*/
      ctx[52].spell.img)) attr(img, "src", img_src_value);
      attr(div0, "class", "spell-col1 svelte-gas-1nd59dg");
      attr(div1, "class", "spell-name svelte-gas-1nd59dg");
      attr(span0, "class", "spell-level svelte-gas-1nd59dg");
      attr(span1, "class", "spell-school svelte-gas-1nd59dg");
      attr(div2, "class", "spell-subdetails svelte-gas-1nd59dg");
      attr(div3, "class", "spell-col2 left svelte-gas-1nd59dg");
      attr(i, "class", "fas fa-trash");
      attr(button, "class", "remove-btn svelte-gas-1nd59dg");
      button.disabled = /*isDisabled*/
      ctx[10];
      attr(div4, "class", "spell-col3 svelte-gas-1nd59dg");
      attr(div5, "class", "selected-spell svelte-gas-1nd59dg");
    },
    m(target, anchor) {
      insert(target, div5, anchor);
      append(div5, div0);
      append(div0, img);
      append(div5, div3);
      append(div3, div1);
      info.block.m(div1, info.anchor = null);
      info.mount = () => div1;
      info.anchor = null;
      append(div3, div2);
      append(div2, span0);
      append(span0, t0);
      append(div2, span1);
      append(span1, t1);
      append(div5, div4);
      append(div4, button);
      append(button, i);
      if (!mounted) {
        dispose = listen(button, "click", click_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*selectedSpellsList*/
      128 && img_alt_value !== (img_alt_value = /*selectedSpell*/
      ctx[52].spell.name)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty[0] & /*selectedSpellsList*/
      128 && !src_url_equal(img.src, img_src_value = /*selectedSpell*/
      ctx[52].spell.img)) {
        attr(img, "src", img_src_value);
      }
      info.ctx = ctx;
      if (dirty[0] & /*selectedSpellsList*/
      128 && promise !== (promise = /*getEnrichedName*/
      ctx[14](
        /*selectedSpell*/
        ctx[52].spell
      )) && handle_promise(promise, info)) ;
      else {
        update_await_block_branch(info, ctx, dirty);
      }
      if (dirty[0] & /*selectedSpellsList*/
      128 && t0_value !== (t0_value = /*getSpellLevelDisplay*/
      ctx[18](
        /*selectedSpell*/
        ctx[52].spell
      ) + "")) set_data(t0, t0_value);
      if (dirty[0] & /*selectedSpellsList*/
      128 && t1_value !== (t1_value = getSchoolName(
        /*selectedSpell*/
        ctx[52].spell
      ) + "")) set_data(t1, t1_value);
      if (dirty[0] & /*isDisabled*/
      1024) {
        button.disabled = /*isDisabled*/
        ctx[10];
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
function create_else_block(ctx) {
  let each_1_anchor;
  let each_value = ensure_array_like(
    /*spellLevels*/
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
      if (dirty[0] & /*spellsByLevel, spellLevels, isDisabled, addToSelection, getEnrichedName, expandedLevels, toggleSpellLevel*/
      117826) {
        each_value = ensure_array_like(
          /*spellLevels*/
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
function create_if_block_1(ctx) {
  let div;
  let p;
  let t_1_value = (
    /*keywordFilter*/
    (ctx[0] ? localize("Spells.NoMatchingSpells") : localize("Spells.NoSpells")) + ""
  );
  let t_1;
  return {
    c() {
      div = element("div");
      p = element("p");
      t_1 = text(t_1_value);
      attr(div, "class", "empty-state svelte-gas-1nd59dg");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, p);
      append(p, t_1);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*keywordFilter*/
      1 && t_1_value !== (t_1_value = /*keywordFilter*/
      (ctx2[0] ? localize("Spells.NoMatchingSpells") : localize("Spells.NoSpells")) + "")) set_data(t_1, t_1_value);
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
      div.textContent = `${localize("Spells.Loading")}`;
      attr(div, "class", "loading svelte-gas-1nd59dg");
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
function create_if_block_2(ctx) {
  let ul;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_value_1 = ensure_array_like(
    /*spellsByLevel*/
    ctx[1][
      /*spellLevel*/
      ctx[44]
    ]
  );
  const get_key = (ctx2) => (
    /*spell*/
    ctx2[47].uuid || /*spell*/
    ctx2[47]._id
  );
  for (let i = 0; i < each_value_1.length; i += 1) {
    let child_ctx = get_each_context_1(ctx, each_value_1, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
  }
  return {
    c() {
      ul = element("ul");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(ul, "class", "blank svelte-gas-1nd59dg");
    },
    m(target, anchor) {
      insert(target, ul, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(ul, null);
        }
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*isDisabled, addToSelection, spellsByLevel, spellLevels, getEnrichedName*/
      84994) {
        each_value_1 = ensure_array_like(
          /*spellsByLevel*/
          ctx2[1][
            /*spellLevel*/
            ctx2[44]
          ]
        );
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value_1, each_1_lookup, ul, destroy_block, create_each_block_1, null, get_each_context_1);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(ul);
      }
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
    }
  };
}
function create_catch_block(ctx) {
  let span;
  let t_1_value = (
    /*spell*/
    ctx[47].name + ""
  );
  let t_1;
  return {
    c() {
      span = element("span");
      t_1 = text(t_1_value);
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t_1);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*spellsByLevel, spellLevels*/
      2050 && t_1_value !== (t_1_value = /*spell*/
      ctx2[47].name + "")) set_data(t_1, t_1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_then_block(ctx) {
  let span;
  let raw_value = (
    /*Html*/
    ctx[50] + ""
  );
  return {
    c() {
      span = element("span");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      span.innerHTML = raw_value;
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*spellsByLevel, spellLevels*/
      2050 && raw_value !== (raw_value = /*Html*/
      ctx2[50] + "")) span.innerHTML = raw_value;
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_pending_block(ctx) {
  let span;
  let t_1_value = (
    /*spell*/
    ctx[47].name + ""
  );
  let t_1;
  return {
    c() {
      span = element("span");
      t_1 = text(t_1_value);
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t_1);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*spellsByLevel, spellLevels*/
      2050 && t_1_value !== (t_1_value = /*spell*/
      ctx2[47].name + "")) set_data(t_1, t_1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block_3(ctx) {
  let div6;
  let div2;
  let div0;
  let div1;
  let t1_value = getSchoolName(
    /*spell*/
    ctx[47],
    true
  ) + "";
  let t1;
  let div5;
  let div3;
  let div4;
  let t3_value = getCastingTimeDisplay(
    /*spell*/
    ctx[47]
  ) + "";
  let t3;
  return {
    c() {
      div6 = element("div");
      div2 = element("div");
      div0 = element("div");
      div0.textContent = "School:";
      div1 = element("div");
      t1 = text(t1_value);
      div5 = element("div");
      div3 = element("div");
      div3.textContent = "Activation";
      div4 = element("div");
      t3 = text(t3_value);
      attr(div1, "class", "badge svelte-gas-1nd59dg");
      attr(div2, "class", "flex2 flexrow");
      attr(div4, "class", "badge svelte-gas-1nd59dg");
      attr(div5, "class", "flex2 flexrow");
      attr(div6, "class", "flexrow gap-10");
    },
    m(target, anchor) {
      insert(target, div6, anchor);
      append(div6, div2);
      append(div2, div0);
      append(div2, div1);
      append(div1, t1);
      append(div6, div5);
      append(div5, div3);
      append(div5, div4);
      append(div4, t3);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*spellsByLevel, spellLevels*/
      2050 && t1_value !== (t1_value = getSchoolName(
        /*spell*/
        ctx2[47],
        true
      ) + "")) set_data(t1, t1_value);
      if (dirty[0] & /*spellsByLevel, spellLevels*/
      2050 && t3_value !== (t3_value = getCastingTimeDisplay(
        /*spell*/
        ctx2[47]
      ) + "")) set_data(t3, t3_value);
    },
    d(detaching) {
      if (detaching) {
        detach(div6);
      }
    }
  };
}
function create_each_block_1(key_1, ctx) {
  let li;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div5;
  let div2;
  let div1;
  let promise;
  let div4;
  let div3;
  let show_if = getSchoolName(
    /*spell*/
    ctx[47],
    true
  );
  let div6;
  let button;
  let i;
  let mounted;
  let dispose;
  let info = {
    ctx,
    current: null,
    token: null,
    hasCatch: true,
    pending: create_pending_block,
    then: create_then_block,
    catch: create_catch_block,
    value: 50,
    error: 51
  };
  handle_promise(promise = /*getEnrichedName*/
  ctx[14](
    /*spell*/
    ctx[47]
  ), info);
  let if_block = show_if && create_if_block_3(ctx);
  function click_handler_2() {
    return (
      /*click_handler_2*/
      ctx[39](
        /*spell*/
        ctx[47]
      )
    );
  }
  return {
    key: key_1,
    first: null,
    c() {
      li = element("li");
      div0 = element("div");
      img = element("img");
      div5 = element("div");
      div2 = element("div");
      div1 = element("div");
      info.block.c();
      div4 = element("div");
      div3 = element("div");
      if (if_block) if_block.c();
      div6 = element("div");
      button = element("button");
      i = element("i");
      attr(img, "class", "spell-icon cover svelte-gas-1nd59dg");
      if (!src_url_equal(img.src, img_src_value = /*spell*/
      ctx[47].img)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*spell*/
      ctx[47].name);
      attr(div0, "class", "flex0 spell-details svelte-gas-1nd59dg");
      attr(div1, "class", "flex1 left spell-name gold svelte-gas-1nd59dg");
      attr(div2, "class", "flexrow");
      attr(div3, "class", "flex1 left spell-meta svelte-gas-1nd59dg");
      attr(div4, "class", "flexrow smalltext");
      attr(div5, "class", "flex1 spell-info");
      attr(i, "class", "fas fa-plus svelte-gas-1nd59dg");
      attr(button, "class", "add-btn svelte-gas-1nd59dg");
      button.disabled = /*isDisabled*/
      ctx[10];
      attr(div6, "class", "spell-actions mx-sm svelte-gas-1nd59dg");
      attr(li, "class", "flexrow spell-row justify-flexrow-vertical svelte-gas-1nd59dg");
      this.first = li;
    },
    m(target, anchor) {
      insert(target, li, anchor);
      append(li, div0);
      append(div0, img);
      append(li, div5);
      append(div5, div2);
      append(div2, div1);
      info.block.m(div1, info.anchor = null);
      info.mount = () => div1;
      info.anchor = null;
      append(div5, div4);
      append(div4, div3);
      if (if_block) if_block.m(div3, null);
      append(li, div6);
      append(div6, button);
      append(button, i);
      if (!mounted) {
        dispose = listen(button, "click", prevent_default(click_handler_2));
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*spellsByLevel, spellLevels*/
      2050 && !src_url_equal(img.src, img_src_value = /*spell*/
      ctx[47].img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty[0] & /*spellsByLevel, spellLevels*/
      2050 && img_alt_value !== (img_alt_value = /*spell*/
      ctx[47].name)) {
        attr(img, "alt", img_alt_value);
      }
      info.ctx = ctx;
      if (dirty[0] & /*spellsByLevel, spellLevels*/
      2050 && promise !== (promise = /*getEnrichedName*/
      ctx[14](
        /*spell*/
        ctx[47]
      )) && handle_promise(promise, info)) ;
      else {
        update_await_block_branch(info, ctx, dirty);
      }
      if (dirty[0] & /*spellsByLevel, spellLevels*/
      2050) show_if = getSchoolName(
        /*spell*/
        ctx[47],
        true
      );
      if (show_if) {
        if (if_block) {
          if_block.p(ctx, dirty);
        } else {
          if_block = create_if_block_3(ctx);
          if_block.c();
          if_block.m(div3, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty[0] & /*isDisabled*/
      1024) {
        button.disabled = /*isDisabled*/
        ctx[10];
      }
    },
    d(detaching) {
      if (detaching) {
        detach(li);
      }
      info.block.d();
      info.token = null;
      info = null;
      if (if_block) if_block.d();
      mounted = false;
      dispose();
    }
  };
}
function create_each_block(ctx) {
  let div2;
  let h4;
  let div0;
  let div1;
  let t0_value = (
    /*spellLevel*/
    ctx[44] + ""
  );
  let t0;
  let t1;
  let t2_value = (
    /*spellsByLevel*/
    ctx[1][
      /*spellLevel*/
      ctx[44]
    ].length + ""
  );
  let t2;
  let t3;
  let mounted;
  let dispose;
  function select_block_type_2(ctx2, dirty) {
    if (
      /*expandedLevels*/
      ctx2[6][
        /*spellLevel*/
        ctx2[44]
      ]
    ) return create_if_block_4;
    return create_else_block_1;
  }
  let current_block_type = select_block_type_2(ctx);
  let if_block0 = current_block_type(ctx);
  function click_handler_1() {
    return (
      /*click_handler_1*/
      ctx[38](
        /*spellLevel*/
        ctx[44]
      )
    );
  }
  let if_block1 = (
    /*expandedLevels*/
    ctx[6][
      /*spellLevel*/
      ctx[44]
    ] && create_if_block_2(ctx)
  );
  return {
    c() {
      div2 = element("div");
      h4 = element("h4");
      div0 = element("div");
      if_block0.c();
      div1 = element("div");
      t0 = text(t0_value);
      t1 = text(" (");
      t2 = text(t2_value);
      t3 = text(")");
      if (if_block1) if_block1.c();
      attr(div0, "class", "flex0 mr-xs");
      attr(div1, "class", "flex1");
      attr(h4, "class", "left mt-sm flexrow spell-level-header pointer svelte-gas-1nd59dg");
      attr(div2, "class", "spell-level-group svelte-gas-1nd59dg");
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, h4);
      append(h4, div0);
      if_block0.m(div0, null);
      append(h4, div1);
      append(div1, t0);
      append(div1, t1);
      append(div1, t2);
      append(div1, t3);
      if (if_block1) if_block1.m(div2, null);
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
      if (dirty[0] & /*spellLevels*/
      2048 && t0_value !== (t0_value = /*spellLevel*/
      ctx[44] + "")) set_data(t0, t0_value);
      if (dirty[0] & /*spellsByLevel, spellLevels*/
      2050 && t2_value !== (t2_value = /*spellsByLevel*/
      ctx[1][
        /*spellLevel*/
        ctx[44]
      ].length + "")) set_data(t2, t2_value);
      if (
        /*expandedLevels*/
        ctx[6][
          /*spellLevel*/
          ctx[44]
        ]
      ) {
        if (if_block1) {
          if_block1.p(ctx, dirty);
        } else {
          if_block1 = create_if_block_2(ctx);
          if_block1.c();
          if_block1.m(div2, null);
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
function create_fragment(ctx) {
  let spells_tab_container;
  let div5;
  let div4;
  let div0;
  let div1;
  let t2_value = (
    /*$currentSpellCounts*/
    ctx[12].cantrips + ""
  );
  let t2;
  let t3;
  let t4_value = (
    /*$spellLimits*/
    ctx[4].cantrips + ""
  );
  let t4;
  let div2;
  let div3;
  let t7_value = (
    /*$currentSpellCounts*/
    ctx[12].spells + ""
  );
  let t7;
  let t8;
  let t9_value = (
    /*$spellLimits*/
    (ctx[4].spells === 999 ? "All" : (
      /*$spellLimits*/
      ctx[4].spells
    )) + ""
  );
  let t9;
  let div15;
  let div12;
  let div10;
  let div6;
  let div7;
  let t12_value = (
    /*$currentSpellCounts*/
    ctx[12].cantrips + ""
  );
  let t12;
  let t13;
  let t14_value = (
    /*$spellLimits*/
    ctx[4].cantrips + ""
  );
  let t14;
  let div8;
  let div9;
  let t17_value = (
    /*$currentSpellCounts*/
    ctx[12].spells + ""
  );
  let t17;
  let t18;
  let t19_value = (
    /*$spellLimits*/
    (ctx[4].spells === 999 ? "All" : (
      /*$spellLimits*/
      ctx[4].spells
    )) + ""
  );
  let t19;
  let h30;
  let div11;
  let div14;
  let h31;
  let t21_value = localize("Spells.AvailableSpells") + "";
  let t21;
  let t22;
  let t23;
  let div13;
  let input;
  let mounted;
  let dispose;
  let if_block0 = (
    /*isDisabled*/
    ctx[10] && create_if_block_6()
  );
  function select_block_type(ctx2, dirty) {
    if (
      /*selectedSpellsList*/
      ctx2[7].length === 0
    ) return create_if_block_5;
    return create_else_block_2;
  }
  let current_block_type = select_block_type(ctx);
  let if_block1 = current_block_type(ctx);
  function select_block_type_1(ctx2, dirty) {
    if (
      /*loading*/
      ctx2[5]
    ) return create_if_block;
    if (
      /*filteredSpells*/
      ctx2[2].length === 0
    ) return create_if_block_1;
    return create_else_block;
  }
  let current_block_type_1 = select_block_type_1(ctx);
  let if_block2 = current_block_type_1(ctx);
  return {
    c() {
      spells_tab_container = element("spells-tab-container");
      if (if_block0) if_block0.c();
      div5 = element("div");
      div4 = element("div");
      div0 = element("div");
      div0.textContent = `${localize("Spells.Cantrips")}:`;
      div1 = element("div");
      t2 = text(t2_value);
      t3 = text("/");
      t4 = text(t4_value);
      div2 = element("div");
      div2.textContent = `${localize("Spells.Spells")}:`;
      div3 = element("div");
      t7 = text(t7_value);
      t8 = text("/");
      t9 = text(t9_value);
      div15 = element("div");
      div12 = element("div");
      div10 = element("div");
      div6 = element("div");
      div6.textContent = `${localize("Spells.Cantrips")}:`;
      div7 = element("div");
      t12 = text(t12_value);
      t13 = text("/");
      t14 = text(t14_value);
      div8 = element("div");
      div8.textContent = `${localize("Spells.Spells")}:`;
      div9 = element("div");
      t17 = text(t17_value);
      t18 = text("/");
      t19 = text(t19_value);
      h30 = element("h3");
      h30.textContent = `${localize("Spells.SelectedSpells")}`;
      div11 = element("div");
      if_block1.c();
      div14 = element("div");
      h31 = element("h3");
      t21 = text(t21_value);
      t22 = text(" | ");
      t23 = text(
        /*characterClassName*/
        ctx[3]
      );
      div13 = element("div");
      input = element("input");
      if_block2.c();
      attr(div0, "class", "grid-item label svelte-gas-1nd59dg");
      attr(div1, "class", "grid-item value " + /*spellCountCss*/
      ctx[20] + " svelte-gas-1nd59dg");
      attr(div2, "class", "grid-item label svelte-gas-1nd59dg");
      attr(div3, "class", "grid-item value " + /*spellLimitsCss*/
      ctx[21] + " svelte-gas-1nd59dg");
      attr(div4, "class", "panel-header-grid svelte-gas-1nd59dg");
      attr(div5, "class", "sticky-header svelte-gas-1nd59dg");
      toggle_class(div5, "hidden", !/*scrolled*/
      ctx[8]);
      attr(div6, "class", "grid-item label svelte-gas-1nd59dg");
      attr(div7, "class", "grid-item value " + /*spellCountCss*/
      ctx[20] + " svelte-gas-1nd59dg");
      attr(div8, "class", "grid-item label svelte-gas-1nd59dg");
      attr(div9, "class", "grid-item value " + /*spellLimitsCss*/
      ctx[21] + " svelte-gas-1nd59dg");
      attr(div10, "class", "panel-header-grid svelte-gas-1nd59dg");
      toggle_class(
        div10,
        "hidden",
        /*scrolled*/
        ctx[8]
      );
      attr(h30, "class", "svelte-gas-1nd59dg");
      attr(div11, "class", "selected-spells svelte-gas-1nd59dg");
      attr(div12, "class", "left-panel svelte-gas-1nd59dg");
      attr(h31, "class", "svelte-gas-1nd59dg");
      attr(input, "class", "keyword-filter svelte-gas-1nd59dg");
      attr(input, "type", "text");
      attr(input, "placeholder", localize("Spells.FilterPlaceholder"));
      input.disabled = /*isDisabled*/
      ctx[10];
      attr(div13, "class", "filter-container mb-sm svelte-gas-1nd59dg");
      attr(div14, "class", "right-panel spell-list svelte-gas-1nd59dg");
      attr(div15, "class", "spells-tab svelte-gas-1nd59dg");
      set_custom_element_data(spells_tab_container, "class", null_to_empty(
        /*containerClasses*/
        ctx[19]
      ) + " svelte-gas-1nd59dg");
    },
    m(target, anchor) {
      insert(target, spells_tab_container, anchor);
      if (if_block0) if_block0.m(spells_tab_container, null);
      append(spells_tab_container, div5);
      append(div5, div4);
      append(div4, div0);
      append(div4, div1);
      append(div1, t2);
      append(div1, t3);
      append(div1, t4);
      append(div4, div2);
      append(div4, div3);
      append(div3, t7);
      append(div3, t8);
      append(div3, t9);
      append(spells_tab_container, div15);
      append(div15, div12);
      append(div12, div10);
      append(div10, div6);
      append(div10, div7);
      append(div7, t12);
      append(div7, t13);
      append(div7, t14);
      append(div10, div8);
      append(div10, div9);
      append(div9, t17);
      append(div9, t18);
      append(div9, t19);
      append(div12, h30);
      append(div12, div11);
      if_block1.m(div11, null);
      ctx[36](div12);
      append(div15, div14);
      append(div14, h31);
      append(h31, t21);
      append(h31, t22);
      append(h31, t23);
      append(div14, div13);
      append(div13, input);
      set_input_value(
        input,
        /*keywordFilter*/
        ctx[0]
      );
      if_block2.m(div14, null);
      if (!mounted) {
        dispose = listen(
          input,
          "input",
          /*input_input_handler*/
          ctx[37]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (
        /*isDisabled*/
        ctx2[10]
      ) {
        if (if_block0) ;
        else {
          if_block0 = create_if_block_6();
          if_block0.c();
          if_block0.m(spells_tab_container, div5);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty[0] & /*$currentSpellCounts*/
      4096 && t2_value !== (t2_value = /*$currentSpellCounts*/
      ctx2[12].cantrips + "")) set_data(t2, t2_value);
      if (dirty[0] & /*$spellLimits*/
      16 && t4_value !== (t4_value = /*$spellLimits*/
      ctx2[4].cantrips + "")) set_data(t4, t4_value);
      if (dirty[0] & /*$currentSpellCounts*/
      4096 && t7_value !== (t7_value = /*$currentSpellCounts*/
      ctx2[12].spells + "")) set_data(t7, t7_value);
      if (dirty[0] & /*$spellLimits*/
      16 && t9_value !== (t9_value = /*$spellLimits*/
      (ctx2[4].spells === 999 ? "All" : (
        /*$spellLimits*/
        ctx2[4].spells
      )) + "")) set_data(t9, t9_value);
      if (dirty[0] & /*scrolled*/
      256) {
        toggle_class(div5, "hidden", !/*scrolled*/
        ctx2[8]);
      }
      if (dirty[0] & /*$currentSpellCounts*/
      4096 && t12_value !== (t12_value = /*$currentSpellCounts*/
      ctx2[12].cantrips + "")) set_data(t12, t12_value);
      if (dirty[0] & /*$spellLimits*/
      16 && t14_value !== (t14_value = /*$spellLimits*/
      ctx2[4].cantrips + "")) set_data(t14, t14_value);
      if (dirty[0] & /*$currentSpellCounts*/
      4096 && t17_value !== (t17_value = /*$currentSpellCounts*/
      ctx2[12].spells + "")) set_data(t17, t17_value);
      if (dirty[0] & /*$spellLimits*/
      16 && t19_value !== (t19_value = /*$spellLimits*/
      (ctx2[4].spells === 999 ? "All" : (
        /*$spellLimits*/
        ctx2[4].spells
      )) + "")) set_data(t19, t19_value);
      if (dirty[0] & /*scrolled*/
      256) {
        toggle_class(
          div10,
          "hidden",
          /*scrolled*/
          ctx2[8]
        );
      }
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block1) {
        if_block1.p(ctx2, dirty);
      } else {
        if_block1.d(1);
        if_block1 = current_block_type(ctx2);
        if (if_block1) {
          if_block1.c();
          if_block1.m(div11, null);
        }
      }
      if (dirty[0] & /*characterClassName*/
      8) set_data(
        t23,
        /*characterClassName*/
        ctx2[3]
      );
      if (dirty[0] & /*isDisabled*/
      1024) {
        input.disabled = /*isDisabled*/
        ctx2[10];
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
      if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx2)) && if_block2) {
        if_block2.p(ctx2, dirty);
      } else {
        if_block2.d(1);
        if_block2 = current_block_type_1(ctx2);
        if (if_block2) {
          if_block2.c();
          if_block2.m(div14, null);
        }
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(spells_tab_container);
      }
      if (if_block0) if_block0.d();
      if_block1.d();
      ctx[36](null);
      if_block2.d();
      mounted = false;
      dispose();
    }
  };
}
function getMaxSpellLevelForClass(level2, className) {
  const fullCasters = ["Bard", "Cleric", "Druid", "Sorcerer", "Wizard"];
  const halfCasters = ["Paladin", "Ranger"];
  const thirdCasters = ["Arcane Trickster", "Eldritch Knight"];
  const warlockProgression = ["Warlock"];
  if (fullCasters.includes(className)) {
    return Math.min(9, Math.ceil(level2 / 2));
  } else if (halfCasters.includes(className)) {
    return Math.min(5, Math.ceil((level2 - 1) / 4));
  } else if (thirdCasters.includes(className)) {
    return Math.min(4, Math.ceil((level2 - 2) / 6));
  } else if (warlockProgression.includes(className)) {
    if (level2 >= 17) return 5;
    if (level2 >= 11) return 3;
    if (level2 >= 7) return 2;
    if (level2 >= 1) return 1;
    return 0;
  } else if (className === "Artificer") {
    if (level2 < 2) return 0;
    return Math.min(5, Math.ceil((level2 - 1) / 4));
  }
  return 0;
}
function getSchoolName(spell, forList = false) {
  const school = spell.system?.school;
  if (!school || school === "Unknown") {
    return forList ? "" : "—";
  }
  return school;
}
function getCastingTimeDisplay(spell) {
  window.GAS.log.q(spell);
  return spell.system?.activation?.value && spell.system?.activation?.type ? `${spell.system.activation.value} ${spell.system.activation.type}` : spell.system?.activation?.type ? spell.system?.activation?.type : "Unknown";
}
function instance($$self, $$props, $$invalidate) {
  let isDisabled;
  let characterClassName;
  let calculatedMaxSpellLevel;
  let levelUpAwareMaxSpellLevel;
  let effectiveMaxSpellLevel;
  let filteredSpells;
  let spellsByLevel;
  let spellLevels;
  let $spellLimits;
  let $currentSpellCounts;
  let $maxSpellLevel;
  let $availableSpells;
  let $selectedSpells;
  let $characterLevel;
  let $actor;
  let $spellProgress;
  let $isLevelUp;
  let $newLevelValueForExistingClass;
  let $characterClass;
  let $readOnlyTabs;
  component_subscribe($$self, spellLimits, ($$value) => $$invalidate(4, $spellLimits = $$value));
  component_subscribe($$self, currentSpellCounts, ($$value) => $$invalidate(12, $currentSpellCounts = $$value));
  component_subscribe($$self, maxSpellLevel, ($$value) => $$invalidate(25, $maxSpellLevel = $$value));
  component_subscribe($$self, availableSpells, ($$value) => $$invalidate(26, $availableSpells = $$value));
  component_subscribe($$self, selectedSpells, ($$value) => $$invalidate(27, $selectedSpells = $$value));
  component_subscribe($$self, level, ($$value) => $$invalidate(28, $characterLevel = $$value));
  component_subscribe($$self, spellProgress, ($$value) => $$invalidate(30, $spellProgress = $$value));
  component_subscribe($$self, isLevelUp, ($$value) => $$invalidate(31, $isLevelUp = $$value));
  component_subscribe($$self, newLevelValueForExistingClass, ($$value) => $$invalidate(32, $newLevelValueForExistingClass = $$value));
  component_subscribe($$self, characterClass, ($$value) => $$invalidate(33, $characterClass = $$value));
  component_subscribe($$self, readOnlyTabs, ($$value) => $$invalidate(34, $readOnlyTabs = $$value));
  const actor = getContext("#doc");
  component_subscribe($$self, actor, (value) => $$invalidate(29, $actor = value));
  let loading = true;
  let keywordFilter = "";
  let expandedLevels = {};
  let selectedSpellsList = [];
  let scrolled = false;
  let spellContainer;
  let cleanup;
  let enrichedNames = {};
  async function getEnrichedName(spell) {
    const key = spell.uuid || spell._id || spell.id;
    if (!enrichedNames[key]) {
      let content;
      if (spell.uuid) {
        content = `@UUID[${spell.uuid}]{${spell.name}}`;
      } else {
        content = spell.name || "";
      }
      enrichedNames[key] = await enrichHTML(content, { async: true });
    }
    return enrichedNames[key];
  }
  onMount(async () => {
    $$invalidate(5, loading = true);
    initializeSpellSelection($actor);
    await loadAvailableSpells(characterClassName);
    console.log(`[SPELLS DEBUG] Loaded spells:`, {
      totalSpells: $availableSpells.length,
      characterLevel: $characterLevel,
      storeMaxSpellLevel: $maxSpellLevel,
      calculatedMaxSpellLevel,
      effectiveMaxSpellLevel,
      characterClassName,
      spellLimits,
      sampleSpells: $availableSpells.slice(0, 5).map((s) => ({
        name: s.name,
        level: s.system?.level,
        classes: s.labels?.classes || []
      }))
    });
    $$invalidate(5, loading = false);
    const scrollingContainer = document.querySelector("#foundryvtt-actor-studio-pc-sheet section.a");
    if (scrollingContainer) {
      const handleScroll = () => {
        $$invalidate(8, scrolled = scrollingContainer.scrollTop > 0);
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
  function toggleSpellLevel(level2) {
    $$invalidate(6, expandedLevels[level2] = !expandedLevels[level2], expandedLevels);
    $$invalidate(6, expandedLevels = { ...expandedLevels });
  }
  async function addToSelection(spell) {
    await tick();
    const spellLevel = spell.system?.level || 0;
    const isCantrip = spellLevel === 0;
    const counts = get_store_value(currentSpellCounts);
    const limits = get_store_value(spellLimits);
    if (isCantrip && counts.cantrips >= limits.cantrips) {
      ui.notifications?.warn(localize("Spells.CantripLimitReached"));
      return;
    }
    if (!isCantrip && counts.spells >= limits.spells) {
      ui.notifications?.warn(localize("Spells.SpellLimitReached"));
      return;
    }
    await addSpell(spell);
  }
  function removeFromSelection(spellId) {
    removeSpell(spellId);
  }
  function getSpellLevelDisplay(spell) {
    const level2 = spell.system?.level || 0;
    return level2 === 0 ? localize("Spells.Cantrip") : `${localize("Spells.Level")} ${level2}`;
  }
  const containerClasses = { readonly: isDisabled };
  const spellCountCss = {
    "at-limit": $currentSpellCounts.cantrips >= $spellLimits.cantrips
  };
  const spellLimitsCss = {
    "at-limit": $currentSpellCounts.spells >= $spellLimits.spells
  };
  const click_handler = (selectedSpell) => removeFromSelection(selectedSpell.id);
  function div12_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      spellContainer = $$value;
      $$invalidate(9, spellContainer);
    });
  }
  function input_input_handler() {
    keywordFilter = this.value;
    $$invalidate(0, keywordFilter);
  }
  const click_handler_1 = (spellLevel) => toggleSpellLevel(spellLevel);
  const click_handler_2 = (spell) => addToSelection(spell);
  $$self.$$.update = () => {
    if ($$self.$$.dirty[1] & /*$readOnlyTabs*/
    8) {
      $$invalidate(10, isDisabled = $readOnlyTabs.includes("spells"));
    }
    if ($$self.$$.dirty[0] & /*$actor*/
    536870912) {
      $actor.toObject();
    }
    if ($$self.$$.dirty[1] & /*$characterClass*/
    4) {
      $$invalidate(3, characterClassName = $characterClass?.name || "Bard");
    }
    if ($$self.$$.dirty[0] & /*$characterLevel, characterClassName*/
    268435464) {
      $$invalidate(23, calculatedMaxSpellLevel = getMaxSpellLevelForClass($characterLevel, characterClassName));
    }
    if ($$self.$$.dirty[0] & /*characterClassName, calculatedMaxSpellLevel*/
    8388616 | $$self.$$.dirty[1] & /*$isLevelUp, $newLevelValueForExistingClass*/
    3) {
      $$invalidate(24, levelUpAwareMaxSpellLevel = $isLevelUp && $newLevelValueForExistingClass ? getMaxSpellLevelForClass($newLevelValueForExistingClass, characterClassName) : calculatedMaxSpellLevel);
    }
    if ($$self.$$.dirty[0] & /*$maxSpellLevel, levelUpAwareMaxSpellLevel*/
    50331648) {
      $$invalidate(22, effectiveMaxSpellLevel = $maxSpellLevel > 0 ? $maxSpellLevel : levelUpAwareMaxSpellLevel);
    }
    if ($$self.$$.dirty[0] & /*characterClassName, $characterLevel, $maxSpellLevel, calculatedMaxSpellLevel, levelUpAwareMaxSpellLevel, effectiveMaxSpellLevel, $spellLimits, $spellProgress*/
    1405091864 | $$self.$$.dirty[1] & /*$characterClass, $newLevelValueForExistingClass, $isLevelUp*/
    7) {
      {
        console.log(`[SPELLS DEBUG] Character data:`, {
          characterClass: $characterClass,
          characterClassName,
          characterLevel: $characterLevel,
          newLevelValueForExistingClass: $newLevelValueForExistingClass,
          isLevelUp: $isLevelUp,
          storeMaxSpellLevel: $maxSpellLevel,
          calculatedMaxSpellLevel,
          levelUpAwareMaxSpellLevel,
          effectiveMaxSpellLevel,
          spellLimits: $spellLimits,
          progress: $spellProgress
        });
      }
    }
    if ($$self.$$.dirty[0] & /*$selectedSpells*/
    134217728) {
      {
        if ($selectedSpells) {
          $$invalidate(7, selectedSpellsList = Array.from($selectedSpells.entries()).map(([spellId, { itemData }]) => ({ id: spellId, spell: itemData })));
        }
      }
    }
    if ($$self.$$.dirty[0] & /*$availableSpells, keywordFilter, effectiveMaxSpellLevel, characterClassName, $maxSpellLevel*/
    104857609) {
      $$invalidate(2, filteredSpells = $availableSpells.filter((spell) => {
        const matchesKeyword = spell.name.toLowerCase().includes(keywordFilter.toLowerCase());
        const spellLevel = spell.system?.level || 0;
        const withinCharacterLevel = spellLevel <= effectiveMaxSpellLevel;
        const spellClasses = spell.labels?.classes || "";
        const availableToClass = typeof spellClasses === "string" ? spellClasses.includes(characterClassName) || spellClasses.toLowerCase().includes(characterClassName.toLowerCase()) || spellClasses.trim().length === 0 : false;
        if (spell.name === "Acid Splash" || spell.name === "Cure Wounds" || spellLevel === 1) {
          console.log(`[SPELLS DEBUG] ${spell.name}:`, {
            spell,
            spellLevel,
            storeMaxSpellLevel: $maxSpellLevel,
            effectiveMaxSpellLevel,
            withinCharacterLevel,
            spellClasses,
            characterClassName,
            availableToClass,
            matchesKeyword,
            finalResult: matchesKeyword && withinCharacterLevel && availableToClass
          });
        }
        return matchesKeyword && withinCharacterLevel && availableToClass;
      }));
    }
    if ($$self.$$.dirty[0] & /*filteredSpells*/
    4) {
      $$invalidate(1, spellsByLevel = filteredSpells.reduce(
        (acc, spell) => {
          const level2 = spell.system?.level || 0;
          const levelKey = level2 === 0 ? "Cantrips" : `Level ${level2}`;
          if (!acc[levelKey]) {
            acc[levelKey] = [];
          }
          acc[levelKey].push(spell);
          return acc;
        },
        {}
      ));
    }
    if ($$self.$$.dirty[0] & /*spellsByLevel, filteredSpells*/
    6) {
      {
        if (Object.keys(spellsByLevel).length > 0) {
          console.log(`[SPELLS DEBUG] Spells by level:`, {
            totalFiltered: filteredSpells.length,
            groupedByLevel: Object.keys(spellsByLevel).map((level2) => ({
              level: level2,
              count: spellsByLevel[level2].length,
              samples: spellsByLevel[level2].slice(0, 3).map((s) => s.name)
            }))
          });
        }
      }
    }
    if ($$self.$$.dirty[0] & /*spellsByLevel*/
    2) {
      $$invalidate(11, spellLevels = Object.keys(spellsByLevel).sort((a, b) => {
        if (a === "Cantrips") return -1;
        if (b === "Cantrips") return 1;
        const levelA = parseInt(a.replace("Level ", ""));
        const levelB = parseInt(b.replace("Level ", ""));
        return levelA - levelB;
      }));
    }
  };
  return [
    keywordFilter,
    spellsByLevel,
    filteredSpells,
    characterClassName,
    $spellLimits,
    loading,
    expandedLevels,
    selectedSpellsList,
    scrolled,
    spellContainer,
    isDisabled,
    spellLevels,
    $currentSpellCounts,
    actor,
    getEnrichedName,
    toggleSpellLevel,
    addToSelection,
    removeFromSelection,
    getSpellLevelDisplay,
    containerClasses,
    spellCountCss,
    spellLimitsCss,
    effectiveMaxSpellLevel,
    calculatedMaxSpellLevel,
    levelUpAwareMaxSpellLevel,
    $maxSpellLevel,
    $availableSpells,
    $selectedSpells,
    $characterLevel,
    $actor,
    $spellProgress,
    $isLevelUp,
    $newLevelValueForExistingClass,
    $characterClass,
    $readOnlyTabs,
    click_handler,
    div12_binding,
    input_input_handler,
    click_handler_1,
    click_handler_2
  ];
}
class Spells extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);
  }
}
export {
  Spells as default
};
//# sourceMappingURL=Spells-CNpJH4M8.js.map
