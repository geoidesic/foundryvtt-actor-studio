import { S as SvelteComponent, i as init, s as safe_not_equal, C as binding_callbacks, D as bind, e as element, F as text, u as create_component, b as attr, c as insert, d as append, v as mount_component, E as add_flush_callback, h as transition_in, g as group_outros, t as transition_out, f as check_outros, j as detach, w as destroy_component, k as component_subscribe, a1 as race, I as getPacksFromSettings, J as extractItemsFromPacksSync, n as getContext, o as onMount, q as tick, a as empty, R as space, G as set_data, z as ensure_array_like, l as localize, B as destroy_each, r as construct_svelte_component, K as src_url_equal, L as getAdvancementValue, _ as __variableDynamicImportRuntimeHelper, y as set_store_value } from "./index-xy-sjQlw.js";
import { I as IconSelect } from "./IconSelect-DO6FDfy7.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[27] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[4] = list[i];
  return child_ctx;
}
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[5] = list[i];
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
    ctx[2] && create_if_block_4(ctx)
  );
  let if_block1 = (
    /*filteredMovement*/
    ctx[13] && create_if_block_3(ctx)
  );
  let if_block2 = (
    /*filteredSenses*/
    ctx[12] && create_if_block_2(ctx)
  );
  let if_block3 = (
    /*advancementArray*/
    ctx[1] && create_if_block_1(ctx)
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
        ctx2[2]
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
        ctx2[13]
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
        ctx2[12]
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
        ctx2[1]
      ) {
        if (if_block3) {
          if_block3.p(ctx2, dirty);
          if (dirty[0] & /*advancementArray*/
          2) {
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
    ctx[10].value ? ", " + /*type*/
    ctx[10].value : ""
  );
  let t4;
  let t5;
  return {
    c() {
      ol = element("ol");
      li = element("li");
      t0 = text(
        /*book*/
        ctx[9]
      );
      t1 = space();
      t2 = text(
        /*page*/
        ctx[8]
      );
      t3 = space();
      t4 = text(t4_value);
      t5 = space();
      attr(ol, "class", "properties-list svelte-gas-a7sibl");
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
      512) set_data(
        t0,
        /*book*/
        ctx2[9]
      );
      if (dirty[0] & /*page*/
      256) set_data(
        t2,
        /*page*/
        ctx2[8]
      );
      if (dirty[0] & /*type*/
      1024 && t4_value !== (t4_value = /*type*/
      ctx2[10].value ? ", " + /*type*/
      ctx2[10].value : "")) set_data(t4, t4_value);
    },
    d(detaching) {
      if (detaching) {
        detach(ol);
      }
    }
  };
}
function create_if_block_3(ctx) {
  let h3;
  let ol;
  let each_value_2 = ensure_array_like(
    /*filteredMovement*/
    ctx[13]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_2.length; i += 1) {
    each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
  }
  return {
    c() {
      h3 = element("h3");
      h3.textContent = `${localize("GAS.Tabs.Races.Movement")}`;
      ol = element("ol");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(h3, "class", "left");
      attr(ol, "class", "properties-list svelte-gas-a7sibl");
    },
    m(target, anchor) {
      insert(target, h3, anchor);
      insert(target, ol, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(ol, null);
        }
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*units, filteredMovement*/
      10240) {
        each_value_2 = ensure_array_like(
          /*filteredMovement*/
          ctx2[13]
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
        detach(h3);
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
    ctx[5].label + ""
  );
  let t0;
  let t1;
  let t2_value = (
    /*movement*/
    ctx[5].value + ""
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
        ctx[11]
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
      8192 && t0_value !== (t0_value = /*movement*/
      ctx2[5].label + "")) set_data(t0, t0_value);
      if (dirty[0] & /*filteredMovement*/
      8192 && t2_value !== (t2_value = /*movement*/
      ctx2[5].value + "")) set_data(t2, t2_value);
      if (dirty[0] & /*units*/
      2048) set_data(
        t4,
        /*units*/
        ctx2[11]
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
  let h3;
  let ol;
  let each_value_1 = ensure_array_like(
    /*filteredSenses*/
    ctx[12]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  }
  return {
    c() {
      h3 = element("h3");
      h3.textContent = `${localize("GAS.Tabs.Races.Senses")}`;
      ol = element("ol");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(h3, "class", "left");
      attr(ol, "class", "properties-list svelte-gas-a7sibl");
    },
    m(target, anchor) {
      insert(target, h3, anchor);
      insert(target, ol, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(ol, null);
        }
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*units, filteredSenses*/
      6144) {
        each_value_1 = ensure_array_like(
          /*filteredSenses*/
          ctx2[12]
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
        detach(h3);
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
    ctx[4].label + ""
  );
  let t0;
  let t1;
  let t2_value = (
    /*senses*/
    ctx[4].value + ""
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
        ctx[11]
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
      4096 && t0_value !== (t0_value = /*senses*/
      ctx2[4].label + "")) set_data(t0, t0_value);
      if (dirty[0] & /*filteredSenses*/
      4096 && t2_value !== (t2_value = /*senses*/
      ctx2[4].value + "")) set_data(t2, t2_value);
      if (dirty[0] & /*units*/
      2048) set_data(
        t4,
        /*units*/
        ctx2[11]
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
  let h3;
  let ul;
  let current;
  let each_value = ensure_array_like(
    /*advancementArray*/
    ctx[1]
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
      h3 = element("h3");
      h3.textContent = `${localize("GAS.Advancements")}`;
      ul = element("ul");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(h3, "class", "left");
      attr(ul, "class", "icon-list");
    },
    m(target, anchor) {
      insert(target, h3, anchor);
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
      16386) {
        each_value = ensure_array_like(
          /*advancementArray*/
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
        detach(h3);
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
  let t_value = (
    /*advancement*/
    ctx[27].title + ""
  );
  let t;
  let div2_data_tooltip_value;
  let div3;
  let switch_instance;
  let current;
  var switch_value = (
    /*advancementComponents*/
    ctx[14][
      /*advancement*/
      ctx[27].type
    ]
  );
  function switch_props(ctx2, dirty) {
    return {
      props: { advancement: (
        /*advancement*/
        ctx2[27]
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
      ctx[27].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[27].title);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow svelte-gas-a7sibl");
      attr(div2, "data-tooltip", div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx[27],
        "hint"
      ));
      attr(div2, "data-tooltip-class", "gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip");
      attr(div3, "class", "flexrow svelte-gas-a7sibl");
      attr(li, "class", "left");
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
      if (!current || dirty[0] & /*advancementArray*/
      2 && !src_url_equal(img.src, img_src_value = /*advancement*/
      ctx2[27].icon)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty[0] & /*advancementArray*/
      2 && img_alt_value !== (img_alt_value = /*advancement*/
      ctx2[27].title)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty[0] & /*advancementArray*/
      2) && t_value !== (t_value = /*advancement*/
      ctx2[27].title + "")) set_data(t, t_value);
      if (!current || dirty[0] & /*advancementArray*/
      2 && div2_data_tooltip_value !== (div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx2[27],
        "hint"
      ))) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
      if (dirty[0] & /*advancementComponents, advancementArray*/
      16386 && switch_value !== (switch_value = /*advancementComponents*/
      ctx2[14][
        /*advancement*/
        ctx2[27].type
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
        2) switch_instance_changes.advancement = /*advancement*/
        ctx2[27];
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
    ctx[20](value);
  }
  let iconselect_props = {
    class: "mb-md icon-select",
    options: (
      /*options*/
      ctx[15]
    ),
    active: (
      /*active*/
      ctx[6]
    ),
    placeHolder: (
      /*placeHolder*/
      ctx[16]
    ),
    handler: (
      /*selectHandler*/
      ctx[18]
    ),
    id: "race-select"
  };
  if (
    /*value*/
    ctx[0] !== void 0
  ) {
    iconselect_props.value = /*value*/
    ctx[0];
  }
  iconselect = new IconSelect({ props: iconselect_props });
  binding_callbacks.push(() => bind(iconselect, "value", iconselect_value_binding));
  let if_block = (
    /*value*/
    ctx[0] && create_if_block(ctx)
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
      attr(div0, "class", div0_class_value = "flex0 required " + /*$race*/
      (ctx[3] ? "" : "active"));
      attr(div1, "class", "flex3");
      attr(div2, "class", "flexrow svelte-gas-a7sibl");
      attr(div3, "class", "flex2 pr-sm col-a");
      attr(div4, "class", "flex0 border-right right-border-gradient-mask");
      attr(div5, "class", "flex3 left pl-md scroll col-b");
      attr(div6, "class", "flexrow svelte-gas-a7sibl");
      attr(div7, "class", "content svelte-gas-a7sibl");
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
      div5.innerHTML = /*richHTML*/
      ctx[7];
      current = true;
    },
    p(ctx2, dirty) {
      if (!current || dirty[0] & /*$race*/
      8 && div0_class_value !== (div0_class_value = "flex0 required " + /*$race*/
      (ctx2[3] ? "" : "active"))) {
        attr(div0, "class", div0_class_value);
      }
      const iconselect_changes = {};
      if (dirty[0] & /*options*/
      32768) iconselect_changes.options = /*options*/
      ctx2[15];
      if (dirty[0] & /*active*/
      64) iconselect_changes.active = /*active*/
      ctx2[6];
      if (!updating_value && dirty[0] & /*value*/
      1) {
        updating_value = true;
        iconselect_changes.value = /*value*/
        ctx2[0];
        add_flush_callback(() => updating_value = false);
      }
      iconselect.$set(iconselect_changes);
      if (
        /*value*/
        ctx2[0]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*value*/
          1) {
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
      if (!current || dirty[0] & /*richHTML*/
      128) div5.innerHTML = /*richHTML*/
      ctx2[7];
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
  let options;
  let html;
  let movement;
  let senses;
  let advancementComponents;
  let filteredMovement;
  let filteredSenses;
  let units;
  let type;
  let source;
  let book;
  let page;
  let advancementArray;
  let $race;
  let $actor;
  component_subscribe($$self, race, ($$value) => $$invalidate(3, $race = $$value));
  let active = null, value = null, placeHolder = "Races", richHTML = "";
  let packs = getPacksFromSettings("races");
  let allRaceItems = extractItemsFromPacksSync(packs, ["name->label", "img", "type", "folder", "uuid->value", "_id"]);
  game.system.log.d("allRaceItems", allRaceItems);
  let raceDefinitions = allRaceItems.filter((x) => x.type == "race").sort((a, b) => a.label.localeCompare(b.label));
  const actor = getContext("#doc");
  component_subscribe($$self, actor, (value2) => $$invalidate(19, $actor = value2));
  const importAdvancements = async () => {
    for (const advancement of advancementArray) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-BiAH5K5Y.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-DcvmaOYq.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-Dov1LzKb.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-DEVwdSPh.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-D2PtZsxQ.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-USDQkKNo.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-BlRk4F13.js") }), `../../../molecules/dnd5e/Advancements/${advancement.type}.svelte`, 7);
        $$invalidate(14, advancementComponents[advancement.type] = module.default, advancementComponents);
      } catch (error) {
        log.e(`Failed to load component for ${advancement.type}:`, error);
      }
    }
  };
  const selectHandler = async (option) => {
    set_store_value(race, $race = await fromUuid(option), $race);
    $$invalidate(6, active = option);
    await tick();
    await importAdvancements();
    $$invalidate(7, richHTML = await TextEditor.enrichHTML(html));
  };
  onMount(async () => {
    if ($race) {
      $$invalidate(0, value = $race.uuid);
    }
    await tick();
    await importAdvancements();
    $$invalidate(7, richHTML = await TextEditor.enrichHTML(html));
  });
  function iconselect_value_binding(value$1) {
    value = value$1;
    $$invalidate(0, value);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*$actor*/
    524288) {
      $actor.toObject();
    }
    if ($$self.$$.dirty[0] & /*$race*/
    8) {
      html = $race?.system?.description?.value || "";
    }
    if ($$self.$$.dirty[0] & /*$race*/
    8) {
      $$invalidate(5, movement = $race?.system?.movement);
    }
    if ($$self.$$.dirty[0] & /*$race*/
    8) {
      $$invalidate(4, senses = $race?.system?.senses);
    }
    if ($$self.$$.dirty[0] & /*movement*/
    32) {
      $$invalidate(13, filteredMovement = movement ? Object.keys(movement).filter((key) => key !== "units" && movement[key]).map((key) => ({ label: key, value: movement[key] })) : []);
    }
    if ($$self.$$.dirty[0] & /*senses*/
    16) {
      $$invalidate(12, filteredSenses = senses ? Object.keys(senses).filter((key) => key !== "units" && senses[key]).map((key) => ({ label: key, value: senses[key] })) : []);
    }
    if ($$self.$$.dirty[0] & /*$race*/
    8) {
      $$invalidate(11, units = $race?.system?.movement?.units || "");
    }
    if ($$self.$$.dirty[0] & /*$race*/
    8) {
      $$invalidate(10, type = $race?.system?.type || "");
    }
    if ($$self.$$.dirty[0] & /*$race*/
    8) {
      $$invalidate(2, source = $race?.system?.source || "");
    }
    if ($$self.$$.dirty[0] & /*source*/
    4) {
      $$invalidate(9, book = source?.book || "");
    }
    if ($$self.$$.dirty[0] & /*source*/
    4) {
      $$invalidate(8, page = source?.page ? ", p. " + source.page : "");
    }
    if ($$self.$$.dirty[0] & /*$race*/
    8) {
      $$invalidate(1, advancementArray = $race?.system?.advancement ? $race.system.advancement.filter((value2) => !(value2.type == "Trait" && value2.title == "Dwarven Resilience")) : []);
    }
    if ($$self.$$.dirty[0] & /*advancementArray*/
    2) {
      game.system.log.d(advancementArray);
    }
  };
  $$invalidate(15, options = raceDefinitions);
  $$invalidate(14, advancementComponents = {});
  return [
    value,
    advancementArray,
    source,
    $race,
    senses,
    movement,
    active,
    richHTML,
    page,
    book,
    type,
    units,
    filteredSenses,
    filteredMovement,
    advancementComponents,
    options,
    placeHolder,
    actor,
    selectHandler,
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
//# sourceMappingURL=Race-DSoyEAyu.js.map
