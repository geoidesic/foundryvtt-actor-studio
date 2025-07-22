import { S as SvelteComponent, i as init, s as safe_not_equal, C as noop, k as detach, x as attr, q as insert, u as append, v as element, l as localize, w as empty, b as component_subscribe, aj as goldRoll, j as set_store_value, M as MODULE_ID, G as text, F as set_data, a5 as listen, a3 as run_all, am as preventDefault, aa as bubble, t as transition_out, a as transition_in, n as group_outros, p as check_outros, an as totalGoldFromChoices, ao as equipmentGoldOptions, ap as goldChoices, aq as parsedEquipmentGold, d as destroy_component, m as mount_component, c as create_component, ar as clearGoldChoices, ak as clearEquipmentSelections, as as clearEquipmentGoldChoices, at as setClassGoldChoice, au as setEquipmentGoldChoice, av as setBackgroundGoldChoice, B as ensure_array_like, D as destroy_each, a9 as subscribe, aw as isGroupFromSource, ax as handleSelection, ay as matchingGroupsForSource, az as isGroupEditable, ad as is_function, N as src_url_equal, aA as getEquipmentIcon, aB as getOptionClasses, aC as set_style, aD as getEquipmentItemClasses, aE as equipmentSelections, o as onMount, aF as initializeGroup, aG as editGroup, aH as selectedItems, r as readOnlyTabs, J as getPacksFromSettings, al as extractItemsFromPacksAsync, aI as addChildGranularSelection, aJ as addGranularSelection, aK as flattenedSelections, aL as enrichHTML, af as characterClass, I as background, aM as compatibleStartingEquipment, aN as areGoldChoicesComplete, aO as classStartingEquipment, aP as backgroundStartingEquipment, g as getContext, aQ as destroyAdvancementManagers } from "./index-DYTMcRgX.js";
import { I as IconSelect } from "./IconSelect-DhLSMhbL.js";
import { h as handle_promise, u as update_await_block_branch } from "./await_block-Bi6bBKF8.js";
import { S as StandardTabLayout } from "./StandardTabLayout-CEWgmhYn.js";
function create_if_block_3$5(ctx) {
  let div;
  let t_1;
  let div_class_value;
  return {
    c() {
      div = element("div");
      t_1 = text("*");
      attr(div, "class", div_class_value = "flex0 required " + (!/*hasRolled*/
      ctx[3] ? "active" : ""));
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t_1);
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
function create_if_block_2$7(ctx) {
  let div6;
  let div2;
  let div0;
  let div1;
  let t1;
  let div5;
  let div3;
  let div4;
  let i;
  let div4_class_value;
  let mounted;
  let dispose;
  return {
    c() {
      div6 = element("div");
      div2 = element("div");
      div0 = element("div");
      div0.textContent = "Formula: ";
      div1 = element("div");
      t1 = text(
        /*formula*/
        ctx[1]
      );
      div5 = element("div");
      div3 = element("div");
      div4 = element("div");
      i = element("i");
      attr(div0, "class", "flex1");
      attr(div1, "class", "flex1 badge center svelte-gas-vc9wsy");
      attr(div2, "class", "flexrow left gap-4");
      attr(div3, "class", "flex1");
      attr(i, "class", "fas fa-dice");
      attr(div4, "class", div4_class_value = "flex0 right controls " + /*hasRolled*/
      (ctx[3] || /*disabled*/
      ctx[0] ? "" : "active") + " svelte-gas-vc9wsy");
      attr(div4, "alt", "Roll");
      attr(div5, "class", "flexrow");
      attr(div6, "class", "roll-gold flexcol gap-10 svelte-gas-vc9wsy");
    },
    m(target, anchor) {
      insert(target, div6, anchor);
      append(div6, div2);
      append(div2, div0);
      append(div2, div1);
      append(div1, t1);
      append(div6, div5);
      append(div5, div3);
      append(div5, div4);
      append(div4, i);
      if (!mounted) {
        dispose = listen(
          div4,
          "click",
          /*rollGold*/
          ctx[4]
        );
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*formula*/
      2) set_data(
        t1,
        /*formula*/
        ctx2[1]
      );
      if (dirty & /*hasRolled, disabled*/
      9 && div4_class_value !== (div4_class_value = "flex0 right controls " + /*hasRolled*/
      (ctx2[3] || /*disabled*/
      ctx2[0] ? "" : "active") + " svelte-gas-vc9wsy")) {
        attr(div4, "class", div4_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div6);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_if_block$7(ctx) {
  let div1;
  let div0;
  let if_block = (
    /*hasRolled*/
    ctx[3] && create_if_block_1$7(ctx)
  );
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      if (if_block) if_block.c();
      attr(div0, "class", "flex3");
      attr(div1, "class", "flexrow left justify-flexrow-vertical");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, div0);
      if (if_block) if_block.m(div0, null);
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
    },
    d(detaching) {
      if (detaching) {
        detach(div1);
      }
      if (if_block) if_block.d();
    }
  };
}
function create_if_block_1$7(ctx) {
  let div3;
  let div2;
  let div0;
  let div1;
  let span;
  let t0;
  let t1;
  return {
    c() {
      div3 = element("div");
      div2 = element("div");
      div0 = element("div");
      div0.innerHTML = `<i class="fas fa-coins svelte-gas-vc9wsy"></i>`;
      div1 = element("div");
      span = element("span");
      t0 = text(
        /*$goldRoll*/
        ctx[2]
      );
      t1 = text(" gp");
      attr(div0, "class", "flex0 relative icon svelte-gas-vc9wsy");
      attr(span, "class", "value svelte-gas-vc9wsy");
      attr(div1, "class", "flex2 left");
      attr(div2, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div3, "class", "result final-gold-result svelte-gas-vc9wsy");
    },
    m(target, anchor) {
      insert(target, div3, anchor);
      append(div3, div2);
      append(div2, div0);
      append(div2, div1);
      append(div1, span);
      append(span, t0);
      append(span, t1);
    },
    p(ctx2, dirty) {
      if (dirty & /*$goldRoll*/
      4) set_data(
        t0,
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
  ctx[3] && create_if_block_2$7(ctx);
  let if_block2 = !/*disabled*/
  ctx[0] && create_if_block$7(ctx);
  return {
    c() {
      section = element("section");
      div1 = element("div");
      if (if_block0) if_block0.c();
      div0 = element("div");
      h2 = element("h2");
      h2.textContent = `${localize("Equipment.Gold")}`;
      div2 = element("div");
      if (if_block1) if_block1.c();
      if_block1_anchor = empty();
      if (if_block2) if_block2.c();
      attr(h2, "class", "left");
      attr(div0, "class", "flex3");
      attr(div1, "class", "flexrow");
      attr(div2, "class", div2_class_value = "flexcol gold-section gap-10 " + /*disabled*/
      (ctx[0] ? "disabled" : "") + " svelte-gas-vc9wsy");
      attr(section, "class", "starting-gold svelte-gas-vc9wsy");
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
          if_block1 = create_if_block_2$7(ctx2);
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
      (ctx2[0] ? "disabled" : "") + " svelte-gas-vc9wsy")) {
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
function create_if_block_6$2(ctx) {
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
function create_if_block_5$2(ctx) {
  let div;
  let iconbutton;
  let current;
  iconbutton = new IconButton({
    props: { class: "option", icon: "fas fa-pencil" }
  });
  iconbutton.$on(
    "click",
    /*handleEdit*/
    ctx[15]
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
function create_if_block_3$4(ctx) {
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
  let button0_class_value;
  let button1;
  let div7;
  let div5;
  let div6;
  let span;
  let t2;
  let t3;
  let button1_class_value;
  let mounted;
  let dispose;
  function select_block_type(ctx2, dirty) {
    if (
      /*$parsedEquipmentGold*/
      ctx2[4].fromBackground.hasVariableGold
    ) return create_if_block_4$2;
    return create_else_block_1$3;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type(ctx);
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
      div2.innerHTML = `<i class="fas fa-sack-dollar svelte-gas-1bgx6tv"></i>`;
      div3 = element("div");
      if_block.c();
      button1 = element("button");
      div7 = element("div");
      div5 = element("div");
      div5.innerHTML = `<i class="fas fa-coins svelte-gas-1bgx6tv"></i>`;
      div6 = element("div");
      span = element("span");
      t2 = text(
        /*backgroundGoldOnly*/
        ctx[7]
      );
      t3 = text(" gp");
      attr(div0, "class", "flex group-label svelte-gas-1bgx6tv");
      attr(div1, "class", "flexrow left");
      attr(div2, "class", "flex0 relative icon svelte-gas-1bgx6tv");
      attr(div3, "class", "flex2 left name svelte-gas-1bgx6tv");
      attr(div4, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(button0, "class", button0_class_value = "option " + /*backgroundChoice*/
      (ctx[2] === "equipment" ? "selected" : "") + " " + /*showEditButton*/
      (ctx[11] ? "disabled" : "") + " svelte-gas-1bgx6tv");
      button0.disabled = /*showEditButton*/
      ctx[11];
      attr(div5, "class", "flex0 relative icon svelte-gas-1bgx6tv");
      attr(span, "class", "svelte-gas-1bgx6tv");
      attr(div6, "class", "flex2 left name svelte-gas-1bgx6tv");
      attr(div7, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(button1, "class", button1_class_value = "option " + /*backgroundChoice*/
      (ctx[2] === "gold" ? "selected" : "") + " " + /*showEditButton*/
      (ctx[11] ? "disabled" : "") + " svelte-gas-1bgx6tv");
      button1.disabled = /*showEditButton*/
      ctx[11];
      attr(div8, "class", "options svelte-gas-1bgx6tv");
      attr(div9, "class", "equipment-group svelte-gas-1bgx6tv");
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
      if_block.m(div3, null);
      append(div8, button1);
      append(button1, div7);
      append(div7, div5);
      append(div7, div6);
      append(div6, span);
      append(span, t2);
      append(span, t3);
      if (!mounted) {
        dispose = [
          listen(
            button0,
            "mousedown",
            /*makeBackgroundChoiceHandler*/
            ctx[14]("equipment")
          ),
          listen(
            button1,
            "mousedown",
            /*makeBackgroundChoiceHandler*/
            ctx[14]("gold")
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*background*/
      2 && t0_value !== (t0_value = /*background*/
      ctx2[1].name + "")) set_data(t0, t0_value);
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(div3, null);
        }
      }
      if (dirty & /*backgroundChoice, showEditButton*/
      2052 && button0_class_value !== (button0_class_value = "option " + /*backgroundChoice*/
      (ctx2[2] === "equipment" ? "selected" : "") + " " + /*showEditButton*/
      (ctx2[11] ? "disabled" : "") + " svelte-gas-1bgx6tv")) {
        attr(button0, "class", button0_class_value);
      }
      if (dirty & /*showEditButton*/
      2048) {
        button0.disabled = /*showEditButton*/
        ctx2[11];
      }
      if (dirty & /*backgroundGoldOnly*/
      128) set_data(
        t2,
        /*backgroundGoldOnly*/
        ctx2[7]
      );
      if (dirty & /*backgroundChoice, showEditButton*/
      2052 && button1_class_value !== (button1_class_value = "option " + /*backgroundChoice*/
      (ctx2[2] === "gold" ? "selected" : "") + " " + /*showEditButton*/
      (ctx2[11] ? "disabled" : "") + " svelte-gas-1bgx6tv")) {
        attr(button1, "class", button1_class_value);
      }
      if (dirty & /*showEditButton*/
      2048) {
        button1.disabled = /*showEditButton*/
        ctx2[11];
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div9);
      }
      if_block.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_else_block_1$3(ctx) {
  let span;
  let t0_value = localize("Equipment.Label") + "";
  let t0;
  let t1;
  let t2;
  let t3;
  return {
    c() {
      span = element("span");
      t0 = text(t0_value);
      t1 = text(" + ");
      t2 = text(
        /*backgroundGoldWithEquipment*/
        ctx[8]
      );
      t3 = text(" gp");
      attr(span, "class", "svelte-gas-1bgx6tv");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t0);
      append(span, t1);
      append(span, t2);
      append(span, t3);
    },
    p(ctx2, dirty) {
      if (dirty & /*backgroundGoldWithEquipment*/
      256) set_data(
        t2,
        /*backgroundGoldWithEquipment*/
        ctx2[8]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block_4$2(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = `${localize("Equipment.Label")} + variable gp`;
      attr(span, "class", "svelte-gas-1bgx6tv");
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
  let button0_class_value;
  let button1;
  let div7;
  let div5;
  let div6;
  let span;
  let t2;
  let t3;
  let button1_class_value;
  let mounted;
  let dispose;
  function select_block_type_1(ctx2, dirty) {
    if (
      /*$parsedEquipmentGold*/
      ctx2[4].fromClass.hasVariableGold
    ) return create_if_block_2$6;
    return create_else_block$5;
  }
  let current_block_type = select_block_type_1(ctx);
  let if_block = current_block_type(ctx);
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
      div2.innerHTML = `<i class="fas fa-sack-dollar svelte-gas-1bgx6tv"></i>`;
      div3 = element("div");
      if_block.c();
      button1 = element("button");
      div7 = element("div");
      div5 = element("div");
      div5.innerHTML = `<i class="fas fa-coins svelte-gas-1bgx6tv"></i>`;
      div6 = element("div");
      span = element("span");
      t2 = text(
        /*classGoldOnly*/
        ctx[5]
      );
      t3 = text(" gp");
      attr(div0, "class", "flex group-label svelte-gas-1bgx6tv");
      attr(div1, "class", "flexrow left");
      attr(div2, "class", "flex0 relative icon svelte-gas-1bgx6tv");
      attr(div3, "class", "flex2 left name svelte-gas-1bgx6tv");
      attr(div4, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(button0, "class", button0_class_value = "option " + /*classChoice*/
      (ctx[3] === "equipment" ? "selected" : "") + " " + /*showEditButton*/
      (ctx[11] ? "disabled" : "") + " svelte-gas-1bgx6tv");
      button0.disabled = /*showEditButton*/
      ctx[11];
      attr(div5, "class", "flex0 relative icon svelte-gas-1bgx6tv");
      attr(span, "class", "svelte-gas-1bgx6tv");
      attr(div6, "class", "flex2 left name svelte-gas-1bgx6tv");
      attr(div7, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(button1, "class", button1_class_value = "option " + /*classChoice*/
      (ctx[3] === "gold" ? "selected" : "") + " " + /*showEditButton*/
      (ctx[11] ? "disabled" : "") + " svelte-gas-1bgx6tv");
      button1.disabled = /*showEditButton*/
      ctx[11];
      attr(div8, "class", "options svelte-gas-1bgx6tv");
      attr(div9, "class", "equipment-group svelte-gas-1bgx6tv");
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
      if_block.m(div3, null);
      append(div8, button1);
      append(button1, div7);
      append(div7, div5);
      append(div7, div6);
      append(div6, span);
      append(span, t2);
      append(span, t3);
      if (!mounted) {
        dispose = [
          listen(
            button0,
            "mousedown",
            /*makeClassChoiceHandler*/
            ctx[13]("equipment")
          ),
          listen(
            button1,
            "mousedown",
            /*makeClassChoiceHandler*/
            ctx[13]("gold")
          )
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & /*characterClass*/
      1 && t0_value !== (t0_value = /*characterClass*/
      ctx2[0].name + "")) set_data(t0, t0_value);
      if (current_block_type === (current_block_type = select_block_type_1(ctx2)) && if_block) {
        if_block.p(ctx2, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx2);
        if (if_block) {
          if_block.c();
          if_block.m(div3, null);
        }
      }
      if (dirty & /*classChoice, showEditButton*/
      2056 && button0_class_value !== (button0_class_value = "option " + /*classChoice*/
      (ctx2[3] === "equipment" ? "selected" : "") + " " + /*showEditButton*/
      (ctx2[11] ? "disabled" : "") + " svelte-gas-1bgx6tv")) {
        attr(button0, "class", button0_class_value);
      }
      if (dirty & /*showEditButton*/
      2048) {
        button0.disabled = /*showEditButton*/
        ctx2[11];
      }
      if (dirty & /*classGoldOnly*/
      32) set_data(
        t2,
        /*classGoldOnly*/
        ctx2[5]
      );
      if (dirty & /*classChoice, showEditButton*/
      2056 && button1_class_value !== (button1_class_value = "option " + /*classChoice*/
      (ctx2[3] === "gold" ? "selected" : "") + " " + /*showEditButton*/
      (ctx2[11] ? "disabled" : "") + " svelte-gas-1bgx6tv")) {
        attr(button1, "class", button1_class_value);
      }
      if (dirty & /*showEditButton*/
      2048) {
        button1.disabled = /*showEditButton*/
        ctx2[11];
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div9);
      }
      if_block.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_else_block$5(ctx) {
  let span;
  let t0_value = localize("Equipment.Label") + "";
  let t0;
  let t1;
  let t2;
  let t3;
  return {
    c() {
      span = element("span");
      t0 = text(t0_value);
      t1 = text(" + ");
      t2 = text(
        /*classGoldWithEquipment*/
        ctx[6]
      );
      t3 = text(" gp");
      attr(span, "class", "svelte-gas-1bgx6tv");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t0);
      append(span, t1);
      append(span, t2);
      append(span, t3);
    },
    p(ctx2, dirty) {
      if (dirty & /*classGoldWithEquipment*/
      64) set_data(
        t2,
        /*classGoldWithEquipment*/
        ctx2[6]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block_2$6(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = `${localize("Equipment.Label")} + variable gp`;
      attr(span, "class", "svelte-gas-1bgx6tv");
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
      div0.innerHTML = `<i class="fas fa-coins svelte-gas-1bgx6tv"></i>`;
      div3 = element("div");
      div1 = element("div");
      div1.innerHTML = `<span>Total Gold:</span>`;
      div2 = element("div");
      span1 = element("span");
      t1 = text(
        /*totalGold*/
        ctx[12]
      );
      t2 = text(" gp");
      attr(div0, "class", "flex0 relative icon svelte-gas-1bgx6tv");
      attr(div1, "class", "label svelte-gas-1bgx6tv");
      attr(div2, "class", "value svelte-gas-1bgx6tv");
      attr(div3, "class", "flex2 left");
      attr(div4, "class", "flexrow left result");
      attr(div5, "class", "equipment-group final-gold svelte-gas-1bgx6tv");
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
      4096) set_data(
        t1,
        /*totalGold*/
        ctx2[12]
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
  ctx[11] && create_if_block_6$2(ctx);
  let if_block1 = (
    /*showEditButton*/
    ctx[11] && create_if_block_5$2(ctx)
  );
  let if_block2 = (
    /*background*/
    ctx[1] && create_if_block_3$4(ctx)
  );
  let if_block3 = (
    /*characterClass*/
    ctx[0] && create_if_block_1$6(ctx)
  );
  let if_block4 = (
    /*classGoldComplete*/
    ctx[10] && /*backgroundGoldComplete*/
    ctx[9] && create_if_block$6(ctx)
  );
  return {
    c() {
      section = element("section");
      div1 = element("div");
      if (if_block0) if_block0.c();
      div0 = element("div");
      h2 = element("h2");
      span = element("span");
      span.textContent = `${localize("Equipment.Gold")}`;
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
      (ctx[11] ? "disabled" : "") + " svelte-gas-1bgx6tv");
      attr(section, "class", "starting-gold svelte-gas-1bgx6tv");
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
      ctx2[11]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_6$2(ctx2);
          if_block0.c();
          if_block0.m(div1, div0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (
        /*showEditButton*/
        ctx2[11]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & /*showEditButton*/
          2048) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_5$2(ctx2);
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
          if_block2 = create_if_block_3$4(ctx2);
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
        /*classGoldComplete*/
        ctx2[10] && /*backgroundGoldComplete*/
        ctx2[9]
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
      2048 && div2_class_value !== (div2_class_value = "flexcol gold-section gap-10 " + /*showEditButton*/
      (ctx2[11] ? "disabled" : "") + " svelte-gas-1bgx6tv")) {
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
  let hasChoices;
  let showEditButton;
  let classGoldComplete;
  let backgroundGoldComplete;
  let $totalGoldFromChoices;
  let $equipmentGoldOptions;
  let $goldChoices;
  let $parsedEquipmentGold;
  component_subscribe($$self, totalGoldFromChoices, ($$value) => $$invalidate(19, $totalGoldFromChoices = $$value));
  component_subscribe($$self, equipmentGoldOptions, ($$value) => $$invalidate(20, $equipmentGoldOptions = $$value));
  component_subscribe($$self, goldChoices, ($$value) => $$invalidate(21, $goldChoices = $$value));
  component_subscribe($$self, parsedEquipmentGold, ($$value) => $$invalidate(4, $parsedEquipmentGold = $$value));
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
    const classGold = $parsedEquipmentGold.fromClass;
    if (choice === "equipment" && classGold.hasVariableGold) {
      const goldValue = 0;
      setClassGoldChoice(choice, goldValue);
    } else {
      const goldValue = choice === "equipment" ? classGoldWithEquipment : classGoldOnly;
      setClassGoldChoice(choice, goldValue);
      if (choice === "equipment") {
        const equipmentGoldAmount = classGold.standardEquipmentGold || classGoldWithEquipment || 0;
        setEquipmentGoldChoice("fromClass", "default", equipmentGoldAmount);
      } else if (choice === "gold") {
        setEquipmentGoldChoice("fromClass", null, 0);
      }
    }
  }
  function handleBackgroundChoice(choice) {
    console.log("🔧 handleBackgroundChoice called:", { choice, showEditButton });
    const backgroundGold = $parsedEquipmentGold.fromBackground;
    console.log("🔧 backgroundGold:", backgroundGold);
    if (choice === "equipment" && backgroundGold.hasVariableGold) {
      const goldValue = 0;
      console.log("🔧 Variable gold path - setting goldValue:", goldValue);
      setBackgroundGoldChoice(choice, goldValue);
    } else {
      const goldValue = choice === "equipment" ? backgroundGoldWithEquipment : backgroundGoldOnly;
      console.log("🔧 Standard path - goldValue:", goldValue, "backgroundGoldWithEquipment:", backgroundGoldWithEquipment);
      setBackgroundGoldChoice(choice, goldValue);
      if (choice === "equipment") {
        const equipmentGoldAmount = backgroundGold.standardEquipmentGold || backgroundGoldWithEquipment || 0;
        console.log("🔧 Setting equipment gold amount:", equipmentGoldAmount);
        setEquipmentGoldChoice("fromBackground", "default", equipmentGoldAmount);
      } else if (choice === "gold") {
        setEquipmentGoldChoice("fromBackground", null, 0);
      }
    }
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
    clearEquipmentGoldChoices();
  }
  $$self.$$set = ($$props2) => {
    if ("characterClass" in $$props2) $$invalidate(0, characterClass2 = $$props2.characterClass);
    if ("background" in $$props2) $$invalidate(1, background2 = $$props2.background);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*characterClass, $parsedEquipmentGold, background*/
    19) {
      {
        if (characterClass2) {
          $$invalidate(5, classGoldOnly = characterClass2.system.wealth || 0);
          const classGold = $parsedEquipmentGold.fromClass;
          if (classGold.goldOptions.length > 0 && !classGold.hasVariableGold) {
            $$invalidate(6, classGoldWithEquipment = classGold.goldOptions[0].goldAmount);
          } else {
            $$invalidate(6, classGoldWithEquipment = scrape2024SecondaryGoldAward(characterClass2)?.min || 0);
          }
        }
        if (background2) {
          $$invalidate(7, backgroundGoldOnly = background2.system.wealth || 0);
          const backgroundGold = $parsedEquipmentGold.fromBackground;
          if (backgroundGold.goldOptions.length > 0 && !backgroundGold.hasVariableGold) {
            $$invalidate(8, backgroundGoldWithEquipment = backgroundGold.goldOptions[0].goldAmount);
          } else if (backgroundGold.hasVariableGold) {
            $$invalidate(8, backgroundGoldWithEquipment = 0);
          } else {
            $$invalidate(8, backgroundGoldWithEquipment = scrapeGoldFromBackground(background2)?.min || 0);
          }
        }
      }
    }
    if ($$self.$$.dirty & /*$goldChoices*/
    2097152) {
      $$invalidate(3, classChoice = $goldChoices.fromClass.choice);
    }
    if ($$self.$$.dirty & /*$goldChoices*/
    2097152) {
      $$invalidate(2, backgroundChoice = $goldChoices.fromBackground.choice);
    }
    if ($$self.$$.dirty & /*$goldChoices, $equipmentGoldOptions*/
    3145728) {
      {
        console.log("🔧 GOLD CALCULATION DEBUG:", {
          classGoldValue: $goldChoices.fromClass.goldValue,
          backgroundGoldValue: $goldChoices.fromBackground.goldValue,
          classEquipmentGold: $equipmentGoldOptions.fromClass.currentGoldAmount,
          backgroundEquipmentGold: $equipmentGoldOptions.fromBackground.currentGoldAmount,
          goldChoices: $goldChoices,
          equipmentGoldOptions: $equipmentGoldOptions
        });
      }
    }
    if ($$self.$$.dirty & /*$totalGoldFromChoices*/
    524288) {
      $$invalidate(12, totalGold = $totalGoldFromChoices);
    }
    if ($$self.$$.dirty & /*characterClass, background*/
    3) {
      $$invalidate(18, hasChoices = characterClass2 || background2);
    }
    if ($$self.$$.dirty & /*classChoice, backgroundChoice*/
    12) ;
    if ($$self.$$.dirty & /*hasChoices, classChoice, backgroundChoice*/
    262156) {
      $$invalidate(11, showEditButton = hasChoices && classChoice && backgroundChoice);
    }
    if ($$self.$$.dirty & /*classChoice*/
    8) {
      $$invalidate(10, classGoldComplete = classChoice === "gold" || classChoice === "equipment");
    }
    if ($$self.$$.dirty & /*backgroundChoice*/
    4) {
      $$invalidate(9, backgroundGoldComplete = backgroundChoice === "gold" || backgroundChoice === "equipment");
    }
  };
  return [
    characterClass2,
    background2,
    backgroundChoice,
    classChoice,
    $parsedEquipmentGold,
    classGoldOnly,
    classGoldWithEquipment,
    backgroundGoldOnly,
    backgroundGoldWithEquipment,
    backgroundGoldComplete,
    classGoldComplete,
    showEditButton,
    totalGold,
    makeClassChoiceHandler,
    makeBackgroundChoiceHandler,
    handleEdit,
    scrape2024SecondaryGoldAward,
    scrapeGoldFromBackground,
    hasChoices,
    $totalGoldFromChoices,
    $equipmentGoldOptions,
    $goldChoices
  ];
}
class StartingGold2 extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$6, create_fragment$6, safe_not_equal, {
      characterClass: 0,
      background: 1,
      scrape2024SecondaryGoldAward: 16,
      scrapeGoldFromBackground: 17
    });
  }
  get scrape2024SecondaryGoldAward() {
    return this.$$.ctx[16];
  }
  get scrapeGoldFromBackground() {
    return scrapeGoldFromBackground;
  }
}
function get_each_context$3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[11] = list[i];
  return child_ctx;
}
function get_each_context_1$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[14] = list[i];
  return child_ctx;
}
function get_each_context_4(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[17] = list[i];
  return child_ctx;
}
function get_each_context_3$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[17] = list[i];
  return child_ctx;
}
function get_each_context_2$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[17] = list[i];
  return child_ctx;
}
function create_if_block$5(ctx) {
  let div;
  let h3;
  let t0_value = (
    /*sourceGroup*/
    ctx[11].label + ""
  );
  let t0;
  let t1;
  let show_if = !matchingGroupsForSource(
    /*sortedGroups*/
    ctx[1],
    /*sourceGroup*/
    ctx[11]
  ).length;
  let if_block_anchor;
  let current;
  let if_block = show_if && create_if_block_10();
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
      ctx2[11].label + "")) set_data(t0, t0_value);
      if (dirty & /*sortedGroups, equipmentBySource*/
      3) show_if = !matchingGroupsForSource(
        /*sortedGroups*/
        ctx2[1],
        /*sourceGroup*/
        ctx2[11]
      ).length;
      if (show_if) {
        if (if_block) ;
        else {
          if_block = create_if_block_10();
          if_block.c();
          if_block.m(div, if_block_anchor);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*sortedGroups, disabled, handleEquipmentSelection, equipmentBySource, getGoldAmountForItem, $selectedItems, handleEditGroup*/
      239) {
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
function create_if_block_10(ctx) {
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
    ctx[14]
  );
  let div2;
  let current;
  let if_block0 = (
    /*group*/
    ctx[14].type === "choice" && create_if_block_8(ctx)
  );
  let if_block1 = show_if && create_if_block_7$1(ctx);
  function select_block_type_1(ctx2, dirty) {
    if (
      /*group*/
      ctx2[14].type === "standalone"
    ) return create_if_block_2$5;
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
        ctx2[14].type === "choice"
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
      2) show_if = isGroupEditable(
        /*group*/
        ctx2[14]
      );
      if (show_if) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & /*sortedGroups*/
          2) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_7$1(ctx2);
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
      ctx2[14].completed
    ) return create_if_block_9;
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
function create_if_block_7$1(ctx) {
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
        ctx[14].id
      )
    )) ctx[2](
      /*group*/
      ctx[14].id
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
    ctx[14].items
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
      if (dirty & /*disabled, sortedGroups, handleEquipmentSelection, equipmentBySource, getGoldAmountForItem, $selectedItems*/
      235) {
        each_value_4 = ensure_array_like(
          /*group*/
          ctx2[14].items
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
function create_if_block_2$5(ctx) {
  let div2;
  let div1;
  let div0;
  let if_block0 = !/*group*/
  ctx[14].completed && create_if_block_4$1();
  function select_block_type_2(ctx2, dirty) {
    if (
      /*group*/
      ctx2[14].items[0].type === "AND"
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
      ctx2[14].completed) {
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
function create_if_block_6$1(ctx) {
  let span;
  let t0;
  let t1_value = (
    /*$selectedItems*/
    ctx[5][
      /*group*/
      ctx[14].id
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
        ctx2[14].id
      ].name + "")) set_data(t1, t1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(span);
      }
    }
  };
}
function create_if_block_5$1(ctx) {
  let span;
  let t0;
  let t1_value = (
    /*getGoldAmountForItem*/
    ctx[6](
      /*group*/
      ctx[14],
      /*sourceGroup*/
      ctx[11],
      /*item*/
      ctx[17]
    ) + ""
  );
  let t1;
  let t2;
  return {
    c() {
      span = element("span");
      t0 = text("+ ");
      t1 = text(t1_value);
      t2 = text(" GP");
      attr(span, "class", "gold-amount");
      set_style(span, "color", "var(--dnd5e-color-gold)");
      set_style(span, "font-weight", "bold");
      set_style(span, "margin-left", "10px");
    },
    m(target, anchor) {
      insert(target, span, anchor);
      append(span, t0);
      append(span, t1);
      append(span, t2);
    },
    p(ctx2, dirty) {
      if (dirty & /*sortedGroups, equipmentBySource*/
      3 && t1_value !== (t1_value = /*getGoldAmountForItem*/
      ctx2[6](
        /*group*/
        ctx2[14],
        /*sourceGroup*/
        ctx2[11],
        /*item*/
        ctx2[17]
      ) + "")) set_data(t1, t1_value);
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
    ctx[17].label + ""
  );
  let if_block0_anchor;
  let show_if = (
    /*getGoldAmountForItem*/
    ctx[6](
      /*group*/
      ctx[14],
      /*sourceGroup*/
      ctx[11],
      /*item*/
      ctx[17]
    )
  );
  let div3_class_value;
  let mounted;
  let dispose;
  let if_block0 = (
    /*group*/
    ctx[14].selectedItemId === /*item*/
    ctx[17]._id && /*$selectedItems*/
    ctx[5][
      /*group*/
      ctx[14].id
    ] && create_if_block_6$1(ctx)
  );
  let if_block1 = show_if && create_if_block_5$1(ctx);
  function click_handler() {
    return (
      /*click_handler*/
      ctx[10](
        /*group*/
        ctx[14],
        /*sourceGroup*/
        ctx[11],
        /*item*/
        ctx[17]
      )
    );
  }
  return {
    c() {
      div3 = element("div");
      div2 = element("div");
      div0 = element("div");
      img = element("img");
      div1 = element("div");
      span = element("span");
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      attr(img, "class", "icon svelte-gas-1y0asf7");
      if (!src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[17].type,
        /*group*/
        ctx[14]
      ))) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[17].type);
      attr(div0, "class", "flex0 relative icon svelte-gas-1y0asf7");
      attr(div1, "class", "flex2 left name black-link svelte-gas-1y0asf7");
      attr(div2, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div3, "class", div3_class_value = "equipment-item option " + getOptionClasses(
        /*disabled*/
        ctx[3],
        /*group*/
        ctx[14],
        /*item*/
        ctx[17]
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
      if (if_block0) if_block0.m(div1, null);
      append(div1, if_block0_anchor);
      if (if_block1) if_block1.m(div1, null);
      if (!mounted) {
        dispose = listen(div3, "click", click_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*sortedGroups*/
      2 && !src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[17].type,
        /*group*/
        ctx[14]
      ))) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*sortedGroups*/
      2 && img_alt_value !== (img_alt_value = /*item*/
      ctx[17].type)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty & /*sortedGroups*/
      2 && raw_value !== (raw_value = /*item*/
      ctx[17].label + "")) span.innerHTML = raw_value;
      if (
        /*group*/
        ctx[14].selectedItemId === /*item*/
        ctx[17]._id && /*$selectedItems*/
        ctx[5][
          /*group*/
          ctx[14].id
        ]
      ) {
        if (if_block0) {
          if_block0.p(ctx, dirty);
        } else {
          if_block0 = create_if_block_6$1(ctx);
          if_block0.c();
          if_block0.m(div1, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty & /*sortedGroups, equipmentBySource*/
      3) show_if = /*getGoldAmountForItem*/
      ctx[6](
        /*group*/
        ctx[14],
        /*sourceGroup*/
        ctx[11],
        /*item*/
        ctx[17]
      );
      if (show_if) {
        if (if_block1) {
          if_block1.p(ctx, dirty);
        } else {
          if_block1 = create_if_block_5$1(ctx);
          if_block1.c();
          if_block1.m(div1, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (dirty & /*disabled, sortedGroups*/
      10 && div3_class_value !== (div3_class_value = "equipment-item option " + getOptionClasses(
        /*disabled*/
        ctx[3],
        /*group*/
        ctx[14],
        /*item*/
        ctx[17]
      ) + " svelte-gas-1y0asf7")) {
        attr(div3, "class", div3_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div3);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
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
    ctx[14].items
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
          ctx2[14].items
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
    ctx[14].items[0].children
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
          ctx2[14].items[0].children
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
    ctx[17].label + ""
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
        ctx[17].type,
        /*group*/
        ctx[14]
      ))) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[17].type);
      attr(div0, "class", "flex0 relative icon svelte-gas-1y0asf7");
      attr(div1, "class", "flex2 left name black-link svelte-gas-1y0asf7");
      attr(div2, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div3, "class", div3_class_value = "equipment-item option " + getEquipmentItemClasses(
        /*group*/
        ctx[14],
        /*item*/
        ctx[17],
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
            ctx[17].type !== "linked" ? handleSelection(
              /*disabled*/
              ctx[3],
              /*group*/
              ctx[14].id,
              /*item*/
              ctx[17]
            ) : null
          )) /*item*/
          (ctx[17].type !== "linked" ? handleSelection(
            /*disabled*/
            ctx[3],
            /*group*/
            ctx[14].id,
            /*item*/
            ctx[17]
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
        ctx[17].type,
        /*group*/
        ctx[14]
      ))) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*sortedGroups*/
      2 && img_alt_value !== (img_alt_value = /*item*/
      ctx[17].type)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty & /*sortedGroups*/
      2 && raw_value !== (raw_value = /*item*/
      ctx[17].label + "")) span.innerHTML = raw_value;
      if (dirty & /*sortedGroups, disabled*/
      10 && div3_class_value !== (div3_class_value = "equipment-item option " + getEquipmentItemClasses(
        /*group*/
        ctx[14],
        /*item*/
        ctx[17],
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
    ctx[17].label + ""
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
        ctx[17].type,
        /*group*/
        ctx[14]
      ))) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[17].type);
      attr(div0, "class", "flex0 relative icon svelte-gas-1y0asf7");
      attr(div1, "class", "flex2 left name black-link svelte-gas-1y0asf7");
      attr(div2, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div3, "class", div3_class_value = "equipment-item option " + getEquipmentItemClasses(
        /*group*/
        ctx[14],
        /*item*/
        ctx[17],
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
            ctx[17].type !== "linked" ? handleSelection(
              /*disabled*/
              ctx[3],
              /*group*/
              ctx[14].id,
              /*item*/
              ctx[17]
            ) : null
          )) /*item*/
          (ctx[17].type !== "linked" ? handleSelection(
            /*disabled*/
            ctx[3],
            /*group*/
            ctx[14].id,
            /*item*/
            ctx[17]
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
        ctx[17].type,
        /*group*/
        ctx[14]
      ))) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*sortedGroups*/
      2 && img_alt_value !== (img_alt_value = /*item*/
      ctx[17].type)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty & /*sortedGroups*/
      2 && raw_value !== (raw_value = /*item*/
      ctx[17].label + "")) span.innerHTML = raw_value;
      if (dirty & /*sortedGroups, disabled*/
      10 && div3_class_value !== (div3_class_value = "equipment-item option " + getEquipmentItemClasses(
        /*group*/
        ctx[14],
        /*item*/
        ctx[17],
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
    (ctx[14].completed || /*group*/
    ctx[14].inProgress) && isGroupFromSource(
      /*group*/
      ctx[14],
      /*sourceGroup*/
      ctx[11].equipment
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
      (ctx2[14].completed || /*group*/
      ctx2[14].inProgress) && isGroupFromSource(
        /*group*/
        ctx2[14],
        /*sourceGroup*/
        ctx2[11].equipment
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
    ctx[11].equipment?.length && create_if_block$5(ctx)
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
        ctx2[11].equipment?.length
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
      if (dirty & /*sortedGroups, disabled, handleEquipmentSelection, equipmentBySource, getGoldAmountForItem, $selectedItems, handleEditGroup*/
      239) {
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
  let { handleVariableGoldChoice } = $$props;
  let { parsedEquipmentGold: parsedEquipmentGold2 } = $$props;
  function getGoldAmountForItem(group, sourceGroup, item) {
    if (!parsedEquipmentGold2 || !sourceGroup.source || group.type !== "choice") return null;
    const goldData = sourceGroup.source === "class" ? parsedEquipmentGold2.fromClass : parsedEquipmentGold2.fromBackground;
    if (!goldData?.hasVariableGold || !goldData.goldOptions?.length) return null;
    if (!isGroupFromSource(group, sourceGroup.equipment)) return null;
    const itemIndex = group.items.findIndex((groupItem) => groupItem._id === item._id);
    if (itemIndex === -1) return null;
    if (itemIndex < goldData.goldOptions.length) {
      const choiceLetter = String.fromCharCode(65 + itemIndex);
      const goldOption = goldData.goldOptions.find((opt) => opt.choice === choiceLetter);
      return goldOption?.goldAmount || null;
    }
    return null;
  }
  function handleEquipmentSelection(group, sourceGroup, item) {
    const goldAmount = getGoldAmountForItem(group, sourceGroup, item);
    handleSelection(disabled, group.id, item);
    if (goldAmount && handleVariableGoldChoice) {
      const source = sourceGroup.source === "class" ? "fromClass" : "fromBackground";
      const choice = String.fromCharCode(65 + group.items.findIndex((groupItem) => groupItem._id === item._id));
      handleVariableGoldChoice(source, choice, goldAmount);
    }
  }
  const click_handler = (group, sourceGroup, item) => handleEquipmentSelection(group, sourceGroup, item);
  $$self.$$set = ($$props2) => {
    if ("equipmentBySource" in $$props2) $$invalidate(0, equipmentBySource = $$props2.equipmentBySource);
    if ("sortedGroups" in $$props2) $$invalidate(1, sortedGroups = $$props2.sortedGroups);
    if ("handleEditGroup" in $$props2) $$invalidate(2, handleEditGroup = $$props2.handleEditGroup);
    if ("disabled" in $$props2) $$invalidate(3, disabled = $$props2.disabled);
    if ("selectedItems" in $$props2) $$subscribe_selectedItems($$invalidate(4, selectedItems2 = $$props2.selectedItems));
    if ("handleVariableGoldChoice" in $$props2) $$invalidate(8, handleVariableGoldChoice = $$props2.handleVariableGoldChoice);
    if ("parsedEquipmentGold" in $$props2) $$invalidate(9, parsedEquipmentGold2 = $$props2.parsedEquipmentGold);
  };
  return [
    equipmentBySource,
    sortedGroups,
    handleEditGroup,
    disabled,
    selectedItems2,
    $selectedItems,
    getGoldAmountForItem,
    handleEquipmentSelection,
    handleVariableGoldChoice,
    parsedEquipmentGold2,
    click_handler
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
      selectedItems: 4,
      handleVariableGoldChoice: 8,
      parsedEquipmentGold: 9
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
    ctx[6].type === "choice" && create_if_block_6(ctx)
  );
  let if_block1 = show_if && create_if_block_5(ctx);
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
          if_block0 = create_if_block_6(ctx2);
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
          if_block1 = create_if_block_5(ctx2);
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
function create_if_block_6(ctx) {
  let if_block_anchor;
  function select_block_type(ctx2, dirty) {
    if (
      /*group*/
      ctx2[6].completed
    ) return create_if_block_7;
    return create_else_block_2;
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
function create_else_block_2(ctx) {
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
function create_if_block_7(ctx) {
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
function create_if_block_5(ctx) {
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
  let each_1_anchor;
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
        detach(each_1_anchor);
      }
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
    ) return create_if_block_2$4;
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
        ctx[9].type,
        /*group*/
        ctx[6]
      ))) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[9].type);
      attr(div0, "class", "flex0 relative icon svelte-gas-1y0asf7");
      attr(div1, "class", "flex2 left name black-link svelte-gas-1y0asf7");
      attr(div2, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div3, "class", div3_class_value = "equipment-item option " + getOptionClasses(
        /*disabled*/
        ctx[2],
        /*group*/
        ctx[6],
        /*item*/
        ctx[9]
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
      5 && div3_class_value !== (div3_class_value = "equipment-item option " + getOptionClasses(
        /*disabled*/
        ctx[2],
        /*group*/
        ctx[6],
        /*item*/
        ctx[9]
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
function create_if_block_2$4(ctx) {
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
  ctx[1] && create_if_block_2$3(ctx);
  const if_block_creators = [create_if_block_1$3, create_else_block$2];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === "2024" && /*equipmentBySource*/
    ctx2[4].length > 1) return 0;
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
      h2.textContent = `${localize("Equipment.Label")}`;
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
          if_block0 = create_if_block_2$3(ctx2);
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
function create_if_block_2$3(ctx) {
  let div;
  let t_1;
  return {
    c() {
      div = element("div");
      t_1 = text("*");
      attr(div, "class", "flex0 required " + /*equipmentSelectionEnabled*/
      (ctx[5] ? "active" : ""));
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t_1);
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
        ctx[4]
      ),
      sortedGroups: (
        /*sortedGroups*/
        ctx[3]
      ),
      handleEditGroup: (
        /*handleEditGroup*/
        ctx[6]
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
      16) startingequipmentgroups2014_changes.equipmentBySource = /*equipmentBySource*/
      ctx2[4];
      if (dirty & /*sortedGroups*/
      8) startingequipmentgroups2014_changes.sortedGroups = /*sortedGroups*/
      ctx2[3];
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
        ctx[4]
      ),
      sortedGroups: (
        /*sortedGroups*/
        ctx[3]
      ),
      handleEditGroup: (
        /*handleEditGroup*/
        ctx[6]
      ),
      disabled: (
        /*disabled*/
        ctx[1]
      ),
      selectedItems,
      handleVariableGoldChoice: (
        /*handleVariableGoldChoice*/
        ctx[7]
      ),
      parsedEquipmentGold: (
        /*parsedEquipmentGold*/
        ctx[2]
      )
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
      16) startingequipmentgroups2024_changes.equipmentBySource = /*equipmentBySource*/
      ctx2[4];
      if (dirty & /*sortedGroups*/
      8) startingequipmentgroups2024_changes.sortedGroups = /*sortedGroups*/
      ctx2[3];
      if (dirty & /*disabled*/
      2) startingequipmentgroups2024_changes.disabled = /*disabled*/
      ctx2[1];
      if (dirty & /*parsedEquipmentGold*/
      4) startingequipmentgroups2024_changes.parsedEquipmentGold = /*parsedEquipmentGold*/
      ctx2[2];
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
  component_subscribe($$self, equipmentSelections, ($$value) => $$invalidate(14, $equipmentSelections = $$value));
  let { startingEquipment = [] } = $$props;
  let { classEquipment = [] } = $$props;
  let { backgroundEquipment = [] } = $$props;
  let { characterClass: characterClass2 = null } = $$props;
  let { background: background2 = null } = $$props;
  let { disabled = false } = $$props;
  let { allEquipmentItems = [] } = $$props;
  let { parsedEquipmentGold: parsedEquipmentGold2 = null } = $$props;
  let { equipmentGoldOptions: equipmentGoldOptions2 = null } = $$props;
  const equipmentSelectionEnabled = game.settings.get(MODULE_ID, "enableEquipmentSelection");
  function handleEditGroup(groupId) {
    editGroup(groupId);
  }
  function handleVariableGoldChoice(source, choice, goldAmount) {
    if (disabled) return;
    setEquipmentGoldChoice(source, choice, goldAmount);
  }
  onMount(async () => {
  });
  $$self.$$set = ($$props2) => {
    if ("startingEquipment" in $$props2) $$invalidate(0, startingEquipment = $$props2.startingEquipment);
    if ("classEquipment" in $$props2) $$invalidate(8, classEquipment = $$props2.classEquipment);
    if ("backgroundEquipment" in $$props2) $$invalidate(9, backgroundEquipment = $$props2.backgroundEquipment);
    if ("characterClass" in $$props2) $$invalidate(10, characterClass2 = $$props2.characterClass);
    if ("background" in $$props2) $$invalidate(11, background2 = $$props2.background);
    if ("disabled" in $$props2) $$invalidate(1, disabled = $$props2.disabled);
    if ("allEquipmentItems" in $$props2) $$invalidate(12, allEquipmentItems = $$props2.allEquipmentItems);
    if ("parsedEquipmentGold" in $$props2) $$invalidate(2, parsedEquipmentGold2 = $$props2.parsedEquipmentGold);
    if ("equipmentGoldOptions" in $$props2) $$invalidate(13, equipmentGoldOptions2 = $$props2.equipmentGoldOptions);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*startingEquipment*/
    1) {
      window.GAS.log.d("StartingEquipment startingEquipment", startingEquipment);
    }
    if ($$self.$$.dirty & /*$equipmentSelections*/
    16384) {
      window.GAS.log.d("StartingEquipment equipmentSelections", $equipmentSelections);
    }
    if ($$self.$$.dirty & /*startingEquipment, classEquipment, characterClass, parsedEquipmentGold, equipmentGoldOptions, backgroundEquipment, background*/
    12037) {
      $$invalidate(4, equipmentBySource = (() => {
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
          const classGroup = {
            source: "class",
            label: characterClass2?.name || "Class",
            equipment: classEquipment
          };
          if (parsedEquipmentGold2?.fromClass?.hasVariableGold && parsedEquipmentGold2.fromClass.goldOptions?.length > 0) {
            classGroup.variableGoldOptions = parsedEquipmentGold2.fromClass.goldOptions;
            classGroup.selectedVariableGold = equipmentGoldOptions2?.fromClass?.selectedChoice;
          }
          groups.push(classGroup);
        }
        if (backgroundEquipment?.length > 0) {
          const backgroundGroup = {
            source: "background",
            label: background2?.name || "Background",
            equipment: backgroundEquipment
          };
          if (parsedEquipmentGold2?.fromBackground?.hasVariableGold && parsedEquipmentGold2.fromBackground.goldOptions?.length > 0) {
            backgroundGroup.variableGoldOptions = parsedEquipmentGold2.fromBackground.goldOptions;
            backgroundGroup.selectedVariableGold = equipmentGoldOptions2?.fromBackground?.selectedChoice;
          }
          groups.push(backgroundGroup);
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
                  label: localize("Equipment.ChooseOne"),
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
                  label: orChild.label || localize("Equipment.ChooseOne"),
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
    16384) {
      $$invalidate(3, sortedGroups = Object.values($equipmentSelections).sort((a, b) => (a.sort || 0) - (b.sort || 0)));
    }
    if ($$self.$$.dirty & /*sortedGroups*/
    8) {
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
    parsedEquipmentGold2,
    sortedGroups,
    equipmentBySource,
    equipmentSelectionEnabled,
    handleEditGroup,
    handleVariableGoldChoice,
    classEquipment,
    backgroundEquipment,
    characterClass2,
    background2,
    allEquipmentItems,
    equipmentGoldOptions2,
    $equipmentSelections
  ];
}
class StartingEquipment extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, {
      startingEquipment: 0,
      classEquipment: 8,
      backgroundEquipment: 9,
      characterClass: 10,
      background: 11,
      disabled: 1,
      allEquipmentItems: 12,
      parsedEquipmentGold: 2,
      equipmentGoldOptions: 13
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
function create_if_block_2$2(ctx) {
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
      placeHolder: localize("Equipment.SelectType", {
        type: (
          /*group*/
          ctx[12].selectedItem.type
        )
      }),
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
      1) iconselect_changes.placeHolder = localize("Equipment.SelectType", {
        type: (
          /*group*/
          ctx2[12].selectedItem.type
        )
      });
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
      placeHolder: localize("Equipment.SelectType", {
        type: (
          /*group*/
          ctx[12].selectedItem.type
        )
      }),
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
      1) iconselect_changes.placeHolder = localize("Equipment.SelectType", {
        type: (
          /*group*/
          ctx2[12].selectedItem.type
        )
      });
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
  let t_1_value = (
    /*group*/
    ctx[12].selectedItem.label + ""
  );
  let t_1;
  let div3;
  let if_block1_anchor;
  let current;
  let if_block0 = !/*isDisabled*/
  ctx[2] && create_if_block_3$1(ctx);
  let if_block1 = (
    /*group*/
    ctx[12].parentGroup && create_if_block_2$2(ctx)
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
      t_1 = text(t_1_value);
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
      append(span, t_1);
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
      1) && t_1_value !== (t_1_value = /*group*/
      ctx2[12].selectedItem.label + "")) set_data(t_1, t_1_value);
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
          if_block1 = create_if_block_2$2(ctx2);
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
  child_ctx[6] = list[i];
  return child_ctx;
}
function create_if_block_1$1(ctx) {
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
    ) return create_if_block_2$1;
    return create_else_block$1;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      table = element("table");
      thead = element("thead");
      tr = element("tr");
      th0 = element("th");
      th0.innerHTML = ``;
      th1 = element("th");
      th1.textContent = `${localize("Item")}`;
      th2 = element("th");
      th2.textContent = `${localize("Equipment.Weight")}`;
      th3 = element("th");
      th3.textContent = `${localize("Equipment.Quantity")}`;
      tbody = element("tbody");
      if_block.c();
      attr(th0, "class", "svelte-gas-41ub3c");
      attr(th1, "class", "white svelte-gas-41ub3c");
      attr(th2, "class", "white svelte-gas-41ub3c");
      attr(th3, "class", "white svelte-gas-41ub3c");
      attr(tr, "class", "svelte-gas-41ub3c");
      attr(table, "class", "inventory-table svelte-gas-41ub3c");
    },
    m(target, anchor) {
      insert(target, table, anchor);
      append(table, thead);
      append(thead, tr);
      append(tr, th0);
      append(tr, th1);
      append(tr, th2);
      append(tr, th3);
      append(table, tbody);
      if_block.m(tbody, null);
    },
    p(ctx2, dirty) {
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
    d(detaching) {
      if (detaching) {
        detach(table);
      }
      if_block.d();
    }
  };
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
      if (dirty & /*plannedItems, getItemName*/
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
function create_if_block_2$1(ctx) {
  let tr;
  let td;
  return {
    c() {
      tr = element("tr");
      td = element("td");
      td.textContent = `${localize("Equipment.NoItemsSelected")}`;
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
function create_if_block_3(ctx) {
  let img;
  let img_src_value;
  return {
    c() {
      img = element("img");
      if (!src_url_equal(img.src, img_src_value = /*item*/
      ctx[6].img)) attr(img, "src", img_src_value);
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
      ctx2[6].img)) {
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
    (ctx[9] || "--") + ""
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
      (ctx2[9] || "--") + "")) td.innerHTML = raw_value;
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
    (ctx[6]?.system?.weight?.value || 0) + ""
  );
  let t0;
  let td2;
  let t1_value = (
    /*item*/
    (ctx[6]?.system?.quantity || 1) + ""
  );
  let t1;
  function select_block_type_1(ctx2, dirty) {
    if (
      /*item*/
      ctx2[6] && /*item*/
      ctx2[6].img
    ) return create_if_block_3;
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
    value: 9
  };
  handle_promise(promise = enrichHTML(getItemName(
    /*item*/
    ctx[6]
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
      1 && promise !== (promise = enrichHTML(getItemName(
        /*item*/
        ctx[6]
      ) || "")) && handle_promise(promise, info)) ;
      else {
        update_await_block_branch(info, ctx, dirty);
      }
      if (dirty & /*plannedItems*/
      1 && t0_value !== (t0_value = /*item*/
      (ctx[6]?.system?.weight?.value || 0) + "")) set_data(t0, t0_value);
      if (dirty & /*plannedItems*/
      1 && t1_value !== (t1_value = /*item*/
      (ctx[6]?.system?.quantity || 1) + "")) set_data(t1, t1_value);
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
function create_if_block$1(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      div.textContent = `${localize("Equipment.EquipmentConfirmed")}`;
      attr(div, "class", "info-message");
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
function create_fragment$1(ctx) {
  let div;
  let h3;
  let if_block0_anchor;
  let if_block0 = !/*isDisabled*/
  ctx[1] && create_if_block_1$1(ctx);
  let if_block1 = (
    /*isDisabled*/
    ctx[1] && create_if_block$1()
  );
  return {
    c() {
      div = element("div");
      h3 = element("h3");
      h3.textContent = `${localize("Equipment.PlannedInventory")}`;
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      attr(div, "class", "planned-inventory svelte-gas-41ub3c");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, h3);
      if (if_block0) if_block0.m(div, null);
      append(div, if_block0_anchor);
      if (if_block1) if_block1.m(div, null);
    },
    p(ctx2, [dirty]) {
      if (!/*isDisabled*/
      ctx2[1]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_1$1(ctx2);
          if_block0.c();
          if_block0.m(div, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (
        /*isDisabled*/
        ctx2[1]
      ) {
        if (if_block1) ;
        else {
          if_block1 = create_if_block$1();
          if_block1.c();
          if_block1.m(div, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
    }
  };
}
function getItemName(item) {
  return `@UUID[${item?.uuid}]{${item?.name}}`;
}
function instance$1($$self, $$props, $$invalidate) {
  let rawSelections;
  let isDisabled;
  let $readOnlyTabs;
  let $flattenedSelections;
  component_subscribe($$self, readOnlyTabs, ($$value) => $$invalidate(3, $readOnlyTabs = $$value));
  component_subscribe($$self, flattenedSelections, ($$value) => $$invalidate(4, $flattenedSelections = $$value));
  let plannedItems = [];
  onMount(() => {
  });
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$flattenedSelections*/
    16) {
      $$invalidate(2, rawSelections = $flattenedSelections || []);
    }
    if ($$self.$$.dirty & /*rawSelections*/
    4) {
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
    if ($$self.$$.dirty & /*$readOnlyTabs*/
    8) {
      $$invalidate(1, isDisabled = $readOnlyTabs.includes("equipment"));
    }
  };
  return [plannedItems, isDisabled, rawSelections, $readOnlyTabs, $flattenedSelections];
}
class PlannedInventory extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
  }
}
function create_if_block_2(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      div.textContent = `${localize("Equipment.EquipmentReadOnly")}`;
      attr(div, "class", "info-message svelte-gas-gbfmis");
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
function create_else_block(ctx) {
  let startinggold;
  let current;
  startinggold = new StartingGold$1({
    props: {
      characterClass: (
        /*$characterClass*/
        ctx[1]
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
      2) startinggold_changes.characterClass = /*$characterClass*/
      ctx2[1];
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
function create_if_block_1(ctx) {
  let startinggoldv4;
  let current;
  startinggoldv4 = new StartingGold2({
    props: {
      characterClass: (
        /*$characterClass*/
        ctx[1]
      ),
      background: (
        /*$background*/
        ctx[2]
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
      2) startinggoldv4_changes.characterClass = /*$characterClass*/
      ctx2[1];
      if (dirty & /*$background*/
      4) startinggoldv4_changes.background = /*$background*/
      ctx2[2];
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
function create_if_block(ctx) {
  let startingequipment;
  let current;
  startingequipment = new StartingEquipment({
    props: {
      startingEquipment: (
        /*$compatibleStartingEquipment*/
        ctx[3]
      ),
      classEquipment: (
        /*$classStartingEquipment*/
        ctx[7]
      ),
      backgroundEquipment: (
        /*$backgroundStartingEquipment*/
        ctx[8]
      ),
      characterClass: (
        /*$characterClass*/
        ctx[1]
      ),
      background: (
        /*$background*/
        ctx[2]
      ),
      proficiencies: (
        /*proficiencies*/
        ctx[5]
      ),
      disabled: (
        /*isDisabled*/
        ctx[0]
      ),
      parsedEquipmentGold: (
        /*$parsedEquipmentGold*/
        ctx[4]
      ),
      equipmentGoldOptions: (
        /*$equipmentGoldOptions*/
        ctx[9]
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
      8) startingequipment_changes.startingEquipment = /*$compatibleStartingEquipment*/
      ctx2[3];
      if (dirty & /*$classStartingEquipment*/
      128) startingequipment_changes.classEquipment = /*$classStartingEquipment*/
      ctx2[7];
      if (dirty & /*$backgroundStartingEquipment*/
      256) startingequipment_changes.backgroundEquipment = /*$backgroundStartingEquipment*/
      ctx2[8];
      if (dirty & /*$characterClass*/
      2) startingequipment_changes.characterClass = /*$characterClass*/
      ctx2[1];
      if (dirty & /*$background*/
      4) startingequipment_changes.background = /*$background*/
      ctx2[2];
      if (dirty & /*proficiencies*/
      32) startingequipment_changes.proficiencies = /*proficiencies*/
      ctx2[5];
      if (dirty & /*isDisabled*/
      1) startingequipment_changes.disabled = /*isDisabled*/
      ctx2[0];
      if (dirty & /*$parsedEquipmentGold*/
      16) startingequipment_changes.parsedEquipmentGold = /*$parsedEquipmentGold*/
      ctx2[4];
      if (dirty & /*$equipmentGoldOptions*/
      512) startingequipment_changes.equipmentGoldOptions = /*$equipmentGoldOptions*/
      ctx2[9];
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
function create_left_slot(ctx) {
  let div;
  let h3;
  let section;
  let current_block_type_index;
  let if_block1;
  let if_block1_anchor;
  let section_class_value;
  let current;
  let if_block0 = (
    /*isDisabled*/
    ctx[0] && create_if_block_2()
  );
  const if_block_creators = [create_if_block_1, create_else_block];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === "2024") return 0;
    return 1;
  }
  current_block_type_index = select_block_type();
  if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  let if_block2 = (
    /*shouldShowEquipment*/
    (ctx[6] || /*isDisabled*/
    ctx[0]) && create_if_block(ctx)
  );
  return {
    c() {
      div = element("div");
      h3 = element("h3");
      h3.textContent = `${localize("Equipment.StartingGold")}`;
      if (if_block0) if_block0.c();
      section = element("section");
      if_block1.c();
      if_block1_anchor = empty();
      if (if_block2) if_block2.c();
      attr(section, "class", section_class_value = "equipment-flow " + /*isDisabled*/
      (ctx[0] ? "readonly" : "") + " svelte-gas-gbfmis");
      attr(div, "slot", "left");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, h3);
      if (if_block0) if_block0.m(div, null);
      append(div, section);
      if_blocks[current_block_type_index].m(section, null);
      append(section, if_block1_anchor);
      if (if_block2) if_block2.m(section, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (
        /*isDisabled*/
        ctx2[0]
      ) {
        if (if_block0) ;
        else {
          if_block0 = create_if_block_2();
          if_block0.c();
          if_block0.m(div, section);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if_block1.p(ctx2, dirty);
      if (
        /*shouldShowEquipment*/
        ctx2[6] || /*isDisabled*/
        ctx2[0]
      ) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
          if (dirty & /*shouldShowEquipment, isDisabled*/
          65) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block(ctx2);
          if_block2.c();
          transition_in(if_block2, 1);
          if_block2.m(section, null);
        }
      } else if (if_block2) {
        group_outros();
        transition_out(if_block2, 1, 1, () => {
          if_block2 = null;
        });
        check_outros();
      }
      if (!current || dirty & /*isDisabled*/
      1 && section_class_value !== (section_class_value = "equipment-flow " + /*isDisabled*/
      (ctx2[0] ? "readonly" : "") + " svelte-gas-gbfmis")) {
        attr(section, "class", section_class_value);
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
        detach(div);
      }
      if (if_block0) if_block0.d();
      if_blocks[current_block_type_index].d();
      if (if_block2) if_block2.d();
    }
  };
}
function create_right_slot(ctx) {
  let div;
  let plannedinventory;
  let equipmentselectordetail;
  let current;
  plannedinventory = new PlannedInventory({});
  equipmentselectordetail = new EquipmentSelectorDetail({});
  return {
    c() {
      div = element("div");
      create_component(plannedinventory.$$.fragment);
      create_component(equipmentselectordetail.$$.fragment);
      attr(div, "slot", "right");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      mount_component(plannedinventory, div, null);
      mount_component(equipmentselectordetail, div, null);
      current = true;
    },
    p: noop,
    i(local) {
      if (current) return;
      transition_in(plannedinventory.$$.fragment, local);
      transition_in(equipmentselectordetail.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(plannedinventory.$$.fragment, local);
      transition_out(equipmentselectordetail.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      destroy_component(plannedinventory);
      destroy_component(equipmentselectordetail);
    }
  };
}
function create_fragment(ctx) {
  let standardtablayout;
  let current;
  standardtablayout = new StandardTabLayout({
    props: {
      tabName: "equipment",
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
      if (dirty & /*$$scope, isDisabled, $compatibleStartingEquipment, $classStartingEquipment, $backgroundStartingEquipment, $characterClass, $background, proficiencies, $parsedEquipmentGold, $equipmentGoldOptions, shouldShowEquipment*/
      1049599) {
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
  let userChoseEquipment;
  let hasVariableGoldNeedingSelection;
  let shouldShowEquipment;
  let proficiencies;
  let isDisabled;
  let $goldRoll;
  let $characterClass;
  let $background;
  let $readOnlyTabs;
  let $compatibleStartingEquipment;
  let $goldChoices;
  let $doc;
  let $areGoldChoicesComplete;
  let $parsedEquipmentGold;
  let $classStartingEquipment;
  let $backgroundStartingEquipment;
  let $equipmentGoldOptions;
  component_subscribe($$self, goldRoll, ($$value) => $$invalidate(13, $goldRoll = $$value));
  component_subscribe($$self, characterClass, ($$value) => $$invalidate(1, $characterClass = $$value));
  component_subscribe($$self, background, ($$value) => $$invalidate(2, $background = $$value));
  component_subscribe($$self, readOnlyTabs, ($$value) => $$invalidate(14, $readOnlyTabs = $$value));
  component_subscribe($$self, compatibleStartingEquipment, ($$value) => $$invalidate(3, $compatibleStartingEquipment = $$value));
  component_subscribe($$self, goldChoices, ($$value) => $$invalidate(15, $goldChoices = $$value));
  component_subscribe($$self, areGoldChoicesComplete, ($$value) => $$invalidate(17, $areGoldChoicesComplete = $$value));
  component_subscribe($$self, parsedEquipmentGold, ($$value) => $$invalidate(4, $parsedEquipmentGold = $$value));
  component_subscribe($$self, classStartingEquipment, ($$value) => $$invalidate(7, $classStartingEquipment = $$value));
  component_subscribe($$self, backgroundStartingEquipment, ($$value) => $$invalidate(8, $backgroundStartingEquipment = $$value));
  component_subscribe($$self, equipmentGoldOptions, ($$value) => $$invalidate(9, $equipmentGoldOptions = $$value));
  const doc = getContext("#doc");
  component_subscribe($$self, doc, (value) => $$invalidate(16, $doc = value));
  onMount(() => {
    if (game.settings.get(MODULE_ID, "disableAdvancementCapture")) {
      window.GAS.log.d("[EQUIPMENT] Advancement capture disabled - destroying advancement managers");
      destroyAdvancementManagers();
    }
    if (window.GAS.dnd5eVersion < 4 || window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === "2014") {
      window.GAS.log.d("[EQUIPMENT] Resetting gold roll for 2014 rules to show choice interface");
      goldRoll.set(0);
    }
  });
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$areGoldChoicesComplete, $goldRoll*/
    139264) {
      window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === "2024" ? $areGoldChoicesComplete : $goldRoll > 0;
    }
    if ($$self.$$.dirty & /*$goldChoices*/
    32768) {
      $$invalidate(12, userChoseEquipment = window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === "2024" ? $goldChoices.fromClass.choice === "equipment" || $goldChoices.fromBackground.choice === "equipment" : true);
    }
    if ($$self.$$.dirty & /*$parsedEquipmentGold, $goldChoices*/
    32784) {
      $$invalidate(11, hasVariableGoldNeedingSelection = $parsedEquipmentGold && ($parsedEquipmentGold.fromClass.hasVariableGold && $goldChoices.fromClass.choice === "equipment" || $parsedEquipmentGold.fromBackground.hasVariableGold && $goldChoices.fromBackground.choice === "equipment"));
    }
    if ($$self.$$.dirty & /*userChoseEquipment, $areGoldChoicesComplete, hasVariableGoldNeedingSelection, $goldRoll*/
    145408) {
      $$invalidate(6, shouldShowEquipment = window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === "2024" ? userChoseEquipment && ($areGoldChoicesComplete || hasVariableGoldNeedingSelection) : $goldRoll > 0);
    }
    if ($$self.$$.dirty & /*$doc*/
    65536) {
      $$invalidate(5, proficiencies = $doc.system?.proficiencies || {});
    }
    if ($$self.$$.dirty & /*$readOnlyTabs*/
    16384) {
      $$invalidate(0, isDisabled = $readOnlyTabs.includes("equipment"));
    }
    if ($$self.$$.dirty & /*$goldChoices*/
    32768) {
      window.GAS.log.d("Equipment goldChoices", $goldChoices);
    }
    if ($$self.$$.dirty & /*$compatibleStartingEquipment*/
    8) {
      window.GAS.log.d("Equipment compatibleStartingEquipment", $compatibleStartingEquipment);
    }
    if ($$self.$$.dirty & /*isDisabled, $readOnlyTabs, $characterClass, $background, $goldRoll*/
    24583) {
      window.GAS.log.d("Equipment component:", {
        isDisabled,
        readOnlyTabs: $readOnlyTabs,
        characterClass: $characterClass,
        background: $background,
        classWealth: $characterClass?.system?.wealth,
        goldRoll: $goldRoll
      });
    }
  };
  game.settings.get(MODULE_ID, "enableEquipmentSelection");
  return [
    isDisabled,
    $characterClass,
    $background,
    $compatibleStartingEquipment,
    $parsedEquipmentGold,
    proficiencies,
    shouldShowEquipment,
    $classStartingEquipment,
    $backgroundStartingEquipment,
    $equipmentGoldOptions,
    doc,
    hasVariableGoldNeedingSelection,
    userChoseEquipment,
    $goldRoll,
    $readOnlyTabs,
    $goldChoices,
    $doc,
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
//# sourceMappingURL=Equipment-DsDrPesF.js.map
