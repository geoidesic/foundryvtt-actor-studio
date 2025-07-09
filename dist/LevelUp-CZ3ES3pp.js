import { S as SvelteComponent, i as init, s as safe_not_equal, a as empty, c as insert, A as noop, j as detach, o as onMount, ak as ucfirst, e as element, F as text, W as space, b as attr, L as src_url_equal, al as null_to_empty, d as append, G as set_data, z as ensure_array_like, h as transition_in, g as group_outros, f as check_outros, t as transition_out, B as destroy_each, k as component_subscribe, P as characterSubClass, Q as characterClass, am as isNewMultiClass, an as selectedMultiClass, ao as newClassLevel, J as getPacksFromSettings, K as extractItemsFromPacksSync, n as getContext, q as tick, l as localize, U as getSubclassLevel, M as MODULE_ID, v as create_component, w as mount_component, X as listen, a8 as is_function, x as destroy_component, C as binding_callbacks, D as bind, E as add_flush_callback, ap as set_style, aq as HtmlTag, _ as __variableDynamicImportRuntimeHelper, ar as extractMapIteratorObjectProperties, y as set_store_value, u as construct_svelte_component } from "./index-CFJH6n9H.js";
import { I as IconSelect } from "./IconSelect-D_STKRBS.js";
import LevelUpExistingClassLeftCol from "./LevelUpExistingClassLeftCol-BBCZOQp5.js";
const globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : (
  // @ts-ignore Node typings have this
  global
);
function create_if_block$1(ctx) {
  let div6;
  let div0;
  let img;
  let img_src_value;
  let div5;
  let div1;
  let t0_value = ucfirst(
    /*classKey*/
    ctx[2]
  ) + "";
  let t0;
  let t1;
  let div3;
  let div2;
  let t2;
  let t3;
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
        /*level*/
        ctx[1]
      );
      t3 = space();
      div4 = element("div");
      i = element("i");
      attr(img, "height", "40");
      attr(img, "width", "40");
      if (!src_url_equal(img.src, img_src_value = /*src*/
      ctx[0])) attr(img, "src", img_src_value);
      attr(div0, "class", "flex0 icon svelte-gas-1lozflz");
      attr(div1, "class", "flex3 left pa-xs");
      attr(div2, "class", "lozenge pa-xs svelte-gas-1lozflz");
      attr(div3, "class", "flex0 right mr-sm");
      attr(i, "class", i_class_value = null_to_empty(
        /*iconClass*/
        ctx[3]
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
      4 && t0_value !== (t0_value = ucfirst(
        /*classKey*/
        ctx2[2]
      ) + "")) set_data(t0, t0_value);
      if (dirty & /*level*/
      2) set_data(
        t2,
        /*level*/
        ctx2[1]
      );
      if (dirty & /*iconClass*/
      8 && i_class_value !== (i_class_value = null_to_empty(
        /*iconClass*/
        ctx2[3]
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
function create_fragment$1(ctx) {
  let if_block_anchor;
  let if_block = (
    /*src*/
    ctx[0] && /*level*/
    ctx[1] && /*classKey*/
    ctx[2] && create_if_block$1(ctx)
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
        ctx2[0] && /*level*/
        ctx2[1] && /*classKey*/
        ctx2[2]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$1(ctx2);
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
function instance$1($$self, $$props, $$invalidate) {
  let { src = false } = $$props;
  let { level = false } = $$props;
  let { classKey = false } = $$props;
  let { iconClass = "fas fa-plus" } = $$props;
  onMount(() => {
  });
  $$self.$$set = ($$props2) => {
    if ("src" in $$props2) $$invalidate(0, src = $$props2.src);
    if ("level" in $$props2) $$invalidate(1, level = $$props2.level);
    if ("classKey" in $$props2) $$invalidate(2, classKey = $$props2.classKey);
    if ("iconClass" in $$props2) $$invalidate(3, iconClass = $$props2.iconClass);
  };
  return [src, level, classKey, iconClass];
}
class LevelUpButtonInnards extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {
      src: 0,
      level: 1,
      classKey: 2,
      iconClass: 3
    });
  }
}
const { Boolean: Boolean_1 } = globals;
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[55] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[58] = list[i];
  child_ctx[60] = i;
  return child_ctx;
}
function create_each_block_1(ctx) {
  let div;
  let levelupbuttoninnards;
  let div_class_value;
  let div_aria_label_value;
  let div_data_tooltip_value;
  let current;
  let mounted;
  let dispose;
  levelupbuttoninnards = new LevelUpButtonInnards({
    props: {
      src: (
        /*getCharacterClass*/
        ctx[22](
          /*classKey*/
          ctx[58]
        )?.img
      ),
      level: (
        /*classLevels*/
        ctx[3][
          /*index*/
          ctx[60]
        ]
      ),
      classKey: (
        /*classKey*/
        ctx[58]
      ),
      iconClass: (
        /*isRowActive*/
        ctx[26](
          /*classKey*/
          ctx[58]
        ) ? "fas fa-times" : (
          /*$characterClass*/
          ctx[5] ? "" : "fas fa-plus"
        )
      )
    }
  });
  return {
    c() {
      div = element("div");
      create_component(levelupbuttoninnards.$$.fragment);
      attr(div, "class", div_class_value = "class-row " + /*existingClassesCssClassForRow*/
      ctx[21](
        /*classKey*/
        ctx[58]
      ) + " svelte-gas-18n0zua");
      attr(div, "role", "button");
      attr(div, "aria-role", "button");
      attr(div, "aria-label", div_aria_label_value = localize("GAS.LevelUp.Button") + " " + /*classKey*/
      ctx[58]);
      attr(div, "data-tooltip", div_data_tooltip_value = localize("GAS.LevelUp.Button") + " " + /*classKey*/
      ctx[58]);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(levelupbuttoninnards, div, null);
      current = true;
      if (!mounted) {
        dispose = listen(div, "mousedown", function() {
          if (is_function(
            /*handleExistingClassClick*/
            ctx[25](
              /*classKey*/
              ctx[58]
            )
          )) ctx[25](
            /*classKey*/
            ctx[58]
          ).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const levelupbuttoninnards_changes = {};
      if (dirty[0] & /*classKeys*/
      4) levelupbuttoninnards_changes.src = /*getCharacterClass*/
      ctx[22](
        /*classKey*/
        ctx[58]
      )?.img;
      if (dirty[0] & /*classLevels*/
      8) levelupbuttoninnards_changes.level = /*classLevels*/
      ctx[3][
        /*index*/
        ctx[60]
      ];
      if (dirty[0] & /*classKeys*/
      4) levelupbuttoninnards_changes.classKey = /*classKey*/
      ctx[58];
      if (dirty[0] & /*classKeys, $characterClass*/
      36) levelupbuttoninnards_changes.iconClass = /*isRowActive*/
      ctx[26](
        /*classKey*/
        ctx[58]
      ) ? "fas fa-times" : (
        /*$characterClass*/
        ctx[5] ? "" : "fas fa-plus"
      );
      levelupbuttoninnards.$set(levelupbuttoninnards_changes);
      if (!current || dirty[0] & /*classKeys*/
      4 && div_class_value !== (div_class_value = "class-row " + /*existingClassesCssClassForRow*/
      ctx[21](
        /*classKey*/
        ctx[58]
      ) + " svelte-gas-18n0zua")) {
        attr(div, "class", div_class_value);
      }
      if (!current || dirty[0] & /*classKeys*/
      4 && div_aria_label_value !== (div_aria_label_value = localize("GAS.LevelUp.Button") + " " + /*classKey*/
      ctx[58])) {
        attr(div, "aria-label", div_aria_label_value);
      }
      if (!current || dirty[0] & /*classKeys*/
      4 && div_data_tooltip_value !== (div_data_tooltip_value = localize("GAS.LevelUp.Button") + " " + /*classKey*/
      ctx[58])) {
        attr(div, "data-tooltip", div_data_tooltip_value);
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
function create_if_block_8(ctx) {
  let h1;
  let div;
  let iconselect;
  let updating_value;
  let if_block1_anchor;
  let current;
  let if_block0 = (
    /*classProp*/
    ctx[16] && create_if_block_10(ctx)
  );
  function iconselect_value_binding(value) {
    ctx[39](value);
  }
  let iconselect_props = {
    class: "icon-select",
    options: (
      /*filteredClassIndex*/
      ctx[11]
    ),
    placeHolder: (
      /*classesPlaceholder*/
      ctx[18]
    ),
    handler: (
      /*selectClassHandler*/
      ctx[23]
    ),
    id: "characterClass-select"
  };
  if (
    /*multiclassValue*/
    ctx[0] !== void 0
  ) {
    iconselect_props.value = /*multiclassValue*/
    ctx[0];
  }
  iconselect = new IconSelect({ props: iconselect_props });
  binding_callbacks.push(() => bind(iconselect, "value", iconselect_value_binding));
  let if_block1 = (
    /*isInMulticlassMode*/
    ctx[1] && create_if_block_9()
  );
  return {
    c() {
      h1 = element("h1");
      div = element("div");
      div.textContent = "Add Multiclass";
      if (if_block0) if_block0.c();
      create_component(iconselect.$$.fragment);
      if (if_block1) if_block1.c();
      if_block1_anchor = empty();
      attr(div, "class", "flex2 left");
      attr(h1, "class", "flexrow mt-md svelte-gas-18n0zua");
    },
    m(target, anchor) {
      insert(target, h1, anchor);
      append(h1, div);
      if (if_block0) if_block0.m(h1, null);
      mount_component(iconselect, target, anchor);
      if (if_block1) if_block1.m(target, anchor);
      insert(target, if_block1_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*classProp*/
        ctx2[16]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_10(ctx2);
          if_block0.c();
          if_block0.m(h1, null);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      const iconselect_changes = {};
      if (dirty[0] & /*filteredClassIndex*/
      2048) iconselect_changes.options = /*filteredClassIndex*/
      ctx2[11];
      if (!updating_value && dirty[0] & /*multiclassValue*/
      1) {
        updating_value = true;
        iconselect_changes.value = /*multiclassValue*/
        ctx2[0];
        add_flush_callback(() => updating_value = false);
      }
      iconselect.$set(iconselect_changes);
      if (
        /*isInMulticlassMode*/
        ctx2[1]
      ) {
        if (if_block1) ;
        else {
          if_block1 = create_if_block_9();
          if_block1.c();
          if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
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
        detach(if_block1_anchor);
      }
      if (if_block0) if_block0.d();
      destroy_component(iconselect, detaching);
      if (if_block1) if_block1.d(detaching);
    }
  };
}
function create_if_block_10(ctx) {
  let div;
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      button = element("button");
      button.innerHTML = `<i class="fas fa-times svelte-gas-18n0zua"></i>`;
      attr(button, "class", "mt-sm gold-button svelte-gas-18n0zua");
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
          /*clickCancelMulticlass*/
          ctx[27]
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
function create_if_block_9(ctx) {
  let div;
  let i;
  let span;
  return {
    c() {
      div = element("div");
      i = element("i");
      span = element("span");
      span.textContent = `${localize("GAS.MulticlassMode")}`;
      attr(i, "class", "fas fa-info-circle mr-xs svelte-gas-18n0zua");
      attr(div, "class", "info-text mt-sm svelte-gas-18n0zua");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, i);
      append(div, span);
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_if_block_5(ctx) {
  let if_block0_anchor;
  let if_block1_anchor;
  let current;
  let if_block0 = (
    /*selectedMultiClassObj*/
    ctx[13] && create_if_block_7(ctx)
  );
  let if_block1 = (
    /*subclasses*/
    ctx[8].length && /*classGetsSubclassThisLevel*/
    ctx[12] && create_if_block_6(ctx)
  );
  return {
    c() {
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      if_block1_anchor = empty();
    },
    m(target, anchor) {
      if (if_block0) if_block0.m(target, anchor);
      insert(target, if_block0_anchor, anchor);
      if (if_block1) if_block1.m(target, anchor);
      insert(target, if_block1_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*selectedMultiClassObj*/
        ctx2[13]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty[0] & /*selectedMultiClassObj*/
          8192) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_7(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (
        /*subclasses*/
        ctx2[8].length && /*classGetsSubclassThisLevel*/
        ctx2[12]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty[0] & /*subclasses, classGetsSubclassThisLevel*/
          4352) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_6(ctx2);
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
      transition_in(if_block0);
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(if_block0);
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(if_block0_anchor);
        detach(if_block1_anchor);
      }
      if (if_block0) if_block0.d(detaching);
      if (if_block1) if_block1.d(detaching);
    }
  };
}
function create_if_block_7(ctx) {
  let h3;
  let levelupexisting;
  let current;
  levelupexisting = new LevelUpExistingClassLeftCol({
    props: {
      classAdvancementArrayFiltered: (
        /*classAdvancementArrayFiltered*/
        ctx[9]
      ),
      level: (
        /*$newClassLevel*/
        ctx[6]
      )
    }
  });
  return {
    c() {
      h3 = element("h3");
      h3.textContent = "Advancements";
      create_component(levelupexisting.$$.fragment);
      attr(h3, "class", "left mt-md");
    },
    m(target, anchor) {
      insert(target, h3, anchor);
      mount_component(levelupexisting, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const levelupexisting_changes = {};
      if (dirty[0] & /*classAdvancementArrayFiltered*/
      512) levelupexisting_changes.classAdvancementArrayFiltered = /*classAdvancementArrayFiltered*/
      ctx2[9];
      if (dirty[0] & /*$newClassLevel*/
      64) levelupexisting_changes.level = /*$newClassLevel*/
      ctx2[6];
      levelupexisting.$set(levelupexisting_changes);
    },
    i(local) {
      if (current) return;
      transition_in(levelupexisting.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(levelupexisting.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(h3);
      }
      destroy_component(levelupexisting, detaching);
    }
  };
}
function create_if_block_6(ctx) {
  let ul;
  let li;
  let div2;
  let div0;
  let div1;
  let h3;
  let iconselect;
  let updating_value;
  let current;
  function iconselect_value_binding_1(value) {
    ctx[40](value);
  }
  let iconselect_props = {
    class: "icon-select",
    active: (
      /*subClassProp*/
      ctx[17]
    ),
    options: (
      /*subclasses*/
      ctx[8]
    ),
    placeHolder: (
      /*subclassesPlaceholder*/
      ctx[19]
    ),
    handler: (
      /*selectSubClassHandler*/
      ctx[24]
    ),
    id: "subClass-select",
    truncateWidth: "17"
  };
  if (
    /*subclassValue*/
    ctx[7] !== void 0
  ) {
    iconselect_props.value = /*subclassValue*/
    ctx[7];
  }
  iconselect = new IconSelect({ props: iconselect_props });
  binding_callbacks.push(() => bind(iconselect, "value", iconselect_value_binding_1));
  return {
    c() {
      ul = element("ul");
      li = element("li");
      div2 = element("div");
      div0 = element("div");
      div0.innerHTML = `<img class="icon" src="${`modules/${MODULE_ID}/assets/dnd5e/3.x/subclass.svg`}" alt="Subclass"/>`;
      div1 = element("div");
      div1.textContent = `${localize("GAS.SubClass")}`;
      h3 = element("h3");
      h3.textContent = "Subclass";
      create_component(iconselect.$$.fragment);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow svelte-gas-18n0zua");
      attr(li, "class", "left");
      attr(ul, "class", "icon-list");
      attr(h3, "class", "left mt-md");
    },
    m(target, anchor) {
      insert(target, ul, anchor);
      append(ul, li);
      append(li, div2);
      append(div2, div0);
      append(div2, div1);
      insert(target, h3, anchor);
      mount_component(iconselect, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const iconselect_changes = {};
      if (dirty[0] & /*subClassProp*/
      131072) iconselect_changes.active = /*subClassProp*/
      ctx2[17];
      if (dirty[0] & /*subclasses*/
      256) iconselect_changes.options = /*subclasses*/
      ctx2[8];
      if (!updating_value && dirty[0] & /*subclassValue*/
      128) {
        updating_value = true;
        iconselect_changes.value = /*subclassValue*/
        ctx2[7];
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
        detach(ul);
        detach(h3);
      }
      destroy_component(iconselect, detaching);
    }
  };
}
function create_if_block_1(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*$characterSubClass*/
    ctx[4] && /*$characterClass*/
    ctx[5] && create_if_block_2(ctx)
  );
  return {
    c() {
      if (if_block) if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*$characterSubClass*/
        ctx2[4] && /*$characterClass*/
        ctx2[5]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*$characterSubClass, $characterClass*/
          48) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_2(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
        detach(if_block_anchor);
      }
      if (if_block) if_block.d(detaching);
    }
  };
}
function create_if_block_2(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*subClassAdvancementArrayFiltered*/
    ctx[10] && create_if_block_3(ctx)
  );
  return {
    c() {
      if (if_block) if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*subClassAdvancementArrayFiltered*/
        ctx2[10]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*subClassAdvancementArrayFiltered*/
          1024) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_3(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
        detach(if_block_anchor);
      }
      if (if_block) if_block.d(detaching);
    }
  };
}
function create_if_block_3(ctx) {
  let h3;
  let div0;
  let div1;
  let t3_value = localize("GAS.Level") + "";
  let t3;
  let t4;
  let t5;
  let ul;
  let current_block_type_index;
  let if_block;
  let current;
  const if_block_creators = [create_if_block_4, create_else_block];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (!/*subClassAdvancementArrayFiltered*/
    ctx2[10].length && !/*classGetsSubclassThisLevel*/
    ctx2[12]) return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      h3 = element("h3");
      div0 = element("div");
      div0.textContent = `${localize("GAS.Tabs.Classes.SubClass")} ${localize("GAS.Advancements")}`;
      div1 = element("div");
      t3 = text(t3_value);
      t4 = space();
      t5 = text(
        /*$newClassLevel*/
        ctx[6]
      );
      ul = element("ul");
      if_block.c();
      attr(div0, "class", "flex");
      attr(div1, "class", "flex0 div badge right inset ml-sm mb-xs svelte-gas-18n0zua");
      attr(h3, "class", "left mt-sm flexrow svelte-gas-18n0zua");
      attr(ul, "class", "icon-list");
    },
    m(target, anchor) {
      insert(target, h3, anchor);
      append(h3, div0);
      append(h3, div1);
      append(div1, t3);
      append(div1, t4);
      append(div1, t5);
      insert(target, ul, anchor);
      if_blocks[current_block_type_index].m(ul, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (!current || dirty[0] & /*$newClassLevel*/
      64) set_data(
        t5,
        /*$newClassLevel*/
        ctx2[6]
      );
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
        detach(h3);
        detach(ul);
      }
      if_blocks[current_block_type_index].d();
    }
  };
}
function create_else_block(ctx) {
  let each_1_anchor;
  let current;
  let each_value = ensure_array_like(
    /*subClassAdvancementArrayFiltered*/
    ctx[10]
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
      if (dirty[0] & /*subClassAdvancementArrayFiltered, subClassAdvancementComponents*/
      17408) {
        each_value = ensure_array_like(
          /*subClassAdvancementArrayFiltered*/
          ctx2[10]
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
        detach(each_1_anchor);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_if_block_4(ctx) {
  let li;
  return {
    c() {
      li = element("li");
      li.textContent = `${localize("GAS.NoAdvancements")}`;
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
function create_each_block(ctx) {
  let li;
  let div2;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div1;
  let t_value = (
    /*advancement*/
    ctx[55].title + ""
  );
  let t;
  let div2_data_tooltip_value;
  let div3;
  let switch_instance;
  let li_data_type_value;
  let current;
  var switch_value = (
    /*subClassAdvancementComponents*/
    ctx[14][
      /*advancement*/
      ctx[55].type
    ]
  );
  function switch_props(ctx2, dirty) {
    return {
      props: { advancement: (
        /*advancement*/
        ctx2[55]
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
      t = text(t_value);
      div3 = element("div");
      if (switch_instance) create_component(switch_instance.$$.fragment);
      attr(img, "class", "icon");
      if (!src_url_equal(img.src, img_src_value = /*advancement*/
      ctx[55].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[55].title);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow svelte-gas-18n0zua");
      attr(div2, "data-tooltip", div2_data_tooltip_value = /*advancement*/
      ctx[55].configuration?.hint || null);
      attr(div2, "data-tooltip-locked", "true");
      attr(div2, "data-tooltip-class", "gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip");
      attr(div3, "class", "flexrow svelte-gas-18n0zua");
      attr(li, "class", "left");
      attr(li, "data-type", li_data_type_value = /*advancement*/
      ctx[55].type);
    },
    m(target, anchor) {
      insert(target, li, anchor);
      append(li, div2);
      append(div2, div0);
      append(div0, img);
      append(div2, div1);
      append(div1, t);
      append(li, div3);
      if (switch_instance) mount_component(switch_instance, div3, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      1024 && !src_url_equal(img.src, img_src_value = /*advancement*/
      ctx2[55].icon)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      1024 && img_alt_value !== (img_alt_value = /*advancement*/
      ctx2[55].title)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      1024) && t_value !== (t_value = /*advancement*/
      ctx2[55].title + "")) set_data(t, t_value);
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      1024 && div2_data_tooltip_value !== (div2_data_tooltip_value = /*advancement*/
      ctx2[55].configuration?.hint || null)) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
      if (dirty[0] & /*subClassAdvancementComponents, subClassAdvancementArrayFiltered*/
      17408 && switch_value !== (switch_value = /*subClassAdvancementComponents*/
      ctx2[14][
        /*advancement*/
        ctx2[55].type
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
        if (dirty[0] & /*subClassAdvancementArrayFiltered*/
        1024) switch_instance_changes.advancement = /*advancement*/
        ctx2[55];
        switch_instance.$set(switch_instance_changes);
      }
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      1024 && li_data_type_value !== (li_data_type_value = /*advancement*/
      ctx2[55].type)) {
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
function create_if_block(ctx) {
  let h1;
  let t_value = (
    /*$characterClass*/
    (ctx[5].name || "") + ""
  );
  let t;
  return {
    c() {
      h1 = element("h1");
      t = text(t_value);
    },
    m(target, anchor) {
      insert(target, h1, anchor);
      append(h1, t);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*$characterClass*/
      32 && t_value !== (t_value = /*$characterClass*/
      (ctx2[5].name || "") + "")) set_data(t, t_value);
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
  let h1;
  let each_1_anchor;
  let if_block0_anchor;
  let if_block1_anchor;
  let div1;
  let div2;
  let if_block3_anchor;
  let html_tag;
  let current;
  let each_value_1 = ensure_array_like(
    /*classKeys*/
    ctx[2]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  let if_block0 = !/*$newClassLevel*/
  ctx[6] && create_if_block_8(ctx);
  let if_block1 = (
    /*$characterClass*/
    ctx[5] && create_if_block_5(ctx)
  );
  let if_block2 = (
    /*subclasses*/
    ctx[8].length && create_if_block_1(ctx)
  );
  let if_block3 = (
    /*$characterClass*/
    ctx[5] && create_if_block(ctx)
  );
  return {
    c() {
      div4 = element("div");
      div3 = element("div");
      div0 = element("div");
      h1 = element("h1");
      h1.textContent = "Existing Classes";
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      if_block1_anchor = empty();
      if (if_block2) if_block2.c();
      div1 = element("div");
      div1.innerHTML = ``;
      div2 = element("div");
      if (if_block3) if_block3.c();
      if_block3_anchor = empty();
      html_tag = new HtmlTag(false);
      attr(h1, "class", "flex");
      attr(div0, "class", "flex2 pr-sm col-a");
      attr(div1, "class", "flex0 border-right right-border-gradient-mask");
      html_tag.a = null;
      attr(div2, "class", "flex3 left pl-md scroll col-b");
      attr(div3, "class", "flexrow svelte-gas-18n0zua");
      attr(div4, "class", "content svelte-gas-18n0zua");
    },
    m(target, anchor) {
      insert(target, div4, anchor);
      append(div4, div3);
      append(div3, div0);
      append(div0, h1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div0, null);
        }
      }
      append(div0, each_1_anchor);
      if (if_block0) if_block0.m(div0, null);
      append(div0, if_block0_anchor);
      if (if_block1) if_block1.m(div0, null);
      append(div0, if_block1_anchor);
      if (if_block2) if_block2.m(div0, null);
      append(div3, div1);
      append(div3, div2);
      if (if_block3) if_block3.m(div2, null);
      append(div2, if_block3_anchor);
      html_tag.m(
        /*combinedHtml*/
        ctx[15],
        div2
      );
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*existingClassesCssClassForRow, classKeys, handleExistingClassClick, getCharacterClass, classLevels, isRowActive, $characterClass*/
      106954796) {
        each_value_1 = ensure_array_like(
          /*classKeys*/
          ctx2[2]
        );
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1(ctx2, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block_1(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(div0, each_1_anchor);
          }
        }
        group_outros();
        for (i = each_value_1.length; i < each_blocks.length; i += 1) {
          out(i);
        }
        check_outros();
      }
      if (!/*$newClassLevel*/
      ctx2[6]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty[0] & /*$newClassLevel*/
          64) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_8(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(div0, if_block0_anchor);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (
        /*$characterClass*/
        ctx2[5]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty[0] & /*$characterClass*/
          32) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_5(ctx2);
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
      if (
        /*subclasses*/
        ctx2[8].length
      ) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
          if (dirty[0] & /*subclasses*/
          256) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block_1(ctx2);
          if_block2.c();
          transition_in(if_block2, 1);
          if_block2.m(div0, null);
        }
      } else if (if_block2) {
        group_outros();
        transition_out(if_block2, 1, 1, () => {
          if_block2 = null;
        });
        check_outros();
      }
      if (
        /*$characterClass*/
        ctx2[5]
      ) {
        if (if_block3) {
          if_block3.p(ctx2, dirty);
        } else {
          if_block3 = create_if_block(ctx2);
          if_block3.c();
          if_block3.m(div2, if_block3_anchor);
        }
      } else if (if_block3) {
        if_block3.d(1);
        if_block3 = null;
      }
      if (!current || dirty[0] & /*combinedHtml*/
      32768) html_tag.p(
        /*combinedHtml*/
        ctx2[15]
      );
    },
    i(local) {
      if (current) return;
      for (let i = 0; i < each_value_1.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      transition_in(if_block0);
      transition_in(if_block1);
      transition_in(if_block2);
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean_1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      transition_out(if_block0);
      transition_out(if_block1);
      transition_out(if_block2);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div4);
      }
      destroy_each(each_blocks, detaching);
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      if (if_block2) if_block2.d();
      if (if_block3) if_block3.d();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let html;
  let subClassProp;
  let classProp;
  let combinedHtml;
  let classAdvancementComponents;
  let subClassAdvancementComponents;
  let classKeys;
  let classLevels;
  let selectedMultiClassObj;
  let selectedMultiClassIndex;
  let subClassLevel;
  let classGetsSubclassThisLevel;
  let filteredClassIndex;
  let isInMulticlassMode;
  let $characterSubClass;
  let $characterClass;
  let $isNewMultiClass;
  let $selectedMultiClass;
  let $newClassLevel;
  let $actor;
  component_subscribe($$self, characterSubClass, ($$value) => $$invalidate(4, $characterSubClass = $$value));
  component_subscribe($$self, characterClass, ($$value) => $$invalidate(5, $characterClass = $$value));
  component_subscribe($$self, isNewMultiClass, ($$value) => $$invalidate(36, $isNewMultiClass = $$value));
  component_subscribe($$self, selectedMultiClass, ($$value) => $$invalidate(37, $selectedMultiClass = $$value));
  component_subscribe($$self, newClassLevel, ($$value) => $$invalidate(6, $newClassLevel = $$value));
  let richHTML = "", richSubClassHTML = "", selectedMultiClassKey = null, activeSubClassUUID = null, classValue = null, multiclassValue = null, subclassValue = null, subClassesIndex, subclasses, classesPlaceholder = "Classes", subclassesPlaceholder = "Subclasses", packs = getPacksFromSettings("classes");
  game.packs.get("dnd5e.subclasses");
  let subClassesPacks = getPacksFromSettings("subclasses"), classAdvancementArrayFiltered = [], subClassAdvancementArrayFiltered = [], mappedClassIndex = extractItemsFromPacksSync(packs, ["name->label", "img", "type", "folder", "uuid->value", "_id"]);
  window.GAS.log.d("$characterClass", $characterClass);
  const actor = getContext("#doc");
  component_subscribe($$self, actor, (value) => $$invalidate(38, $actor = value));
  const importClassAdvancements = async () => {
    if (!classAdvancementArrayFiltered?.length) return;
    for (const classAdvancement of classAdvancementArrayFiltered) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-B3NEWhYy.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-_oUdi8KY.js"), "../../../molecules/dnd5e/Advancements/HitPoints.svelte": () => import("./HitPoints-CcpxhMyg.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-DdoDbEIu.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-4b2RDeY4.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-DKXIwBrM.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-adH93iyr.js"), "../../../molecules/dnd5e/Advancements/Subclass.svelte": () => import("./Subclass-CH_WeXBx.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-u9LpSdLl.js") }), `../../../molecules/dnd5e/Advancements/${classAdvancement.type}.svelte`, 7);
        classAdvancementComponents[classAdvancement.type] = module.default;
      } catch (error) {
        window.GAS.log.e(`Failed to load component for ${classAdvancement.type}:`, error);
      }
    }
  };
  const importSubClassAdvancements = async () => {
    if (!subClassAdvancementArrayFiltered?.length) return;
    for (const subClassAdvancement of subClassAdvancementArrayFiltered) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-B3NEWhYy.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-_oUdi8KY.js"), "../../../molecules/dnd5e/Advancements/HitPoints.svelte": () => import("./HitPoints-CcpxhMyg.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-DdoDbEIu.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-4b2RDeY4.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-DKXIwBrM.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-adH93iyr.js"), "../../../molecules/dnd5e/Advancements/Subclass.svelte": () => import("./Subclass-CH_WeXBx.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-u9LpSdLl.js") }), `../../../molecules/dnd5e/Advancements/${subClassAdvancement.type}.svelte`, 7);
        await tick();
        $$invalidate(14, subClassAdvancementComponents[subClassAdvancement.type] = module.default, subClassAdvancementComponents);
      } catch (error) {
        window.GAS.log.e(`Failed to load component for ${subClassAdvancement.type}:`, error);
      }
    }
  };
  function existingClassesCssClassForRow(classKey) {
    let css = getCharacterClass(classKey).uuid === $selectedMultiClass ? "active" : "";
    if (isInMulticlassMode) {
      css += " gold-button-disabled";
    } else {
      css += " gold-button";
    }
    return css;
  }
  const getFilteredSubclassIndex = async () => {
    const filteredSubClassIndex = [];
    for (let subClassesPack of subClassesPacks) {
      let index = await subClassesPack.getIndex({ fields: ["system.classIdentifier"] });
      if (!subClassesPack) continue;
      let mappedSubClassIndex = extractMapIteratorObjectProperties(index.entries(), ["name->label", "img", "type", "folder", "uuid->value", "system", "_id"]);
      filteredSubClassIndex.push(mappedSubClassIndex?.filter((x) => x.system.classIdentifier == $characterClass.system.identifier));
    }
    const output = filteredSubClassIndex.flat().sort((a, b) => a.label.localeCompare(b.label));
    return output;
  };
  const getCharacterClass = (classKey) => {
    return $actor._classes[classKey];
  };
  const selectClassHandler = async (option) => {
    $$invalidate(31, activeSubClassUUID = null);
    set_store_value(characterSubClass, $characterSubClass = null, $characterSubClass);
    $$invalidate(7, subclassValue = null);
    $$invalidate(29, richSubClassHTML = "");
    $$invalidate(0, multiclassValue = option);
    const newClass = await fromUuid(option);
    set_store_value(characterClass, $characterClass = newClass, $characterClass);
    set_store_value(selectedMultiClass, $selectedMultiClass = option, $selectedMultiClass);
    await tick();
    $$invalidate(33, subClassesIndex = await getFilteredSubclassIndex());
    await tick();
    importClassAdvancements();
    $$invalidate(28, richHTML = await TextEditor.enrichHTML(html));
  };
  async function selectSubClassHandler(option) {
    $$invalidate(31, activeSubClassUUID = option.value ?? option ?? null);
    set_store_value(characterSubClass, $characterSubClass = await fromUuid(activeSubClassUUID), $characterSubClass);
    $$invalidate(7, subclassValue = activeSubClassUUID);
    window.GAS.log.d("activeSubClassUUID", activeSubClassUUID);
    await tick();
    importSubClassAdvancements();
    $$invalidate(29, richSubClassHTML = await TextEditor.enrichHTML($characterSubClass?.system?.description?.value));
  }
  function handleExistingClassClick(classKey) {
    const isActive = getCharacterClass(classKey).name == $characterClass.name;
    if (isActive) {
      clickCancelMulticlass();
    } else {
      clickAddLevel(classKey);
    }
  }
  function isRowActive(classKey) {
    window.GAS.log.d("isRowActive", $characterClass.name, getCharacterClass(classKey).name);
    return $characterClass.name && getCharacterClass(classKey).name == $characterClass.name;
  }
  const clickCancelMulticlass = async () => {
    set_store_value(selectedMultiClass, $selectedMultiClass = false, $selectedMultiClass);
    $$invalidate(32, classValue = null);
    $$invalidate(0, multiclassValue = null);
    $$invalidate(31, activeSubClassUUID = null);
    $$invalidate(30, selectedMultiClassKey = null);
    set_store_value(characterClass, $characterClass = false, $characterClass);
    newClassLevel.set(false);
  };
  async function clickAddLevel(classKey) {
    if (isInMulticlassMode) return;
    const isUnset = Boolean($selectedMultiClass) && Boolean($newClassLevel);
    if (isUnset) return;
    const classObj = getCharacterClass(classKey);
    const uuid = classObj.uuid;
    $$invalidate(31, activeSubClassUUID = null);
    set_store_value(characterSubClass, $characterSubClass = null, $characterSubClass);
    $$invalidate(7, subclassValue = null);
    $$invalidate(10, subClassAdvancementArrayFiltered = []);
    $$invalidate(29, richSubClassHTML = "");
    set_store_value(characterClass, $characterClass = await fromUuid(uuid), $characterClass);
    set_store_value(selectedMultiClass, $selectedMultiClass = uuid, $selectedMultiClass);
    $$invalidate(30, selectedMultiClassKey = classKey);
    newClassLevel.set(classObj?.system?.levels + 1);
    await tick();
    $$invalidate(33, subClassesIndex = await getFilteredSubclassIndex());
    await tick();
    importClassAdvancements();
    $$invalidate(28, richHTML = await TextEditor.enrichHTML(html));
  }
  onMount(async () => {
    if ($characterClass) {
      $$invalidate(32, classValue = $characterClass.uuid);
      await tick();
      importClassAdvancements();
      $$invalidate(28, richHTML = await TextEditor.enrichHTML(html));
      $$invalidate(33, subClassesIndex = await getFilteredSubclassIndex());
    }
    if ($characterSubClass) {
      $$invalidate(7, subclassValue = $characterSubClass.uuid);
      await tick();
      importSubClassAdvancements();
      $$invalidate(29, richSubClassHTML = await TextEditor.enrichHTML($characterSubClass?.system?.description?.value));
    }
  });
  function iconselect_value_binding(value) {
    multiclassValue = value;
    $$invalidate(0, multiclassValue);
  }
  function iconselect_value_binding_1(value) {
    subclassValue = value;
    $$invalidate(7, subclassValue);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*$characterClass*/
    32) {
      html = $characterClass?.system?.description.value || "";
    }
    if ($$self.$$.dirty[1] & /*activeSubClassUUID*/
    1) {
      $$invalidate(17, subClassProp = activeSubClassUUID);
    }
    if ($$self.$$.dirty[1] & /*$selectedMultiClass*/
    64) {
      $$invalidate(16, classProp = $selectedMultiClass);
    }
    if ($$self.$$.dirty[0] & /*$characterClass, richHTML, richSubClassHTML*/
    805306400) {
      $$invalidate(15, combinedHtml = $characterClass ? richHTML + (richSubClassHTML ? `<h1>${localize("GAS.SubClass")}</h1>` + richSubClassHTML : "") : "");
    }
    if ($$self.$$.dirty[1] & /*subClassesIndex*/
    4) {
      if (subClassesIndex?.length) {
        $$invalidate(8, subclasses = subClassesIndex.flat().sort((a, b) => a.label.localeCompare(b.label)));
      } else {
        $$invalidate(8, subclasses = []);
      }
    }
    if ($$self.$$.dirty[0] & /*$characterClass, $newClassLevel*/
    96) {
      if ($characterClass?.system?.advancement.length) {
        $$invalidate(9, classAdvancementArrayFiltered = $characterClass?.advancement?.byLevel[$newClassLevel]);
      } else {
        $$invalidate(9, classAdvancementArrayFiltered = []);
      }
    }
    if ($$self.$$.dirty[0] & /*$characterSubClass, $newClassLevel*/
    80) {
      if ($characterSubClass?.system?.advancement.length) {
        $$invalidate(10, subClassAdvancementArrayFiltered = $characterSubClass.advancement?.byLevel[$newClassLevel]);
      } else {
        $$invalidate(10, subClassAdvancementArrayFiltered = []);
      }
    }
    if ($$self.$$.dirty[1] & /*$actor*/
    128) {
      $$invalidate(2, classKeys = Object.keys($actor._classes));
    }
    if ($$self.$$.dirty[0] & /*classKeys*/
    4 | $$self.$$.dirty[1] & /*$actor, $selectedMultiClass*/
    192) {
      $$invalidate(3, classLevels = classKeys.map((classKey) => {
        const classObj = $actor._classes[classKey];
        return classObj.uuid == $selectedMultiClass ? classObj.system.levels + 1 : classObj.system.levels;
      }));
    }
    if ($$self.$$.dirty[0] & /*selectedMultiClassKey*/
    1073741824 | $$self.$$.dirty[1] & /*$actor*/
    128) {
      $$invalidate(13, selectedMultiClassObj = $actor._classes[selectedMultiClassKey]);
    }
    if ($$self.$$.dirty[0] & /*classKeys, selectedMultiClassKey*/
    1073741828) {
      $$invalidate(35, selectedMultiClassIndex = classKeys.indexOf(selectedMultiClassKey));
    }
    if ($$self.$$.dirty[0] & /*classLevels*/
    8 | $$self.$$.dirty[1] & /*selectedMultiClassIndex*/
    16) {
      classLevels[selectedMultiClassIndex];
    }
    if ($$self.$$.dirty[0] & /*$characterClass*/
    32) {
      $$invalidate(34, subClassLevel = $characterClass ? getSubclassLevel($characterClass, MODULE_ID) : false);
    }
    if ($$self.$$.dirty[0] & /*$newClassLevel*/
    64 | $$self.$$.dirty[1] & /*subClassLevel*/
    8) {
      $$invalidate(12, classGetsSubclassThisLevel = subClassLevel && subClassLevel === $newClassLevel);
    }
    if ($$self.$$.dirty[0] & /*$characterClass*/
    32) {
      window.GAS.log.d("$characterClass", $characterClass);
    }
    if ($$self.$$.dirty[0] & /*classKeys*/
    4) {
      $$invalidate(11, filteredClassIndex = mappedClassIndex.filter((i) => {
        if (i.type !== "class") return false;
        const classNameLower = i.label.toLowerCase();
        return !classKeys.some((key) => key.toLowerCase() === classNameLower);
      }).sort((a, b) => a.label.localeCompare(b.label)));
    }
    if ($$self.$$.dirty[0] & /*$characterClass, $newClassLevel, multiclassValue*/
    97) {
      $$invalidate(1, isInMulticlassMode = $characterClass && !$newClassLevel && multiclassValue);
    }
    if ($$self.$$.dirty[0] & /*$characterClass, $characterSubClass, multiclassValue, isInMulticlassMode*/
    51 | $$self.$$.dirty[1] & /*classValue, $selectedMultiClass, $isNewMultiClass*/
    98) {
      {
        console.log("Current character class:", $characterClass);
        console.log("Current character subclass:", $characterSubClass);
        console.log("Multiclass value:", multiclassValue);
        console.log("Class value:", classValue);
        console.log("Active class:", $selectedMultiClass);
        console.log("Is multiclass mode:", $isNewMultiClass);
        console.log("Is in multiclass mode (local):", isInMulticlassMode);
      }
    }
  };
  classAdvancementComponents = {};
  $$invalidate(14, subClassAdvancementComponents = {});
  return [
    multiclassValue,
    isInMulticlassMode,
    classKeys,
    classLevels,
    $characterSubClass,
    $characterClass,
    $newClassLevel,
    subclassValue,
    subclasses,
    classAdvancementArrayFiltered,
    subClassAdvancementArrayFiltered,
    filteredClassIndex,
    classGetsSubclassThisLevel,
    selectedMultiClassObj,
    subClassAdvancementComponents,
    combinedHtml,
    classProp,
    subClassProp,
    classesPlaceholder,
    subclassesPlaceholder,
    actor,
    existingClassesCssClassForRow,
    getCharacterClass,
    selectClassHandler,
    selectSubClassHandler,
    handleExistingClassClick,
    isRowActive,
    clickCancelMulticlass,
    richHTML,
    richSubClassHTML,
    selectedMultiClassKey,
    activeSubClassUUID,
    classValue,
    subClassesIndex,
    subClassLevel,
    selectedMultiClassIndex,
    $isNewMultiClass,
    $selectedMultiClass,
    $actor,
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
//# sourceMappingURL=LevelUp-CZ3ES3pp.js.map
