import { S as SvelteComponent, i as init, s as safe_not_equal, C as noop, d as detach, j as attr, b as insert, e as append, f as element, l as localize, h as empty, k as component_subscribe, V as goldRoll, u as set_store_value, M as MODULE_ID, G as text, F as set_data, Y as listen, a0 as run_all, a1 as preventDefault, a2 as bubble, t as transition_out, a as transition_in, g as group_outros, c as check_outros, a3 as goldChoices, x as destroy_component, z as mount_component, A as create_component, a4 as clearGoldChoices, W as clearEquipmentSelections, a5 as setClassGoldChoice, a6 as setBackgroundGoldChoice, B as ensure_array_like, D as destroy_each, a7 as subscribe, a8 as matchingGroupsForSource, a9 as isGroupFromSource, aa as isGroupEditable, ab as is_function, N as src_url_equal, ac as getEquipmentIcon, ad as getOptionClasses, ae as handleSelection, af as getEquipmentItemClasses, ag as isOptionDisabled, ah as equipmentSelections, o as onMount, ai as initializeGroup, aj as editGroup, ak as selectedItems, r as readOnlyTabs, J as getPacksFromSettings, $ as extractItemsFromPacksAsync, al as addChildGranularSelection, am as addGranularSelection, an as flattenedSelections, ao as compatibleStartingEquipment, ap as areGoldChoicesComplete, Q as characterClass, I as background, aq as classStartingEquipment, ar as backgroundStartingEquipment, n as getContext } from "./index-1Yfxbk5l.js";
import { I as IconSelect } from "./IconSelect-fUd13Lca.js";
import { h as handle_promise, u as update_await_block_branch } from "./await_block-PyXAg-ym.js";
function create_if_block_3$5(ctx) {
  let div;
  let t;
  let div_class_value;
  return {
    c() {
      div = element("div");
      t = text("*");
      attr(div, "class", div_class_value = "flex0 required " + (!/*hasRolled*/
      ctx[3] ? "active" : ""));
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
    },
    p(ctx2, dirty) {
      if (dirty & /*hasRolled*/
      8 && div_class_value !== (div_class_value = "flex0 required " + (!/*hasRolled*/
      ctx2[3] ? "active" : ""))) {
        attr(div, "class", div_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_if_block_2$6(ctx) {
  let div2;
  let div0;
  let div1;
  let t1;
  return {
    c() {
      div2 = element("div");
      div0 = element("div");
      div0.textContent = "Formula: ";
      div1 = element("div");
      t1 = text(
        /*formula*/
        ctx[1]
      );
      attr(div0, "class", "flex1");
      attr(div1, "class", "flex1 badge center svelte-gas-12kwov4");
      attr(div2, "class", "flexrow left gap-4");
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, div0);
      append(div2, div1);
      append(div1, t1);
    },
    p(ctx2, dirty) {
      if (dirty & /*formula*/
      2) set_data(
        t1,
        /*formula*/
        ctx2[1]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(div2);
      }
    }
  };
}
function create_if_block$7(ctx) {
  let div2;
  let div0;
  let div1;
  let i;
  let div1_class_value;
  let mounted;
  let dispose;
  let if_block = (
    /*hasRolled*/
    ctx[3] && create_if_block_1$7(ctx)
  );
  return {
    c() {
      div2 = element("div");
      div0 = element("div");
      if (if_block) if_block.c();
      div1 = element("div");
      i = element("i");
      attr(div0, "class", "flex3");
      attr(i, "class", "fas fa-dice");
      attr(div1, "class", div1_class_value = "flex0 right controls " + /*hasRolled*/
      (ctx[3] || /*disabled*/
      ctx[0] ? "" : "active") + " svelte-gas-12kwov4");
      attr(div1, "alt", "Roll");
      attr(div2, "class", "flexrow left justify-flexrow-vertical");
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, div0);
      if (if_block) if_block.m(div0, null);
      append(div2, div1);
      append(div1, i);
      if (!mounted) {
        dispose = listen(
          div1,
          "click",
          /*rollGold*/
          ctx[4]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (
        /*hasRolled*/
        ctx2[3]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_1$7(ctx2);
          if_block.c();
          if_block.m(div0, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*hasRolled, disabled*/
      9 && div1_class_value !== (div1_class_value = "flex0 right controls " + /*hasRolled*/
      (ctx2[3] || /*disabled*/
      ctx2[0] ? "" : "active") + " svelte-gas-12kwov4")) {
        attr(div1, "class", div1_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div2);
      }
      if (if_block) if_block.d();
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_1$7(ctx) {
  let div3;
  let div2;
  let div0;
  let div1;
  let span0;
  let span1;
  let t1;
  let t2;
  return {
    c() {
      div3 = element("div");
      div2 = element("div");
      div0 = element("div");
      div0.innerHTML = `<i class="fas fa-coins svelte-gas-12kwov4"></i>`;
      div1 = element("div");
      span0 = element("span");
      span0.textContent = "Result: ";
      span1 = element("span");
      t1 = text(
        /*$goldRoll*/
        ctx[2]
      );
      t2 = text(" gp");
      attr(div0, "class", "flex0 relative icon svelte-gas-12kwov4");
      attr(span0, "class", "label svelte-gas-12kwov4");
      attr(span1, "class", "value svelte-gas-12kwov4");
      attr(div1, "class", "flex2 left");
      attr(div2, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div3, "class", "result final-gold-result svelte-gas-12kwov4");
    },
    m(target, anchor) {
      insert(target, div3, anchor);
      append(div3, div2);
      append(div2, div0);
      append(div2, div1);
      append(div1, span0);
      append(div1, span1);
      append(span1, t1);
      append(span1, t2);
    },
    p(ctx2, dirty) {
      if (dirty & /*$goldRoll*/
      4) set_data(
        t1,
        /*$goldRoll*/
        ctx2[2]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(div3);
      }
    }
  };
}
function create_fragment$8(ctx) {
  let section;
  let div1;
  let div0;
  let h2;
  let div2;
  let if_block1_anchor;
  let div2_class_value;
  let if_block0 = !/*disabled*/
  ctx[0] && create_if_block_3$5(ctx);
  let if_block1 = !/*hasRolled*/
  ctx[3] && create_if_block_2$6(ctx);
  let if_block2 = !/*disabled*/
  ctx[0] && create_if_block$7(ctx);
  return {
    c() {
      section = element("section");
      div1 = element("div");
      if (if_block0) if_block0.c();
      div0 = element("div");
      h2 = element("h2");
      h2.textContent = `${localize("GAS.Equipment.Gold")}`;
      div2 = element("div");
      if (if_block1) if_block1.c();
      if_block1_anchor = empty();
      if (if_block2) if_block2.c();
      attr(h2, "class", "left");
      attr(div0, "class", "flex3");
      attr(div1, "class", "flexrow");
      attr(div2, "class", div2_class_value = "flexcol gold-section gap-10 " + /*disabled*/
      (ctx[0] ? "disabled" : "") + " svelte-gas-12kwov4");
      attr(section, "class", "starting-gold svelte-gas-12kwov4");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      append(section, div1);
      if (if_block0) if_block0.m(div1, null);
      append(div1, div0);
      append(div0, h2);
      append(section, div2);
      if (if_block1) if_block1.m(div2, null);
      append(div2, if_block1_anchor);
      if (if_block2) if_block2.m(div2, null);
    },
    p(ctx2, [dirty]) {
      if (!/*disabled*/
      ctx2[0]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_3$5(ctx2);
          if_block0.c();
          if_block0.m(div1, div0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (!/*hasRolled*/
      ctx2[3]) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_2$6(ctx2);
          if_block1.c();
          if_block1.m(div2, if_block1_anchor);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (!/*disabled*/
      ctx2[0]) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
        } else {
          if_block2 = create_if_block$7(ctx2);
          if_block2.c();
          if_block2.m(div2, null);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (dirty & /*disabled*/
      1 && div2_class_value !== (div2_class_value = "flexcol gold-section gap-10 " + /*disabled*/
      (ctx2[0] ? "disabled" : "") + " svelte-gas-12kwov4")) {
        attr(div2, "class", div2_class_value);
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(section);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      if (if_block2) if_block2.d();
    }
  };
}
function instance$8($$self, $$props, $$invalidate) {
  let hasRolled;
  let $goldRoll;
  component_subscribe($$self, goldRoll, ($$value) => $$invalidate(2, $goldRoll = $$value));
  let { characterClass: characterClass2 } = $$props;
  let { disabled = false } = $$props;
  let formula = "";
  async function rollGold() {
    if (disabled) return;
    const roll = await new Roll(formula).evaluate();
    const className = characterClass2?.name || "Character";
    const flavor = `Rolling starting gold for ${className}`;
    roll.toMessage(
      {
        flavor,
        speaker: ChatMessage.getSpeaker()
      },
      {
        rollMode: game.settings.get("core", "rollMode")
      }
    );
    set_store_value(goldRoll, $goldRoll = roll.total, $goldRoll);
  }
  function resetGoldRoll() {
    goldRoll.set(0);
  }
  $$self.$$set = ($$props2) => {
    if ("characterClass" in $$props2) $$invalidate(5, characterClass2 = $$props2.characterClass);
    if ("disabled" in $$props2) $$invalidate(0, disabled = $$props2.disabled);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*characterClass, formula*/
    34) {
      {
        if (characterClass2?.system?.wealth) {
          $$invalidate(1, formula = characterClass2.system.wealth);
          if (!formula.includes("d")) {
            set_store_value(goldRoll, $goldRoll = parseInt(formula) || 0, $goldRoll);
          }
        } else {
          $$invalidate(1, formula = game.settings.get(MODULE_ID, "defaultGoldDice") || "5d4 * 10");
        }
      }
    }
    if ($$self.$$.dirty & /*$goldRoll*/
    4) {
      $$invalidate(3, hasRolled = $goldRoll > 0);
    }
  };
  return [
    disabled,
    formula,
    $goldRoll,
    hasRolled,
    rollGold,
    characterClass2,
    resetGoldRoll
  ];
}
let StartingGold$1 = class StartingGold extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$8, create_fragment$8, safe_not_equal, {
      characterClass: 5,
      disabled: 0,
      resetGoldRoll: 6
    });
  }
  get resetGoldRoll() {
    return this.$$.ctx[6];
  }
};
function create_fragment$7(ctx) {
  let button;
  let div;
  let i;
  let mounted;
  let dispose;
  return {
    c() {
      button = element("button");
      div = element("div");
      i = element("i");
      attr(
        i,
        "class",
        /*icon*/
        ctx[0]
      );
      button.disabled = /*disabled*/
      ctx[1];
      attr(button, "class", "svelte-gas-11orcvn");
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, div);
      append(div, i);
      if (!mounted) {
        dispose = [
          listen(
            button,
            "click",
            /*click_handler*/
            ctx[2]
          ),
          listen(button, "mousedown", preventDefault)
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*icon*/
      1) {
        attr(
          i,
          "class",
          /*icon*/
          ctx2[0]
        );
      }
      if (dirty & /*disabled*/
      2) {
        button.disabled = /*disabled*/
        ctx2[1];
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(button);
      }
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$7($$self, $$props, $$invalidate) {
  let { icon = void 0 } = $$props;
  let { disabled = false } = $$props;
  function click_handler(event) {
    bubble.call(this, $$self, event);
  }
  $$self.$$set = ($$props2) => {
    if ("icon" in $$props2) $$invalidate(0, icon = $$props2.icon);
    if ("disabled" in $$props2) $$invalidate(1, disabled = $$props2.disabled);
  };
  return [icon, disabled, click_handler];
}
class IconButton extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$7, create_fragment$7, safe_not_equal, { icon: 0, disabled: 1 });
  }
}
function create_if_block_4$2(ctx) {
  let div;
  let span;
  let div_class_value;
  return {
    c() {
      div = element("div");
      span = element("span");
      span.textContent = "*";
      attr(div, "class", div_class_value = "flex0 required " + (!/*classChoice*/
      ctx[3] || !/*backgroundChoice*/
      ctx[2] ? "active" : ""));
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, span);
    },
    p(ctx2, dirty) {
      if (dirty & /*classChoice, backgroundChoice*/
      12 && div_class_value !== (div_class_value = "flex0 required " + (!/*classChoice*/
      ctx2[3] || !/*backgroundChoice*/
      ctx2[2] ? "active" : ""))) {
        attr(div, "class", div_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_if_block_3$4(ctx) {
  let div;
  let iconbutton;
  let current;
  iconbutton = new IconButton({
    props: { class: "option", icon: "fas fa-pencil" }
  });
  iconbutton.$on(
    "click",
    /*handleEdit*/
    ctx[12]
  );
  return {
    c() {
      div = element("div");
      create_component(iconbutton.$$.fragment);
      attr(div, "class", "flex0 right");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(iconbutton, div, null);
      current = true;
    },
    p: noop,
    i(local) {
      if (current) return;
      transition_in(iconbutton.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(iconbutton.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      destroy_component(iconbutton);
    }
  };
}
function create_if_block_2$5(ctx) {
  let div9;
  let div1;
  let div0;
  let t0_value = (
    /*background*/
    ctx[1].name + ""
  );
  let t0;
  let t1;
  let div8;
  let button0;
  let div4;
  let div2;
  let div3;
  let span0;
  let t2_value = localize("GAS.Equipment.Label") + "";
  let t2;
  let t3;
  let t4;
  let t5;
  let button0_class_value;
  let button1;
  let div7;
  let div5;
  let div6;
  let span1;
  let t6;
  let t7;
  let button1_class_value;
  let mounted;
  let dispose;
  return {
    c() {
      div9 = element("div");
      div1 = element("div");
      div0 = element("div");
      t0 = text(t0_value);
      t1 = text(" Options");
      div8 = element("div");
      button0 = element("button");
      div4 = element("div");
      div2 = element("div");
      div2.innerHTML = `<i class="fas fa-sack-dollar svelte-gas-lo922e"></i>`;
      div3 = element("div");
      span0 = element("span");
      t2 = text(t2_value);
      t3 = text(" + ");
      t4 = text(
        /*backgroundGoldWithEquipment*/
        ctx[7]
      );
      t5 = text(" gp");
      button1 = element("button");
      div7 = element("div");
      div5 = element("div");
      div5.innerHTML = `<i class="fas fa-coins svelte-gas-lo922e"></i>`;
      div6 = element("div");
      span1 = element("span");
      t6 = text(
        /*backgroundGoldOnly*/
        ctx[6]
      );
      t7 = text(" gp");
      attr(div0, "class", "flex group-label svelte-gas-lo922e");
      attr(div1, "class", "flexrow left");
      attr(div2, "class", "flex0 relative icon svelte-gas-lo922e");
      attr(span0, "class", "svelte-gas-lo922e");
      attr(div3, "class", "flex2 left name svelte-gas-lo922e");
      attr(div4, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(button0, "class", button0_class_value = "option " + /*backgroundChoice*/
      (ctx[2] === "equipment" ? "selected" : "") + " " + /*showEditButton*/
      (ctx[8] ? "disabled" : "") + " svelte-gas-lo922e");
      button0.disabled = /*showEditButton*/
      ctx[8];
      attr(div5, "class", "flex0 relative icon svelte-gas-lo922e");
      attr(span1, "class", "svelte-gas-lo922e");
      attr(div6, "class", "flex2 left name svelte-gas-lo922e");
      attr(div7, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(button1, "class", button1_class_value = "option " + /*backgroundChoice*/
      (ctx[2] === "gold" ? "selected" : "") + " " + /*showEditButton*/
      (ctx[8] ? "disabled" : "") + " svelte-gas-lo922e");
      button1.disabled = /*showEditButton*/
      ctx[8];
      attr(div8, "class", "options svelte-gas-lo922e");
      attr(div9, "class", "equipment-group svelte-gas-lo922e");
    },
    m(target, anchor) {
      insert(target, div9, anchor);
      append(div9, div1);
      append(div1, div0);
      append(div0, t0);
      append(div0, t1);
      append(div9, div8);
      append(div8, button0);
      append(button0, div4);
      append(div4, div2);
      append(div4, div3);
      append(div3, span0);
      append(span0, t2);
      append(span0, t3);
      append(span0, t4);
      append(span0, t5);
      append(div8, button1);
      append(button1, div7);
      append(div7, div5);
      append(div7, div6);
      append(div6, span1);
      append(span1, t6);
      append(span1, t7);
      if (!mounted) {
        dispose = [
          listen(
            button0,
            "mousedown",
            /*makeBackgroundChoiceHandler*/
            ctx[11]("equipment")
          ),
          listen(
            button1,
            "mousedown",
            /*makeBackgroundChoiceHandler*/
            ctx[11]("gold")
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*background*/
      2 && t0_value !== (t0_value = /*background*/
      ctx2[1].name + "")) set_data(t0, t0_value);
      if (dirty & /*backgroundGoldWithEquipment*/
      128) set_data(
        t4,
        /*backgroundGoldWithEquipment*/
        ctx2[7]
      );
      if (dirty & /*backgroundChoice, showEditButton*/
      260 && button0_class_value !== (button0_class_value = "option " + /*backgroundChoice*/
      (ctx2[2] === "equipment" ? "selected" : "") + " " + /*showEditButton*/
      (ctx2[8] ? "disabled" : "") + " svelte-gas-lo922e")) {
        attr(button0, "class", button0_class_value);
      }
      if (dirty & /*showEditButton*/
      256) {
        button0.disabled = /*showEditButton*/
        ctx2[8];
      }
      if (dirty & /*backgroundGoldOnly*/
      64) set_data(
        t6,
        /*backgroundGoldOnly*/
        ctx2[6]
      );
      if (dirty & /*backgroundChoice, showEditButton*/
      260 && button1_class_value !== (button1_class_value = "option " + /*backgroundChoice*/
      (ctx2[2] === "gold" ? "selected" : "") + " " + /*showEditButton*/
      (ctx2[8] ? "disabled" : "") + " svelte-gas-lo922e")) {
        attr(button1, "class", button1_class_value);
      }
      if (dirty & /*showEditButton*/
      256) {
        button1.disabled = /*showEditButton*/
        ctx2[8];
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div9);
      }
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_1$6(ctx) {
  let div9;
  let div1;
  let div0;
  let t0_value = (
    /*characterClass*/
    ctx[0].name + ""
  );
  let t0;
  let t1;
  let div8;
  let button0;
  let div4;
  let div2;
  let div3;
  let span0;
  let t2_value = localize("GAS.Equipment.Label") + "";
  let t2;
  let t3;
  let t4;
  let t5;
  let button0_class_value;
  let button1;
  let div7;
  let div5;
  let div6;
  let span1;
  let t6;
  let t7;
  let button1_class_value;
  let mounted;
  let dispose;
  return {
    c() {
      div9 = element("div");
      div1 = element("div");
      div0 = element("div");
      t0 = text(t0_value);
      t1 = text(" Options");
      div8 = element("div");
      button0 = element("button");
      div4 = element("div");
      div2 = element("div");
      div2.innerHTML = `<i class="fas fa-sack-dollar svelte-gas-lo922e"></i>`;
      div3 = element("div");
      span0 = element("span");
      t2 = text(t2_value);
      t3 = text(" + ");
      t4 = text(
        /*classGoldWithEquipment*/
        ctx[5]
      );
      t5 = text(" gp");
      button1 = element("button");
      div7 = element("div");
      div5 = element("div");
      div5.innerHTML = `<i class="fas fa-coins svelte-gas-lo922e"></i>`;
      div6 = element("div");
      span1 = element("span");
      t6 = text(
        /*classGoldOnly*/
        ctx[4]
      );
      t7 = text(" gp");
      attr(div0, "class", "flex group-label svelte-gas-lo922e");
      attr(div1, "class", "flexrow left");
      attr(div2, "class", "flex0 relative icon svelte-gas-lo922e");
      attr(span0, "class", "svelte-gas-lo922e");
      attr(div3, "class", "flex2 left name svelte-gas-lo922e");
      attr(div4, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(button0, "class", button0_class_value = "option " + /*classChoice*/
      (ctx[3] === "equipment" ? "selected" : "") + " " + /*showEditButton*/
      (ctx[8] ? "disabled" : "") + " svelte-gas-lo922e");
      button0.disabled = /*showEditButton*/
      ctx[8];
      attr(div5, "class", "flex0 relative icon svelte-gas-lo922e");
      attr(span1, "class", "svelte-gas-lo922e");
      attr(div6, "class", "flex2 left name svelte-gas-lo922e");
      attr(div7, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(button1, "class", button1_class_value = "option " + /*classChoice*/
      (ctx[3] === "gold" ? "selected" : "") + " " + /*showEditButton*/
      (ctx[8] ? "disabled" : "") + " svelte-gas-lo922e");
      button1.disabled = /*showEditButton*/
      ctx[8];
      attr(div8, "class", "options svelte-gas-lo922e");
      attr(div9, "class", "equipment-group svelte-gas-lo922e");
    },
    m(target, anchor) {
      insert(target, div9, anchor);
      append(div9, div1);
      append(div1, div0);
      append(div0, t0);
      append(div0, t1);
      append(div9, div8);
      append(div8, button0);
      append(button0, div4);
      append(div4, div2);
      append(div4, div3);
      append(div3, span0);
      append(span0, t2);
      append(span0, t3);
      append(span0, t4);
      append(span0, t5);
      append(div8, button1);
      append(button1, div7);
      append(div7, div5);
      append(div7, div6);
      append(div6, span1);
      append(span1, t6);
      append(span1, t7);
      if (!mounted) {
        dispose = [
          listen(
            button0,
            "mousedown",
            /*makeClassChoiceHandler*/
            ctx[10]("equipment")
          ),
          listen(
            button1,
            "mousedown",
            /*makeClassChoiceHandler*/
            ctx[10]("gold")
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*characterClass*/
      1 && t0_value !== (t0_value = /*characterClass*/
      ctx2[0].name + "")) set_data(t0, t0_value);
      if (dirty & /*classGoldWithEquipment*/
      32) set_data(
        t4,
        /*classGoldWithEquipment*/
        ctx2[5]
      );
      if (dirty & /*classChoice, showEditButton*/
      264 && button0_class_value !== (button0_class_value = "option " + /*classChoice*/
      (ctx2[3] === "equipment" ? "selected" : "") + " " + /*showEditButton*/
      (ctx2[8] ? "disabled" : "") + " svelte-gas-lo922e")) {
        attr(button0, "class", button0_class_value);
      }
      if (dirty & /*showEditButton*/
      256) {
        button0.disabled = /*showEditButton*/
        ctx2[8];
      }
      if (dirty & /*classGoldOnly*/
      16) set_data(
        t6,
        /*classGoldOnly*/
        ctx2[4]
      );
      if (dirty & /*classChoice, showEditButton*/
      264 && button1_class_value !== (button1_class_value = "option " + /*classChoice*/
      (ctx2[3] === "gold" ? "selected" : "") + " " + /*showEditButton*/
      (ctx2[8] ? "disabled" : "") + " svelte-gas-lo922e")) {
        attr(button1, "class", button1_class_value);
      }
      if (dirty & /*showEditButton*/
      256) {
        button1.disabled = /*showEditButton*/
        ctx2[8];
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div9);
      }
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block$6(ctx) {
  let div5;
  let div4;
  let div0;
  let div3;
  let div1;
  let div2;
  let span1;
  let t1;
  let t2;
  return {
    c() {
      div5 = element("div");
      div4 = element("div");
      div0 = element("div");
      div0.innerHTML = `<i class="fas fa-coins svelte-gas-lo922e"></i>`;
      div3 = element("div");
      div1 = element("div");
      div1.innerHTML = `<span>Total Gold:</span>`;
      div2 = element("div");
      span1 = element("span");
      t1 = text(
        /*totalGold*/
        ctx[9]
      );
      t2 = text(" gp");
      attr(div0, "class", "flex0 relative icon svelte-gas-lo922e");
      attr(div1, "class", "label svelte-gas-lo922e");
      attr(div2, "class", "value svelte-gas-lo922e");
      attr(div3, "class", "flex2 left");
      attr(div4, "class", "flexrow left result");
      attr(div5, "class", "equipment-group final-gold svelte-gas-lo922e");
    },
    m(target, anchor) {
      insert(target, div5, anchor);
      append(div5, div4);
      append(div4, div0);
      append(div4, div3);
      append(div3, div1);
      append(div3, div2);
      append(div2, span1);
      append(span1, t1);
      append(span1, t2);
    },
    p(ctx2, dirty) {
      if (dirty & /*totalGold*/
      512) set_data(
        t1,
        /*totalGold*/
        ctx2[9]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(div5);
      }
    }
  };
}
function create_fragment$6(ctx) {
  let section;
  let div1;
  let div0;
  let h2;
  let span;
  let div2;
  let if_block2_anchor;
  let if_block3_anchor;
  let div2_class_value;
  let current;
  let if_block0 = !/*showEditButton*/
  ctx[8] && create_if_block_4$2(ctx);
  let if_block1 = (
    /*showEditButton*/
    ctx[8] && create_if_block_3$4(ctx)
  );
  let if_block2 = (
    /*background*/
    ctx[1] && create_if_block_2$5(ctx)
  );
  let if_block3 = (
    /*characterClass*/
    ctx[0] && create_if_block_1$6(ctx)
  );
  let if_block4 = (
    /*classChoice*/
    ctx[3] && /*backgroundChoice*/
    ctx[2] && create_if_block$6(ctx)
  );
  return {
    c() {
      section = element("section");
      div1 = element("div");
      if (if_block0) if_block0.c();
      div0 = element("div");
      h2 = element("h2");
      span = element("span");
      span.textContent = `${localize("GAS.Equipment.Gold")}`;
      if (if_block1) if_block1.c();
      div2 = element("div");
      if (if_block2) if_block2.c();
      if_block2_anchor = empty();
      if (if_block3) if_block3.c();
      if_block3_anchor = empty();
      if (if_block4) if_block4.c();
      attr(h2, "class", "left");
      attr(div0, "class", "flex3");
      attr(div1, "class", "flexrow");
      attr(div2, "class", div2_class_value = "flexcol gold-section gap-10 " + /*showEditButton*/
      (ctx[8] ? "disabled" : "") + " svelte-gas-lo922e");
      attr(section, "class", "starting-gold svelte-gas-lo922e");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      append(section, div1);
      if (if_block0) if_block0.m(div1, null);
      append(div1, div0);
      append(div0, h2);
      append(h2, span);
      if (if_block1) if_block1.m(div1, null);
      append(section, div2);
      if (if_block2) if_block2.m(div2, null);
      append(div2, if_block2_anchor);
      if (if_block3) if_block3.m(div2, null);
      append(div2, if_block3_anchor);
      if (if_block4) if_block4.m(div2, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (!/*showEditButton*/
      ctx2[8]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_4$2(ctx2);
          if_block0.c();
          if_block0.m(div1, div0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (
        /*showEditButton*/
        ctx2[8]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & /*showEditButton*/
          256) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_3$4(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div1, null);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (
        /*background*/
        ctx2[1]
      ) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
        } else {
          if_block2 = create_if_block_2$5(ctx2);
          if_block2.c();
          if_block2.m(div2, if_block2_anchor);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (
        /*characterClass*/
        ctx2[0]
      ) {
        if (if_block3) {
          if_block3.p(ctx2, dirty);
        } else {
          if_block3 = create_if_block_1$6(ctx2);
          if_block3.c();
          if_block3.m(div2, if_block3_anchor);
        }
      } else if (if_block3) {
        if_block3.d(1);
        if_block3 = null;
      }
      if (
        /*classChoice*/
        ctx2[3] && /*backgroundChoice*/
        ctx2[2]
      ) {
        if (if_block4) {
          if_block4.p(ctx2, dirty);
        } else {
          if_block4 = create_if_block$6(ctx2);
          if_block4.c();
          if_block4.m(div2, null);
        }
      } else if (if_block4) {
        if_block4.d(1);
        if_block4 = null;
      }
      if (!current || dirty & /*showEditButton*/
      256 && div2_class_value !== (div2_class_value = "flexcol gold-section gap-10 " + /*showEditButton*/
      (ctx2[8] ? "disabled" : "") + " svelte-gas-lo922e")) {
        attr(div2, "class", div2_class_value);
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(section);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      if (if_block2) if_block2.d();
      if (if_block3) if_block3.d();
      if (if_block4) if_block4.d();
    }
  };
}
function scrapeGoldFromBackground(background2) {
  const matches = background2.system.description?.value.match(/(\d+)\s*GP/gi);
  const goldValues = matches ? matches.map((m) => parseInt(m.match(/\d+/)[0], 10)) : [];
  window.GAS.log.d("scrapeGoldFromBackground goldValues", goldValues);
  if (goldValues) {
    const max = Math.max(...goldValues);
    const min = Math.min(...goldValues);
    return { max, min };
  } else {
    console.warn("No gold value found in description.");
    return 0;
  }
}
function instance$6($$self, $$props, $$invalidate) {
  let classChoice;
  let backgroundChoice;
  let totalGold;
  let showEditButton;
  let $goldChoices;
  component_subscribe($$self, goldChoices, ($$value) => $$invalidate(15, $goldChoices = $$value));
  let { characterClass: characterClass2 } = $$props;
  let { background: background2 } = $$props;
  let classGoldOnly = 0;
  let classGoldWithEquipment = 0;
  let backgroundGoldOnly = 0;
  let backgroundGoldWithEquipment = 0;
  const scrape2024SecondaryGoldAward = (item) => {
    const awards = item.system?.description?.value?.match(/\[\[\/award (\d+)GP\]\]/g);
    if (awards) {
      const extractedAwards = awards.map((award) => parseInt(award.match(/(\d+)GP/)[1], 10));
      const max = Math.max(...extractedAwards);
      const min = Math.min(...extractedAwards);
      return { max, min };
    } else {
      console.log("No awards found.");
      return 0;
    }
  };
  function handleClassChoice(choice) {
    if (showEditButton) return;
    const goldValue = choice === "equipment" ? classGoldWithEquipment : classGoldOnly;
    setClassGoldChoice(choice, goldValue);
  }
  function handleBackgroundChoice(choice) {
    if (showEditButton) return;
    const goldValue = choice === "equipment" ? backgroundGoldWithEquipment : backgroundGoldOnly;
    setBackgroundGoldChoice(choice, goldValue);
  }
  function makeClassChoiceHandler(choice) {
    return function classChoiceHandler() {
      handleClassChoice(choice);
    };
  }
  function makeBackgroundChoiceHandler(choice) {
    return function backgroundChoiceHandler() {
      handleBackgroundChoice(choice);
    };
  }
  function handleEdit() {
    clearGoldChoices();
    clearEquipmentSelections();
  }
  $$self.$$set = ($$props2) => {
    if ("characterClass" in $$props2) $$invalidate(0, characterClass2 = $$props2.characterClass);
    if ("background" in $$props2) $$invalidate(1, background2 = $$props2.background);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*characterClass, background*/
    3) {
      {
        if (characterClass2) {
          $$invalidate(4, classGoldOnly = characterClass2.system.wealth || 0);
          $$invalidate(5, classGoldWithEquipment = scrape2024SecondaryGoldAward(characterClass2)?.min || 0);
        }
        if (background2) {
          $$invalidate(6, backgroundGoldOnly = background2.system.wealth || 0);
          $$invalidate(7, backgroundGoldWithEquipment = scrapeGoldFromBackground(background2)?.min || 0);
        }
      }
    }
    if ($$self.$$.dirty & /*$goldChoices*/
    32768) {
      $$invalidate(3, classChoice = $goldChoices.fromClass.choice);
    }
    if ($$self.$$.dirty & /*$goldChoices*/
    32768) {
      $$invalidate(2, backgroundChoice = $goldChoices.fromBackground.choice);
    }
    if ($$self.$$.dirty & /*$goldChoices*/
    32768) {
      $$invalidate(9, totalGold = parseInt($goldChoices.fromClass.goldValue) + parseInt($goldChoices.fromBackground.goldValue));
    }
    if ($$self.$$.dirty & /*characterClass, background*/
    3) ;
    if ($$self.$$.dirty & /*classChoice, backgroundChoice*/
    12) ;
    if ($$self.$$.dirty & /*classChoice, backgroundChoice*/
    12) {
      $$invalidate(8, showEditButton = classChoice && backgroundChoice);
    }
  };
  return [
    characterClass2,
    background2,
    backgroundChoice,
    classChoice,
    classGoldOnly,
    classGoldWithEquipment,
    backgroundGoldOnly,
    backgroundGoldWithEquipment,
    showEditButton,
    totalGold,
    makeClassChoiceHandler,
    makeBackgroundChoiceHandler,
    handleEdit,
    scrape2024SecondaryGoldAward,
    scrapeGoldFromBackground,
    $goldChoices
  ];
}
class StartingGold2 extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$6, create_fragment$6, safe_not_equal, {
      characterClass: 0,
      background: 1,
      scrape2024SecondaryGoldAward: 13,
      scrapeGoldFromBackground: 14
    });
  }
  get scrape2024SecondaryGoldAward() {
    return this.$$.ctx[13];
  }
  get scrapeGoldFromBackground() {
    return scrapeGoldFromBackground;
  }
}
function get_each_context$3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[6] = list[i];
  return child_ctx;
}
function get_each_context_1$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[9] = list[i];
  return child_ctx;
}
function get_each_context_4(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[12] = list[i];
  return child_ctx;
}
function get_each_context_3$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[12] = list[i];
  return child_ctx;
}
function get_each_context_2$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[12] = list[i];
  return child_ctx;
}
function create_if_block$5(ctx) {
  let div;
  let h3;
  let t0_value = (
    /*sourceGroup*/
    ctx[6].label + ""
  );
  let t0;
  let t1;
  let show_if = !matchingGroupsForSource(
    /*sortedGroups*/
    ctx[1],
    /*sourceGroup*/
    ctx[6]
  ).length;
  let if_block_anchor;
  let current;
  let if_block = show_if && create_if_block_9$1();
  let each_value_1 = ensure_array_like(
    /*sortedGroups*/
    ctx[1]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  return {
    c() {
      div = element("div");
      h3 = element("h3");
      t0 = text(t0_value);
      t1 = text(" Equipment");
      if (if_block) if_block.c();
      if_block_anchor = empty();
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(h3, "class", "source-header left");
      attr(div, "class", "equipment-source-section ml-md");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, h3);
      append(h3, t0);
      append(h3, t1);
      if (if_block) if_block.m(div, null);
      append(div, if_block_anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div, null);
        }
      }
      current = true;
    },
    p(ctx2, dirty) {
      if ((!current || dirty & /*equipmentBySource*/
      1) && t0_value !== (t0_value = /*sourceGroup*/
      ctx2[6].label + "")) set_data(t0, t0_value);
      if (dirty & /*sortedGroups, equipmentBySource*/
      3) show_if = !matchingGroupsForSource(
        /*sortedGroups*/
        ctx2[1],
        /*sourceGroup*/
        ctx2[6]
      ).length;
      if (show_if) {
        if (if_block) ;
        else {
          if_block = create_if_block_9$1();
          if_block.c();
          if_block.m(div, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*sortedGroups, disabled, $selectedItems, handleEditGroup, equipmentBySource*/
      47) {
        each_value_1 = ensure_array_like(
          /*sortedGroups*/
          ctx2[1]
        );
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1$1(ctx2, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block_1$1(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(div, null);
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
        detach(div);
      }
      if (if_block) if_block.d();
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_if_block_9$1(ctx) {
  let p;
  return {
    c() {
      p = element("p");
      p.textContent = "None selected";
      attr(p, "class", "left");
    },
    m(target, anchor) {
      insert(target, p, anchor);
    },
    d(detaching) {
      if (detaching) {
        detach(p);
      }
    }
  };
}
function create_if_block_1$5(ctx) {
  let div3;
  let div1;
  let div0;
  let show_if = isGroupEditable(
    /*group*/
    ctx[9]
  );
  let div2;
  let current;
  let if_block0 = (
    /*group*/
    ctx[9].type === "choice" && create_if_block_7$1(ctx)
  );
  let if_block1 = show_if && create_if_block_6$1(ctx);
  function select_block_type_1(ctx2, dirty) {
    if (
      /*group*/
      ctx2[9].type === "standalone"
    ) return create_if_block_2$4;
    return create_else_block_1$2;
  }
  let current_block_type = select_block_type_1(ctx);
  let if_block2 = current_block_type(ctx);
  return {
    c() {
      div3 = element("div");
      div1 = element("div");
      div0 = element("div");
      if (if_block0) if_block0.c();
      if (if_block1) if_block1.c();
      div2 = element("div");
      if_block2.c();
      attr(div0, "class", "flex3 left");
      attr(div1, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div2, "class", "options svelte-gas-1y0asf7");
      attr(div3, "class", "equipment-group svelte-gas-1y0asf7");
    },
    m(target, anchor) {
      insert(target, div3, anchor);
      append(div3, div1);
      append(div1, div0);
      if (if_block0) if_block0.m(div0, null);
      if (if_block1) if_block1.m(div1, null);
      append(div3, div2);
      if_block2.m(div2, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*group*/
        ctx2[9].type === "choice"
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_7$1(ctx2);
          if_block0.c();
          if_block0.m(div0, null);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty & /*sortedGroups*/
      2) show_if = isGroupEditable(
        /*group*/
        ctx2[9]
      );
      if (show_if) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & /*sortedGroups*/
          2) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_6$1(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div1, null);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (current_block_type === (current_block_type = select_block_type_1(ctx2)) && if_block2) {
        if_block2.p(ctx2, dirty);
      } else {
        if_block2.d(1);
        if_block2 = current_block_type(ctx2);
        if (if_block2) {
          if_block2.c();
          if_block2.m(div2, null);
        }
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div3);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      if_block2.d();
    }
  };
}
function create_if_block_7$1(ctx) {
  let if_block_anchor;
  function select_block_type(ctx2, dirty) {
    if (
      /*group*/
      ctx2[9].completed
    ) return create_if_block_8$1;
    return create_else_block_2$1;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (current_block_type !== (current_block_type = select_block_type(ctx2))) {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      }
    },
    d(detaching) {
      if (detaching) {
        detach(if_block_anchor);
      }
      if_block.d(detaching);
    }
  };
}
function create_else_block_2$1(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "Choose one...";
      attr(span, "class", "group-label svelte-gas-1y0asf7");
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
function create_if_block_8$1(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "Completed:";
      attr(span, "class", "group-label svelte-gas-1y0asf7");
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
function create_if_block_6$1(ctx) {
  let div;
  let iconbutton;
  let current;
  iconbutton = new IconButton({
    props: {
      class: "option",
      disabled: (
        /*disabled*/
        ctx[3]
      ),
      icon: "fas fa-pencil"
    }
  });
  iconbutton.$on("click", function() {
    if (is_function(
      /*handleEditGroup*/
      ctx[2](
        /*group*/
        ctx[9].id
      )
    )) ctx[2](
      /*group*/
      ctx[9].id
    ).apply(this, arguments);
  });
  return {
    c() {
      div = element("div");
      create_component(iconbutton.$$.fragment);
      attr(div, "class", "flex0 right");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(iconbutton, div, null);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const iconbutton_changes = {};
      if (dirty & /*disabled*/
      8) iconbutton_changes.disabled = /*disabled*/
      ctx[3];
      iconbutton.$set(iconbutton_changes);
    },
    i(local) {
      if (current) return;
      transition_in(iconbutton.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(iconbutton.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      destroy_component(iconbutton);
    }
  };
}
function create_else_block_1$2(ctx) {
  let each_1_anchor;
  let each_value_4 = ensure_array_like(
    /*group*/
    ctx[9].items
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_4.length; i += 1) {
    each_blocks[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
  }
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
    },
    p(ctx2, dirty) {
      if (dirty & /*disabled, sortedGroups, $selectedItems*/
      42) {
        each_value_4 = ensure_array_like(
          /*group*/
          ctx2[9].items
        );
        let i;
        for (i = 0; i < each_value_4.length; i += 1) {
          const child_ctx = get_each_context_4(ctx2, each_value_4, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_4(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_4.length;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(each_1_anchor);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_if_block_2$4(ctx) {
  let div2;
  let div1;
  let div0;
  let if_block0 = !/*group*/
  ctx[9].completed && create_if_block_4$1();
  function select_block_type_2(ctx2, dirty) {
    if (
      /*group*/
      ctx2[9].items[0].type === "AND"
    ) return create_if_block_3$3;
    return create_else_block$4;
  }
  let current_block_type = select_block_type_2(ctx);
  let if_block1 = current_block_type(ctx);
  return {
    c() {
      div2 = element("div");
      div1 = element("div");
      div0 = element("div");
      if (if_block0) if_block0.c();
      if_block1.c();
      attr(div0, "class", "flex3 left");
      attr(div1, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div2, "class", "equipment-group svelte-gas-1y0asf7");
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, div1);
      append(div1, div0);
      if (if_block0) if_block0.m(div0, null);
      if_block1.m(div2, null);
    },
    p(ctx2, dirty) {
      if (!/*group*/
      ctx2[9].completed) {
        if (if_block0) ;
        else {
          if_block0 = create_if_block_4$1();
          if_block0.c();
          if_block0.m(div0, null);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (current_block_type === (current_block_type = select_block_type_2(ctx2)) && if_block1) {
        if_block1.p(ctx2, dirty);
      } else {
        if_block1.d(1);
        if_block1 = current_block_type(ctx2);
        if (if_block1) {
          if_block1.c();
          if_block1.m(div2, null);
        }
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div2);
      }
      if (if_block0) if_block0.d();
      if_block1.d();
    }
  };
}
function create_if_block_5$1(ctx) {
  let span;
  let t0;
  let t1_value = (
    /*$selectedItems*/
    ctx[5][
      /*group*/
      ctx[9].id
    ].name + ""
  );
  let t1;
  let t2;
  return {
    c() {
      span = element("span");
      t0 = text(" (");
      t1 = text(t1_value);
      t2 = text(")");
      attr(span, "class", "selected-name");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t0);
      append(span, t1);
      append(span, t2);
    },
    p(ctx2, dirty) {
      if (dirty & /*$selectedItems, sortedGroups*/
      34 && t1_value !== (t1_value = /*$selectedItems*/
      ctx2[5][
        /*group*/
        ctx2[9].id
      ].name + "")) set_data(t1, t1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_each_block_4(ctx) {
  let div3;
  let div2;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div1;
  let span;
  let raw_value = (
    /*item*/
    ctx[12].label + ""
  );
  let div3_class_value;
  let mounted;
  let dispose;
  let if_block = (
    /*group*/
    ctx[9].selectedItemId === /*item*/
    ctx[12]._id && /*$selectedItems*/
    ctx[5][
      /*group*/
      ctx[9].id
    ] && create_if_block_5$1(ctx)
  );
  return {
    c() {
      div3 = element("div");
      div2 = element("div");
      div0 = element("div");
      img = element("img");
      div1 = element("div");
      span = element("span");
      if (if_block) if_block.c();
      attr(img, "class", "icon svelte-gas-1y0asf7");
      if (!src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[12].type,
        /*group*/
        ctx[9]
      ))) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[12].type);
      attr(div0, "class", "flex0 relative icon svelte-gas-1y0asf7");
      attr(div1, "class", "flex2 left name black-link svelte-gas-1y0asf7");
      attr(div2, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div3, "class", div3_class_value = "equipment-item option " + getOptionClasses(
        /*disabled*/
        ctx[3],
        /*group*/
        ctx[9],
        /*item*/
        ctx[12]
      ) + " svelte-gas-1y0asf7");
    },
    m(target, anchor) {
      insert(target, div3, anchor);
      append(div3, div2);
      append(div2, div0);
      append(div0, img);
      append(div2, div1);
      append(div1, span);
      span.innerHTML = raw_value;
      if (if_block) if_block.m(div1, null);
      if (!mounted) {
        dispose = listen(div3, "click", function() {
          if (is_function(handleSelection(
            /*disabled*/
            ctx[3],
            /*group*/
            ctx[9].id,
            /*item*/
            ctx[12]
          ))) handleSelection(
            /*disabled*/
            ctx[3],
            /*group*/
            ctx[9].id,
            /*item*/
            ctx[12]
          ).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*sortedGroups*/
      2 && !src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[12].type,
        /*group*/
        ctx[9]
      ))) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*sortedGroups*/
      2 && img_alt_value !== (img_alt_value = /*item*/
      ctx[12].type)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty & /*sortedGroups*/
      2 && raw_value !== (raw_value = /*item*/
      ctx[12].label + "")) span.innerHTML = raw_value;
      if (
        /*group*/
        ctx[9].selectedItemId === /*item*/
        ctx[12]._id && /*$selectedItems*/
        ctx[5][
          /*group*/
          ctx[9].id
        ]
      ) {
        if (if_block) {
          if_block.p(ctx, dirty);
        } else {
          if_block = create_if_block_5$1(ctx);
          if_block.c();
          if_block.m(div1, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*disabled, sortedGroups*/
      10 && div3_class_value !== (div3_class_value = "equipment-item option " + getOptionClasses(
        /*disabled*/
        ctx[3],
        /*group*/
        ctx[9],
        /*item*/
        ctx[12]
      ) + " svelte-gas-1y0asf7")) {
        attr(div3, "class", div3_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div3);
      }
      if (if_block) if_block.d();
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_4$1(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "All of the following:";
      attr(span, "class", "group-label svelte-gas-1y0asf7");
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
function create_else_block$4(ctx) {
  let each_1_anchor;
  let each_value_3 = ensure_array_like(
    /*group*/
    ctx[9].items
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_3.length; i += 1) {
    each_blocks[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
  }
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
    },
    p(ctx2, dirty) {
      if (dirty & /*sortedGroups, disabled*/
      10) {
        each_value_3 = ensure_array_like(
          /*group*/
          ctx2[9].items
        );
        let i;
        for (i = 0; i < each_value_3.length; i += 1) {
          const child_ctx = get_each_context_3$1(ctx2, each_value_3, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_3$1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_3.length;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(each_1_anchor);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_if_block_3$3(ctx) {
  let each_1_anchor;
  let each_value_2 = ensure_array_like(
    /*group*/
    ctx[9].items[0].children
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_2.length; i += 1) {
    each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
  }
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
    },
    p(ctx2, dirty) {
      if (dirty & /*sortedGroups, disabled*/
      10) {
        each_value_2 = ensure_array_like(
          /*group*/
          ctx2[9].items[0].children
        );
        let i;
        for (i = 0; i < each_value_2.length; i += 1) {
          const child_ctx = get_each_context_2$1(ctx2, each_value_2, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_2$1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
        detach(each_1_anchor);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_each_block_3$1(ctx) {
  let div3;
  let div2;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div1;
  let span;
  let raw_value = (
    /*item*/
    ctx[12].label + ""
  );
  let div3_class_value;
  let mounted;
  let dispose;
  return {
    c() {
      div3 = element("div");
      div2 = element("div");
      div0 = element("div");
      img = element("img");
      div1 = element("div");
      span = element("span");
      attr(img, "class", "icon svelte-gas-1y0asf7");
      if (!src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[12].type,
        /*group*/
        ctx[9]
      ))) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[12].type);
      attr(div0, "class", "flex0 relative icon svelte-gas-1y0asf7");
      attr(div1, "class", "flex2 left name black-link svelte-gas-1y0asf7");
      attr(div2, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div3, "class", div3_class_value = "equipment-item option " + getEquipmentItemClasses(
        /*group*/
        ctx[9],
        /*item*/
        ctx[12],
        /*disabled*/
        ctx[3]
      ) + " svelte-gas-1y0asf7");
    },
    m(target, anchor) {
      insert(target, div3, anchor);
      append(div3, div2);
      append(div2, div0);
      append(div0, img);
      append(div2, div1);
      append(div1, span);
      span.innerHTML = raw_value;
      if (!mounted) {
        dispose = listen(div3, "click", function() {
          if (is_function(
            /*item*/
            ctx[12].type !== "linked" ? handleSelection(
              /*disabled*/
              ctx[3],
              /*group*/
              ctx[9].id,
              /*item*/
              ctx[12]
            ) : null
          )) /*item*/
          (ctx[12].type !== "linked" ? handleSelection(
            /*disabled*/
            ctx[3],
            /*group*/
            ctx[9].id,
            /*item*/
            ctx[12]
          ) : null).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*sortedGroups*/
      2 && !src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[12].type,
        /*group*/
        ctx[9]
      ))) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*sortedGroups*/
      2 && img_alt_value !== (img_alt_value = /*item*/
      ctx[12].type)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty & /*sortedGroups*/
      2 && raw_value !== (raw_value = /*item*/
      ctx[12].label + "")) span.innerHTML = raw_value;
      if (dirty & /*sortedGroups, disabled*/
      10 && div3_class_value !== (div3_class_value = "equipment-item option " + getEquipmentItemClasses(
        /*group*/
        ctx[9],
        /*item*/
        ctx[12],
        /*disabled*/
        ctx[3]
      ) + " svelte-gas-1y0asf7")) {
        attr(div3, "class", div3_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div3);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_each_block_2$1(ctx) {
  let div3;
  let div2;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div1;
  let span;
  let raw_value = (
    /*item*/
    ctx[12].label + ""
  );
  let div3_class_value;
  let mounted;
  let dispose;
  return {
    c() {
      div3 = element("div");
      div2 = element("div");
      div0 = element("div");
      img = element("img");
      div1 = element("div");
      span = element("span");
      attr(img, "class", "icon svelte-gas-1y0asf7");
      if (!src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[12].type,
        /*group*/
        ctx[9]
      ))) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[12].type);
      attr(div0, "class", "flex0 relative icon svelte-gas-1y0asf7");
      attr(div1, "class", "flex2 left name black-link svelte-gas-1y0asf7");
      attr(div2, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div3, "class", div3_class_value = "equipment-item option " + getEquipmentItemClasses(
        /*group*/
        ctx[9],
        /*item*/
        ctx[12],
        /*disabled*/
        ctx[3]
      ) + " svelte-gas-1y0asf7");
    },
    m(target, anchor) {
      insert(target, div3, anchor);
      append(div3, div2);
      append(div2, div0);
      append(div0, img);
      append(div2, div1);
      append(div1, span);
      span.innerHTML = raw_value;
      if (!mounted) {
        dispose = listen(div3, "click", function() {
          if (is_function(
            /*item*/
            ctx[12].type !== "linked" ? handleSelection(
              /*disabled*/
              ctx[3],
              /*group*/
              ctx[9].id,
              /*item*/
              ctx[12]
            ) : null
          )) /*item*/
          (ctx[12].type !== "linked" ? handleSelection(
            /*disabled*/
            ctx[3],
            /*group*/
            ctx[9].id,
            /*item*/
            ctx[12]
          ) : null).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*sortedGroups*/
      2 && !src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[12].type,
        /*group*/
        ctx[9]
      ))) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*sortedGroups*/
      2 && img_alt_value !== (img_alt_value = /*item*/
      ctx[12].type)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty & /*sortedGroups*/
      2 && raw_value !== (raw_value = /*item*/
      ctx[12].label + "")) span.innerHTML = raw_value;
      if (dirty & /*sortedGroups, disabled*/
      10 && div3_class_value !== (div3_class_value = "equipment-item option " + getEquipmentItemClasses(
        /*group*/
        ctx[9],
        /*item*/
        ctx[12],
        /*disabled*/
        ctx[3]
      ) + " svelte-gas-1y0asf7")) {
        attr(div3, "class", div3_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div3);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_each_block_1$1(ctx) {
  let show_if = (
    /*group*/
    (ctx[9].completed || /*group*/
    ctx[9].inProgress) && isGroupFromSource(
      /*group*/
      ctx[9],
      /*sourceGroup*/
      ctx[6].equipment
    )
  );
  let if_block_anchor;
  let current;
  let if_block = show_if && create_if_block_1$5(ctx);
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
      if (dirty & /*sortedGroups, equipmentBySource*/
      3) show_if = /*group*/
      (ctx2[9].completed || /*group*/
      ctx2[9].inProgress) && isGroupFromSource(
        /*group*/
        ctx2[9],
        /*sourceGroup*/
        ctx2[6].equipment
      );
      if (show_if) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*sortedGroups, equipmentBySource*/
          3) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_1$5(ctx2);
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
function create_each_block$3(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*sourceGroup*/
    ctx[6].equipment?.length && create_if_block$5(ctx)
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
        /*sourceGroup*/
        ctx2[6].equipment?.length
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*equipmentBySource*/
          1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$5(ctx2);
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
function create_fragment$5(ctx) {
  let div;
  let current;
  let each_value = ensure_array_like(
    /*equipmentBySource*/
    ctx[0]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  return {
    c() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
    },
    m(target, anchor) {
      insert(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div, null);
        }
      }
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & /*sortedGroups, disabled, $selectedItems, handleEditGroup, equipmentBySource*/
      47) {
        each_value = ensure_array_like(
          /*equipmentBySource*/
          ctx2[0]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$3(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block$3(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(div, null);
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
        detach(div);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function instance$5($$self, $$props, $$invalidate) {
  let $selectedItems, $$unsubscribe_selectedItems = noop, $$subscribe_selectedItems = () => ($$unsubscribe_selectedItems(), $$unsubscribe_selectedItems = subscribe(selectedItems2, ($$value) => $$invalidate(5, $selectedItems = $$value)), selectedItems2);
  $$self.$$.on_destroy.push(() => $$unsubscribe_selectedItems());
  let { equipmentBySource } = $$props;
  let { sortedGroups } = $$props;
  let { handleEditGroup } = $$props;
  let { disabled } = $$props;
  let { selectedItems: selectedItems2 } = $$props;
  $$subscribe_selectedItems();
  $$self.$$set = ($$props2) => {
    if ("equipmentBySource" in $$props2) $$invalidate(0, equipmentBySource = $$props2.equipmentBySource);
    if ("sortedGroups" in $$props2) $$invalidate(1, sortedGroups = $$props2.sortedGroups);
    if ("handleEditGroup" in $$props2) $$invalidate(2, handleEditGroup = $$props2.handleEditGroup);
    if ("disabled" in $$props2) $$invalidate(3, disabled = $$props2.disabled);
    if ("selectedItems" in $$props2) $$subscribe_selectedItems($$invalidate(4, selectedItems2 = $$props2.selectedItems));
  };
  return [
    equipmentBySource,
    sortedGroups,
    handleEditGroup,
    disabled,
    selectedItems2,
    $selectedItems
  ];
}
let StartingEquipmentGroups$1 = class StartingEquipmentGroups extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$5, create_fragment$5, safe_not_equal, {
      equipmentBySource: 0,
      sortedGroups: 1,
      handleEditGroup: 2,
      disabled: 3,
      selectedItems: 4
    });
  }
};
function get_each_context$2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[6] = list[i];
  return child_ctx;
}
function get_each_context_3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[9] = list[i];
  return child_ctx;
}
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[9] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[9] = list[i];
  return child_ctx;
}
function create_if_block$4(ctx) {
  let div3;
  let div1;
  let div0;
  let show_if = isGroupEditable(
    /*group*/
    ctx[6]
  );
  let div2;
  let current;
  let if_block0 = (
    /*group*/
    ctx[6].type === "choice" && create_if_block_8(ctx)
  );
  let if_block1 = show_if && create_if_block_7(ctx);
  function select_block_type_1(ctx2, dirty) {
    if (
      /*group*/
      ctx2[6].type === "standalone"
    ) return create_if_block_1$4;
    return create_else_block_1$1;
  }
  let current_block_type = select_block_type_1(ctx);
  let if_block2 = current_block_type(ctx);
  return {
    c() {
      div3 = element("div");
      div1 = element("div");
      div0 = element("div");
      if (if_block0) if_block0.c();
      if (if_block1) if_block1.c();
      div2 = element("div");
      if_block2.c();
      attr(div0, "class", "flex3 left");
      attr(div1, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div2, "class", "options svelte-gas-1y0asf7");
      attr(div3, "class", "equipment-group svelte-gas-1y0asf7");
    },
    m(target, anchor) {
      insert(target, div3, anchor);
      append(div3, div1);
      append(div1, div0);
      if (if_block0) if_block0.m(div0, null);
      if (if_block1) if_block1.m(div1, null);
      append(div3, div2);
      if_block2.m(div2, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*group*/
        ctx2[6].type === "choice"
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_8(ctx2);
          if_block0.c();
          if_block0.m(div0, null);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty & /*sortedGroups*/
      1) show_if = isGroupEditable(
        /*group*/
        ctx2[6]
      );
      if (show_if) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & /*sortedGroups*/
          1) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_7(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div1, null);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (current_block_type === (current_block_type = select_block_type_1(ctx2)) && if_block2) {
        if_block2.p(ctx2, dirty);
      } else {
        if_block2.d(1);
        if_block2 = current_block_type(ctx2);
        if (if_block2) {
          if_block2.c();
          if_block2.m(div2, null);
        }
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div3);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      if_block2.d();
    }
  };
}
function create_if_block_8(ctx) {
  let if_block_anchor;
  function select_block_type(ctx2, dirty) {
    if (
      /*group*/
      ctx2[6].completed
    ) return create_if_block_9;
    return create_else_block_3;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (current_block_type !== (current_block_type = select_block_type(ctx2))) {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      }
    },
    d(detaching) {
      if (detaching) {
        detach(if_block_anchor);
      }
      if_block.d(detaching);
    }
  };
}
function create_else_block_3(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "Choose one...";
      attr(span, "class", "group-label svelte-gas-1y0asf7");
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
function create_if_block_9(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "Completed:";
      attr(span, "class", "group-label svelte-gas-1y0asf7");
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
function create_if_block_7(ctx) {
  let div;
  let iconbutton;
  let current;
  iconbutton = new IconButton({
    props: {
      class: "option",
      disabled: (
        /*disabled*/
        ctx[2]
      ),
      icon: "fas fa-pencil"
    }
  });
  iconbutton.$on("click", function() {
    if (is_function(
      /*handleEditGroup*/
      ctx[1](
        /*group*/
        ctx[6].id
      )
    )) ctx[1](
      /*group*/
      ctx[6].id
    ).apply(this, arguments);
  });
  return {
    c() {
      div = element("div");
      create_component(iconbutton.$$.fragment);
      attr(div, "class", "flex0 right");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(iconbutton, div, null);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const iconbutton_changes = {};
      if (dirty & /*disabled*/
      4) iconbutton_changes.disabled = /*disabled*/
      ctx[2];
      iconbutton.$set(iconbutton_changes);
    },
    i(local) {
      if (current) return;
      transition_in(iconbutton.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(iconbutton.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      destroy_component(iconbutton);
    }
  };
}
function create_else_block_1$1(ctx) {
  let div;
  let each_1_anchor;
  function select_block_type_3(ctx2, dirty) {
    if (
      /*group*/
      ctx2[6].completed
    ) return create_if_block_5;
    return create_else_block_2;
  }
  let current_block_type = select_block_type_3(ctx);
  let if_block = current_block_type(ctx);
  let each_value_3 = ensure_array_like(
    /*group*/
    ctx[6].items
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_3.length; i += 1) {
    each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
  }
  return {
    c() {
      div = element("div");
      if_block.c();
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
      attr(div, "class", "flex3 left");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if_block.m(div, null);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert(target, each_1_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (current_block_type === (current_block_type = select_block_type_3(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(div, null);
        }
      }
      if (dirty & /*disabled, sortedGroups, $selectedItems*/
      21) {
        each_value_3 = ensure_array_like(
          /*group*/
          ctx2[6].items
        );
        let i;
        for (i = 0; i < each_value_3.length; i += 1) {
          const child_ctx = get_each_context_3(ctx2, each_value_3, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_3(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_3.length;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div);
        detach(each_1_anchor);
      }
      if_block.d();
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_if_block_1$4(ctx) {
  let div2;
  let div1;
  let div0;
  let if_block0 = !/*group*/
  ctx[6].completed && create_if_block_3$2();
  function select_block_type_2(ctx2, dirty) {
    if (
      /*group*/
      ctx2[6].items[0].type === "AND"
    ) return create_if_block_2$3;
    return create_else_block$3;
  }
  let current_block_type = select_block_type_2(ctx);
  let if_block1 = current_block_type(ctx);
  return {
    c() {
      div2 = element("div");
      div1 = element("div");
      div0 = element("div");
      if (if_block0) if_block0.c();
      if_block1.c();
      attr(div0, "class", "flex3 left");
      attr(div1, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div2, "class", "equipment-group svelte-gas-1y0asf7");
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, div1);
      append(div1, div0);
      if (if_block0) if_block0.m(div0, null);
      if_block1.m(div2, null);
    },
    p(ctx2, dirty) {
      if (!/*group*/
      ctx2[6].completed) {
        if (if_block0) ;
        else {
          if_block0 = create_if_block_3$2();
          if_block0.c();
          if_block0.m(div0, null);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (current_block_type === (current_block_type = select_block_type_2(ctx2)) && if_block1) {
        if_block1.p(ctx2, dirty);
      } else {
        if_block1.d(1);
        if_block1 = current_block_type(ctx2);
        if (if_block1) {
          if_block1.c();
          if_block1.m(div2, null);
        }
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div2);
      }
      if (if_block0) if_block0.d();
      if_block1.d();
    }
  };
}
function create_else_block_2(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "None selected";
      attr(span, "class", "group-label svelte-gas-1y0asf7");
    },
    m(target, anchor) {
      insert(target, span, anchor);
    },
    p: noop,
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block_5(ctx) {
  let if_block_anchor;
  let if_block = (
    /*group*/
    ctx[6].items?.length > 0 && create_if_block_6()
  );
  return {
    c() {
      if (if_block) if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if (if_block) if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (
        /*group*/
        ctx2[6].items?.length > 0
      ) {
        if (if_block) ;
        else {
          if_block = create_if_block_6();
          if_block.c();
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(if_block_anchor);
      }
      if (if_block) if_block.d(detaching);
    }
  };
}
function create_if_block_6(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "Pre-selected:";
      attr(span, "class", "group-label svelte-gas-1y0asf7");
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
  let t0;
  let t1_value = (
    /*$selectedItems*/
    ctx[4][
      /*group*/
      ctx[6].id
    ].name + ""
  );
  let t1;
  let t2;
  return {
    c() {
      span = element("span");
      t0 = text(" (");
      t1 = text(t1_value);
      t2 = text(")");
      attr(span, "class", "selected-name");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t0);
      append(span, t1);
      append(span, t2);
    },
    p(ctx2, dirty) {
      if (dirty & /*$selectedItems, sortedGroups*/
      17 && t1_value !== (t1_value = /*$selectedItems*/
      ctx2[4][
        /*group*/
        ctx2[6].id
      ].name + "")) set_data(t1, t1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_each_block_3(ctx) {
  let button;
  let div2;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div1;
  let span;
  let raw_value = (
    /*item*/
    ctx[9].label + ""
  );
  let button_class_value;
  let button_disabled_value;
  let mounted;
  let dispose;
  let if_block = (
    /*group*/
    ctx[6].selectedItemId === /*item*/
    ctx[9]._id && /*$selectedItems*/
    ctx[4][
      /*group*/
      ctx[6].id
    ] && create_if_block_4(ctx)
  );
  return {
    c() {
      button = element("button");
      div2 = element("div");
      div0 = element("div");
      img = element("img");
      div1 = element("div");
      span = element("span");
      if (if_block) if_block.c();
      attr(img, "class", "icon svelte-gas-1y0asf7");
      if (!src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[9].type,
        /*group*/
        ctx[6]
      ))) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[9].type);
      attr(div0, "class", "flex0 relative icon svelte-gas-1y0asf7");
      attr(div1, "class", "flex2 left name black-link svelte-gas-1y0asf7");
      attr(div2, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(button, "class", button_class_value = "option " + getOptionClasses(
        /*disabled*/
        ctx[2],
        /*group*/
        ctx[6],
        /*item*/
        ctx[9]
      ) + " svelte-gas-1y0asf7");
      button.disabled = button_disabled_value = isOptionDisabled(
        /*disabled*/
        ctx[2],
        /*group*/
        ctx[6],
        /*item*/
        ctx[9]
      );
    },
    m(target, anchor) {
      insert(target, button, anchor);
      append(button, div2);
      append(div2, div0);
      append(div0, img);
      append(div2, div1);
      append(div1, span);
      span.innerHTML = raw_value;
      if (if_block) if_block.m(div1, null);
      if (!mounted) {
        dispose = listen(button, "click", function() {
          if (is_function(handleSelection(
            /*disabled*/
            ctx[2],
            /*group*/
            ctx[6].id,
            /*item*/
            ctx[9]
          ))) handleSelection(
            /*disabled*/
            ctx[2],
            /*group*/
            ctx[6].id,
            /*item*/
            ctx[9]
          ).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*sortedGroups*/
      1 && !src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[9].type,
        /*group*/
        ctx[6]
      ))) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*sortedGroups*/
      1 && img_alt_value !== (img_alt_value = /*item*/
      ctx[9].type)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty & /*sortedGroups*/
      1 && raw_value !== (raw_value = /*item*/
      ctx[9].label + "")) span.innerHTML = raw_value;
      if (
        /*group*/
        ctx[6].selectedItemId === /*item*/
        ctx[9]._id && /*$selectedItems*/
        ctx[4][
          /*group*/
          ctx[6].id
        ]
      ) {
        if (if_block) {
          if_block.p(ctx, dirty);
        } else {
          if_block = create_if_block_4(ctx);
          if_block.c();
          if_block.m(div1, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*disabled, sortedGroups*/
      5 && button_class_value !== (button_class_value = "option " + getOptionClasses(
        /*disabled*/
        ctx[2],
        /*group*/
        ctx[6],
        /*item*/
        ctx[9]
      ) + " svelte-gas-1y0asf7")) {
        attr(button, "class", button_class_value);
      }
      if (dirty & /*disabled, sortedGroups*/
      5 && button_disabled_value !== (button_disabled_value = isOptionDisabled(
        /*disabled*/
        ctx[2],
        /*group*/
        ctx[6],
        /*item*/
        ctx[9]
      ))) {
        button.disabled = button_disabled_value;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(button);
      }
      if (if_block) if_block.d();
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_3$2(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "All of the following:";
      attr(span, "class", "group-label svelte-gas-1y0asf7");
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
function create_else_block$3(ctx) {
  let each_1_anchor;
  let each_value_2 = ensure_array_like(
    /*group*/
    ctx[6].items
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_2.length; i += 1) {
    each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
  }
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
    },
    p(ctx2, dirty) {
      if (dirty & /*sortedGroups, disabled*/
      5) {
        each_value_2 = ensure_array_like(
          /*group*/
          ctx2[6].items
        );
        let i;
        for (i = 0; i < each_value_2.length; i += 1) {
          const child_ctx = get_each_context_2(ctx2, each_value_2, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_2(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
        detach(each_1_anchor);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_if_block_2$3(ctx) {
  let each_1_anchor;
  let each_value_1 = ensure_array_like(
    /*group*/
    ctx[6].items[0].children
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  }
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
    },
    p(ctx2, dirty) {
      if (dirty & /*sortedGroups, disabled*/
      5) {
        each_value_1 = ensure_array_like(
          /*group*/
          ctx2[6].items[0].children
        );
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1(ctx2, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
        detach(each_1_anchor);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_each_block_2(ctx) {
  let div3;
  let div2;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div1;
  let span;
  let raw_value = (
    /*item*/
    ctx[9].label + ""
  );
  let div3_class_value;
  let mounted;
  let dispose;
  return {
    c() {
      div3 = element("div");
      div2 = element("div");
      div0 = element("div");
      img = element("img");
      div1 = element("div");
      span = element("span");
      attr(img, "class", "icon svelte-gas-1y0asf7");
      if (!src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[9].type,
        /*group*/
        ctx[6]
      ))) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[9].type);
      attr(div0, "class", "flex0 relative icon svelte-gas-1y0asf7");
      attr(div1, "class", "flex2 left name black-link svelte-gas-1y0asf7");
      attr(div2, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div3, "class", div3_class_value = "equipment-item option " + getEquipmentItemClasses(
        /*group*/
        ctx[6],
        /*item*/
        ctx[9],
        /*disabled*/
        ctx[2]
      ) + " svelte-gas-1y0asf7");
    },
    m(target, anchor) {
      insert(target, div3, anchor);
      append(div3, div2);
      append(div2, div0);
      append(div0, img);
      append(div2, div1);
      append(div1, span);
      span.innerHTML = raw_value;
      if (!mounted) {
        dispose = listen(div3, "click", function() {
          if (is_function(
            /*item*/
            ctx[9].type !== "linked" ? handleSelection(
              /*disabled*/
              ctx[2],
              /*group*/
              ctx[6].id,
              /*item*/
              ctx[9]
            ) : null
          )) /*item*/
          (ctx[9].type !== "linked" ? handleSelection(
            /*disabled*/
            ctx[2],
            /*group*/
            ctx[6].id,
            /*item*/
            ctx[9]
          ) : null).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*sortedGroups*/
      1 && !src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[9].type,
        /*group*/
        ctx[6]
      ))) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*sortedGroups*/
      1 && img_alt_value !== (img_alt_value = /*item*/
      ctx[9].type)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty & /*sortedGroups*/
      1 && raw_value !== (raw_value = /*item*/
      ctx[9].label + "")) span.innerHTML = raw_value;
      if (dirty & /*sortedGroups, disabled*/
      5 && div3_class_value !== (div3_class_value = "equipment-item option " + getEquipmentItemClasses(
        /*group*/
        ctx[6],
        /*item*/
        ctx[9],
        /*disabled*/
        ctx[2]
      ) + " svelte-gas-1y0asf7")) {
        attr(div3, "class", div3_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div3);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_each_block_1(ctx) {
  let div3;
  let div2;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div1;
  let span;
  let raw_value = (
    /*item*/
    ctx[9].label + ""
  );
  let div3_class_value;
  let mounted;
  let dispose;
  return {
    c() {
      div3 = element("div");
      div2 = element("div");
      div0 = element("div");
      img = element("img");
      div1 = element("div");
      span = element("span");
      attr(img, "class", "icon svelte-gas-1y0asf7");
      if (!src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[9].type,
        /*group*/
        ctx[6]
      ))) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[9].type);
      attr(div0, "class", "flex0 relative icon svelte-gas-1y0asf7");
      attr(div1, "class", "flex2 left name black-link svelte-gas-1y0asf7");
      attr(div2, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div3, "class", div3_class_value = "equipment-item option " + getEquipmentItemClasses(
        /*group*/
        ctx[6],
        /*item*/
        ctx[9],
        /*disabled*/
        ctx[2]
      ) + " svelte-gas-1y0asf7");
    },
    m(target, anchor) {
      insert(target, div3, anchor);
      append(div3, div2);
      append(div2, div0);
      append(div0, img);
      append(div2, div1);
      append(div1, span);
      span.innerHTML = raw_value;
      if (!mounted) {
        dispose = listen(div3, "click", function() {
          if (is_function(
            /*item*/
            ctx[9].type !== "linked" ? handleSelection(
              /*disabled*/
              ctx[2],
              /*group*/
              ctx[6].id,
              /*item*/
              ctx[9]
            ) : null
          )) /*item*/
          (ctx[9].type !== "linked" ? handleSelection(
            /*disabled*/
            ctx[2],
            /*group*/
            ctx[6].id,
            /*item*/
            ctx[9]
          ) : null).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*sortedGroups*/
      1 && !src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[9].type,
        /*group*/
        ctx[6]
      ))) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*sortedGroups*/
      1 && img_alt_value !== (img_alt_value = /*item*/
      ctx[9].type)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty & /*sortedGroups*/
      1 && raw_value !== (raw_value = /*item*/
      ctx[9].label + "")) span.innerHTML = raw_value;
      if (dirty & /*sortedGroups, disabled*/
      5 && div3_class_value !== (div3_class_value = "equipment-item option " + getEquipmentItemClasses(
        /*group*/
        ctx[6],
        /*item*/
        ctx[9],
        /*disabled*/
        ctx[2]
      ) + " svelte-gas-1y0asf7")) {
        attr(div3, "class", div3_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div3);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_each_block$2(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*group*/
    (ctx[6].completed || /*group*/
    ctx[6].inProgress) && create_if_block$4(ctx)
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
        /*group*/
        ctx2[6].completed || /*group*/
        ctx2[6].inProgress
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*sortedGroups*/
          1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$4(ctx2);
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
function create_fragment$4(ctx) {
  let div;
  let current;
  let each_value = ensure_array_like(
    /*sortedGroups*/
    ctx[0]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  return {
    c() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
    },
    m(target, anchor) {
      insert(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div, null);
        }
      }
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & /*sortedGroups, disabled, $selectedItems, handleEditGroup*/
      23) {
        each_value = ensure_array_like(
          /*sortedGroups*/
          ctx2[0]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$2(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block$2(child_ctx);
            each_blocks[i].c();
            transition_in(each_blocks[i], 1);
            each_blocks[i].m(div, null);
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
        detach(div);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function instance$4($$self, $$props, $$invalidate) {
  let $selectedItems, $$unsubscribe_selectedItems = noop, $$subscribe_selectedItems = () => ($$unsubscribe_selectedItems(), $$unsubscribe_selectedItems = subscribe(selectedItems2, ($$value) => $$invalidate(4, $selectedItems = $$value)), selectedItems2);
  $$self.$$.on_destroy.push(() => $$unsubscribe_selectedItems());
  let { equipmentBySource } = $$props;
  let { sortedGroups } = $$props;
  let { handleEditGroup } = $$props;
  let { disabled } = $$props;
  let { selectedItems: selectedItems2 } = $$props;
  $$subscribe_selectedItems();
  $$self.$$set = ($$props2) => {
    if ("equipmentBySource" in $$props2) $$invalidate(5, equipmentBySource = $$props2.equipmentBySource);
    if ("sortedGroups" in $$props2) $$invalidate(0, sortedGroups = $$props2.sortedGroups);
    if ("handleEditGroup" in $$props2) $$invalidate(1, handleEditGroup = $$props2.handleEditGroup);
    if ("disabled" in $$props2) $$invalidate(2, disabled = $$props2.disabled);
    if ("selectedItems" in $$props2) $$subscribe_selectedItems($$invalidate(3, selectedItems2 = $$props2.selectedItems));
  };
  return [
    sortedGroups,
    handleEditGroup,
    disabled,
    selectedItems2,
    $selectedItems,
    equipmentBySource
  ];
}
class StartingEquipmentGroups2 extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$4, create_fragment$4, safe_not_equal, {
      equipmentBySource: 5,
      sortedGroups: 0,
      handleEditGroup: 1,
      disabled: 2,
      selectedItems: 3
    });
  }
}
function create_if_block$3(ctx) {
  let section;
  let div1;
  let div0;
  let h2;
  let current_block_type_index;
  let if_block1;
  let current;
  let if_block0 = !/*disabled*/
  ctx[1] && create_if_block_2$2(ctx);
  const if_block_creators = [create_if_block_1$3, create_else_block$2];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === "2024" && /*equipmentBySource*/
    ctx2[3].length > 1) return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      section = element("section");
      div1 = element("div");
      if (if_block0) if_block0.c();
      div0 = element("div");
      h2 = element("h2");
      h2.textContent = `${localize("GAS.Equipment.Label")}`;
      if_block1.c();
      attr(h2, "class", "left");
      attr(div0, "class", "flex3");
      attr(div1, "class", "flexrow");
      attr(section, "class", "starting-equipment");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      append(section, div1);
      if (if_block0) if_block0.m(div1, null);
      append(div1, div0);
      append(div0, h2);
      if_blocks[current_block_type_index].m(section, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (!/*disabled*/
      ctx2[1]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_2$2(ctx2);
          if_block0.c();
          if_block0.m(div1, div0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
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
        if_block1 = if_blocks[current_block_type_index];
        if (!if_block1) {
          if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block1.c();
        } else {
          if_block1.p(ctx2, dirty);
        }
        transition_in(if_block1, 1);
        if_block1.m(section, null);
      }
    },
    i(local) {
      if (current) return;
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(section);
      }
      if (if_block0) if_block0.d();
      if_blocks[current_block_type_index].d();
    }
  };
}
function create_if_block_2$2(ctx) {
  let div;
  let t;
  return {
    c() {
      div = element("div");
      t = text("*");
      attr(div, "class", "flex0 required " + /*equipmentSelectionEnabled*/
      (ctx[4] ? "active" : ""));
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
    },
    p: noop,
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_else_block$2(ctx) {
  let startingequipmentgroups2014;
  let current;
  startingequipmentgroups2014 = new StartingEquipmentGroups2({
    props: {
      equipmentBySource: (
        /*equipmentBySource*/
        ctx[3]
      ),
      sortedGroups: (
        /*sortedGroups*/
        ctx[2]
      ),
      handleEditGroup: (
        /*handleEditGroup*/
        ctx[5]
      ),
      disabled: (
        /*disabled*/
        ctx[1]
      ),
      selectedItems
    }
  });
  return {
    c() {
      create_component(startingequipmentgroups2014.$$.fragment);
    },
    m(target, anchor) {
      mount_component(startingequipmentgroups2014, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const startingequipmentgroups2014_changes = {};
      if (dirty & /*equipmentBySource*/
      8) startingequipmentgroups2014_changes.equipmentBySource = /*equipmentBySource*/
      ctx2[3];
      if (dirty & /*sortedGroups*/
      4) startingequipmentgroups2014_changes.sortedGroups = /*sortedGroups*/
      ctx2[2];
      if (dirty & /*disabled*/
      2) startingequipmentgroups2014_changes.disabled = /*disabled*/
      ctx2[1];
      startingequipmentgroups2014.$set(startingequipmentgroups2014_changes);
    },
    i(local) {
      if (current) return;
      transition_in(startingequipmentgroups2014.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(startingequipmentgroups2014.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(startingequipmentgroups2014, detaching);
    }
  };
}
function create_if_block_1$3(ctx) {
  let startingequipmentgroups2024;
  let current;
  startingequipmentgroups2024 = new StartingEquipmentGroups$1({
    props: {
      equipmentBySource: (
        /*equipmentBySource*/
        ctx[3]
      ),
      sortedGroups: (
        /*sortedGroups*/
        ctx[2]
      ),
      handleEditGroup: (
        /*handleEditGroup*/
        ctx[5]
      ),
      disabled: (
        /*disabled*/
        ctx[1]
      ),
      selectedItems
    }
  });
  return {
    c() {
      create_component(startingequipmentgroups2024.$$.fragment);
    },
    m(target, anchor) {
      mount_component(startingequipmentgroups2024, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const startingequipmentgroups2024_changes = {};
      if (dirty & /*equipmentBySource*/
      8) startingequipmentgroups2024_changes.equipmentBySource = /*equipmentBySource*/
      ctx2[3];
      if (dirty & /*sortedGroups*/
      4) startingequipmentgroups2024_changes.sortedGroups = /*sortedGroups*/
      ctx2[2];
      if (dirty & /*disabled*/
      2) startingequipmentgroups2024_changes.disabled = /*disabled*/
      ctx2[1];
      startingequipmentgroups2024.$set(startingequipmentgroups2024_changes);
    },
    i(local) {
      if (current) return;
      transition_in(startingequipmentgroups2024.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(startingequipmentgroups2024.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(startingequipmentgroups2024, detaching);
    }
  };
}
function create_fragment$3(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*startingEquipment*/
    ctx[0]?.length && create_if_block$3(ctx)
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
    p(ctx2, [dirty]) {
      if (
        /*startingEquipment*/
        ctx2[0]?.length
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*startingEquipment*/
          1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$3(ctx2);
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
function instance$3($$self, $$props, $$invalidate) {
  let equipmentBySource;
  let sortedGroups;
  let $equipmentSelections;
  component_subscribe($$self, equipmentSelections, ($$value) => $$invalidate(11, $equipmentSelections = $$value));
  let { startingEquipment = [] } = $$props;
  let { classEquipment = [] } = $$props;
  let { backgroundEquipment = [] } = $$props;
  let { characterClass: characterClass2 = null } = $$props;
  let { background: background2 = null } = $$props;
  let { disabled = false } = $$props;
  let { allEquipmentItems = [] } = $$props;
  const equipmentSelectionEnabled = game.settings.get(MODULE_ID, "enableEquipmentSelection");
  function handleEditGroup(groupId) {
    editGroup(groupId);
  }
  onMount(async () => {
  });
  $$self.$$set = ($$props2) => {
    if ("startingEquipment" in $$props2) $$invalidate(0, startingEquipment = $$props2.startingEquipment);
    if ("classEquipment" in $$props2) $$invalidate(6, classEquipment = $$props2.classEquipment);
    if ("backgroundEquipment" in $$props2) $$invalidate(7, backgroundEquipment = $$props2.backgroundEquipment);
    if ("characterClass" in $$props2) $$invalidate(8, characterClass2 = $$props2.characterClass);
    if ("background" in $$props2) $$invalidate(9, background2 = $$props2.background);
    if ("disabled" in $$props2) $$invalidate(1, disabled = $$props2.disabled);
    if ("allEquipmentItems" in $$props2) $$invalidate(10, allEquipmentItems = $$props2.allEquipmentItems);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*startingEquipment*/
    1) {
      window.GAS.log.d("StartingEquipment startingEquipment", startingEquipment);
    }
    if ($$self.$$.dirty & /*$equipmentSelections*/
    2048) {
      window.GAS.log.d("StartingEquipment equipmentSelections", $equipmentSelections);
    }
    if ($$self.$$.dirty & /*startingEquipment, classEquipment, characterClass, backgroundEquipment, background*/
    961) {
      $$invalidate(3, equipmentBySource = (() => {
        if (window.GAS.dnd5eVersion < 4 || window.GAS.dnd5eRules !== "2024") {
          return [
            {
              source: null,
              equipment: startingEquipment
            }
          ];
        }
        const groups = [];
        if (classEquipment?.length > 0) {
          groups.push({
            source: "class",
            label: characterClass2?.name || "Class",
            equipment: classEquipment
          });
        }
        if (backgroundEquipment?.length > 0) {
          groups.push({
            source: "background",
            label: background2?.name || "Background",
            equipment: backgroundEquipment
          });
        }
        return groups;
      })());
    }
    if ($$self.$$.dirty & /*startingEquipment*/
    1) {
      {
        startingEquipment.forEach((entry, index) => {
          if (entry.type === "OR") {
            if (entry.group) ;
            else {
              const children = startingEquipment.filter(
                (item) => item.group === entry._id
              );
              if (children.length === 1) {
                const singleChild = children[0];
                initializeGroup(entry._id, {
                  type: "standalone",
                  label: singleChild.label || entry.label,
                  items: [singleChild],
                  sort: entry.sort
                });
              } else if (children.length > 1) {
                initializeGroup(entry._id, {
                  type: "choice",
                  label: "Choose one...",
                  items: children,
                  sort: entry.sort
                });
              }
              entry._id;
            }
          } else if (entry.type === "AND" && !entry.group) {
            const children = startingEquipment.filter((item) => item.group === entry._id);
            const orChildren = children.filter((child) => child.type === "OR");
            const regularChildren = children.filter((child) => child.type !== "OR");
            window.GAS.log.d("[StartingEquipment] Processing AND group", {
              andEntryId: entry._id,
              childrenCount: children.length,
              orChildrenCount: orChildren.length,
              regularChildrenCount: regularChildren.length
            });
            orChildren.forEach((orChild) => {
              const orGrandchildren = startingEquipment.filter((item) => item.group === orChild._id);
              if (orGrandchildren.length > 1) {
                initializeGroup(orChild._id, {
                  type: "choice",
                  label: orChild.label || "Choose one...",
                  items: orGrandchildren,
                  sort: orChild.sort || entry.sort,
                  // Use OR's sort or fallback to AND's sort
                  parentGroup: entry._id
                  // Track that this belongs to the AND group
                });
                window.GAS.log.d("[StartingEquipment] Created choice group for OR", {
                  orChildId: orChild._id,
                  orChildLabel: orChild.label,
                  orGrandchildrenCount: orGrandchildren.length,
                  parentGroupId: entry._id,
                  parentGroupLabel: entry.label
                });
              }
            });
            const andItemWithChildren = {
              ...entry,
              children
              // Keep all children for display
            };
            window.GAS.log.d("[StartingEquipment] Final AND item with all children", {
              andItemId: entry._id,
              totalChildrenCount: children.length
            });
            initializeGroup(entry._id, {
              type: "standalone",
              label: entry.label,
              items: [andItemWithChildren],
              sort: entry.sort
            });
            entry._id;
          } else if (!entry.group) {
            initializeGroup(entry._id || "standalone", {
              type: "standalone",
              label: entry.label,
              items: [entry],
              sort: entry.sort
            });
            entry._id || "standalone";
          }
        });
      }
    }
    if ($$self.$$.dirty & /*$equipmentSelections*/
    2048) {
      $$invalidate(2, sortedGroups = Object.values($equipmentSelections).sort((a, b) => (a.sort || 0) - (b.sort || 0)));
    }
    if ($$self.$$.dirty & /*sortedGroups*/
    4) {
      sortedGroups.reduce(
        (acc, group) => {
          const itemTypes = group.items.map((item) => item.type);
          if (itemTypes.includes("focus")) {
            if (!acc.focus) acc.focus = [];
            acc.focus.push(group);
          } else if (itemTypes.includes("weapon")) {
            if (!acc.weapon) acc.weapon = [];
            acc.weapon.push(group);
          } else if (itemTypes.includes("armor")) {
            if (!acc.armor) acc.armor = [];
            acc.armor.push(group);
          } else if (itemTypes.includes("tool")) {
            if (!acc.tool) acc.tool = [];
            acc.tool.push(group);
          } else {
            if (!acc.standard) acc.standard = [];
            acc.standard.push(group);
          }
          return acc;
        },
        {}
      );
    }
  };
  return [
    startingEquipment,
    disabled,
    sortedGroups,
    equipmentBySource,
    equipmentSelectionEnabled,
    handleEditGroup,
    classEquipment,
    backgroundEquipment,
    characterClass2,
    background2,
    allEquipmentItems,
    $equipmentSelections
  ];
}
class StartingEquipment extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, {
      startingEquipment: 0,
      classEquipment: 6,
      backgroundEquipment: 7,
      characterClass: 8,
      background: 9,
      disabled: 1,
      allEquipmentItems: 10
    });
  }
}
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[12] = list[i];
  return child_ctx;
}
function create_if_block$2(ctx) {
  let each_1_anchor;
  let current;
  let each_value = ensure_array_like(
    /*configurableSelections*/
    ctx[0]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
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
      if (dirty & /*equipmentByType, configurableSelections, createSelectionHandler, handleCancelSelection, isDisabled*/
      31) {
        each_value = ensure_array_like(
          /*configurableSelections*/
          ctx2[0]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$1(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block$1(child_ctx);
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
function create_if_block_3$1(ctx) {
  let div;
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      button = element("button");
      button.innerHTML = `<i class="fas fa-times svelte-gas-184aphx"></i>`;
      attr(button, "class", "cancel-button svelte-gas-184aphx");
      attr(div, "class", "flex0 right");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, button);
      if (!mounted) {
        dispose = listen(button, "click", function() {
          if (is_function(
            /*handleCancelSelection*/
            ctx[4](
              /*group*/
              ctx[12]
            )
          )) ctx[4](
            /*group*/
            ctx[12]
          ).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_2$1(ctx) {
  let iconselect;
  let current;
  iconselect = new IconSelect({
    props: {
      class: "mb-md icon-select",
      options: (
        /*equipmentByType*/
        ctx[1][
          /*group*/
          ctx[12].selectedItem.type
        ] || []
      ),
      active: (
        /*group*/
        ctx[12].parentGroup.granularSelections?.children?.[
          /*group*/
          ctx[12].id === /*group*/
          ctx[12].parentGroup.id ? (
            /*group*/
            ctx[12].selectedItem._id
          ) : (
            /*group*/
            ctx[12].id
          )
        ]?.selections?.[0]
      ),
      placeHolder: "Select " + /*group*/
      ctx[12].selectedItem.type,
      handler: (
        /*createSelectionHandler*/
        ctx[3](
          /*group*/
          ctx[12].id === /*group*/
          ctx[12].parentGroup.id ? (
            /*group*/
            ctx[12].selectedItem._id
          ) : (
            /*group*/
            ctx[12].id
          ),
          /*group*/
          ctx[12].parentGroup
        )
      ),
      id: "equipment-select-" + /*group*/
      ctx[12].selectedItem._id
    }
  });
  return {
    c() {
      create_component(iconselect.$$.fragment);
    },
    m(target, anchor) {
      mount_component(iconselect, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const iconselect_changes = {};
      if (dirty & /*equipmentByType, configurableSelections*/
      3) iconselect_changes.options = /*equipmentByType*/
      ctx2[1][
        /*group*/
        ctx2[12].selectedItem.type
      ] || [];
      if (dirty & /*configurableSelections*/
      1) iconselect_changes.active = /*group*/
      ctx2[12].parentGroup.granularSelections?.children?.[
        /*group*/
        ctx2[12].id === /*group*/
        ctx2[12].parentGroup.id ? (
          /*group*/
          ctx2[12].selectedItem._id
        ) : (
          /*group*/
          ctx2[12].id
        )
      ]?.selections?.[0];
      if (dirty & /*configurableSelections*/
      1) iconselect_changes.placeHolder = "Select " + /*group*/
      ctx2[12].selectedItem.type;
      if (dirty & /*configurableSelections*/
      1) iconselect_changes.handler = /*createSelectionHandler*/
      ctx2[3](
        /*group*/
        ctx2[12].id === /*group*/
        ctx2[12].parentGroup.id ? (
          /*group*/
          ctx2[12].selectedItem._id
        ) : (
          /*group*/
          ctx2[12].id
        ),
        /*group*/
        ctx2[12].parentGroup
      );
      if (dirty & /*configurableSelections*/
      1) iconselect_changes.id = "equipment-select-" + /*group*/
      ctx2[12].selectedItem._id;
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
      destroy_component(iconselect, detaching);
    }
  };
}
function create_if_block_1$2(ctx) {
  let iconselect;
  let current;
  iconselect = new IconSelect({
    props: {
      class: "mb-md icon-select",
      options: (
        /*equipmentByType*/
        ctx[1][
          /*group*/
          ctx[12].selectedItem.type
        ] || []
      ),
      active: (
        /*group*/
        ctx[12].granularSelections?.self?.[0]
      ),
      placeHolder: "Select " + /*group*/
      ctx[12].selectedItem.type,
      handler: (
        /*createSelectionHandler*/
        ctx[3](
          /*group*/
          ctx[12].id
        )
      ),
      id: "equipment-select-" + /*group*/
      ctx[12].selectedItem._id
    }
  });
  return {
    c() {
      create_component(iconselect.$$.fragment);
    },
    m(target, anchor) {
      mount_component(iconselect, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const iconselect_changes = {};
      if (dirty & /*equipmentByType, configurableSelections*/
      3) iconselect_changes.options = /*equipmentByType*/
      ctx2[1][
        /*group*/
        ctx2[12].selectedItem.type
      ] || [];
      if (dirty & /*configurableSelections*/
      1) iconselect_changes.active = /*group*/
      ctx2[12].granularSelections?.self?.[0];
      if (dirty & /*configurableSelections*/
      1) iconselect_changes.placeHolder = "Select " + /*group*/
      ctx2[12].selectedItem.type;
      if (dirty & /*configurableSelections*/
      1) iconselect_changes.handler = /*createSelectionHandler*/
      ctx2[3](
        /*group*/
        ctx2[12].id
      );
      if (dirty & /*configurableSelections*/
      1) iconselect_changes.id = "equipment-select-" + /*group*/
      ctx2[12].selectedItem._id;
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
      destroy_component(iconselect, detaching);
    }
  };
}
function create_each_block$1(ctx) {
  let div4;
  let div2;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div1;
  let span;
  let t_value = (
    /*group*/
    ctx[12].selectedItem.label + ""
  );
  let t;
  let div3;
  let if_block1_anchor;
  let current;
  let if_block0 = !/*isDisabled*/
  ctx[2] && create_if_block_3$1(ctx);
  let if_block1 = (
    /*group*/
    ctx[12].parentGroup && create_if_block_2$1(ctx)
  );
  let if_block2 = !/*group*/
  ctx[12].parentGroup && create_if_block_1$2(ctx);
  return {
    c() {
      div4 = element("div");
      div2 = element("div");
      div0 = element("div");
      img = element("img");
      div1 = element("div");
      span = element("span");
      t = text(t_value);
      if (if_block0) if_block0.c();
      div3 = element("div");
      if (if_block1) if_block1.c();
      if_block1_anchor = empty();
      if (if_block2) if_block2.c();
      attr(img, "class", "icon svelte-gas-184aphx");
      if (!src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*group*/
        ctx[12].selectedItem.type
      ))) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*group*/
      ctx[12].selectedItem.type);
      attr(div0, "class", "flex0 relative");
      attr(div1, "class", "flex2 left name ml-sm svelte-gas-184aphx");
      attr(div2, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div3, "class", "equipment-select svelte-gas-184aphx");
      attr(div4, "class", "equipment-config-item svelte-gas-184aphx");
    },
    m(target, anchor) {
      insert(target, div4, anchor);
      append(div4, div2);
      append(div2, div0);
      append(div0, img);
      append(div2, div1);
      append(div1, span);
      append(span, t);
      if (if_block0) if_block0.m(div2, null);
      append(div4, div3);
      if (if_block1) if_block1.m(div3, null);
      append(div3, if_block1_anchor);
      if (if_block2) if_block2.m(div3, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (!current || dirty & /*configurableSelections*/
      1 && !src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*group*/
        ctx2[12].selectedItem.type
      ))) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty & /*configurableSelections*/
      1 && img_alt_value !== (img_alt_value = /*group*/
      ctx2[12].selectedItem.type)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty & /*configurableSelections*/
      1) && t_value !== (t_value = /*group*/
      ctx2[12].selectedItem.label + "")) set_data(t, t_value);
      if (!/*isDisabled*/
      ctx2[2]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_3$1(ctx2);
          if_block0.c();
          if_block0.m(div2, null);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (
        /*group*/
        ctx2[12].parentGroup
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & /*configurableSelections*/
          1) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_2$1(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div3, if_block1_anchor);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (!/*group*/
      ctx2[12].parentGroup) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
          if (dirty & /*configurableSelections*/
          1) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block_1$2(ctx2);
          if_block2.c();
          transition_in(if_block2, 1);
          if_block2.m(div3, null);
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
      transition_in(if_block1);
      transition_in(if_block2);
      current = true;
    },
    o(local) {
      transition_out(if_block1);
      transition_out(if_block2);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div4);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      if (if_block2) if_block2.d();
    }
  };
}
function create_fragment$2(ctx) {
  let section;
  let current;
  let if_block = (
    /*configurableSelections*/
    ctx[0].length > 0 && !/*isDisabled*/
    ctx[2] && create_if_block$2(ctx)
  );
  return {
    c() {
      section = element("section");
      if (if_block) if_block.c();
    },
    m(target, anchor) {
      insert(target, section, anchor);
      if (if_block) if_block.m(section, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (
        /*configurableSelections*/
        ctx2[0].length > 0 && !/*isDisabled*/
        ctx2[2]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*configurableSelections, isDisabled*/
          5) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$2(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(section, null);
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
        detach(section);
      }
      if (if_block) if_block.d();
    }
  };
}
function instance$2($$self, $$props, $$invalidate) {
  let isDisabled;
  let configurableSelections;
  let equipmentByType;
  let $equipmentSelections;
  let $readOnlyTabs;
  component_subscribe($$self, equipmentSelections, ($$value) => $$invalidate(6, $equipmentSelections = $$value));
  component_subscribe($$self, readOnlyTabs, ($$value) => $$invalidate(7, $readOnlyTabs = $$value));
  const CONFIGURABLE_TYPES = ["tool", "weapon", "armor", "focus"];
  let packs = getPacksFromSettings("equipment");
  let allEquipmentItemsFromPacks = [];
  onMount(async () => {
    const rawItems = await extractItemsFromPacksAsync(packs, ["name->label", "img", "type", "folder", "uuid->value", "_id"], ["system.type", "system.magicalBonus", "system.properties"]);
    $$invalidate(5, allEquipmentItemsFromPacks = rawItems.map((item) => ({
      ...item,
      system: item.system ? {
        type: item.system.type,
        magicalBonus: item.system.magicalBonus,
        properties: item.system.properties
      } : void 0
    })));
    window.GAS.log.d("EquipmentSelectorDetail mounted", {
      configurableSelections,
      equipmentByType,
      allEquipmentItemsFromPacks: allEquipmentItemsFromPacks.filter((item) => item.type === "focus")
    });
  });
  const showPackLabelInSelect = game.settings.get(MODULE_ID, "showPackLabelInSelect");
  function handleSelection2(groupId, option, parentGroup) {
    window.GAS.log.d("[EquipmentSelectorDetail] handleSelection called", {
      groupId,
      groupIdType: typeof groupId,
      option,
      parentGroup: parentGroup ? {
        id: parentGroup.id,
        type: parentGroup.type
      } : null,
      hasParentGroup: !!parentGroup,
      willUseChildGranular: !!parentGroup
    });
    const value = typeof option === "object" ? option.value : option;
    if (parentGroup) {
      window.GAS.log.d("[EquipmentSelectorDetail] Calling addChildGranularSelection", {
        parentGroupId: parentGroup.id,
        childId: groupId,
        value
      });
      addChildGranularSelection(parentGroup.id, groupId, value);
    } else {
      window.GAS.log.d("[EquipmentSelectorDetail] Calling addGranularSelection", { groupId, value });
      addGranularSelection(groupId, value);
    }
  }
  function createSelectionHandler(groupId, parentGroup) {
    return function selectionHandler(option) {
      handleSelection2(groupId, option, parentGroup);
    };
  }
  function handleCancelSelection(group) {
    const groupId = group.parentGroup ? group.parentGroup.id : group.id;
    editGroup(groupId);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$readOnlyTabs*/
    128) {
      $$invalidate(2, isDisabled = $readOnlyTabs.includes("equipment"));
    }
    if ($$self.$$.dirty & /*$equipmentSelections*/
    64) {
      $$invalidate(0, configurableSelections = Object.values($equipmentSelections).filter((group) => {
        window.GAS.log.d("[EquipmentSelectorDetail] Evaluating group", {
          groupId: group.id,
          groupType: group.type,
          hasSelectedItem: !!group.selectedItem,
          selectedItemType: group.selectedItem?.type,
          inProgress: group.inProgress,
          completed: group.completed
        });
        if (!group.selectedItem || !group.inProgress) {
          return false;
        }
        if (group.selectedItem && (CONFIGURABLE_TYPES.includes(group.selectedItem?.type) || group.selectedItem?.type === "AND")) {
          window.GAS.log.d("[EquipmentSelectorDetail] Configurable group found", {
            groupId: group.id,
            selectedItemType: group.selectedItem.type,
            inProgress: group.inProgress,
            isAND: group.selectedItem.type === "AND",
            hasConfigurableChildren: group.selectedItem?.type === "AND" && group.selectedItem?.children?.some((child) => CONFIGURABLE_TYPES.includes(child.type))
          });
        }
        return CONFIGURABLE_TYPES.includes(group.selectedItem?.type) || group.selectedItem?.type === "AND" && group.selectedItem?.children?.some((child) => CONFIGURABLE_TYPES.includes(child.type));
      }).flatMap((group) => {
        if (group.selectedItem?.type === "AND" && group.selectedItem?.children) {
          window.GAS.log.d("[EquipSelect DETAIL] Processing AND group with children", {
            groupId: group.id,
            children: group.selectedItem.children.map((child) => ({
              type: child.type,
              label: child.label,
              _id: child._id
            }))
          });
          return group.selectedItem.children.filter((child) => CONFIGURABLE_TYPES.includes(child.type)).map((child) => ({
            ...group,
            selectedItem: child,
            parentGroup: group
          }));
        }
        if (group.parentGroup && typeof group.parentGroup === "string") {
          const parentGroupObject = $equipmentSelections[group.parentGroup];
          window.GAS.log.d("[EquipmentSelectorDetail] Resolving parentGroup from string ID", {
            groupId: group.id,
            parentGroupId: group.parentGroup,
            parentGroupObject: parentGroupObject ? {
              id: parentGroupObject.id,
              type: parentGroupObject.type,
              label: parentGroupObject.label
            } : null,
            resolved: !!parentGroupObject
          });
          return [{ ...group, parentGroup: parentGroupObject }];
        }
        return [group];
      }));
    }
    if ($$self.$$.dirty & /*configurableSelections, allEquipmentItemsFromPacks*/
    33) {
      $$invalidate(1, equipmentByType = configurableSelections.reduce(
        (acc, group) => {
          const type = group.selectedItem.type;
          if (!acc[type]) {
            acc[type] = allEquipmentItemsFromPacks.filter((item) => {
              if (type === "weapon" && group.selectedItem?.key) {
                if (item.type !== type) return false;
                if (group.selectedItem.key === "sim") {
                  return ["simpleM", "simpleR"].includes(item.system?.type?.value) && !item.system?.magicalBonus && !item.system.properties?.includes("mgc");
                }
                if (group.selectedItem.key === "mar") {
                  return ["martialM", "martialR"].includes(item.system?.type?.value) && !item.system?.magicalBonus && !item.system.properties?.includes("mgc");
                }
                if (["martialM", "martialR", "simpleM", "simpleR"].includes(group.selectedItem.key)) {
                  return item.system?.type?.value === group.selectedItem.key && !item.system?.magicalBonus && !item.system.properties?.includes("mgc");
                }
                return item.system?.baseItem === group.selectedItem.key;
              }
              if (type === "focus" && group.selectedItem?.key) {
                return item.system?.properties?.includes("foc") && !item.system.properties?.includes("mgc");
              }
              if (type === "armor" && group.selectedItem?.key) {
                return item.system?.type?.value === group.selectedItem.key && !item.system.properties?.includes("mgc");
              }
              if (type === "tool" && group.selectedItem?.key) {
                return item.type === type && item.system.type.value === group.selectedItem.key && !item.system.properties?.includes("mgc");
              }
              return true;
            }).sort((a, b) => a.label.localeCompare(showPackLabelInSelect ? b.compoundLabel : b.label));
          }
          return acc;
        },
        {}
      ));
    }
    if ($$self.$$.dirty & /*configurableSelections*/
    1) {
      if (configurableSelections.length > 0) {
        window.GAS.log.d("[EquipmentSelectorDetail] Configurable selections:", configurableSelections);
        window.scrollTo(0, 0);
        setTimeout(
          () => {
            const firstEquipmentSelect = document.querySelector(".equipment-select");
            if (firstEquipmentSelect) {
              firstEquipmentSelect.scrollIntoView({ behavior: "smooth" });
            }
          },
          100
        );
      }
    }
  };
  return [
    configurableSelections,
    equipmentByType,
    isDisabled,
    createSelectionHandler,
    handleCancelSelection,
    allEquipmentItemsFromPacks,
    $equipmentSelections,
    $readOnlyTabs
  ];
}
class EquipmentSelectorDetail extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, {});
  }
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[4] = list[i];
  return child_ctx;
}
function create_else_block$1(ctx) {
  let each_1_anchor;
  let each_value = ensure_array_like(
    /*plannedItems*/
    ctx[0]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
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
    },
    p(ctx2, dirty) {
      if (dirty & /*plannedItems, TextEditor, getItemName*/
      1) {
        each_value = ensure_array_like(
          /*plannedItems*/
          ctx2[0]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(each_1_anchor);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_if_block$1(ctx) {
  let tr;
  let td;
  return {
    c() {
      tr = element("tr");
      td = element("td");
      td.textContent = `${localize("GAS.Equipment.NoItemsSelected")}`;
      attr(td, "class", "empty-message svelte-gas-41ub3c");
      attr(td, "colspan", "4");
      attr(tr, "class", "svelte-gas-41ub3c");
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td);
    },
    p: noop,
    d(detaching) {
      if (detaching) {
        detach(tr);
      }
    }
  };
}
function create_else_block_1(ctx) {
  let img;
  let img_src_value;
  return {
    c() {
      img = element("img");
      if (!src_url_equal(img.src, img_src_value = "icons/svg/item-bag.svg")) attr(img, "src", img_src_value);
      attr(img, "width", "32");
      attr(img, "height", "32");
      attr(img, "class", "svelte-gas-41ub3c");
    },
    m(target, anchor) {
      insert(target, img, anchor);
    },
    p: noop,
    d(detaching) {
      if (detaching) {
        detach(img);
      }
    }
  };
}
function create_if_block_1$1(ctx) {
  let img;
  let img_src_value;
  return {
    c() {
      img = element("img");
      if (!src_url_equal(img.src, img_src_value = /*item*/
      ctx[4].img)) attr(img, "src", img_src_value);
      attr(img, "width", "32");
      attr(img, "height", "32");
      attr(img, "class", "svelte-gas-41ub3c");
    },
    m(target, anchor) {
      insert(target, img, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & /*plannedItems*/
      1 && !src_url_equal(img.src, img_src_value = /*item*/
      ctx2[4].img)) {
        attr(img, "src", img_src_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(img);
      }
    }
  };
}
function create_catch_block(ctx) {
  return { c: noop, m: noop, p: noop, d: noop };
}
function create_then_block(ctx) {
  let td;
  let raw_value = (
    /*Html*/
    (ctx[7] || "--") + ""
  );
  return {
    c() {
      td = element("td");
      attr(td, "class", "svelte-gas-41ub3c");
    },
    m(target, anchor) {
      insert(target, td, anchor);
      td.innerHTML = raw_value;
    },
    p(ctx2, dirty) {
      if (dirty & /*plannedItems*/
      1 && raw_value !== (raw_value = /*Html*/
      (ctx2[7] || "--") + "")) td.innerHTML = raw_value;
    },
    d(detaching) {
      if (detaching) {
        detach(td);
      }
    }
  };
}
function create_pending_block(ctx) {
  return { c: noop, m: noop, p: noop, d: noop };
}
function create_each_block(ctx) {
  let tr;
  let td0;
  let promise;
  let td1;
  let t0_value = (
    /*item*/
    (ctx[4]?.system?.weight?.value || 0) + ""
  );
  let t0;
  let td2;
  let t1_value = (
    /*item*/
    (ctx[4]?.system?.quantity || 1) + ""
  );
  let t1;
  function select_block_type_1(ctx2, dirty) {
    if (
      /*item*/
      ctx2[4] && /*item*/
      ctx2[4].img
    ) return create_if_block_1$1;
    return create_else_block_1;
  }
  let current_block_type = select_block_type_1(ctx);
  let if_block = current_block_type(ctx);
  let info = {
    ctx,
    current: null,
    token: null,
    hasCatch: false,
    pending: create_pending_block,
    then: create_then_block,
    catch: create_catch_block,
    value: 7
  };
  handle_promise(promise = TextEditor.enrichHTML(getItemName(
    /*item*/
    ctx[4]
  ) || ""), info);
  return {
    c() {
      tr = element("tr");
      td0 = element("td");
      if_block.c();
      info.block.c();
      td1 = element("td");
      t0 = text(t0_value);
      td2 = element("td");
      t1 = text(t1_value);
      attr(td0, "width", "50");
      attr(td0, "class", "svelte-gas-41ub3c");
      attr(td1, "class", "weight svelte-gas-41ub3c");
      attr(td2, "class", "quantity svelte-gas-41ub3c");
      attr(tr, "class", "svelte-gas-41ub3c");
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td0);
      if_block.m(td0, null);
      info.block.m(tr, info.anchor = null);
      info.mount = () => tr;
      info.anchor = td1;
      append(tr, td1);
      append(td1, t0);
      append(tr, td2);
      append(td2, t1);
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
        if_block.p(ctx, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx);
        if (if_block) {
          if_block.c();
          if_block.m(td0, null);
        }
      }
      info.ctx = ctx;
      if (dirty & /*plannedItems*/
      1 && promise !== (promise = TextEditor.enrichHTML(getItemName(
        /*item*/
        ctx[4]
      ) || "")) && handle_promise(promise, info)) ;
      else {
        update_await_block_branch(info, ctx, dirty);
      }
      if (dirty & /*plannedItems*/
      1 && t0_value !== (t0_value = /*item*/
      (ctx[4]?.system?.weight?.value || 0) + "")) set_data(t0, t0_value);
      if (dirty & /*plannedItems*/
      1 && t1_value !== (t1_value = /*item*/
      (ctx[4]?.system?.quantity || 1) + "")) set_data(t1, t1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(tr);
      }
      if_block.d();
      info.block.d();
      info.token = null;
      info = null;
    }
  };
}
function create_fragment$1(ctx) {
  let div;
  let h3;
  let table;
  let thead;
  let tr;
  let th0;
  let th1;
  let th2;
  let th3;
  let tbody;
  function select_block_type(ctx2, dirty) {
    if (
      /*plannedItems*/
      ctx2[0].length === 0
    ) return create_if_block$1;
    return create_else_block$1;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      div = element("div");
      h3 = element("h3");
      h3.textContent = `${localize("GAS.Equipment.PlannedInventory")}`;
      table = element("table");
      thead = element("thead");
      tr = element("tr");
      th0 = element("th");
      th0.innerHTML = ``;
      th1 = element("th");
      th1.textContent = `${localize("GAS.Item")}`;
      th2 = element("th");
      th2.textContent = `${localize("GAS.Equipment.Weight")}`;
      th3 = element("th");
      th3.textContent = `${localize("GAS.Equipment.Quantity")}`;
      tbody = element("tbody");
      if_block.c();
      attr(th0, "class", "svelte-gas-41ub3c");
      attr(th1, "class", "white svelte-gas-41ub3c");
      attr(th2, "class", "white svelte-gas-41ub3c");
      attr(th3, "class", "white svelte-gas-41ub3c");
      attr(tr, "class", "svelte-gas-41ub3c");
      attr(table, "class", "inventory-table svelte-gas-41ub3c");
      attr(div, "class", "planned-inventory svelte-gas-41ub3c");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, h3);
      append(div, table);
      append(table, thead);
      append(thead, tr);
      append(tr, th0);
      append(tr, th1);
      append(tr, th2);
      append(tr, th3);
      append(table, tbody);
      if_block.m(tbody, null);
    },
    p(ctx2, [dirty]) {
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(tbody, null);
        }
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      if_block.d();
    }
  };
}
function getItemName(item) {
  return `@UUID[${item?.uuid}]{${item?.name}}`;
}
function instance$1($$self, $$props, $$invalidate) {
  let rawSelections;
  let $flattenedSelections;
  component_subscribe($$self, flattenedSelections, ($$value) => $$invalidate(2, $flattenedSelections = $$value));
  let plannedItems = [];
  onMount(() => {
  });
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$flattenedSelections*/
    4) {
      $$invalidate(1, rawSelections = $flattenedSelections || []);
    }
    if ($$self.$$.dirty & /*rawSelections*/
    2) {
      {
        Promise.all(rawSelections.map(async (selection) => {
          if (selection.type === "linked") {
            return await fromUuid(selection.key);
          }
          if (selection.key) {
            return await fromUuid(selection.key);
          }
          return selection;
        })).then((items) => {
          const groupedItems = items.reduce(
            (acc, item) => {
              if (!item) return acc;
              const key = item.uuid || item._id;
              if (!acc[key]) {
                acc[key] = {
                  ...item,
                  system: { ...item.system, quantity: 1 },
                  uuid: key
                };
              } else {
                acc[key].system.quantity = (acc[key].system.quantity || 1) + 1;
              }
              return acc;
            },
            {}
          );
          $$invalidate(0, plannedItems = Object.values(groupedItems));
        });
      }
    }
  };
  return [plannedItems, rawSelections, $flattenedSelections];
}
class PlannedInventory extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
  }
}
function create_if_block_3(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      div.textContent = "Equipment has been confirmed and is now read-only";
      attr(div, "class", "info-message svelte-gas-m1dr6m");
    },
    m(target, anchor) {
      insert(target, div, anchor);
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_if_block(ctx) {
  let section;
  let current_block_type_index;
  let if_block0;
  let if_block0_anchor;
  let current;
  const if_block_creators = [create_if_block_2, create_else_block];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === "2024") return 0;
    return 1;
  }
  current_block_type_index = select_block_type();
  if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  let if_block1 = (
    /*isGoldComplete*/
    ctx[3] && create_if_block_1(ctx)
  );
  return {
    c() {
      section = element("section");
      if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      attr(section, "class", "equipment-flow svelte-gas-m1dr6m");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      if_blocks[current_block_type_index].m(section, null);
      append(section, if_block0_anchor);
      if (if_block1) if_block1.m(section, null);
      current = true;
    },
    p(ctx2, dirty) {
      if_block0.p(ctx2, dirty);
      if (
        /*isGoldComplete*/
        ctx2[3]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & /*isGoldComplete*/
          8) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_1(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(section, null);
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
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(if_block0);
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(section);
      }
      if_blocks[current_block_type_index].d();
      if (if_block1) if_block1.d();
    }
  };
}
function create_else_block(ctx) {
  let startinggold;
  let current;
  startinggold = new StartingGold$1({
    props: {
      characterClass: (
        /*$characterClass*/
        ctx[4]
      )
    }
  });
  return {
    c() {
      create_component(startinggold.$$.fragment);
    },
    m(target, anchor) {
      mount_component(startinggold, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const startinggold_changes = {};
      if (dirty & /*$characterClass*/
      16) startinggold_changes.characterClass = /*$characterClass*/
      ctx2[4];
      startinggold.$set(startinggold_changes);
    },
    i(local) {
      if (current) return;
      transition_in(startinggold.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(startinggold.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(startinggold, detaching);
    }
  };
}
function create_if_block_2(ctx) {
  let startinggoldv4;
  let current;
  startinggoldv4 = new StartingGold2({
    props: {
      characterClass: (
        /*$characterClass*/
        ctx[4]
      ),
      background: (
        /*$background*/
        ctx[5]
      )
    }
  });
  return {
    c() {
      create_component(startinggoldv4.$$.fragment);
    },
    m(target, anchor) {
      mount_component(startinggoldv4, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const startinggoldv4_changes = {};
      if (dirty & /*$characterClass*/
      16) startinggoldv4_changes.characterClass = /*$characterClass*/
      ctx2[4];
      if (dirty & /*$background*/
      32) startinggoldv4_changes.background = /*$background*/
      ctx2[5];
      startinggoldv4.$set(startinggoldv4_changes);
    },
    i(local) {
      if (current) return;
      transition_in(startinggoldv4.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(startinggoldv4.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(startinggoldv4, detaching);
    }
  };
}
function create_if_block_1(ctx) {
  let startingequipment;
  let current;
  startingequipment = new StartingEquipment({
    props: {
      startingEquipment: (
        /*$compatibleStartingEquipment*/
        ctx[1]
      ),
      classEquipment: (
        /*$classStartingEquipment*/
        ctx[6]
      ),
      backgroundEquipment: (
        /*$backgroundStartingEquipment*/
        ctx[7]
      ),
      characterClass: (
        /*$characterClass*/
        ctx[4]
      ),
      background: (
        /*$background*/
        ctx[5]
      ),
      proficiencies: (
        /*proficiencies*/
        ctx[2]
      ),
      disabled: (
        /*isDisabled*/
        ctx[0]
      )
    }
  });
  return {
    c() {
      create_component(startingequipment.$$.fragment);
    },
    m(target, anchor) {
      mount_component(startingequipment, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const startingequipment_changes = {};
      if (dirty & /*$compatibleStartingEquipment*/
      2) startingequipment_changes.startingEquipment = /*$compatibleStartingEquipment*/
      ctx2[1];
      if (dirty & /*$classStartingEquipment*/
      64) startingequipment_changes.classEquipment = /*$classStartingEquipment*/
      ctx2[6];
      if (dirty & /*$backgroundStartingEquipment*/
      128) startingequipment_changes.backgroundEquipment = /*$backgroundStartingEquipment*/
      ctx2[7];
      if (dirty & /*$characterClass*/
      16) startingequipment_changes.characterClass = /*$characterClass*/
      ctx2[4];
      if (dirty & /*$background*/
      32) startingequipment_changes.background = /*$background*/
      ctx2[5];
      if (dirty & /*proficiencies*/
      4) startingequipment_changes.proficiencies = /*proficiencies*/
      ctx2[2];
      if (dirty & /*isDisabled*/
      1) startingequipment_changes.disabled = /*isDisabled*/
      ctx2[0];
      startingequipment.$set(startingequipment_changes);
    },
    i(local) {
      if (current) return;
      transition_in(startingequipment.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(startingequipment.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(startingequipment, detaching);
    }
  };
}
function create_fragment(ctx) {
  let div5;
  let div4;
  let div3;
  let div0;
  let h3;
  let if_block0_anchor;
  let div1;
  let div2;
  let plannedinventory;
  let equipmentselectordetail;
  let current;
  let if_block0 = (
    /*isDisabled*/
    ctx[0] && create_if_block_3()
  );
  let if_block1 = !/*isDisabled*/
  ctx[0] && create_if_block(ctx);
  plannedinventory = new PlannedInventory({});
  equipmentselectordetail = new EquipmentSelectorDetail({});
  return {
    c() {
      div5 = element("div");
      div4 = element("div");
      div3 = element("div");
      div0 = element("div");
      h3 = element("h3");
      h3.textContent = `${localize("GAS.Equipment.StartingGold")}`;
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      div1 = element("div");
      div2 = element("div");
      create_component(plannedinventory.$$.fragment);
      create_component(equipmentselectordetail.$$.fragment);
      attr(div0, "class", "flex2 pr-sm col-a");
      attr(div1, "class", "flex0 border-right right-border-gradient-mask");
      attr(div2, "class", "flex3 left scroll col-b");
      attr(div3, "class", "flexrow");
      attr(div4, "class", "content svelte-gas-m1dr6m");
      attr(div5, "class", "container svelte-gas-m1dr6m");
    },
    m(target, anchor) {
      insert(target, div5, anchor);
      append(div5, div4);
      append(div4, div3);
      append(div3, div0);
      append(div0, h3);
      if (if_block0) if_block0.m(div0, null);
      append(div0, if_block0_anchor);
      if (if_block1) if_block1.m(div0, null);
      append(div3, div1);
      append(div3, div2);
      mount_component(plannedinventory, div2, null);
      mount_component(equipmentselectordetail, div2, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (
        /*isDisabled*/
        ctx2[0]
      ) {
        if (if_block0) ;
        else {
          if_block0 = create_if_block_3();
          if_block0.c();
          if_block0.m(div0, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (!/*isDisabled*/
      ctx2[0]) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & /*isDisabled*/
          1) {
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
    },
    i(local) {
      if (current) return;
      transition_in(if_block1);
      transition_in(plannedinventory.$$.fragment, local);
      transition_in(equipmentselectordetail.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(if_block1);
      transition_out(plannedinventory.$$.fragment, local);
      transition_out(equipmentselectordetail.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div5);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      destroy_component(plannedinventory);
      destroy_component(equipmentselectordetail);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let isGoldComplete;
  let proficiencies;
  let isDisabled;
  let $readOnlyTabs;
  let $compatibleStartingEquipment;
  let $goldChoices;
  let $doc;
  let $goldRoll;
  let $areGoldChoicesComplete;
  let $characterClass;
  let $background;
  let $classStartingEquipment;
  let $backgroundStartingEquipment;
  component_subscribe($$self, readOnlyTabs, ($$value) => $$invalidate(9, $readOnlyTabs = $$value));
  component_subscribe($$self, compatibleStartingEquipment, ($$value) => $$invalidate(1, $compatibleStartingEquipment = $$value));
  component_subscribe($$self, goldChoices, ($$value) => $$invalidate(10, $goldChoices = $$value));
  component_subscribe($$self, goldRoll, ($$value) => $$invalidate(12, $goldRoll = $$value));
  component_subscribe($$self, areGoldChoicesComplete, ($$value) => $$invalidate(13, $areGoldChoicesComplete = $$value));
  component_subscribe($$self, characterClass, ($$value) => $$invalidate(4, $characterClass = $$value));
  component_subscribe($$self, background, ($$value) => $$invalidate(5, $background = $$value));
  component_subscribe($$self, classStartingEquipment, ($$value) => $$invalidate(6, $classStartingEquipment = $$value));
  component_subscribe($$self, backgroundStartingEquipment, ($$value) => $$invalidate(7, $backgroundStartingEquipment = $$value));
  const doc = getContext("#doc");
  component_subscribe($$self, doc, (value) => $$invalidate(11, $doc = value));
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$areGoldChoicesComplete, $goldRoll*/
    12288) {
      $$invalidate(3, isGoldComplete = window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === "2024" ? $areGoldChoicesComplete : $goldRoll > 0);
    }
    if ($$self.$$.dirty & /*$doc*/
    2048) {
      $$invalidate(2, proficiencies = $doc.system?.proficiencies || {});
    }
    if ($$self.$$.dirty & /*$readOnlyTabs*/
    512) {
      $$invalidate(0, isDisabled = $readOnlyTabs.includes("equipment"));
    }
    if ($$self.$$.dirty & /*$goldChoices*/
    1024) {
      window.GAS.log.d("Equipment goldChoices", $goldChoices);
    }
    if ($$self.$$.dirty & /*$compatibleStartingEquipment*/
    2) {
      window.GAS.log.d("Equipment compatibleStartingEquipment", $compatibleStartingEquipment);
    }
    if ($$self.$$.dirty & /*isDisabled, $readOnlyTabs*/
    513) {
      window.GAS.log.d("Equipment component:", { isDisabled, readOnlyTabs: $readOnlyTabs });
    }
  };
  game.settings.get(MODULE_ID, "enableEquipmentSelection");
  return [
    isDisabled,
    $compatibleStartingEquipment,
    proficiencies,
    isGoldComplete,
    $characterClass,
    $background,
    $classStartingEquipment,
    $backgroundStartingEquipment,
    doc,
    $readOnlyTabs,
    $goldChoices,
    $doc,
    $goldRoll,
    $areGoldChoicesComplete
  ];
}
class Equipment extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {});
  }
}
export {
  Equipment as default
};
//# sourceMappingURL=Equipment-CbcNSMjD.js.map
