import { S as SvelteComponent, i as init, s as safe_not_equal, l as localize, d as destroy_component, t as transition_out, a as transition_in, m as mount_component, c as create_component, b as component_subscribe, b6 as race, r as readOnlyTabs, J as getPacksFromSettings, K as extractItemsFromPacksSync, M as MODULE_ID, g as getContext, o as onMount, y as binding_callbacks, z as bind, k as detach, x as attr, A as add_flush_callback, n as group_outros, p as check_outros, q as insert, u as append, v as element, G as text, j as set_store_value, L as illuminatedDescription, w as empty, _ as __variableDynamicImportRuntimeHelper, F as set_data, W as space, B as ensure_array_like, D as destroy_each, E as construct_svelte_component, N as src_url_equal, O as getAdvancementValue } from "./index-zEOjuOYs.js";
/* empty css                                              */
import { I as IconSelect } from "./IconSelect-zd-x1mh1.js";
import { S as StandardTabLayout } from "./StandardTabLayout-CpvVyUjh.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[30] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[6] = list[i];
  return child_ctx;
}
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[7] = list[i];
  return child_ctx;
}
function create_if_block(ctx) {
  let if_block0_anchor;
  let if_block1_anchor;
  let if_block2_anchor;
  let if_block3_anchor;
  let current;
  let if_block0 = (
    /*source*/
    ctx[4] && create_if_block_4(ctx)
  );
  let if_block1 = (
    /*filteredMovement*/
    ctx[10] && create_if_block_3(ctx)
  );
  let if_block2 = (
    /*filteredSenses*/
    ctx[9].length && create_if_block_2(ctx)
  );
  let if_block3 = (
    /*advancementArray*/
    ctx[3] && create_if_block_1(ctx)
  );
  return {
    c() {
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      if_block1_anchor = empty();
      if (if_block2) if_block2.c();
      if_block2_anchor = empty();
      if (if_block3) if_block3.c();
      if_block3_anchor = empty();
    },
    m(target, anchor) {
      if (if_block0) if_block0.m(target, anchor);
      insert(target, if_block0_anchor, anchor);
      if (if_block1) if_block1.m(target, anchor);
      insert(target, if_block1_anchor, anchor);
      if (if_block2) if_block2.m(target, anchor);
      insert(target, if_block2_anchor, anchor);
      if (if_block3) if_block3.m(target, anchor);
      insert(target, if_block3_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*source*/
        ctx2[4]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_4(ctx2);
          if_block0.c();
          if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (
        /*filteredMovement*/
        ctx2[10]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_3(ctx2);
          if_block1.c();
          if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (
        /*filteredSenses*/
        ctx2[9].length
      ) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
        } else {
          if_block2 = create_if_block_2(ctx2);
          if_block2.c();
          if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (
        /*advancementArray*/
        ctx2[3]
      ) {
        if (if_block3) {
          if_block3.p(ctx2, dirty);
          if (dirty[0] & /*advancementArray*/
          8) {
            transition_in(if_block3, 1);
          }
        } else {
          if_block3 = create_if_block_1(ctx2);
          if_block3.c();
          transition_in(if_block3, 1);
          if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
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
        detach(if_block0_anchor);
        detach(if_block1_anchor);
        detach(if_block2_anchor);
        detach(if_block3_anchor);
      }
      if (if_block0) if_block0.d(detaching);
      if (if_block1) if_block1.d(detaching);
      if (if_block2) if_block2.d(detaching);
      if (if_block3) if_block3.d(detaching);
    }
  };
}
function create_if_block_4(ctx) {
  let ol;
  let li;
  let t0;
  let t1;
  let t2;
  let t3;
  let t4_value = (
    /*type*/
    ctx[13].value ? ", " + /*type*/
    ctx[13].value : ""
  );
  let t4;
  let t5;
  return {
    c() {
      ol = element("ol");
      li = element("li");
      t0 = text(
        /*book*/
        ctx[12]
      );
      t1 = space();
      t2 = text(
        /*page*/
        ctx[11]
      );
      t3 = space();
      t4 = text(t4_value);
      t5 = space();
      attr(ol, "class", "properties-list");
    },
    m(target, anchor) {
      insert(target, ol, anchor);
      append(ol, li);
      append(li, t0);
      append(li, t1);
      append(li, t2);
      append(li, t3);
      append(li, t4);
      append(li, t5);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*book*/
      4096) set_data(
        t0,
        /*book*/
        ctx2[12]
      );
      if (dirty[0] & /*page*/
      2048) set_data(
        t2,
        /*page*/
        ctx2[11]
      );
      if (dirty[0] & /*type*/
      8192 && t4_value !== (t4_value = /*type*/
      ctx2[13].value ? ", " + /*type*/
      ctx2[13].value : "")) set_data(t4, t4_value);
    },
    d(detaching) {
      if (detaching) {
        detach(ol);
      }
    }
  };
}
function create_if_block_3(ctx) {
  let h2;
  let ol;
  let each_value_2 = ensure_array_like(
    /*filteredMovement*/
    ctx[10]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_2.length; i += 1) {
    each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
  }
  return {
    c() {
      h2 = element("h2");
      h2.textContent = `${localize("Tabs.Races.Movement")}`;
      ol = element("ol");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(h2, "class", "left");
      attr(ol, "class", "properties-list");
    },
    m(target, anchor) {
      insert(target, h2, anchor);
      insert(target, ol, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(ol, null);
        }
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*units, filteredMovement*/
      17408) {
        each_value_2 = ensure_array_like(
          /*filteredMovement*/
          ctx2[10]
        );
        let i;
        for (i = 0; i < each_value_2.length; i += 1) {
          const child_ctx = get_each_context_2(ctx2, each_value_2, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_2(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(ol, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_2.length;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(h2);
        detach(ol);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_each_block_2(ctx) {
  let li;
  let t0_value = (
    /*movement*/
    ctx[7].label + ""
  );
  let t0;
  let t1;
  let t2_value = (
    /*movement*/
    ctx[7].value + ""
  );
  let t2;
  let t3;
  let t4;
  return {
    c() {
      li = element("li");
      t0 = text(t0_value);
      t1 = text(" : ");
      t2 = text(t2_value);
      t3 = space();
      t4 = text(
        /*units*/
        ctx[14]
      );
      attr(li, "class", "left");
    },
    m(target, anchor) {
      insert(target, li, anchor);
      append(li, t0);
      append(li, t1);
      append(li, t2);
      append(li, t3);
      append(li, t4);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*filteredMovement*/
      1024 && t0_value !== (t0_value = /*movement*/
      ctx2[7].label + "")) set_data(t0, t0_value);
      if (dirty[0] & /*filteredMovement*/
      1024 && t2_value !== (t2_value = /*movement*/
      ctx2[7].value + "")) set_data(t2, t2_value);
      if (dirty[0] & /*units*/
      16384) set_data(
        t4,
        /*units*/
        ctx2[14]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(li);
      }
    }
  };
}
function create_if_block_2(ctx) {
  let h2;
  let ol;
  let each_value_1 = ensure_array_like(
    /*filteredSenses*/
    ctx[9]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  }
  return {
    c() {
      h2 = element("h2");
      h2.textContent = `${localize("Tabs.Races.Senses")}`;
      ol = element("ol");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(h2, "class", "left");
      attr(ol, "class", "properties-list");
    },
    m(target, anchor) {
      insert(target, h2, anchor);
      insert(target, ol, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(ol, null);
        }
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*units, filteredSenses*/
      16896) {
        each_value_1 = ensure_array_like(
          /*filteredSenses*/
          ctx2[9]
        );
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1(ctx2, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(ol, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_1.length;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(h2);
        detach(ol);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_each_block_1(ctx) {
  let li;
  let t0_value = (
    /*senses*/
    ctx[6].label + ""
  );
  let t0;
  let t1;
  let t2_value = (
    /*senses*/
    ctx[6].value + ""
  );
  let t2;
  let t3;
  let t4;
  return {
    c() {
      li = element("li");
      t0 = text(t0_value);
      t1 = text(" : ");
      t2 = text(t2_value);
      t3 = space();
      t4 = text(
        /*units*/
        ctx[14]
      );
      attr(li, "class", "left");
    },
    m(target, anchor) {
      insert(target, li, anchor);
      append(li, t0);
      append(li, t1);
      append(li, t2);
      append(li, t3);
      append(li, t4);
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*filteredSenses*/
      512 && t0_value !== (t0_value = /*senses*/
      ctx2[6].label + "")) set_data(t0, t0_value);
      if (dirty[0] & /*filteredSenses*/
      512 && t2_value !== (t2_value = /*senses*/
      ctx2[6].value + "")) set_data(t2, t2_value);
      if (dirty[0] & /*units*/
      16384) set_data(
        t4,
        /*units*/
        ctx2[14]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(li);
      }
    }
  };
}
function create_if_block_1(ctx) {
  let h2;
  let ul;
  let current;
  let each_value = ensure_array_like(
    /*advancementArray*/
    ctx[3]
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
      h2 = element("h2");
      h2.textContent = `${localize("Advancements")}`;
      ul = element("ul");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(h2, "class", "left");
      attr(ul, "class", "icon-list");
    },
    m(target, anchor) {
      insert(target, h2, anchor);
      insert(target, ul, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(ul, null);
        }
      }
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*advancementComponents, advancementArray*/
      264) {
        each_value = ensure_array_like(
          /*advancementArray*/
          ctx2[3]
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
            each_blocks[i].m(ul, null);
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
        detach(h2);
        detach(ul);
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
    ctx[30].title + ""
  );
  let t_1;
  let div2_data_tooltip_value;
  let div3;
  let switch_instance;
  let current;
  var switch_value = (
    /*advancementComponents*/
    ctx[8][
      /*advancement*/
      ctx[30].type
    ]
  );
  function switch_props(ctx2, dirty) {
    return {
      props: { advancement: (
        /*advancement*/
        ctx2[30]
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
      ctx[30].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[30].title);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow");
      attr(div2, "data-tooltip", div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx[30],
        "hint"
      ));
      attr(div2, "data-tooltip-class", "gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip");
      attr(div3, "class", "flexrow");
      attr(li, "class", "left");
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
      if (!current || dirty[0] & /*advancementArray*/
      8 && !src_url_equal(img.src, img_src_value = /*advancement*/
      ctx2[30].icon)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty[0] & /*advancementArray*/
      8 && img_alt_value !== (img_alt_value = /*advancement*/
      ctx2[30].title)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty[0] & /*advancementArray*/
      8) && t_1_value !== (t_1_value = /*advancement*/
      ctx2[30].title + "")) set_data(t_1, t_1_value);
      if (!current || dirty[0] & /*advancementArray*/
      8 && div2_data_tooltip_value !== (div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx2[30],
        "hint"
      ))) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
      if (dirty[0] & /*advancementComponents, advancementArray*/
      264 && switch_value !== (switch_value = /*advancementComponents*/
      ctx2[8][
        /*advancement*/
        ctx2[30].type
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
        if (dirty[0] & /*advancementArray*/
        8) switch_instance_changes.advancement = /*advancement*/
        ctx2[30];
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
  let current;
  function iconselect_value_binding(value) {
    ctx[22](value);
  }
  let iconselect_props = {
    class: "mb-md icon-select",
    options: (
      /*options*/
      ctx[15]
    ),
    active: (
      /*active*/
      ctx[0]
    ),
    placeHolder: (
      /*placeHolder*/
      ctx[16]
    ),
    handler: (
      /*selectRaceHandler*/
      ctx[18]
    ),
    id: "race-select"
  };
  if (
    /*value*/
    ctx[1] !== void 0
  ) {
    iconselect_props.value = /*value*/
    ctx[1];
  }
  iconselect = new IconSelect({ props: iconselect_props });
  binding_callbacks.push(() => bind(iconselect, "value", iconselect_value_binding));
  let if_block = (
    /*value*/
    ctx[1] && create_if_block(ctx)
  );
  return {
    c() {
      div3 = element("div");
      div2 = element("div");
      div0 = element("div");
      t_1 = text("*");
      div1 = element("div");
      create_component(iconselect.$$.fragment);
      if (if_block) if_block.c();
      attr(div0, "class", div0_class_value = "flex0 required " + /*$race*/
      (ctx[5] ? "" : "active"));
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
      if (if_block) if_block.m(div3, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (!current || dirty[0] & /*$race*/
      32 && div0_class_value !== (div0_class_value = "flex0 required " + /*$race*/
      (ctx2[5] ? "" : "active"))) {
        attr(div0, "class", div0_class_value);
      }
      const iconselect_changes = {};
      if (dirty[0] & /*options*/
      32768) iconselect_changes.options = /*options*/
      ctx2[15];
      if (dirty[0] & /*active*/
      1) iconselect_changes.active = /*active*/
      ctx2[0];
      if (!updating_value && dirty[0] & /*value*/
      2) {
        updating_value = true;
        iconselect_changes.value = /*value*/
        ctx2[1];
        add_flush_callback(() => updating_value = false);
      }
      iconselect.$set(iconselect_changes);
      if (
        /*value*/
        ctx2[1]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*value*/
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
        detach(div3);
      }
      destroy_component(iconselect);
      if (if_block) if_block.d();
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
      div.innerHTML = /*richHTML*/
      ctx[2];
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*richHTML*/
      4) div.innerHTML = /*richHTML*/
      ctx2[2];
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
      title: localize("Tabs.Races.Title"),
      showTitle: true,
      tabName: "race",
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
      if (dirty[0] & /*richHTML, advancementArray, advancementComponents, filteredSenses, units, filteredMovement, type, page, book, source, value, options, active, $race*/
      65343 | dirty[1] & /*$$scope*/
      64) {
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
function getAdvancements(race2) {
  if (!race2 || !race2.system || !race2.system.advancement) return [];
  return race2.system.advancement.filter((value) => !(value.type == "Trait" && value.title == "Dwarven Resilience"));
}
function instance($$self, $$props, $$invalidate) {
  let options;
  let html;
  let movement;
  let senses;
  let units;
  let type;
  let source;
  let book;
  let page;
  let advancementArray;
  let filteredMovement;
  let filteredSenses;
  let $race;
  let $readOnlyTabs;
  let $actor;
  component_subscribe($$self, race, ($$value) => $$invalidate(5, $race = $$value));
  component_subscribe($$self, readOnlyTabs, ($$value) => $$invalidate(20, $readOnlyTabs = $$value));
  let active = null, value = null, placeHolder = localize("Tabs.Races.Placeholder"), richHTML = "";
  let packs = getPacksFromSettings("races");
  let allRaceItems = extractItemsFromPacksSync(packs, ["name->label", "img", "type", "folder", "uuid->value", "_id"]);
  const showPackLabelInSelect = game.settings.get(MODULE_ID, "showPackLabelInSelect");
  let raceDefinitions = allRaceItems.filter((x) => x.type == "race").sort((a, b) => a.label.localeCompare(showPackLabelInSelect ? b.compoundLabel : b.label));
  const actor = getContext("#doc");
  component_subscribe($$self, actor, (value2) => $$invalidate(21, $actor = value2));
  let advancementComponents = {};
  async function importAdvancements(advancements) {
    if (!advancements || !Array.isArray(advancements)) return;
    for (const advancement of advancements) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-C_hrNvHc.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-DPsBF6HT.js"), "../../../molecules/dnd5e/Advancements/HitPoints.svelte": () => import("./HitPoints-B-MpmgDn.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-BX7j2MjW.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-D0YmqlIu.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-D6lnHiSw.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-Ch7Kt0Nx.js"), "../../../molecules/dnd5e/Advancements/Subclass.svelte": () => import("./Subclass-Zgo1Q8LY.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-ljNv2sO1.js") }), `../../../molecules/dnd5e/Advancements/${advancement.type}.svelte`, 7);
        $$invalidate(8, advancementComponents[advancement.type] = module.default, advancementComponents);
      } catch (error) {
        window.GAS.log.e(`Failed to load component for ${advancement.type}:`, error);
      }
    }
  }
  async function selectRaceHandler(option) {
    const selectedRace = await fromUuid(option);
    set_store_value(race, $race = selectedRace, $race);
    $$invalidate(0, active = option);
    if (!value) {
      $$invalidate(1, value = option);
    }
    const advancements = getAdvancements($race);
    await importAdvancements(advancements);
    $$invalidate(2, richHTML = await illuminatedDescription(html, $race));
    Hooks.call("gas.richhtmlReady", richHTML);
  }
  async function updateRichHTML() {
    if ($race) {
      const advancements = getAdvancements($race);
      await importAdvancements(advancements);
      $$invalidate(2, richHTML = await illuminatedDescription($race.system?.description?.value || "", $race));
    }
  }
  onMount(async () => {
    window.GAS.log.d("Race tab mounted");
    let raceUuid;
    if (window.GAS.debug) {
      raceUuid = window.GAS.race;
    }
    if (raceUuid) {
      await selectRaceHandler(raceUuid);
    }
    if ($race && (!active || !value)) {
      window.GAS.log.d("Setting active/value from $race:", $race);
      $$invalidate(0, active = $race.uuid);
      $$invalidate(1, value = $race.uuid);
      await updateRichHTML();
    }
  });
  function iconselect_value_binding(value$1) {
    value = value$1;
    $$invalidate(1, value), $$invalidate(5, $race), $$invalidate(0, active);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*$actor*/
    2097152) {
      $actor.toObject();
    }
    if ($$self.$$.dirty[0] & /*$race*/
    32) {
      $$invalidate(19, html = $race?.system?.description?.value || "");
    }
    if ($$self.$$.dirty[0] & /*$race*/
    32) {
      $$invalidate(7, movement = $race?.system?.movement);
    }
    if ($$self.$$.dirty[0] & /*$race*/
    32) {
      $$invalidate(6, senses = $race?.system?.senses);
    }
    if ($$self.$$.dirty[0] & /*$race*/
    32) {
      $$invalidate(14, units = $race?.system?.movement?.units || "");
    }
    if ($$self.$$.dirty[0] & /*$race*/
    32) {
      $$invalidate(13, type = $race?.system?.type || "");
    }
    if ($$self.$$.dirty[0] & /*$race*/
    32) {
      $$invalidate(4, source = $race?.system?.source || "");
    }
    if ($$self.$$.dirty[0] & /*source*/
    16) {
      $$invalidate(12, book = source?.book || "");
    }
    if ($$self.$$.dirty[0] & /*source*/
    16) {
      $$invalidate(11, page = source?.page ? ", p. " + source.page : "");
    }
    if ($$self.$$.dirty[0] & /*$race*/
    32) {
      $$invalidate(3, advancementArray = getAdvancements($race));
    }
    if ($$self.$$.dirty[0] & /*$race, active, value*/
    35) {
      if ($race && (!active || !value)) {
        $$invalidate(0, active = $race.uuid);
        $$invalidate(1, value = $race.uuid);
        updateRichHTML();
      }
    }
    if ($$self.$$.dirty[0] & /*$race, html*/
    524320) {
      if ($race && html) {
        updateRichHTML();
      }
    }
    if ($$self.$$.dirty[0] & /*movement*/
    128) {
      $$invalidate(10, filteredMovement = movement ? Object.keys(movement).filter((key) => key !== "units" && movement[key]).map((key) => ({ label: key, value: movement[key] })) : []);
    }
    if ($$self.$$.dirty[0] & /*senses*/
    64) {
      $$invalidate(9, filteredSenses = senses ? Object.keys(senses).filter((key) => key !== "units" && senses[key]).map((key) => ({ label: key, value: senses[key] })) : []);
    }
    if ($$self.$$.dirty[0] & /*$race, active, value, $readOnlyTabs, richHTML, advancementArray*/
    1048623) {
      window.GAS.log.d("Race component:", {
        race: $race,
        active,
        value,
        readOnlyTabs: $readOnlyTabs,
        richHTML: richHTML ? richHTML.substring(0, 50) + "..." : "",
        // truncate for logging
        advancementArray: advancementArray?.length || 0
      });
    }
  };
  $$invalidate(15, options = raceDefinitions);
  return [
    active,
    value,
    richHTML,
    advancementArray,
    source,
    $race,
    senses,
    movement,
    advancementComponents,
    filteredSenses,
    filteredMovement,
    page,
    book,
    type,
    units,
    options,
    placeHolder,
    actor,
    selectRaceHandler,
    html,
    $readOnlyTabs,
    $actor,
    iconselect_value_binding
  ];
}
class Race extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {}, null, [-1, -1]);
  }
}
export {
  Race as default
};
//# sourceMappingURL=Race-DmIVdjlq.js.map
