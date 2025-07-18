import { S as SvelteComponent, i as init, s as safe_not_equal, l as localize, d as destroy_component, t as transition_out, a as transition_in, m as mount_component, c as create_component, b as component_subscribe, P as characterSubClass, Q as characterClass, R as level, r as readOnlyTabs, T as subClassesForClass, J as getPacksFromSettings, K as extractItemsFromPacksSync, M as MODULE_ID, g as getContext, o as onMount, U as getSubclassLevel, y as binding_callbacks, z as bind, k as detach, x as attr, A as add_flush_callback, n as group_outros, p as check_outros, q as insert, u as append, v as element, G as text, w as empty, j as set_store_value, V as goldRoll, W as clearEquipmentSelections, h as tick, L as illuminatedDescription, X as extractItemsFromPacksAsync, _ as __variableDynamicImportRuntimeHelper, Y as TJSSelect, C as noop, F as set_data, Z as listen, $ as space, B as ensure_array_like, D as destroy_each, E as construct_svelte_component, N as src_url_equal, O as getAdvancementValue } from "./index-nVACK3WE.js";
/* empty css                                              */
import { I as IconSelect } from "./IconSelect-NNrGQFUi.js";
import { S as StandardTabLayout } from "./StandardTabLayout-CmH9Wn6k.js";
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
      h2.textContent = `${localize("SubClass")}`;
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
      h2.textContent = `${localize("Tabs.Classes.FilterByLevel")}`;
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
  let t3_value = localize("Level") + "";
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
      div1.textContent = `${localize("Tabs.Classes.Class")} ${localize("Advancements")}`;
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
      li.textContent = `${localize("NoAdvancements")}`;
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
      div0.innerHTML = `<img class="icon" src="systems/dnd5e/icons/svg/items/subclass.svg" alt="${localize("AltText.Subclass")}"/>`;
      div1 = element("div");
      div1.textContent = `${localize("SubClass")}`;
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
  let t3_value = localize("Level") + "";
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
      div1.textContent = `${localize("Tabs.Classes.SubClass")} ${localize("Advancements")}`;
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
      li.textContent = `${localize("NoAdvancements")}`;
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
      title: localize("Tabs.Classes.Title"),
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
  let richHTML = "", html = "", richSubClassHTML = "", selectedCharacterClass = null, activeSubClass = null, classValue = null, subclassValue = null, subClassesIndex, subclasses, classesPlaceholder = localize("Tabs.Classes.Placeholder"), subclassesPlaceholder = localize("Tabs.Classes.SubclassPlaceholder"), packs = getPacksFromSettings("classes"), subClassesPacks = getPacksFromSettings("subclasses"), classAdvancementArrayFiltered = [], classAdvancementExpanded = false, subClassAdvancementArrayFiltered = [], subClassAdvancementExpanded = false, mappedClassIndex = extractItemsFromPacksSync(packs, ["name->label", "img", "type", "folder", "uuid->value", "_id"]), filteredClassIndex;
  const showPackLabelInSelect = game.settings.get(MODULE_ID, "showPackLabelInSelect");
  filteredClassIndex = mappedClassIndex.filter((i) => {
    return i.type == "class";
  }).sort((a, b) => a.label.localeCompare(showPackLabelInSelect ? b.compoundLabel : b.label));
  const levelOptions = [];
  for (let i = 1; i <= 20; i++) {
    levelOptions.push({
      label: localize("Tabs.Classes.Level") + " " + i,
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
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-BdvTleQp.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-BSHKWJTy.js"), "../../../molecules/dnd5e/Advancements/HitPoints.svelte": () => import("./HitPoints-DbVxFEa4.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-Drz_b9JF.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-8QaRDYXN.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-CzMNspQU.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-BoM-Kive.js"), "../../../molecules/dnd5e/Advancements/Subclass.svelte": () => import("./Subclass-MAYQqnH7.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-Dtof4dkT.js") }), `../../../molecules/dnd5e/Advancements/${classAdvancement.type}.svelte`, 7);
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
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-BdvTleQp.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-BSHKWJTy.js"), "../../../molecules/dnd5e/Advancements/HitPoints.svelte": () => import("./HitPoints-DbVxFEa4.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-Drz_b9JF.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-8QaRDYXN.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-CzMNspQU.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-BoM-Kive.js"), "../../../molecules/dnd5e/Advancements/Subclass.svelte": () => import("./Subclass-MAYQqnH7.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-Dtof4dkT.js") }), `../../../molecules/dnd5e/Advancements/${subClassAdvancement.type}.svelte`, 7);
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
      ${richSubClassHTML ? `<h1>${localize("SubClass")}</h1>${richSubClassHTML}` : ""}
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
//# sourceMappingURL=Class-D8WODw-D.js.map
