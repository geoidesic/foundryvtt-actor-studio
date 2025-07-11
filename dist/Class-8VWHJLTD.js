import { S as SvelteComponent, i as init, s as safe_not_equal, u as binding_callbacks, v as bind, d as detach, w as destroy_component, t as transition_out, a as transition_in, x as add_flush_callback, g as group_outros, c as check_outros, b as insert, e as append, y as mount_component, f as element, z as create_component, h as empty, j as attr, k as component_subscribe, L as characterSubClass, N as characterClass, O as level, I as getPacksFromSettings, J as extractItemsFromPacks, P as DonationTracker, n as getContext, o as onMount, q as tick, T as TJSSelect, l as localize, _ as __variableDynamicImportRuntimeHelper, E as log, Q as extractMapIteratorObjectProperties, r as set_store_value, F as set_data, G as text, R as space, B as noop, A as ensure_array_like, C as destroy_each, D as construct_svelte_component, K as src_url_equal } from "./index-Dy3PDuN4.js";
import { I as IconSelect } from "./IconSelect-XDdMtIvm.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[37] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[37] = list[i];
  return child_ctx;
}
function create_if_block_4(ctx) {
  let h3;
  let div1;
  let div0;
  let tjsselect;
  let if_block1_anchor;
  let current;
  let if_block0 = (
    /*subclasses*/
    ctx[5].length && create_if_block_7(ctx)
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
    ctx[6] && create_if_block_5(ctx)
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
          if_block0 = create_if_block_7(ctx2);
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
      transition_in(tjsselect.$$.fragment, local);
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(if_block0);
      transition_out(tjsselect.$$.fragment, local);
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(h3);
        detach(div1);
        detach(if_block1_anchor);
      }
      if (if_block0) if_block0.d(detaching);
      destroy_component(tjsselect);
      if (if_block1) if_block1.d(detaching);
    }
  };
}
function create_if_block_7(ctx) {
  let h3;
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
      h3.textContent = "Subclass";
      create_component(iconselect.$$.fragment);
      attr(h3, "class", "left mt-md");
    },
    m(target, anchor) {
      insert(target, h3, anchor);
      mount_component(iconselect, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
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
      }
      destroy_component(iconselect, detaching);
    }
  };
}
function create_if_block_5(ctx) {
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
  const if_block_creators = [create_if_block_6, create_else_block_1];
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
function create_if_block_6(ctx) {
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
    ctx[37].title + ""
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
      ctx[37].type
    ]
  );
  function switch_props(ctx2, dirty) {
    return {
      props: { advancement: (
        /*advancement*/
        ctx2[37]
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
      ctx[37].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[37].title);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow svelte-gas-ahq1lz");
      attr(div2, "data-tooltip", div2_data_tooltip_value = /*advancement*/
      ctx[37].configuration?.hint || null);
      attr(div2, "data-tooltip-class", "gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip");
      attr(div3, "class", "flexrow svelte-gas-ahq1lz");
      attr(li, "class", "left");
      attr(li, "data-type", li_data_type_value = /*advancement*/
      ctx[37].type);
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
      ctx2[37].icon)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty[0] & /*classAdvancementArrayFiltered*/
      64 && img_alt_value !== (img_alt_value = /*advancement*/
      ctx2[37].title)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty[0] & /*classAdvancementArrayFiltered*/
      64) && t_value !== (t_value = /*advancement*/
      ctx2[37].title + "")) set_data(t, t_value);
      if (!current || dirty[0] & /*classAdvancementArrayFiltered*/
      64 && div2_data_tooltip_value !== (div2_data_tooltip_value = /*advancement*/
      ctx2[37].configuration?.hint || null)) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
      if (dirty[0] & /*classAdvancementComponents, classAdvancementArrayFiltered*/
      576 && switch_value !== (switch_value = /*classAdvancementComponents*/
      ctx2[9][
        /*advancement*/
        ctx2[37].type
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
        ctx2[37];
        switch_instance.$set(switch_instance_changes);
      }
      if (!current || dirty[0] & /*classAdvancementArrayFiltered*/
      64 && li_data_type_value !== (li_data_type_value = /*advancement*/
      ctx2[37].type)) {
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
    /*$characterSubClass*/
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
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*$characterSubClass*/
        ctx2[0]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*$characterSubClass*/
          1) {
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
    ctx[37].title + ""
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
      ctx[37].type
    ]
  );
  function switch_props(ctx2, dirty) {
    return {
      props: { advancement: (
        /*advancement*/
        ctx2[37]
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
      ctx[37].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[37].title);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow svelte-gas-ahq1lz");
      attr(div2, "data-tooltip", div2_data_tooltip_value = /*advancement*/
      ctx[37].configuration?.hint || null);
      attr(div2, "data-tooltip-locked", "true");
      attr(div2, "data-tooltip-class", "gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip");
      attr(div3, "class", "flexrow svelte-gas-ahq1lz");
      attr(li, "class", "left");
      attr(li, "data-type", li_data_type_value = /*advancement*/
      ctx[37].type);
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
      ctx2[37].icon)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      128 && img_alt_value !== (img_alt_value = /*advancement*/
      ctx2[37].title)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      128) && t_value !== (t_value = /*advancement*/
      ctx2[37].title + "")) set_data(t, t_value);
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      128 && div2_data_tooltip_value !== (div2_data_tooltip_value = /*advancement*/
      ctx2[37].configuration?.hint || null)) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
      if (dirty[0] & /*subClassAdvancementComponents, subClassAdvancementArrayFiltered*/
      384 && switch_value !== (switch_value = /*subClassAdvancementComponents*/
      ctx2[8][
        /*advancement*/
        ctx2[37].type
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
        ctx2[37];
        switch_instance.$set(switch_instance_changes);
      }
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      128 && li_data_type_value !== (li_data_type_value = /*advancement*/
      ctx2[37].type)) {
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
  let iconselect;
  let updating_value;
  let if_block0_anchor;
  let div1;
  let div2;
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
  let if_block0 = (
    /*$characterClass*/
    ctx[1] && create_if_block_4(ctx)
  );
  let if_block1 = (
    /*subclasses*/
    ctx[5].length && create_if_block(ctx)
  );
  return {
    c() {
      div4 = element("div");
      div3 = element("div");
      div0 = element("div");
      create_component(iconselect.$$.fragment);
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      div1 = element("div");
      div1.innerHTML = ``;
      div2 = element("div");
      attr(div0, "class", "flex2 pr-sm col-a");
      attr(div1, "class", "flex0 border-right right-border-gradient-mask");
      attr(div2, "class", "flex3 left pl-md scroll col-b");
      attr(div3, "class", "flexrow svelte-gas-ahq1lz");
      attr(div4, "class", "content svelte-gas-ahq1lz");
    },
    m(target, anchor) {
      insert(target, div4, anchor);
      append(div4, div3);
      append(div3, div0);
      mount_component(iconselect, div0, null);
      if (if_block0) if_block0.m(div0, null);
      append(div0, if_block0_anchor);
      if (if_block1) if_block1.m(div0, null);
      append(div3, div1);
      append(div3, div2);
      div2.innerHTML = /*combinedHtml*/
      ctx[10];
      current = true;
    },
    p(ctx2, dirty) {
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
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty[0] & /*$characterClass*/
          2) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_4(ctx2);
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
        /*subclasses*/
        ctx2[5].length
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty[0] & /*subclasses*/
          32) {
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
      1024) div2.innerHTML = /*combinedHtml*/
      ctx2[10];
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
        detach(div4);
      }
      destroy_component(iconselect);
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
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
  let subClassAdvancementArrayFiltered;
  let classAdvancementArrayFiltered;
  let $characterSubClass;
  let $characterClass;
  let $level;
  component_subscribe($$self, characterSubClass, ($$value) => $$invalidate(0, $characterSubClass = $$value));
  component_subscribe($$self, characterClass, ($$value) => $$invalidate(1, $characterClass = $$value));
  component_subscribe($$self, level, ($$value) => $$invalidate(2, $level = $$value));
  let richHTML = "", richSubClassHTML = "", activeClass = null, activeSubClass = null, classValue = null, subclassValue = null, subClassesIndex, subclasses, classesPlaceholder = "Classes", subclassesPlaceholder = "Subclasses", packs = getPacksFromSettings("classes");
  game.packs.get("dnd5e.subclasses");
  let subClassesPacks = getPacksFromSettings("subclasses"), mappedClassIndex = extractItemsFromPacks(packs, ["name->label", "img", "type", "folder", "uuid->value", "_id"]), filteredClassIndex = mappedClassIndex.filter((i) => {
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
    $$invalidate(23, activeClass = option);
    await tick();
    $$invalidate(25, subClassesIndex = await getFilteredSubclassIndex());
    await tick();
    importClassAdvancements();
    $$invalidate(21, richHTML = await TextEditor.enrichHTML(html));
  };
  const importClassAdvancements = async () => {
    for (const classAdvancement of classAdvancementArrayFiltered) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-CFZnL3Kg.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-Cw2yFXQP.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-DyidtfFQ.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-JdIhYcIz.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-CkWvAiR-.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-DZ8qdcIV.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-CwVSyLPF.js") }), `../../../molecules/dnd5e/Advancements/${classAdvancement.type}.svelte`, 7);
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
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-CFZnL3Kg.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-Cw2yFXQP.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-DyidtfFQ.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-JdIhYcIz.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-CkWvAiR-.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-DZ8qdcIV.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-CwVSyLPF.js") }), `../../../molecules/dnd5e/Advancements/${subClassAdvancement.type}.svelte`, 7);
        await tick();
        $$invalidate(8, subClassAdvancementComponents[subClassAdvancement.type] = module.default, subClassAdvancementComponents);
      } catch (error) {
        log.e(`Failed to load component for ${subClassAdvancement.type}:`, error);
      }
    }
  };
  onMount(async () => {
    if ($characterClass) {
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
      $$invalidate(10, combinedHtml = richHTML + (richSubClassHTML ? "<h1>Subclass</h1>" + richSubClassHTML : ""));
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
      $$invalidate(7, subClassAdvancementArrayFiltered = $characterSubClass?.advancement?.byId ? Object.entries($characterSubClass.advancement.byId).filter(([id, value]) => value.level === $level).map(([id, value]) => ({ ...value, id })) : []);
    }
    if ($$self.$$.dirty[0] & /*$characterClass, $level*/
    6) {
      $$invalidate(6, classAdvancementArrayFiltered = $characterClass?.advancement?.byId ? Object.entries($characterClass.advancement.byId).filter(([id, value]) => value.level === $level).map(([id, value]) => ({ ...value, id })) : []);
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
//# sourceMappingURL=Class-8VWHJLTD.js.map
