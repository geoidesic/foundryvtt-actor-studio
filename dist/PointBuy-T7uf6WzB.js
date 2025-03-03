import { S as SvelteComponent, i as init, s as safe_not_equal, z as ensure_array_like, e as element, b as attr, c as insert, d as append, A as noop, j as detach, B as destroy_each, k as component_subscribe, aB as pointBuy, ap as race, aC as abilityRolls, az as createEventDispatcher, n as getContext, o as onMount, aD as POINT_BUY_COSTS, y as set_store_value, M as MODULE_ID, F as text, X as listen, a8 as is_function, G as set_data, a1 as run_all, aA as Timing, l as localize } from "./index-C6J-vQyN.js";
/* empty css                                                     */
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[18] = list[i];
  child_ctx[20] = i;
  return child_ctx;
}
function create_if_block_3(ctx) {
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
function create_each_block(ctx) {
  let tr;
  let td0;
  let t0_value = (
    /*ability*/
    ctx[18][1].label + ""
  );
  let t0;
  let td1;
  let span0;
  let t1_value = (
    /*abilityAdvancements*/
    (ctx[5]?.[
      /*ability*/
      ctx[18][1].abbreviation
    ] || 0) + ""
  );
  let t1;
  let td2;
  let input;
  let input_value_value;
  let input_name_value;
  let input_id_value;
  let div2;
  let div0;
  let i0;
  let div1;
  let i1;
  let td3;
  let t2_value = (Number(
    /*abilityAdvancements*/
    ctx[5]?.[
      /*ability*/
      ctx[18][1].abbreviation
    ]
  ) || 0) + Number(
    /*$doc*/
    ctx[3].system.abilities[
      /*ability*/
      ctx[18][1].abbreviation
    ]?.value || 0
  ) + "";
  let t2;
  let td4;
  let span1;
  let t3_value = (
    /*$doc*/
    ctx[3].system.abilities[
      /*ability*/
      ctx[18][1].abbreviation
    ]?.mod + ""
  );
  let t3;
  let mounted;
  let dispose;
  let if_block0 = (
    /*abilityAdvancements*/
    ctx[5]?.[
      /*ability*/
      ctx[18][1].abbreviation
    ] > 0 && create_if_block_3()
  );
  let if_block1 = (
    /*$doc*/
    ctx[3].system.abilities[
      /*ability*/
      ctx[18][1].abbreviation
    ]?.mod > 0 && create_if_block_2()
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
      div2 = element("div");
      div0 = element("div");
      i0 = element("i");
      div1 = element("div");
      i1 = element("i");
      td3 = element("td");
      t2 = text(t2_value);
      td4 = element("td");
      if (if_block1) if_block1.c();
      span1 = element("span");
      t3 = text(t3_value);
      attr(td0, "class", "ability svelte-gas-2vq1qu");
      attr(td1, "class", "center svelte-gas-2vq1qu");
      attr(input, "class", "left small mainscore svelte-gas-2vq1qu");
      input.disabled = true;
      attr(input, "type", "number");
      input.value = input_value_value = /*$doc*/
      ctx[3].system.abilities[
        /*ability*/
        ctx[18][1].abbreviation
      ]?.value;
      attr(input, "name", input_name_value = /*ability*/
      ctx[18][1].abbreviation);
      attr(input, "id", input_id_value = /*ability*/
      ctx[18][1].abbreviation);
      attr(i0, "class", "fas fa-chevron-up");
      attr(i0, "alt", "Decrease");
      attr(div0, "class", "up chevron svelte-gas-2vq1qu");
      attr(i1, "class", "fas fa-chevron-down");
      attr(i1, "alt", "Increase");
      attr(div1, "class", "down chevron svelte-gas-2vq1qu");
      attr(div2, "class", "controls svelte-gas-2vq1qu");
      attr(td2, "class", "center relative svelte-gas-2vq1qu");
      attr(td3, "class", "center svelte-gas-2vq1qu");
      attr(td4, "class", "center svelte-gas-2vq1qu");
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
      append(td2, div2);
      append(div2, div0);
      append(div0, i0);
      append(div2, div1);
      append(div1, i1);
      append(tr, td3);
      append(td3, t2);
      append(tr, td4);
      if (if_block1) if_block1.m(td4, null);
      append(td4, span1);
      append(span1, t3);
      if (!mounted) {
        dispose = [
          listen(i0, "click", function() {
            if (is_function(
              /*updateDebounce*/
              ctx[7](
                /*ability*/
                ctx[18][1].abbreviation,
                {
                  target: {
                    value: Number(
                      /*$doc*/
                      ctx[3].system.abilities[
                        /*ability*/
                        ctx[18][1].abbreviation
                      ]?.value
                    ) + 1
                  }
                }
              )
            )) ctx[7](
              /*ability*/
              ctx[18][1].abbreviation,
              {
                target: {
                  value: Number(
                    /*$doc*/
                    ctx[3].system.abilities[
                      /*ability*/
                      ctx[18][1].abbreviation
                    ]?.value
                  ) + 1
                }
              }
            ).apply(this, arguments);
          }),
          listen(i1, "click", function() {
            if (is_function(
              /*updateDebounce*/
              ctx[7](
                /*ability*/
                ctx[18][1].abbreviation,
                {
                  target: {
                    value: Number(
                      /*$doc*/
                      ctx[3].system.abilities[
                        /*ability*/
                        ctx[18][1].abbreviation
                      ]?.value
                    ) - 1
                  }
                }
              )
            )) ctx[7](
              /*ability*/
              ctx[18][1].abbreviation,
              {
                target: {
                  value: Number(
                    /*$doc*/
                    ctx[3].system.abilities[
                      /*ability*/
                      ctx[18][1].abbreviation
                    ]?.value
                  ) - 1
                }
              }
            ).apply(this, arguments);
          })
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*systemAbilitiesArray*/
      4 && t0_value !== (t0_value = /*ability*/
      ctx[18][1].label + "")) set_data(t0, t0_value);
      if (
        /*abilityAdvancements*/
        ctx[5]?.[
          /*ability*/
          ctx[18][1].abbreviation
        ] > 0
      ) {
        if (if_block0) ;
        else {
          if_block0 = create_if_block_3();
          if_block0.c();
          if_block0.m(td1, span0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty & /*abilityAdvancements, systemAbilitiesArray*/
      36 && t1_value !== (t1_value = /*abilityAdvancements*/
      (ctx[5]?.[
        /*ability*/
        ctx[18][1].abbreviation
      ] || 0) + "")) set_data(t1, t1_value);
      if (dirty & /*$doc, systemAbilitiesArray*/
      12 && input_value_value !== (input_value_value = /*$doc*/
      ctx[3].system.abilities[
        /*ability*/
        ctx[18][1].abbreviation
      ]?.value) && input.value !== input_value_value) {
        input.value = input_value_value;
      }
      if (dirty & /*systemAbilitiesArray*/
      4 && input_name_value !== (input_name_value = /*ability*/
      ctx[18][1].abbreviation)) {
        attr(input, "name", input_name_value);
      }
      if (dirty & /*systemAbilitiesArray*/
      4 && input_id_value !== (input_id_value = /*ability*/
      ctx[18][1].abbreviation)) {
        attr(input, "id", input_id_value);
      }
      if (dirty & /*abilityAdvancements, systemAbilitiesArray, $doc*/
      44 && t2_value !== (t2_value = (Number(
        /*abilityAdvancements*/
        ctx[5]?.[
          /*ability*/
          ctx[18][1].abbreviation
        ]
      ) || 0) + Number(
        /*$doc*/
        ctx[3].system.abilities[
          /*ability*/
          ctx[18][1].abbreviation
        ]?.value || 0
      ) + "")) set_data(t2, t2_value);
      if (
        /*$doc*/
        ctx[3].system.abilities[
          /*ability*/
          ctx[18][1].abbreviation
        ]?.mod > 0
      ) {
        if (if_block1) ;
        else {
          if_block1 = create_if_block_2();
          if_block1.c();
          if_block1.m(td4, span1);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (dirty & /*$doc, systemAbilitiesArray*/
      12 && t3_value !== (t3_value = /*$doc*/
      ctx[3].system.abilities[
        /*ability*/
        ctx[18][1].abbreviation
      ]?.mod + "")) set_data(t3, t3_value);
    },
    d(detaching) {
      if (detaching) {
        detach(tr);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_else_block(ctx) {
  let input;
  let input_class_value;
  return {
    c() {
      input = element("input");
      attr(input, "class", input_class_value = "score center small " + /*pointBuyClass*/
      ctx[4] + " svelte-gas-2vq1qu");
      input.disabled = true;
      attr(input, "type", "number");
      input.value = /*scoreTotal*/
      ctx[1];
    },
    m(target, anchor) {
      insert(target, input, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & /*pointBuyClass*/
      16 && input_class_value !== (input_class_value = "score center small " + /*pointBuyClass*/
      ctx2[4] + " svelte-gas-2vq1qu")) {
        attr(input, "class", input_class_value);
      }
      if (dirty & /*scoreTotal*/
      2 && input.value !== /*scoreTotal*/
      ctx2[1]) {
        input.value = /*scoreTotal*/
        ctx2[1];
      }
    },
    d(detaching) {
      if (detaching) {
        detach(input);
      }
    }
  };
}
function create_if_block_1(ctx) {
  let span;
  return {
    c() {
      span = element("span");
      span.textContent = "N/A";
      attr(span, "class", "red svelte-gas-2vq1qu");
      attr(span, "data-tooltip", localize("GAS.Setting.AbilityEntry.AllowPointBuy.InvalidTotal"));
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
function create_if_block(ctx) {
  let tr;
  let td;
  let hr;
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      tr = element("tr");
      td = element("td");
      hr = element("hr");
      button = element("button");
      button.textContent = "Reset scores";
      attr(button, "class", "btn btn-primary");
      attr(td, "colspan", "5");
      attr(td, "class", "svelte-gas-2vq1qu");
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td);
      append(td, hr);
      append(td, button);
      if (!mounted) {
        dispose = listen(
          button,
          "click",
          /*reset*/
          ctx[8]
        );
        mounted = true;
      }
    },
    p: noop,
    d(detaching) {
      if (detaching) {
        detach(tr);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_fragment(ctx) {
  let div5;
  let table;
  let thead;
  let tbody;
  let tr1;
  let td;
  let hr;
  let div4;
  let div0;
  let div1;
  let show_if_1;
  let div2;
  let div3;
  let input;
  let show_if = isNaN(
    /*scoreTotal*/
    ctx[1]
  );
  let each_value = ensure_array_like(
    /*systemAbilitiesArray*/
    ctx[2]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  function select_block_type(ctx2, dirty) {
    if (dirty & /*scoreTotal*/
    2) show_if_1 = null;
    if (show_if_1 == null) show_if_1 = !!isNaN(
      /*scoreTotal*/
      ctx2[1]
    );
    if (show_if_1) return create_if_block_1;
    return create_else_block;
  }
  let current_block_type = select_block_type(ctx, -1);
  let if_block0 = current_block_type(ctx);
  let if_block1 = show_if && create_if_block(ctx);
  return {
    c() {
      div5 = element("div");
      table = element("table");
      thead = element("thead");
      thead.innerHTML = `<tr><th class="ability svelte-gas-2vq1qu">Ability</th><th class="center svelte-gas-2vq1qu">Race / Feat</th><th class="center svelte-gas-2vq1qu">Base Score</th><th class="center svelte-gas-2vq1qu">Score</th><th class="center svelte-gas-2vq1qu">Modifier</th></tr>`;
      tbody = element("tbody");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      tr1 = element("tr");
      td = element("td");
      hr = element("hr");
      div4 = element("div");
      div0 = element("div");
      div0.textContent = "Points total: ";
      div1 = element("div");
      if_block0.c();
      div2 = element("div");
      div2.textContent = "/ ";
      div3 = element("div");
      input = element("input");
      if (if_block1) if_block1.c();
      attr(div0, "class", "flex1");
      attr(div1, "class", "flex");
      attr(div2, "class", "flex0");
      attr(input, "class", "center small");
      input.disabled = true;
      attr(input, "type", "number");
      input.value = /*pointBuyLimit*/
      ctx[0];
      attr(div3, "class", "flex1");
      attr(div4, "class", "flexrow justify-flexrow-vertical");
      attr(td, "colspan", "5");
      attr(td, "class", "svelte-gas-2vq1qu");
      attr(table, "class", "svelte-gas-2vq1qu");
      attr(div5, "class", "attribute-entry mt-sm");
    },
    m(target, anchor) {
      insert(target, div5, anchor);
      append(div5, table);
      append(table, thead);
      append(table, tbody);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(tbody, null);
        }
      }
      append(tbody, tr1);
      append(tr1, td);
      append(td, hr);
      append(td, div4);
      append(div4, div0);
      append(div4, div1);
      if_block0.m(div1, null);
      append(div4, div2);
      append(div4, div3);
      append(div3, input);
      if (if_block1) if_block1.m(tbody, null);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*$doc, systemAbilitiesArray, Number, abilityAdvancements, updateDebounce*/
      172) {
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
            each_blocks[i].m(tbody, tr1);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (current_block_type === (current_block_type = select_block_type(ctx2, dirty)) && if_block0) {
        if_block0.p(ctx2, dirty);
      } else {
        if_block0.d(1);
        if_block0 = current_block_type(ctx2);
        if (if_block0) {
          if_block0.c();
          if_block0.m(div1, null);
        }
      }
      if (dirty & /*pointBuyLimit*/
      1 && input.value !== /*pointBuyLimit*/
      ctx2[0]) {
        input.value = /*pointBuyLimit*/
        ctx2[0];
      }
      if (dirty & /*scoreTotal*/
      2) show_if = isNaN(
        /*scoreTotal*/
        ctx2[1]
      );
      if (show_if) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
        } else {
          if_block1 = create_if_block(ctx2);
          if_block1.c();
          if_block1.m(tbody, null);
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
        detach(div5);
      }
      destroy_each(each_blocks, detaching);
      if_block0.d();
      if (if_block1) if_block1.d();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let systemAbilities;
  let systemAbilitiesArray;
  let abilityAdvancements;
  let scoreTotal;
  let pointBuyLimit;
  let activeClass;
  let pointBuyClass;
  let $pointBuy;
  let $doc;
  let $race;
  let $abilityRolls;
  component_subscribe($$self, pointBuy, ($$value) => $$invalidate(14, $pointBuy = $$value));
  component_subscribe($$self, race, ($$value) => $$invalidate(12, $race = $$value));
  component_subscribe($$self, abilityRolls, ($$value) => $$invalidate(15, $abilityRolls = $$value));
  let { document = false } = $$props;
  createEventDispatcher();
  const doc = document || getContext("#doc");
  component_subscribe($$self, doc, (value) => $$invalidate(3, $doc = value));
  const updateDebounce = Timing.debounce(updateValue, 100);
  function updateValue(attr2, event) {
    if (event.target.value < 8) return false;
    if (event.target.value > 15) return false;
    const options = {
      system: {
        abilities: {
          [attr2]: { value: Number(event.target.value) }
        }
      }
    };
    $doc.updateSource(options);
    doc.set($doc);
  }
  function reset() {
    set_store_value(abilityRolls, $abilityRolls = {}, $abilityRolls);
    const options = { system: { abilities: {} } };
    systemAbilitiesArray.forEach((ability) => {
      options.system.abilities[ability[1].abbreviation] = { value: 10 };
    });
    $doc.updateSource(options);
    doc.set($doc);
  }
  onMount(async () => {
  });
  $$self.$$set = ($$props2) => {
    if ("document" in $$props2) $$invalidate(9, document = $$props2.document);
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
    if ($$self.$$.dirty & /*systemAbilitiesArray, $doc*/
    12) {
      $$invalidate(1, scoreTotal = systemAbilitiesArray.reduce((acc, ability) => acc + POINT_BUY_COSTS[Number($doc.system.abilities[ability[1].abbreviation]?.value)], 0));
    }
    if ($$self.$$.dirty & /*scoreTotal, pointBuyLimit*/
    3) {
      $$invalidate(10, activeClass = scoreTotal !== pointBuyLimit ? " active" : "");
    }
    if ($$self.$$.dirty & /*scoreTotal, pointBuyLimit, activeClass*/
    1027) {
      $$invalidate(4, pointBuyClass = scoreTotal > pointBuyLimit ? "red" + activeClass : "green" + activeClass);
    }
    if ($$self.$$.dirty & /*scoreTotal, pointBuyLimit*/
    3) {
      set_store_value(pointBuy, $pointBuy = { scoreTotal, pointBuyLimit }, $pointBuy);
    }
  };
  $$invalidate(11, systemAbilities = game.system.config.abilities);
  $$invalidate(0, pointBuyLimit = game.settings.get(MODULE_ID, "pointBuyLimit"));
  return [
    pointBuyLimit,
    scoreTotal,
    systemAbilitiesArray,
    $doc,
    pointBuyClass,
    abilityAdvancements,
    doc,
    updateDebounce,
    reset,
    document,
    activeClass,
    systemAbilities,
    $race
  ];
}
class PointBuy extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { document: 9 });
  }
}
export {
  PointBuy as default
};
//# sourceMappingURL=PointBuy-T7uf6WzB.js.map
