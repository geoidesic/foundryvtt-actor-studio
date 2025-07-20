import { S as SvelteComponent, i as init, s as safe_not_equal, B as ensure_array_like, C as noop, k as detach, D as destroy_each, q as insert, u as append, v as element, w as empty, x as attr, b as component_subscribe, b6 as race, bE as abilityRolls, g as getContext, bB as Timing, o as onMount, bH as STANDARD_ARRAY, bI as isStandardArrayValues, bG as dnd5eModCalc, F as set_data, G as text, a5 as listen, j as set_store_value, h as tick, ad as is_function, l as localize } from "./index-CKdNKRLL.js";
/* empty css                                                     */
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[16] = list[i];
  child_ctx[18] = i;
  return child_ctx;
}
function create_if_block_6(ctx) {
  let th;
  return {
    c() {
      th = element("th");
      th.textContent = "Origin";
      attr(th, "class", "center svelte-gas-ty2tkd");
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
            /*updateDebounce*/
            ctx[5](
              /*ability*/
              ctx[16][0],
              1
            )
          )) ctx[5](
            /*ability*/
            ctx[16][0],
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
            /*updateDebounce*/
            ctx[5](
              /*ability*/
              ctx[16][0],
              -1
            )
          )) ctx[5](
            /*ability*/
            ctx[16][0],
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
function create_if_block_2(ctx) {
  let td;
  let span;
  let t_1_value = (
    /*abilityAdvancements*/
    (ctx[2]?.[
      /*ability*/
      ctx[16][0]
    ] || 0) + ""
  );
  let t_1;
  let if_block = (
    /*abilityAdvancements*/
    ctx[2]?.[
      /*ability*/
      ctx[16][0]
    ] > 0 && create_if_block_3()
  );
  return {
    c() {
      td = element("td");
      if (if_block) if_block.c();
      span = element("span");
      t_1 = text(t_1_value);
      attr(td, "class", "center svelte-gas-ty2tkd");
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
        ctx2[2]?.[
          /*ability*/
          ctx2[16][0]
        ] > 0
      ) {
        if (if_block) ;
        else {
          if_block = create_if_block_3();
          if_block.c();
          if_block.m(td, span);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*abilityAdvancements, systemAbilitiesArray*/
      12 && t_1_value !== (t_1_value = /*abilityAdvancements*/
      (ctx2[2]?.[
        /*ability*/
        ctx2[16][0]
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
    ctx[16][1].label + ""
  );
  let t0;
  let td1;
  let input;
  let input_value_value;
  let div2;
  let div0;
  let div1;
  let td2;
  let t1_value = (Number(
    /*abilityAdvancements*/
    ctx[2]?.[
      /*ability*/
      ctx[16][0]
    ]
  ) || 0) + Number(
    /*$doc*/
    ctx[1].system.abilities[
      /*ability*/
      ctx[16][0]
    ]?.value || 0
  ) + "";
  let t1;
  let td3;
  let show_if = dnd5eModCalc(Number(
    /*$doc*/
    ctx[1].system.abilities[
      /*ability*/
      ctx[16][0]
    ]?.value
  ) + (Number(
    /*abilityAdvancements*/
    ctx[2]?.[
      /*ability*/
      ctx[16][0]
    ]
  ) || 0)) > 0;
  let span;
  let t2_value = dnd5eModCalc(Number(
    /*$doc*/
    ctx[1].system.abilities[
      /*ability*/
      ctx[16][0]
    ]?.value
  ) + (Number(
    /*abilityAdvancements*/
    ctx[2]?.[
      /*ability*/
      ctx[16][0]
    ]
  ) || 0)) + "";
  let t2;
  let if_block0 = (
    /*index*/
    ctx[18] != 0 && create_if_block_5(ctx)
  );
  let if_block1 = (
    /*index*/
    ctx[18] != 5 && create_if_block_4(ctx)
  );
  let if_block2 = window.GAS.dnd5eRules == "2014" && create_if_block_2(ctx);
  let if_block3 = show_if && create_if_block_1();
  return {
    c() {
      tr = element("tr");
      td0 = element("td");
      t0 = text(t0_value);
      td1 = element("td");
      input = element("input");
      div2 = element("div");
      div0 = element("div");
      if (if_block0) if_block0.c();
      div1 = element("div");
      if (if_block1) if_block1.c();
      if (if_block2) if_block2.c();
      td2 = element("td");
      t1 = text(t1_value);
      td3 = element("td");
      if (if_block3) if_block3.c();
      span = element("span");
      t2 = text(t2_value);
      attr(td0, "class", "ability svelte-gas-ty2tkd");
      attr(input, "class", "left small mainscore svelte-gas-ty2tkd");
      input.disabled = true;
      attr(input, "type", "number");
      input.value = input_value_value = /*$doc*/
      ctx[1].system.abilities[
        /*ability*/
        ctx[16][0]
      ]?.value;
      attr(div0, "class", "up chevron svelte-gas-ty2tkd");
      attr(div1, "class", "down chevron svelte-gas-ty2tkd");
      attr(div2, "class", "controls ml-lg svelte-gas-ty2tkd");
      attr(td1, "class", "center relative svelte-gas-ty2tkd");
      attr(td2, "class", "center svelte-gas-ty2tkd");
      attr(td3, "class", "center svelte-gas-ty2tkd");
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td0);
      append(td0, t0);
      append(tr, td1);
      append(td1, input);
      append(td1, div2);
      append(div2, div0);
      if (if_block0) if_block0.m(div0, null);
      append(div2, div1);
      if (if_block1) if_block1.m(div1, null);
      if (if_block2) if_block2.m(tr, null);
      append(tr, td2);
      append(td2, t1);
      append(tr, td3);
      if (if_block3) if_block3.m(td3, null);
      append(td3, span);
      append(span, t2);
    },
    p(ctx2, dirty) {
      if (dirty & /*systemAbilitiesArray*/
      8 && t0_value !== (t0_value = /*ability*/
      ctx2[16][1].label + "")) set_data(t0, t0_value);
      if (dirty & /*$doc, systemAbilitiesArray*/
      10 && input_value_value !== (input_value_value = /*$doc*/
      ctx2[1].system.abilities[
        /*ability*/
        ctx2[16][0]
      ]?.value) && input.value !== input_value_value) {
        input.value = input_value_value;
      }
      if (
        /*index*/
        ctx2[18] != 0
      ) if_block0.p(ctx2, dirty);
      if (
        /*index*/
        ctx2[18] != 5
      ) if_block1.p(ctx2, dirty);
      if (window.GAS.dnd5eRules == "2014") if_block2.p(ctx2, dirty);
      if (dirty & /*abilityAdvancements, systemAbilitiesArray, $doc*/
      14 && t1_value !== (t1_value = (Number(
        /*abilityAdvancements*/
        ctx2[2]?.[
          /*ability*/
          ctx2[16][0]
        ]
      ) || 0) + Number(
        /*$doc*/
        ctx2[1].system.abilities[
          /*ability*/
          ctx2[16][0]
        ]?.value || 0
      ) + "")) set_data(t1, t1_value);
      if (dirty & /*$doc, systemAbilitiesArray, abilityAdvancements*/
      14) show_if = dnd5eModCalc(Number(
        /*$doc*/
        ctx2[1].system.abilities[
          /*ability*/
          ctx2[16][0]
        ]?.value
      ) + (Number(
        /*abilityAdvancements*/
        ctx2[2]?.[
          /*ability*/
          ctx2[16][0]
        ]
      ) || 0)) > 0;
      if (show_if) {
        if (if_block3) ;
        else {
          if_block3 = create_if_block_1();
          if_block3.c();
          if_block3.m(td3, span);
        }
      } else if (if_block3) {
        if_block3.d(1);
        if_block3 = null;
      }
      if (dirty & /*$doc, systemAbilitiesArray, abilityAdvancements*/
      14 && t2_value !== (t2_value = dnd5eModCalc(Number(
        /*$doc*/
        ctx2[1].system.abilities[
          /*ability*/
          ctx2[16][0]
        ]?.value
      ) + (Number(
        /*abilityAdvancements*/
        ctx2[2]?.[
          /*ability*/
          ctx2[16][0]
        ]
      ) || 0)) + "")) set_data(t2, t2_value);
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
      attr(td, "class", "svelte-gas-ty2tkd");
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
  let tr;
  let th0;
  let th1;
  let th2;
  let th3;
  let tbody;
  let each_1_anchor;
  let if_block0 = window.GAS.dnd5eRules == "2014" && create_if_block_6();
  let each_value = ensure_array_like(
    /*systemAbilitiesArray*/
    ctx[3]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  let if_block1 = !/*isStandardArrayCurrent*/
  ctx[0] && create_if_block(ctx);
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
      if (if_block0) if_block0.c();
      th2 = element("th");
      th2.textContent = "Score";
      th3 = element("th");
      th3.textContent = "Modifier";
      tbody = element("tbody");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
      if (if_block1) if_block1.c();
      attr(th0, "class", "ability svelte-gas-ty2tkd");
      attr(th1, "class", "center svelte-gas-ty2tkd");
      attr(th2, "class", "center svelte-gas-ty2tkd");
      attr(th3, "class", "center svelte-gas-ty2tkd");
      attr(table, "class", "svelte-gas-ty2tkd");
      attr(div, "class", "attribute-entry mt-sm");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, table);
      append(table, thead);
      append(thead, tr);
      append(tr, th0);
      append(tr, th1);
      if (if_block0) if_block0.m(tr, null);
      append(tr, th2);
      append(tr, th3);
      append(table, tbody);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(tbody, null);
        }
      }
      append(tbody, each_1_anchor);
      if (if_block1) if_block1.m(tbody, null);
    },
    p(ctx2, [dirty]) {
      if (dirty & /*Number, $doc, systemAbilitiesArray, abilityAdvancements, window, updateDebounce*/
      46) {
        each_value = ensure_array_like(
          /*systemAbilitiesArray*/
          ctx2[3]
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
      if (!/*isStandardArrayCurrent*/
      ctx2[0]) {
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
        detach(div);
      }
      if (if_block0) if_block0.d();
      destroy_each(each_blocks, detaching);
      if (if_block1) if_block1.d();
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
  let actorAbilityValues;
  let allTens;
  let isStandardArrayCurrent;
  let $doc;
  let $race;
  let $abilityRolls;
  component_subscribe($$self, race, ($$value) => $$invalidate(10, $race = $$value));
  component_subscribe($$self, abilityRolls, ($$value) => $$invalidate(14, $abilityRolls = $$value));
  const doc = getContext("#doc");
  component_subscribe($$self, doc, (value) => $$invalidate(1, $doc = value));
  const updateDebounce = Timing.debounce(updateValue, 100);
  const options = { system: { abilities: {} } };
  let lastResetDocName = null;
  async function updateValue(attr2, value) {
    const abilities = Object.keys(STANDARD_ARRAY);
    const index = abilities.indexOf(attr2);
    switch (value) {
      case -1:
        if (index < abilities.length - 1) {
          const nextAbility = abilities[index + 1];
          const options2 = {
            system: {
              abilities: {
                [attr2]: {
                  value: $doc.system.abilities[nextAbility].value
                },
                [nextAbility]: { value: $doc.system.abilities[attr2].value }
              }
            }
          };
          await $doc.updateSource(options2);
          if ($doc.render) {
            $doc.render();
          }
        }
        break;
      default:
        if (index > 0) {
          const nextAbility = abilities[index - 1];
          const options2 = {
            system: {
              abilities: {
                [attr2]: {
                  value: $doc.system.abilities[nextAbility].value
                },
                [nextAbility]: { value: $doc.system.abilities[attr2].value }
              }
            }
          };
          await $doc.updateSource(options2);
          if ($doc.render) {
            $doc.render();
          }
        }
        break;
    }
  }
  async function reset() {
    set_store_value(abilityRolls, $abilityRolls = {}, $abilityRolls);
    Object.keys(STANDARD_ARRAY).forEach((key) => {
      options.system.abilities[key] = { value: STANDARD_ARRAY[key] };
    });
    await $doc.updateSource(options);
    await tick();
    if ($doc.render) {
      $doc.render();
    }
  }
  onMount(async () => {
    if (allTens) {
      reset();
    }
  });
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*systemAbilities*/
    512) {
      $$invalidate(3, systemAbilitiesArray = Object.entries(systemAbilities));
    }
    if ($$self.$$.dirty & /*$race*/
    1024) {
      $$invalidate(2, abilityAdvancements = $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration?.fixed);
    }
    if ($$self.$$.dirty & /*$doc*/
    2) {
      Object.entries($doc.system.abilities);
    }
    if ($$self.$$.dirty & /*$doc*/
    2) {
      $$invalidate(8, actorAbilityValues = Object.entries($doc.system.abilities).map((x) => x[1].value));
    }
    if ($$self.$$.dirty & /*actorAbilityValues*/
    256) {
      allTens = actorAbilityValues.reduce(
        (acc, curr) => {
          if (curr == 10) {
            acc = true;
          }
          return acc;
        },
        false
      );
    }
    if ($$self.$$.dirty & /*$doc*/
    2) {
      $$invalidate(0, isStandardArrayCurrent = arraysMatch(Object.values(STANDARD_ARRAY), Object.keys(STANDARD_ARRAY).map((key) => $doc.system.abilities[key]?.value)));
    }
    if ($$self.$$.dirty & /*isStandardArrayCurrent*/
    1) {
      isStandardArrayValues.set(isStandardArrayCurrent);
    }
    if ($$self.$$.dirty & /*$doc, lastResetDocName*/
    130) {
      if ($doc?.system?.abilities && $doc?.name && lastResetDocName !== $doc.name && Object.keys(STANDARD_ARRAY).every((key) => $doc.system.abilities[key]?.value === 10) && !arraysMatch(Object.keys(STANDARD_ARRAY).map((key) => $doc.system.abilities[key]?.value), Object.values(STANDARD_ARRAY))) {
        $$invalidate(7, lastResetDocName = $doc.name);
        reset();
      }
    }
  };
  $$invalidate(9, systemAbilities = game.system.config.abilities);
  return [
    isStandardArrayCurrent,
    $doc,
    abilityAdvancements,
    systemAbilitiesArray,
    doc,
    updateDebounce,
    reset,
    lastResetDocName,
    actorAbilityValues,
    systemAbilities,
    $race
  ];
}
class StandardArray extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {});
  }
}
export {
  StandardArray as default
};
//# sourceMappingURL=StandardArray-gf8RL-DM.js.map
