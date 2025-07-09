import { S as SvelteComponent, i as init, s as safe_not_equal, v as binding_callbacks, w as bind, d as detach, x as destroy_component, t as transition_out, a as transition_in, j as attr, y as add_flush_callback, g as group_outros, c as check_outros, b as insert, e as append, z as mount_component, f as element, G as text, A as create_component, k as component_subscribe, I as background, r as readOnlyTabs, J as getPacksFromSettings, K as extractItemsFromPacksSync, n as getContext, o as onMount, B as ensure_array_like, D as destroy_each, l as localize, u as set_store_value, q as tick, L as illuminatedDescription, E as construct_svelte_component, N as src_url_equal, F as set_data, O as getAdvancementValue, _ as __variableDynamicImportRuntimeHelper } from "./index-DaNCaFau.js";
import { I as IconSelect } from "./IconSelect-sVussxSM.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[19] = list[i];
  return child_ctx;
}
function create_if_block(ctx) {
  let h3;
  let ul;
  let current;
  let each_value = ensure_array_like(
    /*advancementArray*/
    ctx[5]
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
      48) {
        each_value = ensure_array_like(
          /*advancementArray*/
          ctx2[5]
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
    ctx[19].title + ""
  );
  let t;
  let div2_data_tooltip_value;
  let div3;
  let switch_instance;
  let current;
  var switch_value = (
    /*advancementComponents*/
    ctx[4][
      /*advancement*/
      ctx[19].type
    ]
  );
  function switch_props(ctx2, dirty) {
    return {
      props: { advancement: (
        /*advancement*/
        ctx2[19]
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
      ctx[19].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[19].title);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow svelte-gas-1pnykxp");
      attr(div2, "data-tooltip", div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx[19],
        "hint"
      ));
      attr(div2, "data-tooltip-class", "gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip");
      attr(div3, "class", "flexrow svelte-gas-1pnykxp");
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
      32 && !src_url_equal(img.src, img_src_value = /*advancement*/
      ctx2[19].icon)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty & /*advancementArray*/
      32 && img_alt_value !== (img_alt_value = /*advancement*/
      ctx2[19].title)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty & /*advancementArray*/
      32) && t_value !== (t_value = /*advancement*/
      ctx2[19].title + "")) set_data(t, t_value);
      if (!current || dirty & /*advancementArray*/
      32 && div2_data_tooltip_value !== (div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx2[19],
        "hint"
      ))) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
      if (dirty & /*advancementComponents, advancementArray*/
      48 && switch_value !== (switch_value = /*advancementComponents*/
      ctx2[4][
        /*advancement*/
        ctx2[19].type
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
        32) switch_instance_changes.advancement = /*advancement*/
        ctx2[19];
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
    ctx[11](value);
  }
  let iconselect_props = {
    class: "mb-md icon-select",
    options: (
      /*options*/
      ctx[7]
    ),
    active: (
      /*active*/
      ctx[2]
    ),
    placeHolder: (
      /*placeHolder*/
      ctx[8]
    ),
    handler: (
      /*selectBackgroundHandler*/
      ctx[9]
    ),
    id: "background-select",
    disabled: (
      /*isDisabled*/
      ctx[6]
    )
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
    ctx[5].length && create_if_block(ctx)
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
      attr(div0, "class", div0_class_value = "flex0 required " + /*$background*/
      (ctx[1] ? "" : "active"));
      attr(div1, "class", "flex3");
      attr(div2, "class", "flexrow svelte-gas-1pnykxp");
      attr(div3, "class", "flex2 pr-sm col-a");
      attr(div4, "class", "flex0 border-right right-border-gradient-mask");
      attr(div5, "class", "flex3 left pl-md scroll col-b");
      attr(div6, "class", "flexrow svelte-gas-1pnykxp");
      attr(div7, "class", "content svelte-gas-1pnykxp");
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
      ctx[3];
      current = true;
    },
    p(ctx2, [dirty]) {
      if (!current || dirty & /*$background*/
      2 && div0_class_value !== (div0_class_value = "flex0 required " + /*$background*/
      (ctx2[1] ? "" : "active"))) {
        attr(div0, "class", div0_class_value);
      }
      const iconselect_changes = {};
      if (dirty & /*options*/
      128) iconselect_changes.options = /*options*/
      ctx2[7];
      if (dirty & /*active*/
      4) iconselect_changes.active = /*active*/
      ctx2[2];
      if (dirty & /*isDisabled*/
      64) iconselect_changes.disabled = /*isDisabled*/
      ctx2[6];
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
        ctx2[5].length
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*advancementArray*/
          32) {
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
      if (!current || dirty & /*richHTML*/
      8) div5.innerHTML = /*richHTML*/
      ctx2[3];
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
  let advancementComponents;
  let html;
  let advancementArray;
  let isDisabled;
  let $background;
  let $readOnlyTabs;
  component_subscribe($$self, background, ($$value) => $$invalidate(1, $background = $$value));
  component_subscribe($$self, readOnlyTabs, ($$value) => $$invalidate(10, $readOnlyTabs = $$value));
  let active = null, value = null, placeHolder = "Backgrounds";
  let packs = getPacksFromSettings("backgrounds");
  let allItems = extractItemsFromPacksSync(packs, ["name->label", "img", "type", "folder", "uuid->value", "_id"]);
  let itemDefinitions = allItems.filter((x) => x.type == "background").sort((a, b) => a.label.localeCompare(b.label));
  getContext("#doc");
  let richHTML = "";
  const importAdvancements = async () => {
    for (const advancement of advancementArray) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-s9Yt0Z9I.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-D7OpT0Fw.js"), "../../../molecules/dnd5e/Advancements/HitPoints.svelte": () => import("./HitPoints-BYQZI8SO.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-DvpKW_Cq.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-BN4rvLK6.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-GYyEay6y.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-DydWDMo_.js"), "../../../molecules/dnd5e/Advancements/Subclass.svelte": () => import("./Subclass-BdeKiLvR.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-DDRInBqW.js") }), `../../../molecules/dnd5e/Advancements/${advancement.type}.svelte`, 7);
        $$invalidate(4, advancementComponents[advancement.type] = module.default, advancementComponents);
      } catch (error) {
        log.e(`Failed to load component for ${advancement.type}:`, error);
      }
    }
  };
  const selectBackgroundHandler = async (option) => {
    console.log("BACKGROUND SELECTION START:", { option, optionType: typeof option });
    const selectedBackground = await fromUuid(option);
    console.log("BACKGROUND FROM UUID:", {
      selectedBackground,
      properties: Object.keys(selectedBackground || {}),
      system: selectedBackground?.system,
      advancement: selectedBackground?.advancement
    });
    set_store_value(background, $background = selectedBackground, $background);
    $$invalidate(2, active = option);
    if (!value) {
      $$invalidate(0, value = option);
    }
    await tick();
    await importAdvancements();
    $$invalidate(3, richHTML = await illuminatedDescription(html, $background));
    Hooks.call("gas.richhtmlReady", richHTML);
  };
  onMount(async () => {
    let backgroundUuid;
    if (window.GAS.debug) {
      backgroundUuid = window.GAS.background;
    } else {
      backgroundUuid = $background?.uuid;
    }
    if (backgroundUuid) {
      await selectBackgroundHandler(backgroundUuid);
    }
  });
  function iconselect_value_binding(value$1) {
    value = value$1;
    $$invalidate(0, value);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$background*/
    2) {
      html = $background?.system?.description.value || "";
    }
    if ($$self.$$.dirty & /*$background*/
    2) {
      $$invalidate(5, advancementArray = $background?.advancement?.byId ? Object.entries($background.advancement.byId).map(([id, value2]) => ({ ...value2, id })) : []);
    }
    if ($$self.$$.dirty & /*$readOnlyTabs*/
    1024) {
      $$invalidate(6, isDisabled = $readOnlyTabs.includes("background"));
    }
  };
  $$invalidate(7, options = itemDefinitions);
  $$invalidate(4, advancementComponents = {});
  allItems.filter((x) => x.type == "background");
  return [
    value,
    $background,
    active,
    richHTML,
    advancementComponents,
    advancementArray,
    isDisabled,
    options,
    placeHolder,
    selectBackgroundHandler,
    $readOnlyTabs,
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
//# sourceMappingURL=Background-C6K1LkyP.js.map
