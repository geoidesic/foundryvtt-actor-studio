import { S as SvelteComponent, i as init, s as safe_not_equal, z as ensure_array_like, e as element, b as attr, c as insert, d as append, A as noop, j as detach, B as destroy_each, k as component_subscribe, aC as abilityRolls, ap as race, az as createEventDispatcher, n as getContext, o as onMount, M as MODULE_ID, F as text, X as listen, a8 as is_function, G as set_data, y as set_store_value } from "./index-CGii35e1.js";
/* empty css                                                     */
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[17] = list[i];
  child_ctx[19] = i;
  return child_ctx;
}
function create_if_block_4(ctx) {
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
function create_if_block_1(ctx) {
  let div2;
  let div0;
  let div1;
  let if_block0 = (
    /*index*/
    ctx[19] != 0 && create_if_block_3(ctx)
  );
  let if_block1 = (
    /*index*/
    ctx[19] != /*systemAbilitiesArray*/
    ctx[0].length - 1 && create_if_block_2(ctx)
  );
  return {
    c() {
      div2 = element("div");
      div0 = element("div");
      if (if_block0) if_block0.c();
      div1 = element("div");
      if (if_block1) if_block1.c();
      attr(div0, "class", "up chevron svelte-gas-j2qp2k");
      attr(div1, "class", "down chevron svelte-gas-j2qp2k");
      attr(div2, "class", "controls svelte-gas-j2qp2k");
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
        ctx2[19] != 0
      ) if_block0.p(ctx2, dirty);
      if (
        /*index*/
        ctx2[19] != /*systemAbilitiesArray*/
        ctx2[0].length - 1
      ) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block_2(ctx2);
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
function create_if_block_3(ctx) {
  let i;
  let mounted;
  let dispose;
  return {
    c() {
      i = element("i");
      attr(i, "class", "fas fa-chevron-up");
      attr(i, "alt", "Move Up");
    },
    m(target, anchor) {
      insert(target, i, anchor);
      if (!mounted) {
        dispose = listen(i, "click", function() {
          if (is_function(
            /*swapAbilities*/
            ctx[7](
              /*ability*/
              ctx[17][1].abbreviation,
              1
            )
          )) ctx[7](
            /*ability*/
            ctx[17][1].abbreviation,
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
function create_if_block_2(ctx) {
  let i;
  let mounted;
  let dispose;
  return {
    c() {
      i = element("i");
      attr(i, "class", "fas fa-chevron-down");
      attr(i, "alt", "Move Down");
    },
    m(target, anchor) {
      insert(target, i, anchor);
      if (!mounted) {
        dispose = listen(i, "click", function() {
          if (is_function(
            /*swapAbilities*/
            ctx[7](
              /*ability*/
              ctx[17][1].abbreviation,
              -1
            )
          )) ctx[7](
            /*ability*/
            ctx[17][1].abbreviation,
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
    ctx[17][1].label + ""
  );
  let t0;
  let td1;
  let span0;
  let t1_value = (
    /*abilityAdvancements*/
    (ctx[4]?.[
      /*ability*/
      ctx[17][1].abbreviation
    ] || 0) + ""
  );
  let t1;
  let td2;
  let input;
  let input_class_value;
  let input_value_value;
  let input_name_value;
  let input_id_value;
  let td3;
  let span1;
  let t2_value = (Number(
    /*abilityAdvancements*/
    ctx[4]?.[
      /*ability*/
      ctx[17][1].abbreviation
    ]
  ) || 0) + Number(
    /*$doc*/
    ctx[5].system.abilities[
      /*ability*/
      ctx[17][1].abbreviation
    ]?.value || 0
  ) + "";
  let t2;
  let td4;
  let span2;
  let t3_value = (
    /*$doc*/
    ctx[5].system.abilities[
      /*ability*/
      ctx[17][1].abbreviation
    ]?.mod + ""
  );
  let t3;
  let td5;
  let div;
  let i;
  let div_class_value;
  let mounted;
  let dispose;
  let if_block0 = (
    /*abilityAdvancements*/
    ctx[4]?.[
      /*ability*/
      ctx[17][1].abbreviation
    ] > 0 && create_if_block_4()
  );
  let if_block1 = (
    /*allowMove*/
    ctx[2] && /*allRolled*/
    ctx[3] && create_if_block_1(ctx)
  );
  let if_block2 = (
    /*$doc*/
    ctx[5].system.abilities[
      /*ability*/
      ctx[17][1].abbreviation
    ]?.mod > 0 && create_if_block()
  );
  return {
    c() {
      tr = element("tr");
      td0 = element("td");
      t0 = text(t0_value);
      td1 = element("td");
      if (if_block0) if_block0.c();
      span0 = element("span");
      t1 = text(t1_value);
      td2 = element("td");
      input = element("input");
      if (if_block1) if_block1.c();
      td3 = element("td");
      span1 = element("span");
      t2 = text(t2_value);
      td4 = element("td");
      if (if_block2) if_block2.c();
      span2 = element("span");
      t3 = text(t3_value);
      td5 = element("td");
      div = element("div");
      i = element("i");
      attr(td0, "class", "ability svelte-gas-j2qp2k");
      attr(td1, "class", "center svelte-gas-j2qp2k");
      attr(input, "class", input_class_value = "small mainscore " + /*allowMove*/
      (ctx[2] ? "left" : "center") + " svelte-gas-j2qp2k");
      input.disabled = true;
      attr(input, "type", "number");
      input.value = input_value_value = /*$doc*/
      ctx[5].system.abilities[
        /*ability*/
        ctx[17][1].abbreviation
      ]?.value;
      attr(input, "name", input_name_value = /*ability*/
      ctx[17][1].abbreviation);
      attr(input, "id", input_id_value = /*ability*/
      ctx[17][1].abbreviation);
      attr(td2, "class", "center relative svelte-gas-j2qp2k");
      attr(td3, "class", "center svelte-gas-j2qp2k");
      attr(td4, "class", "center svelte-gas-j2qp2k");
      attr(i, "class", "fas fa-dice");
      attr(div, "class", div_class_value = "buttons " + /*$abilityRolls*/
      (ctx[1][
        /*ability*/
        ctx[17][1].abbreviation
      ] ? "" : "active") + " svelte-gas-j2qp2k");
      attr(div, "alt", "Roll");
      attr(td5, "class", "center svelte-gas-j2qp2k");
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td0);
      append(td0, t0);
      append(tr, td1);
      if (if_block0) if_block0.m(td1, null);
      append(td1, span0);
      append(span0, t1);
      append(tr, td2);
      append(td2, input);
      if (if_block1) if_block1.m(td2, null);
      append(tr, td3);
      append(td3, span1);
      append(span1, t2);
      append(tr, td4);
      if (if_block2) if_block2.m(td4, null);
      append(td4, span2);
      append(span2, t3);
      append(tr, td5);
      append(td5, div);
      append(div, i);
      if (!mounted) {
        dispose = listen(div, "click", function() {
          if (is_function(
            /*roll*/
            ctx[8](
              /*ability*/
              ctx[17][1].abbreviation
            )
          )) ctx[8](
            /*ability*/
            ctx[17][1].abbreviation
          ).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*systemAbilitiesArray*/
      1 && t0_value !== (t0_value = /*ability*/
      ctx[17][1].label + "")) set_data(t0, t0_value);
      if (
        /*abilityAdvancements*/
        ctx[4]?.[
          /*ability*/
          ctx[17][1].abbreviation
        ] > 0
      ) {
        if (if_block0) ;
        else {
          if_block0 = create_if_block_4();
          if_block0.c();
          if_block0.m(td1, span0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty & /*abilityAdvancements, systemAbilitiesArray*/
      17 && t1_value !== (t1_value = /*abilityAdvancements*/
      (ctx[4]?.[
        /*ability*/
        ctx[17][1].abbreviation
      ] || 0) + "")) set_data(t1, t1_value);
      if (dirty & /*allowMove*/
      4 && input_class_value !== (input_class_value = "small mainscore " + /*allowMove*/
      (ctx[2] ? "left" : "center") + " svelte-gas-j2qp2k")) {
        attr(input, "class", input_class_value);
      }
      if (dirty & /*$doc, systemAbilitiesArray*/
      33 && input_value_value !== (input_value_value = /*$doc*/
      ctx[5].system.abilities[
        /*ability*/
        ctx[17][1].abbreviation
      ]?.value) && input.value !== input_value_value) {
        input.value = input_value_value;
      }
      if (dirty & /*systemAbilitiesArray*/
      1 && input_name_value !== (input_name_value = /*ability*/
      ctx[17][1].abbreviation)) {
        attr(input, "name", input_name_value);
      }
      if (dirty & /*systemAbilitiesArray*/
      1 && input_id_value !== (input_id_value = /*ability*/
      ctx[17][1].abbreviation)) {
        attr(input, "id", input_id_value);
      }
      if (
        /*allowMove*/
        ctx[2] && /*allRolled*/
        ctx[3]
      ) {
        if (if_block1) {
          if_block1.p(ctx, dirty);
        } else {
          if_block1 = create_if_block_1(ctx);
          if_block1.c();
          if_block1.m(td2, null);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (dirty & /*abilityAdvancements, systemAbilitiesArray, $doc*/
      49 && t2_value !== (t2_value = (Number(
        /*abilityAdvancements*/
        ctx[4]?.[
          /*ability*/
          ctx[17][1].abbreviation
        ]
      ) || 0) + Number(
        /*$doc*/
        ctx[5].system.abilities[
          /*ability*/
          ctx[17][1].abbreviation
        ]?.value || 0
      ) + "")) set_data(t2, t2_value);
      if (
        /*$doc*/
        ctx[5].system.abilities[
          /*ability*/
          ctx[17][1].abbreviation
        ]?.mod > 0
      ) {
        if (if_block2) ;
        else {
          if_block2 = create_if_block();
          if_block2.c();
          if_block2.m(td4, span2);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
      if (dirty & /*$doc, systemAbilitiesArray*/
      33 && t3_value !== (t3_value = /*$doc*/
      ctx[5].system.abilities[
        /*ability*/
        ctx[17][1].abbreviation
      ]?.mod + "")) set_data(t3, t3_value);
      if (dirty & /*$abilityRolls, systemAbilitiesArray*/
      3 && div_class_value !== (div_class_value = "buttons " + /*$abilityRolls*/
      (ctx[1][
        /*ability*/
        ctx[17][1].abbreviation
      ] ? "" : "active") + " svelte-gas-j2qp2k")) {
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
  let tbody;
  let each_value = ensure_array_like(
    /*systemAbilitiesArray*/
    ctx[0]
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
      thead.innerHTML = `<tr><th class="ability svelte-gas-j2qp2k">Ability</th><th class="center svelte-gas-j2qp2k">Race / Feat</th><th class="center svelte-gas-j2qp2k">Base Score</th><th class="center svelte-gas-j2qp2k">Score</th><th class="center svelte-gas-j2qp2k">Mod</th><th class="center roll-col svelte-gas-j2qp2k"></th></tr>`;
      tbody = element("tbody");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(table, "class", "svelte-gas-j2qp2k");
      attr(div, "class", "attribute-entry mt-sm");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, table);
      append(table, thead);
      append(table, tbody);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(tbody, null);
        }
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*$abilityRolls, systemAbilitiesArray, roll, $doc, Number, abilityAdvancements, swapAbilities, allowMove, allRolled*/
      447) {
        each_value = ensure_array_like(
          /*systemAbilitiesArray*/
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
      destroy_each(each_blocks, detaching);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let systemAbilities;
  let systemAbilitiesArray;
  let abilityAdvancements;
  let allRolled;
  let $abilityRolls;
  let $race;
  let $doc;
  component_subscribe($$self, abilityRolls, ($$value) => $$invalidate(1, $abilityRolls = $$value));
  component_subscribe($$self, race, ($$value) => $$invalidate(11, $race = $$value));
  let { document = false } = $$props;
  createEventDispatcher();
  const doc = document || getContext("#doc");
  component_subscribe($$self, doc, (value) => $$invalidate(5, $doc = value));
  let formula, allowMove;
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
      doc.set($doc);
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
      doc.set($doc);
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
    $doc.updateSource(options);
    doc.set($doc);
  }
  onMount(async () => {
    formula = game.settings.get(MODULE_ID, "abiiltyRollFormula");
    $$invalidate(2, allowMove = game.settings.get(MODULE_ID, "allowAbilityRollScoresToBeMoved"));
    window.GAS.log.d("systemAbilitiesArray", systemAbilitiesArray);
  });
  $$self.$$set = ($$props2) => {
    if ("document" in $$props2) $$invalidate(9, document = $$props2.document);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*systemAbilities*/
    1024) {
      $$invalidate(0, systemAbilitiesArray = Object.entries(systemAbilities));
    }
    if ($$self.$$.dirty & /*$race*/
    2048) {
      $$invalidate(4, abilityAdvancements = $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration?.fixed);
    }
    if ($$self.$$.dirty & /*systemAbilitiesArray, $abilityRolls*/
    3) {
      $$invalidate(3, allRolled = systemAbilitiesArray.every((ability) => $abilityRolls[ability[1].abbreviation] !== void 0));
    }
  };
  $$invalidate(10, systemAbilities = game.system.config.abilities);
  return [
    systemAbilitiesArray,
    $abilityRolls,
    allowMove,
    allRolled,
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
    init(this, options, instance, create_fragment, safe_not_equal, { document: 9 });
  }
}
export {
  Roll_1 as default
};
//# sourceMappingURL=Roll-B1qy8_S5.js.map
