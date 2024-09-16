import { S as SvelteComponent, i as init, s as safe_not_equal, z as ensure_array_like, e as element, b as attr, c as insert, A as noop, j as detach, B as destroy_each, o as onMount, F as text, d as append, G as set_data } from "./index-DjDwfpPF.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[5] = list[i];
  return child_ctx;
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
  let div2;
  let div0;
  let span0;
  let t0_value = (
    /*improvement*/
    ctx[5].label + ""
  );
  let t0;
  let div1;
  let show_if = Number(
    /*improvement*/
    ctx[5].value
  ) > 0;
  let span1;
  let t1_value = (
    /*improvement*/
    ctx[5].value + ""
  );
  let t1;
  let if_block = show_if && create_if_block();
  return {
    c() {
      div2 = element("div");
      div0 = element("div");
      span0 = element("span");
      t0 = text(t0_value);
      div1 = element("div");
      if (if_block) if_block.c();
      span1 = element("span");
      t1 = text(t1_value);
      attr(span0, "class", "label");
      attr(div0, "class", "flex left");
      attr(span1, "class", "value");
      attr(div1, "class", "flex0 right");
      attr(div2, "class", "flexrow");
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, div0);
      append(div0, span0);
      append(span0, t0);
      append(div2, div1);
      if (if_block) if_block.m(div1, null);
      append(div1, span1);
      append(span1, t1);
    },
    p(ctx2, dirty) {
      if (dirty & /*improvements*/
      2 && t0_value !== (t0_value = /*improvement*/
      ctx2[5].label + "")) set_data(t0, t0_value);
      if (dirty & /*improvements*/
      2) show_if = Number(
        /*improvement*/
        ctx2[5].value
      ) > 0;
      if (show_if) {
        if (if_block) ;
        else {
          if_block = create_if_block();
          if_block.c();
          if_block.m(div1, span1);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & /*improvements*/
      2 && t1_value !== (t1_value = /*improvement*/
      ctx2[5].value + "")) set_data(t1, t1_value);
    },
    d(detaching) {
      if (detaching) {
        detach(div2);
      }
      if (if_block) if_block.d();
    }
  };
}
function create_fragment(ctx) {
  let div;
  let div_data_type_value;
  let each_value = ensure_array_like(
    /*improvements*/
    ctx[1]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  return {
    c() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      attr(div, "class", "advancement mt-sm svelte-gas-o2pwds");
      attr(div, "data-type", div_data_type_value = /*advancement*/
      ctx[0].type);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div, null);
        }
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & /*improvements, Number*/
      2) {
        each_value = ensure_array_like(
          /*improvements*/
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
            each_blocks[i].m(div, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
      if (dirty & /*advancement*/
      1 && div_data_type_value !== (div_data_type_value = /*advancement*/
      ctx2[0].type)) {
        attr(div, "data-type", div_data_type_value);
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
  let improvements;
  let fixed;
  let points;
  let { advancement = null } = $$props;
  function getNonZeroFixedValues(obj) {
    if (!obj || typeof obj !== "object" || !obj.fixed) {
      throw new Error("Invalid input object");
    }
    const fixed2 = obj.fixed;
    const nonZeroFixedArray = [];
    for (const key in fixed2) {
      if (fixed2.hasOwnProperty(key) && fixed2[key] !== 0) {
        nonZeroFixedArray.push({ label: key, value: fixed2[key] });
      }
    }
    return nonZeroFixedArray;
  }
  onMount(async () => {
  });
  $$self.$$set = ($$props2) => {
    if ("advancement" in $$props2) $$invalidate(0, advancement = $$props2.advancement);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*advancement*/
    1) {
      $$invalidate(3, fixed = getNonZeroFixedValues(advancement.configuration));
    }
    if ($$self.$$.dirty & /*advancement*/
    1) {
      $$invalidate(2, points = advancement.configuration.points);
    }
    if ($$self.$$.dirty & /*fixed*/
    8) {
      if (fixed) {
        $$invalidate(1, improvements = fixed);
      }
    }
    if ($$self.$$.dirty & /*points*/
    4) {
      if (points) $$invalidate(1, improvements = [{ label: "Points", value: Number(points) }]);
    }
  };
  $$invalidate(1, improvements = []);
  return [advancement, improvements, points, fixed];
}
class AbilityScoreImprovement extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { advancement: 0 });
  }
}
export {
  AbilityScoreImprovement as default
};
//# sourceMappingURL=AbilityScoreImprovement-C1WO37Ig.js.map
