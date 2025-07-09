import { S as SvelteComponent, i as init, s as safe_not_equal, e as element, l as localize, a as empty, b as attr, c as insert, d as append, A as noop, j as detach, k as component_subscribe, Z as goldRoll, y as set_store_value, M as MODULE_ID, F as text, G as set_data, X as listen, af as preventDefault, a1 as run_all, ag as bubble, h as transition_in, g as group_outros, t as transition_out, f as check_outros, a5 as equipmentSelections, ah as selectedItems, o as onMount, ai as initializeGroup, z as ensure_array_like, B as destroy_each, aj as selectEquipment, a9 as editGroup, a8 as is_function, v as create_component, w as mount_component, x as destroy_component, L as src_url_equal, a7 as getEquipmentIcon } from "./index-BKCpm07K.js";
function create_if_block_3$1(ctx) {
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
function create_if_block_2$1(ctx) {
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
      attr(div1, "class", "flex1 badge center svelte-gas-z7azgb");
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
function create_if_block$1(ctx) {
  let div2;
  let div0;
  let div1;
  let i;
  let div1_class_value;
  let mounted;
  let dispose;
  let if_block = (
    /*hasRolled*/
    ctx[3] && create_if_block_1$1(ctx)
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
      ctx[0] ? "" : "active") + " svelte-gas-z7azgb");
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
          if_block = create_if_block_1$1(ctx2);
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
      ctx2[0] ? "" : "active") + " svelte-gas-z7azgb")) {
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
function create_if_block_1$1(ctx) {
  let div;
  let span0;
  let span1;
  let t1;
  let t2;
  return {
    c() {
      div = element("div");
      span0 = element("span");
      span0.textContent = "Result: ";
      span1 = element("span");
      t1 = text(
        /*$goldRoll*/
        ctx[2]
      );
      t2 = text(" gp");
      attr(span0, "class", "label gold svelte-gas-z7azgb");
      attr(span1, "class", "value svelte-gas-z7azgb");
      attr(div, "class", "result svelte-gas-z7azgb");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, span0);
      append(div, span1);
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
        detach(div);
      }
    }
  };
}
function create_fragment$2(ctx) {
  let section;
  let div1;
  let div0;
  let h2;
  let div2;
  let if_block1_anchor;
  let div2_class_value;
  let if_block0 = !/*disabled*/
  ctx[0] && create_if_block_3$1(ctx);
  let if_block1 = !/*hasRolled*/
  ctx[3] && create_if_block_2$1(ctx);
  let if_block2 = !/*disabled*/
  ctx[0] && create_if_block$1(ctx);
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
      (ctx[0] ? "disabled" : "") + " svelte-gas-z7azgb");
      attr(section, "class", "starting-gold svelte-gas-z7azgb");
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
          if_block0 = create_if_block_3$1(ctx2);
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
          if_block1 = create_if_block_2$1(ctx2);
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
          if_block2 = create_if_block$1(ctx2);
          if_block2.c();
          if_block2.m(div2, null);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (dirty & /*disabled*/
      1 && div2_class_value !== (div2_class_value = "flexcol gold-section gap-10 " + /*disabled*/
      (ctx2[0] ? "disabled" : "") + " svelte-gas-z7azgb")) {
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
function instance$2($$self, $$props, $$invalidate) {
  let hasRolled;
  let $goldRoll;
  component_subscribe($$self, goldRoll, ($$value) => $$invalidate(2, $goldRoll = $$value));
  let { characterClass } = $$props;
  let { disabled = false } = $$props;
  let formula = "";
  async function rollGold() {
    if (disabled) return;
    const roll = await new Roll(formula).evaluate();
    const className = characterClass?.name || "Character";
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
    if ("characterClass" in $$props2) $$invalidate(5, characterClass = $$props2.characterClass);
    if ("disabled" in $$props2) $$invalidate(0, disabled = $$props2.disabled);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*characterClass, formula*/
    34) {
      {
        if (characterClass?.system?.wealth) {
          $$invalidate(1, formula = characterClass.system.wealth);
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
    characterClass,
    resetGoldRoll
  ];
}
class StartingGold extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, {
      characterClass: 5,
      disabled: 0,
      resetGoldRoll: 6
    });
  }
  get resetGoldRoll() {
    return this.$$.ctx[6];
  }
}
function create_fragment$1(ctx) {
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
function instance$1($$self, $$props, $$invalidate) {
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
    init(this, options, instance$1, create_fragment$1, safe_not_equal, { icon: 0, disabled: 1 });
  }
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[13] = list[i];
  return child_ctx;
}
function get_each_context_3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[16] = list[i];
  return child_ctx;
}
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[16] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[16] = list[i];
  return child_ctx;
}
function create_if_block(ctx) {
  let section;
  let div1;
  let div0;
  let h2;
  let current;
  let if_block = !/*disabled*/
  ctx[1] && create_if_block_9(ctx);
  let each_value = ensure_array_like(
    /*sortedGroups*/
    ctx[2]
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
      section = element("section");
      div1 = element("div");
      if (if_block) if_block.c();
      div0 = element("div");
      h2 = element("h2");
      h2.textContent = `${localize("GAS.Equipment.Label")}`;
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(h2, "class", "left");
      attr(div0, "class", "flex3");
      attr(div1, "class", "flexrow");
      attr(section, "class", "starting-equipment svelte-gas-1buirc");
    },
    m(target, anchor) {
      insert(target, section, anchor);
      append(section, div1);
      if (if_block) if_block.m(div1, null);
      append(div1, div0);
      append(div0, h2);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(section, null);
        }
      }
      current = true;
    },
    p(ctx2, dirty) {
      if (!/*disabled*/
      ctx2[1]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_9(ctx2);
          if_block.c();
          if_block.m(div1, div0);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*sortedGroups, disabled, handleSelection, getOptionClasses, isOptionDisabled, $selectedItems, handleEditGroup, isGroupNonEditable*/
      494) {
        each_value = ensure_array_like(
          /*sortedGroups*/
          ctx2[2]
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
            each_blocks[i].m(section, null);
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
        detach(section);
      }
      if (if_block) if_block.d();
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_if_block_9(ctx) {
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
function create_if_block_1(ctx) {
  let div3;
  let div1;
  let div0;
  let show_if = !/*group*/
  ctx[13].inProgress && !isGroupNonEditable(
    /*group*/
    ctx[13]
  );
  let div2;
  let div3_class_value;
  let current;
  let if_block0 = (
    /*group*/
    ctx[13].type === "choice" && create_if_block_7(ctx)
  );
  let if_block1 = show_if && create_if_block_6(ctx);
  function select_block_type_1(ctx2, dirty) {
    if (
      /*group*/
      ctx2[13].type === "standalone" && /*group*/
      ctx2[13].inProgress
    ) return create_if_block_2;
    return create_else_block_1;
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
      attr(div2, "class", "options svelte-gas-1buirc");
      attr(div3, "class", div3_class_value = "equipment-group " + /*group*/
      (ctx[13].inProgress ? "in-progress" : "") + " svelte-gas-1buirc");
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
        ctx2[13].type === "choice"
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_7(ctx2);
          if_block0.c();
          if_block0.m(div0, null);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty & /*sortedGroups*/
      4) show_if = !/*group*/
      ctx2[13].inProgress && !isGroupNonEditable(
        /*group*/
        ctx2[13]
      );
      if (show_if) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & /*sortedGroups*/
          4) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_6(ctx2);
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
      if (!current || dirty & /*sortedGroups*/
      4 && div3_class_value !== (div3_class_value = "equipment-group " + /*group*/
      (ctx2[13].inProgress ? "in-progress" : "") + " svelte-gas-1buirc")) {
        attr(div3, "class", div3_class_value);
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
function create_if_block_7(ctx) {
  let if_block_anchor;
  function select_block_type(ctx2, dirty) {
    if (
      /*group*/
      ctx2[13].completed
    ) return create_if_block_8;
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
      attr(span, "class", "group-label svelte-gas-1buirc");
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
function create_if_block_8(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "Completed:";
      attr(span, "class", "group-label svelte-gas-1buirc");
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
function create_if_block_6(ctx) {
  let div;
  let iconbutton;
  let current;
  iconbutton = new IconButton({
    props: {
      class: "option",
      disabled: (
        /*disabled*/
        ctx[1]
      ),
      icon: "fas fa-pencil"
    }
  });
  iconbutton.$on("click", function() {
    if (is_function(
      /*handleEditGroup*/
      ctx[6](
        /*group*/
        ctx[13].id
      )
    )) ctx[6](
      /*group*/
      ctx[13].id
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
      2) iconbutton_changes.disabled = /*disabled*/
      ctx[1];
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
function create_else_block_1(ctx) {
  let each_1_anchor;
  let each_value_3 = ensure_array_like(
    /*group*/
    ctx[13].items
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
      if (dirty & /*getOptionClasses, sortedGroups, isOptionDisabled, handleSelection, $selectedItems*/
      428) {
        each_value_3 = ensure_array_like(
          /*group*/
          ctx2[13].items
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
function create_if_block_2(ctx) {
  let div2;
  let div1;
  let div0;
  let if_block0 = !/*group*/
  ctx[13].completed && create_if_block_4();
  function select_block_type_2(ctx2, dirty) {
    if (
      /*group*/
      ctx2[13].items[0].type === "AND"
    ) return create_if_block_3;
    return create_else_block;
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
      attr(div2, "class", "equipment-group svelte-gas-1buirc");
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
      ctx2[13].completed) {
        if (if_block0) ;
        else {
          if_block0 = create_if_block_4();
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
function create_if_block_5(ctx) {
  let span;
  let t0;
  let t1_value = (
    /*$selectedItems*/
    ctx[3][
      /*group*/
      ctx[13].id
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
      12 && t1_value !== (t1_value = /*$selectedItems*/
      ctx2[3][
        /*group*/
        ctx2[13].id
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
    ctx[16].label + ""
  );
  let button_class_value;
  let button_disabled_value;
  let mounted;
  let dispose;
  let if_block = (
    /*group*/
    ctx[13].selectedItemId === /*item*/
    ctx[16]._id && /*$selectedItems*/
    ctx[3][
      /*group*/
      ctx[13].id
    ] && create_if_block_5(ctx)
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
      attr(img, "class", "icon svelte-gas-1buirc");
      if (!src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[16].type,
        /*group*/
        ctx[13]
      ))) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[16].type);
      attr(div0, "class", "flex0 relative icon svelte-gas-1buirc");
      attr(div1, "class", "flex2 left name black-link svelte-gas-1buirc");
      attr(div2, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(button, "class", button_class_value = "option " + /*getOptionClasses*/
      ctx[8](
        /*group*/
        ctx[13],
        /*item*/
        ctx[16]
      ) + " svelte-gas-1buirc");
      button.disabled = button_disabled_value = /*isOptionDisabled*/
      ctx[7](
        /*group*/
        ctx[13],
        /*item*/
        ctx[16]
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
          if (is_function(
            /*handleSelection*/
            ctx[5](
              /*group*/
              ctx[13].id,
              /*item*/
              ctx[16]
            )
          )) ctx[5](
            /*group*/
            ctx[13].id,
            /*item*/
            ctx[16]
          ).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*sortedGroups*/
      4 && !src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[16].type,
        /*group*/
        ctx[13]
      ))) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*sortedGroups*/
      4 && img_alt_value !== (img_alt_value = /*item*/
      ctx[16].type)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty & /*sortedGroups*/
      4 && raw_value !== (raw_value = /*item*/
      ctx[16].label + "")) span.innerHTML = raw_value;
      if (
        /*group*/
        ctx[13].selectedItemId === /*item*/
        ctx[16]._id && /*$selectedItems*/
        ctx[3][
          /*group*/
          ctx[13].id
        ]
      ) {
        if (if_block) {
          if_block.p(ctx, dirty);
        } else {
          if_block = create_if_block_5(ctx);
          if_block.c();
          if_block.m(div1, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*sortedGroups*/
      4 && button_class_value !== (button_class_value = "option " + /*getOptionClasses*/
      ctx[8](
        /*group*/
        ctx[13],
        /*item*/
        ctx[16]
      ) + " svelte-gas-1buirc")) {
        attr(button, "class", button_class_value);
      }
      if (dirty & /*sortedGroups*/
      4 && button_disabled_value !== (button_disabled_value = /*isOptionDisabled*/
      ctx[7](
        /*group*/
        ctx[13],
        /*item*/
        ctx[16]
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
function create_if_block_4(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "All of the following:";
      attr(span, "class", "group-label svelte-gas-1buirc");
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
function create_else_block(ctx) {
  let each_1_anchor;
  let each_value_2 = ensure_array_like(
    /*group*/
    ctx[13].items
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
      if (dirty & /*sortedGroups, disabled, handleSelection*/
      38) {
        each_value_2 = ensure_array_like(
          /*group*/
          ctx2[13].items
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
function create_if_block_3(ctx) {
  let each_1_anchor;
  let each_value_1 = ensure_array_like(
    /*group*/
    ctx[13].items[0].children
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
      if (dirty & /*sortedGroups, disabled, handleSelection*/
      38) {
        each_value_1 = ensure_array_like(
          /*group*/
          ctx2[13].items[0].children
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
    ctx[16].label + ""
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
      attr(img, "class", "icon svelte-gas-1buirc");
      if (!src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[16].type,
        /*group*/
        ctx[13]
      ))) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[16].type);
      attr(div0, "class", "flex0 relative icon svelte-gas-1buirc");
      attr(div1, "class", "flex2 left name black-link svelte-gas-1buirc");
      attr(div2, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div3, "class", div3_class_value = "equipment-item option " + /*item*/
      (ctx[16].type === "linked" ? "selected" : "") + " " + /*item*/
      (ctx[16].type === "focus" ? "focus" : "") + " " + /*disabled*/
      (ctx[1] ? "disabled" : "") + " svelte-gas-1buirc");
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
            ctx[16].type !== "linked" ? (
              /*handleSelection*/
              ctx[5](
                /*group*/
                ctx[13].id,
                /*item*/
                ctx[16]
              )
            ) : null
          )) /*item*/
          (ctx[16].type !== "linked" ? (
            /*handleSelection*/
            ctx[5](
              /*group*/
              ctx[13].id,
              /*item*/
              ctx[16]
            )
          ) : null).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*sortedGroups*/
      4 && !src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[16].type,
        /*group*/
        ctx[13]
      ))) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*sortedGroups*/
      4 && img_alt_value !== (img_alt_value = /*item*/
      ctx[16].type)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty & /*sortedGroups*/
      4 && raw_value !== (raw_value = /*item*/
      ctx[16].label + "")) span.innerHTML = raw_value;
      if (dirty & /*sortedGroups, disabled*/
      6 && div3_class_value !== (div3_class_value = "equipment-item option " + /*item*/
      (ctx[16].type === "linked" ? "selected" : "") + " " + /*item*/
      (ctx[16].type === "focus" ? "focus" : "") + " " + /*disabled*/
      (ctx[1] ? "disabled" : "") + " svelte-gas-1buirc")) {
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
    ctx[16].label + ""
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
      attr(img, "class", "icon svelte-gas-1buirc");
      if (!src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[16].type,
        /*group*/
        ctx[13]
      ))) attr(img, "src", img_src_value);
      attr(img, "alt", img_alt_value = /*item*/
      ctx[16].type);
      attr(div0, "class", "flex0 relative icon svelte-gas-1buirc");
      attr(div1, "class", "flex2 left name black-link svelte-gas-1buirc");
      attr(div2, "class", "flexrow justify-flexrow-vertical no-wrap");
      attr(div3, "class", div3_class_value = "equipment-item option " + /*item*/
      (ctx[16].type === "linked" ? "selected" : "") + " " + /*item*/
      (ctx[16].type === "focus" ? "focus" : "") + " " + /*disabled*/
      (ctx[1] ? "disabled" : "") + " svelte-gas-1buirc");
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
            ctx[16].type !== "linked" ? (
              /*handleSelection*/
              ctx[5](
                /*group*/
                ctx[13].id,
                /*item*/
                ctx[16]
              )
            ) : null
          )) /*item*/
          (ctx[16].type !== "linked" ? (
            /*handleSelection*/
            ctx[5](
              /*group*/
              ctx[13].id,
              /*item*/
              ctx[16]
            )
          ) : null).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*sortedGroups*/
      4 && !src_url_equal(img.src, img_src_value = getEquipmentIcon(
        /*item*/
        ctx[16].type,
        /*group*/
        ctx[13]
      ))) {
        attr(img, "src", img_src_value);
      }
      if (dirty & /*sortedGroups*/
      4 && img_alt_value !== (img_alt_value = /*item*/
      ctx[16].type)) {
        attr(img, "alt", img_alt_value);
      }
      if (dirty & /*sortedGroups*/
      4 && raw_value !== (raw_value = /*item*/
      ctx[16].label + "")) span.innerHTML = raw_value;
      if (dirty & /*sortedGroups, disabled*/
      6 && div3_class_value !== (div3_class_value = "equipment-item option " + /*item*/
      (ctx[16].type === "linked" ? "selected" : "") + " " + /*item*/
      (ctx[16].type === "focus" ? "focus" : "") + " " + /*disabled*/
      (ctx[1] ? "disabled" : "") + " svelte-gas-1buirc")) {
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
function create_each_block(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*group*/
    (ctx[13].completed || /*group*/
    ctx[13].inProgress) && create_if_block_1(ctx)
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
        ctx2[13].completed || /*group*/
        ctx2[13].inProgress
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & /*sortedGroups*/
          4) {
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
function create_fragment(ctx) {
  let if_block_anchor;
  let current;
  let if_block = (
    /*startingEquipment*/
    ctx[0]?.length && create_if_block(ctx)
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
          if_block = create_if_block(ctx2);
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
function isGroupNonEditable(group) {
  return group.type === "standalone" && group.items.every((item) => {
    if (item.type === "linked") return true;
    if (item.type === "AND") {
      return item.children.every((child) => child.type === "linked");
    }
    return false;
  });
}
function instance($$self, $$props, $$invalidate) {
  let sortedGroups;
  let $equipmentSelections;
  let $selectedItems;
  component_subscribe($$self, equipmentSelections, ($$value) => $$invalidate(10, $equipmentSelections = $$value));
  component_subscribe($$self, selectedItems, ($$value) => $$invalidate(3, $selectedItems = $$value));
  let { startingEquipment = [] } = $$props;
  let { disabled = false } = $$props;
  let { allEquipmentItems = [] } = $$props;
  const equipmentSelectionEnabled = game.settings.get(MODULE_ID, "enableEquipmentSelection");
  function handleSelection(groupId, item) {
    window.GAS.log.d("[StartingEquipment] handleSelection ENTRY", {
      groupId,
      itemDetails: {
        id: item?._id,
        type: item?.type,
        label: item?.label
      },
      groupState: {
        type: $equipmentSelections[groupId]?.type,
        inProgress: $equipmentSelections[groupId]?.inProgress,
        completed: $equipmentSelections[groupId]?.completed,
        selectedItem: $equipmentSelections[groupId]?.selectedItem,
        items: $equipmentSelections[groupId]?.items?.map((i) => ({
          id: i._id,
          type: i.type,
          isAND: i.type === "AND"
        }))
      }
    });
    if (disabled) return;
    const group = $equipmentSelections[groupId];
    window.GAS.log.d("[StartingEquipment] Group evaluation", {
      isStandalone: group?.type === "standalone",
      hasItems: !!group?.items?.length,
      firstItemType: group?.items?.[0]?.type,
      isFirstItemAND: group?.items?.[0]?.type === "AND",
      isChoiceGroup: group?.type === "choice"
    });
    if (group?.type === "standalone" && group.items[0]?.type === "AND") {
      window.GAS.log.d("[StartingEquipment] Handling standalone AND group", {
        andItemDetails: {
          id: group.items[0]._id,
          children: group.items[0].children?.map((c) => ({ id: c._id, type: c.type, label: c.label }))
        },
        currentGranularSelections: group.granularSelections
      });
      selectEquipment(groupId, group.items[0]._id);
    } else if (group?.type === "choice") {
      window.GAS.log.d("[StartingEquipment] Handling choice group", {
        groupId,
        selectedItemId: item._id,
        selectedItemType: item.type,
        isSelectedItemAND: item.type === "AND",
        groupItems: group.items.map((i) => ({ id: i._id, type: i.type }))
      });
      selectEquipment(groupId, item._id);
    }
  }
  function handleEditGroup(groupId) {
    editGroup(groupId);
  }
  onMount(async () => {
  });
  function isOptionDisabled(group, item) {
    return disabled || group.inProgress && group.selectedItemId && group.selectedItemId !== item._id;
  }
  function getOptionClasses(group, item) {
    const classes = [];
    if (group.selectedItemId === item._id) classes.push("selected");
    if (isOptionDisabled(group, item)) classes.push("disabled");
    if (group.completed) classes.push("completed");
    return classes.join(" ");
  }
  $$self.$$set = ($$props2) => {
    if ("startingEquipment" in $$props2) $$invalidate(0, startingEquipment = $$props2.startingEquipment);
    if ("disabled" in $$props2) $$invalidate(1, disabled = $$props2.disabled);
    if ("allEquipmentItems" in $$props2) $$invalidate(9, allEquipmentItems = $$props2.allEquipmentItems);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*startingEquipment*/
    1) {
      window.GAS.log.d("StartingEquipment startingEquipment", startingEquipment);
    }
    if ($$self.$$.dirty & /*startingEquipment*/
    1) {
      {
        if (startingEquipment?.length) {
          startingEquipment.forEach((entry) => {
            if (entry.type === "OR") {
              initializeGroup(entry._id, {
                type: "choice",
                label: "Choose one...",
                items: startingEquipment.filter((item) => item.group === entry._id),
                sort: entry.sort
              });
            } else if (!entry.group) {
              initializeGroup(entry._id || "standalone", {
                type: "standalone",
                label: entry.label,
                items: [entry],
                sort: entry.sort
              });
            }
          });
        }
      }
    }
    if ($$self.$$.dirty & /*$equipmentSelections*/
    1024) {
      $$invalidate(2, sortedGroups = Object.values($equipmentSelections));
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
    $selectedItems,
    equipmentSelectionEnabled,
    handleSelection,
    handleEditGroup,
    isOptionDisabled,
    getOptionClasses,
    allEquipmentItems,
    $equipmentSelections
  ];
}
class StartingEquipment extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {
      startingEquipment: 0,
      disabled: 1,
      allEquipmentItems: 9
    });
  }
}
export {
  IconButton as I,
  StartingGold as S,
  StartingEquipment as a
};
//# sourceMappingURL=StartingEquipment-BQttSqJf.js.map
