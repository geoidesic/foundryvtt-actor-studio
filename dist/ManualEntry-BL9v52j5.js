import { S as SvelteComponent, i as init, s as safe_not_equal, B as ensure_array_like, C as noop, d as detach, D as destroy_each, b as insert, e as append, f as element, j as attr, k as component_subscribe, aK as race, b4 as createEventDispatcher, n as getContext, b5 as Timing, o as onMount, F as set_data, Y as listen, ab as is_function, G as text } from "./index-mC2l1kYX.js";
/* empty css                                                     */
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
  let tr;
  let td0;
  let t0_value = (
    /*ability*/
    ctx[11][1].label + ""
  );
  let t0;
  let td1;
  let span0;
  let t1_value = (
    /*abilityAdvancements*/
    (ctx[1]?.[
      /*ability*/
      ctx[11][0]
    ] || 0) + ""
  );
  let t1;
  let td2;
  let input;
  let input_name_value;
  let input_id_value;
  let input_value_value;
  let td3;
  let t2_value = (Number(
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
  let t2;
  let td4;
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
  let span1;
  let t3_value = Number(
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
  let t3;
  let mounted;
  let dispose;
  let if_block0 = (
    /*abilityAdvancements*/
    ctx[1]?.[
      /*ability*/
      ctx[11][0]
    ] > 0 && create_if_block_1()
  );
  let if_block1 = show_if && create_if_block();
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
      td3 = element("td");
      t2 = text(t2_value);
      td4 = element("td");
      if (if_block1) if_block1.c();
      span1 = element("span");
      t3 = text(t3_value);
      attr(td0, "class", "ability svelte-gas-1vhq9li");
      attr(td1, "class", "center svelte-gas-1vhq9li");
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
      attr(td2, "class", "center svelte-gas-1vhq9li");
      attr(td3, "class", "center svelte-gas-1vhq9li");
      attr(td4, "class", "center svelte-gas-1vhq9li");
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
      append(tr, td3);
      append(td3, t2);
      append(tr, td4);
      if (if_block1) if_block1.m(td4, null);
      append(td4, span1);
      append(span1, t3);
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
      if (
        /*abilityAdvancements*/
        ctx[1]?.[
          /*ability*/
          ctx[11][0]
        ] > 0
      ) {
        if (if_block0) ;
        else {
          if_block0 = create_if_block_1();
          if_block0.c();
          if_block0.m(td1, span0);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (dirty & /*abilityAdvancements, systemAbilitiesArray*/
      3 && t1_value !== (t1_value = /*abilityAdvancements*/
      (ctx[1]?.[
        /*ability*/
        ctx[11][0]
      ] || 0) + "")) set_data(t1, t1_value);
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
      if (dirty & /*abilityAdvancements, systemAbilitiesArray, $doc*/
      7 && t2_value !== (t2_value = (Number(
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
      ) + "")) set_data(t2, t2_value);
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
          if_block1.m(td4, span1);
        }
      } else if (if_block1) {
        if_block1.d(1);
        if_block1 = null;
      }
      if (dirty & /*$doc, systemAbilitiesArray, abilityAdvancements*/
      7 && t3_value !== (t3_value = Number(
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
      ) || 0) + "")) set_data(t3, t3_value);
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
      thead.innerHTML = `<tr><th class="ability svelte-gas-1vhq9li">Ability</th><th class="center svelte-gas-1vhq9li">Race / Feat</th><th class="center svelte-gas-1vhq9li">Base Score</th><th class="center svelte-gas-1vhq9li">Score</th><th class="center svelte-gas-1vhq9li">Modifier</th></tr>`;
      tbody = element("tbody");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(table, "class", "svelte-gas-1vhq9li");
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
      if (dirty & /*Number, $doc, systemAbilitiesArray, abilityAdvancements, updateDebounce, event*/
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
//# sourceMappingURL=ManualEntry-BL9v52j5.js.map
