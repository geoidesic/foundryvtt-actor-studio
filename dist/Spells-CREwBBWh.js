import { S as SvelteComponent, i as init, s as safe_not_equal, l as localize, C as noop, k as detach, F as set_data, Y as toggle_class, ac as set_input_value, q as insert, u as append, a5 as listen, v as element, G as text, x as attr, bn as set_custom_element_data, aS as null_to_empty, b as component_subscribe, bo as spellLimits, bp as currentSpellCounts, bq as isLevelUp, br as maxSpellLevel, bs as availableSpells, bt as selectedSpells, bu as spellProgress, a_ as newLevelValueForExistingClass, af as characterClass, r as readOnlyTabs, g as getContext, o as onMount, bv as initializeSpellSelection, bw as loadAvailableSpells, b5 as onDestroy, aL as enrichHTML, h as tick, bi as get_store_value, bx as addSpell, by as removeSpell, bz as autoPopulateAllSpells, y as binding_callbacks, B as ensure_array_like, D as destroy_each, w as empty, N as src_url_equal, bk as update_keyed_each, bm as prevent_default, bl as destroy_block } from "./index-Vm_z90HH.js";
import { h as handle_promise, u as update_await_block_branch } from "./await_block-z4uB6gHb.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[50] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[53] = list[i];
  return child_ctx;
}
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[58] = list[i];
  return child_ctx;
}
function create_if_block_8(ctx) {
  let div1;
  let p0;
  let strong;
  let t0;
  let t1;
  let t2;
  let p1;
  let div0;
  let button;
  let i;
  let button_disabled_value;
  let mounted;
  let dispose;
  function select_block_type_1(ctx2, dirty) {
    if (
      /*$isLevelUp*/
      ctx2[7] && /*effectiveMaxSpellLevel*/
      ctx2[2] > /*oldMaxSpellLevel*/
      ctx2[1]
    ) return create_if_block_9;
    return create_else_block_3;
  }
  let current_block_type = select_block_type_1(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      div1 = element("div");
      p0 = element("p");
      strong = element("strong");
      t0 = text(
        /*characterClassName*/
        ctx[3]
      );
      t1 = text("s ");
      t2 = text("have access to all spells of appropriate level. You only need to select the cantrips you want to know - all other spells can be prepared during gameplay.");
      p1 = element("p");
      p1.innerHTML = `<em class="svelte-gas-w9ye3f">Note: You still need to select your cantrips as they cannot be changed later.</em>`;
      div0 = element("div");
      button = element("button");
      i = element("i");
      if_block.c();
      attr(strong, "class", "svelte-gas-w9ye3f");
      attr(i, "class", "fas fa-magic svelte-gas-w9ye3f");
      attr(button, "class", "auto-populate-btn svelte-gas-w9ye3f");
      button.disabled = button_disabled_value = /*isDisabled*/
      ctx[14] || /*loading*/
      ctx[9];
      attr(div0, "class", "auto-populate-section svelte-gas-w9ye3f");
      attr(div1, "class", "info-message all-spells-notice svelte-gas-w9ye3f");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, p0);
      append(p0, strong);
      append(strong, t0);
      append(strong, t1);
      append(p0, t2);
      append(div1, p1);
      append(div1, div0);
      append(div0, button);
      append(button, i);
      if_block.m(button, null);
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*click_handler*/
          ctx[40]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*characterClassName*/
      8) set_data(
        t0,
        /*characterClassName*/
        ctx2[3]
      );
      if (current_block_type === (current_block_type = select_block_type_1(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(button, null);
        }
      }
      if (dirty[0] & /*isDisabled, loading*/
      16896 && button_disabled_value !== (button_disabled_value = /*isDisabled*/
      ctx2[14] || /*loading*/
      ctx2[9])) {
        button.disabled = button_disabled_value;
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
function create_if_block_7(ctx) {
  let div;
  let p0;
  let p1;
  let t1;
  let t2;
  let t3;
  let t4;
  let t5;
  let t6;
  let p2;
  return {
    c() {
      div = element("div");
      p0 = element("p");
      p0.innerHTML = `<strong class="svelte-gas-w9ye3f">No spell updates needed for this level-up</strong>`;
      p1 = element("p");
      t1 = text(
        /*characterClassName*/
        ctx[3]
      );
      t2 = text("s have access to all spells of appropriate level. At level ");
      t3 = text(
        /*$newLevelValueForExistingClass*/
        ctx[8]
      );
      t4 = text(", you still have access to the same spell levels (1-");
      t5 = text(
        /*effectiveMaxSpellLevel*/
        ctx[2]
      );
      t6 = text(") as before.");
      p2 = element("p");
      p2.innerHTML = `<em class="svelte-gas-w9ye3f">Your spell selection is complete - no changes needed.</em>`;
      attr(div, "class", "info-message no-updates-notice svelte-gas-w9ye3f");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, p0);
      append(div, p1);
      append(p1, t1);
      append(p1, t2);
      append(p1, t3);
      append(p1, t4);
      append(p1, t5);
      append(p1, t6);
      append(div, p2);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*characterClassName*/
      8) set_data(
        t1,
        /*characterClassName*/
        ctx2[3]
      );
      if (dirty[0] & /*$newLevelValueForExistingClass*/
      256) set_data(
        t3,
        /*$newLevelValueForExistingClass*/
        ctx2[8]
      );
      if (dirty[0] & /*effectiveMaxSpellLevel*/
      4) set_data(
        t5,
        /*effectiveMaxSpellLevel*/
        ctx2[2]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_if_block_6(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      div.textContent = `${localize("Spells.SpellsReadOnly")}`;
      attr(div, "class", "info-message svelte-gas-w9ye3f");
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
function create_else_block_3(ctx) {
  let span;
  let t0;
  let t1;
  let t2;
  return {
    c() {
      span = element("span");
      t0 = text("Auto-populate All Spells (Levels 1-");
      t1 = text(
        /*effectiveMaxSpellLevel*/
        ctx[2]
      );
      t2 = text(")");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t0);
      append(span, t1);
      append(span, t2);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*effectiveMaxSpellLevel*/
      4) set_data(
        t1,
        /*effectiveMaxSpellLevel*/
        ctx2[2]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block_9(ctx) {
  let span;
  let t0;
  let t1;
  let t2;
  return {
    c() {
      span = element("span");
      t0 = text("Auto-populate New Level ");
      t1 = text(
        /*effectiveMaxSpellLevel*/
        ctx[2]
      );
      t2 = text(" Spells");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t0);
      append(span, t1);
      append(span, t2);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*effectiveMaxSpellLevel*/
      4) set_data(
        t1,
        /*effectiveMaxSpellLevel*/
        ctx2[2]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_else_block_2(ctx) {
  let each_1_anchor;
  let each_value_2 = ensure_array_like(
    /*selectedSpellsList*/
    ctx[11]
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
      43010048) {
        each_value_2 = ensure_array_like(
          /*selectedSpellsList*/
          ctx2[11]
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
      attr(div, "class", "empty-selection svelte-gas-w9ye3f");
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
    ctx[58].spell.name + ""
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
      2048 && t_1_value !== (t_1_value = /*selectedSpell*/
      ctx2[58].spell.name + "")) set_data(t_1, t_1_value);
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
    ctx[56] + ""
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
      2048 && raw_value !== (raw_value = /*Html*/
      ctx2[56] + "")) span.innerHTML = raw_value;
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
    ctx[58].spell.name + ""
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
      2048 && t_1_value !== (t_1_value = /*selectedSpell*/
      ctx2[58].spell.name + "")) set_data(t_1, t_1_value);
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
    ctx[25](
      /*selectedSpell*/
      ctx[58].spell
    ) + ""
  );
  let t0;
  let span1;
  let t1_value = getSchoolName(
    /*selectedSpell*/
    ctx[58].spell
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
    value: 56,
    error: 57
  };
  handle_promise(promise = /*getEnrichedName*/
  ctx[20](
    /*selectedSpell*/
    ctx[58].spell
  ), info);
  function click_handler_1() {
    return (
      /*click_handler_1*/
      ctx[41](
        /*selectedSpell*/
        ctx[58]
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
      attr(img, "class", "spell-icon svelte-gas-w9ye3f");
      attr(img, "alt", img_alt_value = /*selectedSpell*/
      ctx[58].spell.name);
      if (!src_url_equal(img.src, img_src_value = /*selectedSpell*/
      ctx[58].spell.img)) attr(img, "src", img_src_value);
      attr(div0, "class", "spell-col1 svelte-gas-w9ye3f");
      attr(div1, "class", "spell-name svelte-gas-w9ye3f");
      attr(span0, "class", "spell-level svelte-gas-w9ye3f");
      attr(span1, "class", "spell-school svelte-gas-w9ye3f");
      attr(div2, "class", "spell-subdetails svelte-gas-w9ye3f");
      attr(div3, "class", "spell-col2 left svelte-gas-w9ye3f");
      attr(i, "class", "fas fa-trash");
      attr(button, "class", "remove-btn svelte-gas-w9ye3f");
      button.disabled = /*isDisabled*/
      ctx[14];
      attr(div4, "class", "spell-col3 svelte-gas-w9ye3f");
      attr(div5, "class", "selected-spell svelte-gas-w9ye3f");
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
        dispose = listen(button, "click", click_handler_1);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*selectedSpellsList*/
      2048 && img_alt_value !== (img_alt_value = /*selectedSpell*/
      ctx[58].spell.name)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty[0] & /*selectedSpellsList*/
      2048 && !src_url_equal(img.src, img_src_value = /*selectedSpell*/
      ctx[58].spell.img)) {
        attr(img, "src", img_src_value);
      }
      info.ctx = ctx;
      if (dirty[0] & /*selectedSpellsList*/
      2048 && promise !== (promise = /*getEnrichedName*/
      ctx[20](
        /*selectedSpell*/
        ctx[58].spell
      )) && handle_promise(promise, info)) ;
      else {
        update_await_block_branch(info, ctx, dirty);
      }
      if (dirty[0] & /*selectedSpellsList*/
      2048 && t0_value !== (t0_value = /*getSpellLevelDisplay*/
      ctx[25](
        /*selectedSpell*/
        ctx[58].spell
      ) + "")) set_data(t0, t0_value);
      if (dirty[0] & /*selectedSpellsList*/
      2048 && t1_value !== (t1_value = getSchoolName(
        /*selectedSpell*/
        ctx[58].spell
      ) + "")) set_data(t1, t1_value);
      if (dirty[0] & /*isDisabled*/
      16384) {
        button.disabled = /*isDisabled*/
        ctx[14];
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
    ctx[15]
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
      7390224) {
        each_value = ensure_array_like(
          /*spellLevels*/
          ctx2[15]
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
      attr(div, "class", "empty-state svelte-gas-w9ye3f");
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
      attr(div, "class", "loading svelte-gas-w9ye3f");
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
    ctx[4][
      /*spellLevel*/
      ctx[50]
    ]
  );
  const get_key = (ctx2) => (
    /*spell*/
    ctx2[53].uuid || /*spell*/
    ctx2[53]._id
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
      attr(ul, "class", "blank svelte-gas-w9ye3f");
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
      5292048) {
        each_value_1 = ensure_array_like(
          /*spellsByLevel*/
          ctx2[4][
            /*spellLevel*/
            ctx2[50]
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
    ctx[53].name + ""
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
      32784 && t_1_value !== (t_1_value = /*spell*/
      ctx2[53].name + "")) set_data(t_1, t_1_value);
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
    ctx[56] + ""
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
      32784 && raw_value !== (raw_value = /*Html*/
      ctx2[56] + "")) span.innerHTML = raw_value;
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
    ctx[53].name + ""
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
      32784 && t_1_value !== (t_1_value = /*spell*/
      ctx2[53].name + "")) set_data(t_1, t_1_value);
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
    ctx[53],
    true
  ) + "";
  let t1;
  let div5;
  let div3;
  let div4;
  let t3_value = getCastingTimeDisplay(
    /*spell*/
    ctx[53]
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
      attr(div1, "class", "badge svelte-gas-w9ye3f");
      attr(div2, "class", "flex2 flexrow");
      attr(div4, "class", "badge svelte-gas-w9ye3f");
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
      32784 && t1_value !== (t1_value = getSchoolName(
        /*spell*/
        ctx2[53],
        true
      ) + "")) set_data(t1, t1_value);
      if (dirty[0] & /*spellsByLevel, spellLevels*/
      32784 && t3_value !== (t3_value = getCastingTimeDisplay(
        /*spell*/
        ctx2[53]
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
    ctx[53],
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
    value: 56,
    error: 57
  };
  handle_promise(promise = /*getEnrichedName*/
  ctx[20](
    /*spell*/
    ctx[53]
  ), info);
  let if_block = show_if && create_if_block_3(ctx);
  function click_handler_3() {
    return (
      /*click_handler_3*/
      ctx[45](
        /*spell*/
        ctx[53]
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
      attr(img, "class", "spell-icon cover svelte-gas-w9ye3f");
      if (!src_url_equal(img.src, img_src_value = /*spell*/
      ctx[53].img)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*spell*/
      ctx[53].name);
      attr(div0, "class", "flex0 spell-details svelte-gas-w9ye3f");
      attr(div1, "class", "flex1 left spell-name gold svelte-gas-w9ye3f");
      attr(div2, "class", "flexrow");
      attr(div3, "class", "flex1 left spell-meta svelte-gas-w9ye3f");
      attr(div4, "class", "flexrow smalltext");
      attr(div5, "class", "flex1 spell-info");
      attr(i, "class", "fas fa-plus svelte-gas-w9ye3f");
      attr(button, "class", "add-btn svelte-gas-w9ye3f");
      button.disabled = /*isDisabled*/
      ctx[14];
      attr(div6, "class", "spell-actions mx-sm svelte-gas-w9ye3f");
      attr(li, "class", "flexrow spell-row justify-flexrow-vertical svelte-gas-w9ye3f");
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
        dispose = listen(button, "click", prevent_default(click_handler_3));
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*spellsByLevel, spellLevels*/
      32784 && !src_url_equal(img.src, img_src_value = /*spell*/
      ctx[53].img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty[0] & /*spellsByLevel, spellLevels*/
      32784 && img_alt_value !== (img_alt_value = /*spell*/
      ctx[53].name)) {
        attr(img, "alt", img_alt_value);
      }
      info.ctx = ctx;
      if (dirty[0] & /*spellsByLevel, spellLevels*/
      32784 && promise !== (promise = /*getEnrichedName*/
      ctx[20](
        /*spell*/
        ctx[53]
      )) && handle_promise(promise, info)) ;
      else {
        update_await_block_branch(info, ctx, dirty);
      }
      if (dirty[0] & /*spellsByLevel, spellLevels*/
      32784) show_if = getSchoolName(
        /*spell*/
        ctx[53],
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
      16384) {
        button.disabled = /*isDisabled*/
        ctx[14];
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
    ctx[50] + ""
  );
  let t0;
  let t1;
  let t2_value = (
    /*spellsByLevel*/
    ctx[4][
      /*spellLevel*/
      ctx[50]
    ].length + ""
  );
  let t2;
  let t3;
  let mounted;
  let dispose;
  function select_block_type_4(ctx2, dirty) {
    if (
      /*expandedLevels*/
      ctx2[10][
        /*spellLevel*/
        ctx2[50]
      ]
    ) return create_if_block_4;
    return create_else_block_1;
  }
  let current_block_type = select_block_type_4(ctx);
  let if_block0 = current_block_type(ctx);
  function click_handler_2() {
    return (
      /*click_handler_2*/
      ctx[44](
        /*spellLevel*/
        ctx[50]
      )
    );
  }
  let if_block1 = (
    /*expandedLevels*/
    ctx[10][
      /*spellLevel*/
      ctx[50]
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
      attr(h4, "class", "left mt-sm flexrow spell-level-header pointer svelte-gas-w9ye3f");
      attr(div2, "class", "spell-level-group svelte-gas-w9ye3f");
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
        dispose = listen(h4, "click", click_handler_2);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (current_block_type !== (current_block_type = select_block_type_4(ctx))) {
        if_block0.d(1);
        if_block0 = current_block_type(ctx);
        if (if_block0) {
          if_block0.c();
          if_block0.m(div0, null);
        }
      }
      if (dirty[0] & /*spellLevels*/
      32768 && t0_value !== (t0_value = /*spellLevel*/
      ctx[50] + "")) set_data(t0, t0_value);
      if (dirty[0] & /*spellsByLevel, spellLevels*/
      32784 && t2_value !== (t2_value = /*spellsByLevel*/
      ctx[4][
        /*spellLevel*/
        ctx[50]
      ].length + "")) set_data(t2, t2_value);
      if (
        /*expandedLevels*/
        ctx[10][
          /*spellLevel*/
          ctx[50]
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
    ctx[18].cantrips + ""
  );
  let t2;
  let t3;
  let t4_value = (
    /*$spellLimits*/
    ctx[6].cantrips + ""
  );
  let t4;
  let div2;
  let div3;
  let t7_value = (
    /*$currentSpellCounts*/
    ctx[18].spells + ""
  );
  let t7;
  let t8;
  let t9_value = (
    /*$spellLimits*/
    (ctx[6].spells === 999 ? "All" : (
      /*$spellLimits*/
      ctx[6].spells
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
    ctx[18].cantrips + ""
  );
  let t12;
  let t13;
  let t14_value = (
    /*$spellLimits*/
    ctx[6].cantrips + ""
  );
  let t14;
  let div8;
  let div9;
  let t17_value = (
    /*$currentSpellCounts*/
    ctx[18].spells + ""
  );
  let t17;
  let t18;
  let t19_value = (
    /*$spellLimits*/
    (ctx[6].spells === 999 ? "All" : (
      /*$spellLimits*/
      ctx[6].spells
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
  function select_block_type(ctx2, dirty) {
    if (
      /*isDisabled*/
      ctx2[14]
    ) return create_if_block_6;
    if (
      /*isLevelUpWithNoSpellUpdates*/
      ctx2[16]
    ) return create_if_block_7;
    if (
      /*shouldOfferAutoPopulate*/
      ctx2[17]
    ) return create_if_block_8;
  }
  let current_block_type = select_block_type(ctx);
  let if_block0 = current_block_type && current_block_type(ctx);
  function select_block_type_2(ctx2, dirty) {
    if (
      /*selectedSpellsList*/
      ctx2[11].length === 0
    ) return create_if_block_5;
    return create_else_block_2;
  }
  let current_block_type_1 = select_block_type_2(ctx);
  let if_block1 = current_block_type_1(ctx);
  function select_block_type_3(ctx2, dirty) {
    if (
      /*loading*/
      ctx2[9]
    ) return create_if_block;
    if (
      /*filteredSpells*/
      ctx2[5].length === 0
    ) return create_if_block_1;
    return create_else_block;
  }
  let current_block_type_2 = select_block_type_3(ctx);
  let if_block2 = current_block_type_2(ctx);
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
      attr(div0, "class", "grid-item label svelte-gas-w9ye3f");
      attr(div1, "class", "grid-item value " + /*spellCountCss*/
      ctx[27] + " svelte-gas-w9ye3f");
      attr(div2, "class", "grid-item label svelte-gas-w9ye3f");
      attr(div3, "class", "grid-item value " + /*spellLimitsCss*/
      ctx[28] + " svelte-gas-w9ye3f");
      attr(div4, "class", "panel-header-grid svelte-gas-w9ye3f");
      attr(div5, "class", "sticky-header svelte-gas-w9ye3f");
      toggle_class(div5, "hidden", !/*scrolled*/
      ctx[12]);
      attr(div6, "class", "grid-item label svelte-gas-w9ye3f");
      attr(div7, "class", "grid-item value " + /*spellCountCss*/
      ctx[27] + " svelte-gas-w9ye3f");
      attr(div8, "class", "grid-item label svelte-gas-w9ye3f");
      attr(div9, "class", "grid-item value " + /*spellLimitsCss*/
      ctx[28] + " svelte-gas-w9ye3f");
      attr(div10, "class", "panel-header-grid svelte-gas-w9ye3f");
      toggle_class(
        div10,
        "hidden",
        /*scrolled*/
        ctx[12]
      );
      attr(h30, "class", "svelte-gas-w9ye3f");
      attr(div11, "class", "selected-spells svelte-gas-w9ye3f");
      attr(div12, "class", "left-panel svelte-gas-w9ye3f");
      attr(h31, "class", "svelte-gas-w9ye3f");
      attr(input, "class", "keyword-filter svelte-gas-w9ye3f");
      attr(input, "type", "text");
      attr(input, "placeholder", localize("Spells.FilterPlaceholder"));
      input.disabled = /*isDisabled*/
      ctx[14];
      attr(div13, "class", "filter-container mb-sm svelte-gas-w9ye3f");
      attr(div14, "class", "right-panel spell-list svelte-gas-w9ye3f");
      attr(div15, "class", "spells-tab svelte-gas-w9ye3f");
      set_custom_element_data(spells_tab_container, "class", null_to_empty(
        /*containerClasses*/
        ctx[26]
      ) + " svelte-gas-w9ye3f");
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
      ctx[42](div12);
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
          ctx[43]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block0) {
        if_block0.p(ctx2, dirty);
      } else {
        if (if_block0) if_block0.d(1);
        if_block0 = current_block_type && current_block_type(ctx2);
        if (if_block0) {
          if_block0.c();
          if_block0.m(spells_tab_container, div5);
        }
      }
      if (dirty[0] & /*$currentSpellCounts*/
      262144 && t2_value !== (t2_value = /*$currentSpellCounts*/
      ctx2[18].cantrips + "")) set_data(t2, t2_value);
      if (dirty[0] & /*$spellLimits*/
      64 && t4_value !== (t4_value = /*$spellLimits*/
      ctx2[6].cantrips + "")) set_data(t4, t4_value);
      if (dirty[0] & /*$currentSpellCounts*/
      262144 && t7_value !== (t7_value = /*$currentSpellCounts*/
      ctx2[18].spells + "")) set_data(t7, t7_value);
      if (dirty[0] & /*$spellLimits*/
      64 && t9_value !== (t9_value = /*$spellLimits*/
      (ctx2[6].spells === 999 ? "All" : (
        /*$spellLimits*/
        ctx2[6].spells
      )) + "")) set_data(t9, t9_value);
      if (dirty[0] & /*scrolled*/
      4096) {
        toggle_class(div5, "hidden", !/*scrolled*/
        ctx2[12]);
      }
      if (dirty[0] & /*$currentSpellCounts*/
      262144 && t12_value !== (t12_value = /*$currentSpellCounts*/
      ctx2[18].cantrips + "")) set_data(t12, t12_value);
      if (dirty[0] & /*$spellLimits*/
      64 && t14_value !== (t14_value = /*$spellLimits*/
      ctx2[6].cantrips + "")) set_data(t14, t14_value);
      if (dirty[0] & /*$currentSpellCounts*/
      262144 && t17_value !== (t17_value = /*$currentSpellCounts*/
      ctx2[18].spells + "")) set_data(t17, t17_value);
      if (dirty[0] & /*$spellLimits*/
      64 && t19_value !== (t19_value = /*$spellLimits*/
      (ctx2[6].spells === 999 ? "All" : (
        /*$spellLimits*/
        ctx2[6].spells
      )) + "")) set_data(t19, t19_value);
      if (dirty[0] & /*scrolled*/
      4096) {
        toggle_class(
          div10,
          "hidden",
          /*scrolled*/
          ctx2[12]
        );
      }
      if (current_block_type_1 === (current_block_type_1 = select_block_type_2(ctx2)) && if_block1) {
        if_block1.p(ctx2, dirty);
      } else {
        if_block1.d(1);
        if_block1 = current_block_type_1(ctx2);
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
      16384) {
        input.disabled = /*isDisabled*/
        ctx2[14];
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
      if (current_block_type_2 === (current_block_type_2 = select_block_type_3(ctx2)) && if_block2) {
        if_block2.p(ctx2, dirty);
      } else {
        if_block2.d(1);
        if_block2 = current_block_type_2(ctx2);
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
      if (if_block0) {
        if_block0.d();
      }
      if_block1.d();
      ctx[42](null);
      if_block2.d();
      mounted = false;
      dispose();
    }
  };
}
function getMaxSpellLevelForClass(level, className) {
  const fullCasters = ["Bard", "Cleric", "Druid", "Sorcerer", "Wizard"];
  const halfCasters = ["Paladin", "Ranger"];
  const thirdCasters = ["Arcane Trickster", "Eldritch Knight"];
  const warlockProgression = ["Warlock"];
  if (fullCasters.includes(className)) {
    return Math.min(9, Math.ceil(level / 2));
  } else if (halfCasters.includes(className)) {
    return Math.min(5, Math.ceil((level - 1) / 4));
  } else if (thirdCasters.includes(className)) {
    return Math.min(4, Math.ceil((level - 2) / 6));
  } else if (warlockProgression.includes(className)) {
    if (level >= 17) return 5;
    if (level >= 11) return 3;
    if (level >= 7) return 2;
    if (level >= 1) return 1;
    return 0;
  } else if (className === "Artificer") {
    if (level < 2) return 0;
    return Math.min(5, Math.ceil((level - 1) / 4));
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
  let effectiveCharacterLevel;
  let hasAllSpellsAccess;
  let calculatedMaxSpellLevel;
  let levelUpAwareMaxSpellLevel;
  let effectiveMaxSpellLevel;
  let oldMaxSpellLevel;
  let shouldOfferAutoPopulate;
  let isLevelUpWithNoSpellUpdates;
  let filteredSpells;
  let spellsByLevel;
  let spellLevels;
  let $spellLimits;
  let $currentSpellCounts;
  let $isLevelUp;
  let $actor;
  let $maxSpellLevel;
  let $availableSpells;
  let $selectedSpells;
  let $spellProgress;
  let $newLevelValueForExistingClass;
  let $characterClass;
  let $readOnlyTabs;
  component_subscribe($$self, spellLimits, ($$value) => $$invalidate(6, $spellLimits = $$value));
  component_subscribe($$self, currentSpellCounts, ($$value) => $$invalidate(18, $currentSpellCounts = $$value));
  component_subscribe($$self, isLevelUp, ($$value) => $$invalidate(7, $isLevelUp = $$value));
  component_subscribe($$self, maxSpellLevel, ($$value) => $$invalidate(34, $maxSpellLevel = $$value));
  component_subscribe($$self, availableSpells, ($$value) => $$invalidate(35, $availableSpells = $$value));
  component_subscribe($$self, selectedSpells, ($$value) => $$invalidate(36, $selectedSpells = $$value));
  component_subscribe($$self, spellProgress, ($$value) => $$invalidate(37, $spellProgress = $$value));
  component_subscribe($$self, newLevelValueForExistingClass, ($$value) => $$invalidate(8, $newLevelValueForExistingClass = $$value));
  component_subscribe($$self, characterClass, ($$value) => $$invalidate(38, $characterClass = $$value));
  component_subscribe($$self, readOnlyTabs, ($$value) => $$invalidate(39, $readOnlyTabs = $$value));
  const actor = getContext("#doc");
  component_subscribe($$self, actor, (value) => $$invalidate(33, $actor = value));
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
    $$invalidate(9, loading = true);
    initializeSpellSelection($actor);
    await loadAvailableSpells(characterClassName);
    console.log(`[SPELLS DEBUG] Loaded spells:`, {
      totalSpells: $availableSpells.length,
      effectiveCharacterLevel,
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
    $$invalidate(9, loading = false);
    const scrollingContainer = document.querySelector("#foundryvtt-actor-studio-pc-sheet section.a");
    if (scrollingContainer) {
      const handleScroll = () => {
        $$invalidate(12, scrolled = scrollingContainer.scrollTop > 0);
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
  function toggleSpellLevel(level) {
    $$invalidate(10, expandedLevels[level] = !expandedLevels[level], expandedLevels);
    $$invalidate(10, expandedLevels = { ...expandedLevels });
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
    const spellId = spell.id || spell._id;
    const currentSelections = get_store_value(selectedSpells);
    if (currentSelections.has(spellId)) {
      ui.notifications?.warn("Spell already selected");
      return;
    }
    await addSpell(spell);
  }
  function removeFromSelection(spellId) {
    removeSpell(spellId);
  }
  async function autoPopulateSpells() {
    if (!hasAllSpellsAccess) {
      ui.notifications?.warn("This class does not have access to all spells");
      return;
    }
    try {
      const success = await autoPopulateAllSpells(characterClassName, effectiveMaxSpellLevel, $actor, $isLevelUp, oldMaxSpellLevel);
      if (success) {
        await tick();
      }
    } catch (error) {
      console.error("Error auto-populating spells:", error);
      ui.notifications?.error("Failed to auto-populate spells");
    }
  }
  function getSpellLevelDisplay(spell) {
    const level = spell.system?.level || 0;
    return level === 0 ? localize("Spells.Cantrip") : `${localize("Spells.Level")} ${level}`;
  }
  const containerClasses = { readonly: isDisabled };
  const spellCountCss = {
    "at-limit": $currentSpellCounts.cantrips >= $spellLimits.cantrips
  };
  const spellLimitsCss = {
    "at-limit": $currentSpellCounts.spells >= $spellLimits.spells
  };
  const click_handler = () => autoPopulateSpells();
  const click_handler_1 = (selectedSpell) => removeFromSelection(selectedSpell.id);
  function div12_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      spellContainer = $$value;
      $$invalidate(13, spellContainer);
    });
  }
  function input_input_handler() {
    keywordFilter = this.value;
    $$invalidate(0, keywordFilter);
  }
  const click_handler_2 = (spellLevel) => toggleSpellLevel(spellLevel);
  const click_handler_3 = (spell) => addToSelection(spell);
  $$self.$$.update = () => {
    if ($$self.$$.dirty[1] & /*$readOnlyTabs*/
    256) {
      $$invalidate(14, isDisabled = $readOnlyTabs.includes("spells"));
    }
    if ($$self.$$.dirty[1] & /*$actor*/
    4) {
      $actor.toObject();
    }
    if ($$self.$$.dirty[1] & /*$characterClass*/
    128) {
      $$invalidate(3, characterClassName = $characterClass?.name || "Bard");
    }
    if ($$self.$$.dirty[0] & /*$isLevelUp, $newLevelValueForExistingClass*/
    384) {
      $$invalidate(31, effectiveCharacterLevel = $isLevelUp && $newLevelValueForExistingClass ? $newLevelValueForExistingClass : 1);
    }
    if ($$self.$$.dirty[0] & /*$spellLimits*/
    64) {
      $$invalidate(29, hasAllSpellsAccess = $spellLimits.hasAllSpells);
    }
    if ($$self.$$.dirty[0] & /*characterClassName*/
    8 | $$self.$$.dirty[1] & /*effectiveCharacterLevel*/
    1) {
      $$invalidate(30, calculatedMaxSpellLevel = getMaxSpellLevelForClass(effectiveCharacterLevel, characterClassName));
    }
    if ($$self.$$.dirty[0] & /*$isLevelUp, $newLevelValueForExistingClass, characterClassName, calculatedMaxSpellLevel*/
    1073742216) {
      $$invalidate(32, levelUpAwareMaxSpellLevel = $isLevelUp && $newLevelValueForExistingClass ? getMaxSpellLevelForClass($newLevelValueForExistingClass, characterClassName) : calculatedMaxSpellLevel);
    }
    if ($$self.$$.dirty[1] & /*$maxSpellLevel, levelUpAwareMaxSpellLevel*/
    10) {
      $$invalidate(2, effectiveMaxSpellLevel = $maxSpellLevel > 0 ? $maxSpellLevel : levelUpAwareMaxSpellLevel);
    }
    if ($$self.$$.dirty[0] & /*$isLevelUp, $newLevelValueForExistingClass, characterClassName*/
    392) {
      $$invalidate(1, oldMaxSpellLevel = $isLevelUp && $newLevelValueForExistingClass ? getMaxSpellLevelForClass($newLevelValueForExistingClass - 1, characterClassName) : 0);
    }
    if ($$self.$$.dirty[0] & /*hasAllSpellsAccess, $isLevelUp, effectiveMaxSpellLevel, oldMaxSpellLevel*/
    536871046) {
      $$invalidate(17, shouldOfferAutoPopulate = hasAllSpellsAccess && (!$isLevelUp || // Always offer during character creation
      effectiveMaxSpellLevel > oldMaxSpellLevel));
    }
    if ($$self.$$.dirty[0] & /*$isLevelUp, hasAllSpellsAccess, effectiveMaxSpellLevel, oldMaxSpellLevel*/
    536871046) {
      $$invalidate(16, isLevelUpWithNoSpellUpdates = $isLevelUp && hasAllSpellsAccess && effectiveMaxSpellLevel <= oldMaxSpellLevel);
    }
    if ($$self.$$.dirty[0] & /*characterClassName, $newLevelValueForExistingClass, $isLevelUp, calculatedMaxSpellLevel, effectiveMaxSpellLevel, $spellLimits*/
    1073742284 | $$self.$$.dirty[1] & /*$characterClass, effectiveCharacterLevel, $maxSpellLevel, levelUpAwareMaxSpellLevel, $spellProgress*/
    203) {
      {
        console.log(`[SPELLS DEBUG] Character data:`, {
          characterClass: $characterClass,
          characterClassName,
          effectiveCharacterLevel,
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
    if ($$self.$$.dirty[1] & /*$selectedSpells*/
    32) {
      {
        if ($selectedSpells) {
          $$invalidate(11, selectedSpellsList = Array.from($selectedSpells.entries()).map(([spellId, { itemData }]) => ({ id: spellId, spell: itemData })));
        }
      }
    }
    if ($$self.$$.dirty[0] & /*keywordFilter, effectiveMaxSpellLevel, characterClassName*/
    13 | $$self.$$.dirty[1] & /*$availableSpells, $maxSpellLevel*/
    24) {
      $$invalidate(5, filteredSpells = $availableSpells.filter((spell) => {
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
    32) {
      $$invalidate(4, spellsByLevel = filteredSpells.reduce(
        (acc, spell) => {
          const level = spell.system?.level || 0;
          const levelKey = level === 0 ? "Cantrips" : `Level ${level}`;
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
    48) {
      {
        if (Object.keys(spellsByLevel).length > 0) {
          console.log(`[SPELLS DEBUG] Spells by level:`, {
            totalFiltered: filteredSpells.length,
            groupedByLevel: Object.keys(spellsByLevel).map((level) => ({
              level,
              count: spellsByLevel[level].length,
              samples: spellsByLevel[level].slice(0, 3).map((s) => s.name)
            }))
          });
        }
      }
    }
    if ($$self.$$.dirty[0] & /*spellsByLevel*/
    16) {
      $$invalidate(15, spellLevels = Object.keys(spellsByLevel).sort((a, b) => {
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
    oldMaxSpellLevel,
    effectiveMaxSpellLevel,
    characterClassName,
    spellsByLevel,
    filteredSpells,
    $spellLimits,
    $isLevelUp,
    $newLevelValueForExistingClass,
    loading,
    expandedLevels,
    selectedSpellsList,
    scrolled,
    spellContainer,
    isDisabled,
    spellLevels,
    isLevelUpWithNoSpellUpdates,
    shouldOfferAutoPopulate,
    $currentSpellCounts,
    actor,
    getEnrichedName,
    toggleSpellLevel,
    addToSelection,
    removeFromSelection,
    autoPopulateSpells,
    getSpellLevelDisplay,
    containerClasses,
    spellCountCss,
    spellLimitsCss,
    hasAllSpellsAccess,
    calculatedMaxSpellLevel,
    effectiveCharacterLevel,
    levelUpAwareMaxSpellLevel,
    $actor,
    $maxSpellLevel,
    $availableSpells,
    $selectedSpells,
    $spellProgress,
    $characterClass,
    $readOnlyTabs,
    click_handler,
    click_handler_1,
    div12_binding,
    input_input_handler,
    click_handler_2,
    click_handler_3
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
//# sourceMappingURL=Spells-CREwBBWh.js.map
