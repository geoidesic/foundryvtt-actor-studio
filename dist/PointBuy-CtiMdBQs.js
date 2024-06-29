import { S as SvelteComponent, i as init, s as safe_not_equal, z as ensure_array_like, e as element, b as attr, c as insert, d as append, A as noop, j as detach, B as destroy_each, k as component_subscribe, V as race, a7 as createEventDispatcher, n as getContext, o as onMount, a9 as POINT_BUY_COSTS, M as MODULE_ID, F as text, Z as listen, a5 as is_function, G as set_data, a0 as run_all, a8 as Timing, l as localize } from "./index-DPYYAGzd.js";
import "./Abilities-BA7xNLiT.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[15] = list[i];
  child_ctx[17] = i;
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
  let div8;
  let div0;
  let t0_value = (
    /*ability*/
    ctx[15][1].label + ""
  );
  let t0;
  let div1;
  let span0;
  let t1_value = (
    /*abilityAdvancements*/
    (ctx[5]?.[
      /*ability*/
      ctx[15][1].abbreviation
    ] || 0) + ""
  );
  let t1;
  let div5;
  let input;
  let input_value_value;
  let input_name_value;
  let input_id_value;
  let div4;
  let div2;
  let i0;
  let div3;
  let i1;
  let div6;
  let t2_value = (Number(
    /*abilityAdvancements*/
    ctx[5]?.[
      /*ability*/
      ctx[15][1].abbreviation
    ]
  ) || 0) + Number(
    /*$doc*/
    ctx[3].system.abilities[
      /*ability*/
      ctx[15][1].abbreviation
    ].value
  ) + "";
  let t2;
  let div7;
  let span1;
  let t3_value = (
    /*$doc*/
    ctx[3].system.abilities[
      /*ability*/
      ctx[15][1].abbreviation
    ].mod + ""
  );
  let t3;
  let mounted;
  let dispose;
  let if_block0 = (
    /*abilityAdvancements*/
    ctx[5]?.[
      /*ability*/
      ctx[15][1].abbreviation
    ] > 0 && create_if_block_3()
  );
  let if_block1 = (
    /*$doc*/
    ctx[3].system.abilities[
      /*ability*/
      ctx[15][1].abbreviation
    ].mod > 0 && create_if_block_2()
  );
  return {
    c() {
      div8 = element("div");
      div0 = element("div");
      t0 = text(t0_value);
      div1 = element("div");
      if (if_block0) if_block0.c();
      span0 = element("span");
      t1 = text(t1_value);
      div5 = element("div");
      input = element("input");
      div4 = element("div");
      div2 = element("div");
      i0 = element("i");
      div3 = element("div");
      i1 = element("i");
      div6 = element("div");
      t2 = text(t2_value);
      div7 = element("div");
      if (if_block1) if_block1.c();
      span1 = element("span");
      t3 = text(t3_value);
      attr(div0, "class", "flex2 left");
      attr(div1, "class", "flex1 center align-text-with-input svelte-gas-1i9wvmn");
      attr(input, "class", "left small mainscore svelte-gas-1i9wvmn");
      input.disabled = true;
      attr(input, "type", "number");
      input.value = input_value_value = /*$doc*/
      ctx[3].system.abilities[
        /*ability*/
        ctx[15][1].abbreviation
      ].value;
      attr(input, "name", input_name_value = /*ability*/
      ctx[15][1].abbreviation);
      attr(input, "id", input_id_value = /*ability*/
      ctx[15][1].abbreviation);
      attr(i0, "class", "fas fa-chevron-up");
      attr(i0, "alt", "Decrease");
      attr(div2, "class", "up chevron svelte-gas-1i9wvmn");
      attr(i1, "class", "fas fa-chevron-down");
      attr(i1, "alt", "Increase");
      attr(div3, "class", "down chevron svelte-gas-1i9wvmn");
      attr(div4, "class", "controls svelte-gas-1i9wvmn");
      attr(div5, "class", "flex1 center relative");
      attr(div6, "class", "flex1 center align-text-with-input svelte-gas-1i9wvmn");
      attr(div7, "class", "flex1 center align-text-with-input svelte-gas-1i9wvmn");
      attr(div8, "class", "flexrow mb-sm");
    },
    m(target, anchor) {
      insert(target, div8, anchor);
      append(div8, div0);
      append(div0, t0);
      append(div8, div1);
      if (if_block0) if_block0.m(div1, null);
      append(div1, span0);
      append(span0, t1);
      append(div8, div5);
      append(div5, input);
      append(div5, div4);
      append(div4, div2);
      append(div2, i0);
      append(div4, div3);
      append(div3, i1);
      append(div8, div6);
      append(div6, t2);
      append(div8, div7);
      if (if_block1) if_block1.m(div7, null);
      append(div7, span1);
      append(span1, t3);
      if (!mounted) {
        dispose = [
          listen(i0, "click", function() {
            if (is_function(
              /*updateDebounce*/
              ctx[7](
                /*ability*/
                ctx[15][1].abbreviation,
                {
                  target: {
                    value: Number(
                      /*$doc*/
                      ctx[3].system.abilities[
                        /*ability*/
                        ctx[15][1].abbreviation
                      ].value
                    ) + 1
                  }
                }
              )
            )) ctx[7](
              /*ability*/
              ctx[15][1].abbreviation,
              {
                target: {
                  value: Number(
                    /*$doc*/
                    ctx[3].system.abilities[
                      /*ability*/
                      ctx[15][1].abbreviation
                    ].value
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
                ctx[15][1].abbreviation,
                {
                  target: {
                    value: Number(
                      /*$doc*/
                      ctx[3].system.abilities[
                        /*ability*/
                        ctx[15][1].abbreviation
                      ].value
                    ) - 1
                  }
                }
              )
            )) ctx[7](
              /*ability*/
              ctx[15][1].abbreviation,
              {
                target: {
                  value: Number(
                    /*$doc*/
                    ctx[3].system.abilities[
                      /*ability*/
                      ctx[15][1].abbreviation
                    ].value
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
      ctx[15][1].label + "")) set_data(t0, t0_value);
      if (
        /*abilityAdvancements*/
        ctx[5]?.[
          /*ability*/
          ctx[15][1].abbreviation
        ] > 0
      ) {
        if (if_block0) ;
        else {
          if_block0 = create_if_block_3();
          if_block0.c();
          if_block0.m(div1, span0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty & /*abilityAdvancements, systemAbilitiesArray*/
      36 && t1_value !== (t1_value = /*abilityAdvancements*/
      (ctx[5]?.[
        /*ability*/
        ctx[15][1].abbreviation
      ] || 0) + "")) set_data(t1, t1_value);
      if (dirty & /*$doc, systemAbilitiesArray*/
      12 && input_value_value !== (input_value_value = /*$doc*/
      ctx[3].system.abilities[
        /*ability*/
        ctx[15][1].abbreviation
      ].value) && input.value !== input_value_value) {
        input.value = input_value_value;
      }
      if (dirty & /*systemAbilitiesArray*/
      4 && input_name_value !== (input_name_value = /*ability*/
      ctx[15][1].abbreviation)) {
        attr(input, "name", input_name_value);
      }
      if (dirty & /*systemAbilitiesArray*/
      4 && input_id_value !== (input_id_value = /*ability*/
      ctx[15][1].abbreviation)) {
        attr(input, "id", input_id_value);
      }
      if (dirty & /*abilityAdvancements, systemAbilitiesArray, $doc*/
      44 && t2_value !== (t2_value = (Number(
        /*abilityAdvancements*/
        ctx[5]?.[
          /*ability*/
          ctx[15][1].abbreviation
        ]
      ) || 0) + Number(
        /*$doc*/
        ctx[3].system.abilities[
          /*ability*/
          ctx[15][1].abbreviation
        ].value
      ) + "")) set_data(t2, t2_value);
      if (
        /*$doc*/
        ctx[3].system.abilities[
          /*ability*/
          ctx[15][1].abbreviation
        ].mod > 0
      ) {
        if (if_block1) ;
        else {
          if_block1 = create_if_block_2();
          if_block1.c();
          if_block1.m(div7, span1);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (dirty & /*$doc, systemAbilitiesArray*/
      12 && t3_value !== (t3_value = /*$doc*/
      ctx[3].system.abilities[
        /*ability*/
        ctx[15][1].abbreviation
      ].mod + "")) set_data(t3, t3_value);
    },
    d(detaching) {
      if (detaching) {
        detach(div8);
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
      attr(input, "class", input_class_value = "center small " + /*pointBuyClass*/
      ctx[4] + " svelte-gas-1i9wvmn");
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
      16 && input_class_value !== (input_class_value = "center small " + /*pointBuyClass*/
      ctx2[4] + " svelte-gas-1i9wvmn")) {
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
      attr(span, "class", "red svelte-gas-1i9wvmn");
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
  let hr;
  let button;
  let mounted;
  let dispose;
  return {
    c() {
      hr = element("hr");
      button = element("button");
      button.textContent = "Reset scores";
      attr(button, "class", "btn btn-primary");
    },
    m(target, anchor) {
      insert(target, hr, anchor);
      insert(target, button, anchor);
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
        detach(hr);
        detach(button);
      }
      mounted = false;
      dispose();
    }
  };
}
function create_fragment(ctx) {
  let div11;
  let h5;
  let div10;
  let hr;
  let div9;
  let div5;
  let div6;
  let show_if_1;
  let div7;
  let div8;
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
      div11 = element("div");
      h5 = element("h5");
      h5.innerHTML = `<div class="flex2 left">Ability</div><div class="flex1 center">Race / Feat</div><div class="flex1 center">Base Score</div><div class="flex1 center">Score</div><div class="flex1 center">Modifier</div>`;
      div10 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      hr = element("hr");
      div9 = element("div");
      div5 = element("div");
      div5.textContent = "Points total: ";
      div6 = element("div");
      if_block0.c();
      div7 = element("div");
      div7.textContent = "/ ";
      div8 = element("div");
      input = element("input");
      if (if_block1) if_block1.c();
      attr(h5, "class", "flexrow mb-sm");
      attr(div5, "class", "flex1");
      attr(div6, "class", "flex");
      attr(div7, "class", "flex0");
      attr(input, "class", "center small");
      input.disabled = true;
      attr(input, "type", "number");
      input.value = /*pointBuyLimit*/
      ctx[0];
      attr(div8, "class", "flex1");
      attr(div9, "class", "flexrow justify-flexrow-vertical");
      attr(div10, "class", "indent");
      attr(div11, "class", "attribute-entry mt-sm");
    },
    m(target, anchor) {
      insert(target, div11, anchor);
      append(div11, h5);
      append(div11, div10);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div10, null);
        }
      }
      append(div10, hr);
      append(div10, div9);
      append(div9, div5);
      append(div9, div6);
      if_block0.m(div6, null);
      append(div9, div7);
      append(div9, div8);
      append(div8, input);
      if (if_block1) if_block1.m(div10, null);
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
            each_blocks[i].m(div10, hr);
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
          if_block0.m(div6, null);
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
          if_block1.m(div10, null);
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
        detach(div11);
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
  let pointBuyClass;
  let $doc;
  let $race;
  component_subscribe($$self, race, ($$value) => $$invalidate(11, $race = $$value));
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
    1024) {
      $$invalidate(2, systemAbilitiesArray = Object.entries(systemAbilities));
    }
    if ($$self.$$.dirty & /*$race*/
    2048) {
      $$invalidate(5, abilityAdvancements = $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration?.fixed);
    }
    if ($$self.$$.dirty & /*systemAbilitiesArray, $doc*/
    12) {
      $$invalidate(1, scoreTotal = systemAbilitiesArray.reduce((acc, ability) => acc + POINT_BUY_COSTS[Number($doc.system.abilities[ability[1].abbreviation].value)], 0));
    }
    if ($$self.$$.dirty & /*scoreTotal, pointBuyLimit*/
    3) {
      $$invalidate(4, pointBuyClass = scoreTotal > pointBuyLimit ? "red" : "green");
    }
  };
  $$invalidate(10, systemAbilities = game.system.config.abilities);
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
//# sourceMappingURL=PointBuy-CtiMdBQs.js.map
