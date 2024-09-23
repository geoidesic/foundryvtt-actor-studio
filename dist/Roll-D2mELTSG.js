import { S as SvelteComponent, i as init, s as safe_not_equal, z as ensure_array_like, e as element, b as attr, c as insert, d as append, A as noop, j as detach, B as destroy_each, k as component_subscribe, a1 as race, af as abilityRolls, ac as createEventDispatcher, n as getContext, o as onMount, M as MODULE_ID, F as text, G as set_data, Z as listen, a0 as is_function, y as set_store_value } from "./index-ClJb1ocg.js";
/* empty css                                                     */
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[14] = list[i];
  child_ctx[16] = i;
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[5] = list[i];
  child_ctx[14] = i;
  return child_ctx;
}
function create_each_block_1(ctx) {
  let pre;
  let t0;
  let t1;
  let t2;
  let t3_value = (
    /*roll*/
    ctx[5] + ""
  );
  let t3;
  return {
    c() {
      pre = element("pre");
      t0 = text("abilityRolls ");
      t1 = text(
        /*ability*/
        ctx[14]
      );
      t2 = text(": ");
      t3 = text(t3_value);
    },
    m(target, anchor) {
      insert(target, pre, anchor);
      append(pre, t0);
      append(pre, t1);
      append(pre, t2);
      append(pre, t3);
    },
    p(ctx2, dirty) {
      if (dirty & /*$abilityRolls*/
      8 && t3_value !== (t3_value = /*roll*/
      ctx2[5] + "")) set_data(t3, t3_value);
    },
    d(detaching) {
      if (detaching) {
        detach(pre);
      }
    }
  };
}
function create_if_block_1(ctx) {
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
  let div6;
  let div0;
  let t0_value = (
    /*ability*/
    ctx[14][1].label + ""
  );
  let t0;
  let div1;
  let span0;
  let t1_value = (
    /*abilityAdvancements*/
    (ctx[0]?.[
      /*ability*/
      ctx[14][1].abbreviation
    ] || 0) + ""
  );
  let t1;
  let div2;
  let input;
  let input_value_value;
  let input_name_value;
  let input_id_value;
  let div3;
  let t2_value = (Number(
    /*abilityAdvancements*/
    ctx[0]?.[
      /*ability*/
      ctx[14][1].abbreviation
    ]
  ) || 0) + Number(
    /*$doc*/
    ctx[2].system.abilities[
      /*ability*/
      ctx[14][1].abbreviation
    ]?.value || 0
  ) + "";
  let t2;
  let div4;
  let span1;
  let t3_value = (
    /*$doc*/
    ctx[2].system.abilities[
      /*ability*/
      ctx[14][1].abbreviation
    ]?.mod + ""
  );
  let t3;
  let div5;
  let i;
  let div5_class_value;
  let mounted;
  let dispose;
  let if_block0 = (
    /*abilityAdvancements*/
    ctx[0]?.[
      /*ability*/
      ctx[14][1].abbreviation
    ] > 0 && create_if_block_1()
  );
  let if_block1 = (
    /*$doc*/
    ctx[2].system.abilities[
      /*ability*/
      ctx[14][1].abbreviation
    ]?.mod > 0 && create_if_block()
  );
  return {
    c() {
      div6 = element("div");
      div0 = element("div");
      t0 = text(t0_value);
      div1 = element("div");
      if (if_block0) if_block0.c();
      span0 = element("span");
      t1 = text(t1_value);
      div2 = element("div");
      input = element("input");
      div3 = element("div");
      t2 = text(t2_value);
      div4 = element("div");
      if (if_block1) if_block1.c();
      span1 = element("span");
      t3 = text(t3_value);
      div5 = element("div");
      i = element("i");
      attr(div0, "class", "flex2 left");
      attr(div1, "class", "flex1 center align-text-with-input svelte-gas-r2rzbl");
      attr(input, "class", "center small");
      input.disabled = true;
      attr(input, "type", "number");
      input.value = input_value_value = /*$doc*/
      ctx[2].system.abilities[
        /*ability*/
        ctx[14][1].abbreviation
      ]?.value;
      attr(input, "name", input_name_value = /*ability*/
      ctx[14][1].abbreviation);
      attr(input, "id", input_id_value = /*ability*/
      ctx[14][1].abbreviation);
      attr(div2, "class", "flex1 center relative");
      attr(div3, "class", "flex1 center align-text-with-input svelte-gas-r2rzbl");
      attr(div4, "class", "flex1 center align-text-with-input svelte-gas-r2rzbl");
      attr(i, "class", "fas fa-dice");
      attr(div5, "class", div5_class_value = "flex0 center justify-flexrow-vertical controls " + /*$abilityRolls*/
      (ctx[3][
        /*ability*/
        ctx[14][1].abbreviation
      ] ? "" : "active") + " svelte-gas-r2rzbl");
      attr(div5, "alt", "Roll");
      attr(div6, "class", "flexrow mb-sm");
    },
    m(target, anchor) {
      insert(target, div6, anchor);
      append(div6, div0);
      append(div0, t0);
      append(div6, div1);
      if (if_block0) if_block0.m(div1, null);
      append(div1, span0);
      append(span0, t1);
      append(div6, div2);
      append(div2, input);
      append(div6, div3);
      append(div3, t2);
      append(div6, div4);
      if (if_block1) if_block1.m(div4, null);
      append(div4, span1);
      append(span1, t3);
      append(div6, div5);
      append(div5, i);
      if (!mounted) {
        dispose = listen(div5, "click", function() {
          if (is_function(
            /*roll*/
            ctx[5](
              /*ability*/
              ctx[14][1].abbreviation
            )
          )) ctx[5](
            /*ability*/
            ctx[14][1].abbreviation
          ).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*systemAbilitiesArray*/
      2 && t0_value !== (t0_value = /*ability*/
      ctx[14][1].label + "")) set_data(t0, t0_value);
      if (
        /*abilityAdvancements*/
        ctx[0]?.[
          /*ability*/
          ctx[14][1].abbreviation
        ] > 0
      ) {
        if (if_block0) ;
        else {
          if_block0 = create_if_block_1();
          if_block0.c();
          if_block0.m(div1, span0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty & /*abilityAdvancements, systemAbilitiesArray*/
      3 && t1_value !== (t1_value = /*abilityAdvancements*/
      (ctx[0]?.[
        /*ability*/
        ctx[14][1].abbreviation
      ] || 0) + "")) set_data(t1, t1_value);
      if (dirty & /*$doc, systemAbilitiesArray*/
      6 && input_value_value !== (input_value_value = /*$doc*/
      ctx[2].system.abilities[
        /*ability*/
        ctx[14][1].abbreviation
      ]?.value) && input.value !== input_value_value) {
        input.value = input_value_value;
      }
      if (dirty & /*systemAbilitiesArray*/
      2 && input_name_value !== (input_name_value = /*ability*/
      ctx[14][1].abbreviation)) {
        attr(input, "name", input_name_value);
      }
      if (dirty & /*systemAbilitiesArray*/
      2 && input_id_value !== (input_id_value = /*ability*/
      ctx[14][1].abbreviation)) {
        attr(input, "id", input_id_value);
      }
      if (dirty & /*abilityAdvancements, systemAbilitiesArray, $doc*/
      7 && t2_value !== (t2_value = (Number(
        /*abilityAdvancements*/
        ctx[0]?.[
          /*ability*/
          ctx[14][1].abbreviation
        ]
      ) || 0) + Number(
        /*$doc*/
        ctx[2].system.abilities[
          /*ability*/
          ctx[14][1].abbreviation
        ]?.value || 0
      ) + "")) set_data(t2, t2_value);
      if (
        /*$doc*/
        ctx[2].system.abilities[
          /*ability*/
          ctx[14][1].abbreviation
        ]?.mod > 0
      ) {
        if (if_block1) ;
        else {
          if_block1 = create_if_block();
          if_block1.c();
          if_block1.m(div4, span1);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (dirty & /*$doc, systemAbilitiesArray*/
      6 && t3_value !== (t3_value = /*$doc*/
      ctx[2].system.abilities[
        /*ability*/
        ctx[14][1].abbreviation
      ]?.mod + "")) set_data(t3, t3_value);
      if (dirty & /*$abilityRolls, systemAbilitiesArray*/
      10 && div5_class_value !== (div5_class_value = "flex0 center justify-flexrow-vertical controls " + /*$abilityRolls*/
      (ctx[3][
        /*ability*/
        ctx[14][1].abbreviation
      ] ? "" : "active") + " svelte-gas-r2rzbl")) {
        attr(div5, "class", div5_class_value);
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div6);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      mounted = false;
      dispose();
    }
  };
}
function create_fragment(ctx) {
  let div6;
  let h5;
  let div5;
  let each_value_1 = ensure_array_like(Object.keys(
    /*$abilityRolls*/
    ctx[3]
  ));
  let each_blocks_1 = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  }
  let each_value = ensure_array_like(
    /*systemAbilitiesArray*/
    ctx[1]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  return {
    c() {
      div6 = element("div");
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        each_blocks_1[i].c();
      }
      h5 = element("h5");
      h5.innerHTML = `<div class="flex2 left">Ability</div><div class="flex1 center">Race / Feat</div><div class="flex1 center">Base Score</div><div class="flex1 center">Score</div><div class="flex1 center">Modifier</div>`;
      div5 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(h5, "class", "flexrow mb-sm");
      attr(div5, "class", "indent");
      attr(div6, "class", "attribute-entry mt-sm");
    },
    m(target, anchor) {
      insert(target, div6, anchor);
      for (let i = 0; i < each_blocks_1.length; i += 1) {
        if (each_blocks_1[i]) {
          each_blocks_1[i].m(div6, null);
        }
      }
      append(div6, h5);
      append(div6, div5);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div5, null);
        }
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*Object, $abilityRolls*/
      8) {
        each_value_1 = ensure_array_like(Object.keys(
          /*$abilityRolls*/
          ctx2[3]
        ));
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1(ctx2, each_value_1, i);
          if (each_blocks_1[i]) {
            each_blocks_1[i].p(child_ctx, dirty);
          } else {
            each_blocks_1[i] = create_each_block_1(child_ctx);
            each_blocks_1[i].c();
            each_blocks_1[i].m(div6, h5);
          }
        }
        for (; i < each_blocks_1.length; i += 1) {
          each_blocks_1[i].d(1);
        }
        each_blocks_1.length = each_value_1.length;
      }
      if (dirty & /*$abilityRolls, systemAbilitiesArray, roll, $doc, Number, abilityAdvancements*/
      47) {
        each_value = ensure_array_like(
          /*systemAbilitiesArray*/
          ctx2[1]
        );
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(div5, null);
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
        detach(div6);
      }
      destroy_each(each_blocks_1, detaching);
      destroy_each(each_blocks, detaching);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let systemAbilities;
  let systemAbilitiesArray;
  let abilityAdvancements;
  let $race;
  let $doc;
  let $abilityRolls;
  component_subscribe($$self, race, ($$value) => $$invalidate(8, $race = $$value));
  component_subscribe($$self, abilityRolls, ($$value) => $$invalidate(3, $abilityRolls = $$value));
  let { document = false } = $$props;
  createEventDispatcher();
  const doc = document || getContext("#doc");
  component_subscribe($$self, doc, (value) => $$invalidate(2, $doc = value));
  let formula;
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
  });
  $$self.$$set = ($$props2) => {
    if ("document" in $$props2) $$invalidate(6, document = $$props2.document);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*systemAbilities*/
    128) {
      $$invalidate(1, systemAbilitiesArray = Object.entries(systemAbilities));
    }
    if ($$self.$$.dirty & /*$race*/
    256) {
      $$invalidate(0, abilityAdvancements = $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration?.fixed);
    }
  };
  $$invalidate(7, systemAbilities = game.system.config.abilities);
  return [
    abilityAdvancements,
    systemAbilitiesArray,
    $doc,
    $abilityRolls,
    doc,
    roll,
    document,
    systemAbilities,
    $race
  ];
}
class Roll_1 extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { document: 6 });
  }
}
export {
  Roll_1 as default
};
//# sourceMappingURL=Roll-D2mELTSG.js.map
