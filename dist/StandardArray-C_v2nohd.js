import { S as SvelteComponent, i as init, s as safe_not_equal, z as ensure_array_like, e as element, a as empty, b as attr, c as insert, d as append, A as noop, j as detach, B as destroy_each, k as component_subscribe, a0 as race, ab as createEventDispatcher, n as getContext, o as onMount, ae as STANDARD_ARRAY, F as text, G as set_data, Z as listen, ac as Timing, $ as is_function } from "./index-BGuIGNHb.js";
/* empty css                                                     */
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[13] = list[i];
  child_ctx[15] = i;
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
function create_if_block_3(ctx) {
  let i;
  let mounted;
  let dispose;
  return {
    c() {
      i = element("i");
      attr(i, "class", "fas fa-chevron-up");
      attr(i, "alt", "Decrease");
    },
    m(target, anchor) {
      insert(target, i, anchor);
      if (!mounted) {
        dispose = listen(i, "click", function() {
          if (is_function(
            /*updateDebounce*/
            ctx[5](
              /*ability*/
              ctx[13][1].abbreviation,
              1
            )
          )) ctx[5](
            /*ability*/
            ctx[13][1].abbreviation,
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
      attr(i, "alt", "Increase");
    },
    m(target, anchor) {
      insert(target, i, anchor);
      if (!mounted) {
        dispose = listen(i, "click", function() {
          if (is_function(
            /*updateDebounce*/
            ctx[5](
              /*ability*/
              ctx[13][1].abbreviation,
              -1
            )
          )) ctx[5](
            /*ability*/
            ctx[13][1].abbreviation,
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
    ctx[13][1].label + ""
  );
  let t0;
  let div1;
  let span0;
  let t1_value = (
    /*abilityAdvancements*/
    (ctx[3]?.[
      /*ability*/
      ctx[13][1].abbreviation
    ] || 0) + ""
  );
  let t1;
  let div5;
  let input;
  let input_value_value;
  let div4;
  let div2;
  let div3;
  let div6;
  let t2_value = (Number(
    /*abilityAdvancements*/
    ctx[3]?.[
      /*ability*/
      ctx[13][1].abbreviation
    ]
  ) || 0) + Number(
    /*$doc*/
    ctx[1].system.abilities[
      /*ability*/
      ctx[13][1].abbreviation
    ].value
  ) + "";
  let t2;
  let div7;
  let span1;
  let t3_value = (
    /*$doc*/
    ctx[1].system.abilities[
      /*ability*/
      ctx[13][1].abbreviation
    ].mod + ""
  );
  let t3;
  let if_block0 = (
    /*abilityAdvancements*/
    ctx[3]?.[
      /*ability*/
      ctx[13][1].abbreviation
    ] > 0 && create_if_block_4()
  );
  let if_block1 = (
    /*index*/
    ctx[15] != 0 && create_if_block_3(ctx)
  );
  let if_block2 = (
    /*index*/
    ctx[15] != 5 && create_if_block_2(ctx)
  );
  let if_block3 = (
    /*$doc*/
    ctx[1].system.abilities[
      /*ability*/
      ctx[13][1].abbreviation
    ].mod > 0 && create_if_block_1()
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
      if (if_block1) if_block1.c();
      div3 = element("div");
      if (if_block2) if_block2.c();
      div6 = element("div");
      t2 = text(t2_value);
      div7 = element("div");
      if (if_block3) if_block3.c();
      span1 = element("span");
      t3 = text(t3_value);
      attr(div0, "class", "flex2 left");
      attr(div1, "class", "flex1 center align-text-with-input svelte-gas-1i9wvmn");
      attr(input, "class", "left small mainscore svelte-gas-1i9wvmn");
      input.disabled = true;
      attr(input, "type", "number");
      input.value = input_value_value = /*$doc*/
      ctx[1].system.abilities[
        /*ability*/
        ctx[13][1].abbreviation
      ].value;
      attr(div2, "class", "up chevron svelte-gas-1i9wvmn");
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
      if (if_block1) if_block1.m(div2, null);
      append(div4, div3);
      if (if_block2) if_block2.m(div3, null);
      append(div8, div6);
      append(div6, t2);
      append(div8, div7);
      if (if_block3) if_block3.m(div7, null);
      append(div7, span1);
      append(span1, t3);
    },
    p(ctx2, dirty) {
      if (dirty & /*systemAbilitiesArray*/
      1 && t0_value !== (t0_value = /*ability*/
      ctx2[13][1].label + "")) set_data(t0, t0_value);
      if (
        /*abilityAdvancements*/
        ctx2[3]?.[
          /*ability*/
          ctx2[13][1].abbreviation
        ] > 0
      ) {
        if (if_block0) ;
        else {
          if_block0 = create_if_block_4();
          if_block0.c();
          if_block0.m(div1, span0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty & /*abilityAdvancements, systemAbilitiesArray*/
      9 && t1_value !== (t1_value = /*abilityAdvancements*/
      (ctx2[3]?.[
        /*ability*/
        ctx2[13][1].abbreviation
      ] || 0) + "")) set_data(t1, t1_value);
      if (dirty & /*$doc, systemAbilitiesArray*/
      3 && input_value_value !== (input_value_value = /*$doc*/
      ctx2[1].system.abilities[
        /*ability*/
        ctx2[13][1].abbreviation
      ].value) && input.value !== input_value_value) {
        input.value = input_value_value;
      }
      if (
        /*index*/
        ctx2[15] != 0
      ) if_block1.p(ctx2, dirty);
      if (
        /*index*/
        ctx2[15] != 5
      ) if_block2.p(ctx2, dirty);
      if (dirty & /*abilityAdvancements, systemAbilitiesArray, $doc*/
      11 && t2_value !== (t2_value = (Number(
        /*abilityAdvancements*/
        ctx2[3]?.[
          /*ability*/
          ctx2[13][1].abbreviation
        ]
      ) || 0) + Number(
        /*$doc*/
        ctx2[1].system.abilities[
          /*ability*/
          ctx2[13][1].abbreviation
        ].value
      ) + "")) set_data(t2, t2_value);
      if (
        /*$doc*/
        ctx2[1].system.abilities[
          /*ability*/
          ctx2[13][1].abbreviation
        ].mod > 0
      ) {
        if (if_block3) ;
        else {
          if_block3 = create_if_block_1();
          if_block3.c();
          if_block3.m(div7, span1);
        }
      } else if (if_block3) {
        if_block3.d(1);
        if_block3 = null;
      }
      if (dirty & /*$doc, systemAbilitiesArray*/
      3 && t3_value !== (t3_value = /*$doc*/
      ctx2[1].system.abilities[
        /*ability*/
        ctx2[13][1].abbreviation
      ].mod + "")) set_data(t3, t3_value);
    },
    d(detaching) {
      if (detaching) {
        detach(div8);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      if (if_block2) if_block2.d();
      if (if_block3) if_block3.d();
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
      button.textContent = "Reset to Standard Array";
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
          ctx[6]
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
  let div6;
  let h5;
  let div5;
  let each_1_anchor;
  let each_value = ensure_array_like(
    /*systemAbilitiesArray*/
    ctx[0]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  let if_block = !/*isStandardArrayValues*/
  ctx[2] && create_if_block(ctx);
  return {
    c() {
      div6 = element("div");
      h5 = element("h5");
      h5.innerHTML = `<div class="flex2 left">Ability</div><div class="flex1 center">Race / Feat</div><div class="flex1 center">Base Score</div><div class="flex1 center">Score</div><div class="flex1 center">Modifier</div>`;
      div5 = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
      if (if_block) if_block.c();
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
      append(div5, each_1_anchor);
      if (if_block) if_block.m(div5, null);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*$doc, systemAbilitiesArray, Number, abilityAdvancements, updateDebounce*/
      43) {
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
            each_blocks[i].m(div5, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (!/*isStandardArrayValues*/
      ctx2[2]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          if_block.m(div5, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div6);
      }
      destroy_each(each_blocks, detaching);
      if (if_block) if_block.d();
    }
  };
}
function arraysMatch(array1, array2) {
  if (array1.length !== array2.length) return false;
  const sortedArray1 = array1.slice().sort((a, b) => a - b);
  const sortedArray2 = array2.slice().sort((a, b) => a - b);
  return sortedArray1.every((value, index) => value === sortedArray2[index]);
}
function instance($$self, $$props, $$invalidate) {
  let systemAbilities;
  let systemAbilitiesArray;
  let abilityAdvancements;
  let isStandardArrayValues;
  let $doc;
  let $race;
  component_subscribe($$self, race, ($$value) => $$invalidate(9, $race = $$value));
  let { document = false } = $$props;
  createEventDispatcher();
  const doc = document || getContext("#doc");
  component_subscribe($$self, doc, (value) => $$invalidate(1, $doc = value));
  const updateDebounce = Timing.debounce(updateValue, 100);
  async function updateValue(attr2, value) {
    const abilities = Object.keys(STANDARD_ARRAY);
    const index = abilities.indexOf(attr2);
    switch (value) {
      case -1:
        if (index < abilities.length - 1) {
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
        break;
      default:
        if (index > 0) {
          const nextAbility = abilities[index - 1];
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
        break;
    }
  }
  function reset() {
    const options = { system: { abilities: {} } };
    systemAbilitiesArray.forEach((ability) => {
      options.system.abilities[ability[1].abbreviation] = {
        value: STANDARD_ARRAY[ability[1].abbreviation]
      };
    });
    $doc.updateSource(options);
    doc.set($doc);
  }
  onMount(async () => {
    if (systemAbilitiesArray.every((ability) => $doc.system.abilities[ability[1].abbreviation].value === 10)) {
      reset();
    }
  });
  $$self.$$set = ($$props2) => {
    if ("document" in $$props2) $$invalidate(7, document = $$props2.document);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*systemAbilities*/
    256) {
      $$invalidate(0, systemAbilitiesArray = Object.entries(systemAbilities));
    }
    if ($$self.$$.dirty & /*$race*/
    512) {
      $$invalidate(3, abilityAdvancements = $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration?.fixed);
    }
    if ($$self.$$.dirty & /*systemAbilitiesArray, $doc*/
    3) {
      $$invalidate(2, isStandardArrayValues = arraysMatch(Object.values(STANDARD_ARRAY), systemAbilitiesArray.map((ability) => $doc.system.abilities[ability[1].abbreviation].value)));
    }
  };
  $$invalidate(8, systemAbilities = game.system.config.abilities);
  return [
    systemAbilitiesArray,
    $doc,
    isStandardArrayValues,
    abilityAdvancements,
    doc,
    updateDebounce,
    reset,
    document,
    systemAbilities,
    $race
  ];
}
class StandardArray extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { document: 7 });
  }
}
export {
  StandardArray as default
};
//# sourceMappingURL=StandardArray-C_v2nohd.js.map
