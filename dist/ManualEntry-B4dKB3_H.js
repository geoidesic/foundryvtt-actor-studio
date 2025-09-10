import { S as SvelteComponent, i as init, s as safe_not_equal, B as ensure_array_like, C as noop, k as detach, D as destroy_each, q as insert, u as append, v as element, x as attr, b as component_subscribe, b6 as race, bz as createEventDispatcher, g as getContext, bA as Timing, o as onMount, F as set_data, a5 as listen, ad as is_function, G as text } from "./index-DBLxEir1.js";
/* empty css                                                     */
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[11] = list[i];
  child_ctx[13] = i;
  return child_ctx;
}
function create_if_block_3(ctx) {
  let th;
  return {
    c() {
      th = element("th");
      th.textContent = "Origin";
      attr(th, "class", "center svelte-gas-1vhq9li");
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
function create_if_block_1(ctx) {
  let td;
  let span;
  let t_value = (
    /*abilityAdvancements*/
    (ctx[1]?.[
      /*ability*/
      ctx[11][0]
    ] || 0) + ""
  );
  let t;
  let if_block = (
    /*abilityAdvancements*/
    ctx[1]?.[
      /*ability*/
      ctx[11][0]
    ] > 0 && create_if_block_2()
  );
  return {
    c() {
      td = element("td");
      if (if_block) if_block.c();
      span = element("span");
      t = text(t_value);
      attr(td, "class", "center svelte-gas-1vhq9li");
    },
    m(target, anchor) {
      insert(target, td, anchor);
      if (if_block) if_block.m(td, null);
      append(td, span);
      append(span, t);
    },
    p(ctx2, dirty) {
      if (
        /*abilityAdvancements*/
        ctx2[1]?.[
          /*ability*/
          ctx2[11][0]
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
      3 && t_value !== (t_value = /*abilityAdvancements*/
      (ctx2[1]?.[
        /*ability*/
        ctx2[11][0]
      ] || 0) + "")) set_data(t, t_value);
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
    ctx[11][1].label + ""
  );
  let t0;
  let td1;
  let input;
  let input_name_value;
  let input_id_value;
  let input_value_value;
  let td2;
  let t1_value = (Number(
    /*abilityAdvancements*/
    ctx[1]?.[
      /*ability*/
      ctx[11][0]
    ]
  ) || 0) + Number(
    /*$doc*/
    ctx[2].system.abilities[
      /*ability*/
      ctx[11][0]
    ]?.value || 0
  ) + "";
  let t1;
  let td3;
  let show_if = Number(
    /*$doc*/
    ctx[2].system.abilities[
      /*ability*/
      ctx[11][0]
    ]?.mod
  ) + (Number(
    /*abilityAdvancements*/
    ctx[1]?.[
      /*ability*/
      ctx[11][0]
    ]
  ) || 0) > 0;
  let span;
  let t2_value = Number(
    /*$doc*/
    ctx[2].system.abilities[
      /*ability*/
      ctx[11][0]
    ]?.mod
  ) + (Number(
    /*abilityAdvancements*/
    ctx[1]?.[
      /*ability*/
      ctx[11][0]
    ]
  ) || 0) + "";
  let t2;
  let mounted;
  let dispose;
  let if_block0 = window.GAS.dnd5eRules == "2014" && create_if_block_1(ctx);
  let if_block1 = show_if && create_if_block();
  return {
    c() {
      tr = element("tr");
      td0 = element("td");
      t0 = text(t0_value);
      td1 = element("td");
      input = element("input");
      if (if_block0) if_block0.c();
      td2 = element("td");
      t1 = text(t1_value);
      td3 = element("td");
      if (if_block1) if_block1.c();
      span = element("span");
      t2 = text(t2_value);
      attr(td0, "class", "ability svelte-gas-1vhq9li");
      attr(input, "class", "score center small svelte-gas-1vhq9li");
      attr(input, "name", input_name_value = /*ability*/
      ctx[11][0]);
      attr(input, "id", input_id_value = /*ability*/
      ctx[11][0]);
      attr(input, "type", "number");
      input.value = input_value_value = /*$doc*/
      ctx[2].system.abilities[
        /*ability*/
        ctx[11][0]
      ]?.value;
      attr(td1, "class", "center svelte-gas-1vhq9li");
      attr(td2, "class", "center svelte-gas-1vhq9li");
      attr(td3, "class", "center svelte-gas-1vhq9li");
    },
    m(target, anchor) {
      insert(target, tr, anchor);
      append(tr, td0);
      append(td0, t0);
      append(tr, td1);
      append(td1, input);
      if (if_block0) if_block0.m(tr, null);
      append(tr, td2);
      append(td2, t1);
      append(tr, td3);
      if (if_block1) if_block1.m(td3, null);
      append(td3, span);
      append(span, t2);
      if (!mounted) {
        dispose = listen(input, "input", function() {
          if (is_function(
            /*updateDebounce*/
            ctx[4](
              /*ability*/
              ctx[11][0],
              event
            )
          )) ctx[4](
            /*ability*/
            ctx[11][0],
            event
          ).apply(this, arguments);
        });
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & /*systemAbilitiesArray*/
      1 && t0_value !== (t0_value = /*ability*/
      ctx[11][1].label + "")) set_data(t0, t0_value);
      if (dirty & /*systemAbilitiesArray*/
      1 && input_name_value !== (input_name_value = /*ability*/
      ctx[11][0])) {
        attr(input, "name", input_name_value);
      }
      if (dirty & /*systemAbilitiesArray*/
      1 && input_id_value !== (input_id_value = /*ability*/
      ctx[11][0])) {
        attr(input, "id", input_id_value);
      }
      if (dirty & /*$doc, systemAbilitiesArray*/
      5 && input_value_value !== (input_value_value = /*$doc*/
      ctx[2].system.abilities[
        /*ability*/
        ctx[11][0]
      ]?.value) && input.value !== input_value_value) {
        input.value = input_value_value;
      }
      if (window.GAS.dnd5eRules == "2014") if_block0.p(ctx, dirty);
      if (dirty & /*abilityAdvancements, systemAbilitiesArray, $doc*/
      7 && t1_value !== (t1_value = (Number(
        /*abilityAdvancements*/
        ctx[1]?.[
          /*ability*/
          ctx[11][0]
        ]
      ) || 0) + Number(
        /*$doc*/
        ctx[2].system.abilities[
          /*ability*/
          ctx[11][0]
        ]?.value || 0
      ) + "")) set_data(t1, t1_value);
      if (dirty & /*$doc, systemAbilitiesArray, abilityAdvancements*/
      7) show_if = Number(
        /*$doc*/
        ctx[2].system.abilities[
          /*ability*/
          ctx[11][0]
        ]?.mod
      ) + (Number(
        /*abilityAdvancements*/
        ctx[1]?.[
          /*ability*/
          ctx[11][0]
        ]
      ) || 0) > 0;
      if (show_if) {
        if (if_block1) ;
        else {
          if_block1 = create_if_block();
          if_block1.c();
          if_block1.m(td3, span);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (dirty & /*$doc, systemAbilitiesArray, abilityAdvancements*/
      7 && t2_value !== (t2_value = Number(
        /*$doc*/
        ctx[2].system.abilities[
          /*ability*/
          ctx[11][0]
        ]?.mod
      ) + (Number(
        /*abilityAdvancements*/
        ctx[1]?.[
          /*ability*/
          ctx[11][0]
        ]
      ) || 0) + "")) set_data(t2, t2_value);
    },
    d(detaching) {
      if (detaching) {
        detach(tr);
      }
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
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
  let if_block = window.GAS.dnd5eRules == "2014" && create_if_block_3();
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
      tr = element("tr");
      th0 = element("th");
      th0.textContent = "Ability";
      th1 = element("th");
      th1.textContent = "Base";
      if (if_block) if_block.c();
      th2 = element("th");
      th2.textContent = "Score";
      th3 = element("th");
      th3.textContent = "Modifier";
      tbody = element("tbody");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(th0, "class", "ability svelte-gas-1vhq9li");
      attr(th1, "class", "center svelte-gas-1vhq9li");
      attr(th2, "class", "center svelte-gas-1vhq9li");
      attr(th3, "class", "center svelte-gas-1vhq9li");
      attr(table, "class", "svelte-gas-1vhq9li");
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
      append(table, tbody);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(tbody, null);
        }
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*Number, $doc, systemAbilitiesArray, abilityAdvancements, window, updateDebounce, event*/
      23) {
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
      if (if_block) if_block.d();
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
  async function updateValue(attr2, event2) {
    const options = {
      system: {
        abilities: {
          [attr2]: { value: Number(event2.target.value) }
        }
      }
    };
    await $doc.updateSource(options);
    if ($doc.render) {
      $doc.render();
    }
  }
  onMount(async () => {
  });
  $$self.$$set = ($$props2) => {
    if ("document" in $$props2) $$invalidate(5, document = $$props2.document);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*systemAbilities*/
    64) {
      $$invalidate(0, systemAbilitiesArray = Object.entries(systemAbilities));
    }
    if ($$self.$$.dirty & /*$race*/
    128) {
      $$invalidate(1, abilityAdvancements = $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration?.fixed);
    }
    if ($$self.$$.dirty & /*systemAbilitiesArray*/
    1) {
      console.log(systemAbilitiesArray);
    }
  };
  $$invalidate(6, systemAbilities = game.system.config.abilities);
  return [
    systemAbilitiesArray,
    abilityAdvancements,
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
//# sourceMappingURL=ManualEntry-B4dKB3_H.js.map
