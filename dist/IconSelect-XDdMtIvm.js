import { S as SvelteComponent, i as init, s as safe_not_equal, A as ensure_array_like, V as assign, B as noop, d as detach, C as destroy_each, W as run_all, j as attr, X as toggle_class, Y as set_attributes, Z as get_spread_update, b as insert, e as append, $ as listen, f as element, h as empty, a0 as compute_rest_props, o as onMount, a1 as onDestroy, a2 as exclude_internal_props, F as set_data, G as text, a3 as truncate, a4 as is_function, a5 as null_to_empty, K as src_url_equal } from "./index-Dy3PDuN4.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[16] = list[i];
  child_ctx[18] = i;
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[16] = list[i];
  child_ctx[18] = i;
  return child_ctx;
}
function create_if_block_7(ctx) {
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
      if (dirty & /*placeHolder*/
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
function create_if_block_4(ctx) {
  let show_if = !/*noImg*/
  ctx[6] && !/*textOnly*/
  ctx[11](
    /*option*/
    ctx[16]
  ) && /*shrinkIfNoIcon*/
  ctx[3];
  let div;
  let t_value = truncate(
    /*option*/
    ctx[16].label,
    /*truncateWidth*/
    ctx[7]
  ) + "";
  let t;
  let if_block = show_if && create_if_block_5(ctx);
  return {
    c() {
      if (if_block) if_block.c();
      div = element("div");
      t = text(t_value);
      attr(div, "class", "option-label svelte-gas-1evxmlp");
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, div, anchor);
      append(div, t);
    },
    p(ctx2, dirty) {
      if (dirty & /*noImg, options, shrinkIfNoIcon*/
      74) show_if = !/*noImg*/
      ctx2[6] && !/*textOnly*/
      ctx2[11](
        /*option*/
        ctx2[16]
      ) && /*shrinkIfNoIcon*/
      ctx2[3];
      if (show_if) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_5(ctx2);
          if_block.c();
          if_block.m(div.parentNode, div);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*options, truncateWidth*/
      130 && t_value !== (t_value = truncate(
        /*option*/
        ctx2[16].label,
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
function create_if_block_5(ctx) {
  let div;
  let div_class_value;
  function select_block_type(ctx2, dirty) {
    if (
      /*option*/
      ctx2[16].icon != void 0
    ) return create_if_block_6;
    return create_else_block_1;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      div = element("div");
      if_block.c();
      attr(div, "class", div_class_value = "option-icon " + /*option*/
      (ctx[16].img ? (
        /*option*/
        ctx[16].img
      ) : "") + " svelte-gas-1evxmlp");
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
      if (dirty & /*options*/
      2 && div_class_value !== (div_class_value = "option-icon " + /*option*/
      (ctx2[16].img ? (
        /*option*/
        ctx2[16].img
      ) : "") + " svelte-gas-1evxmlp")) {
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
      ctx[16].img)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*option*/
      ctx[16].label);
      attr(img, "class", "svelte-gas-1evxmlp");
    },
    m(target, anchor) {
      insert(target, img, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & /*options*/
      2 && !src_url_equal(img.src, img_src_value = /*option*/
      ctx2[16].img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*options*/
      2 && img_alt_value !== (img_alt_value = /*option*/
      ctx2[16].label)) {
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
function create_if_block_6(ctx) {
  let i;
  let i_class_value;
  return {
    c() {
      i = element("i");
      attr(i, "class", i_class_value = null_to_empty(
        /*option*/
        ctx[16].icon
      ) + " svelte-gas-1evxmlp");
    },
    m(target, anchor) {
      insert(target, i, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & /*options*/
      2 && i_class_value !== (i_class_value = null_to_empty(
        /*option*/
        ctx2[16].icon
      ) + " svelte-gas-1evxmlp")) {
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
function create_each_block_1(ctx) {
  let if_block_anchor;
  let if_block = (
    /*option*/
    ctx[16] && /*option*/
    ctx[16]?.value === /*value*/
    ctx[0] && create_if_block_4(ctx)
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
        ctx2[16] && /*option*/
        ctx2[16]?.value === /*value*/
        ctx2[0]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_4(ctx2);
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
  let each_value = ensure_array_like(
    /*options*/
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
      attr(div, "class", "options-dropdown dropshadow svelte-gas-1evxmlp");
      attr(div, "id", "options-list");
      attr(div, "role", "listbox");
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
      if (dirty & /*active, options, handleSelect, handleKeydown, undefined, textOnly, shrinkIfNoIcon, value*/
      2319) {
        each_value = ensure_array_like(
          /*options*/
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
function create_if_block_1(ctx) {
  let div1;
  let show_if = !/*textOnly*/
  ctx[11](
    /*option*/
    ctx[16]
  ) && /*shrinkIfNoIcon*/
  ctx[3];
  let div0;
  let t_value = (
    /*option*/
    ctx[16].label + ""
  );
  let t;
  let div1_class_value;
  let div1_aria_selected_value;
  let mounted;
  let dispose;
  let if_block = show_if && create_if_block_2(ctx);
  return {
    c() {
      div1 = element("div");
      if (if_block) if_block.c();
      div0 = element("div");
      t = text(t_value);
      attr(div0, "class", "option-label svelte-gas-1evxmlp");
      attr(div1, "class", div1_class_value = "option " + /*active*/
      (ctx[2] === /*option*/
      ctx[16].value ? "active" : "") + " svelte-gas-1evxmlp");
      attr(div1, "role", "option");
      attr(div1, "aria-selected", div1_aria_selected_value = /*active*/
      ctx[2] === /*option*/
      ctx[16].value);
      attr(div1, "tabindex", "0");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      if (if_block) if_block.m(div1, null);
      append(div1, div0);
      append(div0, t);
      if (!mounted) {
        dispose = [
          listen(div1, "click", function() {
            if (is_function(
              /*handleSelect*/
              ctx[8](
                /*option*/
                ctx[16]
              )
            )) ctx[8](
              /*option*/
              ctx[16]
            ).apply(this, arguments);
          }),
          listen(div1, "keydown", handleKeydown)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*options, shrinkIfNoIcon*/
      10) show_if = !/*textOnly*/
      ctx[11](
        /*option*/
        ctx[16]
      ) && /*shrinkIfNoIcon*/
      ctx[3];
      if (show_if) {
        if (if_block) {
          if_block.p(ctx, dirty);
        } else {
          if_block = create_if_block_2(ctx);
          if_block.c();
          if_block.m(div1, div0);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*options*/
      2 && t_value !== (t_value = /*option*/
      ctx[16].label + "")) set_data(t, t_value);
      if (dirty & /*active, options*/
      6 && div1_class_value !== (div1_class_value = "option " + /*active*/
      (ctx[2] === /*option*/
      ctx[16].value ? "active" : "") + " svelte-gas-1evxmlp")) {
        attr(div1, "class", div1_class_value);
      }
      if (dirty & /*active, options*/
      6 && div1_aria_selected_value !== (div1_aria_selected_value = /*active*/
      ctx[2] === /*option*/
      ctx[16].value)) {
        attr(div1, "aria-selected", div1_aria_selected_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div1);
      }
      if (if_block) if_block.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_2(ctx) {
  let div;
  let div_class_value;
  function select_block_type_1(ctx2, dirty) {
    if (
      /*option*/
      ctx2[16].icon != void 0
    ) return create_if_block_3;
    return create_else_block;
  }
  let current_block_type = select_block_type_1(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      div = element("div");
      if_block.c();
      attr(div, "class", div_class_value = "option-icon " + /*option*/
      (ctx[16].img ? (
        /*option*/
        ctx[16].img
      ) : "") + " svelte-gas-1evxmlp");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if_block.m(div, null);
    },
    p(ctx2, dirty) {
      if (current_block_type === (current_block_type = select_block_type_1(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(div, null);
        }
      }
      if (dirty & /*options*/
      2 && div_class_value !== (div_class_value = "option-icon " + /*option*/
      (ctx2[16].img ? (
        /*option*/
        ctx2[16].img
      ) : "") + " svelte-gas-1evxmlp")) {
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
function create_else_block(ctx) {
  let img;
  let img_src_value;
  let img_alt_value;
  return {
    c() {
      img = element("img");
      if (!src_url_equal(img.src, img_src_value = /*option*/
      ctx[16].img)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*option*/
      ctx[16].label);
      attr(img, "class", "svelte-gas-1evxmlp");
    },
    m(target, anchor) {
      insert(target, img, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & /*options*/
      2 && !src_url_equal(img.src, img_src_value = /*option*/
      ctx2[16].img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*options*/
      2 && img_alt_value !== (img_alt_value = /*option*/
      ctx2[16].label)) {
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
function create_if_block_3(ctx) {
  let i;
  let i_class_value;
  return {
    c() {
      i = element("i");
      attr(i, "class", i_class_value = null_to_empty(
        /*option*/
        ctx[16].icon
      ) + " svelte-gas-1evxmlp");
    },
    m(target, anchor) {
      insert(target, i, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & /*options*/
      2 && i_class_value !== (i_class_value = null_to_empty(
        /*option*/
        ctx2[16].icon
      ) + " svelte-gas-1evxmlp")) {
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
function create_each_block(ctx) {
  let if_block_anchor;
  let if_block = (
    /*option*/
    ctx[16] && /*option*/
    ctx[16]?.value !== /*value*/
    ctx[0] && create_if_block_1(ctx)
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
        ctx2[16] && /*option*/
        ctx2[16]?.value !== /*value*/
        ctx2[0]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_1(ctx2);
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
    ctx[0] && create_if_block_7(ctx)
  );
  let each_value_1 = ensure_array_like(
    /*options*/
    ctx[1]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  }
  let if_block1 = (
    /*isOpen*/
    ctx[9] && create_if_block(ctx)
  );
  let div2_levels = [
    { class: "custom-select" },
    /*$$restProps*/
    ctx[12],
    { id: (
      /*id*/
      ctx[5]
    ) },
    { role: "combobox" },
    { "aria-expanded": (
      /*isOpen*/
      ctx[9]
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
      div0.innerHTML = `<i class="fas fa-chevron-down"></i>`;
      if (if_block1) if_block1.c();
      attr(div0, "class", "chevron-icon svelte-gas-1evxmlp");
      attr(div1, "class", "selected-option svelte-gas-1evxmlp");
      attr(div1, "role", "button");
      attr(
        div1,
        "aria-expanded",
        /*isOpen*/
        ctx[9]
      );
      attr(div1, "aria-haspopup", "listbox");
      attr(div1, "tabindex", "0");
      toggle_class(
        div1,
        "selected",
        /*isOpen*/
        ctx[9]
      );
      set_attributes(div2, div_data_2);
      toggle_class(div2, "svelte-gas-1evxmlp", true);
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
            ctx[10]
          ),
          listen(div1, "keydown", handleKeydown)
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (
        /*placeHolder*/
        ctx2[4] && !/*value*/
        ctx2[0]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_7(ctx2);
          if_block0.c();
          if_block0.m(div1, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty & /*options, truncateWidth, undefined, noImg, textOnly, shrinkIfNoIcon, value*/
      2251) {
        each_value_1 = ensure_array_like(
          /*options*/
          ctx2[1]
        );
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1(ctx2, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(div1, div0);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_1.length;
      }
      if (dirty & /*isOpen*/
      512) {
        attr(
          div1,
          "aria-expanded",
          /*isOpen*/
          ctx2[9]
        );
      }
      if (dirty & /*isOpen*/
      512) {
        toggle_class(
          div1,
          "selected",
          /*isOpen*/
          ctx2[9]
        );
      }
      if (
        /*isOpen*/
        ctx2[9]
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
        dirty & /*$$restProps*/
        4096 && /*$$restProps*/
        ctx2[12],
        dirty & /*id*/
        32 && { id: (
          /*id*/
          ctx2[5]
        ) },
        { role: "combobox" },
        dirty & /*isOpen*/
        512 && { "aria-expanded": (
          /*isOpen*/
          ctx2[9]
        ) },
        { "aria-haspopup": "listbox" },
        { "aria-controls": "options-list" },
        { tabindex: "0" }
      ]));
      toggle_class(div2, "svelte-gas-1evxmlp", true);
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
function handleKeydown(event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (event.currentTarget.getAttribute("role") === "option") {
      this.handleSelect(event.currentTarget.option);
    } else {
      this.toggleDropdown();
    }
  }
}
function isClickOutsideContainer(event, containerElement) {
  const targetElement = event.target;
  if (targetElement === containerElement) {
    return false;
  }
  return !containerElement.contains(targetElement);
}
function instance($$self, $$props, $$invalidate) {
  const omit_props_names = [
    "options",
    "value",
    "disabled",
    "handler",
    "active",
    "shrinkIfNoIcon",
    "placeHolder",
    "id",
    "noImg",
    "truncateWidth",
    "handleSelect"
  ];
  let $$restProps = compute_rest_props($$props, omit_props_names);
  let { options = [] } = $$props;
  let { value = "" } = $$props;
  let { disabled = false } = $$props;
  let { handler = void 0 } = $$props;
  let { active = void 0 } = $$props;
  let { shrinkIfNoIcon = true } = $$props;
  let { placeHolder = false } = $$props;
  let { id = void 0 } = $$props;
  let { noImg = false } = $$props;
  let { truncateWidth = 20 } = $$props;
  let isOpen = false;
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
  function toggleDropdown() {
    $$invalidate(9, isOpen = !isOpen);
  }
  function handleClickOutside(event) {
    const isClickOutside = isClickOutsideContainer(event, document.getElementById(id));
    if (isClickOutside) {
      $$invalidate(9, isOpen = false);
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
  $$self.$$set = ($$new_props) => {
    $$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    $$invalidate(12, $$restProps = compute_rest_props($$props, omit_props_names));
    if ("options" in $$new_props) $$invalidate(1, options = $$new_props.options);
    if ("value" in $$new_props) $$invalidate(0, value = $$new_props.value);
    if ("disabled" in $$new_props) $$invalidate(13, disabled = $$new_props.disabled);
    if ("handler" in $$new_props) $$invalidate(14, handler = $$new_props.handler);
    if ("active" in $$new_props) $$invalidate(2, active = $$new_props.active);
    if ("shrinkIfNoIcon" in $$new_props) $$invalidate(3, shrinkIfNoIcon = $$new_props.shrinkIfNoIcon);
    if ("placeHolder" in $$new_props) $$invalidate(4, placeHolder = $$new_props.placeHolder);
    if ("id" in $$new_props) $$invalidate(5, id = $$new_props.id);
    if ("noImg" in $$new_props) $$invalidate(6, noImg = $$new_props.noImg);
    if ("truncateWidth" in $$new_props) $$invalidate(7, truncateWidth = $$new_props.truncateWidth);
    if ("handleSelect" in $$new_props) $$invalidate(8, handleSelect = $$new_props.handleSelect);
  };
  return [
    value,
    options,
    active,
    shrinkIfNoIcon,
    placeHolder,
    id,
    noImg,
    truncateWidth,
    handleSelect,
    isOpen,
    toggleDropdown,
    textOnly,
    $$restProps,
    disabled,
    handler
  ];
}
class IconSelect extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {
      options: 1,
      value: 0,
      disabled: 13,
      handler: 14,
      active: 2,
      shrinkIfNoIcon: 3,
      placeHolder: 4,
      id: 5,
      noImg: 6,
      truncateWidth: 7,
      handleSelect: 8
    });
  }
}
export {
  IconSelect as I
};
//# sourceMappingURL=IconSelect-XDdMtIvm.js.map
