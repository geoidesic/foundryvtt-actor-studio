import { S as SvelteComponent, i as init, s as safe_not_equal, B as ensure_array_like, C as noop, k as detach, D as destroy_each, q as insert, u as append, v as element, x as attr, b as component_subscribe, bB as pointBuyLimit, bC as pointBuyScoreTotal, b6 as race, bD as abilityRolls, bz as createEventDispatcher, g as getContext, bA as Timing, j as set_store_value, o as onMount, bE as POINT_BUY_COSTS, bF as dnd5eModCalc, a3 as run_all, F as set_data, a5 as listen, ad as is_function, G as text, l as localize } from "./index-vMRrMX6I.js";
/* empty css                                                     */
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[18] = list[i];
  child_ctx[20] = i;
  return child_ctx;
}
function create_if_block_5(ctx) {
  let th;
  return {
    c() {
      th = element("th");
      th.textContent = "Origin";
      attr(th, "class", "center svelte-gas-1jeezag");
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
    ] > 0 && create_if_block_4()
  );
  return {
    c() {
      td = element("td");
      if (if_block) if_block.c();
      span = element("span");
      t_1 = text(t_1_value);
      attr(td, "class", "center svelte-gas-1jeezag");
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
          if_block = create_if_block_4();
          if_block.c();
          if_block.m(td, span);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*abilityAdvancements, systemAbilitiesArray*/
      33 && t_1_value !== (t_1_value = /*abilityAdvancements*/
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
  let input;
  let input_value_value;
  let input_name_value;
  let input_id_value;
  let div2;
  let div0;
  let div1;
  let td2;
  let t1_value = (Number(
    /*abilityAdvancements*/
    ctx[5]?.[
      /*ability*/
      ctx[18][0]
    ]
  ) || 0) + Number(
    /*$doc*/
    ctx[3].system.abilities[
      /*ability*/
      ctx[18][0]
    ]?.value || 0
  ) + "";
  let t1;
  let td3;
  let show_if = dnd5eModCalc(Number(
    /*$doc*/
    ctx[3].system.abilities[
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
  let span;
  let t2_value = dnd5eModCalc(Number(
    /*$doc*/
    ctx[3].system.abilities[
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
  let mounted;
  let dispose;
  let if_block0 = window.GAS.dnd5eRules == "2014" && create_if_block_3(ctx);
  let if_block1 = show_if && create_if_block_2();
  return {
    c() {
      tr = element("tr");
      td0 = element("td");
      t0 = text(t0_value);
      td1 = element("td");
      input = element("input");
      div2 = element("div");
      div0 = element("div");
      div0.innerHTML = `<i class="fas fa-chevron-up" alt="${localize("AltText.Increase")}"></i>`;
      div1 = element("div");
      div1.innerHTML = `<i class="fas fa-chevron-down" alt="${localize("AltText.Decrease")}"></i>`;
      if (if_block0) if_block0.c();
      td2 = element("td");
      t1 = text(t1_value);
      td3 = element("td");
      if (if_block1) if_block1.c();
      span = element("span");
      t2 = text(t2_value);
      attr(td0, "class", "ability svelte-gas-1jeezag");
      attr(input, "class", "left small mainscore svelte-gas-1jeezag");
      input.disabled = true;
      attr(input, "type", "number");
      input.value = input_value_value = /*$doc*/
      ctx[3].system.abilities[
        /*ability*/
        ctx[18][0]
      ]?.value;
      attr(input, "name", input_name_value = /*ability*/
      ctx[18][0]);
      attr(input, "id", input_id_value = /*ability*/
      ctx[18][0]);
      attr(div0, "class", "up chevron svelte-gas-1jeezag");
      attr(div1, "class", "down chevron svelte-gas-1jeezag");
      attr(div2, "class", "controls svelte-gas-1jeezag");
      attr(td1, "class", "center relative svelte-gas-1jeezag");
      attr(td2, "class", "center svelte-gas-1jeezag");
      attr(td3, "class", "center svelte-gas-1jeezag");
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td0);
      append(td0, t0);
      append(tr, td1);
      append(td1, input);
      append(td1, div2);
      append(div2, div0);
      append(div2, div1);
      if (if_block0) if_block0.m(tr, null);
      append(tr, td2);
      append(td2, t1);
      append(tr, td3);
      if (if_block1) if_block1.m(td3, null);
      append(td3, span);
      append(span, t2);
      if (!mounted) {
        dispose = [
          listen(div0, "click", function() {
            if (is_function(
              /*updateDebounce*/
              ctx[7](
                /*ability*/
                ctx[18][0],
                {
                  target: {
                    value: Number(
                      /*$doc*/
                      ctx[3].system.abilities[
                        /*ability*/
                        ctx[18][0]
                      ]?.value
                    ) + 1
                  }
                }
              )
            )) ctx[7](
              /*ability*/
              ctx[18][0],
              {
                target: {
                  value: Number(
                    /*$doc*/
                    ctx[3].system.abilities[
                      /*ability*/
                      ctx[18][0]
                    ]?.value
                  ) + 1
                }
              }
            ).apply(this, arguments);
          }),
          listen(div1, "click", function() {
            if (is_function(
              /*updateDebounce*/
              ctx[7](
                /*ability*/
                ctx[18][0],
                {
                  target: {
                    value: Number(
                      /*$doc*/
                      ctx[3].system.abilities[
                        /*ability*/
                        ctx[18][0]
                      ]?.value
                    ) - 1
                  }
                }
              )
            )) ctx[7](
              /*ability*/
              ctx[18][0],
              {
                target: {
                  value: Number(
                    /*$doc*/
                    ctx[3].system.abilities[
                      /*ability*/
                      ctx[18][0]
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
      1 && t0_value !== (t0_value = /*ability*/
      ctx[18][1].label + "")) set_data(t0, t0_value);
      if (dirty & /*$doc, systemAbilitiesArray*/
      9 && input_value_value !== (input_value_value = /*$doc*/
      ctx[3].system.abilities[
        /*ability*/
        ctx[18][0]
      ]?.value) && input.value !== input_value_value) {
        input.value = input_value_value;
      }
      if (dirty & /*systemAbilitiesArray*/
      1 && input_name_value !== (input_name_value = /*ability*/
      ctx[18][0])) {
        attr(input, "name", input_name_value);
      }
      if (dirty & /*systemAbilitiesArray*/
      1 && input_id_value !== (input_id_value = /*ability*/
      ctx[18][0])) {
        attr(input, "id", input_id_value);
      }
      if (window.GAS.dnd5eRules == "2014") if_block0.p(ctx, dirty);
      if (dirty & /*abilityAdvancements, systemAbilitiesArray, $doc*/
      41 && t1_value !== (t1_value = (Number(
        /*abilityAdvancements*/
        ctx[5]?.[
          /*ability*/
          ctx[18][0]
        ]
      ) || 0) + Number(
        /*$doc*/
        ctx[3].system.abilities[
          /*ability*/
          ctx[18][0]
        ]?.value || 0
      ) + "")) set_data(t1, t1_value);
      if (dirty & /*$doc, systemAbilitiesArray, abilityAdvancements*/
      41) show_if = dnd5eModCalc(Number(
        /*$doc*/
        ctx[3].system.abilities[
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
        if (if_block1) ;
        else {
          if_block1 = create_if_block_2();
          if_block1.c();
          if_block1.m(td3, span);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (dirty & /*$doc, systemAbilitiesArray, abilityAdvancements*/
      41 && t2_value !== (t2_value = dnd5eModCalc(Number(
        /*$doc*/
        ctx[3].system.abilities[
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
      ctx[4] + " svelte-gas-1jeezag");
      input.disabled = true;
      attr(input, "type", "number");
      input.value = /*$pointBuyScoreTotal*/
      ctx[2];
    },
    m(target, anchor) {
      insert(target, input, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & /*pointBuyClass*/
      16 && input_class_value !== (input_class_value = "score center small " + /*pointBuyClass*/
      ctx2[4] + " svelte-gas-1jeezag")) {
        attr(input, "class", input_class_value);
      }
      if (dirty & /*$pointBuyScoreTotal*/
      4 && input.value !== /*$pointBuyScoreTotal*/
      ctx2[2]) {
        input.value = /*$pointBuyScoreTotal*/
        ctx2[2];
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
      attr(span, "class", "red svelte-gas-1jeezag");
      attr(span, "data-tooltip", localize("Setting.AbilityEntry.AllowPointBuy.InvalidTotal"));
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
      attr(td, "class", "svelte-gas-1jeezag");
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
  let tr0;
  let th0;
  let th1;
  let th2;
  let th3;
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
    /*$pointBuyScoreTotal*/
    ctx[2]
  );
  let if_block0 = window.GAS.dnd5eRules == "2014" && create_if_block_5();
  let each_value = ensure_array_like(
    /*systemAbilitiesArray*/
    ctx[0]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  function select_block_type(ctx2, dirty) {
    if (dirty & /*$pointBuyScoreTotal*/
    4) show_if_1 = null;
    if (show_if_1 == null) show_if_1 = !!isNaN(
      /*$pointBuyScoreTotal*/
      ctx2[2]
    );
    if (show_if_1) return create_if_block_1;
    return create_else_block;
  }
  let current_block_type = select_block_type(ctx, -1);
  let if_block1 = current_block_type(ctx);
  let if_block2 = show_if && create_if_block(ctx);
  return {
    c() {
      div5 = element("div");
      table = element("table");
      thead = element("thead");
      tr0 = element("tr");
      th0 = element("th");
      th0.textContent = "Ability";
      th1 = element("th");
      th1.textContent = "Base";
      if (if_block0) if_block0.c();
      th2 = element("th");
      th2.textContent = "Score";
      th3 = element("th");
      th3.textContent = "Modifier";
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
      if_block1.c();
      div2 = element("div");
      div2.textContent = "/ ";
      div3 = element("div");
      input = element("input");
      if (if_block2) if_block2.c();
      attr(th0, "class", "ability svelte-gas-1jeezag");
      attr(th1, "class", "center svelte-gas-1jeezag");
      attr(th2, "class", "center svelte-gas-1jeezag");
      attr(th3, "class", "center svelte-gas-1jeezag");
      attr(div0, "class", "flex1");
      attr(div1, "class", "flex");
      attr(div2, "class", "flex0");
      attr(input, "class", "center small");
      input.disabled = true;
      attr(input, "type", "number");
      input.value = /*$pointBuyLimit*/
      ctx[1];
      attr(div3, "class", "flex1");
      attr(div4, "class", "flexrow justify-flexrow-vertical");
      attr(td, "colspan", "5");
      attr(td, "class", "svelte-gas-1jeezag");
      attr(table, "class", "svelte-gas-1jeezag");
      attr(div5, "class", "attribute-entry mt-sm");
    },
    m(target, anchor) {
      insert(target, div5, anchor);
      append(div5, table);
      append(table, thead);
      append(thead, tr0);
      append(tr0, th0);
      append(tr0, th1);
      if (if_block0) if_block0.m(tr0, null);
      append(tr0, th2);
      append(tr0, th3);
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
      if_block1.m(div1, null);
      append(div4, div2);
      append(div4, div3);
      append(div3, input);
      if (if_block2) if_block2.m(tbody, null);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*Number, $doc, systemAbilitiesArray, abilityAdvancements, window, updateDebounce*/
      169) {
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
            each_blocks[i].m(tbody, tr1);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (current_block_type === (current_block_type = select_block_type(ctx2, dirty)) && if_block1) {
        if_block1.p(ctx2, dirty);
      } else {
        if_block1.d(1);
        if_block1 = current_block_type(ctx2);
        if (if_block1) {
          if_block1.c();
          if_block1.m(div1, null);
        }
      }
      if (dirty & /*$pointBuyLimit*/
      2 && input.value !== /*$pointBuyLimit*/
      ctx2[1]) {
        input.value = /*$pointBuyLimit*/
        ctx2[1];
      }
      if (dirty & /*$pointBuyScoreTotal*/
      4) show_if = isNaN(
        /*$pointBuyScoreTotal*/
        ctx2[2]
      );
      if (show_if) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
        } else {
          if_block2 = create_if_block(ctx2);
          if_block2.c();
          if_block2.m(tbody, null);
        }
      } else if (if_block2) {
        if_block2.d(1);
        if_block2 = null;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div5);
      }
      if (if_block0) if_block0.d();
      destroy_each(each_blocks, detaching);
      if_block1.d();
      if (if_block2) if_block2.d();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let systemAbilities;
  let systemAbilitiesArray;
  let abilityAdvancements;
  let activeCSSClass;
  let pointBuyClass;
  let $pointBuyLimit;
  let $pointBuyScoreTotal;
  let $doc;
  let $race;
  let $abilityRolls;
  component_subscribe($$self, pointBuyLimit, ($$value) => $$invalidate(1, $pointBuyLimit = $$value));
  component_subscribe($$self, pointBuyScoreTotal, ($$value) => $$invalidate(2, $pointBuyScoreTotal = $$value));
  component_subscribe($$self, race, ($$value) => $$invalidate(12, $race = $$value));
  component_subscribe($$self, abilityRolls, ($$value) => $$invalidate(14, $abilityRolls = $$value));
  let { document = false } = $$props;
  createEventDispatcher();
  const doc = document || getContext("#doc");
  component_subscribe($$self, doc, (value) => $$invalidate(3, $doc = value));
  const updateDebounce = Timing.debounce(updateValue, 100);
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
    set_store_value(pointBuyScoreTotal, $pointBuyScoreTotal = systemAbilitiesArray?.reduce((acc, ability) => acc + POINT_BUY_COSTS[Number($doc.system.abilities[ability[0]]?.value)], 0) || 12, $pointBuyScoreTotal);
  }
  async function reset() {
    set_store_value(abilityRolls, $abilityRolls = {}, $abilityRolls);
    const options = { system: { abilities: {} } };
    systemAbilitiesArray.forEach((ability) => {
      options.system.abilities[ability[0]] = { value: 10 };
    });
    await $doc.updateSource(options);
    if ($doc.render) {
      $doc.render();
    }
    set_store_value(pointBuyScoreTotal, $pointBuyScoreTotal = systemAbilitiesArray?.reduce((acc, ability) => acc + POINT_BUY_COSTS[Number($doc.system.abilities[ability[0]]?.value)], 0) || 12, $pointBuyScoreTotal);
  }
  onMount(async () => {
  });
  $$self.$$set = ($$props2) => {
    if ("document" in $$props2) $$invalidate(9, document = $$props2.document);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*systemAbilities*/
    2048) {
      $$invalidate(0, systemAbilitiesArray = Object.entries(systemAbilities));
    }
    if ($$self.$$.dirty & /*$race*/
    4096) {
      $$invalidate(5, abilityAdvancements = $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration?.fixed);
    }
    if ($$self.$$.dirty & /*systemAbilitiesArray, $doc*/
    9) {
      set_store_value(pointBuyScoreTotal, $pointBuyScoreTotal = systemAbilitiesArray?.reduce((acc, ability) => acc + POINT_BUY_COSTS[Number($doc.system.abilities[ability[0]]?.value)], 0) || 12, $pointBuyScoreTotal);
    }
    if ($$self.$$.dirty & /*$pointBuyScoreTotal, $pointBuyLimit*/
    6) {
      $$invalidate(10, activeCSSClass = $pointBuyScoreTotal !== $pointBuyLimit ? " active" : "");
    }
    if ($$self.$$.dirty & /*$pointBuyScoreTotal, $pointBuyLimit, activeCSSClass*/
    1030) {
      $$invalidate(4, pointBuyClass = $pointBuyScoreTotal > $pointBuyLimit ? "red" + activeCSSClass : "green" + activeCSSClass);
    }
  };
  $$invalidate(11, systemAbilities = game.system.config.abilities);
  return [
    systemAbilitiesArray,
    $pointBuyLimit,
    $pointBuyScoreTotal,
    $doc,
    pointBuyClass,
    abilityAdvancements,
    doc,
    updateDebounce,
    reset,
    document,
    activeCSSClass,
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
//# sourceMappingURL=PointBuy-BhIHyWHd.js.map
