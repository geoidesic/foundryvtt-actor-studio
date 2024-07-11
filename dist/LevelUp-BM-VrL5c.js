import { S as SvelteComponent, i as init, s as safe_not_equal, z as ensure_array_like, e as element, a as empty, b as attr, c as insert, d as append, h as transition_in, g as group_outros, t as transition_out, f as check_outros, j as detach, B as destroy_each, k as component_subscribe, O as characterClass, N as characterSubClass, V as newClassLevel, P as level, J as getPacksFromSettings, K as extractItemsFromPacks, n as getContext, o as onMount, q as tick, x as log, l as localize, Q as DonationTracker, W as ucfirst, F as text, R as space, L as src_url_equal, X as listen, Y as is_function, G as set_data, u as create_component, v as mount_component, w as destroy_component, U as extractMapIteratorObjectProperties, _ as __variableDynamicImportRuntimeHelper, y as set_store_value } from "./index-BLHYber7.js";
/* empty css                                                  */
import LevelUpExistingClassLeftCol from "./LevelUpExistingClassLeftCol-C3okvC-f.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[47] = list[i];
  child_ctx[49] = i;
  return child_ctx;
}
function create_if_block_2(ctx) {
  let i;
  return {
    c() {
      i = element("i");
      attr(i, "class", "fas fa-plus");
    },
    m(target, anchor) {
      insert(target, i, anchor);
    },
    d(detaching) {
      if (detaching) {
        detach(i);
      }
    }
  };
}
function create_each_block(ctx) {
  let div6;
  let div0;
  let img;
  let img_src_value;
  let div5;
  let div1;
  let t0_value = ucfirst(
    /*classKey*/
    ctx[47]
  ) + "";
  let t0;
  let t1;
  let div3;
  let div2;
  let t2_value = (
    /*classLevels*/
    ctx[3][
      /*index*/
      ctx[49]
    ] + ""
  );
  let t2;
  let t3;
  let div4;
  let div6_class_value;
  let div6_aria_label_value;
  let div6_data_tooltip_value;
  let mounted;
  let dispose;
  let if_block = !/*activeClass*/
  ctx[0] && create_if_block_2();
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
      if (if_block) if_block.c();
      attr(img, "height", "40");
      if (!src_url_equal(img.src, img_src_value = /*getCharacterClass*/
      ctx[10](
        /*classKey*/
        ctx[47]
      )?.img)) attr(img, "src", img_src_value);
      attr(div0, "class", "flex icon svelte-gas-4c5pwm");
      attr(div1, "class", "flex3");
      attr(div2, "class", "lozenge svelte-gas-4c5pwm");
      attr(div3, "class", "flex0");
      attr(div4, "class", "flex1 right pr-md");
      attr(div5, "class", "flex3 flexrow svelte-gas-4c5pwm");
      attr(div6, "class", div6_class_value = "class-row gold-button flexrow " + /*getCharacterClass*/
      (ctx[10](
        /*classKey*/
        ctx[47]
      ).uuid === /*activeClass*/
      ctx[0] ? "active" : "") + " svelte-gas-4c5pwm");
      attr(div6, "role", "button");
      attr(div6, "aria-role", "button");
      attr(div6, "aria-label", div6_aria_label_value = localize("GAS.LevelUp.Button") + " " + /*classKey*/
      ctx[47]);
      attr(div6, "data-tooltip", div6_data_tooltip_value = localize("GAS.LevelUp.Button") + " " + /*classKey*/
      ctx[47]);
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
      if (if_block) if_block.m(div4, null);
      if (!mounted) {
        dispose = listen(div6, "mousedown", function() {
          if (is_function(
            /*clickAddLevel*/
            ctx[11](
              /*classKey*/
              ctx[47]
            )
          )) ctx[11](
            /*classKey*/
            ctx[47]
          ).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & /*classKeys*/
      4 && !src_url_equal(img.src, img_src_value = /*getCharacterClass*/
      ctx[10](
        /*classKey*/
        ctx[47]
      )?.img)) {
        attr(img, "src", img_src_value);
      }
      if (dirty[0] & /*classKeys*/
      4 && t0_value !== (t0_value = ucfirst(
        /*classKey*/
        ctx[47]
      ) + "")) set_data(t0, t0_value);
      if (dirty[0] & /*classLevels*/
      8 && t2_value !== (t2_value = /*classLevels*/
      ctx[3][
        /*index*/
        ctx[49]
      ] + "")) set_data(t2, t2_value);
      if (!/*activeClass*/
      ctx[0]) {
        if (if_block) ;
        else {
          if_block = create_if_block_2();
          if_block.c();
          if_block.m(div4, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty[0] & /*classKeys, activeClass*/
      5 && div6_class_value !== (div6_class_value = "class-row gold-button flexrow " + /*getCharacterClass*/
      (ctx[10](
        /*classKey*/
        ctx[47]
      ).uuid === /*activeClass*/
      ctx[0] ? "active" : "") + " svelte-gas-4c5pwm")) {
        attr(div6, "class", div6_class_value);
      }
      if (dirty[0] & /*classKeys*/
      4 && div6_aria_label_value !== (div6_aria_label_value = localize("GAS.LevelUp.Button") + " " + /*classKey*/
      ctx[47])) {
        attr(div6, "aria-label", div6_aria_label_value);
      }
      if (dirty[0] & /*classKeys*/
      4 && div6_data_tooltip_value !== (div6_data_tooltip_value = localize("GAS.LevelUp.Button") + " " + /*classKey*/
      ctx[47])) {
        attr(div6, "data-tooltip", div6_data_tooltip_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div6);
      }
      if (if_block) if_block.d();
      mounted = false;
      dispose();
    }
  };
}
function create_if_block(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*activeClassObj*/
    ctx[5] && create_if_block_1(ctx)
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
        /*activeClassObj*/
        ctx2[5]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*activeClassObj*/
          32) {
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
  let h3;
  let t0_value = (
    /*activeClassObj*/
    ctx[5].name + ""
  );
  let t0;
  let t1;
  let t2_value = (
    /*levelOptions*/
    ctx[8][1].label + ""
  );
  let t2;
  let levelupexisting;
  let current;
  levelupexisting = new LevelUpExistingClassLeftCol({
    props: {
      classAdvancementArrayFiltered: (
        /*classAdvancementArrayFiltered*/
        ctx[6]
      ),
      level: (
        /*getLevel*/
        ctx[12](
          /*activeClassKey*/
          ctx[1]
        )
      )
    }
  });
  return {
    c() {
      h3 = element("h3");
      t0 = text(t0_value);
      t1 = space();
      t2 = text(t2_value);
      create_component(levelupexisting.$$.fragment);
    },
    m(target, anchor) {
      insert(target, h3, anchor);
      append(h3, t0);
      append(h3, t1);
      append(h3, t2);
      mount_component(levelupexisting, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if ((!current || dirty[0] & /*activeClassObj*/
      32) && t0_value !== (t0_value = /*activeClassObj*/
      ctx2[5].name + "")) set_data(t0, t0_value);
      const levelupexisting_changes = {};
      if (dirty[0] & /*classAdvancementArrayFiltered*/
      64) levelupexisting_changes.classAdvancementArrayFiltered = /*classAdvancementArrayFiltered*/
      ctx2[6];
      if (dirty[0] & /*activeClassKey*/
      2) levelupexisting_changes.level = /*getLevel*/
      ctx2[12](
        /*activeClassKey*/
        ctx2[1]
      );
      levelupexisting.$set(levelupexisting_changes);
    },
    i(local) {
      if (current) return;
      transition_in(levelupexisting.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(levelupexisting.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(h3);
      }
      destroy_component(levelupexisting, detaching);
    }
  };
}
function create_fragment(ctx) {
  let div4;
  let div3;
  let div0;
  let h1;
  let each_1_anchor;
  let div1;
  let div2;
  let current;
  let each_value = ensure_array_like(
    /*classKeys*/
    ctx[2]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  let if_block = (
    /*$characterClass*/
    ctx[4] && create_if_block(ctx)
  );
  return {
    c() {
      div4 = element("div");
      div3 = element("div");
      div0 = element("div");
      h1 = element("h1");
      h1.textContent = "Existing Classes";
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
      if (if_block) if_block.c();
      div1 = element("div");
      div1.innerHTML = ``;
      div2 = element("div");
      attr(h1, "class", "flex");
      attr(div0, "class", "flex2 pr-sm col-a");
      attr(div1, "class", "flex0 border-right right-border-gradient-mask");
      attr(div2, "class", "flex3 left pl-md scroll col-b");
      attr(div3, "class", "flexrow svelte-gas-4c5pwm");
      attr(div4, "class", "content svelte-gas-4c5pwm");
    },
    m(target, anchor) {
      insert(target, div4, anchor);
      append(div4, div3);
      append(div3, div0);
      append(div0, h1);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div0, null);
        }
      }
      append(div0, each_1_anchor);
      if (if_block) if_block.m(div0, null);
      append(div3, div1);
      append(div3, div2);
      div2.innerHTML = /*combinedHtml*/
      ctx[7];
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty[0] & /*getCharacterClass, classKeys, activeClass, clickAddLevel, classLevels*/
      3085) {
        each_value = ensure_array_like(
          /*classKeys*/
          ctx2[2]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(div0, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (
        /*$characterClass*/
        ctx2[4]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & /*$characterClass*/
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
      if (!current || dirty[0] & /*combinedHtml*/
      128) div2.innerHTML = /*combinedHtml*/
      ctx2[7];
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
        detach(div4);
      }
      destroy_each(each_blocks, detaching);
      if (if_block) if_block.d();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let html;
  let combinedHtml;
  let classAdvancementComponents;
  let subClassAdvancementComponents;
  let subClassAdvancementArrayFiltered;
  let classAdvancementArrayFiltered;
  let classKeys;
  let classLevels;
  let activeClassObj;
  let activeClassIndex;
  let $characterClass;
  let $characterSubClass;
  let $newClassLevel;
  let $actor;
  let $level;
  component_subscribe($$self, characterClass, ($$value) => $$invalidate(4, $characterClass = $$value));
  component_subscribe($$self, characterSubClass, ($$value) => $$invalidate(18, $characterSubClass = $$value));
  component_subscribe($$self, newClassLevel, ($$value) => $$invalidate(32, $newClassLevel = $$value));
  component_subscribe($$self, level, ($$value) => $$invalidate(20, $level = $$value));
  let richHTML = "", richSubClassHTML = "", activeClass = null, activeClassKey = null, activeSubClass = null, subClassesIndex, packs = getPacksFromSettings("classes");
  game.packs.get("dnd5e.subclasses");
  let subClassesPacks = getPacksFromSettings("subclasses"), mappedClassIndex = extractItemsFromPacks(packs, ["name->label", "img", "type", "folder", "uuid->value", "_id"]);
  const levelOptions = [];
  for (let i = 1; i <= 20; i++) {
    levelOptions.push({ label: "Level " + i, value: i });
  }
  const actor = getContext("#doc");
  component_subscribe($$self, actor, (value) => $$invalidate(19, $actor = value));
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
  const importClassAdvancements = async () => {
    for (const classAdvancement of classAdvancementArrayFiltered) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-BG8TrOqM.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-PfgBCRkd.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-DdtTP8Qq.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-GPmuT-XB.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-C-zmDZkJ.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-BxBKbRlQ.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-Bd9zdZEy.js") }), `../../../molecules/dnd5e/Advancements/${classAdvancement.type}.svelte`, 7);
        classAdvancementComponents[classAdvancement.type] = module.default;
      } catch (error) {
        log.e(`Failed to load component for ${classAdvancement.type}:`, error);
      }
    }
  };
  const importSubClassAdvancements = async () => {
    for (const subClassAdvancement of subClassAdvancementArrayFiltered) {
      try {
        const module = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../../../molecules/dnd5e/Advancements/AbilityScoreImprovement.svelte": () => import("./AbilityScoreImprovement-BG8TrOqM.js"), "../../../molecules/dnd5e/Advancements/Feat.svelte": () => import("./Feat-PfgBCRkd.js"), "../../../molecules/dnd5e/Advancements/ItemChoice.svelte": () => import("./ItemChoice-DdtTP8Qq.js"), "../../../molecules/dnd5e/Advancements/ItemGrant.svelte": () => import("./ItemGrant-GPmuT-XB.js"), "../../../molecules/dnd5e/Advancements/ScaleValue.svelte": () => import("./ScaleValue-C-zmDZkJ.js"), "../../../molecules/dnd5e/Advancements/Size.svelte": () => import("./Size-BxBKbRlQ.js"), "../../../molecules/dnd5e/Advancements/Trait.svelte": () => import("./Trait-Bd9zdZEy.js") }), `../../../molecules/dnd5e/Advancements/${subClassAdvancement.type}.svelte`, 7);
        await tick();
        subClassAdvancementComponents[subClassAdvancement.type] = module.default;
      } catch (error) {
        log.e(`Failed to load component for ${subClassAdvancement.type}:`, error);
      }
    }
  };
  const getCharacterClass = (classKey) => {
    return $actor._classes[classKey];
  };
  async function clickAddLevel(classKey) {
    log.d(getCharacterClass(classKey).uuid);
    const uuid = getCharacterClass(classKey).uuid;
    $$invalidate(15, activeSubClass = null);
    set_store_value(characterSubClass, $characterSubClass = null, $characterSubClass);
    subClassAdvancementArrayFiltered = [];
    $$invalidate(14, richSubClassHTML = "");
    set_store_value(characterClass, $characterClass = await fromUuid(uuid), $characterClass);
    $$invalidate(0, activeClass = uuid);
    $$invalidate(1, activeClassKey = classKey);
    newClassLevel.set($actor._classes[classKey]?.system?.levels + 1);
    log.d(newClassLevel);
    await tick();
    $$invalidate(16, subClassesIndex = await getFilteredSubclassIndex());
    await tick();
    importClassAdvancements();
    $$invalidate(13, richHTML = await TextEditor.enrichHTML(html));
  }
  function getLevel(classKey) {
    const level2 = $newClassLevel ? $newClassLevel : getCharacterClass(classKey)?.system?.levels;
    return level2;
  }
  onMount(async () => {
    if ($characterClass) {
      $characterClass.uuid;
      await tick();
      importClassAdvancements();
      $$invalidate(13, richHTML = await TextEditor.enrichHTML(html));
      $$invalidate(16, subClassesIndex = await getFilteredSubclassIndex());
    }
    if ($characterSubClass) {
      $characterSubClass.uuid;
      await tick();
      importSubClassAdvancements();
      $$invalidate(14, richSubClassHTML = await TextEditor.enrichHTML($characterSubClass.system.description.value));
    }
    log.d("classKeys", classKeys);
    log.d(typeof classKeys);
    log.d(classKeys.length);
    log.d(Array.isArray(classKeys.length));
    log.d(getCharacterClass("fighter"));
    log.d($characterClass);
  });
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & /*$characterClass*/
    16) {
      html = $characterClass?.system?.description.value || "";
    }
    if ($$self.$$.dirty[0] & /*activeSubClass*/
    32768) ;
    if ($$self.$$.dirty[0] & /*activeClass*/
    1) ;
    if ($$self.$$.dirty[0] & /*richHTML, richSubClassHTML*/
    24576) {
      $$invalidate(7, combinedHtml = richHTML + (richSubClassHTML ? `<h1>${localize("GAS.SubClass")}</h1>` + richSubClassHTML : ""));
    }
    if ($$self.$$.dirty[0] & /*subClassesIndex*/
    65536) {
      if (subClassesIndex?.length) {
        subClassesIndex.flat().sort((a, b) => a.label.localeCompare(b.label));
      }
    }
    if ($$self.$$.dirty[0] & /*$characterSubClass, $level*/
    1310720) {
      subClassAdvancementArrayFiltered = $characterSubClass?.advancement?.byId ? Object.entries($characterSubClass.advancement.byId).filter(([id, value]) => value.level === $level).map(([id, value]) => ({ ...value, id })) : [];
    }
    if ($$self.$$.dirty[0] & /*$characterClass, $level*/
    1048592) {
      $$invalidate(6, classAdvancementArrayFiltered = $characterClass?.advancement?.byId ? Object.entries($characterClass.advancement.byId).filter(([id, value]) => value.level === $level).map(([id, value]) => ({ ...value, id })) : []);
    }
    if ($$self.$$.dirty[0] & /*$actor*/
    524288) {
      $$invalidate(2, classKeys = Object.keys($actor._classes));
    }
    if ($$self.$$.dirty[0] & /*classKeys, $actor, activeClass*/
    524293) {
      $$invalidate(3, classLevels = classKeys.map((classKey) => {
        const classObj = $actor._classes[classKey];
        return classObj.uuid == activeClass ? classObj.system.levels + 1 : classObj.system.levels;
      }));
    }
    if ($$self.$$.dirty[0] & /*$actor, activeClassKey*/
    524290) {
      $$invalidate(5, activeClassObj = $actor._classes[activeClassKey]);
    }
    if ($$self.$$.dirty[0] & /*classKeys, activeClassKey*/
    6) {
      $$invalidate(17, activeClassIndex = classKeys.indexOf(activeClassKey));
    }
    if ($$self.$$.dirty[0] & /*classLevels, activeClassIndex*/
    131080) {
      classLevels[activeClassIndex];
    }
    if ($$self.$$.dirty[0] & /*classKeys*/
    4) {
      mappedClassIndex.filter((i) => {
        return i.type == "class" && DonationTracker.canViewItem(i) && //- @why: don't include classes that are already in the character
        !classKeys.includes(i.label.toLowerCase());
      }).sort((a, b) => a.label.localeCompare(b.label));
    }
  };
  classAdvancementComponents = {};
  subClassAdvancementComponents = {};
  return [
    activeClass,
    activeClassKey,
    classKeys,
    classLevels,
    $characterClass,
    activeClassObj,
    classAdvancementArrayFiltered,
    combinedHtml,
    levelOptions,
    actor,
    getCharacterClass,
    clickAddLevel,
    getLevel,
    richHTML,
    richSubClassHTML,
    activeSubClass,
    subClassesIndex,
    activeClassIndex,
    $characterSubClass,
    $actor,
    $level
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
//# sourceMappingURL=LevelUp-BM-VrL5c.js.map
