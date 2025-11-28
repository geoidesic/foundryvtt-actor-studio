import { S as SvelteComponent, i as init, s as safe_not_equal, B as ensure_array_like, C as noop, k as detach, D as destroy_each, q as insert, u as append, v as element, x as attr, b as component_subscribe, bF as abilityRolls, b6 as race, bB as createEventDispatcher, g as getContext, bC as Timing, o as onMount, M as MODULE_ID, bH as dnd5eModCalc, F as set_data, a5 as listen, ad as is_function, G as text, l as localize, j as set_store_value } from "./index-lx9F9k3I.js";
/* empty css                                                     */
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[18] = list[i];
  child_ctx[20] = i;
  return child_ctx;
}
function create_if_block_6(ctx) {
  let th;
  return {
    c() {
      th = element("th");
      th.textContent = "Origin";
      attr(th, "class", "center svelte-gas-xl9y3q");
    },
    m(target, anchor) {
      insert(target, th, anchor);
    },
    d(detaching) {
      if (detaching) {
        detach(th);
      }
    }
  };
}
function create_if_block_3(ctx) {
  let div2;
  let div0;
  let div1;
  let if_block0 = (
    /*index*/
    ctx[20] != 0 && create_if_block_5(ctx)
  );
  let if_block1 = (
    /*index*/
    ctx[20] != /*systemAbilitiesArray*/
    ctx[2].length - 1 && create_if_block_4(ctx)
  );
  return {
    c() {
      div2 = element("div");
      div0 = element("div");
      if (if_block0) if_block0.c();
      div1 = element("div");
      if (if_block1) if_block1.c();
      attr(div0, "class", "up chevron svelte-gas-xl9y3q");
      attr(div1, "class", "down chevron svelte-gas-xl9y3q");
      attr(div2, "class", "controls svelte-gas-xl9y3q");
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, div0);
      if (if_block0) if_block0.m(div0, null);
      append(div2, div1);
      if (if_block1) if_block1.m(div1, null);
    },
    p(ctx2, dirty) {
      if (
        /*index*/
        ctx2[20] != 0
      ) if_block0.p(ctx2, dirty);
      if (
        /*index*/
        ctx2[20] != /*systemAbilitiesArray*/
        ctx2[2].length - 1
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_4(ctx2);
          if_block1.c();
          if_block1.m(div1, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div2);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
    }
  };
}
function create_if_block_5(ctx) {
  let i;
  let mounted;
  let dispose;
  return {
    c() {
      i = element("i");
      attr(i, "class", "fas fa-chevron-up");
      attr(i, "alt", localize("AltText.MoveUp"));
    },
    m(target, anchor) {
      insert(target, i, anchor);
      if (!mounted) {
        dispose = listen(i, "click", function() {
          if (is_function(
            /*swapAbilities*/
            ctx[8](
              /*ability*/
              ctx[18][0],
              1
            )
          )) ctx[8](
            /*ability*/
            ctx[18][0],
            1
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
        detach(i);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_4(ctx) {
  let i;
  let mounted;
  let dispose;
  return {
    c() {
      i = element("i");
      attr(i, "class", "fas fa-chevron-down");
      attr(i, "alt", localize("AltText.MoveDown"));
    },
    m(target, anchor) {
      insert(target, i, anchor);
      if (!mounted) {
        dispose = listen(i, "click", function() {
          if (is_function(
            /*swapAbilities*/
            ctx[8](
              /*ability*/
              ctx[18][0],
              -1
            )
          )) ctx[8](
            /*ability*/
            ctx[18][0],
            -1
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
        detach(i);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_if_block_1(ctx) {
  let td;
  let span;
  let t_1_value = (
    /*abilityAdvancements*/
    (ctx[5]?.[
      /*ability*/
      ctx[18][0]
    ] || 0) + ""
  );
  let t_1;
  let if_block = (
    /*abilityAdvancements*/
    ctx[5]?.[
      /*ability*/
      ctx[18][0]
    ] > 0 && create_if_block_2()
  );
  return {
    c() {
      td = element("td");
      if (if_block) if_block.c();
      span = element("span");
      t_1 = text(t_1_value);
      attr(td, "class", "center svelte-gas-xl9y3q");
    },
    m(target, anchor) {
      insert(target, td, anchor);
      if (if_block) if_block.m(td, null);
      append(td, span);
      append(span, t_1);
    },
    p(ctx2, dirty) {
      if (
        /*abilityAdvancements*/
        ctx2[5]?.[
          /*ability*/
          ctx2[18][0]
        ] > 0
      ) {
        if (if_block) ;
        else {
          if_block = create_if_block_2();
          if_block.c();
          if_block.m(td, span);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*abilityAdvancements, systemAbilitiesArray*/
      36 && t_1_value !== (t_1_value = /*abilityAdvancements*/
      (ctx2[5]?.[
        /*ability*/
        ctx2[18][0]
      ] || 0) + "")) set_data(t_1, t_1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(td);
      }
      if (if_block) if_block.d();
    }
  };
}
function create_if_block_2(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "+";
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
function create_if_block(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "+";
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
function create_each_block(ctx) {
  let tr;
  let td0;
  let t0_value = (
    /*ability*/
    ctx[18][1].label + ""
  );
  let t0;
  let td1;
  let input;
  let input_class_value;
  let input_value_value;
  let input_name_value;
  let input_id_value;
  let td2;
  let span0;
  let t1_value = (Number(
    /*abilityAdvancements*/
    ctx[5]?.[
      /*ability*/
      ctx[18][0]
    ]
  ) || 0) + Number(
    /*$doc*/
    ctx[6].system.abilities[
      /*ability*/
      ctx[18][0]
    ]?.value || 0
  ) + "";
  let t1;
  let td3;
  let show_if = dnd5eModCalc(Number(
    /*$doc*/
    ctx[6].system.abilities[
      /*ability*/
      ctx[18][0]
    ]?.value
  ) + (Number(
    /*abilityAdvancements*/
    ctx[5]?.[
      /*ability*/
      ctx[18][0]
    ]
  ) || 0)) > 0;
  let span1;
  let t2_value = dnd5eModCalc(Number(
    /*$doc*/
    ctx[6].system.abilities[
      /*ability*/
      ctx[18][0]
    ]?.value
  ) + (Number(
    /*abilityAdvancements*/
    ctx[5]?.[
      /*ability*/
      ctx[18][0]
    ]
  ) || 0)) + "";
  let t2;
  let td4;
  let div;
  let i;
  let div_class_value;
  let mounted;
  let dispose;
  let if_block0 = (
    /*allowMove*/
    ctx[0] && /*allRolled*/
    ctx[1] && create_if_block_3(ctx)
  );
  let if_block1 = window.GAS.dnd5eRules == "2014" && create_if_block_1(ctx);
  let if_block2 = show_if && create_if_block();
  return {
    c() {
      tr = element("tr");
      td0 = element("td");
      t0 = text(t0_value);
      td1 = element("td");
      input = element("input");
      if (if_block0) if_block0.c();
      if (if_block1) if_block1.c();
      td2 = element("td");
      span0 = element("span");
      t1 = text(t1_value);
      td3 = element("td");
      if (if_block2) if_block2.c();
      span1 = element("span");
      t2 = text(t2_value);
      td4 = element("td");
      div = element("div");
      i = element("i");
      attr(td0, "class", "ability svelte-gas-xl9y3q");
      attr(input, "class", input_class_value = "small mainscore " + /*scoreClass*/
      ctx[4] + " svelte-gas-xl9y3q");
      input.disabled = true;
      attr(input, "type", "number");
      input.value = input_value_value = /*$doc*/
      ctx[6].system.abilities[
        /*ability*/
        ctx[18][0]
      ]?.value;
      attr(input, "name", input_name_value = /*ability*/
      ctx[18][0]);
      attr(input, "id", input_id_value = /*ability*/
      ctx[18][0]);
      attr(td1, "class", "center relative svelte-gas-xl9y3q");
      attr(td2, "class", "center svelte-gas-xl9y3q");
      attr(td3, "class", "center svelte-gas-xl9y3q");
      attr(i, "class", "fas fa-dice");
      attr(div, "class", div_class_value = "buttons " + /*$abilityRolls*/
      (ctx[3][
        /*ability*/
        ctx[18][0]
      ] ? "" : "active") + " svelte-gas-xl9y3q");
      attr(div, "alt", localize("AltText.Roll"));
      attr(td4, "class", "center svelte-gas-xl9y3q");
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td0);
      append(td0, t0);
      append(tr, td1);
      append(td1, input);
      if (if_block0) if_block0.m(td1, null);
      if (if_block1) if_block1.m(tr, null);
      append(tr, td2);
      append(td2, span0);
      append(span0, t1);
      append(tr, td3);
      if (if_block2) if_block2.m(td3, null);
      append(td3, span1);
      append(span1, t2);
      append(tr, td4);
      append(td4, div);
      append(div, i);
      if (!mounted) {
        dispose = listen(div, "click", function() {
          if (is_function(
            /*roll*/
            ctx[9](
              /*ability*/
              ctx[18][0]
            )
          )) ctx[9](
            /*ability*/
            ctx[18][0]
          ).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*systemAbilitiesArray*/
      4 && t0_value !== (t0_value = /*ability*/
      ctx[18][1].label + "")) set_data(t0, t0_value);
      if (dirty & /*scoreClass*/
      16 && input_class_value !== (input_class_value = "small mainscore " + /*scoreClass*/
      ctx[4] + " svelte-gas-xl9y3q")) {
        attr(input, "class", input_class_value);
      }
      if (dirty & /*$doc, systemAbilitiesArray*/
      68 && input_value_value !== (input_value_value = /*$doc*/
      ctx[6].system.abilities[
        /*ability*/
        ctx[18][0]
      ]?.value) && input.value !== input_value_value) {
        input.value = input_value_value;
      }
      if (dirty & /*systemAbilitiesArray*/
      4 && input_name_value !== (input_name_value = /*ability*/
      ctx[18][0])) {
        attr(input, "name", input_name_value);
      }
      if (dirty & /*systemAbilitiesArray*/
      4 && input_id_value !== (input_id_value = /*ability*/
      ctx[18][0])) {
        attr(input, "id", input_id_value);
      }
      if (
        /*allowMove*/
        ctx[0] && /*allRolled*/
        ctx[1]
      ) {
        if (if_block0) {
          if_block0.p(ctx, dirty);
        } else {
          if_block0 = create_if_block_3(ctx);
          if_block0.c();
          if_block0.m(td1, null);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (window.GAS.dnd5eRules == "2014") if_block1.p(ctx, dirty);
      if (dirty & /*abilityAdvancements, systemAbilitiesArray, $doc*/
      100 && t1_value !== (t1_value = (Number(
        /*abilityAdvancements*/
        ctx[5]?.[
          /*ability*/
          ctx[18][0]
        ]
      ) || 0) + Number(
        /*$doc*/
        ctx[6].system.abilities[
          /*ability*/
          ctx[18][0]
        ]?.value || 0
      ) + "")) set_data(t1, t1_value);
      if (dirty & /*$doc, systemAbilitiesArray, abilityAdvancements*/
      100) show_if = dnd5eModCalc(Number(
        /*$doc*/
        ctx[6].system.abilities[
          /*ability*/
          ctx[18][0]
        ]?.value
      ) + (Number(
        /*abilityAdvancements*/
        ctx[5]?.[
          /*ability*/
          ctx[18][0]
        ]
      ) || 0)) > 0;
      if (show_if) {
        if (if_block2) ;
        else {
          if_block2 = create_if_block();
          if_block2.c();
          if_block2.m(td3, span1);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (dirty & /*$doc, systemAbilitiesArray, abilityAdvancements*/
      100 && t2_value !== (t2_value = dnd5eModCalc(Number(
        /*$doc*/
        ctx[6].system.abilities[
          /*ability*/
          ctx[18][0]
        ]?.value
      ) + (Number(
        /*abilityAdvancements*/
        ctx[5]?.[
          /*ability*/
          ctx[18][0]
        ]
      ) || 0)) + "")) set_data(t2, t2_value);
      if (dirty & /*$abilityRolls, systemAbilitiesArray*/
      12 && div_class_value !== (div_class_value = "buttons " + /*$abilityRolls*/
      (ctx[3][
        /*ability*/
        ctx[18][0]
      ] ? "" : "active") + " svelte-gas-xl9y3q")) {
        attr(div, "class", div_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(tr);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      if (if_block2) if_block2.d();
      mounted = false;
      dispose();
    }
  };
}
function create_fragment(ctx) {
  let div;
  let table;
  let thead;
  let tr;
  let th0;
  let th1;
  let th2;
  let th3;
  let th4;
  let tbody;
  let if_block = window.GAS.dnd5eRules == "2014" && create_if_block_6();
  let each_value = ensure_array_like(
    /*systemAbilitiesArray*/
    ctx[2]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  return {
    c() {
      div = element("div");
      table = element("table");
      thead = element("thead");
      tr = element("tr");
      th0 = element("th");
      th0.textContent = "Ability";
      th1 = element("th");
      th1.textContent = "Base";
      if (if_block) if_block.c();
      th2 = element("th");
      th2.textContent = "Score";
      th3 = element("th");
      th3.textContent = "Mod";
      th4 = element("th");
      tbody = element("tbody");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(th0, "class", "ability svelte-gas-xl9y3q");
      attr(th1, "class", "center svelte-gas-xl9y3q");
      attr(th2, "class", "center svelte-gas-xl9y3q");
      attr(th3, "class", "center svelte-gas-xl9y3q");
      attr(th4, "class", "center roll-col svelte-gas-xl9y3q");
      attr(table, "class", "svelte-gas-xl9y3q");
      attr(div, "class", "attribute-entry mt-sm");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, table);
      append(table, thead);
      append(thead, tr);
      append(tr, th0);
      append(tr, th1);
      if (if_block) if_block.m(tr, null);
      append(tr, th2);
      append(tr, th3);
      append(tr, th4);
      append(table, tbody);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(tbody, null);
        }
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*$abilityRolls, systemAbilitiesArray, roll, Number, $doc, abilityAdvancements, window, swapAbilities, allowMove, allRolled, scoreClass*/
      895) {
        each_value = ensure_array_like(
          /*systemAbilitiesArray*/
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
            each_blocks[i].m(tbody, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div);
      }
      if (if_block) if_block.d();
      destroy_each(each_blocks, detaching);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let systemAbilities;
  let systemAbilitiesArray;
  let abilityAdvancements;
  let allRolled;
  let scoreClass;
  let $abilityRolls;
  let $race;
  let $doc;
  component_subscribe($$self, abilityRolls, ($$value) => $$invalidate(3, $abilityRolls = $$value));
  component_subscribe($$self, race, ($$value) => $$invalidate(12, $race = $$value));
  let { document = false } = $$props;
  createEventDispatcher();
  const doc = document || getContext("#doc");
  component_subscribe($$self, doc, (value) => $$invalidate(6, $doc = value));
  Timing.debounce(updateValue, 100);
  let formula, allowMove;
  async function updateValue(attr2, event) {
    if (event.target.value < 8) return false;
    if (event.target.value > 15) return false;
    const options = {
      system: {
        abilities: {
          [attr2]: { value: Number(event.target.value) }
        }
      }
    };
    await $doc.updateSource(options);
    if ($doc.render) {
      $doc.render();
    }
  }
  async function swapAbilities(attr2, direction) {
    const abilities = Object.keys($doc.system.abilities);
    const index = abilities.indexOf(attr2);
    if (direction === 1 && index > 0) {
      const prevAbility = abilities[index - 1];
      const options = {
        system: {
          abilities: {
            [attr2]: {
              value: $doc.system.abilities[prevAbility].value
            },
            [prevAbility]: { value: $doc.system.abilities[attr2].value }
          }
        }
      };
      await $doc.updateSource(options);
      if ($doc.render) {
        $doc.render();
      }
    } else if (direction === -1 && index < abilities.length - 1) {
      const nextAbility = abilities[index + 1];
      const options = {
        system: {
          abilities: {
            [attr2]: {
              value: $doc.system.abilities[nextAbility].value
            },
            [nextAbility]: { value: $doc.system.abilities[attr2].value }
          }
        }
      };
      await $doc.updateSource(options);
      if ($doc.render) {
        $doc.render();
      }
    }
  }
  async function roll(attr2) {
    const roll2 = await new Roll(formula).evaluate();
    await roll2.toMessage();
    set_store_value(abilityRolls, $abilityRolls = !$abilityRolls ? {} : $abilityRolls, $abilityRolls);
    set_store_value(abilityRolls, $abilityRolls[attr2] = roll2.total, $abilityRolls);
    const options = {
      system: {
        abilities: { [attr2]: { value: Number(roll2.total) } }
      }
    };
    await $doc.updateSource(options);
    if ($doc.render) {
      $doc.render();
    }
  }
  onMount(async () => {
    formula = game.settings.get(MODULE_ID, "abiiltyRollFormula");
    $$invalidate(0, allowMove = game.settings.get(MODULE_ID, "allowAbilityRollScoresToBeMoved"));
  });
  $$self.$$set = ($$props2) => {
    if ("document" in $$props2) $$invalidate(10, document = $$props2.document);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*systemAbilities*/
    2048) {
      $$invalidate(2, systemAbilitiesArray = Object.entries(systemAbilities));
    }
    if ($$self.$$.dirty & /*$race*/
    4096) {
      $$invalidate(5, abilityAdvancements = $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration?.fixed);
    }
    if ($$self.$$.dirty & /*systemAbilitiesArray, $abilityRolls*/
    12) {
      $$invalidate(1, allRolled = systemAbilitiesArray.every((ability) => $abilityRolls[ability[0]] !== void 0));
    }
    if ($$self.$$.dirty & /*allowMove, allRolled*/
    3) {
      $$invalidate(4, scoreClass = allowMove && allRolled ? "left" : "center");
    }
  };
  $$invalidate(11, systemAbilities = game.system.config.abilities);
  return [
    allowMove,
    allRolled,
    systemAbilitiesArray,
    $abilityRolls,
    scoreClass,
    abilityAdvancements,
    $doc,
    doc,
    swapAbilities,
    roll,
    document,
    systemAbilities,
    $race
  ];
}
class Roll_1 extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { document: 10 });
  }
}
export {
  Roll_1 as default
};
//# sourceMappingURL=Roll-DQsV4fP6.js.map
