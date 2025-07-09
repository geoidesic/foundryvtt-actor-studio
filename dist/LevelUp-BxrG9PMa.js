import { S as SvelteComponent, i as init, s as safe_not_equal, a as empty, c as insert, A as noop, j as detach, k as component_subscribe, af as newClassLevel, Q as characterClass, ag as activeClass, ah as isMultiClass, o as onMount, ai as ucfirst, e as element, F as text, W as space, b as attr, N as src_url_equal, d as append, G as set_data, X as listen, y as set_store_value, z as ensure_array_like, h as transition_in, g as group_outros, f as check_outros, t as transition_out, B as destroy_each, P as characterSubClass, R as level, J as getPacksFromSettings, K as extractItemsFromPacksSync, n as getContext, q as tick, l as localize, M as MODULE_ID, C as binding_callbacks, D as bind, v as create_component, w as mount_component, E as add_flush_callback, x as destroy_component, _ as __variableDynamicImportRuntimeHelper, aj as extractMapIteratorObjectProperties, u as construct_svelte_component, a8 as is_function } from "./index-D0iTQMxj.js";
import { I as IconSelect } from "./IconSelect-BnJuLw-K.js";
import LevelUpExistingClassLeftCol from "./LevelUpExistingClassLeftCol-C1qFz-v6.js";
import { a as StartingEquipment, S as StartingGold } from "./StartingEquipment-GTqFPWTq.js";
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
  let if_block0_anchor;
  let if_block0 = !/*$activeClass*/
  ctx[3] && create_if_block_2$1();
  let if_block1 = (
    /*$activeClass*/
    ctx[3] && !/*$isMultiClass*/
    ctx[4] && create_if_block_1$1(ctx)
  );
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
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      attr(img, "height", "40");
      attr(img, "width", "40");
      if (!src_url_equal(img.src, img_src_value = /*src*/
      ctx[0])) attr(img, "src", img_src_value);
      attr(div0, "class", "flex0 icon svelte-gas-1gqtihq");
      attr(div1, "class", "flex3 left pa-xs");
      attr(div2, "class", "lozenge pa-xs svelte-gas-1gqtihq");
      attr(div3, "class", "flex0 right mr-sm");
      attr(div4, "class", "flex0 right pr-md py-xs");
      attr(div5, "class", "flex3 flexrow");
      attr(div6, "class", "flexrow class-row svelte-gas-1gqtihq");
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
      if (if_block0) if_block0.m(div4, null);
      append(div4, if_block0_anchor);
      if (if_block1) if_block1.m(div4, null);
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
      if (!/*$activeClass*/
      ctx2[3]) {
        if (if_block0) ;
        else {
          if_block0 = create_if_block_2$1();
          if_block0.c();
          if_block0.m(div4, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (
        /*$activeClass*/
        ctx2[3] && !/*$isMultiClass*/
        ctx2[4]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_1$1(ctx2);
          if_block1.c();
          if_block1.m(div4, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div6);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
    }
  };
}
function create_if_block_2$1(ctx) {
  let i;
  return {
    c() {
      i = element("i");
      attr(i, "class", "fas fa-plus");
    },
    m(target, anchor) {
      insert(target, i, anchor);
    },
    d(detaching) {
      if (detaching) {
        detach(i);
      }
    }
  };
}
function create_if_block_1$1(ctx) {
  let i;
  let mounted;
  let dispose;
  return {
    c() {
      i = element("i");
      attr(i, "class", "fas fa-times");
    },
    m(target, anchor) {
      insert(target, i, anchor);
      if (!mounted) {
        dispose = listen(
          i,
          "click",
          /*cancelLevelUp*/
          ctx[5]
        );
        mounted = true;
      }
    },
    p: noop,
    d(detaching) {
      if (detaching) {
        detach(i);
      }
      mounted = false;
      dispose();
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
  let $newClassLevel;
  let $characterClass;
  let $activeClass;
  let $isMultiClass;
  component_subscribe($$self, newClassLevel, ($$value) => $$invalidate(6, $newClassLevel = $$value));
  component_subscribe($$self, characterClass, ($$value) => $$invalidate(7, $characterClass = $$value));
  component_subscribe($$self, activeClass, ($$value) => $$invalidate(3, $activeClass = $$value));
  component_subscribe($$self, isMultiClass, ($$value) => $$invalidate(4, $isMultiClass = $$value));
  let { src = false } = $$props;
  let { level: level2 = false } = $$props;
  let { classKey = false } = $$props;
  const cancelLevelUp = () => {
    set_store_value(activeClass, $activeClass = false, $activeClass);
    set_store_value(characterClass, $characterClass = false, $characterClass);
    set_store_value(newClassLevel, $newClassLevel = false, $newClassLevel);
  };
  onMount(() => {
  });
  $$self.$$set = ($$props2) => {
    if ("src" in $$props2) $$invalidate(0, src = $$props2.src);
    if ("level" in $$props2) $$invalidate(1, level2 = $$props2.level);
    if ("classKey" in $$props2) $$invalidate(2, classKey = $$props2.classKey);
  };
  return [src, level2, classKey, $activeClass, $isMultiClass, cancelLevelUp];
}
class LevelUpButtonInnards extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, { src: 0, level: 1, classKey: 2 });
  }
}
const { Boolean: Boolean_1 } = globals;
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[52] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[55] = list[i];
  child_ctx[57] = i;
  return child_ctx;
}
function create_else_block_1(ctx) {
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
          ctx[55]
        )?.img
      ),
      level: (
        /*classLevels*/
        ctx[1][
          /*index*/
          ctx[57]
        ]
      ),
      classKey: (
        /*classKey*/
        ctx[55]
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
        ctx[55]
      ) + " svelte-gas-xasakp");
      attr(div, "role", "button");
      attr(div, "aria-role", "button");
      attr(div, "aria-label", div_aria_label_value = localize("GAS.LevelUp.Button") + " " + /*classKey*/
      ctx[55]);
      attr(div, "data-tooltip", div_data_tooltip_value = localize("GAS.LevelUp.Button") + " " + /*classKey*/
      ctx[55]);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(levelupbuttoninnards, div, null);
      current = true;
      if (!mounted) {
        dispose = listen(div, "mousedown", function() {
          if (is_function(
            /*clickAddLevel*/
            ctx[26](
              /*classKey*/
              ctx[55]
            )
          )) ctx[26](
            /*classKey*/
            ctx[55]
          ).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const levelupbuttoninnards_changes = {};
      if (dirty[0] & /*classKeys*/
      1) levelupbuttoninnards_changes.src = /*getCharacterClass*/
      ctx[22](
        /*classKey*/
        ctx[55]
      )?.img;
      if (dirty[0] & /*classLevels*/
      2) levelupbuttoninnards_changes.level = /*classLevels*/
      ctx[1][
        /*index*/
        ctx[57]
      ];
      if (dirty[0] & /*classKeys*/
      1) levelupbuttoninnards_changes.classKey = /*classKey*/
      ctx[55];
      levelupbuttoninnards.$set(levelupbuttoninnards_changes);
      if (!current || dirty[0] & /*classKeys*/
      1 && div_class_value !== (div_class_value = "class-row " + /*existingClassesCssClassForRow*/
      ctx[21](
        /*classKey*/
        ctx[55]
      ) + " svelte-gas-xasakp")) {
        attr(div, "class", div_class_value);
      }
      if (!current || dirty[0] & /*classKeys*/
      1 && div_aria_label_value !== (div_aria_label_value = localize("GAS.LevelUp.Button") + " " + /*classKey*/
      ctx[55])) {
        attr(div, "aria-label", div_aria_label_value);
      }
      if (!current || dirty[0] & /*classKeys*/
      1 && div_data_tooltip_value !== (div_data_tooltip_value = localize("GAS.LevelUp.Button") + " " + /*classKey*/
      ctx[55])) {
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
function create_if_block_10(ctx) {
  let div;
  let levelupbuttoninnards;
  let div_class_value;
  let current;
  levelupbuttoninnards = new LevelUpButtonInnards({
    props: {
      src: (
        /*getCharacterClass*/
        ctx[22](
          /*classKey*/
          ctx[55]
        )?.img
      ),
      level: (
        /*classLevels*/
        ctx[1][
          /*index*/
          ctx[57]
        ]
      ),
      classKey: (
        /*classKey*/
        ctx[55]
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
        ctx[55]
      ) + " svelte-gas-xasakp");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(levelupbuttoninnards, div, null);
      current = true;
    },
    p(ctx2, dirty) {
      const levelupbuttoninnards_changes = {};
      if (dirty[0] & /*classKeys*/
      1) levelupbuttoninnards_changes.src = /*getCharacterClass*/
      ctx2[22](
        /*classKey*/
        ctx2[55]
      )?.img;
      if (dirty[0] & /*classLevels*/
      2) levelupbuttoninnards_changes.level = /*classLevels*/
      ctx2[1][
        /*index*/
        ctx2[57]
      ];
      if (dirty[0] & /*classKeys*/
      1) levelupbuttoninnards_changes.classKey = /*classKey*/
      ctx2[55];
      levelupbuttoninnards.$set(levelupbuttoninnards_changes);
      if (!current || dirty[0] & /*classKeys*/
      1 && div_class_value !== (div_class_value = "class-row " + /*existingClassesCssClassForRow*/
      ctx2[21](
        /*classKey*/
        ctx2[55]
      ) + " svelte-gas-xasakp")) {
        attr(div, "class", div_class_value);
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
    }
  };
}
function create_each_block_1(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block_10, create_else_block_1];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*$activeClass*/
      ctx2[4] && !/*$newClassLevel*/
      ctx2[5]
    ) return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_blocks[current_block_type_index].m(target, anchor);
      insert(target, if_block_anchor, anchor);
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
        if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
      if_blocks[current_block_type_index].d(detaching);
    }
  };
}
function create_if_block_8(ctx) {
  let h1;
  let div;
  let iconselect;
  let updating_value;
  let current;
  let if_block = (
    /*classProp*/
    ctx[16] && create_if_block_9(ctx)
  );
  function iconselect_value_binding(value) {
    ctx[36](value);
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
    /*classValue*/
    ctx[6] !== void 0
  ) {
    iconselect_props.value = /*classValue*/
    ctx[6];
  }
  iconselect = new IconSelect({ props: iconselect_props });
  binding_callbacks.push(() => bind(iconselect, "value", iconselect_value_binding));
  return {
    c() {
      h1 = element("h1");
      div = element("div");
      div.textContent = "Add Multiclass";
      if (if_block) if_block.c();
      create_component(iconselect.$$.fragment);
      attr(div, "class", "flex2 left");
      attr(h1, "class", "flexrow mt-md svelte-gas-xasakp");
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
        /*classProp*/
        ctx2[16]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_9(ctx2);
          if_block.c();
          if_block.m(h1, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      const iconselect_changes = {};
      if (dirty[0] & /*filteredClassIndex*/
      2048) iconselect_changes.options = /*filteredClassIndex*/
      ctx2[11];
      if (!updating_value && dirty[0] & /*classValue*/
      64) {
        updating_value = true;
        iconselect_changes.value = /*classValue*/
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
        detach(h1);
      }
      if (if_block) if_block.d();
      destroy_component(iconselect, detaching);
    }
  };
}
function create_if_block_9(ctx) {
  let div;
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      button = element("button");
      button.innerHTML = `<i class="fas fa-times svelte-gas-xasakp"></i>`;
      attr(button, "class", "pr-none mt-sm gold-button svelte-gas-xasakp");
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
          ctx[25]
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
function create_if_block_4(ctx) {
  let if_block0_anchor;
  let if_block1_anchor;
  let current;
  let if_block0 = (
    /*activeClassObj*/
    ctx[13] && create_if_block_6(ctx)
  );
  let if_block1 = (
    /*subclasses*/
    ctx[8].length && /*classGetsSubclassThisLevel*/
    ctx[12] && create_if_block_5(ctx)
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
        /*activeClassObj*/
        ctx2[13]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty[0] & /*activeClassObj*/
          8192) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_6(ctx2);
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
          if_block1 = create_if_block_5(ctx2);
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
function create_if_block_6(ctx) {
  let h3;
  let levelupexisting;
  let if_block_anchor;
  let current;
  levelupexisting = new LevelUpExistingClassLeftCol({
    props: {
      classAdvancementArrayFiltered: (
        /*classAdvancementArrayFiltered*/
        ctx[9]
      ),
      level: (
        /*$newClassLevel*/
        ctx[5]
      )
    }
  });
  let if_block = (
    /*$characterClass*/
    ctx[3]?.system?.startingEquipment?.length && create_if_block_7(ctx)
  );
  return {
    c() {
      h3 = element("h3");
      h3.textContent = "Advancements";
      create_component(levelupexisting.$$.fragment);
      if (if_block) if_block.c();
      if_block_anchor = empty();
      attr(h3, "class", "left mt-md");
    },
    m(target, anchor) {
      insert(target, h3, anchor);
      mount_component(levelupexisting, target, anchor);
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const levelupexisting_changes = {};
      if (dirty[0] & /*classAdvancementArrayFiltered*/
      512) levelupexisting_changes.classAdvancementArrayFiltered = /*classAdvancementArrayFiltered*/
      ctx2[9];
      if (dirty[0] & /*$newClassLevel*/
      32) levelupexisting_changes.level = /*$newClassLevel*/
      ctx2[5];
      levelupexisting.$set(levelupexisting_changes);
      if (
        /*$characterClass*/
        ctx2[3]?.system?.startingEquipment?.length
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*$characterClass*/
          8) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_7(ctx2);
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
      transition_in(levelupexisting.$$.fragment, local);
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(levelupexisting.$$.fragment, local);
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(h3);
        detach(if_block_anchor);
      }
      destroy_component(levelupexisting, detaching);
      if (if_block) if_block.d(detaching);
    }
  };
}
function create_if_block_7(ctx) {
  let startingequipment;
  let startinggold;
  let current;
  startingequipment = new StartingEquipment({
    props: {
      startingEquipment: (
        /*$characterClass*/
        ctx[3].system.startingEquipment
      )
    }
  });
  startinggold = new StartingGold({
    props: {
      characterClass: (
        /*$characterClass*/
        ctx[3]
      )
    }
  });
  return {
    c() {
      create_component(startingequipment.$$.fragment);
      create_component(startinggold.$$.fragment);
    },
    m(target, anchor) {
      mount_component(startingequipment, target, anchor);
      mount_component(startinggold, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const startingequipment_changes = {};
      if (dirty[0] & /*$characterClass*/
      8) startingequipment_changes.startingEquipment = /*$characterClass*/
      ctx2[3].system.startingEquipment;
      startingequipment.$set(startingequipment_changes);
      const startinggold_changes = {};
      if (dirty[0] & /*$characterClass*/
      8) startinggold_changes.characterClass = /*$characterClass*/
      ctx2[3];
      startinggold.$set(startinggold_changes);
    },
    i(local) {
      if (current) return;
      transition_in(startingequipment.$$.fragment, local);
      transition_in(startinggold.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(startingequipment.$$.fragment, local);
      transition_out(startinggold.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(startingequipment, detaching);
      destroy_component(startinggold, detaching);
    }
  };
}
function create_if_block_5(ctx) {
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
    ctx[37](value);
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
      attr(div2, "class", "flexrow svelte-gas-xasakp");
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
function create_if_block(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*$characterSubClass*/
    ctx[2] && /*$characterClass*/
    ctx[3] && create_if_block_1(ctx)
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
        ctx2[2] && /*$characterClass*/
        ctx2[3]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*$characterSubClass, $characterClass*/
          12) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_1(ctx2);
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
function create_if_block_1(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*subClassAdvancementArrayFiltered*/
    ctx[10] && create_if_block_2(ctx)
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
  const if_block_creators = [create_if_block_3, create_else_block];
  const if_blocks = [];
  function select_block_type_1(ctx2, dirty) {
    if (!/*subClassAdvancementArrayFiltered*/
    ctx2[10].length && !/*classGetsSubclassThisLevel*/
    ctx2[12]) return 0;
    return 1;
  }
  current_block_type_index = select_block_type_1(ctx);
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
        ctx[5]
      );
      ul = element("ul");
      if_block.c();
      attr(div0, "class", "flex");
      attr(div1, "class", "flex0 div badge right inset ml-sm mb-xs svelte-gas-xasakp");
      attr(h3, "class", "left mt-sm flexrow svelte-gas-xasakp");
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
      32) set_data(
        t5,
        /*$newClassLevel*/
        ctx2[5]
      );
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type_1(ctx2);
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
function create_if_block_3(ctx) {
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
    ctx[52].title + ""
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
      ctx[52].type
    ]
  );
  function switch_props(ctx2, dirty) {
    return {
      props: { advancement: (
        /*advancement*/
        ctx2[52]
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
      ctx[52].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[52].title);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow svelte-gas-xasakp");
      attr(div2, "data-tooltip", div2_data_tooltip_value = /*advancement*/
      ctx[52].configuration?.hint || null);
      attr(div2, "data-tooltip-locked", "true");
      attr(div2, "data-tooltip-class", "gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip");
      attr(div3, "class", "flexrow svelte-gas-xasakp");
      attr(li, "class", "left");
      attr(li, "data-type", li_data_type_value = /*advancement*/
      ctx[52].type);
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
      ctx2[52].icon)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      1024 && img_alt_value !== (img_alt_value = /*advancement*/
      ctx2[52].title)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      1024) && t_value !== (t_value = /*advancement*/
      ctx2[52].title + "")) set_data(t, t_value);
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      1024 && div2_data_tooltip_value !== (div2_data_tooltip_value = /*advancement*/
      ctx2[52].configuration?.hint || null)) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
      if (dirty[0] & /*subClassAdvancementComponents, subClassAdvancementArrayFiltered*/
      17408 && switch_value !== (switch_value = /*subClassAdvancementComponents*/
      ctx2[14][
        /*advancement*/
        ctx2[52].type
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
        ctx2[52];
        switch_instance.$set(switch_instance_changes);
      }
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      1024 && li_data_type_value !== (li_data_type_value = /*advancement*/
      ctx2[52].type)) {
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
  let current;
  let each_value_1 = ensure_array_like(
    /*classKeys*/
    ctx[0]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  let if_block0 = !/*$newClassLevel*/
  ctx[5] && create_if_block_8(ctx);
  let if_block1 = (
    /*$characterClass*/
    ctx[3] && create_if_block_4(ctx)
  );
  let if_block2 = (
    /*subclasses*/
    ctx[8].length && create_if_block(ctx)
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
      attr(h1, "class", "flex");
      attr(div0, "class", "flex2 pr-sm col-a");
      attr(div1, "class", "flex0 border-right right-border-gradient-mask");
      attr(div2, "class", "flex3 left pl-md scroll col-b");
      attr(div3, "class", "flexrow svelte-gas-xasakp");
      attr(div4, "class", "content svelte-gas-xasakp");
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
      div2.innerHTML = /*combinedHtml*/
      ctx[15];
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*existingClassesCssClassForRow, classKeys, getCharacterClass, classLevels, $activeClass, $newClassLevel, clickAddLevel*/
      73400371) {
        each_value_1 = ensure_array_like(
          /*classKeys*/
          ctx2[0]
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
      ctx2[5]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty[0] & /*$newClassLevel*/
          32) {
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
        ctx2[3]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty[0] & /*$characterClass*/
          8) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_4(ctx2);
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
          if_block2 = create_if_block(ctx2);
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
      if (!current || dirty[0] & /*combinedHtml*/
      32768) div2.innerHTML = /*combinedHtml*/
      ctx2[15];
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
  let activeClassObj;
  let activeClassIndex;
  let subClassLevel;
  let classGetsSubclassThisLevel;
  let filteredClassIndex;
  let $characterSubClass;
  let $characterClass;
  let $level;
  let $actor;
  let $activeClass;
  let $newClassLevel;
  let $isMultiClass;
  component_subscribe($$self, characterSubClass, ($$value) => $$invalidate(2, $characterSubClass = $$value));
  component_subscribe($$self, characterClass, ($$value) => $$invalidate(3, $characterClass = $$value));
  component_subscribe($$self, level, ($$value) => $$invalidate(34, $level = $$value));
  component_subscribe($$self, activeClass, ($$value) => $$invalidate(4, $activeClass = $$value));
  component_subscribe($$self, newClassLevel, ($$value) => $$invalidate(5, $newClassLevel = $$value));
  component_subscribe($$self, isMultiClass, ($$value) => $$invalidate(41, $isMultiClass = $$value));
  let richHTML = "", richSubClassHTML = "", activeClassKey = null, activeSubClassUUID = null, classValue = null, subclassValue = null, subClassesIndex, subclasses, classesPlaceholder = "Classes", subclassesPlaceholder = "Subclasses", packs = getPacksFromSettings("classes");
  game.packs.get("dnd5e.subclasses");
  let subClassesPacks = getPacksFromSettings("subclasses"), classAdvancementArrayFiltered = [], subClassAdvancementArrayFiltered = [], mappedClassIndex = extractItemsFromPacksSync(packs, ["name->label", "img", "type", "folder", "uuid->value", "_id"]);
  window.GAS.log.d("$characterClass", $characterClass);
  const actor = getContext("#doc");
  component_subscribe($$self, actor, (value) => $$invalidate(35, $actor = value));
  const importClassAdvancements = async () => {
    if (!classAdvancementArrayFiltered?.length) return;
    for (const classAdvancement of classAdvancementArrayFiltered) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-3TLVFZ6Y.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-C2dCRKW3.js"), "../../../molecules/dnd5e/Advancements/HitPoints.svelte": () => import("./HitPoints-iuhr5vgS.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-D9v5D9ZC.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-DaIiQe_s.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-BcxKq4kW.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-D2wLZNl4.js"), "../../../molecules/dnd5e/Advancements/Subclass.svelte": () => import("./Subclass-D0Oqb72p.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-D6PaOCNf.js") }), `../../../molecules/dnd5e/Advancements/${classAdvancement.type}.svelte`, 7);
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
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-3TLVFZ6Y.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-C2dCRKW3.js"), "../../../molecules/dnd5e/Advancements/HitPoints.svelte": () => import("./HitPoints-iuhr5vgS.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-D9v5D9ZC.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-DaIiQe_s.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-BcxKq4kW.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-D2wLZNl4.js"), "../../../molecules/dnd5e/Advancements/Subclass.svelte": () => import("./Subclass-D0Oqb72p.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-D6PaOCNf.js") }), `../../../molecules/dnd5e/Advancements/${subClassAdvancement.type}.svelte`, 7);
        await tick();
        $$invalidate(14, subClassAdvancementComponents[subClassAdvancement.type] = module.default, subClassAdvancementComponents);
      } catch (error) {
        window.GAS.log.e(`Failed to load component for ${subClassAdvancement.type}:`, error);
      }
    }
  };
  function existingClassesCssClassForRow(classKey) {
    let css = getCharacterClass(classKey).uuid === $activeClass ? "active" : "";
    if ($isMultiClass) {
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
    $$invalidate(30, activeSubClassUUID = null);
    set_store_value(characterSubClass, $characterSubClass = null, $characterSubClass);
    $$invalidate(7, subclassValue = null);
    $$invalidate(28, richSubClassHTML = "");
    set_store_value(characterClass, $characterClass = await fromUuid(option), $characterClass);
    set_store_value(activeClass, $activeClass = option, $activeClass);
    await tick();
    $$invalidate(31, subClassesIndex = await getFilteredSubclassIndex());
    await tick();
    importClassAdvancements();
    $$invalidate(27, richHTML = await TextEditor.enrichHTML(html));
  };
  async function selectSubClassHandler(option) {
    $$invalidate(30, activeSubClassUUID = option.value ?? option ?? null);
    set_store_value(characterSubClass, $characterSubClass = await fromUuid(activeSubClassUUID), $characterSubClass);
    $$invalidate(7, subclassValue = activeSubClassUUID);
    window.GAS.log.d("activeSubClassUUID", activeSubClassUUID);
    await tick();
    importSubClassAdvancements();
    $$invalidate(28, richSubClassHTML = await TextEditor.enrichHTML($characterSubClass?.system?.description?.value));
  }
  const clickCancelMulticlass = async () => {
    set_store_value(activeClass, $activeClass = false, $activeClass);
    $$invalidate(6, classValue = null);
    $$invalidate(30, activeSubClassUUID = null);
    $$invalidate(29, activeClassKey = null);
    set_store_value(characterClass, $characterClass = false, $characterClass);
  };
  async function clickAddLevel(classKey) {
    if ($isMultiClass) return;
    const isUnset = Boolean($activeClass) && Boolean($newClassLevel);
    if (isUnset) return;
    const classObj = getCharacterClass(classKey);
    const uuid = classObj.uuid;
    $$invalidate(30, activeSubClassUUID = null);
    set_store_value(characterSubClass, $characterSubClass = null, $characterSubClass);
    $$invalidate(7, subclassValue = null);
    $$invalidate(10, subClassAdvancementArrayFiltered = []);
    $$invalidate(28, richSubClassHTML = "");
    set_store_value(characterClass, $characterClass = await fromUuid(uuid), $characterClass);
    set_store_value(activeClass, $activeClass = uuid, $activeClass);
    $$invalidate(29, activeClassKey = classKey);
    newClassLevel.set(classObj?.system?.levels + 1);
    await tick();
    $$invalidate(31, subClassesIndex = await getFilteredSubclassIndex());
    await tick();
    importClassAdvancements();
    $$invalidate(27, richHTML = await TextEditor.enrichHTML(html));
  }
  onMount(async () => {
    if ($characterClass) {
      $$invalidate(6, classValue = $characterClass.uuid);
      await tick();
      importClassAdvancements();
      $$invalidate(27, richHTML = await TextEditor.enrichHTML(html));
      $$invalidate(31, subClassesIndex = await getFilteredSubclassIndex());
    }
    if ($characterSubClass) {
      $$invalidate(7, subclassValue = $characterSubClass.uuid);
      await tick();
      importSubClassAdvancements();
      $$invalidate(28, richSubClassHTML = await TextEditor.enrichHTML($characterSubClass?.system?.description?.value));
    }
  });
  function iconselect_value_binding(value) {
    classValue = value;
    $$invalidate(6, classValue);
  }
  function iconselect_value_binding_1(value) {
    subclassValue = value;
    $$invalidate(7, subclassValue);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*$characterClass*/
    8) {
      html = $characterClass?.system?.description.value || "";
    }
    if ($$self.$$.dirty[0] & /*activeSubClassUUID*/
    1073741824) {
      $$invalidate(17, subClassProp = activeSubClassUUID);
    }
    if ($$self.$$.dirty[0] & /*$activeClass*/
    16) {
      $$invalidate(16, classProp = $activeClass);
    }
    if ($$self.$$.dirty[0] & /*richHTML, richSubClassHTML*/
    402653184) {
      $$invalidate(15, combinedHtml = richHTML + (richSubClassHTML ? `<h1>${localize("GAS.SubClass")}</h1>` + richSubClassHTML : ""));
    }
    if ($$self.$$.dirty[1] & /*subClassesIndex*/
    1) {
      if (subClassesIndex?.length) {
        $$invalidate(8, subclasses = subClassesIndex.flat().sort((a, b) => a.label.localeCompare(b.label)));
      } else {
        $$invalidate(8, subclasses = []);
      }
    }
    if ($$self.$$.dirty[0] & /*$characterClass, $newClassLevel*/
    40) {
      if ($characterClass?.system?.advancement.length) {
        $$invalidate(9, classAdvancementArrayFiltered = $characterClass?.advancement?.byLevel[$newClassLevel]);
      } else {
        $$invalidate(9, classAdvancementArrayFiltered = []);
      }
    }
    if ($$self.$$.dirty[0] & /*$characterSubClass, $newClassLevel*/
    36) {
      if ($characterSubClass?.system?.advancement.length) {
        $$invalidate(10, subClassAdvancementArrayFiltered = $characterSubClass.advancement?.byLevel[$newClassLevel]);
      } else {
        $$invalidate(10, subClassAdvancementArrayFiltered = []);
      }
    }
    if ($$self.$$.dirty[1] & /*$actor*/
    16) {
      $$invalidate(0, classKeys = Object.keys($actor._classes));
    }
    if ($$self.$$.dirty[0] & /*classKeys, $activeClass*/
    17 | $$self.$$.dirty[1] & /*$actor*/
    16) {
      $$invalidate(1, classLevels = classKeys.map((classKey) => {
        const classObj = $actor._classes[classKey];
        return classObj.uuid == $activeClass ? classObj.system.levels + 1 : classObj.system.levels;
      }));
    }
    if ($$self.$$.dirty[0] & /*activeClassKey*/
    536870912 | $$self.$$.dirty[1] & /*$actor*/
    16) {
      $$invalidate(13, activeClassObj = $actor._classes[activeClassKey]);
    }
    if ($$self.$$.dirty[0] & /*classKeys, activeClassKey*/
    536870913) {
      $$invalidate(33, activeClassIndex = classKeys.indexOf(activeClassKey));
    }
    if ($$self.$$.dirty[0] & /*classLevels*/
    2 | $$self.$$.dirty[1] & /*activeClassIndex*/
    4) {
      classLevels[activeClassIndex];
    }
    if ($$self.$$.dirty[0] & /*$characterClass*/
    8) {
      $$invalidate(32, subClassLevel = $characterClass.getFlag ? $characterClass.getFlag(MODULE_ID, "subclassLevel") : false);
    }
    if ($$self.$$.dirty[1] & /*subClassLevel, $level*/
    10) {
      $$invalidate(12, classGetsSubclassThisLevel = subClassLevel && subClassLevel === $level);
    }
    if ($$self.$$.dirty[0] & /*classKeys*/
    1) {
      $$invalidate(11, filteredClassIndex = mappedClassIndex.filter((i) => {
        return i.type == "class";
      }).sort((a, b) => a.label.localeCompare(b.label)));
    }
  };
  classAdvancementComponents = {};
  $$invalidate(14, subClassAdvancementComponents = {});
  return [
    classKeys,
    classLevels,
    $characterSubClass,
    $characterClass,
    $activeClass,
    $newClassLevel,
    classValue,
    subclassValue,
    subclasses,
    classAdvancementArrayFiltered,
    subClassAdvancementArrayFiltered,
    filteredClassIndex,
    classGetsSubclassThisLevel,
    activeClassObj,
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
    clickCancelMulticlass,
    clickAddLevel,
    richHTML,
    richSubClassHTML,
    activeClassKey,
    activeSubClassUUID,
    subClassesIndex,
    subClassLevel,
    activeClassIndex,
    $level,
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
//# sourceMappingURL=LevelUp-BxrG9PMa.js.map
