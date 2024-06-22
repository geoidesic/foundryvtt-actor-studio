import { S as SvelteComponent, i as init, s as safe_not_equal, C as binding_callbacks, D as bind, e as element, u as create_component, b as attr, c as insert, d as append, v as mount_component, E as add_flush_callback, h as transition_in, g as group_outros, t as transition_out, f as check_outros, j as detach, w as destroy_component, k as component_subscribe, H as background, I as getPacksFromSettings, J as getFoldersFromMultiplePacks, K as extractItemsFromPacks, x as log, n as getContext, o as onMount, q as tick, a as empty, z as ensure_array_like, B as destroy_each, F as text, L as src_url_equal, G as set_data, l as localize, r as construct_svelte_component, _ as __variableDynamicImportRuntimeHelper, y as set_store_value } from "./index-D6gP_MKk.js";
import { I as IconSelect } from "./IconSelect-CrchFDO8.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[23] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[26] = list[i];
  return child_ctx;
}
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[26] = list[i];
  return child_ctx;
}
function create_if_block(ctx) {
  let if_block0_anchor;
  let if_block1_anchor;
  let if_block2_anchor;
  let current;
  let if_block0 = (
    /*equipmentFolderId*/
    ctx[2] && create_if_block_3(ctx)
  );
  let if_block1 = (
    /*featureFolderId*/
    ctx[1] && create_if_block_2(ctx)
  );
  let if_block2 = (
    /*advancementArray*/
    ctx[6].length && create_if_block_1(ctx)
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
        /*equipmentFolderId*/
        ctx2[2]
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_3(ctx2);
          if_block0.c();
          if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (
        /*featureFolderId*/
        ctx2[1]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_2(ctx2);
          if_block1.c();
          if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (
        /*advancementArray*/
        ctx2[6].length
      ) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
          if (dirty & /*advancementArray*/
          64) {
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
      transition_in(if_block2);
      current = true;
    },
    o(local) {
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
function create_if_block_3(ctx) {
  let h3;
  let ul;
  let each_value_2 = ensure_array_like(
    /*equipment*/
    ctx[9]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_2.length; i += 1) {
    each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
  }
  return {
    c() {
      h3 = element("h3");
      h3.textContent = "Equipment";
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
    },
    p(ctx2, dirty) {
      if (dirty & /*equipment*/
      512) {
        each_value_2 = ensure_array_like(
          /*equipment*/
          ctx2[9]
        );
        let i;
        for (i = 0; i < each_value_2.length; i += 1) {
          const child_ctx = get_each_context_2(ctx2, each_value_2, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_2(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(ul, null);
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
        detach(ul);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_each_block_2(ctx) {
  let li;
  let div4;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div3;
  let div1;
  let t0_value = (
    /*item*/
    ctx[26].label + ""
  );
  let t0;
  let div2;
  let t1_value = (
    /*item*/
    ctx[26].type + ""
  );
  let t1;
  return {
    c() {
      li = element("li");
      div4 = element("div");
      div0 = element("div");
      img = element("img");
      div3 = element("div");
      div1 = element("div");
      t0 = text(t0_value);
      div2 = element("div");
      t1 = text(t1_value);
      attr(img, "class", "icon");
      if (!src_url_equal(img.src, img_src_value = /*item*/
      ctx[26].img)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[26].label);
      attr(div0, "class", "flex0 relative image mr-xs");
      attr(div1, "class", "caption");
      attr(div2, "class", "caption light");
      attr(div3, "class", "flex2 flexcol svelte-gas-a7sibl");
      attr(div4, "class", "flexrow svelte-gas-a7sibl");
      attr(li, "class", "left tight");
    },
    m(target, anchor) {
      insert(target, li, anchor);
      append(li, div4);
      append(div4, div0);
      append(div0, img);
      append(div4, div3);
      append(div3, div1);
      append(div1, t0);
      append(div3, div2);
      append(div2, t1);
    },
    p(ctx2, dirty) {
      if (dirty & /*equipment*/
      512 && !src_url_equal(img.src, img_src_value = /*item*/
      ctx2[26].img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*equipment*/
      512 && img_alt_value !== (img_alt_value = /*item*/
      ctx2[26].label)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty & /*equipment*/
      512 && t0_value !== (t0_value = /*item*/
      ctx2[26].label + "")) set_data(t0, t0_value);
      if (dirty & /*equipment*/
      512 && t1_value !== (t1_value = /*item*/
      ctx2[26].type + "")) set_data(t1, t1_value);
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
  let ul;
  let each_value_1 = ensure_array_like(
    /*features*/
    ctx[8]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  }
  return {
    c() {
      h3 = element("h3");
      h3.textContent = "Features";
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
    },
    p(ctx2, dirty) {
      if (dirty & /*features*/
      256) {
        each_value_1 = ensure_array_like(
          /*features*/
          ctx2[8]
        );
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1(ctx2, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(ul, null);
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
        detach(ul);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_each_block_1(ctx) {
  let li;
  let div4;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div3;
  let div1;
  let t0_value = (
    /*item*/
    ctx[26].label + ""
  );
  let t0;
  let div2;
  let t1_value = (
    /*item*/
    ctx[26].type + ""
  );
  let t1;
  return {
    c() {
      li = element("li");
      div4 = element("div");
      div0 = element("div");
      img = element("img");
      div3 = element("div");
      div1 = element("div");
      t0 = text(t0_value);
      div2 = element("div");
      t1 = text(t1_value);
      attr(img, "class", "icon");
      if (!src_url_equal(img.src, img_src_value = /*item*/
      ctx[26].img)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[26].label);
      attr(div0, "class", "flex0 relative image mr-xs");
      attr(div1, "class", "caption");
      attr(div2, "class", "caption light");
      attr(div3, "class", "flex2 flexcol svelte-gas-a7sibl");
      attr(div4, "class", "flexrow svelte-gas-a7sibl");
      attr(li, "class", "left tight");
    },
    m(target, anchor) {
      insert(target, li, anchor);
      append(li, div4);
      append(div4, div0);
      append(div0, img);
      append(div4, div3);
      append(div3, div1);
      append(div1, t0);
      append(div3, div2);
      append(div2, t1);
    },
    p(ctx2, dirty) {
      if (dirty & /*features*/
      256 && !src_url_equal(img.src, img_src_value = /*item*/
      ctx2[26].img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*features*/
      256 && img_alt_value !== (img_alt_value = /*item*/
      ctx2[26].label)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty & /*features*/
      256 && t0_value !== (t0_value = /*item*/
      ctx2[26].label + "")) set_data(t0, t0_value);
      if (dirty & /*features*/
      256 && t1_value !== (t1_value = /*item*/
      ctx2[26].type + "")) set_data(t1, t1_value);
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
    ctx[6]
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
      if (dirty & /*advancementComponents, advancementArray*/
      192) {
        each_value = ensure_array_like(
          /*advancementArray*/
          ctx2[6]
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
    ctx[23].title + ""
  );
  let t;
  let div2_data_tooltip_value;
  let div3;
  let switch_instance;
  let current;
  var switch_value = (
    /*advancementComponents*/
    ctx[7][
      /*advancement*/
      ctx[23].type
    ]
  );
  function switch_props(ctx2, dirty) {
    return {
      props: { advancement: (
        /*advancement*/
        ctx2[23]
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
      ctx[23].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[23].title);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow svelte-gas-a7sibl");
      attr(div2, "data-tooltip", div2_data_tooltip_value = /*advancement*/
      ctx[23].configuration?.hint || null);
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
      if (!current || dirty & /*advancementArray*/
      64 && !src_url_equal(img.src, img_src_value = /*advancement*/
      ctx2[23].icon)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty & /*advancementArray*/
      64 && img_alt_value !== (img_alt_value = /*advancement*/
      ctx2[23].title)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty & /*advancementArray*/
      64) && t_value !== (t_value = /*advancement*/
      ctx2[23].title + "")) set_data(t, t_value);
      if (!current || dirty & /*advancementArray*/
      64 && div2_data_tooltip_value !== (div2_data_tooltip_value = /*advancement*/
      ctx2[23].configuration?.hint || null)) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
      if (dirty & /*advancementComponents, advancementArray*/
      192 && switch_value !== (switch_value = /*advancementComponents*/
      ctx2[7][
        /*advancement*/
        ctx2[23].type
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
        if (dirty & /*advancementArray*/
        64) switch_instance_changes.advancement = /*advancement*/
        ctx2[23];
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
  let div4;
  let div3;
  let div0;
  let iconselect;
  let updating_value;
  let div1;
  let div2;
  let current;
  function iconselect_value_binding(value) {
    ctx[14](value);
  }
  let iconselect_props = {
    class: "icon-select",
    options: (
      /*options*/
      ctx[10]
    ),
    active: (
      /*active*/
      ctx[4]
    ),
    placeHolder: (
      /*placeHolder*/
      ctx[11]
    ),
    handler: (
      /*selectHandler*/
      ctx[12]
    ),
    id: "background-select"
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
    /*backgroundFolders*/
    ctx[3] && create_if_block(ctx)
  );
  return {
    c() {
      div4 = element("div");
      div3 = element("div");
      div0 = element("div");
      create_component(iconselect.$$.fragment);
      if (if_block) if_block.c();
      div1 = element("div");
      div1.innerHTML = ``;
      div2 = element("div");
      attr(div0, "class", "flex2 pr-sm col-a");
      attr(div1, "class", "flex0 border-right right-border-gradient-mask");
      attr(div2, "class", "flex3 left pl-md scroll col-b");
      attr(div3, "class", "flexrow svelte-gas-a7sibl");
      attr(div4, "class", "content svelte-gas-a7sibl");
    },
    m(target, anchor) {
      insert(target, div4, anchor);
      append(div4, div3);
      append(div3, div0);
      mount_component(iconselect, div0, null);
      if (if_block) if_block.m(div0, null);
      append(div3, div1);
      append(div3, div2);
      div2.innerHTML = /*richHTML*/
      ctx[5];
      current = true;
    },
    p(ctx2, [dirty]) {
      const iconselect_changes = {};
      if (dirty & /*options*/
      1024) iconselect_changes.options = /*options*/
      ctx2[10];
      if (dirty & /*active*/
      16) iconselect_changes.active = /*active*/
      ctx2[4];
      if (!updating_value && dirty & /*value*/
      1) {
        updating_value = true;
        iconselect_changes.value = /*value*/
        ctx2[0];
        add_flush_callback(() => updating_value = false);
      }
      iconselect.$set(iconselect_changes);
      if (
        /*backgroundFolders*/
        ctx2[3]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*backgroundFolders*/
          8) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(div0, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
      if (!current || dirty & /*richHTML*/
      32) div2.innerHTML = /*richHTML*/
      ctx2[5];
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
        detach(div4);
      }
      destroy_component(iconselect);
      if (if_block) if_block.d();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let options;
  let advancementComponents;
  let html;
  let backgroundFolders;
  let equipmentFolderId;
  let featureFolderId;
  let equipment;
  let features;
  let advancementArray;
  let $background;
  component_subscribe($$self, background, ($$value) => $$invalidate(13, $background = $$value));
  let active = null, value = null, placeHolder = "Backgrounds";
  let packs = getPacksFromSettings("backgrounds");
  let folders = getFoldersFromMultiplePacks(packs, 1);
  let folderIds = folders.map((x) => x._id);
  let allItems = extractItemsFromPacks(packs, ["name->label", "img", "type", "folder", "uuid->value", "_id"]);
  let itemDefinitions = allItems.filter((x) => !folderIds.includes(x.folder)).sort((a, b) => a.label.localeCompare(b.label));
  log.d("itemDefinitions", itemDefinitions);
  getContext("#doc");
  let richHTML = "";
  const importAdvancements = async () => {
    log.d("advancementArray", advancementArray);
    for (const advancement of advancementArray) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-CKfkn2ca.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-DjMUw1M8.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-D0CJWiYX.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-BZUJhDKA.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-CAS4Smh8.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-C8T_UrZb.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-DSypnHdB.js") }), `../../../molecules/dnd5e/Advancements/${advancement.type}.svelte`, 7);
        $$invalidate(7, advancementComponents[advancement.type] = module.default, advancementComponents);
      } catch (error) {
        log.e(`Failed to load component for ${advancement.type}:`, error);
      }
    }
  };
  const selectHandler = async (option) => {
    set_store_value(background, $background = await fromUuid(option), $background);
    $$invalidate(4, active = option);
    await tick();
    await importAdvancements();
    $$invalidate(5, richHTML = await TextEditor.enrichHTML(html));
    log.d("$background", $background);
    log.d("advancementArray", advancementArray);
  };
  onMount(async () => {
    if ($background) {
      $$invalidate(0, value = $background.uuid);
      await tick();
      await importAdvancements();
      $$invalidate(5, richHTML = await TextEditor.enrichHTML(html));
    }
  });
  function iconselect_value_binding(value$1) {
    value = value$1;
    $$invalidate(0, value);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$background*/
    8192) {
      html = $background?.system?.description.value || "";
    }
    if ($$self.$$.dirty & /*$background*/
    8192) {
      $$invalidate(3, backgroundFolders = folders.filter((x) => x.depth == 1 && x.name.includes($background?.name)));
    }
    if ($$self.$$.dirty & /*backgroundFolders, $background*/
    8200) {
      $$invalidate(2, equipmentFolderId = backgroundFolders.find((x) => x.name == $background.name + " Equipment")?.key);
    }
    if ($$self.$$.dirty & /*backgroundFolders, $background*/
    8200) {
      $$invalidate(1, featureFolderId = backgroundFolders.find((x) => x.name == $background.name + " Feature")?.key);
    }
    if ($$self.$$.dirty & /*equipmentFolderId*/
    4) {
      $$invalidate(9, equipment = equipmentFolderId ? allItems.filter((x) => x.folder == equipmentFolderId) : []);
    }
    if ($$self.$$.dirty & /*featureFolderId*/
    2) {
      $$invalidate(8, features = featureFolderId ? allItems.filter((x) => x.folder == featureFolderId) : []);
    }
    if ($$self.$$.dirty & /*$background*/
    8192) {
      $$invalidate(6, advancementArray = $background?.advancement?.byId ? Object.entries($background.advancement.byId).map(([id, value2]) => ({ ...value2, id })) : []);
    }
  };
  $$invalidate(10, options = itemDefinitions);
  $$invalidate(7, advancementComponents = {});
  return [
    value,
    featureFolderId,
    equipmentFolderId,
    backgroundFolders,
    active,
    richHTML,
    advancementArray,
    advancementComponents,
    features,
    equipment,
    options,
    placeHolder,
    selectHandler,
    $background,
    iconselect_value_binding
  ];
}
class Background extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {});
  }
}
export {
  Background as default
};
//# sourceMappingURL=Background-DvuZs1fg.js.map
