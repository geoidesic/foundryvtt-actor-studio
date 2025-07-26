import { S as SvelteComponent, i as init, s as safe_not_equal, k as detach, t as transition_out, a as transition_in, n as group_outros, p as check_outros, q as insert, u as append, v as element, l as localize, w as empty, x as attr, b as component_subscribe, e as abilityGenerationMethod, g as getContext, o as onMount, f as getRules, h as tick, j as set_store_value, M as MODULE_ID, y as binding_callbacks, z as bind, d as destroy_component, A as add_flush_callback, m as mount_component, c as create_component, B as ensure_array_like, C as noop, D as destroy_each, E as construct_svelte_component, _ as __variableDynamicImportRuntimeHelper, F as set_data, G as text } from "./index-Vm_z90HH.js";
/* empty css                                              */
/* empty css                                                     */
import { I as IconSelect } from "./IconSelect-DjuU-15N.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[16] = list[i];
  return child_ctx;
}
function create_else_block(ctx) {
  let ol;
  let each_value = ensure_array_like(
    /*options*/
    ctx[0]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  return {
    c() {
      ol = element("ol");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(ol, "class", "properties-list svelte-gas-7xdbzi");
    },
    m(target, anchor) {
      insert(target, ol, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(ol, null);
        }
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*options*/
      1) {
        each_value = ensure_array_like(
          /*options*/
          ctx2[0]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(ol, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(ol);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_if_block_1(ctx) {
  let iconselect;
  let updating_value;
  let current;
  function iconselect_value_binding(value) {
    ctx[11](value);
  }
  let iconselect_props = {
    class: "icon-select",
    options: (
      /*options*/
      ctx[0]
    ),
    active: (
      /*active*/
      ctx[2]
    ),
    placeHolder: (
      /*placeHolder*/
      ctx[7]
    ),
    handler: (
      /*selectHandler*/
      ctx[6]
    ),
    id: "ability-generation-method-select"
  };
  if (
    /*$abilityGenerationMethod*/
    ctx[1] !== void 0
  ) {
    iconselect_props.value = /*$abilityGenerationMethod*/
    ctx[1];
  }
  iconselect = new IconSelect({ props: iconselect_props });
  binding_callbacks.push(() => bind(iconselect, "value", iconselect_value_binding));
  return {
    c() {
      create_component(iconselect.$$.fragment);
    },
    m(target, anchor) {
      mount_component(iconselect, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const iconselect_changes = {};
      if (dirty & /*options*/
      1) iconselect_changes.options = /*options*/
      ctx2[0];
      if (dirty & /*active*/
      4) iconselect_changes.active = /*active*/
      ctx2[2];
      if (!updating_value && dirty & /*$abilityGenerationMethod*/
      2) {
        updating_value = true;
        iconselect_changes.value = /*$abilityGenerationMethod*/
        ctx2[1];
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
      destroy_component(iconselect, detaching);
    }
  };
}
function create_each_block(ctx) {
  let li;
  let t_1_value = (
    /*option*/
    ctx[16].label + ""
  );
  let t_1;
  return {
    c() {
      li = element("li");
      t_1 = text(t_1_value);
    },
    m(target, anchor) {
      insert(target, li, anchor);
      append(li, t_1);
    },
    p(ctx2, dirty) {
      if (dirty & /*options*/
      1 && t_1_value !== (t_1_value = /*option*/
      ctx2[16].label + "")) set_data(t_1, t_1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(li);
      }
    }
  };
}
function create_if_block(ctx) {
  let switch_instance;
  let switch_instance_anchor;
  let current;
  var switch_value = (
    /*abilityModule*/
    ctx[3]
  );
  function switch_props(ctx2, dirty) {
    return {};
  }
  if (switch_value) {
    switch_instance = construct_svelte_component(switch_value, switch_props());
  }
  return {
    c() {
      if (switch_instance) create_component(switch_instance.$$.fragment);
      switch_instance_anchor = empty();
    },
    m(target, anchor) {
      if (switch_instance) mount_component(switch_instance, target, anchor);
      insert(target, switch_instance_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty & /*abilityModule*/
      8 && switch_value !== (switch_value = /*abilityModule*/
      ctx2[3])) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = construct_svelte_component(switch_value, switch_props());
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
        } else {
          switch_instance = null;
        }
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
        detach(switch_instance_anchor);
      }
      if (switch_instance) destroy_component(switch_instance, detaching);
    }
  };
}
function create_fragment(ctx) {
  let div4;
  let div3;
  let div0;
  let h3;
  let current_block_type_index;
  let if_block0;
  let if_block0_anchor;
  let div1;
  let div2;
  let current;
  const if_block_creators = [create_if_block_1, create_else_block];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*options*/
      ctx2[0].length > 1
    ) return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  let if_block1 = (
    /*$abilityGenerationMethod*/
    ctx[1] && create_if_block(ctx)
  );
  return {
    c() {
      div4 = element("div");
      div3 = element("div");
      div0 = element("div");
      h3 = element("h3");
      h3.textContent = `${localize("Tabs.Abilities.HowCalculated")}`;
      if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      div1 = element("div");
      div1.innerHTML = ``;
      div2 = element("div");
      attr(h3, "class", "left");
      attr(div0, "class", "flex2 pr-sm col-a");
      attr(div1, "class", "flex0 border-right right-border-gradient-mask");
      attr(div2, "class", "flex3 left pl-md scroll col-b");
      attr(div3, "class", "flexrow svelte-gas-7xdbzi");
      attr(div4, "class", "content svelte-gas-7xdbzi");
    },
    m(target, anchor) {
      insert(target, div4, anchor);
      append(div4, div3);
      append(div3, div0);
      append(div0, h3);
      if_blocks[current_block_type_index].m(div0, null);
      append(div0, if_block0_anchor);
      if (if_block1) if_block1.m(div0, null);
      append(div3, div1);
      append(div3, div2);
      div2.innerHTML = /*richHTML*/
      ctx[4];
      current = true;
    },
    p(ctx2, [dirty]) {
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
        if_block0 = if_blocks[current_block_type_index];
        if (!if_block0) {
          if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block0.c();
        } else {
          if_block0.p(ctx2, dirty);
        }
        transition_in(if_block0, 1);
        if_block0.m(div0, if_block0_anchor);
      }
      if (
        /*$abilityGenerationMethod*/
        ctx2[1]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & /*$abilityGenerationMethod*/
          2) {
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
      if (!current || dirty & /*richHTML*/
      16) div2.innerHTML = /*richHTML*/
      ctx2[4];
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
        detach(div4);
      }
      if_blocks[current_block_type_index].d();
      if (if_block1) if_block1.d();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let advancementComponents;
  let richHTML;
  let options;
  let abilityModule;
  let $abilityGenerationMethod;
  let $actor;
  component_subscribe($$self, abilityGenerationMethod, ($$value) => $$invalidate(1, $abilityGenerationMethod = $$value));
  const actor = getContext("#doc");
  component_subscribe($$self, actor, (value) => $$invalidate(10, $actor = value));
  const ruleConfig = {
    journalId: "0AGfrwZRzSG0vNKb",
    pageId: "yuSwUFIjK31Mr3DI"
  };
  const importAdvancements = async () => {
    for (const option of options) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/AbilityEntry/ManualEntry.svelte": () => import("./ManualEntry-BkCKVY4K.js"), "../../../molecules/dnd5e/AbilityEntry/PointBuy.svelte": () => import("./PointBuy-B8dsKaMO.js"), "../../../molecules/dnd5e/AbilityEntry/Roll.svelte": () => import("./Roll-DL3NN1l4.js"), "../../../molecules/dnd5e/AbilityEntry/StandardArray.svelte": () => import("./StandardArray-Bdtnnwqx.js") }), `../../../molecules/dnd5e/AbilityEntry/${option.type}.svelte`, 7);
        $$invalidate(9, advancementComponents[option.type] = module.default, advancementComponents);
      } catch (error) {
        log.e(`Failed to load component for ${option.type}:`, error);
      }
    }
  };
  const selectHandler = async (option) => {
    $$invalidate(2, active = option.value);
    set_store_value(abilityGenerationMethod, $abilityGenerationMethod = option.value, $abilityGenerationMethod);
    importAdvancements();
  };
  let rules = "", active, placeHolder = "Ability Generation Method";
  onMount(async () => {
    $$invalidate(8, rules = await getRules(ruleConfig));
    await tick();
    await importAdvancements();
  });
  function iconselect_value_binding(value) {
    $abilityGenerationMethod = value;
    abilityGenerationMethod.set($abilityGenerationMethod);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$actor*/
    1024) {
      $actor.toObject();
    }
    if ($$self.$$.dirty & /*rules*/
    256) {
      $$invalidate(4, richHTML = rules?.content || "");
    }
    if ($$self.$$.dirty & /*options*/
    1) {
      if (options.length === 1) {
        set_store_value(abilityGenerationMethod, $abilityGenerationMethod = options[0].value, $abilityGenerationMethod);
      }
    }
    if ($$self.$$.dirty & /*$abilityGenerationMethod, advancementComponents, options*/
    515) {
      $$invalidate(3, abilityModule = $abilityGenerationMethod ? advancementComponents[options.find((option) => option.value === $abilityGenerationMethod).type] : null);
    }
  };
  $$invalidate(9, advancementComponents = {});
  $$invalidate(0, options = [
    {
      value: 1,
      label: localize("Tabs.Abilities.ManualEntry"),
      type: "ManualEntry",
      setting: game.settings.get(MODULE_ID, "allowManualInput")
    },
    {
      value: 2,
      label: localize("Tabs.Abilities.PointBuy"),
      type: "PointBuy",
      setting: game.settings.get(MODULE_ID, "allowPointBuy")
    },
    {
      value: 3,
      label: localize("Tabs.Abilities.Roll"),
      type: "Roll",
      setting: game.settings.get(MODULE_ID, "allowRolling")
    },
    {
      value: 4,
      label: localize("Tabs.Abilities.StandardArray"),
      type: "StandardArray",
      setting: game.settings.get(MODULE_ID, "allowStandardArray")
    }
  ].filter((obj) => obj.setting));
  return [
    options,
    $abilityGenerationMethod,
    active,
    abilityModule,
    richHTML,
    actor,
    selectHandler,
    placeHolder,
    rules,
    advancementComponents,
    $actor,
    iconselect_value_binding
  ];
}
class ExistingAbilities extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {});
  }
}
export {
  ExistingAbilities as default
};
//# sourceMappingURL=ExistingAbilities-BB9zxOm8.js.map
