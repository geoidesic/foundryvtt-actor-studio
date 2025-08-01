import { S as SvelteComponent, i as init, s as safe_not_equal, B as ensure_array_like, C as noop, d as detach, D as destroy_each, b as insert, e as append, f as element, h as empty, j as attr, k as component_subscribe, bb as isStandardArrayValues, aK as race, b8 as abilityRolls, b4 as createEventDispatcher, n as getContext, b5 as Timing, o as onMount, u as set_store_value, bc as STANDARD_ARRAY, ba as dnd5eModCalc, F as set_data, G as text, Y as listen, ab as is_function, l as localize } from "./index-mC2l1kYX.js";
/* empty css                                                     */
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[14] = list[i];
  child_ctx[16] = i;
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
      attr(i, "alt", localize("GAS.AltText.MoveUp"));
    },
    m(target, anchor) {
      insert(target, i, anchor);
      if (!mounted) {
        dispose = listen(i, "click", function() {
          if (is_function(
            /*updateDebounce*/
            ctx[5](
              /*ability*/
              ctx[14][0],
              1
            )
          )) ctx[5](
            /*ability*/
            ctx[14][0],
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
      attr(i, "alt", localize("GAS.AltText.MoveDown"));
    },
    m(target, anchor) {
      insert(target, i, anchor);
      if (!mounted) {
        dispose = listen(i, "click", function() {
          if (is_function(
            /*updateDebounce*/
            ctx[5](
              /*ability*/
              ctx[14][0],
              -1
            )
          )) ctx[5](
            /*ability*/
            ctx[14][0],
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
  let tr;
  let td0;
  let t0_value = (
    /*ability*/
    ctx[14][1].label + ""
  );
  let t0;
  let td1;
  let span0;
  let t1_value = (
    /*abilityAdvancements*/
    (ctx[2]?.[
      /*ability*/
      ctx[14][0]
    ] || 0) + ""
  );
  let t1;
  let td2;
  let input;
  let input_value_value;
  let div2;
  let div0;
  let div1;
  let td3;
  let t2_value = (Number(
    /*abilityAdvancements*/
    ctx[2]?.[
      /*ability*/
      ctx[14][0]
    ]
  ) || 0) + Number(
    /*$doc*/
    ctx[1].system.abilities[
      /*ability*/
      ctx[14][0]
    ]?.value || 0
  ) + "";
  let t2;
  let td4;
  let show_if = dnd5eModCalc(Number(
    /*$doc*/
    ctx[1].system.abilities[
      /*ability*/
      ctx[14][0]
    ]?.value
  ) + (Number(
    /*abilityAdvancements*/
    ctx[2]?.[
      /*ability*/
      ctx[14][0]
    ]
  ) || 0)) > 0;
  let span1;
  let t3_value = dnd5eModCalc(Number(
    /*$doc*/
    ctx[1].system.abilities[
      /*ability*/
      ctx[14][0]
    ]?.value
  ) + (Number(
    /*abilityAdvancements*/
    ctx[2]?.[
      /*ability*/
      ctx[14][0]
    ]
  ) || 0)) + "";
  let t3;
  let if_block0 = (
    /*abilityAdvancements*/
    ctx[2]?.[
      /*ability*/
      ctx[14][0]
    ] > 0 && create_if_block_4()
  );
  let if_block1 = (
    /*index*/
    ctx[16] != 0 && create_if_block_3(ctx)
  );
  let if_block2 = (
    /*index*/
    ctx[16] != 5 && create_if_block_2(ctx)
  );
  let if_block3 = show_if && create_if_block_1();
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
      if (if_block1) if_block1.c();
      div1 = element("div");
      if (if_block2) if_block2.c();
      td3 = element("td");
      t2 = text(t2_value);
      td4 = element("td");
      if (if_block3) if_block3.c();
      span1 = element("span");
      t3 = text(t3_value);
      attr(td0, "class", "ability svelte-gas-lfv5iw");
      attr(td1, "class", "center svelte-gas-lfv5iw");
      attr(input, "class", "left small mainscore svelte-gas-lfv5iw");
      input.disabled = true;
      attr(input, "type", "number");
      input.value = input_value_value = /*$doc*/
      ctx[1].system.abilities[
        /*ability*/
        ctx[14][0]
      ]?.value;
      attr(div0, "class", "up chevron svelte-gas-lfv5iw");
      attr(div1, "class", "down chevron svelte-gas-lfv5iw");
      attr(div2, "class", "controls svelte-gas-lfv5iw");
      attr(td2, "class", "center relative svelte-gas-lfv5iw");
      attr(td3, "class", "center svelte-gas-lfv5iw");
      attr(td4, "class", "center svelte-gas-lfv5iw");
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
      if (if_block1) if_block1.m(div0, null);
      append(div2, div1);
      if (if_block2) if_block2.m(div1, null);
      append(tr, td3);
      append(td3, t2);
      append(tr, td4);
      if (if_block3) if_block3.m(td4, null);
      append(td4, span1);
      append(span1, t3);
    },
    p(ctx2, dirty) {
      if (dirty & /*systemAbilitiesArray*/
      1 && t0_value !== (t0_value = /*ability*/
      ctx2[14][1].label + "")) set_data(t0, t0_value);
      if (
        /*abilityAdvancements*/
        ctx2[2]?.[
          /*ability*/
          ctx2[14][0]
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
      5 && t1_value !== (t1_value = /*abilityAdvancements*/
      (ctx2[2]?.[
        /*ability*/
        ctx2[14][0]
      ] || 0) + "")) set_data(t1, t1_value);
      if (dirty & /*$doc, systemAbilitiesArray*/
      3 && input_value_value !== (input_value_value = /*$doc*/
      ctx2[1].system.abilities[
        /*ability*/
        ctx2[14][0]
      ]?.value) && input.value !== input_value_value) {
        input.value = input_value_value;
      }
      if (
        /*index*/
        ctx2[16] != 0
      ) if_block1.p(ctx2, dirty);
      if (
        /*index*/
        ctx2[16] != 5
      ) if_block2.p(ctx2, dirty);
      if (dirty & /*abilityAdvancements, systemAbilitiesArray, $doc*/
      7 && t2_value !== (t2_value = (Number(
        /*abilityAdvancements*/
        ctx2[2]?.[
          /*ability*/
          ctx2[14][0]
        ]
      ) || 0) + Number(
        /*$doc*/
        ctx2[1].system.abilities[
          /*ability*/
          ctx2[14][0]
        ]?.value || 0
      ) + "")) set_data(t2, t2_value);
      if (dirty & /*$doc, systemAbilitiesArray, abilityAdvancements*/
      7) show_if = dnd5eModCalc(Number(
        /*$doc*/
        ctx2[1].system.abilities[
          /*ability*/
          ctx2[14][0]
        ]?.value
      ) + (Number(
        /*abilityAdvancements*/
        ctx2[2]?.[
          /*ability*/
          ctx2[14][0]
        ]
      ) || 0)) > 0;
      if (show_if) {
        if (if_block3) ;
        else {
          if_block3 = create_if_block_1();
          if_block3.c();
          if_block3.m(td4, span1);
        }
      } else if (if_block3) {
        if_block3.d(1);
        if_block3 = null;
      }
      if (dirty & /*$doc, systemAbilitiesArray, abilityAdvancements*/
      7 && t3_value !== (t3_value = dnd5eModCalc(Number(
        /*$doc*/
        ctx2[1].system.abilities[
          /*ability*/
          ctx2[14][0]
        ]?.value
      ) + (Number(
        /*abilityAdvancements*/
        ctx2[2]?.[
          /*ability*/
          ctx2[14][0]
        ]
      ) || 0)) + "")) set_data(t3, t3_value);
    },
    d(detaching) {
      if (detaching) {
        detach(tr);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
      if (if_block2) if_block2.d();
      if (if_block3) if_block3.d();
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
      button.textContent = "Reset to Standard Array";
      attr(button, "class", "btn btn-primary");
      attr(td, "colspan", "5");
      attr(td, "class", "svelte-gas-lfv5iw");
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
          ctx[6]
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
  let div;
  let table;
  let thead;
  let tbody;
  let each_1_anchor;
  let each_value = ensure_array_like(
    /*systemAbilitiesArray*/
    ctx[0]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  let if_block = !/*$isStandardArrayValues*/
  ctx[3] && create_if_block(ctx);
  return {
    c() {
      div = element("div");
      table = element("table");
      thead = element("thead");
      thead.innerHTML = `<tr><th class="ability svelte-gas-lfv5iw">Ability</th><th class="center svelte-gas-lfv5iw">Race / Feat</th><th class="center svelte-gas-lfv5iw">Base Score</th><th class="center svelte-gas-lfv5iw">Score</th><th class="center svelte-gas-lfv5iw">Modifier</th></tr>`;
      tbody = element("tbody");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
      if (if_block) if_block.c();
      attr(table, "class", "svelte-gas-lfv5iw");
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
      append(tbody, each_1_anchor);
      if (if_block) if_block.m(tbody, null);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*Number, $doc, systemAbilitiesArray, abilityAdvancements, updateDebounce*/
      39) {
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
            each_blocks[i].m(tbody, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (!/*$isStandardArrayValues*/
      ctx2[3]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          if_block.m(tbody, null);
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
        detach(div);
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
  let $doc;
  let $isStandardArrayValues;
  let $race;
  let $abilityRolls;
  component_subscribe($$self, isStandardArrayValues, ($$value) => $$invalidate(3, $isStandardArrayValues = $$value));
  component_subscribe($$self, race, ($$value) => $$invalidate(9, $race = $$value));
  component_subscribe($$self, abilityRolls, ($$value) => $$invalidate(11, $abilityRolls = $$value));
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
    set_store_value(abilityRolls, $abilityRolls = {}, $abilityRolls);
    const options = { system: { abilities: {} } };
    systemAbilitiesArray.forEach((ability) => {
      options.system.abilities[ability[0]] = { value: STANDARD_ARRAY[ability[0]] };
    });
    $doc.updateSource(options);
    doc.set($doc);
  }
  onMount(async () => {
    if (systemAbilitiesArray.every((ability) => $doc.system.abilities[ability[0]]?.value === 10)) {
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
      $$invalidate(2, abilityAdvancements = $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration?.fixed);
    }
    if ($$self.$$.dirty & /*systemAbilitiesArray, $doc*/
    3) {
      set_store_value(isStandardArrayValues, $isStandardArrayValues = arraysMatch(Object.values(STANDARD_ARRAY), systemAbilitiesArray.map((ability) => $doc.system.abilities[ability[0]]?.value)), $isStandardArrayValues);
    }
  };
  $$invalidate(8, systemAbilities = game.system.config.abilities);
  return [
    systemAbilitiesArray,
    $doc,
    abilityAdvancements,
    $isStandardArrayValues,
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
//# sourceMappingURL=StandardArray-BL3iiDKn.js.map
