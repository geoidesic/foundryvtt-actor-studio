import { T as TJSSvelte, S as SvelteComponent, i as init, s as safe_not_equal, k as detach, t as transition_out, a as transition_in, n as group_outros, p as check_outros, q as insert, w as empty, P as isObject, Q as create_slot, R as update_slot_base, U as get_all_dirty_from_scope, V as get_slot_changes, u as append, v as element, W as space, x as attr, X as localize, C as noop, F as set_data, Y as toggle_class, G as text, E as construct_svelte_component, d as destroy_component, c as create_component, m as mount_component, Z as get_spread_update, $ as get_spread_object, a0 as assign, o as onMount, a1 as writable, a2 as isMinimalWritableStore, B as ensure_array_like, D as destroy_each, a3 as run_all, a4 as select_option, a5 as listen, a6 as action_destroyer, a7 as applyStyles, a8 as add_render_callback, a9 as subscribe, aa as bubble, ab as select_value, ac as set_input_value, ad as is_function, l as localize$1, b as component_subscribe, ae as characterSubClass, af as characterClass, ag as level, r as readOnlyTabs, ah as subClassesForClass, J as getPacksFromSettings, K as extractItemsFromPacksSync, M as MODULE_ID, g as getContext, ai as getSubclassLevel, y as binding_callbacks, z as bind, A as add_flush_callback, j as set_store_value, aj as goldRoll, ak as clearEquipmentSelections, h as tick, L as illuminatedDescription, al as extractItemsFromPacksAsync, _ as __variableDynamicImportRuntimeHelper, N as src_url_equal, O as getAdvancementValue } from "./index-BJ1f51Mm.js";
/* empty css                                              */
import { I as IconSelect } from "./IconSelect-b8P8NDTp.js";
import { S as StandardTabLayout } from "./StandardTabLayout-CpfyWwLX.js";
class TJSSlotLabelUtil {
  /**
   * Test if the given label is valid data / prop for the TJSSlotLabel component.
   */
  static isValid(label) {
    return typeof label === "string" || TJSSvelte.config.isConfigEmbed(label);
  }
}
function create_else_block(ctx) {
  let current;
  const default_slot_template = (
    /*#slots*/
    ctx[3].default
  );
  const default_slot = create_slot(
    default_slot_template,
    ctx,
    /*$$scope*/
    ctx[2],
    null
  );
  return {
    c() {
      if (default_slot) default_slot.c();
    },
    m(target, anchor) {
      if (default_slot) {
        default_slot.m(target, anchor);
      }
      current = true;
    },
    p(ctx2, dirty) {
      if (default_slot) {
        if (default_slot.p && (!current || dirty & /*$$scope*/
        4)) {
          update_slot_base(
            default_slot,
            default_slot_template,
            ctx2,
            /*$$scope*/
            ctx2[2],
            !current ? get_all_dirty_from_scope(
              /*$$scope*/
              ctx2[2]
            ) : get_slot_changes(
              default_slot_template,
              /*$$scope*/
              ctx2[2],
              dirty,
              null
            ),
            null
          );
        }
      }
    },
    i(local) {
      if (current) return;
      transition_in(default_slot, local);
      current = true;
    },
    o(local) {
      transition_out(default_slot, local);
      current = false;
    },
    d(detaching) {
      if (default_slot) default_slot.d(detaching);
    }
  };
}
function create_if_block$1(ctx) {
  let label_1;
  let show_if;
  let current_block_type_index;
  let if_block;
  let t;
  let current;
  const if_block_creators = [create_if_block_1$1, create_if_block_2$1];
  const if_blocks = [];
  function select_block_type_1(ctx2, dirty) {
    if (dirty & /*label*/
    1) show_if = null;
    if (typeof /*label*/
    ctx2[0] === "string") return 0;
    if (show_if == null) show_if = !!TJSSvelte.config.isConfigEmbed(
      /*label*/
      ctx2[0]
    );
    if (show_if) return 1;
    return -1;
  }
  if (~(current_block_type_index = select_block_type_1(ctx, -1))) {
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  }
  const default_slot_template = (
    /*#slots*/
    ctx[3].default
  );
  const default_slot = create_slot(
    default_slot_template,
    ctx,
    /*$$scope*/
    ctx[2],
    null
  );
  return {
    c() {
      label_1 = element("label");
      if (if_block) if_block.c();
      t = space();
      if (default_slot) default_slot.c();
      attr(label_1, "class", "tjs-slot-label svelte-gas-1c8p0p4");
    },
    m(target, anchor) {
      insert(target, label_1, anchor);
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].m(label_1, null);
      }
      append(label_1, t);
      if (default_slot) {
        default_slot.m(label_1, null);
      }
      current = true;
    },
    p(ctx2, dirty) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type_1(ctx2, dirty);
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
          if_block.m(label_1, t);
        } else {
          if_block = null;
        }
      }
      if (default_slot) {
        if (default_slot.p && (!current || dirty & /*$$scope*/
        4)) {
          update_slot_base(
            default_slot,
            default_slot_template,
            ctx2,
            /*$$scope*/
            ctx2[2],
            !current ? get_all_dirty_from_scope(
              /*$$scope*/
              ctx2[2]
            ) : get_slot_changes(
              default_slot_template,
              /*$$scope*/
              ctx2[2],
              dirty,
              null
            ),
            null
          );
        }
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block);
      transition_in(default_slot, local);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      transition_out(default_slot, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(label_1);
      }
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].d();
      }
      if (default_slot) default_slot.d(detaching);
    }
  };
}
function create_if_block_2$1(ctx) {
  let switch_instance;
  let switch_instance_anchor;
  let current;
  const switch_instance_spread_levels = [
    isObject(
      /*label*/
      ctx[0].props
    ) ? (
      /*label*/
      ctx[0].props
    ) : {},
    { enabled: (
      /*enabled*/
      ctx[1]
    ) }
  ];
  var switch_value = (
    /*label*/
    ctx[0].class
  );
  function switch_props(ctx2, dirty) {
    let switch_instance_props = {};
    for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
      switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    }
    if (dirty !== void 0 && dirty & /*label, enabled*/
    3) {
      switch_instance_props = assign(switch_instance_props, get_spread_update(switch_instance_spread_levels, [
        dirty & /*label*/
        1 && get_spread_object(isObject(
          /*label*/
          ctx2[0].props
        ) ? (
          /*label*/
          ctx2[0].props
        ) : {}),
        dirty & /*enabled*/
        2 && { enabled: (
          /*enabled*/
          ctx2[1]
        ) }
      ]));
    }
    return { props: switch_instance_props };
  }
  if (switch_value) {
    switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
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
      if (dirty & /*label*/
      1 && switch_value !== (switch_value = /*label*/
      ctx2[0].class)) {
        if (switch_instance) {
          group_outros();
          const old_component = switch_instance;
          transition_out(old_component.$$.fragment, 1, 0, () => {
            destroy_component(old_component, 1);
          });
          check_outros();
        }
        if (switch_value) {
          switch_instance = construct_svelte_component(switch_value, switch_props(ctx2, dirty));
          create_component(switch_instance.$$.fragment);
          transition_in(switch_instance.$$.fragment, 1);
          mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
        } else {
          switch_instance = null;
        }
      } else if (switch_value) {
        const switch_instance_changes = dirty & /*label, enabled*/
        3 ? get_spread_update(switch_instance_spread_levels, [
          dirty & /*label*/
          1 && get_spread_object(isObject(
            /*label*/
            ctx2[0].props
          ) ? (
            /*label*/
            ctx2[0].props
          ) : {}),
          dirty & /*enabled*/
          2 && { enabled: (
            /*enabled*/
            ctx2[1]
          ) }
        ]) : {};
        switch_instance.$set(switch_instance_changes);
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
function create_if_block_1$1(ctx) {
  let span;
  let t_value = localize(
    /*label*/
    ctx[0]
  ) + "";
  let t;
  return {
    c() {
      span = element("span");
      t = text(t_value);
      attr(span, "class", "tjs-slot-label-span svelte-gas-1c8p0p4");
      toggle_class(span, "disabled", !/*enabled*/
      ctx[1]);
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t);
    },
    p(ctx2, dirty) {
      if (dirty & /*label*/
      1 && t_value !== (t_value = localize(
        /*label*/
        ctx2[0]
      ) + "")) set_data(t, t_value);
      if (dirty & /*enabled*/
      2) {
        toggle_class(span, "disabled", !/*enabled*/
        ctx2[1]);
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_fragment$2(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block$1, create_else_block];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (
      /*label*/
      ctx2[0]
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
function instance$2($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  let { label = void 0 } = $$props;
  let { enabled = void 0 } = $$props;
  $$self.$$set = ($$props2) => {
    if ("label" in $$props2) $$invalidate(0, label = $$props2.label);
    if ("enabled" in $$props2) $$invalidate(1, enabled = $$props2.enabled);
    if ("$$scope" in $$props2) $$invalidate(2, $$scope = $$props2.$$scope);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*label*/
    1) {
      $$invalidate(0, label = TJSSlotLabelUtil.isValid(label) ? label : void 0);
    }
    if ($$self.$$.dirty & /*label, enabled*/
    3) {
      $$invalidate(1, enabled = isObject(label) && typeof label.enabled === "boolean" ? label.enabled : typeof enabled === "boolean" ? enabled : true);
    }
  };
  return [label, enabled, $$scope, slots];
}
class TJSSlotLabel extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, { label: 0, enabled: 1 });
  }
}
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[14] = list[i];
  return child_ctx;
}
function create_each_block$1(ctx) {
  let option_1;
  let t0_value = localize(
    /*option*/
    ctx[14].label ?? /*option*/
    ctx[14].value
  ) + "";
  let t0;
  let t1;
  let option_1_value_value;
  return {
    c() {
      option_1 = element("option");
      t0 = text(t0_value);
      t1 = space();
      attr(option_1, "class", "tjs-select-option svelte-gas-1uux9av");
      option_1.__value = option_1_value_value = /*option*/
      ctx[14].value;
      set_input_value(option_1, option_1.__value);
    },
    m(target, anchor) {
      insert(target, option_1, anchor);
      append(option_1, t0);
      append(option_1, t1);
    },
    p(ctx2, dirty) {
      if (dirty & /*options*/
      4 && t0_value !== (t0_value = localize(
        /*option*/
        ctx2[14].label ?? /*option*/
        ctx2[14].value
      ) + "")) set_data(t0, t0_value);
      if (dirty & /*options*/
      4 && option_1_value_value !== (option_1_value_value = /*option*/
      ctx2[14].value)) {
        option_1.__value = option_1_value_value;
        set_input_value(option_1, option_1.__value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(option_1);
      }
    }
  };
}
function create_default_slot(ctx) {
  let div;
  let select_1;
  let select_1_disabled_value;
  let applyStyles_action;
  let mounted;
  let dispose;
  let each_value = ensure_array_like(
    /*options*/
    ctx[2]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
  }
  return {
    c() {
      div = element("div");
      select_1 = element("select");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(select_1, "class", "tjs-select svelte-gas-1uux9av");
      select_1.disabled = select_1_disabled_value = !/*enabled*/
      ctx[0];
      if (
        /*$store*/
        ctx[6] === void 0
      ) add_render_callback(() => (
        /*select_1_change_handler*/
        ctx[13].call(select_1)
      ));
      toggle_class(
        select_1,
        "has-efx",
        /*efx*/
        ctx[5] !== /*s_DEFAULT_EFX*/
        ctx[7]
      );
      attr(div, "class", "tjs-select-container svelte-gas-1uux9av");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, select_1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(select_1, null);
        }
      }
      select_option(
        select_1,
        /*$store*/
        ctx[6],
        true
      );
      if (!mounted) {
        dispose = [
          listen(
            select_1,
            "change",
            /*change_handler_1*/
            ctx[12]
          ),
          listen(
            select_1,
            "change",
            /*select_1_change_handler*/
            ctx[13]
          ),
          listen(
            div,
            "change",
            /*change_handler*/
            ctx[10]
          ),
          action_destroyer(
            /*efx*/
            ctx[5].call(null, div)
          ),
          action_destroyer(applyStyles_action = applyStyles.call(
            null,
            div,
            /*styles*/
            ctx[4]
          )),
          listen(
            div,
            "pointerdown",
            /*pointerdown_handler*/
            ctx[11]
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*options*/
      4) {
        each_value = ensure_array_like(
          /*options*/
          ctx2[2]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$1(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block$1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(select_1, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (dirty & /*enabled*/
      1 && select_1_disabled_value !== (select_1_disabled_value = !/*enabled*/
      ctx2[0])) {
        select_1.disabled = select_1_disabled_value;
      }
      if (dirty & /*$store, options*/
      68) {
        select_option(
          select_1,
          /*$store*/
          ctx2[6]
        );
      }
      if (dirty & /*efx, s_DEFAULT_EFX*/
      160) {
        toggle_class(
          select_1,
          "has-efx",
          /*efx*/
          ctx2[5] !== /*s_DEFAULT_EFX*/
          ctx2[7]
        );
      }
      if (applyStyles_action && is_function(applyStyles_action.update) && dirty & /*styles*/
      16) applyStyles_action.update.call(
        null,
        /*styles*/
        ctx2[4]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      destroy_each(each_blocks, detaching);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_fragment$1(ctx) {
  let tjsslotlabel;
  let current;
  tjsslotlabel = new TJSSlotLabel({
    props: {
      label: (
        /*label*/
        ctx[1]
      ),
      enabled: (
        /*enabled*/
        ctx[0]
      ),
      $$slots: { default: [create_default_slot] },
      $$scope: { ctx }
    }
  });
  return {
    c() {
      create_component(tjsslotlabel.$$.fragment);
    },
    m(target, anchor) {
      mount_component(tjsslotlabel, target, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      const tjsslotlabel_changes = {};
      if (dirty & /*label*/
      2) tjsslotlabel_changes.label = /*label*/
      ctx2[1];
      if (dirty & /*enabled*/
      1) tjsslotlabel_changes.enabled = /*enabled*/
      ctx2[0];
      if (dirty & /*$$scope, styles, enabled, $store, efx, options*/
      131189) {
        tjsslotlabel_changes.$$scope = { dirty, ctx: ctx2 };
      }
      tjsslotlabel.$set(tjsslotlabel_changes);
    },
    i(local) {
      if (current) return;
      transition_in(tjsslotlabel.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(tjsslotlabel.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(tjsslotlabel, detaching);
    }
  };
}
function instance$1($$self, $$props, $$invalidate) {
  let $store, $$unsubscribe_store = noop, $$subscribe_store = () => ($$unsubscribe_store(), $$unsubscribe_store = subscribe(store, ($$value) => $$invalidate(6, $store = $$value)), store);
  $$self.$$.on_destroy.push(() => $$unsubscribe_store());
  let { select = void 0 } = $$props;
  let { enabled = void 0 } = $$props;
  let { label = void 0 } = $$props;
  let { selected = void 0 } = $$props;
  let { options = void 0 } = $$props;
  let { store = void 0 } = $$props;
  $$subscribe_store();
  let { styles = void 0 } = $$props;
  let { efx = void 0 } = $$props;
  const s_DEFAULT_EFX = () => {
  };
  onMount(() => {
    if (selected && store && !options.includes($store) && options.includes(selected)) {
      store.set(selected);
    }
  });
  function change_handler(event) {
    bubble.call(this, $$self, event);
  }
  function pointerdown_handler(event) {
    bubble.call(this, $$self, event);
  }
  function change_handler_1(event) {
    bubble.call(this, $$self, event);
  }
  function select_1_change_handler() {
    $store = select_value(this);
    store.set($store);
    $$invalidate(2, options), $$invalidate(9, select);
  }
  $$self.$$set = ($$props2) => {
    if ("select" in $$props2) $$invalidate(9, select = $$props2.select);
    if ("enabled" in $$props2) $$invalidate(0, enabled = $$props2.enabled);
    if ("label" in $$props2) $$invalidate(1, label = $$props2.label);
    if ("selected" in $$props2) $$invalidate(8, selected = $$props2.selected);
    if ("options" in $$props2) $$invalidate(2, options = $$props2.options);
    if ("store" in $$props2) $$subscribe_store($$invalidate(3, store = $$props2.store));
    if ("styles" in $$props2) $$invalidate(4, styles = $$props2.styles);
    if ("efx" in $$props2) $$invalidate(5, efx = $$props2.efx);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*select, enabled*/
    513) {
      $$invalidate(0, enabled = isObject(select) && typeof select.enabled === "boolean" ? select.enabled : typeof enabled === "boolean" ? enabled : true);
    }
    if ($$self.$$.dirty & /*select, label*/
    514) {
      $$invalidate(1, label = isObject(select) && TJSSlotLabelUtil.isValid(select.label) ? select.label : TJSSlotLabelUtil.isValid(label) ? label : void 0);
    }
    if ($$self.$$.dirty & /*select, selected*/
    768) {
      $$invalidate(8, selected = isObject(select) && typeof select.selected === "string" ? select.selected : typeof selected === "string" ? selected : void 0);
    }
    if ($$self.$$.dirty & /*select, options*/
    516) {
      $$invalidate(2, options = isObject(select) && Array.isArray(select.options) ? select.options : Array.isArray(options) ? options : []);
    }
    if ($$self.$$.dirty & /*select, store*/
    520) {
      $$subscribe_store($$invalidate(3, store = isObject(select) && isMinimalWritableStore(select.store) ? select.store : isMinimalWritableStore(store) ? store : writable(void 0)));
    }
    if ($$self.$$.dirty & /*select, styles*/
    528) {
      $$invalidate(4, styles = isObject(select) && isObject(select.styles) ? select.styles : isObject(styles) ? styles : void 0);
    }
    if ($$self.$$.dirty & /*select, efx*/
    544) {
      $$invalidate(5, efx = isObject(select) && typeof select.efx === "function" ? select.efx : typeof efx === "function" ? efx : s_DEFAULT_EFX);
    }
  };
  return [
    enabled,
    label,
    options,
    store,
    styles,
    efx,
    $store,
    s_DEFAULT_EFX,
    selected,
    select,
    change_handler,
    pointerdown_handler,
    change_handler_1,
    select_1_change_handler
  ];
}
class TJSSelect extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {
      select: 9,
      enabled: 0,
      label: 1,
      selected: 8,
      options: 2,
      store: 3,
      styles: 4,
      efx: 5
    });
  }
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[47] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[47] = list[i];
  return child_ctx;
}
function create_if_block_6(ctx) {
  let if_block0_anchor;
  let show_if = !/*$readOnlyTabs*/
  ctx[4].includes("class");
  let if_block1_anchor;
  let if_block2_anchor;
  let current;
  let if_block0 = (
    /*subclasses*/
    ctx[7].length && /*subClassLevel*/
    ctx[0] == 1 && create_if_block_14(ctx)
  );
  let if_block1 = show_if && create_if_block_13(ctx);
  let if_block2 = (
    /*classAdvancementArrayFiltered*/
    ctx[8] && create_if_block_7(ctx)
  );
  return {
    c() {
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      if_block1_anchor = empty();
      if (if_block2) if_block2.c();
      if_block2_anchor = empty();
    },
    m(target, anchor) {
      if (if_block0) if_block0.m(target, anchor);
      insert(target, if_block0_anchor, anchor);
      if (if_block1) if_block1.m(target, anchor);
      insert(target, if_block1_anchor, anchor);
      if (if_block2) if_block2.m(target, anchor);
      insert(target, if_block2_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*subclasses*/
        ctx2[7].length && /*subClassLevel*/
        ctx2[0] == 1
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty[0] & /*subclasses, subClassLevel*/
          129) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_14(ctx2);
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
      if (dirty[0] & /*$readOnlyTabs*/
      16) show_if = !/*$readOnlyTabs*/
      ctx2[4].includes("class");
      if (show_if) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty[0] & /*$readOnlyTabs*/
          16) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_13(ctx2);
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
      if (
        /*classAdvancementArrayFiltered*/
        ctx2[8]
      ) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
          if (dirty[0] & /*classAdvancementArrayFiltered*/
          256) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block_7(ctx2);
          if_block2.c();
          transition_in(if_block2, 1);
          if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
        }
      } else if (if_block2) {
        group_outros();
        transition_out(if_block2, 1, 1, () => {
          if_block2 = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block0);
      transition_in(if_block1);
      transition_in(if_block2);
      current = true;
    },
    o(local) {
      transition_out(if_block0);
      transition_out(if_block1);
      transition_out(if_block2);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(if_block0_anchor);
        detach(if_block1_anchor);
        detach(if_block2_anchor);
      }
      if (if_block0) if_block0.d(detaching);
      if (if_block1) if_block1.d(detaching);
      if (if_block2) if_block2.d(detaching);
    }
  };
}
function create_if_block_14(ctx) {
  let h2;
  let div2;
  let div0;
  let t1;
  let div0_class_value;
  let div1;
  let iconselect;
  let updating_value;
  let current;
  function iconselect_value_binding_1(value) {
    ctx[34](value);
  }
  let iconselect_props = {
    class: "icon-select",
    active: (
      /*subClassProp*/
      ctx[18]
    ),
    options: (
      /*subclasses*/
      ctx[7]
    ),
    placeHolder: (
      /*subclassesPlaceholder*/
      ctx[20]
    ),
    handler: (
      /*handleSelectSubClass*/
      ctx[25]
    ),
    id: "subClass-select",
    truncateWidth: "17"
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
      h2 = element("h2");
      h2.textContent = `${localize$1("SubClass")}`;
      div2 = element("div");
      div0 = element("div");
      t1 = text("*");
      div1 = element("div");
      create_component(iconselect.$$.fragment);
      attr(h2, "class", "left");
      attr(div0, "class", div0_class_value = "flex0 required " + /*$characterSubClass*/
      (ctx[1] ? "" : "active"));
      attr(div1, "class", "flex3");
      attr(div2, "class", "flexrow");
    },
    m(target, anchor) {
      insert(target, h2, anchor);
      insert(target, div2, anchor);
      append(div2, div0);
      append(div0, t1);
      append(div2, div1);
      mount_component(iconselect, div1, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (!current || dirty[0] & /*$characterSubClass*/
      2 && div0_class_value !== (div0_class_value = "flex0 required " + /*$characterSubClass*/
      (ctx2[1] ? "" : "active"))) {
        attr(div0, "class", div0_class_value);
      }
      const iconselect_changes = {};
      if (dirty[0] & /*subClassProp*/
      262144) iconselect_changes.active = /*subClassProp*/
      ctx2[18];
      if (dirty[0] & /*subclasses*/
      128) iconselect_changes.options = /*subclasses*/
      ctx2[7];
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
        detach(h2);
        detach(div2);
      }
      destroy_component(iconselect);
    }
  };
}
function create_if_block_13(ctx) {
  let h2;
  let div1;
  let div0;
  let tjsselect;
  let current;
  tjsselect = new TJSSelect({
    props: {
      options: (
        /*levelOptions*/
        ctx[21]
      ),
      store: level,
      styles: (
        /*selectStyles*/
        ctx[22]
      )
    }
  });
  tjsselect.$on(
    "change",
    /*levelSelectHandler*/
    ctx[23]
  );
  return {
    c() {
      h2 = element("h2");
      h2.textContent = `${localize$1("Tabs.Classes.FilterByLevel")}`;
      div1 = element("div");
      div0 = element("div");
      create_component(tjsselect.$$.fragment);
      attr(h2, "class", "left");
      attr(div0, "class", "flex2 left");
      attr(div1, "class", "flexrow");
    },
    m(target, anchor) {
      insert(target, h2, anchor);
      insert(target, div1, anchor);
      append(div1, div0);
      mount_component(tjsselect, div0, null);
      current = true;
    },
    p: noop,
    i(local) {
      if (current) return;
      transition_in(tjsselect.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(tjsselect.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(h2);
        detach(div1);
      }
      destroy_component(tjsselect);
    }
  };
}
function create_if_block_7(ctx) {
  let h3;
  let div0;
  let if_block0_anchor;
  let div1;
  let div2;
  let t3_value = localize$1("Level") + "";
  let t3;
  let t4;
  let t5;
  let ul;
  let if_block2_anchor;
  let if_block3_anchor;
  let current;
  let mounted;
  let dispose;
  let if_block0 = (
    /*classAdvancementExpanded*/
    ctx[9] && create_if_block_12()
  );
  let if_block1 = !/*classAdvancementExpanded*/
  ctx[9] && create_if_block_11();
  let if_block2 = !/*classAdvancementArrayFiltered*/
  ctx[8].length && !/*classGetsSubclassThisLevel*/
  ctx[14] && create_if_block_10();
  let if_block3 = !/*classAdvancementArrayFiltered*/
  ctx[8].length && /*classGetsSubclassThisLevel*/
  ctx[14] && /*classAdvancementExpanded*/
  ctx[9] && create_if_block_9();
  let if_block4 = (
    /*classAdvancementArrayFiltered*/
    ctx[8].length && /*classAdvancementExpanded*/
    ctx[9] && create_if_block_8(ctx)
  );
  return {
    c() {
      h3 = element("h3");
      div0 = element("div");
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      div1 = element("div");
      div1.textContent = `${localize$1("Tabs.Classes.Class")} ${localize$1("Advancements")}`;
      div2 = element("div");
      t3 = text(t3_value);
      t4 = space();
      t5 = text(
        /*$level*/
        ctx[3]
      );
      ul = element("ul");
      if (if_block2) if_block2.c();
      if_block2_anchor = empty();
      if (if_block3) if_block3.c();
      if_block3_anchor = empty();
      if (if_block4) if_block4.c();
      attr(div0, "class", "flex0");
      attr(div1, "class", "flex");
      attr(div2, "class", "flex0 div badge right inset ml-sm mb-xs svelte-gas-1892t55");
      attr(h3, "class", "left mt-sm flexrow");
      attr(ul, "class", "icon-list");
    },
    m(target, anchor) {
      insert(target, h3, anchor);
      append(h3, div0);
      if (if_block0) if_block0.m(div0, null);
      append(div0, if_block0_anchor);
      if (if_block1) if_block1.m(div0, null);
      append(h3, div1);
      append(h3, div2);
      append(div2, t3);
      append(div2, t4);
      append(div2, t5);
      insert(target, ul, anchor);
      if (if_block2) if_block2.m(ul, null);
      append(ul, if_block2_anchor);
      if (if_block3) if_block3.m(ul, null);
      append(ul, if_block3_anchor);
      if (if_block4) if_block4.m(ul, null);
      current = true;
      if (!mounted) {
        dispose = listen(
          div0,
          "click",
          /*toggleClassAdvancements*/
          ctx[26]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (
        /*classAdvancementExpanded*/
        ctx2[9]
      ) {
        if (if_block0) ;
        else {
          if_block0 = create_if_block_12();
          if_block0.c();
          if_block0.m(div0, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (!/*classAdvancementExpanded*/
      ctx2[9]) {
        if (if_block1) ;
        else {
          if_block1 = create_if_block_11();
          if_block1.c();
          if_block1.m(div0, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (!current || dirty[0] & /*$level*/
      8) set_data(
        t5,
        /*$level*/
        ctx2[3]
      );
      if (!/*classAdvancementArrayFiltered*/
      ctx2[8].length && !/*classGetsSubclassThisLevel*/
      ctx2[14]) {
        if (if_block2) ;
        else {
          if_block2 = create_if_block_10();
          if_block2.c();
          if_block2.m(ul, if_block2_anchor);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (!/*classAdvancementArrayFiltered*/
      ctx2[8].length && /*classGetsSubclassThisLevel*/
      ctx2[14] && /*classAdvancementExpanded*/
      ctx2[9]) {
        if (if_block3) ;
        else {
          if_block3 = create_if_block_9();
          if_block3.c();
          if_block3.m(ul, if_block3_anchor);
        }
      } else if (if_block3) {
        if_block3.d(1);
        if_block3 = null;
      }
      if (
        /*classAdvancementArrayFiltered*/
        ctx2[8].length && /*classAdvancementExpanded*/
        ctx2[9]
      ) {
        if (if_block4) {
          if_block4.p(ctx2, dirty);
          if (dirty[0] & /*classAdvancementArrayFiltered, classAdvancementExpanded*/
          768) {
            transition_in(if_block4, 1);
          }
        } else {
          if_block4 = create_if_block_8(ctx2);
          if_block4.c();
          transition_in(if_block4, 1);
          if_block4.m(ul, null);
        }
      } else if (if_block4) {
        group_outros();
        transition_out(if_block4, 1, 1, () => {
          if_block4 = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block4);
      current = true;
    },
    o(local) {
      transition_out(if_block4);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(h3);
        detach(ul);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      if (if_block2) if_block2.d();
      if (if_block3) if_block3.d();
      if (if_block4) if_block4.d();
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_12(ctx) {
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
function create_if_block_11(ctx) {
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
function create_if_block_10(ctx) {
  let li;
  return {
    c() {
      li = element("li");
      li.textContent = `${localize$1("NoAdvancements")}`;
      attr(li, "class", "left");
    },
    m(target, anchor) {
      insert(target, li, anchor);
    },
    d(detaching) {
      if (detaching) {
        detach(li);
      }
    }
  };
}
function create_if_block_9(ctx) {
  let li;
  let div2;
  let div0;
  let div1;
  return {
    c() {
      li = element("li");
      div2 = element("div");
      div0 = element("div");
      div0.innerHTML = `<img class="icon" src="systems/dnd5e/icons/svg/items/subclass.svg" alt="${localize$1("AltText.Subclass")}"/>`;
      div1 = element("div");
      div1.textContent = `${localize$1("SubClass")}`;
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow");
      attr(li, "class", "left");
    },
    m(target, anchor) {
      insert(target, li, anchor);
      append(li, div2);
      append(div2, div0);
      append(div2, div1);
    },
    d(detaching) {
      if (detaching) {
        detach(li);
      }
    }
  };
}
function create_if_block_8(ctx) {
  let each_1_anchor;
  let current;
  let each_value_1 = ensure_array_like(
    /*classAdvancementArrayFiltered*/
    ctx[8]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
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
      if (dirty[0] & /*classAdvancementArrayFiltered, classAdvancementComponents*/
      65792) {
        each_value_1 = ensure_array_like(
          /*classAdvancementArrayFiltered*/
          ctx2[8]
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
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        group_outros();
        for (i = each_value_1.length; i < each_blocks.length; i += 1) {
          out(i);
        }
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      for (let i = 0; i < each_value_1.length; i += 1) {
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
function create_each_block_1(ctx) {
  let li;
  let div2;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div1;
  let t_1_value = (
    /*advancement*/
    ctx[47].title + ""
  );
  let t_1;
  let div2_data_tooltip_value;
  let div3;
  let switch_instance;
  let li_data_type_value;
  let current;
  var switch_value = (
    /*classAdvancementComponents*/
    ctx[16][
      /*advancement*/
      ctx[47].type
    ]
  );
  function switch_props(ctx2, dirty) {
    return {
      props: { advancement: (
        /*advancement*/
        ctx2[47]
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
      ctx[47].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[47].title);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow");
      attr(div2, "data-tooltip", div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx[47]
      ));
      attr(div2, "data-tooltip-class", "gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip");
      attr(div3, "class", "flexrow");
      attr(li, "class", "left");
      attr(li, "data-type", li_data_type_value = /*advancement*/
      ctx[47].type);
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
      if (!current || dirty[0] & /*classAdvancementArrayFiltered*/
      256 && !src_url_equal(img.src, img_src_value = /*advancement*/
      ctx2[47].icon)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty[0] & /*classAdvancementArrayFiltered*/
      256 && img_alt_value !== (img_alt_value = /*advancement*/
      ctx2[47].title)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty[0] & /*classAdvancementArrayFiltered*/
      256) && t_1_value !== (t_1_value = /*advancement*/
      ctx2[47].title + "")) set_data(t_1, t_1_value);
      if (!current || dirty[0] & /*classAdvancementArrayFiltered*/
      256 && div2_data_tooltip_value !== (div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx2[47]
      ))) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
      if (dirty[0] & /*classAdvancementComponents, classAdvancementArrayFiltered*/
      65792 && switch_value !== (switch_value = /*classAdvancementComponents*/
      ctx2[16][
        /*advancement*/
        ctx2[47].type
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
        if (dirty[0] & /*classAdvancementArrayFiltered*/
        256) switch_instance_changes.advancement = /*advancement*/
        ctx2[47];
        switch_instance.$set(switch_instance_changes);
      }
      if (!current || dirty[0] & /*classAdvancementArrayFiltered*/
      256 && li_data_type_value !== (li_data_type_value = /*advancement*/
      ctx2[47].type)) {
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
  let if_block_anchor;
  let current;
  let if_block = (
    /*subClassAdvancementArrayFiltered*/
    ctx[10].length && create_if_block_1(ctx)
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
        ctx2[10].length
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*subClassAdvancementArrayFiltered*/
          1024) {
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
  let h2;
  let div0;
  let if_block0_anchor;
  let div1;
  let div2;
  let t3_value = localize$1("Level") + "";
  let t3;
  let t4;
  let t5;
  let ul;
  let if_block2_anchor;
  let current;
  let mounted;
  let dispose;
  let if_block0 = (
    /*subClassAdvancementExpanded*/
    ctx[11] && create_if_block_5()
  );
  let if_block1 = !/*subClassAdvancementExpanded*/
  ctx[11] && create_if_block_4();
  let if_block2 = !/*subClassAdvancementArrayFiltered*/
  ctx[10].length && create_if_block_3();
  let if_block3 = (
    /*subClassAdvancementArrayFiltered*/
    ctx[10].length && /*subClassAdvancementExpanded*/
    ctx[11] && create_if_block_2(ctx)
  );
  return {
    c() {
      h2 = element("h2");
      div0 = element("div");
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      div1 = element("div");
      div1.textContent = `${localize$1("Tabs.Classes.SubClass")} ${localize$1("Advancements")}`;
      div2 = element("div");
      t3 = text(t3_value);
      t4 = space();
      t5 = text(
        /*$level*/
        ctx[3]
      );
      ul = element("ul");
      if (if_block2) if_block2.c();
      if_block2_anchor = empty();
      if (if_block3) if_block3.c();
      attr(div0, "class", "flex0 pointer");
      attr(div1, "class", "flex");
      attr(div2, "class", "flex0 div badge right inset ml-sm mb-xs svelte-gas-1892t55");
      attr(h2, "class", "left mt-sm flexrow");
      attr(ul, "class", "icon-list");
    },
    m(target, anchor) {
      insert(target, h2, anchor);
      append(h2, div0);
      if (if_block0) if_block0.m(div0, null);
      append(div0, if_block0_anchor);
      if (if_block1) if_block1.m(div0, null);
      append(h2, div1);
      append(h2, div2);
      append(div2, t3);
      append(div2, t4);
      append(div2, t5);
      insert(target, ul, anchor);
      if (if_block2) if_block2.m(ul, null);
      append(ul, if_block2_anchor);
      if (if_block3) if_block3.m(ul, null);
      current = true;
      if (!mounted) {
        dispose = listen(
          div0,
          "click",
          /*toggleSubClassAdvancements*/
          ctx[27]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (
        /*subClassAdvancementExpanded*/
        ctx2[11]
      ) {
        if (if_block0) ;
        else {
          if_block0 = create_if_block_5();
          if_block0.c();
          if_block0.m(div0, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (!/*subClassAdvancementExpanded*/
      ctx2[11]) {
        if (if_block1) ;
        else {
          if_block1 = create_if_block_4();
          if_block1.c();
          if_block1.m(div0, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (!current || dirty[0] & /*$level*/
      8) set_data(
        t5,
        /*$level*/
        ctx2[3]
      );
      if (!/*subClassAdvancementArrayFiltered*/
      ctx2[10].length) {
        if (if_block2) ;
        else {
          if_block2 = create_if_block_3();
          if_block2.c();
          if_block2.m(ul, if_block2_anchor);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (
        /*subClassAdvancementArrayFiltered*/
        ctx2[10].length && /*subClassAdvancementExpanded*/
        ctx2[11]
      ) {
        if (if_block3) {
          if_block3.p(ctx2, dirty);
          if (dirty[0] & /*subClassAdvancementArrayFiltered, subClassAdvancementExpanded*/
          3072) {
            transition_in(if_block3, 1);
          }
        } else {
          if_block3 = create_if_block_2(ctx2);
          if_block3.c();
          transition_in(if_block3, 1);
          if_block3.m(ul, null);
        }
      } else if (if_block3) {
        group_outros();
        transition_out(if_block3, 1, 1, () => {
          if_block3 = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block3);
      current = true;
    },
    o(local) {
      transition_out(if_block3);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(h2);
        detach(ul);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      if (if_block2) if_block2.d();
      if (if_block3) if_block3.d();
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_5(ctx) {
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
function create_if_block_4(ctx) {
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
function create_if_block_3(ctx) {
  let li;
  return {
    c() {
      li = element("li");
      li.textContent = `${localize$1("NoAdvancements")}`;
      attr(li, "class", "left");
    },
    m(target, anchor) {
      insert(target, li, anchor);
    },
    d(detaching) {
      if (detaching) {
        detach(li);
      }
    }
  };
}
function create_if_block_2(ctx) {
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
      33792) {
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
function create_each_block(ctx) {
  let li;
  let div2;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div1;
  let t_1_value = (
    /*advancement*/
    ctx[47].title + ""
  );
  let t_1;
  let div2_data_tooltip_value;
  let div3;
  let switch_instance;
  let li_data_type_value;
  let current;
  var switch_value = (
    /*subClassAdvancementComponents*/
    ctx[15][
      /*advancement*/
      ctx[47].type
    ]
  );
  function switch_props(ctx2, dirty) {
    return {
      props: { advancement: (
        /*advancement*/
        ctx2[47]
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
      ctx[47].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[47].title);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow");
      attr(div2, "data-tooltip", div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx[47]
      ));
      attr(div2, "data-tooltip-locked", "true");
      attr(div2, "data-tooltip-class", "gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip");
      attr(div3, "class", "flexrow");
      attr(li, "class", "left");
      attr(li, "data-type", li_data_type_value = /*advancement*/
      ctx[47].type);
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
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      1024 && !src_url_equal(img.src, img_src_value = /*advancement*/
      ctx2[47].icon)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      1024 && img_alt_value !== (img_alt_value = /*advancement*/
      ctx2[47].title)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      1024) && t_1_value !== (t_1_value = /*advancement*/
      ctx2[47].title + "")) set_data(t_1, t_1_value);
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      1024 && div2_data_tooltip_value !== (div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx2[47]
      ))) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
      if (dirty[0] & /*subClassAdvancementComponents, subClassAdvancementArrayFiltered*/
      33792 && switch_value !== (switch_value = /*subClassAdvancementComponents*/
      ctx2[15][
        /*advancement*/
        ctx2[47].type
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
        ctx2[47];
        switch_instance.$set(switch_instance_changes);
      }
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      1024 && li_data_type_value !== (li_data_type_value = /*advancement*/
      ctx2[47].type)) {
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
function create_left_slot(ctx) {
  let div3;
  let div2;
  let div0;
  let t_1;
  let div0_class_value;
  let div1;
  let iconselect;
  let updating_value;
  let if_block0_anchor;
  let current;
  function iconselect_value_binding(value) {
    ctx[33](value);
  }
  let iconselect_props = {
    class: "icon-select",
    active: (
      /*classProp*/
      ctx[17]
    ),
    options: (
      /*filteredClassIndex*/
      ctx[12]
    ),
    placeHolder: (
      /*classesPlaceholder*/
      ctx[19]
    ),
    handler: (
      /*handleSelectClass*/
      ctx[24]
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
  let if_block0 = (
    /*$characterClass*/
    ctx[2] && create_if_block_6(ctx)
  );
  let if_block1 = (
    /*subclasses*/
    ctx[7].length && create_if_block(ctx)
  );
  return {
    c() {
      div3 = element("div");
      div2 = element("div");
      div0 = element("div");
      t_1 = text("*");
      div1 = element("div");
      create_component(iconselect.$$.fragment);
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      attr(div0, "class", div0_class_value = "flex0 required " + /*$characterClass*/
      (ctx[2] ? "" : "active"));
      attr(div1, "class", "flex3");
      attr(div2, "class", "flexrow");
      attr(div3, "slot", "left");
    },
    m(target, anchor) {
      insert(target, div3, anchor);
      append(div3, div2);
      append(div2, div0);
      append(div0, t_1);
      append(div2, div1);
      mount_component(iconselect, div1, null);
      if (if_block0) if_block0.m(div3, null);
      append(div3, if_block0_anchor);
      if (if_block1) if_block1.m(div3, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (!current || dirty[0] & /*$characterClass*/
      4 && div0_class_value !== (div0_class_value = "flex0 required " + /*$characterClass*/
      (ctx2[2] ? "" : "active"))) {
        attr(div0, "class", div0_class_value);
      }
      const iconselect_changes = {};
      if (dirty[0] & /*classProp*/
      131072) iconselect_changes.active = /*classProp*/
      ctx2[17];
      if (dirty[0] & /*filteredClassIndex*/
      4096) iconselect_changes.options = /*filteredClassIndex*/
      ctx2[12];
      if (!updating_value && dirty[0] & /*classValue*/
      32) {
        updating_value = true;
        iconselect_changes.value = /*classValue*/
        ctx2[5];
        add_flush_callback(() => updating_value = false);
      }
      iconselect.$set(iconselect_changes);
      if (
        /*$characterClass*/
        ctx2[2]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty[0] & /*$characterClass*/
          4) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_6(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(div3, if_block0_anchor);
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
        ctx2[7].length
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty[0] & /*subclasses*/
          128) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div3, null);
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
      transition_in(iconselect.$$.fragment, local);
      transition_in(if_block0);
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(iconselect.$$.fragment, local);
      transition_out(if_block0);
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div3);
      }
      destroy_component(iconselect);
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
    }
  };
}
function create_right_slot(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      attr(div, "slot", "right");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      div.innerHTML = /*combinedHtml*/
      ctx[13];
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*combinedHtml*/
      8192) div.innerHTML = /*combinedHtml*/
      ctx2[13];
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_fragment(ctx) {
  let standardtablayout;
  let current;
  standardtablayout = new StandardTabLayout({
    props: {
      title: localize$1("Tabs.Classes.Title"),
      showTitle: true,
      tabName: "class",
      $$slots: {
        right: [create_right_slot],
        left: [create_left_slot]
      },
      $$scope: { ctx }
    }
  });
  return {
    c() {
      create_component(standardtablayout.$$.fragment);
    },
    m(target, anchor) {
      mount_component(standardtablayout, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const standardtablayout_changes = {};
      if (dirty[0] & /*combinedHtml, subClassAdvancementArrayFiltered, subClassAdvancementComponents, subClassAdvancementExpanded, $level, subclasses, classAdvancementArrayFiltered, classAdvancementComponents, classAdvancementExpanded, classGetsSubclassThisLevel, $readOnlyTabs, subClassProp, subclassValue, $characterSubClass, subClassLevel, $characterClass, classProp, filteredClassIndex, classValue*/
      524287 | dirty[1] & /*$$scope*/
      2097152) {
        standardtablayout_changes.$$scope = { dirty, ctx: ctx2 };
      }
      standardtablayout.$set(standardtablayout_changes);
    },
    i(local) {
      if (current) return;
      transition_in(standardtablayout.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(standardtablayout.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(standardtablayout, detaching);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let subClassProp;
  let classProp;
  let classAdvancementComponents;
  let subClassAdvancementComponents;
  let subClassLevel;
  let classGetsSubclassThisLevel;
  let combinedHtml;
  let $characterSubClass;
  let $characterClass;
  let $level;
  let $readOnlyTabs;
  let $subClassesForClass;
  component_subscribe($$self, characterSubClass, ($$value) => $$invalidate(1, $characterSubClass = $$value));
  component_subscribe($$self, characterClass, ($$value) => $$invalidate(2, $characterClass = $$value));
  component_subscribe($$self, level, ($$value) => $$invalidate(3, $level = $$value));
  component_subscribe($$self, readOnlyTabs, ($$value) => $$invalidate(4, $readOnlyTabs = $$value));
  component_subscribe($$self, subClassesForClass, ($$value) => $$invalidate(37, $subClassesForClass = $$value));
  let richHTML = "", html = "", richSubClassHTML = "", selectedCharacterClass = null, activeSubClass = null, classValue = null, subclassValue = null, subClassesIndex, subclasses, classesPlaceholder = localize$1("Tabs.Classes.Placeholder"), subclassesPlaceholder = localize$1("Tabs.Classes.SubclassPlaceholder"), packs = getPacksFromSettings("classes"), subClassesPacks = getPacksFromSettings("subclasses"), classAdvancementArrayFiltered = [], classAdvancementExpanded = false, subClassAdvancementArrayFiltered = [], subClassAdvancementExpanded = false, mappedClassIndex = extractItemsFromPacksSync(packs, ["name->label", "img", "type", "folder", "uuid->value", "_id"]), filteredClassIndex;
  const showPackLabelInSelect = game.settings.get(MODULE_ID, "showPackLabelInSelect");
  filteredClassIndex = mappedClassIndex.filter((i) => {
    return i.type == "class";
  }).sort((a, b) => a.label.localeCompare(showPackLabelInSelect ? b.compoundLabel : b.label));
  const levelOptions = [];
  for (let i = 1; i <= 20; i++) {
    levelOptions.push({
      label: localize$1("Tabs.Classes.Level") + " " + i,
      value: i
    });
  }
  const selectStyles = {};
  getContext("#doc");
  const levelSelectHandler = async (option) => {
    $$invalidate(32, subClassesIndex = await getFilteredSubclassIndex());
    await tick();
    importClassAdvancements();
    importSubClassAdvancements();
  };
  const getFilteredSubclassIndex = async () => {
    let mappedSubClassIndex = await extractItemsFromPacksAsync(subClassesPacks, ["name->label", "img", "type", "folder", "uuid->value", "_id"], ["system.classIdentifier"]);
    mappedSubClassIndex = mappedSubClassIndex.filter((x) => {
      return x.system?.classIdentifier == $characterClass?.system?.identifier;
    });
    const output = mappedSubClassIndex.flat().sort((a, b) => a.label.localeCompare(showPackLabelInSelect ? b.compoundLabel : b.label));
    return output;
  };
  const handleSelectClass = async (option) => {
    $$invalidate(31, activeSubClass = null);
    set_store_value(characterSubClass, $characterSubClass = null, $characterSubClass);
    $$invalidate(6, subclassValue = null);
    $$invalidate(10, subClassAdvancementArrayFiltered = []);
    $$invalidate(29, richSubClassHTML = "");
    goldRoll.set(0);
    const selectedClass = await fromUuid(option);
    window.GAS.log.d("handleSelectClass", selectedClass);
    set_store_value(characterClass, $characterClass = selectedClass, $characterClass);
    $$invalidate(30, selectedCharacterClass = option);
    if (!classValue) {
      $$invalidate(5, classValue = option);
    }
    clearEquipmentSelections();
    await tick();
    $$invalidate(32, subClassesIndex = await getFilteredSubclassIndex());
    set_store_value(subClassesForClass, $subClassesForClass = subClassesIndex, $subClassesForClass);
    await tick();
    await importClassAdvancements();
    $$invalidate(28, richHTML = await illuminatedDescription(html, $characterClass));
    Hooks.call("gas.richhtmlReady", richHTML);
  };
  const importClassAdvancements = async () => {
    $$invalidate(16, classAdvancementComponents = {});
    for (const classAdvancement of classAdvancementArrayFiltered) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-DZgc-cs-.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-1l35jzYR.js"), "../../../molecules/dnd5e/Advancements/HitPoints.svelte": () => import("./HitPoints-Ce9QWM-g.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-CplKmVNh.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-x83zZerl.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-J8rdu_ox.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-BL4Nv2GG.js"), "../../../molecules/dnd5e/Advancements/Subclass.svelte": () => import("./Subclass-Bb9lf2Pd.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-D84otovF.js") }), `../../../molecules/dnd5e/Advancements/${classAdvancement.type}.svelte`, 7);
        $$invalidate(16, classAdvancementComponents[classAdvancement.type] = module.default, classAdvancementComponents);
        await tick();
      } catch (error) {
        window.GAS.log.e(`Failed to load component for ${classAdvancement.type}:`, error);
      }
    }
  };
  const handleSelectSubClass = async (option) => {
    const selectedSubClass = await fromUuid(option);
    set_store_value(characterSubClass, $characterSubClass = selectedSubClass, $characterSubClass);
    $$invalidate(31, activeSubClass = option);
    if (!subclassValue) {
      $$invalidate(6, subclassValue = option);
    }
    await tick();
    importClassAdvancements();
    importSubClassAdvancements();
    $$invalidate(29, richSubClassHTML = await illuminatedDescription($characterSubClass.system.description.value, $characterSubClass));
  };
  const importSubClassAdvancements = async () => {
    for (const subClassAdvancement of subClassAdvancementArrayFiltered) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-DZgc-cs-.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-1l35jzYR.js"), "../../../molecules/dnd5e/Advancements/HitPoints.svelte": () => import("./HitPoints-Ce9QWM-g.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-CplKmVNh.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-x83zZerl.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-J8rdu_ox.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-BL4Nv2GG.js"), "../../../molecules/dnd5e/Advancements/Subclass.svelte": () => import("./Subclass-Bb9lf2Pd.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-D84otovF.js") }), `../../../molecules/dnd5e/Advancements/${subClassAdvancement.type}.svelte`, 7);
        await tick();
        $$invalidate(15, subClassAdvancementComponents[subClassAdvancement.type] = module.default, subClassAdvancementComponents);
      } catch (error) {
        window.GAS.log.e(`Failed to load component for ${subClassAdvancement.type}:`, error);
      }
    }
  };
  const toggleClassAdvancements = () => {
    $$invalidate(9, classAdvancementExpanded = !classAdvancementExpanded);
  };
  const toggleSubClassAdvancements = () => {
    $$invalidate(11, subClassAdvancementExpanded = !subClassAdvancementExpanded);
  };
  onMount(async () => {
    let classUuid, subclassUuid;
    if (window.GAS.debug) {
      classUuid = window.GAS.characterClass;
      subclassUuid = window.GAS.characterSubClass;
    } else {
      classUuid = $characterClass?.uuid;
      subclassUuid = $characterSubClass?.uuid;
    }
    if (classUuid) {
      await handleSelectClass(classUuid);
    }
    if (subclassUuid) {
      await handleSelectSubClass(subclassUuid);
    }
  });
  function iconselect_value_binding(value) {
    classValue = value;
    $$invalidate(5, classValue);
  }
  function iconselect_value_binding_1(value) {
    subclassValue = value;
    $$invalidate(6, subclassValue);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*$characterClass*/
    4) {
      html = $characterClass?.system?.description.value || "";
    }
    if ($$self.$$.dirty[1] & /*activeSubClass*/
    1) {
      $$invalidate(18, subClassProp = activeSubClass);
    }
    if ($$self.$$.dirty[0] & /*selectedCharacterClass*/
    1073741824) {
      $$invalidate(17, classProp = selectedCharacterClass);
    }
    if ($$self.$$.dirty[0] & /*$characterClass*/
    4) {
      $$invalidate(0, subClassLevel = $characterClass ? getSubclassLevel($characterClass, MODULE_ID) : false);
    }
    if ($$self.$$.dirty[0] & /*subClassLevel, $level*/
    9) {
      $$invalidate(14, classGetsSubclassThisLevel = subClassLevel && subClassLevel === $level);
    }
    if ($$self.$$.dirty[0] & /*$characterClass, richHTML, richSubClassHTML*/
    805306372) {
      $$invalidate(13, combinedHtml = $characterClass ? `
      ${richHTML}
      ${richSubClassHTML ? `<h1>${localize$1("SubClass")}</h1>${richSubClassHTML}` : ""}
  ` : "");
    }
    if ($$self.$$.dirty[1] & /*subClassesIndex*/
    2) {
      if (subClassesIndex?.length) {
        $$invalidate(7, subclasses = subClassesIndex.flat().sort((a, b) => a.label.localeCompare(b.label)));
      } else {
        $$invalidate(7, subclasses = []);
      }
    }
    if ($$self.$$.dirty[0] & /*$readOnlyTabs*/
    16) {
      if ($readOnlyTabs.includes("class")) {
        $$invalidate(9, classAdvancementExpanded = true);
      }
    }
    if ($$self.$$.dirty[0] & /*$characterSubClass, $level*/
    10) {
      if ($characterSubClass?.system?.advancement.length) {
        $$invalidate(10, subClassAdvancementArrayFiltered = $characterSubClass.system.advancement.filter((value) => value.level === $level));
      } else {
        $$invalidate(10, subClassAdvancementArrayFiltered = []);
      }
    }
    if ($$self.$$.dirty[0] & /*$characterClass, $level*/
    12) {
      if ($characterClass?.system?.advancement.length) {
        $$invalidate(8, classAdvancementArrayFiltered = $characterClass.system.advancement.filter((value) => value.level === $level));
      } else {
        $$invalidate(8, classAdvancementArrayFiltered = []);
      }
    }
  };
  $$invalidate(16, classAdvancementComponents = {});
  $$invalidate(15, subClassAdvancementComponents = {});
  return [
    subClassLevel,
    $characterSubClass,
    $characterClass,
    $level,
    $readOnlyTabs,
    classValue,
    subclassValue,
    subclasses,
    classAdvancementArrayFiltered,
    classAdvancementExpanded,
    subClassAdvancementArrayFiltered,
    subClassAdvancementExpanded,
    filteredClassIndex,
    combinedHtml,
    classGetsSubclassThisLevel,
    subClassAdvancementComponents,
    classAdvancementComponents,
    classProp,
    subClassProp,
    classesPlaceholder,
    subclassesPlaceholder,
    levelOptions,
    selectStyles,
    levelSelectHandler,
    handleSelectClass,
    handleSelectSubClass,
    toggleClassAdvancements,
    toggleSubClassAdvancements,
    richHTML,
    richSubClassHTML,
    selectedCharacterClass,
    activeSubClass,
    subClassesIndex,
    iconselect_value_binding,
    iconselect_value_binding_1
  ];
}
class Class extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);
  }
}
export {
  Class as default
};
//# sourceMappingURL=Class-CfAa7Ttf.js.map
