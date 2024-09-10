import { S as SvelteComponent, i as init, s as safe_not_equal, e as element, b as attr, c as insert, A as noop, j as detach, o as onMount, L as getAdvancementValue, F as text, d as append, G as set_data } from "./index-Bz3OjCRV.js";
function create_if_block(ctx) {
  let div1;
  let div0;
  let t_value = getAdvancementValue(
    /*advancement*/
    ctx[0]
  ) + "";
  let t;
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      t = text(t_value);
      attr(div0, "class", "flex left");
      attr(div1, "class", "flexrow");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, div0);
      append(div0, t);
    },
    p(ctx2, dirty) {
      if (dirty & /*advancement*/
      1 && t_value !== (t_value = getAdvancementValue(
        /*advancement*/
        ctx2[0]
      ) + "")) set_data(t, t_value);
    },
    d(detaching) {
      if (detaching) {
        detach(div1);
      }
    }
  };
}
function create_fragment(ctx) {
  let div;
  let div_data_type_value;
  let if_block = (
    /*advancement*/
    ctx[0].title === "Size" && create_if_block(ctx)
  );
  return {
    c() {
      div = element("div");
      if (if_block) if_block.c();
      attr(div, "class", "advancement mt-sm svelte-gas-o2pwds");
      attr(div, "data-type", div_data_type_value = /*advancement*/
      ctx[0].type);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if (if_block) if_block.m(div, null);
    },
    p(ctx2, [dirty]) {
      if (
        /*advancement*/
        ctx2[0].title === "Size"
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          if_block.m(div, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
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
      if (if_block) if_block.d();
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let { advancement = null } = $$props;
  onMount(async () => {
    console.log("advancement" + advancement.type, advancement);
  });
  $$self.$$set = ($$props2) => {
    if ("advancement" in $$props2) $$invalidate(0, advancement = $$props2.advancement);
  };
  return [advancement];
}
class Feat extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { advancement: 0 });
  }
}
export {
  Feat as default
};
//# sourceMappingURL=Feat-BwL2XCAU.js.map
