import { S as SvelteComponent, i as init, s as safe_not_equal, z as ensure_array_like, C as binding_callbacks, D as bind, e as element, u as create_component, a as empty, b as attr, c as insert, d as append, v as mount_component, E as add_flush_callback, h as transition_in, g as group_outros, t as transition_out, f as check_outros, j as detach, B as destroy_each, w as destroy_component, k as component_subscribe, O as characterClass, N as characterSubClass, P as level, J as getPacksFromSettings, K as extractItemsFromPacks, n as getContext, o as onMount, q as tick, x as log, Q as DonationTracker, V as ucfirst, F as text, R as space, L as src_url_equal, G as set_data, T as TJSSelect, l as localize, U as extractMapIteratorObjectProperties, y as set_store_value, _ as __variableDynamicImportRuntimeHelper, A as noop, r as construct_svelte_component } from "./index-BvpypBsF.js";
import { I as IconSelect } from "./IconSelect-GnhWv2GO.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[40] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[40] = list[i];
  return child_ctx;
}
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[45] = list[i];
  return child_ctx;
}
function create_each_block_2(ctx) {
  let div6;
  let div0;
  let img;
  let img_src_value;
  let div5;
  let div1;
  let t0_value = ucfirst(
    /*classKey*/
    ctx[45]
  ) + "";
  let t0;
  let t1;
  let div3;
  let div2;
  let t2_value = (
    /*getCharacterClass*/
    ctx[23](
      /*classKey*/
      ctx[45]
    )?.system?.levels + ""
  );
  let t2;
  let t3;
  let div4;
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
      t2 = text(t2_value);
      t3 = space();
      div4 = element("div");
      div4.innerHTML = `<i class="fas fa-plus"></i>`;
      attr(img, "height", "40");
      if (!src_url_equal(img.src, img_src_value = /*getCharacterClass*/
      ctx[23](
        /*classKey*/
        ctx[45]
      )?.img)) attr(img, "src", img_src_value);
      attr(div0, "class", "flex icon svelte-gas-t2yejc");
      attr(div1, "class", "flex3");
      attr(div2, "class", "lozenge svelte-gas-t2yejc");
      attr(div3, "class", "flex0");
      attr(div4, "class", "flex1 right pr-md");
      attr(div5, "class", "flex3 flexrow svelte-gas-t2yejc");
      attr(div6, "class", "class-row gold-button flexrow svelte-gas-t2yejc");
      attr(div6, "role", "button");
      attr(div6, "aria-role", "button");
      attr(div6, "aria-label", "GAS.LevelUp.ClassLevelUp");
      attr(div6, "data-tooltip", "GAS.LevelUp.ClassLevelUp");
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
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*classKeys*/
      1 && !src_url_equal(img.src, img_src_value = /*getCharacterClass*/
      ctx2[23](
        /*classKey*/
        ctx2[45]
      )?.img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty[0] & /*classKeys*/
      1 && t0_value !== (t0_value = ucfirst(
        /*classKey*/
        ctx2[45]
      ) + "")) set_data(t0, t0_value);
      if (dirty[0] & /*classKeys*/
      1 && t2_value !== (t2_value = /*getCharacterClass*/
      ctx2[23](
        /*classKey*/
        ctx2[45]
      )?.system?.levels + "")) set_data(t2, t2_value);
    },
    d(detaching) {
      if (detaching) {
        detach(div6);
      }
    }
  };
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
    ctx[6].length && create_if_block_7(ctx)
  );
  tjsselect = new TJSSelect({
    props: {
      options: (
        /*levelOptions*/
        ctx[17]
      ),
      store: level,
      styles: (
        /*selectStyles*/
        ctx[18]
      )
    }
  });
  tjsselect.$on(
    "change",
    /*levelSelectHandler*/
    ctx[20]
  );
  let if_block1 = (
    /*classAdvancementArrayFiltered*/
    ctx[8] && create_if_block_5(ctx)
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
      attr(div1, "class", "flexrow svelte-gas-t2yejc");
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
        ctx2[6].length
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty[0] & /*subclasses*/
          64) {
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
        ctx2[8]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty[0] & /*classAdvancementArrayFiltered*/
          256) {
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
    ctx[31](value);
  }
  let iconselect_props = {
    class: "icon-select",
    active: (
      /*subClassProp*/
      ctx[14]
    ),
    options: (
      /*subclasses*/
      ctx[6]
    ),
    placeHolder: (
      /*subclassesPlaceholder*/
      ctx[16]
    ),
    handler: (
      /*selectSubClassHandler*/
      ctx[22]
    ),
    id: "subClass-select",
    truncateWidth: "17"
  };
  if (
    /*subclassValue*/
    ctx[5] !== void 0
  ) {
    iconselect_props.value = /*subclassValue*/
    ctx[5];
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
      16384) iconselect_changes.active = /*subClassProp*/
      ctx2[14];
      if (dirty[0] & /*subclasses*/
      64) iconselect_changes.options = /*subclasses*/
      ctx2[6];
      if (!updating_value && dirty[0] & /*subclassValue*/
      32) {
        updating_value = true;
        iconselect_changes.value = /*subclassValue*/
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
    ctx2[8].length) return 0;
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
        ctx[3]
      );
      ul = element("ul");
      if_block.c();
      attr(div0, "class", "flex");
      attr(div1, "class", "flex0 div badge right inset ml-sm mb-xs svelte-gas-t2yejc");
      attr(h3, "class", "left mt-sm flexrow svelte-gas-t2yejc");
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
      8) set_data(
        t5,
        /*$level*/
        ctx2[3]
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
      2304) {
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
    ctx[40].title + ""
  );
  let t;
  let div2_data_tooltip_value;
  let div3;
  let switch_instance;
  let li_data_type_value;
  let current;
  var switch_value = (
    /*classAdvancementComponents*/
    ctx[11][
      /*advancement*/
      ctx[40].type
    ]
  );
  function switch_props(ctx2, dirty) {
    return {
      props: { advancement: (
        /*advancement*/
        ctx2[40]
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
      attr(img, "class", "icon svelte-gas-t2yejc");
      if (!src_url_equal(img.src, img_src_value = /*advancement*/
      ctx[40].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[40].title);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow svelte-gas-t2yejc");
      attr(div2, "data-tooltip", div2_data_tooltip_value = /*advancement*/
      ctx[40].configuration?.hint || null);
      attr(div2, "data-tooltip-class", "gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip");
      attr(div3, "class", "flexrow svelte-gas-t2yejc");
      attr(li, "class", "left");
      attr(li, "data-type", li_data_type_value = /*advancement*/
      ctx[40].type);
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
      256 && !src_url_equal(img.src, img_src_value = /*advancement*/
      ctx2[40].icon)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty[0] & /*classAdvancementArrayFiltered*/
      256 && img_alt_value !== (img_alt_value = /*advancement*/
      ctx2[40].title)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty[0] & /*classAdvancementArrayFiltered*/
      256) && t_value !== (t_value = /*advancement*/
      ctx2[40].title + "")) set_data(t, t_value);
      if (!current || dirty[0] & /*classAdvancementArrayFiltered*/
      256 && div2_data_tooltip_value !== (div2_data_tooltip_value = /*advancement*/
      ctx2[40].configuration?.hint || null)) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
      if (dirty[0] & /*classAdvancementComponents, classAdvancementArrayFiltered*/
      2304 && switch_value !== (switch_value = /*classAdvancementComponents*/
      ctx2[11][
        /*advancement*/
        ctx2[40].type
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
        ctx2[40];
        switch_instance.$set(switch_instance_changes);
      }
      if (!current || dirty[0] & /*classAdvancementArrayFiltered*/
      256 && li_data_type_value !== (li_data_type_value = /*advancement*/
      ctx2[40].type)) {
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
    ctx[2] && create_if_block_1(ctx)
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
        ctx2[2]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*$characterSubClass*/
          4) {
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
    ctx[9] && create_if_block_2(ctx)
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
        ctx2[9]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*subClassAdvancementArrayFiltered*/
          512) {
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
    ctx2[9].length) return 0;
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
        ctx[3]
      );
      ul = element("ul");
      if_block.c();
      attr(div0, "class", "flex");
      attr(div1, "class", "flex0 div badge right inset ml-sm mb-xs svelte-gas-t2yejc");
      attr(h3, "class", "left mt-sm flexrow svelte-gas-t2yejc");
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
      8) set_data(
        t5,
        /*$level*/
        ctx2[3]
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
    ctx[9]
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
      1536) {
        each_value = ensure_array_like(
          /*subClassAdvancementArrayFiltered*/
          ctx2[9]
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
    ctx[40].title + ""
  );
  let t;
  let div2_data_tooltip_value;
  let div3;
  let switch_instance;
  let li_data_type_value;
  let current;
  var switch_value = (
    /*subClassAdvancementComponents*/
    ctx[10][
      /*advancement*/
      ctx[40].type
    ]
  );
  function switch_props(ctx2, dirty) {
    return {
      props: { advancement: (
        /*advancement*/
        ctx2[40]
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
      attr(img, "class", "icon svelte-gas-t2yejc");
      if (!src_url_equal(img.src, img_src_value = /*advancement*/
      ctx[40].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[40].title);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow svelte-gas-t2yejc");
      attr(div2, "data-tooltip", div2_data_tooltip_value = /*advancement*/
      ctx[40].configuration?.hint || null);
      attr(div2, "data-tooltip-locked", "true");
      attr(div2, "data-tooltip-class", "gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip");
      attr(div3, "class", "flexrow svelte-gas-t2yejc");
      attr(li, "class", "left");
      attr(li, "data-type", li_data_type_value = /*advancement*/
      ctx[40].type);
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
      512 && !src_url_equal(img.src, img_src_value = /*advancement*/
      ctx2[40].icon)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      512 && img_alt_value !== (img_alt_value = /*advancement*/
      ctx2[40].title)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      512) && t_value !== (t_value = /*advancement*/
      ctx2[40].title + "")) set_data(t, t_value);
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      512 && div2_data_tooltip_value !== (div2_data_tooltip_value = /*advancement*/
      ctx2[40].configuration?.hint || null)) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
      if (dirty[0] & /*subClassAdvancementComponents, subClassAdvancementArrayFiltered*/
      1536 && switch_value !== (switch_value = /*subClassAdvancementComponents*/
      ctx2[10][
        /*advancement*/
        ctx2[40].type
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
        512) switch_instance_changes.advancement = /*advancement*/
        ctx2[40];
        switch_instance.$set(switch_instance_changes);
      }
      if (!current || dirty[0] & /*subClassAdvancementArrayFiltered*/
      512 && li_data_type_value !== (li_data_type_value = /*advancement*/
      ctx2[40].type)) {
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
  let h10;
  let h11;
  let iconselect;
  let updating_value;
  let if_block0_anchor;
  let div1;
  let div2;
  let current;
  let each_value_2 = ensure_array_like(
    /*classKeys*/
    ctx[0]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_2.length; i += 1) {
    each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
  }
  function iconselect_value_binding(value) {
    ctx[30](value);
  }
  let iconselect_props = {
    class: "icon-select",
    active: (
      /*classProp*/
      ctx[13]
    ),
    options: (
      /*filteredClassIndex*/
      ctx[7]
    ),
    placeHolder: (
      /*classesPlaceholder*/
      ctx[15]
    ),
    handler: (
      /*selectClassHandler*/
      ctx[21]
    ),
    id: "characterClass-select"
  };
  if (
    /*classValue*/
    ctx[4] !== void 0
  ) {
    iconselect_props.value = /*classValue*/
    ctx[4];
  }
  iconselect = new IconSelect({ props: iconselect_props });
  binding_callbacks.push(() => bind(iconselect, "value", iconselect_value_binding));
  let if_block0 = (
    /*$characterClass*/
    ctx[1] && create_if_block_4(ctx)
  );
  let if_block1 = (
    /*subclasses*/
    ctx[6].length && create_if_block(ctx)
  );
  return {
    c() {
      div4 = element("div");
      div3 = element("div");
      div0 = element("div");
      h10 = element("h1");
      h10.textContent = "Existing Classes";
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      h11 = element("h1");
      h11.textContent = "Add new multiclass";
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
      attr(div3, "class", "flexrow svelte-gas-t2yejc");
      attr(div4, "class", "content svelte-gas-t2yejc");
    },
    m(target, anchor) {
      insert(target, div4, anchor);
      append(div4, div3);
      append(div3, div0);
      append(div0, h10);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div0, null);
        }
      }
      append(div0, h11);
      mount_component(iconselect, div0, null);
      if (if_block0) if_block0.m(div0, null);
      append(div0, if_block0_anchor);
      if (if_block1) if_block1.m(div0, null);
      append(div3, div1);
      append(div3, div2);
      div2.innerHTML = /*combinedHtml*/
      ctx[12];
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*getCharacterClass, classKeys*/
      8388609) {
        each_value_2 = ensure_array_like(
          /*classKeys*/
          ctx2[0]
        );
        let i;
        for (i = 0; i < each_value_2.length; i += 1) {
          const child_ctx = get_each_context_2(ctx2, each_value_2, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_2(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(div0, h11);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_2.length;
      }
      const iconselect_changes = {};
      if (dirty[0] & /*classProp*/
      8192) iconselect_changes.active = /*classProp*/
      ctx2[13];
      if (dirty[0] & /*filteredClassIndex*/
      128) iconselect_changes.options = /*filteredClassIndex*/
      ctx2[7];
      if (!updating_value && dirty[0] & /*classValue*/
      16) {
        updating_value = true;
        iconselect_changes.value = /*classValue*/
        ctx2[4];
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
        ctx2[6].length
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty[0] & /*subclasses*/
          64) {
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
      4096) div2.innerHTML = /*combinedHtml*/
      ctx2[12];
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
      destroy_each(each_blocks, detaching);
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
  let classKeys;
  let filteredClassIndex;
  let $characterClass;
  let $characterSubClass;
  let $actor;
  let $level;
  component_subscribe($$self, characterClass, ($$value) => $$invalidate(1, $characterClass = $$value));
  component_subscribe($$self, characterSubClass, ($$value) => $$invalidate(2, $characterSubClass = $$value));
  component_subscribe($$self, level, ($$value) => $$invalidate(3, $level = $$value));
  let richHTML = "", richSubClassHTML = "", activeClass = null, activeSubClass = null, classValue = null, subclassValue = null, subClassesIndex, subclasses, classesPlaceholder = "Classes", subclassesPlaceholder = "Subclasses", packs = getPacksFromSettings("classes");
  game.packs.get("dnd5e.subclasses");
  let subClassesPacks = getPacksFromSettings("subclasses"), mappedClassIndex = extractItemsFromPacks(packs, ["name->label", "img", "type", "folder", "uuid->value", "_id"]);
  const levelOptions = [];
  for (let i = 1; i <= 20; i++) {
    levelOptions.push({ label: "Level " + i, value: i });
  }
  const selectStyles = {};
  const actor = getContext("#doc");
  component_subscribe($$self, actor, (value) => $$invalidate(29, $actor = value));
  const levelSelectHandler = async (option) => {
    $$invalidate(28, subClassesIndex = await getFilteredSubclassIndex());
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
    $$invalidate(27, activeSubClass = null);
    set_store_value(characterSubClass, $characterSubClass = null, $characterSubClass);
    $$invalidate(5, subclassValue = null);
    $$invalidate(9, subClassAdvancementArrayFiltered = []);
    $$invalidate(25, richSubClassHTML = "");
    set_store_value(characterClass, $characterClass = await fromUuid(option), $characterClass);
    $$invalidate(26, activeClass = option);
    await tick();
    $$invalidate(28, subClassesIndex = await getFilteredSubclassIndex());
    await tick();
    importClassAdvancements();
    $$invalidate(24, richHTML = await TextEditor.enrichHTML(html));
  };
  const importClassAdvancements = async () => {
    for (const classAdvancement of classAdvancementArrayFiltered) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-Bq-sGGBp.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-DvvhdYvq.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-aY_HjE7t.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-D9SE02YG.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-CgK7mMZy.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-ccrk79fk.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-CG_Hgx30.js") }), `../../../molecules/dnd5e/Advancements/${classAdvancement.type}.svelte`, 7);
        $$invalidate(11, classAdvancementComponents[classAdvancement.type] = module.default, classAdvancementComponents);
      } catch (error) {
        log.e(`Failed to load component for ${classAdvancement.type}:`, error);
      }
    }
  };
  const selectSubClassHandler = async (option) => {
    set_store_value(characterSubClass, $characterSubClass = await fromUuid(option), $characterSubClass);
    $$invalidate(27, activeSubClass = option);
    await tick();
    importClassAdvancements();
    importSubClassAdvancements();
    $$invalidate(25, richSubClassHTML = await TextEditor.enrichHTML($characterSubClass.system.description.value));
  };
  const importSubClassAdvancements = async () => {
    for (const subClassAdvancement of subClassAdvancementArrayFiltered) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-Bq-sGGBp.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-DvvhdYvq.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-aY_HjE7t.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-D9SE02YG.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-CgK7mMZy.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-ccrk79fk.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-CG_Hgx30.js") }), `../../../molecules/dnd5e/Advancements/${subClassAdvancement.type}.svelte`, 7);
        await tick();
        $$invalidate(10, subClassAdvancementComponents[subClassAdvancement.type] = module.default, subClassAdvancementComponents);
      } catch (error) {
        log.e(`Failed to load component for ${subClassAdvancement.type}:`, error);
      }
    }
  };
  const getCharacterClass = (classKey) => {
    return $actor._classes[classKey];
  };
  onMount(async () => {
    if ($characterClass) {
      $$invalidate(4, classValue = $characterClass.uuid);
      await tick();
      importClassAdvancements();
      $$invalidate(24, richHTML = await TextEditor.enrichHTML(html));
      $$invalidate(28, subClassesIndex = await getFilteredSubclassIndex());
    }
    if ($characterSubClass) {
      $$invalidate(5, subclassValue = $characterSubClass.uuid);
      await tick();
      importSubClassAdvancements();
      $$invalidate(25, richSubClassHTML = await TextEditor.enrichHTML($characterSubClass.system.description.value));
    }
    log.d("classKeys", classKeys);
    log.d(typeof classKeys);
    log.d(classKeys.length);
    log.d(Array.isArray(classKeys.length));
    log.d(getCharacterClass("fighter"));
    log.d($characterClass);
  });
  function iconselect_value_binding(value) {
    classValue = value;
    $$invalidate(4, classValue);
  }
  function iconselect_value_binding_1(value) {
    subclassValue = value;
    $$invalidate(5, subclassValue);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*$characterClass*/
    2) {
      html = $characterClass?.system?.description.value || "";
    }
    if ($$self.$$.dirty[0] & /*activeSubClass*/
    134217728) {
      $$invalidate(14, subClassProp = activeSubClass);
    }
    if ($$self.$$.dirty[0] & /*activeClass*/
    67108864) {
      $$invalidate(13, classProp = activeClass);
    }
    if ($$self.$$.dirty[0] & /*richHTML, richSubClassHTML*/
    50331648) {
      $$invalidate(12, combinedHtml = richHTML + (richSubClassHTML ? "<h1>Subclass</h1>" + richSubClassHTML : ""));
    }
    if ($$self.$$.dirty[0] & /*subClassesIndex*/
    268435456) {
      if (subClassesIndex?.length) {
        $$invalidate(6, subclasses = subClassesIndex.flat().sort((a, b) => a.label.localeCompare(b.label)));
      } else {
        $$invalidate(6, subclasses = []);
      }
    }
    if ($$self.$$.dirty[0] & /*$characterSubClass, $level*/
    12) {
      $$invalidate(9, subClassAdvancementArrayFiltered = $characterSubClass?.advancement?.byId ? Object.entries($characterSubClass.advancement.byId).filter(([id, value]) => value.level === $level).map(([id, value]) => ({ ...value, id })) : []);
    }
    if ($$self.$$.dirty[0] & /*$characterClass, $level*/
    10) {
      $$invalidate(8, classAdvancementArrayFiltered = $characterClass?.advancement?.byId ? Object.entries($characterClass.advancement.byId).filter(([id, value]) => value.level === $level).map(([id, value]) => ({ ...value, id })) : []);
    }
    if ($$self.$$.dirty[0] & /*$actor*/
    536870912) {
      $$invalidate(0, classKeys = Object.keys($actor._classes));
    }
    if ($$self.$$.dirty[0] & /*classKeys*/
    1) {
      $$invalidate(7, filteredClassIndex = mappedClassIndex.filter((i) => {
        return i.type == "class" && DonationTracker.canViewItem(i) && //- @why: don't include classes that are already in the character
        !classKeys.includes(i.label.toLowerCase());
      }).sort((a, b) => a.label.localeCompare(b.label)));
    }
  };
  $$invalidate(11, classAdvancementComponents = {});
  $$invalidate(10, subClassAdvancementComponents = {});
  return [
    classKeys,
    $characterClass,
    $characterSubClass,
    $level,
    classValue,
    subclassValue,
    subclasses,
    filteredClassIndex,
    classAdvancementArrayFiltered,
    subClassAdvancementArrayFiltered,
    subClassAdvancementComponents,
    classAdvancementComponents,
    combinedHtml,
    classProp,
    subClassProp,
    classesPlaceholder,
    subclassesPlaceholder,
    levelOptions,
    selectStyles,
    actor,
    levelSelectHandler,
    selectClassHandler,
    selectSubClassHandler,
    getCharacterClass,
    richHTML,
    richSubClassHTML,
    activeClass,
    activeSubClass,
    subClassesIndex,
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
//# sourceMappingURL=LevelUp-IPTEGqpu.js.map
