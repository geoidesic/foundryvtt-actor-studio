import { S as SvelteComponent, i as init, s as safe_not_equal, C as binding_callbacks, D as bind, e as element, u as create_component, b as attr, c as insert, d as append, v as mount_component, E as add_flush_callback, h as transition_in, g as group_outros, t as transition_out, f as check_outros, j as detach, w as destroy_component, k as component_subscribe, I as background, J as getPacksFromSettings, K as extractItemsFromPacks, n as getContext, o as onMount, x as log, q as tick, z as ensure_array_like, l as localize, B as destroy_each, r as construct_svelte_component, F as text, L as src_url_equal, G as set_data, _ as __variableDynamicImportRuntimeHelper, y as set_store_value } from "./index-EY5H_HHV.js";
import { I as IconSelect } from "./IconSelect-KcXamcZo.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[17] = list[i];
  return child_ctx;
}
function create_if_block(ctx) {
  let h3;
  let ul;
  let current;
  let each_value = ensure_array_like(
    /*advancementArray*/
    ctx[4]
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
      24) {
        each_value = ensure_array_like(
          /*advancementArray*/
          ctx2[4]
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
    ctx[17].title + ""
  );
  let t;
  let div2_data_tooltip_value;
  let div3;
  let switch_instance;
  let current;
  var switch_value = (
    /*advancementComponents*/
    ctx[3][
      /*advancement*/
      ctx[17].type
    ]
  );
  function switch_props(ctx2, dirty) {
    return {
      props: { advancement: (
        /*advancement*/
        ctx2[17]
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
      ctx[17].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[17].title);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow svelte-gas-a7sibl");
      attr(div2, "data-tooltip", div2_data_tooltip_value = /*advancement*/
      ctx[17].configuration?.hint || null);
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
      16 && !src_url_equal(img.src, img_src_value = /*advancement*/
      ctx2[17].icon)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty & /*advancementArray*/
      16 && img_alt_value !== (img_alt_value = /*advancement*/
      ctx2[17].title)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty & /*advancementArray*/
      16) && t_value !== (t_value = /*advancement*/
      ctx2[17].title + "")) set_data(t, t_value);
      if (!current || dirty & /*advancementArray*/
      16 && div2_data_tooltip_value !== (div2_data_tooltip_value = /*advancement*/
      ctx2[17].configuration?.hint || null)) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
      if (dirty & /*advancementComponents, advancementArray*/
      24 && switch_value !== (switch_value = /*advancementComponents*/
      ctx2[3][
        /*advancement*/
        ctx2[17].type
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
        16) switch_instance_changes.advancement = /*advancement*/
        ctx2[17];
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
    ctx[9](value);
  }
  let iconselect_props = {
    class: "icon-select",
    options: (
      /*options*/
      ctx[5]
    ),
    active: (
      /*active*/
      ctx[1]
    ),
    placeHolder: (
      /*placeHolder*/
      ctx[6]
    ),
    handler: (
      /*selectHandler*/
      ctx[7]
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
    /*advancementArray*/
    ctx[4].length && create_if_block(ctx)
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
      ctx[2];
      current = true;
    },
    p(ctx2, [dirty]) {
      const iconselect_changes = {};
      if (dirty & /*options*/
      32) iconselect_changes.options = /*options*/
      ctx2[5];
      if (dirty & /*active*/
      2) iconselect_changes.active = /*active*/
      ctx2[1];
      if (!updating_value && dirty & /*value*/
      1) {
        updating_value = true;
        iconselect_changes.value = /*value*/
        ctx2[0];
        add_flush_callback(() => updating_value = false);
      }
      iconselect.$set(iconselect_changes);
      if (
        /*advancementArray*/
        ctx2[4].length
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*advancementArray*/
          16) {
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
      4) div2.innerHTML = /*richHTML*/
      ctx2[2];
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
  let advancementArray;
  let $background;
  component_subscribe($$self, background, ($$value) => $$invalidate(8, $background = $$value));
  let active = null, value = null, placeHolder = "Backgrounds";
  let packs = getPacksFromSettings("backgrounds");
  let allItems = extractItemsFromPacks(packs, ["name->label", "img", "type", "folder", "uuid->value", "_id"]);
  let itemDefinitions = allItems.filter((x) => x.type == "background").sort((a, b) => a.label.localeCompare(b.label));
  getContext("#doc");
  let richHTML = "";
  const importAdvancements = async () => {
    for (const advancement of advancementArray) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-B5yBcFv9.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-DMTotE3D.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-RhCS_yYT.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-D-RIv5Vr.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-BSrQK59Y.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-PyQJqDej.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-C4GOrjyw.js") }), `../../../molecules/dnd5e/Advancements/${advancement.type}.svelte`, 7);
        $$invalidate(3, advancementComponents[advancement.type] = module.default, advancementComponents);
      } catch (error) {
        log.e(`Failed to load component for ${advancement.type}:`, error);
      }
    }
  };
  const selectHandler = async (option) => {
    set_store_value(background, $background = await fromUuid(option), $background);
    log.d("background", $background);
    $$invalidate(1, active = option);
    await tick();
    await importAdvancements();
    $$invalidate(2, richHTML = await TextEditor.enrichHTML(html));
  };
  onMount(async () => {
    if ($background) {
      log.d("background", background);
      $$invalidate(0, value = $background.uuid);
      await tick();
      await importAdvancements();
      $$invalidate(2, richHTML = await TextEditor.enrichHTML(html));
    }
  });
  function iconselect_value_binding(value$1) {
    value = value$1;
    $$invalidate(0, value);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$background*/
    256) {
      html = $background?.system?.description.value || "";
    }
    if ($$self.$$.dirty & /*$background*/
    256) {
      $$invalidate(4, advancementArray = $background?.advancement?.byId ? Object.entries($background.advancement.byId).map(([id, value2]) => ({ ...value2, id })) : []);
    }
  };
  $$invalidate(5, options = itemDefinitions);
  $$invalidate(3, advancementComponents = {});
  allItems.filter((x) => x.type == "background");
  return [
    value,
    active,
    richHTML,
    advancementComponents,
    advancementArray,
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
//# sourceMappingURL=Background-B_lkwx_w.js.map
