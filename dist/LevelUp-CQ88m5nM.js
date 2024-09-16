import { S as SvelteComponent, i as init, s as safe_not_equal, a as empty, c as insert, A as noop, j as detach, k as component_subscribe, W as newClassLevel, O as characterClass, X as activeClass, Y as isMultiClass, o as onMount, Z as ucfirst, e as element, F as text, U as space, b as attr, K as src_url_equal, d as append, G as set_data, $ as listen, y as set_store_value, z as ensure_array_like, h as transition_in, g as group_outros, f as check_outros, t as transition_out, B as destroy_each, N as characterSubClass, P as level, I as getPacksFromSettings, J as extractItemsFromPacks, n as getContext, q as tick, l as localize, R as DonationTracker, C as binding_callbacks, D as bind, u as create_component, v as mount_component, E as add_flush_callback, w as destroy_component, _ as __variableDynamicImportRuntimeHelper, x as log, V as extractMapIteratorObjectProperties, a0 as is_function } from "./index-DjDwfpPF.js";
import { I as IconSelect } from "./IconSelect-B5NBUTaP.js";
import LevelUpExistingClassLeftCol from "./LevelUpExistingClassLeftCol-CN2K4AI_.js";
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
  child_ctx[48] = list[i];
  child_ctx[50] = i;
  return child_ctx;
}
function create_else_block(ctx) {
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
        ctx[16](
          /*classKey*/
          ctx[48]
        )?.img
      ),
      level: (
        /*classLevels*/
        ctx[2][
          /*index*/
          ctx[50]
        ]
      ),
      classKey: (
        /*classKey*/
        ctx[48]
      )
    }
  });
  return {
    c() {
      div = element("div");
      create_component(levelupbuttoninnards.$$.fragment);
      attr(div, "class", div_class_value = "class-row " + /*existingClassesCssClassForRow*/
      ctx[15](
        /*classKey*/
        ctx[48]
      ) + " svelte-gas-xasakp");
      attr(div, "role", "button");
      attr(div, "aria-role", "button");
      attr(div, "aria-label", div_aria_label_value = localize("GAS.LevelUp.Button") + " " + /*classKey*/
      ctx[48]);
      attr(div, "data-tooltip", div_data_tooltip_value = localize("GAS.LevelUp.Button") + " " + /*classKey*/
      ctx[48]);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(levelupbuttoninnards, div, null);
      current = true;
      if (!mounted) {
        dispose = listen(div, "mousedown", function() {
          if (is_function(
            /*clickAddLevel*/
            ctx[20](
              /*classKey*/
              ctx[48]
            )
          )) ctx[20](
            /*classKey*/
            ctx[48]
          ).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const levelupbuttoninnards_changes = {};
      if (dirty[0] & /*classKeys*/
      2) levelupbuttoninnards_changes.src = /*getCharacterClass*/
      ctx[16](
        /*classKey*/
        ctx[48]
      )?.img;
      if (dirty[0] & /*classLevels*/
      4) levelupbuttoninnards_changes.level = /*classLevels*/
      ctx[2][
        /*index*/
        ctx[50]
      ];
      if (dirty[0] & /*classKeys*/
      2) levelupbuttoninnards_changes.classKey = /*classKey*/
      ctx[48];
      levelupbuttoninnards.$set(levelupbuttoninnards_changes);
      if (!current || dirty[0] & /*classKeys*/
      2 && div_class_value !== (div_class_value = "class-row " + /*existingClassesCssClassForRow*/
      ctx[15](
        /*classKey*/
        ctx[48]
      ) + " svelte-gas-xasakp")) {
        attr(div, "class", div_class_value);
      }
      if (!current || dirty[0] & /*classKeys*/
      2 && div_aria_label_value !== (div_aria_label_value = localize("GAS.LevelUp.Button") + " " + /*classKey*/
      ctx[48])) {
        attr(div, "aria-label", div_aria_label_value);
      }
      if (!current || dirty[0] & /*classKeys*/
      2 && div_data_tooltip_value !== (div_data_tooltip_value = localize("GAS.LevelUp.Button") + " " + /*classKey*/
      ctx[48])) {
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
function create_if_block_4(ctx) {
  let div;
  let levelupbuttoninnards;
  let div_class_value;
  let current;
  levelupbuttoninnards = new LevelUpButtonInnards({
    props: {
      src: (
        /*getCharacterClass*/
        ctx[16](
          /*classKey*/
          ctx[48]
        )?.img
      ),
      level: (
        /*classLevels*/
        ctx[2][
          /*index*/
          ctx[50]
        ]
      ),
      classKey: (
        /*classKey*/
        ctx[48]
      )
    }
  });
  return {
    c() {
      div = element("div");
      create_component(levelupbuttoninnards.$$.fragment);
      attr(div, "class", div_class_value = "class-row " + /*existingClassesCssClassForRow*/
      ctx[15](
        /*classKey*/
        ctx[48]
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
      2) levelupbuttoninnards_changes.src = /*getCharacterClass*/
      ctx2[16](
        /*classKey*/
        ctx2[48]
      )?.img;
      if (dirty[0] & /*classLevels*/
      4) levelupbuttoninnards_changes.level = /*classLevels*/
      ctx2[2][
        /*index*/
        ctx2[50]
      ];
      if (dirty[0] & /*classKeys*/
      2) levelupbuttoninnards_changes.classKey = /*classKey*/
      ctx2[48];
      levelupbuttoninnards.$set(levelupbuttoninnards_changes);
      if (!current || dirty[0] & /*classKeys*/
      2 && div_class_value !== (div_class_value = "class-row " + /*existingClassesCssClassForRow*/
      ctx2[15](
        /*classKey*/
        ctx2[48]
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
function create_each_block(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block_4, create_else_block];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*$activeClass*/
      ctx2[4] && !/*$newClassLevel*/
      ctx2[11]
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
function create_if_block_2(ctx) {
  let h1;
  let div;
  let iconselect;
  let updating_value;
  let current;
  let if_block = (
    /*classProp*/
    ctx[10] && create_if_block_3(ctx)
  );
  function iconselect_value_binding(value) {
    ctx[29](value);
  }
  let iconselect_props = {
    class: "icon-select",
    options: (
      /*filteredClassIndex*/
      ctx[6]
    ),
    placeHolder: (
      /*classesPlaceholder*/
      ctx[12]
    ),
    handler: (
      /*selectClassHandler*/
      ctx[18]
    ),
    id: "characterClass-select"
  };
  if (
    /*classValue*/
    ctx[5] !== void 0
  ) {
    iconselect_props.value = /*classValue*/
    ctx[5];
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
        ctx2[10]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_3(ctx2);
          if_block.c();
          if_block.m(h1, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      const iconselect_changes = {};
      if (dirty[0] & /*filteredClassIndex*/
      64) iconselect_changes.options = /*filteredClassIndex*/
      ctx2[6];
      if (!updating_value && dirty[0] & /*classValue*/
      32) {
        updating_value = true;
        iconselect_changes.value = /*classValue*/
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
function create_if_block_3(ctx) {
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
          ctx[19]
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
function create_if_block(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*activeClassObj*/
    ctx[7] && create_if_block_1(ctx)
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
        /*activeClassObj*/
        ctx2[7]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*activeClassObj*/
          128) {
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
  let h3;
  let t0_value = (
    /*activeClassObj*/
    ctx[7].name + ""
  );
  let t0;
  let t1;
  let t2_value = (
    /*levelOptions*/
    ctx[13][1].label + ""
  );
  let t2;
  let levelupexisting;
  let current;
  levelupexisting = new LevelUpExistingClassLeftCol({
    props: {
      classAdvancementArrayFiltered: (
        /*classAdvancementArrayFiltered*/
        ctx[8]
      ),
      level: (
        /*getLevel*/
        ctx[17](
          /*activeClassKey*/
          ctx[0]
        )
      )
    }
  });
  return {
    c() {
      h3 = element("h3");
      t0 = text(t0_value);
      t1 = space();
      t2 = text(t2_value);
      create_component(levelupexisting.$$.fragment);
    },
    m(target, anchor) {
      insert(target, h3, anchor);
      append(h3, t0);
      append(h3, t1);
      append(h3, t2);
      mount_component(levelupexisting, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if ((!current || dirty[0] & /*activeClassObj*/
      128) && t0_value !== (t0_value = /*activeClassObj*/
      ctx2[7].name + "")) set_data(t0, t0_value);
      const levelupexisting_changes = {};
      if (dirty[0] & /*classAdvancementArrayFiltered*/
      256) levelupexisting_changes.classAdvancementArrayFiltered = /*classAdvancementArrayFiltered*/
      ctx2[8];
      if (dirty[0] & /*activeClassKey*/
      1) levelupexisting_changes.level = /*getLevel*/
      ctx2[17](
        /*activeClassKey*/
        ctx2[0]
      );
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
function create_fragment(ctx) {
  let div4;
  let div3;
  let div0;
  let h1;
  let each_1_anchor;
  let if_block0_anchor;
  let div1;
  let div2;
  let current;
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
  let if_block0 = !/*$newClassLevel*/
  ctx[11] && create_if_block_2(ctx);
  let if_block1 = (
    /*$characterClass*/
    ctx[3] && create_if_block(ctx)
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
      append(div3, div1);
      append(div3, div2);
      div2.innerHTML = /*combinedHtml*/
      ctx[9];
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*existingClassesCssClassForRow, classKeys, getCharacterClass, classLevels, $activeClass, $newClassLevel, clickAddLevel*/
      1148950) {
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
            each_blocks[i].m(div0, each_1_anchor);
          }
        }
        group_outros();
        for (i = each_value.length; i < each_blocks.length; i += 1) {
          out(i);
        }
        check_outros();
      }
      if (!/*$newClassLevel*/
      ctx2[11]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty[0] & /*$newClassLevel*/
          2048) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_2(ctx2);
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
          if_block1 = create_if_block(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div0, null);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (!current || dirty[0] & /*combinedHtml*/
      512) div2.innerHTML = /*combinedHtml*/
      ctx2[9];
    },
    i(local) {
      if (current) return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      transition_in(if_block0);
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      each_blocks = each_blocks.filter(Boolean_1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      transition_out(if_block0);
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div4);
      }
      destroy_each(each_blocks, detaching);
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let html;
  let classProp;
  let combinedHtml;
  let classAdvancementComponents;
  let subClassAdvancementComponents;
  let subClassAdvancementArrayFiltered;
  let classAdvancementArrayFiltered;
  let classKeys;
  let classLevels;
  let activeClassObj;
  let activeClassIndex;
  let filteredClassIndex;
  let $characterSubClass;
  let $characterClass;
  let $actor;
  let $activeClass;
  let $level;
  let $newClassLevel;
  let $isMultiClass;
  component_subscribe($$self, characterSubClass, ($$value) => $$invalidate(26, $characterSubClass = $$value));
  component_subscribe($$self, characterClass, ($$value) => $$invalidate(3, $characterClass = $$value));
  component_subscribe($$self, activeClass, ($$value) => $$invalidate(4, $activeClass = $$value));
  component_subscribe($$self, level, ($$value) => $$invalidate(28, $level = $$value));
  component_subscribe($$self, newClassLevel, ($$value) => $$invalidate(11, $newClassLevel = $$value));
  component_subscribe($$self, isMultiClass, ($$value) => $$invalidate(38, $isMultiClass = $$value));
  let richHTML = "", richSubClassHTML = "", activeClassKey = null, activeSubClass = null, classValue = null, subClassesIndex, classesPlaceholder = "Classes", packs = getPacksFromSettings("classes");
  game.packs.get("dnd5e.subclasses");
  let subClassesPacks = getPacksFromSettings("subclasses"), mappedClassIndex = extractItemsFromPacks(packs, ["name->label", "img", "type", "folder", "uuid->value", "_id"]);
  const levelOptions = [];
  for (let i = 1; i <= 20; i++) {
    levelOptions.push({ label: "Level " + i, value: i });
  }
  const actor = getContext("#doc");
  component_subscribe($$self, actor, (value) => $$invalidate(27, $actor = value));
  const importClassAdvancements = async () => {
    for (const classAdvancement of classAdvancementArrayFiltered) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-C1WO37Ig.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-dVqeSbip.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-ijBoQttN.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-BIkbsEEo.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-BRlalfCe.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-Cp9YUr3j.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-BJbO_WoS.js") }), `../../../molecules/dnd5e/Advancements/${classAdvancement.type}.svelte`, 7);
        classAdvancementComponents[classAdvancement.type] = module.default;
      } catch (error) {
        log.e(`Failed to load component for ${classAdvancement.type}:`, error);
      }
    }
  };
  const importSubClassAdvancements = async () => {
    for (const subClassAdvancement of subClassAdvancementArrayFiltered) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-C1WO37Ig.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-dVqeSbip.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-ijBoQttN.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-BIkbsEEo.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-BRlalfCe.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-Cp9YUr3j.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-BJbO_WoS.js") }), `../../../molecules/dnd5e/Advancements/${subClassAdvancement.type}.svelte`, 7);
        await tick();
        subClassAdvancementComponents[subClassAdvancement.type] = module.default;
      } catch (error) {
        log.e(`Failed to load component for ${subClassAdvancement.type}:`, error);
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
  function getLevel(classKey) {
    const level2 = $newClassLevel ? $newClassLevel : getCharacterClass(classKey)?.system?.levels;
    return level2;
  }
  const selectClassHandler = async (option) => {
    $$invalidate(23, activeSubClass = null);
    set_store_value(characterSubClass, $characterSubClass = null, $characterSubClass);
    subClassAdvancementArrayFiltered = [];
    $$invalidate(22, richSubClassHTML = "");
    set_store_value(characterClass, $characterClass = await fromUuid(option), $characterClass);
    set_store_value(activeClass, $activeClass = option, $activeClass);
    await tick();
    $$invalidate(24, subClassesIndex = await getFilteredSubclassIndex());
    await tick();
    importClassAdvancements();
    $$invalidate(21, richHTML = await TextEditor.enrichHTML(html));
  };
  const clickCancelMulticlass = async () => {
    set_store_value(activeClass, $activeClass = false, $activeClass);
    $$invalidate(5, classValue = null);
    $$invalidate(23, activeSubClass = null);
    $$invalidate(0, activeClassKey = null);
    set_store_value(characterClass, $characterClass = false, $characterClass);
  };
  async function clickAddLevel(classKey) {
    if ($isMultiClass) return;
    const isUnset = Boolean($activeClass) && Boolean($newClassLevel);
    if (isUnset) return;
    const uuid = getCharacterClass(classKey).uuid;
    $$invalidate(23, activeSubClass = null);
    set_store_value(characterSubClass, $characterSubClass = null, $characterSubClass);
    subClassAdvancementArrayFiltered = [];
    $$invalidate(22, richSubClassHTML = "");
    set_store_value(characterClass, $characterClass = await fromUuid(uuid), $characterClass);
    set_store_value(activeClass, $activeClass = uuid, $activeClass);
    $$invalidate(0, activeClassKey = classKey);
    newClassLevel.set($actor._classes[classKey]?.system?.levels + 1);
    await tick();
    $$invalidate(24, subClassesIndex = await getFilteredSubclassIndex());
    await tick();
    importClassAdvancements();
    $$invalidate(21, richHTML = await TextEditor.enrichHTML(html));
  }
  onMount(async () => {
    if ($characterClass) {
      $$invalidate(5, classValue = $characterClass.uuid);
      await tick();
      importClassAdvancements();
      $$invalidate(21, richHTML = await TextEditor.enrichHTML(html));
      $$invalidate(24, subClassesIndex = await getFilteredSubclassIndex());
    }
    if ($characterSubClass) {
      $characterSubClass.uuid;
      await tick();
      importSubClassAdvancements();
      $$invalidate(22, richSubClassHTML = await TextEditor.enrichHTML($characterSubClass.system.description.value));
    }
  });
  function iconselect_value_binding(value) {
    classValue = value;
    $$invalidate(5, classValue);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*$characterClass*/
    8) {
      html = $characterClass?.system?.description.value || "";
    }
    if ($$self.$$.dirty[0] & /*activeSubClass*/
    8388608) ;
    if ($$self.$$.dirty[0] & /*$activeClass*/
    16) {
      $$invalidate(10, classProp = $activeClass);
    }
    if ($$self.$$.dirty[0] & /*richHTML, richSubClassHTML*/
    6291456) {
      $$invalidate(9, combinedHtml = richHTML + (richSubClassHTML ? `<h1>${localize("GAS.SubClass")}</h1>` + richSubClassHTML : ""));
    }
    if ($$self.$$.dirty[0] & /*subClassesIndex*/
    16777216) {
      if (subClassesIndex?.length) {
        subClassesIndex.flat().sort((a, b) => a.label.localeCompare(b.label));
      }
    }
    if ($$self.$$.dirty[0] & /*$characterSubClass, $level*/
    335544320) {
      subClassAdvancementArrayFiltered = $characterSubClass?.advancement?.byId ? Object.entries($characterSubClass.advancement.byId).filter(([id, value]) => value.level === $level).map(([id, value]) => ({ ...value, id })) : [];
    }
    if ($$self.$$.dirty[0] & /*$characterClass, $level*/
    268435464) {
      $$invalidate(8, classAdvancementArrayFiltered = $characterClass?.advancement?.byId ? Object.entries($characterClass.advancement.byId).filter(([id, value]) => value.level === $level).map(([id, value]) => ({ ...value, id })) : []);
    }
    if ($$self.$$.dirty[0] & /*$actor*/
    134217728) {
      $$invalidate(1, classKeys = Object.keys($actor._classes));
    }
    if ($$self.$$.dirty[0] & /*classKeys, $actor, $activeClass*/
    134217746) {
      $$invalidate(2, classLevels = classKeys.map((classKey) => {
        const classObj = $actor._classes[classKey];
        return classObj.uuid == $activeClass ? classObj.system.levels + 1 : classObj.system.levels;
      }));
    }
    if ($$self.$$.dirty[0] & /*$actor, activeClassKey*/
    134217729) {
      $$invalidate(7, activeClassObj = $actor._classes[activeClassKey]);
    }
    if ($$self.$$.dirty[0] & /*classKeys, activeClassKey*/
    3) {
      $$invalidate(25, activeClassIndex = classKeys.indexOf(activeClassKey));
    }
    if ($$self.$$.dirty[0] & /*classLevels, activeClassIndex*/
    33554436) {
      classLevels[activeClassIndex];
    }
    if ($$self.$$.dirty[0] & /*classKeys*/
    2) {
      $$invalidate(6, filteredClassIndex = mappedClassIndex.filter((i) => {
        return i.type == "class" && DonationTracker.canViewItem(i) && //- @why: don't include classes that are already in the character
        !classKeys.includes(i.label.toLowerCase());
      }).sort((a, b) => a.label.localeCompare(b.label)));
    }
  };
  classAdvancementComponents = {};
  subClassAdvancementComponents = {};
  return [
    activeClassKey,
    classKeys,
    classLevels,
    $characterClass,
    $activeClass,
    classValue,
    filteredClassIndex,
    activeClassObj,
    classAdvancementArrayFiltered,
    combinedHtml,
    classProp,
    $newClassLevel,
    classesPlaceholder,
    levelOptions,
    actor,
    existingClassesCssClassForRow,
    getCharacterClass,
    getLevel,
    selectClassHandler,
    clickCancelMulticlass,
    clickAddLevel,
    richHTML,
    richSubClassHTML,
    activeSubClass,
    subClassesIndex,
    activeClassIndex,
    $characterSubClass,
    $actor,
    $level,
    iconselect_value_binding
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
//# sourceMappingURL=LevelUp-CQ88m5nM.js.map
