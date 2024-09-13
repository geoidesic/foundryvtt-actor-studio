import { S as SvelteComponent, i as init, s as safe_not_equal, C as binding_callbacks, D as bind, e as element, F as text, u as create_component, b as attr, c as insert, d as append, v as mount_component, E as add_flush_callback, h as transition_in, g as group_outros, t as transition_out, f as check_outros, j as detach, w as destroy_component, k as component_subscribe, N as characterSubClass, O as characterClass, P as level, Q as subClassesForClass, I as getPacksFromSettings, J as extractItemsFromPacks, R as DonationTracker, n as getContext, o as onMount, q as tick, l as localize, T as TJSSelect, a as empty, U as space, G as set_data, V as extractMapIteratorObjectProperties, y as set_store_value, _ as __variableDynamicImportRuntimeHelper, z as ensure_array_like, B as destroy_each, A as noop, r as construct_svelte_component, K as src_url_equal, L as getAdvancementValue } from "./index-BdpqQ5ZZ.js";
import { I as IconSelect } from "./IconSelect-C-Eq81ys.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[38] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[38] = list[i];
  return child_ctx;
}
function create_if_block(ctx) {
  let h3;
  let div1;
  let div0;
  let tjsselect;
  let if_block1_anchor;
  let if_block2_anchor;
  let current;
  let if_block0 = (
    /*subclasses*/
    ctx[5].length && create_if_block_6(ctx)
  );
  tjsselect = new TJSSelect({
    props: {
      options: (
        /*levelOptions*/
        ctx[16]
      ),
      store: level,
      styles: (
        /*selectStyles*/
        ctx[17]
      )
    }
  });
  tjsselect.$on(
    "change",
    /*levelSelectHandler*/
    ctx[18]
  );
  let if_block1 = (
    /*classAdvancementArrayFiltered*/
    ctx[6] && create_if_block_4(ctx)
  );
  let if_block2 = (
    /*subclasses*/
    ctx[5].length && create_if_block_1(ctx)
  );
  return {
    c() {
      if (if_block0) if_block0.c();
      h3 = element("h3");
      h3.textContent = `${localize("GAS.Tabs.Classes.FilterByLevel")}`;
      div1 = element("div");
      div0 = element("div");
      create_component(tjsselect.$$.fragment);
      if (if_block1) if_block1.c();
      if_block1_anchor = empty();
      if (if_block2) if_block2.c();
      if_block2_anchor = empty();
      attr(h3, "class", "left mt-sm");
      attr(div0, "class", "flex2 left");
      attr(div1, "class", "flexrow svelte-gas-ahq1lz");
    },
    m(target, anchor) {
      if (if_block0) if_block0.m(target, anchor);
      insert(target, h3, anchor);
      insert(target, div1, anchor);
      append(div1, div0);
      mount_component(tjsselect, div0, null);
      if (if_block1) if_block1.m(target, anchor);
      insert(target, if_block1_anchor, anchor);
      if (if_block2) if_block2.m(target, anchor);
      insert(target, if_block2_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*subclasses*/
        ctx2[5].length
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty[0] & /*subclasses*/
          32) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_6(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(h3.parentNode, h3);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (
        /*classAdvancementArrayFiltered*/
        ctx2[6]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty[0] & /*classAdvancementArrayFiltered*/
          64) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_4(ctx2);
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
        /*subclasses*/
        ctx2[5].length
      ) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
          if (dirty[0] & /*subclasses*/
          32) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block_1(ctx2);
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
      transition_in(tjsselect.$$.fragment, local);
      transition_in(if_block1);
      transition_in(if_block2);
      current = true;
    },
    o(local) {
      transition_out(if_block0);
      transition_out(tjsselect.$$.fragment, local);
      transition_out(if_block1);
      transition_out(if_block2);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(h3);
        detach(div1);
        detach(if_block1_anchor);
        detach(if_block2_anchor);
      }
      if (if_block0) if_block0.d(detaching);
      destroy_component(tjsselect);
      if (if_block1) if_block1.d(detaching);
      if (if_block2) if_block2.d(detaching);
    }
  };
}
function create_if_block_6(ctx) {
  let h3;
  let div2;
  let div0;
  let t1;
  let div0_class_value;
  let div1;
  let iconselect;
  let updating_value;
  let current;
  function iconselect_value_binding_1(value) {
    ctx[27](value);
  }
  let iconselect_props = {
    class: "icon-select",
    active: (
      /*subClassProp*/
      ctx[12]
    ),
    options: (
      /*subclasses*/
      ctx[5]
    ),
    placeHolder: (
      /*subclassesPlaceholder*/
      ctx[14]
    ),
    handler: (
      /*selectSubClassHandler*/
      ctx[20]
    ),
    id: "subClass-select",
    truncateWidth: "17"
  };
  if (
    /*subclassValue*/
    ctx[4] !== void 0
  ) {
    iconselect_props.value = /*subclassValue*/
    ctx[4];
  }
  iconselect = new IconSelect({ props: iconselect_props });
  binding_callbacks.push(() => bind(iconselect, "value", iconselect_value_binding_1));
  return {
    c() {
      h3 = element("h3");
      h3.textContent = `${localize("GAS.SubClass")}`;
      div2 = element("div");
      div0 = element("div");
      t1 = text("*");
      div1 = element("div");
      create_component(iconselect.$$.fragment);
      attr(h3, "class", "left mt-md");
      attr(div0, "class", div0_class_value = "flex0 required " + /*$characterSubClass*/
      (ctx[0] ? "" : "active"));
      attr(div1, "class", "flex3");
      attr(div2, "class", "flexrow svelte-gas-ahq1lz");
    },
    m(target, anchor) {
      insert(target, h3, anchor);
      insert(target, div2, anchor);
      append(div2, div0);
      append(div0, t1);
      append(div2, div1);
      mount_component(iconselect, div1, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (!current || dirty[0] & /*$characterSubClass*/
      1 && div0_class_value !== (div0_class_value = "flex0 required " + /*$characterSubClass*/
      (ctx2[0] ? "" : "active"))) {
        attr(div0, "class", div0_class_value);
      }
      const iconselect_changes = {};
      if (dirty[0] & /*subClassProp*/
      4096) iconselect_changes.active = /*subClassProp*/
      ctx2[12];
      if (dirty[0] & /*subclasses*/
      32) iconselect_changes.options = /*subclasses*/
      ctx2[5];
      if (!updating_value && dirty[0] & /*subclassValue*/
      16) {
        updating_value = true;
        iconselect_changes.value = /*subclassValue*/
        ctx2[4];
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
        detach(div2);
      }
      destroy_component(iconselect);
    }
  };
}
function create_if_block_4(ctx) {
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
  const if_block_creators = [create_if_block_5, create_else_block_1];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (!/*classAdvancementArrayFiltered*/
    ctx2[6].length) return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      h3 = element("h3");
      div0 = element("div");
      div0.textContent = `${localize("GAS.Tabs.Classes.Class")} ${localize("GAS.Advancements")}`;
      div1 = element("div");
      t3 = text(t3_value);
      t4 = space();
      t5 = text(
        /*$level*/
        ctx[2]
      );
      ul = element("ul");
      if_block.c();
      attr(div0, "class", "flex");
      attr(div1, "class", "flex0 div badge right inset ml-sm mb-xs svelte-gas-ahq1lz");
      attr(h3, "class", "left mt-sm flexrow svelte-gas-ahq1lz");
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
      if (!current || dirty[0] & /*$level*/
      4) set_data(
        t5,
        /*$level*/
        ctx2[2]
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
function create_else_block_1(ctx) {
  let each_1_anchor;
  let current;
  let each_value_1 = ensure_array_like(
    /*classAdvancementArrayFiltered*/
    ctx[6]
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
      576) {
        each_value_1 = ensure_array_like(
          /*classAdvancementArrayFiltered*/
          ctx2[6]
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
function create_if_block_5(ctx) {
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
function create_each_block_1(ctx) {
  let li;
  let div2;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div1;
  let t_value = (
    /*advancement*/
    ctx[38].title + ""
  );
  let t;
  let div2_data_tooltip_value;
  let div3;
  let switch_instance;
  let li_data_type_value;
  let current;
  var switch_value = (
    /*classAdvancementComponents*/
    ctx[9][
      /*advancement*/
      ctx[38].type
    ]
  );
  function switch_props(ctx2, dirty) {
    return {
      props: { advancement: (
        /*advancement*/
        ctx2[38]
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
      ctx[38].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[38].title);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow svelte-gas-ahq1lz");
      attr(div2, "data-tooltip", div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx[38]
      ));
      attr(div2, "data-tooltip-class", "gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip");
      attr(div3, "class", "flexrow svelte-gas-ahq1lz");
      attr(li, "class", "left");
      attr(li, "data-type", li_data_type_value = /*advancement*/
      ctx[38].type);
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
      if (!current || dirty[0] & /*classAdvancementArrayFiltered*/
      64 && !src_url_equal(img.src, img_src_value = /*advancement*/
      ctx2[38].icon)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty[0] & /*classAdvancementArrayFiltered*/
      64 && img_alt_value !== (img_alt_value = /*advancement*/
      ctx2[38].title)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty[0] & /*classAdvancementArrayFiltered*/
      64) && t_value !== (t_value = /*advancement*/
      ctx2[38].title + "")) set_data(t, t_value);
      if (!current || dirty[0] & /*classAdvancementArrayFiltered*/
      64 && div2_data_tooltip_value !== (div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx2[38]
      ))) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
      if (dirty[0] & /*classAdvancementComponents, classAdvancementArrayFiltered*/
      576 && switch_value !== (switch_value = /*classAdvancementComponents*/
      ctx2[9][
        /*advancement*/
        ctx2[38].type
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
        64) switch_instance_changes.advancement = /*advancement*/
        ctx2[38];
        switch_instance.$set(switch_instance_changes);
      }
      if (!current || dirty[0] & /*classAdvancementArrayFiltered*/
      64 && li_data_type_value !== (li_data_type_value = /*advancement*/
      ctx2[38].type)) {
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
function create_if_block_1(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*subClassAdvancementArrayFiltered*/
    ctx[7] && create_if_block_2(ctx)
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
        ctx2[7]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*subClassAdvancementArrayFiltered*/
          128) {
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
    ctx2[7].length) return 0;
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
        /*$level*/
        ctx[2]
      );
      ul = element("ul");
      if_block.c();
      attr(div0, "class", "flex");
      attr(div1, "class", "flex0 div badge right inset ml-sm mb-xs svelte-gas-ahq1lz");
      attr(h3, "class", "left mt-sm flexrow svelte-gas-ahq1lz");
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
      if (!current || dirty[0] & /*$level*/
      4) set_data(
        t5,
        /*$level*/
        ctx2[2]
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
    ctx[7]
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
      384) {
        each_value = ensure_array_like(
          /*subClassAdvancementArrayFiltered*/
          ctx2[7]
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
    ctx[38].title + ""
  );
  let t;
  let div2_data_tooltip_value;
  let div3;
  let switch_instance;
  let li_data_type_value;
  let current;
  var switch_value = (
    /*subClassAdvancementComponents*/
    ctx[8][
      /*advancement*/
      ctx[38].type
    ]
  );
  function switch_props(ctx2, dirty) {
    return {
      props: { advancement: (
        /*advancement*/
        ctx2[38]
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
      ctx[38].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[38].title);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow svelte-gas-ahq1lz");
      attr(div2, "data-tooltip", div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx[38]
      ));
      attr(div2, "data-tooltip-locked", "true");
      attr(div2, "data-tooltip-class", "gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip");
      attr(div3, "class", "flexrow svelte-gas-ahq1lz");
      attr(li, "class", "left");
      attr(li, "data-type", li_data_type_value = /*advancement*/
      ctx[38].type);
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
      128 && !src_url_equal(img.src, img_src_value = /*advancement*/
      ctx2[38].icon)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      128 && img_alt_value !== (img_alt_value = /*advancement*/
      ctx2[38].title)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      128) && t_value !== (t_value = /*advancement*/
      ctx2[38].title + "")) set_data(t, t_value);
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      128 && div2_data_tooltip_value !== (div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx2[38]
      ))) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
      if (dirty[0] & /*subClassAdvancementComponents, subClassAdvancementArrayFiltered*/
      384 && switch_value !== (switch_value = /*subClassAdvancementComponents*/
      ctx2[8][
        /*advancement*/
        ctx2[38].type
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
        128) switch_instance_changes.advancement = /*advancement*/
        ctx2[38];
        switch_instance.$set(switch_instance_changes);
      }
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      128 && li_data_type_value !== (li_data_type_value = /*advancement*/
      ctx2[38].type)) {
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
  let div7;
  let div6;
  let div3;
  let div2;
  let div0;
  let t;
  let div0_class_value;
  let div1;
  let iconselect;
  let updating_value;
  let div4;
  let div5;
  let current;
  function iconselect_value_binding(value) {
    ctx[26](value);
  }
  let iconselect_props = {
    class: "icon-select",
    active: (
      /*classProp*/
      ctx[11]
    ),
    options: (
      /*filteredClassIndex*/
      ctx[15]
    ),
    placeHolder: (
      /*classesPlaceholder*/
      ctx[13]
    ),
    handler: (
      /*selectClassHandler*/
      ctx[19]
    ),
    id: "characterClass-select"
  };
  if (
    /*classValue*/
    ctx[3] !== void 0
  ) {
    iconselect_props.value = /*classValue*/
    ctx[3];
  }
  iconselect = new IconSelect({ props: iconselect_props });
  binding_callbacks.push(() => bind(iconselect, "value", iconselect_value_binding));
  let if_block = (
    /*$characterClass*/
    ctx[1] && create_if_block(ctx)
  );
  return {
    c() {
      div7 = element("div");
      div6 = element("div");
      div3 = element("div");
      div2 = element("div");
      div0 = element("div");
      t = text("*");
      div1 = element("div");
      create_component(iconselect.$$.fragment);
      if (if_block) if_block.c();
      div4 = element("div");
      div4.innerHTML = ``;
      div5 = element("div");
      attr(div0, "class", div0_class_value = "flex0 required " + /*$characterClass*/
      (ctx[1] ? "" : "active"));
      attr(div1, "class", "flex3");
      attr(div2, "class", "flexrow svelte-gas-ahq1lz");
      attr(div3, "class", "flex2 pr-sm col-a");
      attr(div4, "class", "flex0 border-right right-border-gradient-mask");
      attr(div5, "class", "flex3 left pl-md scroll col-b");
      attr(div6, "class", "flexrow svelte-gas-ahq1lz");
      attr(div7, "class", "content svelte-gas-ahq1lz");
    },
    m(target, anchor) {
      insert(target, div7, anchor);
      append(div7, div6);
      append(div6, div3);
      append(div3, div2);
      append(div2, div0);
      append(div0, t);
      append(div2, div1);
      mount_component(iconselect, div1, null);
      if (if_block) if_block.m(div3, null);
      append(div6, div4);
      append(div6, div5);
      div5.innerHTML = /*combinedHtml*/
      ctx[10];
      current = true;
    },
    p(ctx2, dirty) {
      if (!current || dirty[0] & /*$characterClass*/
      2 && div0_class_value !== (div0_class_value = "flex0 required " + /*$characterClass*/
      (ctx2[1] ? "" : "active"))) {
        attr(div0, "class", div0_class_value);
      }
      const iconselect_changes = {};
      if (dirty[0] & /*classProp*/
      2048) iconselect_changes.active = /*classProp*/
      ctx2[11];
      if (!updating_value && dirty[0] & /*classValue*/
      8) {
        updating_value = true;
        iconselect_changes.value = /*classValue*/
        ctx2[3];
        add_flush_callback(() => updating_value = false);
      }
      iconselect.$set(iconselect_changes);
      if (
        /*$characterClass*/
        ctx2[1]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*$characterClass*/
          2) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(div3, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
      if (!current || dirty[0] & /*combinedHtml*/
      1024) div5.innerHTML = /*combinedHtml*/
      ctx2[10];
    },
    i(local) {
      if (current) return;
      transition_in(iconselect.$$.fragment, local);
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(iconselect.$$.fragment, local);
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div7);
      }
      destroy_component(iconselect);
      if (if_block) if_block.d();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let subClassProp;
  let classProp;
  let combinedHtml;
  let classAdvancementComponents;
  let subClassAdvancementComponents;
  let $characterSubClass;
  let $characterClass;
  let $level;
  let $subClassesForClass;
  component_subscribe($$self, characterSubClass, ($$value) => $$invalidate(0, $characterSubClass = $$value));
  component_subscribe($$self, characterClass, ($$value) => $$invalidate(1, $characterClass = $$value));
  component_subscribe($$self, level, ($$value) => $$invalidate(2, $level = $$value));
  component_subscribe($$self, subClassesForClass, ($$value) => $$invalidate(29, $subClassesForClass = $$value));
  let richHTML = "", html = "", richSubClassHTML = "", activeClass = null, activeSubClass = null, classValue = null, subclassValue = null, subClassesIndex, subclasses, classesPlaceholder = "Classes", subclassesPlaceholder = "Subclasses", packs = getPacksFromSettings("classes");
  game.packs.get("dnd5e.subclasses");
  let subClassesPacks = getPacksFromSettings("subclasses"), classAdvancementArrayFiltered = [], subClassAdvancementArrayFiltered = [], mappedClassIndex = extractItemsFromPacks(packs, ["name->label", "img", "type", "folder", "uuid->value", "_id"]), filteredClassIndex = mappedClassIndex.filter((i) => {
    return i.type == "class" && DonationTracker.canViewItem(i);
  }).sort((a, b) => a.label.localeCompare(b.label));
  const levelOptions = [];
  for (let i = 1; i <= 20; i++) {
    levelOptions.push({ label: "Level " + i, value: i });
  }
  const selectStyles = {};
  getContext("#doc");
  const levelSelectHandler = async (option) => {
    $$invalidate(25, subClassesIndex = await getFilteredSubclassIndex());
    await tick();
    importClassAdvancements();
    importSubClassAdvancements();
  };
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
  const selectClassHandler = async (option) => {
    $$invalidate(24, activeSubClass = null);
    set_store_value(characterSubClass, $characterSubClass = null, $characterSubClass);
    $$invalidate(4, subclassValue = null);
    $$invalidate(7, subClassAdvancementArrayFiltered = []);
    $$invalidate(22, richSubClassHTML = "");
    set_store_value(characterClass, $characterClass = await fromUuid(option), $characterClass);
    game.system.log.d($characterClass.system.advancement);
    game.system.log.d(Array.isArray($characterClass.system.advancement));
    game.system.log.d($characterClass?.system?.advancement.filter);
    game.system.log.d($characterClass?.system?.advancement.map);
    $$invalidate(23, activeClass = option);
    await tick();
    $$invalidate(25, subClassesIndex = await getFilteredSubclassIndex());
    set_store_value(subClassesForClass, $subClassesForClass = subClassesIndex, $subClassesForClass);
    await tick();
    importClassAdvancements();
    $$invalidate(21, richHTML = await TextEditor.enrichHTML(html));
  };
  const importClassAdvancements = async () => {
    for (const classAdvancement of classAdvancementArrayFiltered) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-BVeHbpMW.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-sRXI7Zv3.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-GlU4JA3A.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-Q-5X9MnY.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-CkPL8Qy1.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-CPFwqgbi.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-3KGTUlaA.js") }), `../../../molecules/dnd5e/Advancements/${classAdvancement.type}.svelte`, 7);
        $$invalidate(9, classAdvancementComponents[classAdvancement.type] = module.default, classAdvancementComponents);
      } catch (error) {
        log.e(`Failed to load component for ${classAdvancement.type}:`, error);
      }
    }
  };
  const selectSubClassHandler = async (option) => {
    set_store_value(characterSubClass, $characterSubClass = await fromUuid(option), $characterSubClass);
    $$invalidate(24, activeSubClass = option);
    await tick();
    importClassAdvancements();
    importSubClassAdvancements();
    $$invalidate(22, richSubClassHTML = await TextEditor.enrichHTML($characterSubClass.system.description.value));
  };
  const importSubClassAdvancements = async () => {
    for (const subClassAdvancement of subClassAdvancementArrayFiltered) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-BVeHbpMW.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-sRXI7Zv3.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-GlU4JA3A.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-Q-5X9MnY.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-CkPL8Qy1.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-CPFwqgbi.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-3KGTUlaA.js") }), `../../../molecules/dnd5e/Advancements/${subClassAdvancement.type}.svelte`, 7);
        await tick();
        $$invalidate(8, subClassAdvancementComponents[subClassAdvancement.type] = module.default, subClassAdvancementComponents);
      } catch (error) {
        log.e(`Failed to load component for ${subClassAdvancement.type}:`, error);
      }
    }
  };
  onMount(async () => {
    if ($characterClass) {
      game.system.log.d($characterClass);
      $$invalidate(3, classValue = $characterClass.uuid);
      await tick();
      importClassAdvancements();
      $$invalidate(21, richHTML = await TextEditor.enrichHTML(html));
      $$invalidate(25, subClassesIndex = await getFilteredSubclassIndex());
    }
    if ($characterSubClass) {
      $$invalidate(4, subclassValue = $characterSubClass.uuid);
      await tick();
      importSubClassAdvancements();
      $$invalidate(22, richSubClassHTML = await TextEditor.enrichHTML($characterSubClass.system.description.value));
    }
  });
  function iconselect_value_binding(value) {
    classValue = value;
    $$invalidate(3, classValue);
  }
  function iconselect_value_binding_1(value) {
    subclassValue = value;
    $$invalidate(4, subclassValue);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*$characterClass*/
    2) {
      html = $characterClass?.system?.description.value || "";
    }
    if ($$self.$$.dirty[0] & /*activeSubClass*/
    16777216) {
      $$invalidate(12, subClassProp = activeSubClass);
    }
    if ($$self.$$.dirty[0] & /*activeClass*/
    8388608) {
      $$invalidate(11, classProp = activeClass);
    }
    if ($$self.$$.dirty[0] & /*richHTML, richSubClassHTML*/
    6291456) {
      $$invalidate(10, combinedHtml = richHTML + (richSubClassHTML ? `<h1>${localize("GAS.SubClass")}</h1>` + richSubClassHTML : ""));
    }
    if ($$self.$$.dirty[0] & /*subClassesIndex*/
    33554432) {
      if (subClassesIndex?.length) {
        $$invalidate(5, subclasses = subClassesIndex.flat().sort((a, b) => a.label.localeCompare(b.label)));
      } else {
        $$invalidate(5, subclasses = []);
      }
    }
    if ($$self.$$.dirty[0] & /*$characterSubClass, $level*/
    5) {
      if ($characterSubClass?.system?.advancement.length) {
        $$invalidate(7, subClassAdvancementArrayFiltered = $characterSubClass.system.advancement.filter((value) => value.level === $level));
      } else {
        $$invalidate(7, subClassAdvancementArrayFiltered = []);
      }
    }
    if ($$self.$$.dirty[0] & /*$characterClass, $level*/
    6) {
      if ($characterClass?.system?.advancement.length) {
        $$invalidate(6, classAdvancementArrayFiltered = $characterClass.system.advancement.filter((value) => value.level === $level));
      } else {
        $$invalidate(6, classAdvancementArrayFiltered = []);
      }
    }
  };
  $$invalidate(9, classAdvancementComponents = {});
  $$invalidate(8, subClassAdvancementComponents = {});
  return [
    $characterSubClass,
    $characterClass,
    $level,
    classValue,
    subclassValue,
    subclasses,
    classAdvancementArrayFiltered,
    subClassAdvancementArrayFiltered,
    subClassAdvancementComponents,
    classAdvancementComponents,
    combinedHtml,
    classProp,
    subClassProp,
    classesPlaceholder,
    subclassesPlaceholder,
    filteredClassIndex,
    levelOptions,
    selectStyles,
    levelSelectHandler,
    selectClassHandler,
    selectSubClassHandler,
    richHTML,
    richSubClassHTML,
    activeClass,
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
//# sourceMappingURL=Class-CU8_C0b_.js.map
