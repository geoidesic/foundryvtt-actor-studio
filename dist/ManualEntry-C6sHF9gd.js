import { S as SvelteComponent, i as init, s as safe_not_equal, z as ensure_array_like, e as element, b as attr, c as insert, d as append, A as noop, j as detach, B as destroy_each, k as component_subscribe, V as race, a7 as createEventDispatcher, n as getContext, o as onMount, F as text, Z as listen, a5 as is_function, G as set_data, a8 as Timing } from "./index-B9EMTWF0.js";
import "./Abilities-BevtZscv.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[11] = list[i];
  child_ctx[13] = i;
  return child_ctx;
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
  let div5;
  let div0;
  let t0_value = (
    /*ability*/
    ctx[11][1].label + ""
  );
  let t0;
  let div1;
  let span0;
  let t1_value = (
    /*abilityAdvancements*/
    (ctx[0]?.[
      /*ability*/
      ctx[11][1].abbreviation
    ] || 0) + ""
  );
  let t1;
  let div2;
  let input;
  let input_value_value;
  let div3;
  let t2_value = (Number(
    /*abilityAdvancements*/
    ctx[0]?.[
      /*ability*/
      ctx[11][1].abbreviation
    ]
  ) || 0) + Number(
    /*$doc*/
    ctx[2].system.abilities[
      /*ability*/
      ctx[11][1].abbreviation
    ].value
  ) + "";
  let t2;
  let div4;
  let span1;
  let t3_value = (
    /*$doc*/
    ctx[2].system.abilities[
      /*ability*/
      ctx[11][1].abbreviation
    ].mod + ""
  );
  let t3;
  let mounted;
  let dispose;
  let if_block0 = (
    /*abilityAdvancements*/
    ctx[0]?.[
      /*ability*/
      ctx[11][1].abbreviation
    ] > 0 && create_if_block_1()
  );
  let if_block1 = (
    /*$doc*/
    ctx[2].system.abilities[
      /*ability*/
      ctx[11][1].abbreviation
    ].mod > 0 && create_if_block()
  );
  return {
    c() {
      div5 = element("div");
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
      attr(div0, "class", "flex2 left");
      attr(div1, "class", "flex1 center align-text-with-input svelte-gas-1dbvf21");
      attr(input, "class", "center small");
      attr(input, "type", "number");
      input.value = input_value_value = /*$doc*/
      ctx[2].system.abilities[
        /*ability*/
        ctx[11][1].abbreviation
      ].value;
      attr(div2, "class", "flex1 center");
      attr(div3, "class", "flex1 center align-text-with-input svelte-gas-1dbvf21");
      attr(div4, "class", "flex1 center align-text-with-input svelte-gas-1dbvf21");
      attr(div5, "class", "flexrow mb-sm");
    },
    m(target, anchor) {
      insert(target, div5, anchor);
      append(div5, div0);
      append(div0, t0);
      append(div5, div1);
      if (if_block0) if_block0.m(div1, null);
      append(div1, span0);
      append(span0, t1);
      append(div5, div2);
      append(div2, input);
      append(div5, div3);
      append(div3, t2);
      append(div5, div4);
      if (if_block1) if_block1.m(div4, null);
      append(div4, span1);
      append(span1, t3);
      if (!mounted) {
        dispose = listen(input, "input", function() {
          if (is_function(
            /*updateDebounce*/
            ctx[4](
              /*ability*/
              ctx[11][1].abbreviation,
              event
            )
          )) ctx[4](
            /*ability*/
            ctx[11][1].abbreviation,
            event
          ).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*systemAbilitiesArray*/
      2 && t0_value !== (t0_value = /*ability*/
      ctx[11][1].label + "")) set_data(t0, t0_value);
      if (
        /*abilityAdvancements*/
        ctx[0]?.[
          /*ability*/
          ctx[11][1].abbreviation
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
        ctx[11][1].abbreviation
      ] || 0) + "")) set_data(t1, t1_value);
      if (dirty & /*$doc, systemAbilitiesArray*/
      6 && input_value_value !== (input_value_value = /*$doc*/
      ctx[2].system.abilities[
        /*ability*/
        ctx[11][1].abbreviation
      ].value) && input.value !== input_value_value) {
        input.value = input_value_value;
      }
      if (dirty & /*abilityAdvancements, systemAbilitiesArray, $doc*/
      7 && t2_value !== (t2_value = (Number(
        /*abilityAdvancements*/
        ctx[0]?.[
          /*ability*/
          ctx[11][1].abbreviation
        ]
      ) || 0) + Number(
        /*$doc*/
        ctx[2].system.abilities[
          /*ability*/
          ctx[11][1].abbreviation
        ].value
      ) + "")) set_data(t2, t2_value);
      if (
        /*$doc*/
        ctx[2].system.abilities[
          /*ability*/
          ctx[11][1].abbreviation
        ].mod > 0
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
        ctx[11][1].abbreviation
      ].mod + "")) set_data(t3, t3_value);
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
function create_fragment(ctx) {
  let div6;
  let h5;
  let div5;
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
      append(div6, h5);
      append(div6, div5);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div5, null);
        }
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*$doc, systemAbilitiesArray, Number, abilityAdvancements, updateDebounce, event*/
      23) {
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
  component_subscribe($$self, race, ($$value) => $$invalidate(7, $race = $$value));
  let { document = false } = $$props;
  createEventDispatcher();
  const doc = document || getContext("#doc");
  component_subscribe($$self, doc, (value) => $$invalidate(2, $doc = value));
  const updateDebounce = Timing.debounce(updateValue, 300);
  function updateValue(attr2, event2) {
    const options = {
      system: {
        abilities: {
          [attr2]: { value: Number(event2.target.value) }
        }
      }
    };
    $doc.updateSource(options);
    doc.set($doc);
  }
  onMount(async () => {
  });
  $$self.$$set = ($$props2) => {
    if ("document" in $$props2) $$invalidate(5, document = $$props2.document);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*systemAbilities*/
    64) {
      $$invalidate(1, systemAbilitiesArray = Object.entries(systemAbilities));
    }
    if ($$self.$$.dirty & /*$race*/
    128) {
      $$invalidate(0, abilityAdvancements = $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration?.fixed);
    }
  };
  $$invalidate(6, systemAbilities = game.system.config.abilities);
  return [
    abilityAdvancements,
    systemAbilitiesArray,
    $doc,
    doc,
    updateDebounce,
    document,
    systemAbilities,
    $race
  ];
}
class ManualEntry extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { document: 5 });
  }
}
export {
  ManualEntry as default
};
//# sourceMappingURL=ManualEntry-C6sHF9gd.js.map
