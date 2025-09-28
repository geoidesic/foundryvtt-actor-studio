import { S as SvelteComponent, i as init, s as safe_not_equal, B as ensure_array_like, a0 as assign, C as noop, k as detach, D as destroy_each, a3 as run_all, x as attr, Y as toggle_class, b7 as set_attributes, Z as get_spread_update, q as insert, u as append, a5 as listen, v as element, w as empty, b8 as compute_rest_props, M as MODULE_ID, o as onMount, b5 as onDestroy, b9 as exclude_internal_props, F as set_data, G as text, y as binding_callbacks, ba as truncate, aS as null_to_empty, N as src_url_equal, bb as stop_propagation, bc as prevent_default, ad as is_function } from "./index-D11j0XDL.js";
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[35] = list[i];
  return child_ctx;
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[32] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[35] = list[i];
  return child_ctx;
}
function get_each_context_3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[35] = list[i];
  child_ctx[41] = i;
  return child_ctx;
}
function create_if_block_14(ctx) {
  let div;
  let t;
  return {
    c() {
      div = element("div");
      t = text(
        /*placeHolder*/
        ctx[4]
      );
      attr(div, "class", "placeholder");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*placeHolder*/
      16) set_data(
        t,
        /*placeHolder*/
        ctx2[4]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_if_block_11(ctx) {
  let show_if = !/*noImg*/
  ctx[6] && !/*textOnly*/
  ctx[23](
    /*option*/
    ctx[35]
  ) && /*shrinkIfNoIcon*/
  ctx[3];
  let div;
  let t_value = truncate(
    /*option*/
    ctx[35].label,
    /*truncateWidth*/
    ctx[7]
  ) + "";
  let t;
  let if_block = show_if && create_if_block_12(ctx);
  return {
    c() {
      if (if_block) if_block.c();
      div = element("div");
      t = text(t_value);
      attr(div, "class", "option-label svelte-gas-36daa5");
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, div, anchor);
      append(div, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*noImg, options, shrinkIfNoIcon*/
      74) show_if = !/*noImg*/
      ctx2[6] && !/*textOnly*/
      ctx2[23](
        /*option*/
        ctx2[35]
      ) && /*shrinkIfNoIcon*/
      ctx2[3];
      if (show_if) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_12(ctx2);
          if_block.c();
          if_block.m(div.parentNode, div);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty[0] & /*options, truncateWidth*/
      130 && t_value !== (t_value = truncate(
        /*option*/
        ctx2[35].label,
        /*truncateWidth*/
        ctx2[7]
      ) + "")) set_data(t, t_value);
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      if (if_block) if_block.d(detaching);
    }
  };
}
function create_if_block_12(ctx) {
  let div;
  let div_class_value;
  function select_block_type(ctx2, dirty) {
    if (
      /*option*/
      ctx2[35].icon != void 0
    ) return create_if_block_13;
    return create_else_block_5;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      div = element("div");
      if_block.c();
      attr(div, "class", div_class_value = "option-icon " + /*option*/
      (ctx[35].img ? (
        /*option*/
        ctx[35].img
      ) : "") + " svelte-gas-36daa5");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if_block.m(div, null);
    },
    p(ctx2, dirty) {
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
      if (dirty[0] & /*options*/
      2 && div_class_value !== (div_class_value = "option-icon " + /*option*/
      (ctx2[35].img ? (
        /*option*/
        ctx2[35].img
      ) : "") + " svelte-gas-36daa5")) {
        attr(div, "class", div_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      if_block.d();
    }
  };
}
function create_else_block_5(ctx) {
  let img;
  let img_src_value;
  let img_alt_value;
  return {
    c() {
      img = element("img");
      if (!src_url_equal(img.src, img_src_value = /*option*/
      ctx[35].img)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*option*/
      ctx[35].label);
      attr(img, "class", "svelte-gas-36daa5");
    },
    m(target, anchor) {
      insert(target, img, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*options*/
      2 && !src_url_equal(img.src, img_src_value = /*option*/
      ctx2[35].img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty[0] & /*options*/
      2 && img_alt_value !== (img_alt_value = /*option*/
      ctx2[35].label)) {
        attr(img, "alt", img_alt_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(img);
      }
    }
  };
}
function create_if_block_13(ctx) {
  let i;
  let i_class_value;
  return {
    c() {
      i = element("i");
      attr(i, "class", i_class_value = null_to_empty(
        /*option*/
        ctx[35].icon
      ) + " svelte-gas-36daa5");
    },
    m(target, anchor) {
      insert(target, i, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*options*/
      2 && i_class_value !== (i_class_value = null_to_empty(
        /*option*/
        ctx2[35].icon
      ) + " svelte-gas-36daa5")) {
        attr(i, "class", i_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(i);
      }
    }
  };
}
function create_each_block_3(ctx) {
  let if_block_anchor;
  let if_block = (
    /*option*/
    ctx[35] && /*option*/
    ctx[35]?.value === /*value*/
    ctx[0] && create_if_block_11(ctx)
  );
  return {
    c() {
      if (if_block) if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (
        /*option*/
        ctx2[35] && /*option*/
        ctx2[35]?.value === /*value*/
        ctx2[0]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_11(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(if_block_anchor);
      }
      if (if_block) if_block.d(detaching);
    }
  };
}
function create_if_block(ctx) {
  let div;
  let if_block0_anchor;
  let if_block0 = (
    /*searchable*/
    ctx[9] && create_if_block_10(ctx)
  );
  function select_block_type_1(ctx2, dirty) {
    if (
      /*groupBy*/
      ctx2[10]
    ) return create_if_block_1;
    return create_else_block_2;
  }
  let current_block_type = select_block_type_1(ctx);
  let if_block1 = current_block_type(ctx);
  return {
    c() {
      div = element("div");
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if_block1.c();
      attr(div, "class", "options-dropdown dropshadow svelte-gas-36daa5");
      attr(div, "id", "options-list");
      attr(div, "role", "listbox");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if (if_block0) if_block0.m(div, null);
      append(div, if_block0_anchor);
      if_block1.m(div, null);
    },
    p(ctx2, dirty) {
      if (
        /*searchable*/
        ctx2[9]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_10(ctx2);
          if_block0.c();
          if_block0.m(div, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (current_block_type === (current_block_type = select_block_type_1(ctx2)) && if_block1) {
        if_block1.p(ctx2, dirty);
      } else {
        if_block1.d(1);
        if_block1 = current_block_type(ctx2);
        if (if_block1) {
          if_block1.c();
          if_block1.m(div, null);
        }
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      if (if_block0) if_block0.d();
      if_block1.d();
    }
  };
}
function create_if_block_10(ctx) {
  let input;
  let mounted;
  let dispose;
  return {
    c() {
      input = element("input");
      attr(input, "class", "search-input svelte-gas-36daa5");
      attr(input, "type", "text");
      input.value = /*searchTerm*/
      ctx[15];
      attr(input, "placeholder", "Search...");
    },
    m(target, anchor) {
      insert(target, input, anchor);
      ctx[27](input);
      if (!mounted) {
        dispose = listen(
          input,
          "input",
          /*handleInput*/
          ctx[24]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*searchTerm*/
      32768 && input.value !== /*searchTerm*/
      ctx2[15]) {
        input.value = /*searchTerm*/
        ctx2[15];
      }
    },
    d(detaching) {
      if (detaching) {
        detach(input);
      }
      ctx[27](null);
      mounted = false;
      dispose();
    }
  };
}
function create_else_block_2(ctx) {
  let each_1_anchor;
  let each_value_2 = ensure_array_like(
    /*filteredOptions*/
    ctx[16]
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
      if (dirty[0] & /*navigableOptions, filteredOptions, highlightedIndex, handleSelect, enableEnrichment, getLabel, textOnly, shrinkIfNoIcon, value*/
      10045705) {
        each_value_2 = ensure_array_like(
          /*filteredOptions*/
          ctx2[16]
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
function create_if_block_1(ctx) {
  let each_1_anchor;
  let each_value = ensure_array_like(
    /*groupedOptionKeys*/
    ctx[18]
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
      if (dirty[0] & /*groupedOptions, groupedOptionKeys, navigableOptions, highlightedIndex, handleSelect, enableEnrichment, getLabel, textOnly, shrinkIfNoIcon, value*/
      10373385) {
        each_value = ensure_array_like(
          /*groupedOptionKeys*/
          ctx2[18]
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
function create_if_block_6(ctx) {
  let div;
  let show_if = !/*textOnly*/
  ctx[23](
    /*option*/
    ctx[35]
  ) && /*shrinkIfNoIcon*/
  ctx[3];
  let if_block0_anchor;
  let div_data_index_value;
  let div_aria_selected_value;
  let mounted;
  let dispose;
  let if_block0 = show_if && create_if_block_8(ctx);
  function select_block_type_5(ctx2, dirty) {
    if (
      /*enableEnrichment*/
      ctx2[8]
    ) return create_if_block_7;
    return create_else_block_3;
  }
  let current_block_type = select_block_type_5(ctx);
  let if_block1 = current_block_type(ctx);
  return {
    c() {
      div = element("div");
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if_block1.c();
      attr(div, "class", "option svelte-gas-36daa5");
      attr(div, "role", "option");
      attr(div, "tabindex", "0");
      attr(div, "data-index", div_data_index_value = /*navigableOptions*/
      ctx[19].indexOf(
        /*option*/
        ctx[35]
      ));
      attr(div, "aria-selected", div_aria_selected_value = /*navigableOptions*/
      ctx[19].indexOf(
        /*option*/
        ctx[35]
      ) === /*highlightedIndex*/
      ctx[14]);
      toggle_class(
        div,
        "highlighted",
        /*navigableOptions*/
        ctx[19].indexOf(
          /*option*/
          ctx[35]
        ) === /*highlightedIndex*/
        ctx[14]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if (if_block0) if_block0.m(div, null);
      append(div, if_block0_anchor);
      if_block1.m(div, null);
      if (!mounted) {
        dispose = listen(div, "click", stop_propagation(prevent_default(function() {
          if (is_function(
            /*handleSelect*/
            ctx[11](
              /*option*/
              ctx[35]
            )
          )) ctx[11](
            /*option*/
            ctx[35]
          ).apply(this, arguments);
        })));
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*filteredOptions, shrinkIfNoIcon*/
      65544) show_if = !/*textOnly*/
      ctx[23](
        /*option*/
        ctx[35]
      ) && /*shrinkIfNoIcon*/
      ctx[3];
      if (show_if) {
        if (if_block0) {
          if_block0.p(ctx, dirty);
        } else {
          if_block0 = create_if_block_8(ctx);
          if_block0.c();
          if_block0.m(div, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (current_block_type === (current_block_type = select_block_type_5(ctx)) && if_block1) {
        if_block1.p(ctx, dirty);
      } else {
        if_block1.d(1);
        if_block1 = current_block_type(ctx);
        if (if_block1) {
          if_block1.c();
          if_block1.m(div, null);
        }
      }
      if (dirty[0] & /*navigableOptions, filteredOptions*/
      589824 && div_data_index_value !== (div_data_index_value = /*navigableOptions*/
      ctx[19].indexOf(
        /*option*/
        ctx[35]
      ))) {
        attr(div, "data-index", div_data_index_value);
      }
      if (dirty[0] & /*navigableOptions, filteredOptions, highlightedIndex*/
      606208 && div_aria_selected_value !== (div_aria_selected_value = /*navigableOptions*/
      ctx[19].indexOf(
        /*option*/
        ctx[35]
      ) === /*highlightedIndex*/
      ctx[14])) {
        attr(div, "aria-selected", div_aria_selected_value);
      }
      if (dirty[0] & /*navigableOptions, filteredOptions, highlightedIndex*/
      606208) {
        toggle_class(
          div,
          "highlighted",
          /*navigableOptions*/
          ctx[19].indexOf(
            /*option*/
            ctx[35]
          ) === /*highlightedIndex*/
          ctx[14]
        );
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      if (if_block0) if_block0.d();
      if_block1.d();
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_8(ctx) {
  let div;
  let div_class_value;
  function select_block_type_4(ctx2, dirty) {
    if (
      /*option*/
      ctx2[35].icon != void 0
    ) return create_if_block_9;
    return create_else_block_4;
  }
  let current_block_type = select_block_type_4(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      div = element("div");
      if_block.c();
      attr(div, "class", div_class_value = "option-icon " + /*option*/
      (ctx[35].img ? (
        /*option*/
        ctx[35].img
      ) : "") + " svelte-gas-36daa5");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if_block.m(div, null);
    },
    p(ctx2, dirty) {
      if (current_block_type === (current_block_type = select_block_type_4(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(div, null);
        }
      }
      if (dirty[0] & /*filteredOptions*/
      65536 && div_class_value !== (div_class_value = "option-icon " + /*option*/
      (ctx2[35].img ? (
        /*option*/
        ctx2[35].img
      ) : "") + " svelte-gas-36daa5")) {
        attr(div, "class", div_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      if_block.d();
    }
  };
}
function create_else_block_4(ctx) {
  let img;
  let img_src_value;
  let img_alt_value;
  return {
    c() {
      img = element("img");
      if (!src_url_equal(img.src, img_src_value = /*option*/
      ctx[35].img)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*option*/
      ctx[35].label);
      attr(img, "class", "svelte-gas-36daa5");
    },
    m(target, anchor) {
      insert(target, img, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*filteredOptions*/
      65536 && !src_url_equal(img.src, img_src_value = /*option*/
      ctx2[35].img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty[0] & /*filteredOptions*/
      65536 && img_alt_value !== (img_alt_value = /*option*/
      ctx2[35].label)) {
        attr(img, "alt", img_alt_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(img);
      }
    }
  };
}
function create_if_block_9(ctx) {
  let i;
  let i_class_value;
  return {
    c() {
      i = element("i");
      attr(i, "class", i_class_value = null_to_empty(
        /*option*/
        ctx[35].icon
      ) + " svelte-gas-36daa5");
    },
    m(target, anchor) {
      insert(target, i, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*filteredOptions*/
      65536 && i_class_value !== (i_class_value = null_to_empty(
        /*option*/
        ctx2[35].icon
      ) + " svelte-gas-36daa5")) {
        attr(i, "class", i_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(i);
      }
    }
  };
}
function create_else_block_3(ctx) {
  let div;
  let t_value = (
    /*getLabel*/
    ctx[20](
      /*option*/
      ctx[35]
    ) + ""
  );
  let t;
  return {
    c() {
      div = element("div");
      t = text(t_value);
      attr(div, "class", "option-label svelte-gas-36daa5");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*filteredOptions*/
      65536 && t_value !== (t_value = /*getLabel*/
      ctx2[20](
        /*option*/
        ctx2[35]
      ) + "")) set_data(t, t_value);
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_if_block_7(ctx) {
  let div;
  let raw_value = (
    /*option*/
    ctx[35].enrichedLabel + ""
  );
  return {
    c() {
      div = element("div");
      attr(div, "class", "option-label svelte-gas-36daa5");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      div.innerHTML = raw_value;
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*filteredOptions*/
      65536 && raw_value !== (raw_value = /*option*/
      ctx2[35].enrichedLabel + "")) div.innerHTML = raw_value;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_each_block_2(ctx) {
  let if_block_anchor;
  let if_block = (
    /*option*/
    ctx[35] && /*option*/
    ctx[35]?.value !== /*value*/
    ctx[0] && create_if_block_6(ctx)
  );
  return {
    c() {
      if (if_block) if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (
        /*option*/
        ctx2[35] && /*option*/
        ctx2[35]?.value !== /*value*/
        ctx2[0]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_6(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(if_block_anchor);
      }
      if (if_block) if_block.d(detaching);
    }
  };
}
function create_if_block_2(ctx) {
  let div;
  let show_if = !/*textOnly*/
  ctx[23](
    /*option*/
    ctx[35]
  ) && /*shrinkIfNoIcon*/
  ctx[3];
  let if_block0_anchor;
  let div_data_index_value;
  let div_aria_selected_value;
  let mounted;
  let dispose;
  let if_block0 = show_if && create_if_block_4(ctx);
  function select_block_type_3(ctx2, dirty) {
    if (
      /*enableEnrichment*/
      ctx2[8]
    ) return create_if_block_3;
    return create_else_block;
  }
  let current_block_type = select_block_type_3(ctx);
  let if_block1 = current_block_type(ctx);
  return {
    c() {
      div = element("div");
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if_block1.c();
      attr(div, "class", "option svelte-gas-36daa5");
      attr(div, "role", "option");
      attr(div, "tabindex", "0");
      attr(div, "data-index", div_data_index_value = /*navigableOptions*/
      ctx[19].indexOf(
        /*option*/
        ctx[35]
      ));
      attr(div, "aria-selected", div_aria_selected_value = /*navigableOptions*/
      ctx[19].indexOf(
        /*option*/
        ctx[35]
      ) === /*highlightedIndex*/
      ctx[14]);
      toggle_class(
        div,
        "highlighted",
        /*navigableOptions*/
        ctx[19].indexOf(
          /*option*/
          ctx[35]
        ) === /*highlightedIndex*/
        ctx[14]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if (if_block0) if_block0.m(div, null);
      append(div, if_block0_anchor);
      if_block1.m(div, null);
      if (!mounted) {
        dispose = listen(div, "click", stop_propagation(prevent_default(function() {
          if (is_function(
            /*handleSelect*/
            ctx[11](
              /*option*/
              ctx[35]
            )
          )) ctx[11](
            /*option*/
            ctx[35]
          ).apply(this, arguments);
        })));
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*groupedOptions, groupedOptionKeys, shrinkIfNoIcon*/
      393224) show_if = !/*textOnly*/
      ctx[23](
        /*option*/
        ctx[35]
      ) && /*shrinkIfNoIcon*/
      ctx[3];
      if (show_if) {
        if (if_block0) {
          if_block0.p(ctx, dirty);
        } else {
          if_block0 = create_if_block_4(ctx);
          if_block0.c();
          if_block0.m(div, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block1) {
        if_block1.p(ctx, dirty);
      } else {
        if_block1.d(1);
        if_block1 = current_block_type(ctx);
        if (if_block1) {
          if_block1.c();
          if_block1.m(div, null);
        }
      }
      if (dirty[0] & /*navigableOptions, groupedOptions, groupedOptionKeys*/
      917504 && div_data_index_value !== (div_data_index_value = /*navigableOptions*/
      ctx[19].indexOf(
        /*option*/
        ctx[35]
      ))) {
        attr(div, "data-index", div_data_index_value);
      }
      if (dirty[0] & /*navigableOptions, groupedOptions, groupedOptionKeys, highlightedIndex*/
      933888 && div_aria_selected_value !== (div_aria_selected_value = /*navigableOptions*/
      ctx[19].indexOf(
        /*option*/
        ctx[35]
      ) === /*highlightedIndex*/
      ctx[14])) {
        attr(div, "aria-selected", div_aria_selected_value);
      }
      if (dirty[0] & /*navigableOptions, groupedOptions, groupedOptionKeys, highlightedIndex*/
      933888) {
        toggle_class(
          div,
          "highlighted",
          /*navigableOptions*/
          ctx[19].indexOf(
            /*option*/
            ctx[35]
          ) === /*highlightedIndex*/
          ctx[14]
        );
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      if (if_block0) if_block0.d();
      if_block1.d();
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_4(ctx) {
  let div;
  let div_class_value;
  function select_block_type_2(ctx2, dirty) {
    if (
      /*option*/
      ctx2[35].icon != void 0
    ) return create_if_block_5;
    return create_else_block_1;
  }
  let current_block_type = select_block_type_2(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      div = element("div");
      if_block.c();
      attr(div, "class", div_class_value = "option-icon " + /*option*/
      (ctx[35].img ? (
        /*option*/
        ctx[35].img
      ) : "") + " svelte-gas-36daa5");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if_block.m(div, null);
    },
    p(ctx2, dirty) {
      if (current_block_type === (current_block_type = select_block_type_2(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(div, null);
        }
      }
      if (dirty[0] & /*groupedOptions, groupedOptionKeys*/
      393216 && div_class_value !== (div_class_value = "option-icon " + /*option*/
      (ctx2[35].img ? (
        /*option*/
        ctx2[35].img
      ) : "") + " svelte-gas-36daa5")) {
        attr(div, "class", div_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      if_block.d();
    }
  };
}
function create_else_block_1(ctx) {
  let img;
  let img_src_value;
  let img_alt_value;
  return {
    c() {
      img = element("img");
      if (!src_url_equal(img.src, img_src_value = /*option*/
      ctx[35].img)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*option*/
      ctx[35].label);
      attr(img, "class", "svelte-gas-36daa5");
    },
    m(target, anchor) {
      insert(target, img, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*groupedOptions, groupedOptionKeys*/
      393216 && !src_url_equal(img.src, img_src_value = /*option*/
      ctx2[35].img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty[0] & /*groupedOptions, groupedOptionKeys*/
      393216 && img_alt_value !== (img_alt_value = /*option*/
      ctx2[35].label)) {
        attr(img, "alt", img_alt_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(img);
      }
    }
  };
}
function create_if_block_5(ctx) {
  let i;
  let i_class_value;
  return {
    c() {
      i = element("i");
      attr(i, "class", i_class_value = null_to_empty(
        /*option*/
        ctx[35].icon
      ) + " svelte-gas-36daa5");
    },
    m(target, anchor) {
      insert(target, i, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*groupedOptions, groupedOptionKeys*/
      393216 && i_class_value !== (i_class_value = null_to_empty(
        /*option*/
        ctx2[35].icon
      ) + " svelte-gas-36daa5")) {
        attr(i, "class", i_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(i);
      }
    }
  };
}
function create_else_block(ctx) {
  let div;
  let t_value = (
    /*getLabel*/
    ctx[20](
      /*option*/
      ctx[35]
    ) + ""
  );
  let t;
  return {
    c() {
      div = element("div");
      t = text(t_value);
      attr(div, "class", "option-label svelte-gas-36daa5");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*groupedOptions, groupedOptionKeys*/
      393216 && t_value !== (t_value = /*getLabel*/
      ctx2[20](
        /*option*/
        ctx2[35]
      ) + "")) set_data(t, t_value);
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_if_block_3(ctx) {
  let div;
  let raw_value = (
    /*option*/
    ctx[35].enrichedLabel + ""
  );
  return {
    c() {
      div = element("div");
      attr(div, "class", "option-label svelte-gas-36daa5");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      div.innerHTML = raw_value;
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*groupedOptions, groupedOptionKeys*/
      393216 && raw_value !== (raw_value = /*option*/
      ctx2[35].enrichedLabel + "")) div.innerHTML = raw_value;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_each_block_1(ctx) {
  let if_block_anchor;
  let if_block = (
    /*option*/
    ctx[35] && /*option*/
    ctx[35]?.value !== /*value*/
    ctx[0] && create_if_block_2(ctx)
  );
  return {
    c() {
      if (if_block) if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (
        /*option*/
        ctx2[35] && /*option*/
        ctx2[35]?.value !== /*value*/
        ctx2[0]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_2(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(if_block_anchor);
      }
      if (if_block) if_block.d(detaching);
    }
  };
}
function create_each_block(ctx) {
  let div;
  let t_value = (
    /*groupName*/
    ctx[32] + ""
  );
  let t;
  let each_1_anchor;
  let each_value_1 = ensure_array_like(
    /*groupedOptions*/
    ctx[17][
      /*groupName*/
      ctx[32]
    ]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  }
  return {
    c() {
      div = element("div");
      t = text(t_value);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
      attr(div, "class", "group-label svelte-gas-36daa5");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert(target, each_1_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*groupedOptionKeys*/
      262144 && t_value !== (t_value = /*groupName*/
      ctx2[32] + "")) set_data(t, t_value);
      if (dirty[0] & /*navigableOptions, groupedOptions, groupedOptionKeys, highlightedIndex, handleSelect, enableEnrichment, getLabel, textOnly, shrinkIfNoIcon, value*/
      10373385) {
        each_value_1 = ensure_array_like(
          /*groupedOptions*/
          ctx2[17][
            /*groupName*/
            ctx2[32]
          ]
        );
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1(ctx2, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_1.length;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div);
        detach(each_1_anchor);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_fragment(ctx) {
  let div2;
  let div1;
  let if_block0_anchor;
  let div0;
  let mounted;
  let dispose;
  let if_block0 = (
    /*placeHolder*/
    ctx[4] && !/*value*/
    ctx[0] && create_if_block_14(ctx)
  );
  let each_value_3 = ensure_array_like(
    /*options*/
    ctx[1]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_3.length; i += 1) {
    each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
  }
  let if_block1 = (
    /*isOpen*/
    ctx[12] && create_if_block(ctx)
  );
  let div2_levels = [
    { class: "custom-select" },
    /*$$restProps*/
    ctx[25],
    { id: (
      /*id*/
      ctx[5]
    ) },
    { role: "combobox" },
    { "aria-expanded": (
      /*isOpen*/
      ctx[12]
    ) },
    { "aria-haspopup": "listbox" },
    { "aria-controls": "options-list" },
    { tabindex: "0" }
  ];
  let div_data_2 = {};
  for (let i = 0; i < div2_levels.length; i += 1) {
    div_data_2 = assign(div_data_2, div2_levels[i]);
  }
  return {
    c() {
      div2 = element("div");
      div1 = element("div");
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      div0 = element("div");
      div0.innerHTML = `<i class="fas fa-chevron-down svelte-gas-36daa5"></i>`;
      if (if_block1) if_block1.c();
      attr(div0, "class", "chevron-icon svelte-gas-36daa5");
      attr(div1, "class", "selected-option svelte-gas-36daa5");
      attr(div1, "role", "button");
      attr(
        div1,
        "aria-expanded",
        /*isOpen*/
        ctx[12]
      );
      attr(div1, "aria-haspopup", "listbox");
      attr(div1, "tabindex", "0");
      toggle_class(
        div1,
        "selected",
        /*isOpen*/
        ctx[12]
      );
      toggle_class(
        div1,
        "disabled",
        /*disabled*/
        ctx[2]
      );
      set_attributes(div2, div_data_2);
      toggle_class(div2, "svelte-gas-36daa5", true);
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, div1);
      if (if_block0) if_block0.m(div1, null);
      append(div1, if_block0_anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div1, null);
        }
      }
      append(div1, div0);
      if (if_block1) if_block1.m(div2, null);
      if (!mounted) {
        dispose = [
          listen(
            div1,
            "click",
            /*toggleDropdown*/
            ctx[21]
          ),
          listen(
            div2,
            "keydown",
            /*handleKeydown*/
            ctx[22]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (
        /*placeHolder*/
        ctx2[4] && !/*value*/
        ctx2[0]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_14(ctx2);
          if_block0.c();
          if_block0.m(div1, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty[0] & /*options, truncateWidth, noImg, textOnly, shrinkIfNoIcon, value*/
      8388811) {
        each_value_3 = ensure_array_like(
          /*options*/
          ctx2[1]
        );
        let i;
        for (i = 0; i < each_value_3.length; i += 1) {
          const child_ctx = get_each_context_3(ctx2, each_value_3, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_3(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(div1, div0);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_3.length;
      }
      if (dirty[0] & /*isOpen*/
      4096) {
        attr(
          div1,
          "aria-expanded",
          /*isOpen*/
          ctx2[12]
        );
      }
      if (dirty[0] & /*isOpen*/
      4096) {
        toggle_class(
          div1,
          "selected",
          /*isOpen*/
          ctx2[12]
        );
      }
      if (dirty[0] & /*disabled*/
      4) {
        toggle_class(
          div1,
          "disabled",
          /*disabled*/
          ctx2[2]
        );
      }
      if (
        /*isOpen*/
        ctx2[12]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block(ctx2);
          if_block1.c();
          if_block1.m(div2, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      set_attributes(div2, div_data_2 = get_spread_update(div2_levels, [
        { class: "custom-select" },
        dirty[0] & /*$$restProps*/
        33554432 && /*$$restProps*/
        ctx2[25],
        dirty[0] & /*id*/
        32 && { id: (
          /*id*/
          ctx2[5]
        ) },
        { role: "combobox" },
        dirty[0] & /*isOpen*/
        4096 && { "aria-expanded": (
          /*isOpen*/
          ctx2[12]
        ) },
        { "aria-haspopup": "listbox" },
        { "aria-controls": "options-list" },
        { tabindex: "0" }
      ]));
      toggle_class(div2, "svelte-gas-36daa5", true);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div2);
      }
      if (if_block0) if_block0.d();
      destroy_each(each_blocks, detaching);
      if (if_block1) if_block1.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function isClickOutsideContainer(event, containerElement) {
  try {
    const targetElement = event.target;
    if (targetElement === containerElement) {
      return false;
    }
    if (!containerElement) {
      console.warn("[IconSelect] containerElement is null, treating as click outside");
      return true;
    }
    if (!targetElement) {
      console.warn("[IconSelect] targetElement is null, treating as click outside");
      return true;
    }
    return !containerElement.contains(targetElement);
  } catch (error) {
    console.error("[IconSelect] Error in isClickOutsideContainer:", error);
    return true;
  }
}
function getValueAtPath(obj, path) {
  if (!path || !obj) return void 0;
  return path.split(".").reduce((acc, part) => acc && acc[part] !== void 0 ? acc[part] : void 0, obj);
}
function getGroupKey(option, groupBySpec) {
  if (!groupBySpec) return void 0;
  if (Array.isArray(groupBySpec)) {
    const parts = groupBySpec.map((p) => {
      const v2 = getValueAtPath(option, p);
      return v2 === void 0 || v2 === null ? "" : String(v2).trim();
    }).filter(Boolean);
    return parts.length ? parts.join(" ") : void 0;
  }
  const v = getValueAtPath(option, groupBySpec);
  return v === void 0 || v === null ? void 0 : String(v);
}
function instance($$self, $$props, $$invalidate) {
  let navigableOptions;
  const omit_props_names = [
    "options",
    "value",
    "disabled",
    "handler",
    "shrinkIfNoIcon",
    "placeHolder",
    "id",
    "noImg",
    "truncateWidth",
    "enableEnrichment",
    "searchable",
    "groupBy",
    "handleSelect"
  ];
  let $$restProps = compute_rest_props($$props, omit_props_names);
  let { options = [] } = $$props;
  let { value = "" } = $$props;
  let { disabled = false } = $$props;
  let { handler = void 0 } = $$props;
  let { shrinkIfNoIcon = true } = $$props;
  let { placeHolder = false } = $$props;
  let { id = void 0 } = $$props;
  let { noImg = false } = $$props;
  let { truncateWidth = 20 } = $$props;
  let { enableEnrichment = false } = $$props;
  let { searchable = true } = $$props;
  let { groupBy = false } = $$props;
  let isOpen = false;
  let searchInput;
  let highlightedIndex = -1;
  let { handleSelect = (option) => {
    if (handler) {
      if (handler(option.value)) {
        $$invalidate(0, value = option.value);
      }
    } else {
      console.warn("You need to pass a click handler in");
    }
    toggleDropdown();
  } } = $$props;
  const showPackLabelInSelect = game.settings.get(MODULE_ID, "showPackLabelInSelect");
  function getLabel(option) {
    if (!groupBy && showPackLabelInSelect && option.packLabel) {
      return `[${option.packLabel}] ${option.label}`;
    }
    return option.label;
  }
  function toggleDropdown() {
    if (disabled) {
      $$invalidate(12, isOpen = false);
      return;
    }
    $$invalidate(12, isOpen = !isOpen);
    if (isOpen) {
      $$invalidate(15, searchTerm = "");
      $$invalidate(14, highlightedIndex = -1);
    }
  }
  function handleKeydown(event) {
    if (!isOpen) {
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
        event.preventDefault();
        toggleDropdown();
      }
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (navigableOptions.length > 0) {
          $$invalidate(14, highlightedIndex = highlightedIndex >= 0 ? highlightedIndex + 1 : 0);
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (navigableOptions.length > 0) {
          $$invalidate(14, highlightedIndex = highlightedIndex > 0 ? highlightedIndex - 1 : navigableOptions.length - 1);
        }
        break;
      case "Enter":
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < navigableOptions.length) {
          handleSelect(navigableOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        $$invalidate(12, isOpen = false);
        $$invalidate(14, highlightedIndex = -1);
        break;
      case "Tab":
        $$invalidate(12, isOpen = false);
        $$invalidate(14, highlightedIndex = -1);
        break;
    }
  }
  function handleClickOutside(event) {
    try {
      const containerElement = document.getElementById(id);
      if (!containerElement) {
        console.warn("[IconSelect] Element with id", id, "not found, treating as click outside");
        $$invalidate(12, isOpen = false);
        return;
      }
      const isClickOutside = isClickOutsideContainer(event, containerElement);
      if (isClickOutside) {
        $$invalidate(12, isOpen = false);
      }
    } catch (error) {
      console.error("[IconSelect] Error in handleClickOutside:", error);
      $$invalidate(12, isOpen = false);
    }
  }
  onMount(() => {
    window.addEventListener("click", handleClickOutside);
  });
  onDestroy(() => {
    window.removeEventListener("click", handleClickOutside);
  });
  let textOnly = (option) => {
    return option.icon || option.img ? false : true;
  };
  let searchTerm = "";
  let debounceTimeout;
  function handleInput(event) {
    clearTimeout(debounceTimeout);
    const val = event.target.value;
    debounceTimeout = setTimeout(
      () => {
        $$invalidate(15, searchTerm = val);
      },
      300
    );
  }
  let filteredOptions = [];
  let groupedOptions = {};
  let groupedOptionKeys = [];
  function input_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      searchInput = $$value;
      $$invalidate(13, searchInput);
    });
  }
  $$self.$$set = ($$new_props) => {
    $$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    $$invalidate(25, $$restProps = compute_rest_props($$props, omit_props_names));
    if ("options" in $$new_props) $$invalidate(1, options = $$new_props.options);
    if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    if ("disabled" in $$new_props) $$invalidate(2, disabled = $$new_props.disabled);
    if ("handler" in $$new_props) $$invalidate(26, handler = $$new_props.handler);
    if ("shrinkIfNoIcon" in $$new_props) $$invalidate(3, shrinkIfNoIcon = $$new_props.shrinkIfNoIcon);
    if ("placeHolder" in $$new_props) $$invalidate(4, placeHolder = $$new_props.placeHolder);
    if ("id" in $$new_props) $$invalidate(5, id = $$new_props.id);
    if ("noImg" in $$new_props) $$invalidate(6, noImg = $$new_props.noImg);
    if ("truncateWidth" in $$new_props) $$invalidate(7, truncateWidth = $$new_props.truncateWidth);
    if ("enableEnrichment" in $$new_props) $$invalidate(8, enableEnrichment = $$new_props.enableEnrichment);
    if ("searchable" in $$new_props) $$invalidate(9, searchable = $$new_props.searchable);
    if ("groupBy" in $$new_props) $$invalidate(10, groupBy = $$new_props.groupBy);
    if ("handleSelect" in $$new_props) $$invalidate(11, handleSelect = $$new_props.handleSelect);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*options, searchTerm*/
    32770) {
      $$invalidate(16, filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase())));
    }
    if ($$self.$$.dirty[0] & /*groupBy, filteredOptions*/
    66560) {
      if (groupBy) {
        const map = {};
        for (const opt of filteredOptions) {
          const raw = getGroupKey(opt, groupBy);
          const key = raw === void 0 || raw === null || raw === "" ? "Other" : String(raw);
          if (!map[key]) map[key] = [];
          map[key].push(opt);
        }
        for (const k of Object.keys(map)) {
          map[k].sort((a, b) => (a.label || "").localeCompare(b.label || ""));
        }
        const keys = Object.keys(map).sort((a, b) => a.localeCompare(b));
        const sorted = {};
        for (const k of keys) sorted[k] = map[k];
        $$invalidate(17, groupedOptions = sorted);
        $$invalidate(18, groupedOptionKeys = keys);
      } else {
        $$invalidate(17, groupedOptions = {});
        $$invalidate(18, groupedOptionKeys = []);
      }
    }
    if ($$self.$$.dirty[0] & /*groupBy, groupedOptionKeys, groupedOptions, filteredOptions*/
    459776) {
      {
        if (groupBy && groupedOptionKeys.length > 0) {
          const arr = [];
          for (const key of groupedOptionKeys) {
            arr.push({ __group: true, label: key });
            for (const opt of groupedOptions[key]) arr.push(opt);
          }
        } else {
          filteredOptions.slice();
        }
      }
    }
    if ($$self.$$.dirty[0] & /*filteredOptions, value*/
    65537) {
      $$invalidate(19, navigableOptions = filteredOptions.filter((option) => option?.value !== value));
    }
    if ($$self.$$.dirty[0] & /*navigableOptions, highlightedIndex*/
    540672) {
      if (navigableOptions.length > 0 && highlightedIndex >= navigableOptions.length) {
        $$invalidate(14, highlightedIndex = navigableOptions.length - 1);
      } else if (navigableOptions.length === 0) {
        $$invalidate(14, highlightedIndex = -1);
      }
    }
    if ($$self.$$.dirty[0] & /*isOpen, searchInput*/
    12288) {
      if (isOpen && searchInput) {
        searchInput.focus();
      }
    }
  };
  return [
    value,
    options,
    disabled,
    shrinkIfNoIcon,
    placeHolder,
    id,
    noImg,
    truncateWidth,
    enableEnrichment,
    searchable,
    groupBy,
    handleSelect,
    isOpen,
    searchInput,
    highlightedIndex,
    searchTerm,
    filteredOptions,
    groupedOptions,
    groupedOptionKeys,
    navigableOptions,
    getLabel,
    toggleDropdown,
    handleKeydown,
    textOnly,
    handleInput,
    $$restProps,
    handler,
    input_binding
  ];
}
class IconSelect extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance,
      create_fragment,
      safe_not_equal,
      {
        options: 1,
        value: 0,
        disabled: 2,
        handler: 26,
        shrinkIfNoIcon: 3,
        placeHolder: 4,
        id: 5,
        noImg: 6,
        truncateWidth: 7,
        enableEnrichment: 8,
        searchable: 9,
        groupBy: 10,
        handleSelect: 11
      },
      null,
      [-1, -1]
    );
  }
}
export {
  IconSelect as I
};
//# sourceMappingURL=IconSelect-DRh--Pgu.js.map
