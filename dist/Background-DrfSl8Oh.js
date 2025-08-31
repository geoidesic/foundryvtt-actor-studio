import { S as SvelteComponent, i as init, s as safe_not_equal, l as localize, d as destroy_component, t as transition_out, a as transition_in, m as mount_component, c as create_component, b as component_subscribe, I as background, J as getPacksFromSettings, K as extractItemsFromPacksSync, g as getContext, o as onMount, y as binding_callbacks, z as bind, k as detach, x as attr, A as add_flush_callback, n as group_outros, p as check_outros, q as insert, u as append, v as element, G as text, j as set_store_value, h as tick, L as illuminatedDescription, B as ensure_array_like, D as destroy_each, _ as __variableDynamicImportRuntimeHelper, E as construct_svelte_component, N as src_url_equal, F as set_data, O as getAdvancementValue } from "./index-c6UsYQz5.js";
/* empty css                                              */
import { I as IconSelect } from "./IconSelect-BZiGIEYg.js";
import { S as StandardTabLayout } from "./StandardTabLayout-Bo2aMjIu.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[17] = list[i];
  return child_ctx;
}
function create_if_block(ctx) {
  let h2;
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
    ctx[17].title + ""
  );
  let t_1;
  let div2_data_tooltip_value;
  let div3;
  let switch_instance;
  let current;
  var switch_value = (
    /*advancementComponents*/
    ctx[4][
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
      t_1 = text(t_1_value);
      div3 = element("div");
      if (switch_instance) create_component(switch_instance.$$.fragment);
      attr(img, "class", "icon");
      if (!src_url_equal(img.src, img_src_value = /*advancement*/
      ctx[17].icon)) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*advancement*/
      ctx[17].title);
      attr(div0, "class", "flex0 relative image");
      attr(div1, "class", "flex2");
      attr(div2, "class", "flexrow");
      attr(div2, "data-tooltip", div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx[17],
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
      if (!current || dirty & /*advancementArray*/
      32 && !src_url_equal(img.src, img_src_value = /*advancement*/
      ctx2[17].icon)) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty & /*advancementArray*/
      32 && img_alt_value !== (img_alt_value = /*advancement*/
      ctx2[17].title)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty & /*advancementArray*/
      32) && t_1_value !== (t_1_value = /*advancement*/
      ctx2[17].title + "")) set_data(t_1, t_1_value);
      if (!current || dirty & /*advancementArray*/
      32 && div2_data_tooltip_value !== (div2_data_tooltip_value = getAdvancementValue(
        /*advancement*/
        ctx2[17],
        "hint"
      ))) {
        attr(div2, "data-tooltip", div2_data_tooltip_value);
      }
      if (dirty & /*advancementComponents, advancementArray*/
      48 && switch_value !== (switch_value = /*advancementComponents*/
      ctx2[4][
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
        32) switch_instance_changes.advancement = /*advancement*/
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
    ctx[9](value);
  }
  let iconselect_props = {
    class: "icon-select",
    options: (
      /*options*/
      ctx[6]
    ),
    active: (
      /*active*/
      ctx[2]
    ),
    placeHolder: (
      /*placeHolder*/
      ctx[7]
    ),
    handler: (
      /*selectBackgroundHandler*/
      ctx[8]
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
    ctx[5].length && create_if_block(ctx)
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
      attr(div0, "class", div0_class_value = "flex0 required " + /*$background*/
      (ctx[1] ? "" : "active"));
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
      if (!current || dirty & /*$background*/
      2 && div0_class_value !== (div0_class_value = "flex0 required " + /*$background*/
      (ctx2[1] ? "" : "active"))) {
        attr(div0, "class", div0_class_value);
      }
      const iconselect_changes = {};
      if (dirty & /*options*/
      64) iconselect_changes.options = /*options*/
      ctx2[6];
      if (dirty & /*active*/
      4) iconselect_changes.active = /*active*/
      ctx2[2];
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
      ctx[3];
    },
    p(ctx2, dirty) {
      if (dirty & /*richHTML*/
      8) div.innerHTML = /*richHTML*/
      ctx2[3];
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
      title: localize("Tabs.Background.Title"),
      showTitle: true,
      tabName: "background",
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
    p(ctx2, [dirty]) {
      const standardtablayout_changes = {};
      if (dirty & /*$$scope, richHTML, advancementArray, advancementComponents, options, active, value, $background*/
      1048703) {
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
  let options;
  let advancementComponents;
  let html;
  let advancementArray;
  let $background;
  component_subscribe($$self, background, ($$value) => $$invalidate(1, $background = $$value));
  let active = null, value = null, placeHolder = localize("Tabs.Background.Placeholder");
  let packs = getPacksFromSettings("backgrounds");
  let allItems = extractItemsFromPacksSync(packs, ["name->label", "img", "type", "folder", "uuid->value", "_id"]);
  let itemDefinitions = allItems.filter((x) => x.type == "background").sort((a, b) => a.label.localeCompare(b.label));
  getContext("#doc");
  let richHTML = "";
  const importAdvancements = async () => {
    for (const advancement of advancementArray) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-Dy-m0x4T.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-B48NQmSh.js"), "../../../molecules/dnd5e/Advancements/HitPoints.svelte": () => import("./HitPoints-1rycjFcQ.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-Bk9koACy.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-A4aXKTU1.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-BNTqmpiD.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-CjaOo-pw.js"), "../../../molecules/dnd5e/Advancements/Subclass.svelte": () => import("./Subclass-CKqn5dLX.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-Cv71MIhm.js") }), `../../../molecules/dnd5e/Advancements/${advancement.type}.svelte`, 7);
        $$invalidate(4, advancementComponents[advancement.type] = module.default, advancementComponents);
      } catch (error) {
        log.e(`Failed to load component for ${advancement.type}:`, error);
      }
    }
  };
  const selectBackgroundHandler = async (option) => {
    console.log("[BG] selectBackgroundHandler called with:", option);
    const selectedBackground = await fromUuid(option);
    console.log("[BG] selectBackgroundHandler selectedBackground:", selectedBackground);
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
    console.log("[BG] onMount, $background:", $background);
    let backgroundUuid;
    if (window.GAS.debug) {
      backgroundUuid = window.GAS.background;
    } else {
      backgroundUuid = $background?.uuid;
    }
    console.log("[BG] onMount, backgroundUuid:", backgroundUuid);
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
      console.log("[BG] $background changed:", $background);
    }
    if ($$self.$$.dirty & /*$background*/
    2) {
      html = $background?.system?.description.value || "";
    }
    if ($$self.$$.dirty & /*$background*/
    2) {
      $$invalidate(5, advancementArray = $background?.advancement?.byId ? Object.entries($background.advancement.byId).map(([id, value2]) => ({ ...value2, id })) : []);
    }
  };
  $$invalidate(6, options = itemDefinitions);
  $$invalidate(4, advancementComponents = {});
  allItems.filter((x) => x.type == "background");
  return [
    value,
    $background,
    active,
    richHTML,
    advancementComponents,
    advancementArray,
    options,
    placeHolder,
    selectBackgroundHandler,
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
//# sourceMappingURL=Background-DrfSl8Oh.js.map
