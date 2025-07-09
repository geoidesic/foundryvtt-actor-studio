import { S as SvelteComponent, i as init, s as safe_not_equal, e as element, l as localize, a as empty, b as attr, c as insert, d as append, h as transition_in, g as group_outros, t as transition_out, f as check_outros, j as detach, k as component_subscribe, a0 as goldChoices, v as create_component, w as mount_component, x as destroy_component, F as text, X as listen, G as set_data, a1 as run_all, a2 as clearGoldChoices, $ as clearEquipmentSelections, a3 as setClassGoldChoice, a4 as setBackgroundGoldChoice, a5 as equipmentSelections, J as getPacksFromSettings, o as onMount, Y as extractItemsFromPacksAsync, M as MODULE_ID, a6 as getRequiredSelectionsCount, z as ensure_array_like, B as destroy_each, L as src_url_equal, a7 as getEquipmentIcon, a8 as is_function, a9 as editGroup, aa as addChildGranularSelection, ab as addGranularSelection, A as noop, ac as flattenedSelections, ad as compatibleStartingEquipment, Z as goldRoll, ae as areGoldChoicesComplete, Q as characterClass, I as background, n as getContext } from "./index-CFJH6n9H.js";
import { I as IconButton, a as StartingEquipment, S as StartingGold$1 } from "./StartingEquipment-DCaXzHTy.js";
import { I as IconSelect } from "./IconSelect-D_STKRBS.js";
import { h as handle_promise, u as update_await_block_branch } from "./await_block-Cqvsa0e0.js";
function create_if_block_4(ctx) {
  let div;
  let span;
  let div_class_value;
  return {
    c() {
      div = element("div");
      span = element("span");
      span.textContent = "*";
      attr(div, "class", div_class_value = "flex0 required " + (!/*classChoice*/
      ctx[4] || !/*backgroundChoice*/
      ctx[3] ? "active" : ""));
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, span);
    },
    p(ctx2, dirty) {
      if (dirty & /*classChoice, backgroundChoice*/
      24 && div_class_value !== (div_class_value = "flex0 required " + (!/*classChoice*/
      ctx2[4] || !/*backgroundChoice*/
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
function create_if_block_3(ctx) {
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
  iconbutton.$on(
    "click",
    /*handleEdit*/
    ctx[13]
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
    p(ctx2, dirty) {
      const iconbutton_changes = {};
      if (dirty & /*disabled*/
      4) iconbutton_changes.disabled = /*disabled*/
      ctx2[2];
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
function create_if_block_2$1(ctx) {
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
  let t2;
  let t3;
  let t4;
  let button0_class_value;
  let button1;
  let div7;
  let div5;
  let div6;
  let span1;
  let t5;
  let t6;
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
      div2.innerHTML = `<i class="fas fa-sack-dollar svelte-gas-11f6yqy"></i>`;
      div3 = element("div");
      span0 = element("span");
      t2 = text("Equipment + ");
      t3 = text(
        /*backgroundGoldWithEquipment*/
        ctx[8]
      );
      t4 = text(" gp");
      button1 = element("button");
      div7 = element("div");
      div5 = element("div");
      div5.innerHTML = `<i class="fas fa-coins svelte-gas-11f6yqy"></i>`;
      div6 = element("div");
      span1 = element("span");
      t5 = text(
        /*backgroundGoldOnly*/
        ctx[7]
      );
      t6 = text(" gp");
      attr(div0, "class", "flex group-label svelte-gas-11f6yqy");
      attr(div1, "class", "flexrow left");
      attr(div2, "class", "flex0 relative icon svelte-gas-11f6yqy");
      attr(div3, "class", "flex2 left name svelte-gas-11f6yqy");
      attr(div4, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(button0, "class", button0_class_value = "option " + /*backgroundChoice*/
      (ctx[3] === "equipment" ? "selected" : "") + " " + /*disabled*/
      (ctx[2] ? "disabled" : "") + " svelte-gas-11f6yqy");
      button0.disabled = /*disabled*/
      ctx[2];
      attr(div5, "class", "flex0 relative icon svelte-gas-11f6yqy");
      attr(div6, "class", "flex2 left name svelte-gas-11f6yqy");
      attr(div7, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(button1, "class", button1_class_value = "option " + /*backgroundChoice*/
      (ctx[3] === "gold" ? "selected" : "") + " " + /*disabled*/
      (ctx[2] ? "disabled" : "") + " svelte-gas-11f6yqy");
      button1.disabled = /*disabled*/
      ctx[2];
      attr(div8, "class", "options svelte-gas-11f6yqy");
      attr(div9, "class", "equipment-group svelte-gas-11f6yqy");
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
      append(div8, button1);
      append(button1, div7);
      append(div7, div5);
      append(div7, div6);
      append(div6, span1);
      append(span1, t5);
      append(span1, t6);
      if (!mounted) {
        dispose = [
          listen(
            button0,
            "mousedown",
            /*makeBackgroundChoiceHandler*/
            ctx[12]("equipment")
          ),
          listen(
            button1,
            "mousedown",
            /*makeBackgroundChoiceHandler*/
            ctx[12]("gold")
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
      256) set_data(
        t3,
        /*backgroundGoldWithEquipment*/
        ctx2[8]
      );
      if (dirty & /*backgroundChoice, disabled*/
      12 && button0_class_value !== (button0_class_value = "option " + /*backgroundChoice*/
      (ctx2[3] === "equipment" ? "selected" : "") + " " + /*disabled*/
      (ctx2[2] ? "disabled" : "") + " svelte-gas-11f6yqy")) {
        attr(button0, "class", button0_class_value);
      }
      if (dirty & /*disabled*/
      4) {
        button0.disabled = /*disabled*/
        ctx2[2];
      }
      if (dirty & /*backgroundGoldOnly*/
      128) set_data(
        t5,
        /*backgroundGoldOnly*/
        ctx2[7]
      );
      if (dirty & /*backgroundChoice, disabled*/
      12 && button1_class_value !== (button1_class_value = "option " + /*backgroundChoice*/
      (ctx2[3] === "gold" ? "selected" : "") + " " + /*disabled*/
      (ctx2[2] ? "disabled" : "") + " svelte-gas-11f6yqy")) {
        attr(button1, "class", button1_class_value);
      }
      if (dirty & /*disabled*/
      4) {
        button1.disabled = /*disabled*/
        ctx2[2];
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
function create_if_block_1$3(ctx) {
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
  let t2;
  let t3;
  let t4;
  let button0_class_value;
  let button1;
  let div7;
  let div5;
  let div6;
  let span1;
  let t5;
  let t6;
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
      div2.innerHTML = `<i class="fas fa-sack-dollar svelte-gas-11f6yqy"></i>`;
      div3 = element("div");
      span0 = element("span");
      t2 = text("Equipment + ");
      t3 = text(
        /*classGoldWithEquipment*/
        ctx[6]
      );
      t4 = text(" gp");
      button1 = element("button");
      div7 = element("div");
      div5 = element("div");
      div5.innerHTML = `<i class="fas fa-coins svelte-gas-11f6yqy"></i>`;
      div6 = element("div");
      span1 = element("span");
      t5 = text(
        /*classGoldOnly*/
        ctx[5]
      );
      t6 = text(" gp");
      attr(div0, "class", "flex group-label svelte-gas-11f6yqy");
      attr(div1, "class", "flexrow left");
      attr(div2, "class", "flex0 relative icon svelte-gas-11f6yqy");
      attr(div3, "class", "flex2 left name svelte-gas-11f6yqy");
      attr(div4, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(button0, "class", button0_class_value = "option " + /*classChoice*/
      (ctx[4] === "equipment" ? "selected" : "") + " " + /*disabled*/
      (ctx[2] ? "disabled" : "") + " svelte-gas-11f6yqy");
      button0.disabled = /*disabled*/
      ctx[2];
      attr(div5, "class", "flex0 relative icon svelte-gas-11f6yqy");
      attr(div6, "class", "flex2 left name svelte-gas-11f6yqy");
      attr(div7, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(button1, "class", button1_class_value = "option " + /*classChoice*/
      (ctx[4] === "gold" ? "selected" : "") + " " + /*disabled*/
      (ctx[2] ? "disabled" : "") + " svelte-gas-11f6yqy");
      button1.disabled = /*disabled*/
      ctx[2];
      attr(div8, "class", "options svelte-gas-11f6yqy");
      attr(div9, "class", "equipment-group svelte-gas-11f6yqy");
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
      append(div8, button1);
      append(button1, div7);
      append(div7, div5);
      append(div7, div6);
      append(div6, span1);
      append(span1, t5);
      append(span1, t6);
      if (!mounted) {
        dispose = [
          listen(
            button0,
            "mousedown",
            /*makeClassChoiceHandler*/
            ctx[11]("equipment")
          ),
          listen(
            button1,
            "mousedown",
            /*makeClassChoiceHandler*/
            ctx[11]("gold")
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
      64) set_data(
        t3,
        /*classGoldWithEquipment*/
        ctx2[6]
      );
      if (dirty & /*classChoice, disabled*/
      20 && button0_class_value !== (button0_class_value = "option " + /*classChoice*/
      (ctx2[4] === "equipment" ? "selected" : "") + " " + /*disabled*/
      (ctx2[2] ? "disabled" : "") + " svelte-gas-11f6yqy")) {
        attr(button0, "class", button0_class_value);
      }
      if (dirty & /*disabled*/
      4) {
        button0.disabled = /*disabled*/
        ctx2[2];
      }
      if (dirty & /*classGoldOnly*/
      32) set_data(
        t5,
        /*classGoldOnly*/
        ctx2[5]
      );
      if (dirty & /*classChoice, disabled*/
      20 && button1_class_value !== (button1_class_value = "option " + /*classChoice*/
      (ctx2[4] === "gold" ? "selected" : "") + " " + /*disabled*/
      (ctx2[2] ? "disabled" : "") + " svelte-gas-11f6yqy")) {
        attr(button1, "class", button1_class_value);
      }
      if (dirty & /*disabled*/
      4) {
        button1.disabled = /*disabled*/
        ctx2[2];
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
function create_if_block$3(ctx) {
  let div3;
  let div2;
  let div0;
  let div1;
  let span1;
  let t1;
  let t2;
  return {
    c() {
      div3 = element("div");
      div2 = element("div");
      div0 = element("div");
      div0.innerHTML = `<span>Total Gold:</span>`;
      div1 = element("div");
      span1 = element("span");
      t1 = text(
        /*totalGold*/
        ctx[10]
      );
      t2 = text(" gp");
      attr(div0, "class", "label svelte-gas-11f6yqy");
      attr(div1, "class", "value svelte-gas-11f6yqy");
      attr(div2, "class", "flexrow left result svelte-gas-11f6yqy");
      attr(div3, "class", "equipment-group svelte-gas-11f6yqy");
    },
    m(target, anchor) {
      insert(target, div3, anchor);
      append(div3, div2);
      append(div2, div0);
      append(div2, div1);
      append(div1, span1);
      append(span1, t1);
      append(span1, t2);
    },
    p(ctx2, dirty) {
      if (dirty & /*totalGold*/
      1024) set_data(
        t1,
        /*totalGold*/
        ctx2[10]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(div3);
      }
    }
  };
}
function create_fragment$3(ctx) {
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
  let if_block0 = !/*disabled*/
  ctx[2] && create_if_block_4(ctx);
  let if_block1 = (
    /*showEditButton*/
    ctx[9] && create_if_block_3(ctx)
  );
  let if_block2 = (
    /*background*/
    ctx[1] && create_if_block_2$1(ctx)
  );
  let if_block3 = (
    /*characterClass*/
    ctx[0] && create_if_block_1$3(ctx)
  );
  let if_block4 = (
    /*classChoice*/
    ctx[4] && /*backgroundChoice*/
    ctx[3] && create_if_block$3(ctx)
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
      attr(div2, "class", div2_class_value = "flexcol gold-section gap-10 " + /*disabled*/
      (ctx[2] ? "disabled" : "") + " svelte-gas-11f6yqy");
      attr(section, "class", "starting-gold svelte-gas-11f6yqy");
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
      if (!/*disabled*/
      ctx2[2]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_4(ctx2);
          if_block0.c();
          if_block0.m(div1, div0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (
        /*showEditButton*/
        ctx2[9]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & /*showEditButton*/
          512) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_3(ctx2);
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
          if_block2 = create_if_block_2$1(ctx2);
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
          if_block3 = create_if_block_1$3(ctx2);
          if_block3.c();
          if_block3.m(div2, if_block3_anchor);
        }
      } else if (if_block3) {
        if_block3.d(1);
        if_block3 = null;
      }
      if (
        /*classChoice*/
        ctx2[4] && /*backgroundChoice*/
        ctx2[3]
      ) {
        if (if_block4) {
          if_block4.p(ctx2, dirty);
        } else {
          if_block4 = create_if_block$3(ctx2);
          if_block4.c();
          if_block4.m(div2, null);
        }
      } else if (if_block4) {
        if_block4.d(1);
        if_block4 = null;
      }
      if (!current || dirty & /*disabled*/
      4 && div2_class_value !== (div2_class_value = "flexcol gold-section gap-10 " + /*disabled*/
      (ctx2[2] ? "disabled" : "") + " svelte-gas-11f6yqy")) {
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
function extractGoldFromDescription(description) {
  if (!description) return 0;
  const match = description.match(/,\s*(\d+)\s*GP;/i);
  if (match && match[1]) {
    return parseInt(match[1]);
  }
  return 0;
}
function instance$3($$self, $$props, $$invalidate) {
  let classChoice;
  let backgroundChoice;
  let totalGold;
  let showEditButton;
  let $goldChoices;
  component_subscribe($$self, goldChoices, ($$value) => $$invalidate(14, $goldChoices = $$value));
  let { characterClass: characterClass2 } = $$props;
  let { background: background2 } = $$props;
  let { disabled = false } = $$props;
  let classGoldOnly = 0;
  let classGoldWithEquipment = 0;
  let backgroundGoldOnly = 0;
  let backgroundGoldWithEquipment = 0;
  function handleClassChoice(choice) {
    if (disabled) return;
    const goldValue = choice === "equipment" ? classGoldWithEquipment : classGoldOnly;
    setClassGoldChoice(choice, goldValue);
  }
  function handleBackgroundChoice(choice) {
    if (disabled) return;
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
    if ("disabled" in $$props2) $$invalidate(2, disabled = $$props2.disabled);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*characterClass, background*/
    3) {
      {
        if (characterClass2) {
          $$invalidate(5, classGoldOnly = characterClass2.system.wealth || 0);
          $$invalidate(6, classGoldWithEquipment = extractGoldFromDescription(characterClass2.system.description?.value) || 0);
        }
        if (background2) {
          $$invalidate(7, backgroundGoldOnly = background2.system.wealth || 0);
          $$invalidate(8, backgroundGoldWithEquipment = extractGoldFromDescription(background2.system.description?.value) || 0);
        }
      }
    }
    if ($$self.$$.dirty & /*$goldChoices*/
    16384) {
      $$invalidate(4, classChoice = $goldChoices.fromClass.choice);
    }
    if ($$self.$$.dirty & /*$goldChoices*/
    16384) {
      $$invalidate(3, backgroundChoice = $goldChoices.fromBackground.choice);
    }
    if ($$self.$$.dirty & /*$goldChoices*/
    16384) {
      $$invalidate(10, totalGold = parseInt($goldChoices.fromClass.goldValue) + parseInt($goldChoices.fromBackground.goldValue));
    }
    if ($$self.$$.dirty & /*characterClass, background*/
    3) ;
    if ($$self.$$.dirty & /*classChoice, backgroundChoice*/
    24) ;
    if ($$self.$$.dirty & /*classChoice, backgroundChoice*/
    24) {
      $$invalidate(9, showEditButton = classChoice && backgroundChoice);
    }
  };
  return [
    characterClass2,
    background2,
    disabled,
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
    $goldChoices
  ];
}
class StartingGold extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, {
      characterClass: 0,
      background: 1,
      disabled: 2
    });
  }
}
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[10] = list[i];
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
      if (dirty & /*equipmentByType, configurableSelections, createSelectionHandler, handleCancelSelection*/
      15) {
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
function create_if_block_2(ctx) {
  let iconselect;
  let current;
  iconselect = new IconSelect({
    props: {
      class: "mb-md icon-select",
      options: (
        /*equipmentByType*/
        ctx[1][
          /*group*/
          ctx[10].selectedItem.type
        ] || []
      ),
      active: (
        /*group*/
        ctx[10].parentGroup.granularSelections?.children?.[
          /*group*/
          ctx[10].selectedItem._id
        ]?.selections?.[0]
      ),
      placeHolder: "Select " + /*group*/
      ctx[10].selectedItem.type,
      handler: (
        /*createSelectionHandler*/
        ctx[2](
          /*group*/
          ctx[10].selectedItem,
          /*group*/
          ctx[10].parentGroup
        )
      ),
      id: "equipment-select-" + /*group*/
      ctx[10].selectedItem._id
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
        ctx2[10].selectedItem.type
      ] || [];
      if (dirty & /*configurableSelections*/
      1) iconselect_changes.active = /*group*/
      ctx2[10].parentGroup.granularSelections?.children?.[
        /*group*/
        ctx2[10].selectedItem._id
      ]?.selections?.[0];
      if (dirty & /*configurableSelections*/
      1) iconselect_changes.placeHolder = "Select " + /*group*/
      ctx2[10].selectedItem.type;
      if (dirty & /*configurableSelections*/
      1) iconselect_changes.handler = /*createSelectionHandler*/
      ctx2[2](
        /*group*/
        ctx2[10].selectedItem,
        /*group*/
        ctx2[10].parentGroup
      );
      if (dirty & /*configurableSelections*/
      1) iconselect_changes.id = "equipment-select-" + /*group*/
      ctx2[10].selectedItem._id;
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
          ctx[10].selectedItem.type
        ] || []
      ),
      active: (
        /*group*/
        ctx[10].granularSelections?.self?.[0]
      ),
      placeHolder: "Select " + /*group*/
      ctx[10].selectedItem.type,
      handler: (
        /*createSelectionHandler*/
        ctx[2](
          /*group*/
          ctx[10].id
        )
      ),
      id: "equipment-select-" + /*group*/
      ctx[10].selectedItem._id
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
        ctx2[10].selectedItem.type
      ] || [];
      if (dirty & /*configurableSelections*/
      1) iconselect_changes.active = /*group*/
      ctx2[10].granularSelections?.self?.[0];
      if (dirty & /*configurableSelections*/
      1) iconselect_changes.placeHolder = "Select " + /*group*/
      ctx2[10].selectedItem.type;
      if (dirty & /*configurableSelections*/
      1) iconselect_changes.handler = /*createSelectionHandler*/
      ctx2[2](
        /*group*/
        ctx2[10].id
      );
      if (dirty & /*configurableSelections*/
      1) iconselect_changes.id = "equipment-select-" + /*group*/
      ctx2[10].selectedItem._id;
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
  let div5;
  let div3;
  let div0;
  let img;
  let img_src_value;
  let img_alt_value;
  let div1;
  let span;
  let t_value = (
    /*group*/
    ctx[10].selectedItem.label + ""
  );
  let t;
  let div2;
  let button;
  let div4;
  let if_block0_anchor;
  let current;
  let mounted;
  let dispose;
  let if_block0 = (
    /*group*/
    ctx[10].parentGroup && create_if_block_2(ctx)
  );
  let if_block1 = !/*group*/
  ctx[10].parentGroup && create_if_block_1$2(ctx);
  return {
    c() {
      div5 = element("div");
      div3 = element("div");
      div0 = element("div");
      img = element("img");
      div1 = element("div");
      span = element("span");
      t = text(t_value);
      div2 = element("div");
      button = element("button");
      button.innerHTML = `<i class="fas fa-times svelte-gas-184aphx"></i>`;
      div4 = element("div");
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      attr(img, "class", "icon svelte-gas-184aphx");
      if (!src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*group*/
        ctx[10].selectedItem.type
      ))) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*group*/
      ctx[10].selectedItem.type);
      attr(div0, "class", "flex0 relative");
      attr(div1, "class", "flex2 left name ml-sm svelte-gas-184aphx");
      attr(button, "class", "cancel-button svelte-gas-184aphx");
      attr(div2, "class", "flex0 right");
      attr(div3, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div4, "class", "equipment-select svelte-gas-184aphx");
      attr(div5, "class", "equipment-config-item svelte-gas-184aphx");
    },
    m(target, anchor) {
      insert(target, div5, anchor);
      append(div5, div3);
      append(div3, div0);
      append(div0, img);
      append(div3, div1);
      append(div1, span);
      append(span, t);
      append(div3, div2);
      append(div2, button);
      append(div5, div4);
      if (if_block0) if_block0.m(div4, null);
      append(div4, if_block0_anchor);
      if (if_block1) if_block1.m(div4, null);
      current = true;
      if (!mounted) {
        dispose = listen(button, "click", function() {
          if (is_function(
            /*handleCancelSelection*/
            ctx[3](
              /*group*/
              ctx[10]
            )
          )) ctx[3](
            /*group*/
            ctx[10]
          ).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (!current || dirty & /*configurableSelections*/
      1 && !src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*group*/
        ctx[10].selectedItem.type
      ))) {
        attr(img, "src", img_src_value);
      }
      if (!current || dirty & /*configurableSelections*/
      1 && img_alt_value !== (img_alt_value = /*group*/
      ctx[10].selectedItem.type)) {
        attr(img, "alt", img_alt_value);
      }
      if ((!current || dirty & /*configurableSelections*/
      1) && t_value !== (t_value = /*group*/
      ctx[10].selectedItem.label + "")) set_data(t, t_value);
      if (
        /*group*/
        ctx[10].parentGroup
      ) {
        if (if_block0) {
          if_block0.p(ctx, dirty);
          if (dirty & /*configurableSelections*/
          1) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_2(ctx);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(div4, if_block0_anchor);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (!/*group*/
      ctx[10].parentGroup) {
        if (if_block1) {
          if_block1.p(ctx, dirty);
          if (dirty & /*configurableSelections*/
          1) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_1$2(ctx);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div4, null);
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
        detach(div5);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$2(ctx) {
  let section;
  let current;
  let if_block = (
    /*configurableSelections*/
    ctx[0].length > 0 && create_if_block$2(ctx)
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
        ctx2[0].length > 0
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*configurableSelections*/
          1) {
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
  let configurableSelections;
  let equipmentByType;
  let $equipmentSelections;
  component_subscribe($$self, equipmentSelections, ($$value) => $$invalidate(5, $equipmentSelections = $$value));
  const CONFIGURABLE_TYPES = ["tool", "weapon", "armor", "focus"];
  let packs = getPacksFromSettings("equipment");
  let allEquipmentItemsFromPacks = [];
  onMount(async () => {
    const rawItems = await extractItemsFromPacksAsync(packs, ["name->label", "img", "type", "folder", "uuid->value", "_id"], ["system.type", "system.magicalBonus", "system.properties"]);
    $$invalidate(4, allEquipmentItemsFromPacks = rawItems.map((item) => ({
      ...item,
      system: item.system ? {
        type: item.system.type,
        magicalBonus: item.system.magicalBonus,
        properties: item.system.properties
      } : void 0
    })));
  });
  const showPackLabelInSelect = game.settings.get(MODULE_ID, "showPackLabelInSelect");
  function handleSelection(groupId, option, parentGroup) {
    const value = typeof option === "object" ? option.value : option;
    if (parentGroup) {
      addChildGranularSelection(parentGroup.id, groupId._id, value);
    } else {
      addGranularSelection(groupId, value);
    }
  }
  function createSelectionHandler(groupId, parentGroup) {
    return function selectionHandler(option) {
      handleSelection(groupId, option, parentGroup);
    };
  }
  function handleCancelSelection(group) {
    const groupId = group.parentGroup ? group.parentGroup.id : group.id;
    editGroup(groupId);
  }
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$equipmentSelections*/
    32) {
      $$invalidate(0, configurableSelections = Object.values($equipmentSelections).filter((group) => {
        if (!group.selectedItem) {
          return false;
        }
        if (group.selectedItem.parent?.type === "OR" && group.selectedItem.type === "AND") {
          const hasConfigurableChildren = group.selectedItem.children?.some((child) => {
            const isConfigurable2 = CONFIGURABLE_TYPES.includes(child.type);
            const childSelections = group.granularSelections?.children?.[child._id]?.selections;
            const requiredCount2 = getRequiredSelectionsCount(child);
            const needsSelection2 = !childSelections?.length || childSelections.length < requiredCount2;
            return isConfigurable2 && needsSelection2;
          });
          return hasConfigurableChildren;
        }
        if (group.selectedItem.parent?.type === "OR") {
          const isConfigurable2 = CONFIGURABLE_TYPES.includes(group.selectedItem.type);
          const selfSelections2 = group.granularSelections?.self;
          const requiredCount2 = getRequiredSelectionsCount(group.selectedItem);
          const needsSelection2 = !selfSelections2?.length || selfSelections2.length < requiredCount2;
          return isConfigurable2 && needsSelection2;
        }
        if (group.selectedItem.type === "AND" && group.selectedItem.children) {
          const hasConfigurableChildren = group.selectedItem.children.some((child) => {
            const isConfigurable2 = CONFIGURABLE_TYPES.includes(child.type);
            const childSelections = group.granularSelections?.children?.[child._id]?.selections;
            const requiredCount2 = getRequiredSelectionsCount(child);
            const needsSelection2 = !childSelections?.length || childSelections.length < requiredCount2;
            return isConfigurable2 && needsSelection2;
          });
          window.GAS.log.d("[EquipSelect DETAIL] AND group evaluation result:", {
            groupId: group.id,
            hasConfigurableChildren,
            willInclude: hasConfigurableChildren
          });
          return hasConfigurableChildren;
        }
        const isConfigurable = CONFIGURABLE_TYPES.includes(group.selectedItem.type);
        const selfSelections = group.granularSelections?.self;
        const requiredCount = getRequiredSelectionsCount(group.selectedItem);
        const needsSelection = !selfSelections?.length || selfSelections.length < requiredCount;
        return isConfigurable && needsSelection;
      }).flatMap((group) => {
        window.GAS.log.d("[EquipSelect DETAIL] Processing filtered group for flatMap:", {
          groupId: group.id,
          type: group.selectedItem?.type,
          hasChildren: !!group.selectedItem?.children,
          fullGroup: group
        });
        if (group.selectedItem?.type === "AND" && group.selectedItem.children) {
          const configurableChildren = group.selectedItem.children.filter((child) => {
            const isConfigurable = CONFIGURABLE_TYPES.includes(child.type);
            const childSelections = group.granularSelections?.children?.[child._id]?.selections;
            const requiredCount = getRequiredSelectionsCount(child);
            const needsSelection = !childSelections?.length || childSelections.length < requiredCount;
            return isConfigurable && needsSelection;
          }).map((child) => {
            const result = {
              ...group,
              selectedItem: child,
              parentGroup: group
            };
            return result;
          });
          return configurableChildren;
        }
        if (group.selectedItem.parent?.type === "OR") ;
        return [group];
      }));
    }
    if ($$self.$$.dirty & /*configurableSelections, allEquipmentItemsFromPacks*/
    17) {
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
    createSelectionHandler,
    handleCancelSelection,
    allEquipmentItemsFromPacks,
    $equipmentSelections
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
      attr(td, "class", "empty-message svelte-gas-ovwqls");
      attr(td, "colspan", "4");
      attr(tr, "class", "svelte-gas-ovwqls");
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
      attr(img, "class", "svelte-gas-ovwqls");
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
      attr(img, "class", "svelte-gas-ovwqls");
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
      attr(td, "class", "svelte-gas-ovwqls");
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
      attr(td0, "class", "svelte-gas-ovwqls");
      attr(td1, "class", "weight svelte-gas-ovwqls");
      attr(td2, "class", "quantity svelte-gas-ovwqls");
      attr(tr, "class", "svelte-gas-ovwqls");
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
      attr(th0, "class", "svelte-gas-ovwqls");
      attr(th1, "class", "white svelte-gas-ovwqls");
      attr(th2, "class", "white svelte-gas-ovwqls");
      attr(th3, "class", "white svelte-gas-ovwqls");
      attr(tr, "class", "svelte-gas-ovwqls");
      attr(table, "class", "inventory-table svelte-gas-ovwqls");
      attr(div, "class", "planned-inventory svelte-gas-ovwqls");
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
  window.GAS.log.d("PLANNED INVENTORY | getItemName", item);
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
    if ($$self.$$.dirty & /*$flattenedSelections*/
    4) {
      window.GAS.log.d("PLANNED INVENTORY | flattenedSelections", $flattenedSelections);
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
function create_else_block(ctx) {
  let startinggold;
  let current;
  startinggold = new StartingGold$1({
    props: {
      characterClass: (
        /*$characterClass*/
        ctx[3]
      ),
      disabled: false
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
      8) startinggold_changes.characterClass = /*$characterClass*/
      ctx2[3];
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
  startinggoldv4 = new StartingGold({
    props: {
      characterClass: (
        /*$characterClass*/
        ctx[3]
      ),
      background: (
        /*$background*/
        ctx[4]
      ),
      disabled: false
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
      8) startinggoldv4_changes.characterClass = /*$characterClass*/
      ctx2[3];
      if (dirty & /*$background*/
      16) startinggoldv4_changes.background = /*$background*/
      ctx2[4];
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
        ctx[0]
      ),
      proficiencies: (
        /*proficiencies*/
        ctx[1]
      ),
      disabled: false
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
      1) startingequipment_changes.startingEquipment = /*$compatibleStartingEquipment*/
      ctx2[0];
      if (dirty & /*proficiencies*/
      2) startingequipment_changes.proficiencies = /*proficiencies*/
      ctx2[1];
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
  let section;
  let current_block_type_index;
  let if_block0;
  let pre;
  let t1;
  let t2;
  let div1;
  let div2;
  let plannedinventory;
  let equipmentselectordetail;
  let current;
  const if_block_creators = [create_if_block_1, create_else_block];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (window.GAS.dnd5eVersion === 4 && window.GAS.dnd5eRules === "2024") return 0;
    return 1;
  }
  current_block_type_index = select_block_type();
  if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  let if_block1 = (
    /*isGoldComplete*/
    ctx[2] && create_if_block(ctx)
  );
  plannedinventory = new PlannedInventory({});
  equipmentselectordetail = new EquipmentSelectorDetail({});
  return {
    c() {
      div5 = element("div");
      div4 = element("div");
      div3 = element("div");
      div0 = element("div");
      h3 = element("h3");
      h3.textContent = `${localize("GAS.Equipment.Selection")}`;
      section = element("section");
      if_block0.c();
      pre = element("pre");
      t1 = text("isGoldComplete ");
      t2 = text(
        /*isGoldComplete*/
        ctx[2]
      );
      if (if_block1) if_block1.c();
      div1 = element("div");
      div2 = element("div");
      create_component(plannedinventory.$$.fragment);
      create_component(equipmentselectordetail.$$.fragment);
      attr(section, "class", "equipment-flow svelte-gas-1ho7u6s");
      attr(div0, "class", "flex2 pr-sm col-a");
      attr(div1, "class", "flex0 border-right right-border-gradient-mask");
      attr(div2, "class", "flex3 left scroll col-b");
      attr(div3, "class", "flexrow");
      attr(div4, "class", "content svelte-gas-1ho7u6s");
      attr(div5, "class", "container svelte-gas-1ho7u6s");
    },
    m(target, anchor) {
      insert(target, div5, anchor);
      append(div5, div4);
      append(div4, div3);
      append(div3, div0);
      append(div0, h3);
      append(div0, section);
      if_blocks[current_block_type_index].m(section, null);
      append(section, pre);
      append(pre, t1);
      append(pre, t2);
      if (if_block1) if_block1.m(section, null);
      append(div3, div1);
      append(div3, div2);
      mount_component(plannedinventory, div2, null);
      mount_component(equipmentselectordetail, div2, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      if_block0.p(ctx2, dirty);
      if (!current || dirty & /*isGoldComplete*/
      4) set_data(
        t2,
        /*isGoldComplete*/
        ctx2[2]
      );
      if (
        /*isGoldComplete*/
        ctx2[2]
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & /*isGoldComplete*/
          4) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block(ctx2);
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
      transition_in(plannedinventory.$$.fragment, local);
      transition_in(equipmentselectordetail.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(if_block0);
      transition_out(if_block1);
      transition_out(plannedinventory.$$.fragment, local);
      transition_out(equipmentselectordetail.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div5);
      }
      if_blocks[current_block_type_index].d();
      if (if_block1) if_block1.d();
      destroy_component(plannedinventory);
      destroy_component(equipmentselectordetail);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let isGoldComplete;
  let proficiencies;
  let $compatibleStartingEquipment;
  let $goldChoices;
  let $doc;
  let $goldRoll;
  let $areGoldChoicesComplete;
  let $characterClass;
  let $background;
  component_subscribe($$self, compatibleStartingEquipment, ($$value) => $$invalidate(0, $compatibleStartingEquipment = $$value));
  component_subscribe($$self, goldChoices, ($$value) => $$invalidate(6, $goldChoices = $$value));
  component_subscribe($$self, goldRoll, ($$value) => $$invalidate(8, $goldRoll = $$value));
  component_subscribe($$self, areGoldChoicesComplete, ($$value) => $$invalidate(9, $areGoldChoicesComplete = $$value));
  component_subscribe($$self, characterClass, ($$value) => $$invalidate(3, $characterClass = $$value));
  component_subscribe($$self, background, ($$value) => $$invalidate(4, $background = $$value));
  const doc = getContext("#doc");
  component_subscribe($$self, doc, (value) => $$invalidate(7, $doc = value));
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$areGoldChoicesComplete, $goldRoll*/
    768) {
      $$invalidate(2, isGoldComplete = window.GAS.dnd5eVersion === 4 && window.GAS.dnd5eRules === "2024" ? $areGoldChoicesComplete : $goldRoll > 0);
    }
    if ($$self.$$.dirty & /*$doc*/
    128) {
      $$invalidate(1, proficiencies = $doc.system?.proficiencies || {});
    }
    if ($$self.$$.dirty & /*$goldChoices*/
    64) {
      window.GAS.log.d("Equipment goldChoices", $goldChoices);
    }
    if ($$self.$$.dirty & /*$compatibleStartingEquipment*/
    1) {
      window.GAS.log.d("Equipment compatibleStartingEquipment", $compatibleStartingEquipment);
    }
  };
  game.settings.get(MODULE_ID, "enableEquipmentSelection");
  return [
    $compatibleStartingEquipment,
    proficiencies,
    isGoldComplete,
    $characterClass,
    $background,
    doc,
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
//# sourceMappingURL=Equipment-CDxK_yEW.js.map
