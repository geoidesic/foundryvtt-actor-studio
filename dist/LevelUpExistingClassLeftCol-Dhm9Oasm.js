import { S as SvelteComponent, i as init, s as safe_not_equal, e as element, b as attr, c as insert, h as transition_in, g as group_outros, t as transition_out, f as check_outros, j as detach, o as onMount, q as tick, _ as __variableDynamicImportRuntimeHelper, z as ensure_array_like, a as empty, B as destroy_each, l as localize, A as noop, r as construct_svelte_component, F as text, u as create_component, K as src_url_equal, d as append, v as mount_component, G as set_data, w as destroy_component } from "./index-CyrrH75G.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[4] = list[i];
  return child_ctx;
}
function create_if_block(ctx) {
  let ul;
  let current_block_type_index;
  let if_block;
  let current;
  const if_block_creators = [create_if_block_1, create_else_block];
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
function create_else_block(ctx) {
  let each_1_anchor;
  let current;
  let each_value = ensure_array_like(
    /*classAdvancementArrayFiltered*/
    ctx[0]
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
      if (dirty & /*classAdvancementArrayFiltered, classAdvancementComponents*/
      3) {
        each_value = ensure_array_like(
          /*classAdvancementArrayFiltered*/
          ctx2[0]
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
function create_if_block_1(ctx) {
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
    ctx[4].title + ""
  );
  let t;
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
      t = text(t_value);
      div3 = element("div");
      if (switch_instance) create_component(switch_instance.$$.fragment);
      attr(img, "class", "icon");
      if (!src_url_equal(img.src, img_src_value = /*advancement*/
      ctx[4].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[4].title);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow");
      attr(div2, "data-tooltip", div2_data_tooltip_value = /*advancement*/
      ctx[4].configuration?.hint || null);
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
      append(div1, t);
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
      1) && t_value !== (t_value = /*advancement*/
      ctx2[4].title + "")) set_data(t, t_value);
      if (!current || dirty & /*classAdvancementArrayFiltered*/
      1 && div2_data_tooltip_value !== (div2_data_tooltip_value = /*advancement*/
      ctx2[4].configuration?.hint || null)) {
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
function create_fragment(ctx) {
  let div;
  let current;
  let if_block = (
    /*classAdvancementArrayFiltered*/
    ctx[0] && create_if_block(ctx)
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
          if_block = create_if_block(ctx2);
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
function instance($$self, $$props, $$invalidate) {
  let classAdvancementComponents;
  let { classAdvancementArrayFiltered = [] } = $$props;
  let { level = 0 } = $$props;
  const importClassAdvancements = async () => {
    for (const classAdvancement of classAdvancementArrayFiltered) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-BMjloEsh.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-2w3B2nEN.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-BJlvQIpy.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-BdR6_LGh.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-BqHHOwt5.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-lEEA1NwN.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-N2tYDn8x.js") }), `../../../molecules/dnd5e/Advancements/${classAdvancement.type}.svelte`, 7);
        $$invalidate(1, classAdvancementComponents[classAdvancement.type] = module.default, classAdvancementComponents);
      } catch (error) {
        log.e(`Failed to load component for ${classAdvancement.type}:`, error);
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
    init(this, options, instance, create_fragment, safe_not_equal, {
      classAdvancementArrayFiltered: 0,
      level: 2
    });
  }
}
export {
  LevelUpExistingClassLeftCol as default
};
//# sourceMappingURL=LevelUpExistingClassLeftCol-Dhm9Oasm.js.map
