import { S as SvelteComponent, i as init, s as safe_not_equal, C as noop, k as detach, q as insert, w as empty, o as onMount, aR as ucfirst, N as src_url_equal, x as attr, F as set_data, aS as null_to_empty, u as append, v as element, G as text, W as space, d as destroy_component, t as transition_out, a as transition_in, m as mount_component, a5 as listen, ad as is_function, c as create_component, b as component_subscribe, aT as isLevelUpAdvancementInProgress, n as group_outros, p as check_outros, h as tick, _ as __variableDynamicImportRuntimeHelper, l as localize, B as ensure_array_like, D as destroy_each, E as construct_svelte_component, O as getAdvancementValue, aU as HtmlTag, aV as levelUpPreAdvancementSelections, aW as levelUpClassObject, aX as levelUpCombinedHtml, aY as levelUpRichHTML, aZ as classUuidForLevelUp, a_ as newLevelValueForExistingClass, a$ as isNewMultiClassSelected, b0 as selectedMultiClassUUID, b1 as subClassUuidForLevelUp, b2 as levelUpSubClassObject, b3 as activeRowClassKey, b4 as levelUpClassGetsSubclassThisLevel, J as getPacksFromSettings, K as extractItemsFromPacksSync, g as getContext, b5 as onDestroy, j as set_store_value, y as binding_callbacks, z as bind, A as add_flush_callback, L as illuminatedDescription, aC as set_style, M as MODULE_ID, al as extractItemsFromPacksAsync } from "./index-DYTMcRgX.js";
import { I as IconSelect } from "./IconSelect-DhLSMhbL.js";
const globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : (
  // @ts-ignore Node typings have this
  global
);
function create_if_block$2(ctx) {
  let div6;
  let div0;
  let img;
  let img_src_value;
  let div5;
  let div1;
  let t0_value = ucfirst(
    /*classKey*/
    ctx[3]
  ) + "";
  let t0;
  let t1;
  let div3;
  let div2;
  let t2;
  let t3;
  let t4_value = (
    /*newLevel*/
    ctx[2] ? "→ " + /*newLevel*/
    ctx[2] : ""
  );
  let t4;
  let t5;
  let div3_class_value;
  let div4;
  let i;
  let i_class_value;
  return {
    c() {
      div6 = element("div");
      div0 = element("div");
      img = element("img");
      div5 = element("div");
      div1 = element("div");
      t0 = text(t0_value);
      t1 = space();
      div3 = element("div");
      div2 = element("div");
      t2 = text(
        /*oldLevel*/
        ctx[1]
      );
      t3 = space();
      t4 = text(t4_value);
      t5 = space();
      div4 = element("div");
      i = element("i");
      attr(img, "height", "40");
      attr(img, "width", "40");
      if (!src_url_equal(img.src, img_src_value = /*src*/
      ctx[0])) attr(img, "src", img_src_value);
      attr(div0, "class", "flex0 icon svelte-gas-1lozflz");
      attr(div1, "class", "flex3 left pa-xs");
      attr(div2, "class", "lozenge pa-xs svelte-gas-1lozflz");
      attr(div3, "class", div3_class_value = "center mr-sm " + /*newLevel*/
      (ctx[2] ? "flex2" : "flex0"));
      attr(i, "class", i_class_value = null_to_empty(
        /*iconClass*/
        ctx[4]
      ) + " svelte-gas-1lozflz");
      attr(div4, "class", "flex0 right pr-md py-xs");
      attr(div5, "class", "flex3 flexrow");
      attr(div6, "class", "flexrow class-row svelte-gas-1lozflz");
    },
    m(target, anchor) {
      insert(target, div6, anchor);
      append(div6, div0);
      append(div0, img);
      append(div6, div5);
      append(div5, div1);
      append(div1, t0);
      append(div1, t1);
      append(div5, div3);
      append(div3, div2);
      append(div2, t2);
      append(div2, t3);
      append(div2, t4);
      append(div2, t5);
      append(div5, div4);
      append(div4, i);
    },
    p(ctx2, dirty) {
      if (dirty & /*src*/
      1 && !src_url_equal(img.src, img_src_value = /*src*/
      ctx2[0])) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*classKey*/
      8 && t0_value !== (t0_value = ucfirst(
        /*classKey*/
        ctx2[3]
      ) + "")) set_data(t0, t0_value);
      if (dirty & /*oldLevel*/
      2) set_data(
        t2,
        /*oldLevel*/
        ctx2[1]
      );
      if (dirty & /*newLevel*/
      4 && t4_value !== (t4_value = /*newLevel*/
      ctx2[2] ? "→ " + /*newLevel*/
      ctx2[2] : "")) set_data(t4, t4_value);
      if (dirty & /*newLevel*/
      4 && div3_class_value !== (div3_class_value = "center mr-sm " + /*newLevel*/
      (ctx2[2] ? "flex2" : "flex0"))) {
        attr(div3, "class", div3_class_value);
      }
      if (dirty & /*iconClass*/
      16 && i_class_value !== (i_class_value = null_to_empty(
        /*iconClass*/
        ctx2[4]
      ) + " svelte-gas-1lozflz")) {
        attr(i, "class", i_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div6);
      }
    }
  };
}
function create_fragment$3(ctx) {
  let if_block_anchor;
  let if_block = (
    /*src*/
    ctx[0] && /*oldLevel*/
    ctx[1] && /*classKey*/
    ctx[3] && create_if_block$2(ctx)
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
    p(ctx2, [dirty]) {
      if (
        /*src*/
        ctx2[0] && /*oldLevel*/
        ctx2[1] && /*classKey*/
        ctx2[3]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$2(ctx2);
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(if_block_anchor);
      }
      if (if_block) if_block.d(detaching);
    }
  };
}
function instance$3($$self, $$props, $$invalidate) {
  let { src = false } = $$props;
  let { oldLevel = false } = $$props;
  let { newLevel = false } = $$props;
  let { classKey = false } = $$props;
  let { iconClass = "fas fa-plus" } = $$props;
  onMount(() => {
  });
  $$self.$$set = ($$props2) => {
    if ("src" in $$props2) $$invalidate(0, src = $$props2.src);
    if ("oldLevel" in $$props2) $$invalidate(1, oldLevel = $$props2.oldLevel);
    if ("newLevel" in $$props2) $$invalidate(2, newLevel = $$props2.newLevel);
    if ("classKey" in $$props2) $$invalidate(3, classKey = $$props2.classKey);
    if ("iconClass" in $$props2) $$invalidate(4, iconClass = $$props2.iconClass);
  };
  return [src, oldLevel, newLevel, classKey, iconClass];
}
class LevelUpButtonInnards extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, {
      src: 0,
      oldLevel: 1,
      newLevel: 2,
      classKey: 3,
      iconClass: 4
    });
  }
}
function create_fragment$2(ctx) {
  let div;
  let levelupbuttoninnards;
  let div_class_value;
  let current;
  let mounted;
  let dispose;
  levelupbuttoninnards = new LevelUpButtonInnards({
    props: {
      src: (
        /*imgSrc*/
        ctx[3]
      ),
      oldLevel: (
        /*oldLevel*/
        ctx[4]
      ),
      newLevel: (
        /*newLevel*/
        ctx[5]
      ),
      classKey: (
        /*classKey*/
        ctx[6]
      ),
      iconClass: (
        /*iconClass*/
        ctx[7]
      )
    }
  });
  return {
    c() {
      div = element("div");
      create_component(levelupbuttoninnards.$$.fragment);
      attr(div, "class", div_class_value = "class-row " + /*cssClasses*/
      ctx[0] + " " + /*disabled*/
      (ctx[8] ? "disabled" : "") + " svelte-gas-d1dtu8");
      attr(div, "role", "button");
      attr(div, "aria-role", "button");
      attr(
        div,
        "aria-label",
        /*tooltip*/
        ctx[1]
      );
      attr(
        div,
        "data-tooltip",
        /*tooltip*/
        ctx[1]
      );
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(levelupbuttoninnards, div, null);
      current = true;
      if (!mounted) {
        dispose = listen(div, "mousedown", function() {
          if (is_function(
            /*$isLevelUpAdvancementInProgress*/
            ctx[9] ? mousedown_handler : (
              /*eventHandler*/
              ctx[2]
            )
          )) /*$isLevelUpAdvancementInProgress*/
          (ctx[9] ? mousedown_handler : (
            /*eventHandler*/
            ctx[2]
          )).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, [dirty]) {
      ctx = new_ctx;
      const levelupbuttoninnards_changes = {};
      if (dirty & /*imgSrc*/
      8) levelupbuttoninnards_changes.src = /*imgSrc*/
      ctx[3];
      if (dirty & /*oldLevel*/
      16) levelupbuttoninnards_changes.oldLevel = /*oldLevel*/
      ctx[4];
      if (dirty & /*newLevel*/
      32) levelupbuttoninnards_changes.newLevel = /*newLevel*/
      ctx[5];
      if (dirty & /*classKey*/
      64) levelupbuttoninnards_changes.classKey = /*classKey*/
      ctx[6];
      if (dirty & /*iconClass*/
      128) levelupbuttoninnards_changes.iconClass = /*iconClass*/
      ctx[7];
      levelupbuttoninnards.$set(levelupbuttoninnards_changes);
      if (!current || dirty & /*cssClasses, disabled*/
      257 && div_class_value !== (div_class_value = "class-row " + /*cssClasses*/
      ctx[0] + " " + /*disabled*/
      (ctx[8] ? "disabled" : "") + " svelte-gas-d1dtu8")) {
        attr(div, "class", div_class_value);
      }
      if (!current || dirty & /*tooltip*/
      2) {
        attr(
          div,
          "aria-label",
          /*tooltip*/
          ctx[1]
        );
      }
      if (!current || dirty & /*tooltip*/
      2) {
        attr(
          div,
          "data-tooltip",
          /*tooltip*/
          ctx[1]
        );
      }
    },
    i(local) {
      if (current) return;
      transition_in(levelupbuttoninnards.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(levelupbuttoninnards.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      destroy_component(levelupbuttoninnards);
      mounted = false;
      dispose();
    }
  };
}
const mousedown_handler = () => {
};
function instance$2($$self, $$props, $$invalidate) {
  let $isLevelUpAdvancementInProgress;
  component_subscribe($$self, isLevelUpAdvancementInProgress, ($$value) => $$invalidate(9, $isLevelUpAdvancementInProgress = $$value));
  let { cssClasses } = $$props;
  let { tooltip = "Cancel" } = $$props;
  let { eventHandler = () => {
  } } = $$props;
  let { imgSrc } = $$props;
  let { oldLevel } = $$props;
  let { newLevel = false } = $$props;
  let { classKey } = $$props;
  let { iconClass } = $$props;
  let { disabled = false } = $$props;
  onMount(async () => {
    console.log("ClassLevelRow");
  });
  $$self.$$set = ($$props2) => {
    if ("cssClasses" in $$props2) $$invalidate(0, cssClasses = $$props2.cssClasses);
    if ("tooltip" in $$props2) $$invalidate(1, tooltip = $$props2.tooltip);
    if ("eventHandler" in $$props2) $$invalidate(2, eventHandler = $$props2.eventHandler);
    if ("imgSrc" in $$props2) $$invalidate(3, imgSrc = $$props2.imgSrc);
    if ("oldLevel" in $$props2) $$invalidate(4, oldLevel = $$props2.oldLevel);
    if ("newLevel" in $$props2) $$invalidate(5, newLevel = $$props2.newLevel);
    if ("classKey" in $$props2) $$invalidate(6, classKey = $$props2.classKey);
    if ("iconClass" in $$props2) $$invalidate(7, iconClass = $$props2.iconClass);
    if ("disabled" in $$props2) $$invalidate(8, disabled = $$props2.disabled);
  };
  return [
    cssClasses,
    tooltip,
    eventHandler,
    imgSrc,
    oldLevel,
    newLevel,
    classKey,
    iconClass,
    disabled,
    $isLevelUpAdvancementInProgress
  ];
}
class ClassLevelRow extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, {
      cssClasses: 0,
      tooltip: 1,
      eventHandler: 2,
      imgSrc: 3,
      oldLevel: 4,
      newLevel: 5,
      classKey: 6,
      iconClass: 7,
      disabled: 8
    });
  }
}
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[4] = list[i];
  return child_ctx;
}
function create_if_block$1(ctx) {
  let ul;
  let current_block_type_index;
  let if_block;
  let current;
  const if_block_creators = [create_if_block_1$1, create_else_block$1];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (!/*classAdvancementArrayFiltered*/
    ctx2[0].length) return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      ul = element("ul");
      if_block.c();
      attr(ul, "class", "icon-list");
    },
    m(target, anchor) {
      insert(target, ul, anchor);
      if_blocks[current_block_type_index].m(ul, null);
      current = true;
    },
    p(ctx2, dirty) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(ul, null);
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(ul);
      }
      if_blocks[current_block_type_index].d();
    }
  };
}
function create_else_block$1(ctx) {
  let each_1_anchor;
  let current;
  let each_value = ensure_array_like(
    /*classAdvancementArrayFiltered*/
    ctx[0]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
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
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty & /*classAdvancementArrayFiltered, classAdvancementComponents*/
      3) {
        each_value = ensure_array_like(
          /*classAdvancementArrayFiltered*/
          ctx2[0]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$1(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block$1(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        group_outros();
        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out(i);
        }
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(each_1_anchor);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_if_block_1$1(ctx) {
  let li;
  return {
    c() {
      li = element("li");
      li.textContent = `${localize("NoAdvancements")}`;
      attr(li, "class", "left");
    },
    m(target, anchor) {
      insert(target, li, anchor);
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(li);
      }
    }
  };
}
function create_each_block$1(ctx) {
  let li;
  let div2;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div1;
  let t_1_value = (
    /*advancement*/
    ctx[4].title + ""
  );
  let t_1;
  let div2_data_tooltip_value;
  let div3;
  let switch_instance;
  let li_data_type_value;
  let current;
  var switch_value = (
    /*classAdvancementComponents*/
    ctx[1][
      /*advancement*/
      ctx[4].type
    ]
  );
  function switch_props(ctx2, dirty) {
    return {
      props: { advancement: (
        /*advancement*/
        ctx2[4]
      ) }
    };
  }
  if (switch_value) {
    switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
  }
  return {
    c() {
      li = element("li");
      div2 = element("div");
      div0 = element("div");
      img = element("img");
      div1 = element("div");
      t_1 = text(t_1_value);
      div3 = element("div");
      if (switch_instance) create_component(switch_instance.$$.fragment);
      attr(img, "class", "icon");
      if (!src_url_equal(img.src, img_src_value = /*advancement*/
      ctx[4].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[4].title);
      attr(div0, "class", "flex0 relative image mr-sm");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow");
      attr(div2, "data-tooltip", div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx[4],
        "hint"
      ));
      attr(div2, "data-tooltip-class", "gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip");
      attr(div3, "class", "flexrow");
      attr(li, "class", "left");
      attr(li, "data-type", li_data_type_value = /*advancement*/
      ctx[4].type);
    },
    m(target, anchor) {
      insert(target, li, anchor);
      append(li, div2);
      append(div2, div0);
      append(div0, img);
      append(div2, div1);
      append(div1, t_1);
      append(li, div3);
      if (switch_instance) mount_component(switch_instance, div3, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (!current || dirty & /*classAdvancementArrayFiltered*/
      1 && !src_url_equal(img.src, img_src_value = /*advancement*/
      ctx2[4].icon)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty & /*classAdvancementArrayFiltered*/
      1 && img_alt_value !== (img_alt_value = /*advancement*/
      ctx2[4].title)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty & /*classAdvancementArrayFiltered*/
      1) && t_1_value !== (t_1_value = /*advancement*/
      ctx2[4].title + "")) set_data(t_1, t_1_value);
      if (!current || dirty & /*classAdvancementArrayFiltered*/
      1 && div2_data_tooltip_value !== (div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx2[4],
        "hint"
      ))) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
      if (dirty & /*classAdvancementComponents, classAdvancementArrayFiltered*/
      3 && switch_value !== (switch_value = /*classAdvancementComponents*/
      ctx2[1][
        /*advancement*/
        ctx2[4].type
      ])) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = construct_svelte_component(switch_value, switch_props(ctx2));
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, div3, null);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        const switch_instance_changes = {};
        if (dirty & /*classAdvancementArrayFiltered*/
        1) switch_instance_changes.advancement = /*advancement*/
        ctx2[4];
        switch_instance.$set(switch_instance_changes);
      }
      if (!current || dirty & /*classAdvancementArrayFiltered*/
      1 && li_data_type_value !== (li_data_type_value = /*advancement*/
      ctx2[4].type)) {
        attr(li, "data-type", li_data_type_value);
      }
    },
    i(local) {
      if (current) return;
      if (switch_instance) transition_in(switch_instance.$$.fragment, local);
      current = true;
    },
    o(local) {
      if (switch_instance) transition_out(switch_instance.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(li);
      }
      if (switch_instance) destroy_component(switch_instance);
    }
  };
}
function create_fragment$1(ctx) {
  let div;
  let current;
  let if_block = (
    /*classAdvancementArrayFiltered*/
    ctx[0] && create_if_block$1(ctx)
  );
  return {
    c() {
      div = element("div");
      if (if_block) if_block.c();
      attr(div, "class", "component");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if (if_block) if_block.m(div, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (
        /*classAdvancementArrayFiltered*/
        ctx2[0]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*classAdvancementArrayFiltered*/
          1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$1(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(div, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      if (if_block) if_block.d();
    }
  };
}
function instance$1($$self, $$props, $$invalidate) {
  let classAdvancementComponents;
  let { classAdvancementArrayFiltered = [] } = $$props;
  let { level = 0 } = $$props;
  const importClassAdvancements = async () => {
    for (const classAdvancement of classAdvancementArrayFiltered) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../components/molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-CQl_zuz-.js"), "../../components/molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-D0UeaJSg.js"), "../../components/molecules/dnd5e/Advancements/HitPoints.svelte": () => import("./HitPoints-Bk1VEJgF.js"), "../../components/molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-Ivxc1f4R.js"), "../../components/molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-E96G7Faa.js"), "../../components/molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-XSowpg70.js"), "../../components/molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-xUnN7OYS.js"), "../../components/molecules/dnd5e/Advancements/Subclass.svelte": () => import("./Subclass-BKWSDBt6.js"), "../../components/molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-BAvkJ8UA.js") }), `../../components/molecules/dnd5e/Advancements/${classAdvancement.type}.svelte`, 7);
        $$invalidate(1, classAdvancementComponents[classAdvancement.type] = module.default, classAdvancementComponents);
      } catch (error) {
        gmae.system.log.e(`Failed to load component for ${classAdvancement.type}:`, error);
      }
    }
  };
  onMount(async () => {
    await tick();
    await importClassAdvancements();
  });
  $$self.$$set = ($$props2) => {
    if ("classAdvancementArrayFiltered" in $$props2) $$invalidate(0, classAdvancementArrayFiltered = $$props2.classAdvancementArrayFiltered);
    if ("level" in $$props2) $$invalidate(2, level = $$props2.level);
  };
  $$invalidate(1, classAdvancementComponents = {});
  return [classAdvancementArrayFiltered, classAdvancementComponents, level];
}
class LevelUpExistingClassLeftCol extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {
      classAdvancementArrayFiltered: 0,
      level: 2
    });
  }
}
const { Boolean: Boolean_1 } = globals;
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[47] = list[i];
  child_ctx[49] = i;
  return child_ctx;
}
function create_if_block_11(ctx) {
  return { c: noop, m: noop, d: noop };
}
function create_if_block_7(ctx) {
  let h1;
  let if_block_anchor;
  let each_1_anchor;
  let current;
  function select_block_type(ctx2, dirty) {
    if (
      /*$classUuidForLevelUp*/
      ctx2[3]
    ) return create_if_block_10;
    return create_else_block;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type(ctx);
  let each_value = ensure_array_like(
    /*classKeys*/
    ctx[1]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  return {
    c() {
      h1 = element("h1");
      h1.textContent = `${localize("LevelUp.ExistingClassesTitle")}`;
      if_block.c();
      if_block_anchor = empty();
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
      attr(h1, "class", "flex");
    },
    m(target, anchor) {
      insert(target, h1, anchor);
      if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert(target, each_1_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      }
      if (dirty[0] & /*decorators, classKeys, eventHandlers, getters, existingCLassLevels, $newLevelValueForExistingClass, $isLevelUpAdvancementInProgress, $activeRowClassKey, $classUuidForLevelUp*/
      3695130) {
        each_value = ensure_array_like(
          /*classKeys*/
          ctx2[1]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        group_outros();
        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out(i);
        }
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean_1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(h1);
        detach(if_block_anchor);
        detach(each_1_anchor);
      }
      if_block.d(detaching);
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_else_block(ctx) {
  let p;
  return {
    c() {
      p = element("p");
      p.textContent = `${localize("LevelUp.ExistingClassesDescription")}`;
      attr(p, "class", "left");
    },
    m(target, anchor) {
      insert(target, p, anchor);
    },
    p: noop,
    d(detaching) {
      if (detaching) {
        detach(p);
      }
    }
  };
}
function create_if_block_10(ctx) {
  let p;
  let t_1_value = (
    /*$isLevelUpAdvancementInProgress*/
    (ctx[14] ? localize("LevelUp.DisabledDescription") : localize("LevelUp.CancelDescription")) + ""
  );
  let t_1;
  return {
    c() {
      p = element("p");
      t_1 = text(t_1_value);
      attr(p, "class", "left");
    },
    m(target, anchor) {
      insert(target, p, anchor);
      append(p, t_1);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*$isLevelUpAdvancementInProgress*/
      16384 && t_1_value !== (t_1_value = /*$isLevelUpAdvancementInProgress*/
      (ctx2[14] ? localize("LevelUp.DisabledDescription") : localize("LevelUp.CancelDescription")) + "")) set_data(t_1, t_1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(p);
      }
    }
  };
}
function create_if_block_9(ctx) {
  let classlevelrow;
  let current;
  classlevelrow = new ClassLevelRow({
    props: {
      imgSrc: (
        /*getters*/
        ctx[20].getCharacterClass(
          /*classKey*/
          ctx[47]
        )?.img
      ),
      cssClasses: (
        /*decorators*/
        ctx[19].existingClassesCssClassForRow(
          /*classKey*/
          ctx[47]
        )
      ),
      eventHandler: (
        /*eventHandlers*/
        ctx[21].handleRowActivation(
          /*classKey*/
          ctx[47]
        )
      ),
      oldLevel: (
        /*existingCLassLevels*/
        ctx[9][
          /*index*/
          ctx[49]
        ]
      ),
      classKey: (
        /*classKey*/
        ctx[47]
      ),
      tooltip: (
        /*getters*/
        ctx[20].rowTooltip(
          /*classKey*/
          ctx[47]
        )
      ),
      iconClass: (
        /*$classUuidForLevelUp*/
        ctx[3] ? "" : "fas fa-plus"
      )
    }
  });
  return {
    c() {
      create_component(classlevelrow.$$.fragment);
    },
    m(target, anchor) {
      mount_component(classlevelrow, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const classlevelrow_changes = {};
      if (dirty[0] & /*classKeys*/
      2) classlevelrow_changes.imgSrc = /*getters*/
      ctx2[20].getCharacterClass(
        /*classKey*/
        ctx2[47]
      )?.img;
      if (dirty[0] & /*classKeys*/
      2) classlevelrow_changes.cssClasses = /*decorators*/
      ctx2[19].existingClassesCssClassForRow(
        /*classKey*/
        ctx2[47]
      );
      if (dirty[0] & /*classKeys*/
      2) classlevelrow_changes.eventHandler = /*eventHandlers*/
      ctx2[21].handleRowActivation(
        /*classKey*/
        ctx2[47]
      );
      if (dirty[0] & /*existingCLassLevels*/
      512) classlevelrow_changes.oldLevel = /*existingCLassLevels*/
      ctx2[9][
        /*index*/
        ctx2[49]
      ];
      if (dirty[0] & /*classKeys*/
      2) classlevelrow_changes.classKey = /*classKey*/
      ctx2[47];
      if (dirty[0] & /*classKeys*/
      2) classlevelrow_changes.tooltip = /*getters*/
      ctx2[20].rowTooltip(
        /*classKey*/
        ctx2[47]
      );
      if (dirty[0] & /*$classUuidForLevelUp*/
      8) classlevelrow_changes.iconClass = /*$classUuidForLevelUp*/
      ctx2[3] ? "" : "fas fa-plus";
      classlevelrow.$set(classlevelrow_changes);
    },
    i(local) {
      if (current) return;
      transition_in(classlevelrow.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(classlevelrow.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(classlevelrow, detaching);
    }
  };
}
function create_if_block_8(ctx) {
  let classlevelrow;
  let current;
  classlevelrow = new ClassLevelRow({
    props: {
      cssClasses: (
        /*decorators*/
        ctx[19].existingClassesCssClassForRow(
          /*classKey*/
          ctx[47]
        )
      ),
      eventHandler: (
        /*eventHandlers*/
        ctx[21].handleRowDeactivation(
          /*classKey*/
          ctx[47]
        )
      ),
      imgSrc: (
        /*getters*/
        ctx[20].getCharacterClass(
          /*classKey*/
          ctx[47]
        )?.img
      ),
      oldLevel: (
        /*existingCLassLevels*/
        ctx[9][
          /*index*/
          ctx[49]
        ]
      ),
      classKey: (
        /*classKey*/
        ctx[47]
      ),
      iconClass: "fas fa-times",
      newLevel: (
        /*$newLevelValueForExistingClass*/
        ctx[4]
      ),
      tooltip: (
        /*getters*/
        ctx[20].rowTooltip(
          /*classKey*/
          ctx[47]
        )
      ),
      disabled: (
        /*$isLevelUpAdvancementInProgress*/
        ctx[14]
      )
    }
  });
  return {
    c() {
      create_component(classlevelrow.$$.fragment);
    },
    m(target, anchor) {
      mount_component(classlevelrow, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const classlevelrow_changes = {};
      if (dirty[0] & /*classKeys*/
      2) classlevelrow_changes.cssClasses = /*decorators*/
      ctx2[19].existingClassesCssClassForRow(
        /*classKey*/
        ctx2[47]
      );
      if (dirty[0] & /*classKeys*/
      2) classlevelrow_changes.eventHandler = /*eventHandlers*/
      ctx2[21].handleRowDeactivation(
        /*classKey*/
        ctx2[47]
      );
      if (dirty[0] & /*classKeys*/
      2) classlevelrow_changes.imgSrc = /*getters*/
      ctx2[20].getCharacterClass(
        /*classKey*/
        ctx2[47]
      )?.img;
      if (dirty[0] & /*existingCLassLevels*/
      512) classlevelrow_changes.oldLevel = /*existingCLassLevels*/
      ctx2[9][
        /*index*/
        ctx2[49]
      ];
      if (dirty[0] & /*classKeys*/
      2) classlevelrow_changes.classKey = /*classKey*/
      ctx2[47];
      if (dirty[0] & /*$newLevelValueForExistingClass*/
      16) classlevelrow_changes.newLevel = /*$newLevelValueForExistingClass*/
      ctx2[4];
      if (dirty[0] & /*classKeys*/
      2) classlevelrow_changes.tooltip = /*getters*/
      ctx2[20].rowTooltip(
        /*classKey*/
        ctx2[47]
      );
      if (dirty[0] & /*$isLevelUpAdvancementInProgress*/
      16384) classlevelrow_changes.disabled = /*$isLevelUpAdvancementInProgress*/
      ctx2[14];
      classlevelrow.$set(classlevelrow_changes);
    },
    i(local) {
      if (current) return;
      transition_in(classlevelrow.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(classlevelrow.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(classlevelrow, detaching);
    }
  };
}
function create_each_block(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block_8, create_if_block_9];
  const if_blocks = [];
  function select_block_type_1(ctx2, dirty) {
    if (
      /*$activeRowClassKey*/
      ctx2[13] == /*classKey*/
      ctx2[47]
    ) return 0;
    if (!/*$classUuidForLevelUp*/
    ctx2[3]) return 1;
    return -1;
  }
  if (~(current_block_type_index = select_block_type_1(ctx))) {
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  }
  return {
    c() {
      if (if_block) if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].m(target, anchor);
      }
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type_1(ctx2);
      if (current_block_type_index === previous_block_index) {
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].p(ctx2, dirty);
        }
      } else {
        if (if_block) {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
        }
        if (~current_block_type_index) {
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          } else {
            if_block.p(ctx2, dirty);
          }
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        } else {
          if_block = null;
        }
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(if_block_anchor);
      }
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].d(detaching);
      }
    }
  };
}
function create_if_block_5(ctx) {
  let h1;
  let div;
  let iconselect;
  let updating_value;
  let current;
  let if_block = (
    /*$selectedMultiClassUUID*/
    ctx[5] && create_if_block_6(ctx)
  );
  function iconselect_value_binding(value) {
    ctx[29](value);
  }
  let iconselect_props = {
    class: "icon-select",
    options: (
      /*filteredClassIndex*/
      ctx[10]
    ),
    "data-tooltip": localize("LevelUp.SelectClass"),
    placeHolder: (
      /*classesPlaceholder*/
      ctx[16]
    ),
    handler: (
      /*eventHandlers*/
      ctx[21].selectMultiClassHandler
    ),
    id: "characterClass-select"
  };
  if (
    /*$selectedMultiClassUUID*/
    ctx[5] !== void 0
  ) {
    iconselect_props.value = /*$selectedMultiClassUUID*/
    ctx[5];
  }
  iconselect = new IconSelect({ props: iconselect_props });
  binding_callbacks.push(() => bind(iconselect, "value", iconselect_value_binding));
  return {
    c() {
      h1 = element("h1");
      div = element("div");
      div.textContent = `${localize("LevelUp.NewClassTitle")}`;
      if (if_block) if_block.c();
      create_component(iconselect.$$.fragment);
      attr(div, "class", "flex2 left");
      attr(h1, "class", "flexrow mt-md svelte-gas-mafyke");
    },
    m(target, anchor) {
      insert(target, h1, anchor);
      append(h1, div);
      if (if_block) if_block.m(h1, null);
      mount_component(iconselect, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*$selectedMultiClassUUID*/
        ctx2[5]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_6(ctx2);
          if_block.c();
          if_block.m(h1, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      const iconselect_changes = {};
      if (dirty[0] & /*filteredClassIndex*/
      1024) iconselect_changes.options = /*filteredClassIndex*/
      ctx2[10];
      if (!updating_value && dirty[0] & /*$selectedMultiClassUUID*/
      32) {
        updating_value = true;
        iconselect_changes.value = /*$selectedMultiClassUUID*/
        ctx2[5];
        add_flush_callback(() => updating_value = false);
      }
      iconselect.$set(iconselect_changes);
    },
    i(local) {
      if (current) return;
      transition_in(iconselect.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(iconselect.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(h1);
      }
      if (if_block) if_block.d();
      destroy_component(iconselect, detaching);
    }
  };
}
function create_if_block_6(ctx) {
  let div;
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      button = element("button");
      button.innerHTML = `<i class="fas fa-times svelte-gas-mafyke"></i>`;
      attr(button, "class", "mt-sm gold-button svelte-gas-mafyke");
      set_style(button, "padding-right", "2px");
      attr(button, "type", "button");
      attr(button, "role", "button");
      attr(div, "class", "flex0");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, button);
      if (!mounted) {
        dispose = listen(
          button,
          "mousedown",
          /*eventHandlers*/
          ctx[21].clickCancel
        );
        mounted = true;
      }
    },
    p: noop,
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_1(ctx) {
  let h2;
  let leftcoldetails;
  let if_block0_anchor;
  let if_block1_anchor;
  let current;
  leftcoldetails = new LevelUpExistingClassLeftCol({
    props: {
      classAdvancementArrayFiltered: (
        /*classAdvancementArrayFiltered*/
        ctx[7]
      ),
      level: (
        /*newLevel*/
        ctx[0]
      )
    }
  });
  let if_block0 = (
    /*subclasses*/
    ctx[8].length && /*$levelUpClassGetsSubclassThisLevel*/
    ctx[15] && (window.GAS.dnd5eVersion < 4 || window.GAS.dnd5eRules == "2014") && create_if_block_4()
  );
  let if_block1 = (
    /*$isLevelUpAdvancementInProgress*/
    (ctx[14] || /*subclasses*/
    ctx[8].length) && /*$levelUpClassGetsSubclassThisLevel*/
    ctx[15] && create_if_block_2(ctx)
  );
  return {
    c() {
      h2 = element("h2");
      h2.textContent = `${localize("LevelUp.LevelAdvancements")}`;
      create_component(leftcoldetails.$$.fragment);
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      if_block1_anchor = empty();
      attr(h2, "class", "flexrow mt-md svelte-gas-mafyke");
    },
    m(target, anchor) {
      insert(target, h2, anchor);
      mount_component(leftcoldetails, target, anchor);
      if (if_block0) if_block0.m(target, anchor);
      insert(target, if_block0_anchor, anchor);
      if (if_block1) if_block1.m(target, anchor);
      insert(target, if_block1_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const leftcoldetails_changes = {};
      if (dirty[0] & /*classAdvancementArrayFiltered*/
      128) leftcoldetails_changes.classAdvancementArrayFiltered = /*classAdvancementArrayFiltered*/
      ctx2[7];
      if (dirty[0] & /*newLevel*/
      1) leftcoldetails_changes.level = /*newLevel*/
      ctx2[0];
      leftcoldetails.$set(leftcoldetails_changes);
      if (
        /*subclasses*/
        ctx2[8].length && /*$levelUpClassGetsSubclassThisLevel*/
        ctx2[15] && (window.GAS.dnd5eVersion < 4 || window.GAS.dnd5eRules == "2014")
      ) {
        if (if_block0) ;
        else {
          if_block0 = create_if_block_4();
          if_block0.c();
          if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (
        /*$isLevelUpAdvancementInProgress*/
        (ctx2[14] || /*subclasses*/
        ctx2[8].length) && /*$levelUpClassGetsSubclassThisLevel*/
        ctx2[15]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty[0] & /*$isLevelUpAdvancementInProgress, subclasses, $levelUpClassGetsSubclassThisLevel*/
          49408) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_2(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      transition_in(leftcoldetails.$$.fragment, local);
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(leftcoldetails.$$.fragment, local);
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(h2);
        detach(if_block0_anchor);
        detach(if_block1_anchor);
      }
      destroy_component(leftcoldetails, detaching);
      if (if_block0) if_block0.d(detaching);
      if (if_block1) if_block1.d(detaching);
    }
  };
}
function create_if_block_4(ctx) {
  let ul;
  let li;
  let div2;
  let div0;
  let div1;
  return {
    c() {
      ul = element("ul");
      li = element("li");
      div2 = element("div");
      div0 = element("div");
      div0.innerHTML = `<img class="icon" src="${`modules/${MODULE_ID}/assets/dnd5e/3.x/subclass.svg`}" alt="${localize("AltText.Subclass")}"/>`;
      div1 = element("div");
      div1.textContent = `${localize("SubClass")}`;
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow svelte-gas-mafyke");
      attr(li, "class", "left");
      attr(ul, "class", "icon-list");
    },
    m(target, anchor) {
      insert(target, ul, anchor);
      append(ul, li);
      append(li, div2);
      append(div2, div0);
      append(div2, div1);
    },
    d(detaching) {
      if (detaching) {
        detach(ul);
      }
    }
  };
}
function create_if_block_2(ctx) {
  let h3;
  let if_block_anchor;
  let iconselect;
  let updating_value;
  let current;
  let if_block = window.GAS.debug && create_if_block_3(ctx);
  function iconselect_value_binding_1(value) {
    ctx[30](value);
  }
  let iconselect_props = {
    class: "icon-select",
    active: (
      /*subClassProp*/
      ctx[11]
    ),
    options: (
      /*subclasses*/
      ctx[8]
    ),
    placeHolder: (
      /*subclassesPlaceholder*/
      ctx[17]
    ),
    handler: (
      /*eventHandlers*/
      ctx[21].selectSubClassHandler
    ),
    id: "subClass-select",
    truncateWidth: "17",
    disabled: (
      /*$isLevelUpAdvancementInProgress*/
      ctx[14]
    )
  };
  if (
    /*subclassValue*/
    ctx[6] !== void 0
  ) {
    iconselect_props.value = /*subclassValue*/
    ctx[6];
  }
  iconselect = new IconSelect({ props: iconselect_props });
  binding_callbacks.push(() => bind(iconselect, "value", iconselect_value_binding_1));
  return {
    c() {
      h3 = element("h3");
      h3.textContent = `${localize("LevelUp.Subclass")}`;
      if (if_block) if_block.c();
      if_block_anchor = empty();
      create_component(iconselect.$$.fragment);
      attr(h3, "class", "left mt-md");
    },
    m(target, anchor) {
      insert(target, h3, anchor);
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      mount_component(iconselect, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (window.GAS.debug) if_block.p(ctx2, dirty);
      const iconselect_changes = {};
      if (dirty[0] & /*subClassProp*/
      2048) iconselect_changes.active = /*subClassProp*/
      ctx2[11];
      if (dirty[0] & /*subclasses*/
      256) iconselect_changes.options = /*subclasses*/
      ctx2[8];
      if (dirty[0] & /*$isLevelUpAdvancementInProgress*/
      16384) iconselect_changes.disabled = /*$isLevelUpAdvancementInProgress*/
      ctx2[14];
      if (!updating_value && dirty[0] & /*subclassValue*/
      64) {
        updating_value = true;
        iconselect_changes.value = /*subclassValue*/
        ctx2[6];
        add_flush_callback(() => updating_value = false);
      }
      iconselect.$set(iconselect_changes);
    },
    i(local) {
      if (current) return;
      transition_in(iconselect.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(iconselect.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(h3);
        detach(if_block_anchor);
      }
      if (if_block) if_block.d(detaching);
      destroy_component(iconselect, detaching);
    }
  };
}
function create_if_block_3(ctx) {
  let pre;
  let t0;
  let t1;
  return {
    c() {
      pre = element("pre");
      t0 = text("levelUpClassGetsSubclassThisLevel ");
      t1 = text(
        /*$levelUpClassGetsSubclassThisLevel*/
        ctx[15]
      );
    },
    m(target, anchor) {
      insert(target, pre, anchor);
      append(pre, t0);
      append(pre, t1);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*$levelUpClassGetsSubclassThisLevel*/
      32768) set_data(
        t1,
        /*$levelUpClassGetsSubclassThisLevel*/
        ctx2[15]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(pre);
      }
    }
  };
}
function create_if_block(ctx) {
  let h1;
  let t_1_value = (
    /*$levelUpClassObject*/
    (ctx[2]?.name || "") + ""
  );
  let t_1;
  return {
    c() {
      h1 = element("h1");
      t_1 = text(t_1_value);
    },
    m(target, anchor) {
      insert(target, h1, anchor);
      append(h1, t_1);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*$levelUpClassObject*/
      4 && t_1_value !== (t_1_value = /*$levelUpClassObject*/
      (ctx2[2]?.name || "") + "")) set_data(t_1, t_1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(h1);
      }
    }
  };
}
function create_fragment(ctx) {
  let div4;
  let div3;
  let div0;
  let if_block0_anchor;
  let if_block1_anchor;
  let if_block2_anchor;
  let div1;
  let div2;
  let if_block4_anchor;
  let html_tag;
  let current;
  let if_block0 = window.GAS.debug && create_if_block_11();
  let if_block1 = !/*$selectedMultiClassUUID*/
  ctx[5] && create_if_block_7(ctx);
  let if_block2 = !/*$newLevelValueForExistingClass*/
  ctx[4] && create_if_block_5(ctx);
  let if_block3 = (
    /*$classUuidForLevelUp*/
    ctx[3] && create_if_block_1(ctx)
  );
  let if_block4 = (
    /*$classUuidForLevelUp*/
    ctx[3] && create_if_block(ctx)
  );
  return {
    c() {
      div4 = element("div");
      div3 = element("div");
      div0 = element("div");
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      if_block1_anchor = empty();
      if (if_block2) if_block2.c();
      if_block2_anchor = empty();
      if (if_block3) if_block3.c();
      div1 = element("div");
      div1.innerHTML = ``;
      div2 = element("div");
      if (if_block4) if_block4.c();
      if_block4_anchor = empty();
      html_tag = new HtmlTag(false);
      attr(div0, "class", "flex2 pr-sm col-a");
      attr(div1, "class", "flex0 border-right right-border-gradient-mask");
      html_tag.a = null;
      attr(div2, "class", "flex3 left pl-md scroll col-b");
      attr(div3, "class", "flexrow svelte-gas-mafyke");
      attr(div4, "class", "content svelte-gas-mafyke");
    },
    m(target, anchor) {
      insert(target, div4, anchor);
      append(div4, div3);
      append(div3, div0);
      if (if_block0) if_block0.m(div0, null);
      append(div0, if_block0_anchor);
      if (if_block1) if_block1.m(div0, null);
      append(div0, if_block1_anchor);
      if (if_block2) if_block2.m(div0, null);
      append(div0, if_block2_anchor);
      if (if_block3) if_block3.m(div0, null);
      append(div3, div1);
      append(div3, div2);
      if (if_block4) if_block4.m(div2, null);
      append(div2, if_block4_anchor);
      html_tag.m(
        /*$levelUpCombinedHtml*/
        ctx[12],
        div2
      );
      current = true;
    },
    p(ctx2, dirty) {
      if (!/*$selectedMultiClassUUID*/
      ctx2[5]) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty[0] & /*$selectedMultiClassUUID*/
          32) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_7(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div0, if_block1_anchor);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (!/*$newLevelValueForExistingClass*/
      ctx2[4]) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
          if (dirty[0] & /*$newLevelValueForExistingClass*/
          16) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block_5(ctx2);
          if_block2.c();
          transition_in(if_block2, 1);
          if_block2.m(div0, if_block2_anchor);
        }
      } else if (if_block2) {
        group_outros();
        transition_out(if_block2, 1, 1, () => {
          if_block2 = null;
        });
        check_outros();
      }
      if (
        /*$classUuidForLevelUp*/
        ctx2[3]
      ) {
        if (if_block3) {
          if_block3.p(ctx2, dirty);
          if (dirty[0] & /*$classUuidForLevelUp*/
          8) {
            transition_in(if_block3, 1);
          }
        } else {
          if_block3 = create_if_block_1(ctx2);
          if_block3.c();
          transition_in(if_block3, 1);
          if_block3.m(div0, null);
        }
      } else if (if_block3) {
        group_outros();
        transition_out(if_block3, 1, 1, () => {
          if_block3 = null;
        });
        check_outros();
      }
      if (
        /*$classUuidForLevelUp*/
        ctx2[3]
      ) {
        if (if_block4) {
          if_block4.p(ctx2, dirty);
        } else {
          if_block4 = create_if_block(ctx2);
          if_block4.c();
          if_block4.m(div2, if_block4_anchor);
        }
      } else if (if_block4) {
        if_block4.d(1);
        if_block4 = null;
      }
      if (!current || dirty[0] & /*$levelUpCombinedHtml*/
      4096) html_tag.p(
        /*$levelUpCombinedHtml*/
        ctx2[12]
      );
    },
    i(local) {
      if (current) return;
      transition_in(if_block1);
      transition_in(if_block2);
      transition_in(if_block3);
      current = true;
    },
    o(local) {
      transition_out(if_block1);
      transition_out(if_block2);
      transition_out(if_block3);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div4);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      if (if_block2) if_block2.d();
      if (if_block3) if_block3.d();
      if (if_block4) if_block4.d();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let classAdvancementComponents;
  let subClassAdvancementComponents;
  let subClassProp;
  let classes;
  let classKeys;
  let html;
  let newLevel;
  let filteredClassIndex;
  let existingCLassLevels;
  let $levelUpPreAdvancementSelections;
  let $levelUpClassObject;
  let $levelUpCombinedHtml;
  let $levelUpRichHTML;
  let $classUuidForLevelUp;
  let $newLevelValueForExistingClass;
  let $isNewMultiClassSelected;
  let $actor;
  let $selectedMultiClassUUID;
  let $subClassUuidForLevelUp;
  let $levelUpSubClassObject;
  let $activeRowClassKey;
  let $isLevelUpAdvancementInProgress;
  let $levelUpClassGetsSubclassThisLevel;
  component_subscribe($$self, levelUpPreAdvancementSelections, ($$value) => $$invalidate(38, $levelUpPreAdvancementSelections = $$value));
  component_subscribe($$self, levelUpClassObject, ($$value) => $$invalidate(2, $levelUpClassObject = $$value));
  component_subscribe($$self, levelUpCombinedHtml, ($$value) => $$invalidate(12, $levelUpCombinedHtml = $$value));
  component_subscribe($$self, levelUpRichHTML, ($$value) => $$invalidate(25, $levelUpRichHTML = $$value));
  component_subscribe($$self, classUuidForLevelUp, ($$value) => $$invalidate(3, $classUuidForLevelUp = $$value));
  component_subscribe($$self, newLevelValueForExistingClass, ($$value) => $$invalidate(4, $newLevelValueForExistingClass = $$value));
  component_subscribe($$self, isNewMultiClassSelected, ($$value) => $$invalidate(26, $isNewMultiClassSelected = $$value));
  component_subscribe($$self, selectedMultiClassUUID, ($$value) => $$invalidate(5, $selectedMultiClassUUID = $$value));
  component_subscribe($$self, subClassUuidForLevelUp, ($$value) => $$invalidate(28, $subClassUuidForLevelUp = $$value));
  component_subscribe($$self, levelUpSubClassObject, ($$value) => $$invalidate(39, $levelUpSubClassObject = $$value));
  component_subscribe($$self, activeRowClassKey, ($$value) => $$invalidate(13, $activeRowClassKey = $$value));
  component_subscribe($$self, isLevelUpAdvancementInProgress, ($$value) => $$invalidate(14, $isLevelUpAdvancementInProgress = $$value));
  component_subscribe($$self, levelUpClassGetsSubclassThisLevel, ($$value) => $$invalidate(15, $levelUpClassGetsSubclassThisLevel = $$value));
  let subclassValue = null, subClassesIndex = [], classAdvancementArrayFiltered = [], subClassAdvancementArrayFiltered = [], classesPlaceholder = localize(
    "LevelUp.SelectMulticlass"
  ), richSubClassHTML = "", packs = getPacksFromSettings("classes"), subclasses, subClassesPacks = getPacksFromSettings("subclasses"), subclassesPlaceholder = localize("Tabs.Classes.SubclassPlaceholder"), mapKeys = ["name->label", "img", "type", "folder", "uuid->value", "_id"], mappedClassIndex = extractItemsFromPacksSync(
    packs,
    mapKeys
  );
  const actor = getContext("#doc");
  component_subscribe($$self, actor, (value) => $$invalidate(27, $actor = value));
  const decorators = {
    existingClassesCssClassForRow(classKey) {
      let css = getters.getCharacterClass(classKey).uuid === $selectedMultiClassUUID ? "active" : "";
      if ($isNewMultiClassSelected) {
        css += " gold-button-disabled";
      } else {
        css += " gold-button";
      }
      return css;
    }
  };
  const filters = {
    getFilteredSubclassIndex: async () => {
      let mappedSubClassIndex = await extractItemsFromPacksAsync(subClassesPacks, ["name->label", "img", "type", "folder", "uuid->value", "_id"], ["system.classIdentifier"]);
      mappedSubClassIndex = mappedSubClassIndex.filter((x) => {
        return x.system?.classIdentifier == $levelUpClassObject?.system?.identifier;
      });
      const output = mappedSubClassIndex.flat().sort((a, b) => a.label.localeCompare(b.label));
      return output;
    }
  };
  const getters = {
    /**
    * Retrieves class data for a specific class from the actor's classes
    * @param {string} classKey - The key identifier for the character class
    * @returns {Object} The class data object from the actor
    */
    getCharacterClass(classKey) {
      return classes[classKey];
    },
    /**
    * Checks if a class row is active based on the selected class
    * @param {string} classKey - The key identifier for the character class
    * @returns {boolean} True if the class row is active, false otherwise
    */
    isRowActive(classKey) {
      if (!$classUuidForLevelUp) return false;
      return classKey === $levelUpClassObject.name.toLowerCase();
    },
    rowTooltip(classKey) {
      if ($classUuidForLevelUp && classKey === $levelUpClassObject.name.toLowerCase()) {
        if (!$isLevelUpAdvancementInProgress) {
          return localize("Cancel");
        } else {
          return localize("LevelUp.DisabledTooltip");
        }
      }
      return localize("LevelUp.Button") + " " + classKey;
    }
  };
  const importers = {
    async importClassAdvancements() {
      if (!classAdvancementArrayFiltered?.length) return;
      for (const classAdvancement of classAdvancementArrayFiltered) {
        try {
          const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-CQl_zuz-.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-D0UeaJSg.js"), "../../../molecules/dnd5e/Advancements/HitPoints.svelte": () => import("./HitPoints-Bk1VEJgF.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-Ivxc1f4R.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-E96G7Faa.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-XSowpg70.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-xUnN7OYS.js"), "../../../molecules/dnd5e/Advancements/Subclass.svelte": () => import("./Subclass-BKWSDBt6.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-BAvkJ8UA.js") }), `../../../molecules/dnd5e/Advancements/${classAdvancement.type}.svelte`, 7);
          classAdvancementComponents[classAdvancement.type] = module.default;
        } catch (error) {
          window.GAS.log.e(`Failed to load component for ${classAdvancement.type}:`, error);
        }
      }
    },
    async importSubClassAdvancements() {
      if (!subClassAdvancementArrayFiltered?.length) return;
      for (const subClassAdvancement of subClassAdvancementArrayFiltered) {
        try {
          const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-CQl_zuz-.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-D0UeaJSg.js"), "../../../molecules/dnd5e/Advancements/HitPoints.svelte": () => import("./HitPoints-Bk1VEJgF.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-Ivxc1f4R.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-E96G7Faa.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-XSowpg70.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-xUnN7OYS.js"), "../../../molecules/dnd5e/Advancements/Subclass.svelte": () => import("./Subclass-BKWSDBt6.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-BAvkJ8UA.js") }), `../../../molecules/dnd5e/Advancements/${subClassAdvancement.type}.svelte`, 7);
          await tick();
          subClassAdvancementComponents[subClassAdvancement.type] = module.default;
        } catch (error) {
          window.GAS.log.e(`Failed to load component for ${subClassAdvancement.type}:`, error);
        }
      }
    }
  };
  const eventHandlers = {
    /**
    * Handles adding a level to an existing class
    * Updates state and loads relevant class advancements
    * @param {string} classKey - The key identifier for the character class
    */
    clickAddLevel: async (classKey) => {
      if ($isNewMultiClassSelected) return;
      const isUnset = Boolean($selectedMultiClassUUID) && Boolean($newLevelValueForExistingClass);
      if (isUnset) return;
      window.GAS.log.d("classKey", classKey);
      set_store_value(levelUpClassObject, $levelUpClassObject = getters.getCharacterClass(classKey), $levelUpClassObject);
      window.GAS.log.d("classKey", classKey);
      window.GAS.log.d("$levelUpClassObject", $levelUpClassObject);
      set_store_value(classUuidForLevelUp, $classUuidForLevelUp = $levelUpClassObject.uuid, $classUuidForLevelUp);
      set_store_value(subClassUuidForLevelUp, $subClassUuidForLevelUp = null, $subClassUuidForLevelUp);
      set_store_value(levelUpSubClassObject, $levelUpSubClassObject = null, $levelUpSubClassObject);
      $$invalidate(6, subclassValue = null);
      subClassAdvancementArrayFiltered = [];
      $$invalidate(23, richSubClassHTML = "");
      set_store_value(selectedMultiClassUUID, $selectedMultiClassUUID = false, $selectedMultiClassUUID);
      set_store_value(activeRowClassKey, $activeRowClassKey = classKey, $activeRowClassKey);
      set_store_value(levelUpPreAdvancementSelections, $levelUpPreAdvancementSelections.characterClass = classKey, $levelUpPreAdvancementSelections);
      set_store_value(levelUpPreAdvancementSelections, $levelUpPreAdvancementSelections.isMultiClass = false, $levelUpPreAdvancementSelections);
      set_store_value(newLevelValueForExistingClass, $newLevelValueForExistingClass = $levelUpClassObject?.system?.levels + 1, $newLevelValueForExistingClass);
      await tick();
      $$invalidate(22, subClassesIndex = await filters.getFilteredSubclassIndex());
      await tick();
      importers.importClassAdvancements();
      set_store_value(levelUpRichHTML, $levelUpRichHTML = await illuminatedDescription(html, $levelUpClassObject), $levelUpRichHTML);
    },
    /**
    * Handles cancellation of multiclass selection
    * Resets all class and subclass related state
    */
    clickCancel: async () => {
      set_store_value(selectedMultiClassUUID, $selectedMultiClassUUID = false, $selectedMultiClassUUID);
      set_store_value(subClassUuidForLevelUp, $subClassUuidForLevelUp = null, $subClassUuidForLevelUp);
      set_store_value(classUuidForLevelUp, $classUuidForLevelUp = false, $classUuidForLevelUp);
      newLevelValueForExistingClass.set(false);
      set_store_value(activeRowClassKey, $activeRowClassKey = null, $activeRowClassKey);
      delete $levelUpPreAdvancementSelections.characterClass;
      delete $levelUpPreAdvancementSelections.isMultiClass;
    },
    /**
    * Click will either add a level to the clicked class or cancel the level up selection
    * @param classKey
    */
    handleRowActivation: (classKey) => {
      return () => {
        const nameOfClickedClass = getters.getCharacterClass(classKey).name;
        const isMultiClassMode = $classUuidForLevelUp && nameOfClickedClass == $levelUpClassObject.name;
        if (isMultiClassMode) {
          eventHandlers.clickCancel();
        } else {
          eventHandlers.clickAddLevel(classKey);
        }
      };
    },
    handleRowDeactivation: (classKey) => {
      return () => {
        eventHandlers.clickCancel();
      };
    },
    /**
    * Handles the selection of a new class for multiclassing
    * Resets subclass state and updates available options
    * @param {string} option - The UUID of the selected class
    */
    selectMultiClassHandler: async (option) => {
      set_store_value(subClassUuidForLevelUp, $subClassUuidForLevelUp = null, $subClassUuidForLevelUp);
      set_store_value(levelUpSubClassObject, $levelUpSubClassObject = null, $levelUpSubClassObject);
      $$invalidate(6, subclassValue = null);
      $$invalidate(23, richSubClassHTML = "");
      window.GAS.log.d("option", option);
      set_store_value(levelUpClassObject, $levelUpClassObject = await fromUuid(option), $levelUpClassObject);
      window.GAS.log.d("levelUpClassObject", $levelUpClassObject);
      set_store_value(selectedMultiClassUUID, $selectedMultiClassUUID = option, $selectedMultiClassUUID);
      set_store_value(classUuidForLevelUp, $classUuidForLevelUp = option, $classUuidForLevelUp);
      set_store_value(activeRowClassKey, $activeRowClassKey = null, $activeRowClassKey);
      set_store_value(levelUpPreAdvancementSelections, $levelUpPreAdvancementSelections.multiClass = option, $levelUpPreAdvancementSelections);
      set_store_value(levelUpPreAdvancementSelections, $levelUpPreAdvancementSelections.isMultiClass = true, $levelUpPreAdvancementSelections);
      await tick();
      $$invalidate(22, subClassesIndex = await filters.getFilteredSubclassIndex());
      await tick();
      importers.importClassAdvancements();
      set_store_value(levelUpRichHTML, $levelUpRichHTML = await illuminatedDescription(html, $levelUpClassObject), $levelUpRichHTML);
      Hooks.call("gas.richhtmlReady", $levelUpRichHTML);
    },
    // window.GAS.log.d('subClassesIndex', subClassesIndex)
    /**
    * Handles the selection of a subclass
    * Updates state and loads relevant subclass advancements
    * @param {string} option - The UUID of the selected subclass
    */
    selectSubClassHandler: async (option) => {
      set_store_value(subClassUuidForLevelUp, $subClassUuidForLevelUp = option.value ?? option ?? null, $subClassUuidForLevelUp);
      set_store_value(levelUpSubClassObject, $levelUpSubClassObject = await fromUuid($subClassUuidForLevelUp), $levelUpSubClassObject);
      $$invalidate(6, subclassValue = $subClassUuidForLevelUp);
      await tick();
      importers.importSubClassAdvancements();
      $$invalidate(23, richSubClassHTML = await illuminatedDescription($levelUpSubClassObject?.system?.description?.value, $levelUpSubClassObject));
      set_store_value(levelUpPreAdvancementSelections, $levelUpPreAdvancementSelections.subClass = $subClassUuidForLevelUp, $levelUpPreAdvancementSelections);
    }
  };
  onMount(async () => {
    if ($levelUpPreAdvancementSelections.isMultiClass) {
      await eventHandlers.selectMultiClassHandler($levelUpPreAdvancementSelections.multiClass);
    } else {
      if ($levelUpPreAdvancementSelections.characterClass) {
        await eventHandlers.clickAddLevel($levelUpPreAdvancementSelections.characterClass);
      }
      if ($levelUpPreAdvancementSelections.subClass) {
        await eventHandlers.selectSubClassHandler($levelUpPreAdvancementSelections.subClass);
      }
    }
  });
  onDestroy(() => {
  });
  function iconselect_value_binding(value) {
    $selectedMultiClassUUID = value;
    selectedMultiClassUUID.set($selectedMultiClassUUID);
  }
  function iconselect_value_binding_1(value) {
    subclassValue = value;
    $$invalidate(6, subclassValue);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*$subClassUuidForLevelUp*/
    268435456) {
      $$invalidate(11, subClassProp = $subClassUuidForLevelUp);
    }
    if ($$self.$$.dirty[0] & /*$selectedMultiClassUUID*/
    32) ;
    if ($$self.$$.dirty[0] & /*$actor*/
    134217728) {
      $$invalidate(24, classes = window.GAS.dnd5eVersion >= 5 ? $actor.classes : $actor._classes);
    }
    if ($$self.$$.dirty[0] & /*classes*/
    16777216) {
      $$invalidate(1, classKeys = Object.keys(classes));
    }
    if ($$self.$$.dirty[0] & /*$levelUpClassObject*/
    4) {
      html = $levelUpClassObject?.system?.description.value || "";
    }
    if ($$self.$$.dirty[0] & /*$isNewMultiClassSelected, $newLevelValueForExistingClass*/
    67108880) {
      $$invalidate(0, newLevel = $isNewMultiClassSelected ? 1 : $newLevelValueForExistingClass);
    }
    if ($$self.$$.dirty[0] & /*$classUuidForLevelUp, $levelUpRichHTML, richSubClassHTML*/
    41943048) {
      if ($classUuidForLevelUp) {
        set_store_value(
          levelUpCombinedHtml,
          $levelUpCombinedHtml = $levelUpRichHTML + (richSubClassHTML ? `<h1>${localize("SubClass")}</h1>` + richSubClassHTML : ""),
          $levelUpCombinedHtml
        );
      } else {
        set_store_value(levelUpCombinedHtml, $levelUpCombinedHtml = "", $levelUpCombinedHtml);
      }
    }
    if ($$self.$$.dirty[0] & /*classKeys*/
    2) {
      $$invalidate(10, filteredClassIndex = mappedClassIndex.filter((i) => {
        if (i.type !== "class") return false;
        const classNameLower = i.label.toLowerCase();
        return !classKeys.some((key) => key.toLowerCase() === classNameLower);
      }).sort((a, b) => a.label.localeCompare(b.label)));
    }
    if ($$self.$$.dirty[0] & /*classKeys, classes*/
    16777218) {
      $$invalidate(9, existingCLassLevels = classKeys.map((classKey, index) => {
        const classObj = classes[classKey];
        return classObj.system.levels;
      }));
    }
    if ($$self.$$.dirty[0] & /*subClassesIndex*/
    4194304) {
      if (subClassesIndex?.length) {
        $$invalidate(8, subclasses = subClassesIndex.flat().sort((a, b) => a.label.localeCompare(b.label)));
      } else {
        $$invalidate(8, subclasses = []);
      }
    }
    if ($$self.$$.dirty[0] & /*$levelUpClassObject, newLevel*/
    5) {
      if ($levelUpClassObject?.system?.advancement.length) {
        $$invalidate(7, classAdvancementArrayFiltered = $levelUpClassObject?.advancement?.byLevel[newLevel]);
      } else {
        $$invalidate(7, classAdvancementArrayFiltered = []);
      }
    }
  };
  classAdvancementComponents = {};
  subClassAdvancementComponents = {};
  return [
    newLevel,
    classKeys,
    $levelUpClassObject,
    $classUuidForLevelUp,
    $newLevelValueForExistingClass,
    $selectedMultiClassUUID,
    subclassValue,
    classAdvancementArrayFiltered,
    subclasses,
    existingCLassLevels,
    filteredClassIndex,
    subClassProp,
    $levelUpCombinedHtml,
    $activeRowClassKey,
    $isLevelUpAdvancementInProgress,
    $levelUpClassGetsSubclassThisLevel,
    classesPlaceholder,
    subclassesPlaceholder,
    actor,
    decorators,
    getters,
    eventHandlers,
    subClassesIndex,
    richSubClassHTML,
    classes,
    $levelUpRichHTML,
    $isNewMultiClassSelected,
    $actor,
    $subClassUuidForLevelUp,
    iconselect_value_binding,
    iconselect_value_binding_1
  ];
}
class LevelUp extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);
  }
}
export {
  LevelUp as default
};
//# sourceMappingURL=LevelUp-z7WDZo8Y.js.map
