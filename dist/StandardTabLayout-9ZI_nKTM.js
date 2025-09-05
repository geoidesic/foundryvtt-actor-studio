import { S as SvelteComponent, i as init, s as safe_not_equal, Q as create_slot, k as detach, t as transition_out, a as transition_in, R as update_slot_base, U as get_all_dirty_from_scope, V as get_slot_changes, x as attr, q as insert, u as append, v as element, b as component_subscribe, r as readOnlyTabs, F as set_data, G as text } from "./index-BYL7bTMT.js";
const get_right_slot_changes = (dirty) => ({});
const get_right_slot_context = (ctx) => ({});
const get_left_slot_changes = (dirty) => ({});
const get_left_slot_context = (ctx) => ({});
function create_if_block(ctx) {
  let h1;
  let t;
  return {
    c() {
      h1 = element("h1");
      t = text(
        /*title*/
        ctx[0]
      );
      attr(h1, "class", "center mt-none hide");
    },
    m(target, anchor) {
      insert(target, h1, anchor);
      append(h1, t);
    },
    p(ctx2, dirty) {
      if (dirty & /*title*/
      1) set_data(
        t,
        /*title*/
        ctx2[0]
      );
    },
    d(detaching) {
      if (detaching) {
        detach(h1);
      }
    }
  };
}
function create_fragment(ctx) {
  let div4;
  let div3;
  let div0;
  let div0_class_value;
  let div1;
  let div2;
  let div2_class_value;
  let div4_class_value;
  let current;
  let if_block = (
    /*showTitle*/
    ctx[1] && create_if_block(ctx)
  );
  const left_slot_template = (
    /*#slots*/
    ctx[8].left
  );
  const left_slot = create_slot(
    left_slot_template,
    ctx,
    /*$$scope*/
    ctx[7],
    get_left_slot_context
  );
  const right_slot_template = (
    /*#slots*/
    ctx[8].right
  );
  const right_slot = create_slot(
    right_slot_template,
    ctx,
    /*$$scope*/
    ctx[7],
    get_right_slot_context
  );
  return {
    c() {
      div4 = element("div");
      if (if_block) if_block.c();
      div3 = element("div");
      div0 = element("div");
      if (left_slot) left_slot.c();
      div1 = element("div");
      div2 = element("div");
      if (right_slot) right_slot.c();
      attr(div0, "class", div0_class_value = "flex2 pr-sm col-a " + /*leftPanelClass*/
      ctx[2] + " svelte-gas-lfe2zn");
      attr(div1, "class", "flex0 border-right right-border-gradient-mask");
      attr(div2, "class", div2_class_value = "flex3 left pl-md scroll col-b " + /*rightPanelClass*/
      ctx[3] + " svelte-gas-lfe2zn");
      attr(div3, "class", "flexrow svelte-gas-lfe2zn");
      attr(div4, "class", div4_class_value = "content " + /*contentClass*/
      ctx[4] + " svelte-gas-lfe2zn");
    },
    m(target, anchor) {
      insert(target, div4, anchor);
      if (if_block) if_block.m(div4, null);
      append(div4, div3);
      append(div3, div0);
      if (left_slot) {
        left_slot.m(div0, null);
      }
      append(div3, div1);
      append(div3, div2);
      if (right_slot) {
        right_slot.m(div2, null);
      }
      current = true;
    },
    p(ctx2, [dirty]) {
      if (
        /*showTitle*/
        ctx2[1]
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block(ctx2);
          if_block.c();
          if_block.m(div4, div3);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (left_slot) {
        if (left_slot.p && (!current || dirty & /*$$scope*/
        128)) {
          update_slot_base(
            left_slot,
            left_slot_template,
            ctx2,
            /*$$scope*/
            ctx2[7],
            !current ? get_all_dirty_from_scope(
              /*$$scope*/
              ctx2[7]
            ) : get_slot_changes(
              left_slot_template,
              /*$$scope*/
              ctx2[7],
              dirty,
              get_left_slot_changes
            ),
            get_left_slot_context
          );
        }
      }
      if (!current || dirty & /*leftPanelClass*/
      4 && div0_class_value !== (div0_class_value = "flex2 pr-sm col-a " + /*leftPanelClass*/
      ctx2[2] + " svelte-gas-lfe2zn")) {
        attr(div0, "class", div0_class_value);
      }
      if (right_slot) {
        if (right_slot.p && (!current || dirty & /*$$scope*/
        128)) {
          update_slot_base(
            right_slot,
            right_slot_template,
            ctx2,
            /*$$scope*/
            ctx2[7],
            !current ? get_all_dirty_from_scope(
              /*$$scope*/
              ctx2[7]
            ) : get_slot_changes(
              right_slot_template,
              /*$$scope*/
              ctx2[7],
              dirty,
              get_right_slot_changes
            ),
            get_right_slot_context
          );
        }
      }
      if (!current || dirty & /*rightPanelClass*/
      8 && div2_class_value !== (div2_class_value = "flex3 left pl-md scroll col-b " + /*rightPanelClass*/
      ctx2[3] + " svelte-gas-lfe2zn")) {
        attr(div2, "class", div2_class_value);
      }
      if (!current || dirty & /*contentClass*/
      16 && div4_class_value !== (div4_class_value = "content " + /*contentClass*/
      ctx2[4] + " svelte-gas-lfe2zn")) {
        attr(div4, "class", div4_class_value);
      }
    },
    i(local) {
      if (current) return;
      transition_in(left_slot, local);
      transition_in(right_slot, local);
      current = true;
    },
    o(local) {
      transition_out(left_slot, local);
      transition_out(right_slot, local);
      current = false;
    },
    d(detaching) {
      if (detaching) {
        detach(div4);
      }
      if (if_block) if_block.d();
      if (left_slot) left_slot.d(detaching);
      if (right_slot) right_slot.d(detaching);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let $readOnlyTabs;
  component_subscribe($$self, readOnlyTabs, ($$value) => $$invalidate(6, $readOnlyTabs = $$value));
  let { $$slots: slots = {}, $$scope } = $$props;
  let { title = "" } = $$props;
  let { showTitle = false } = $$props;
  let { tabName = "" } = $$props;
  let { leftPanelClass = "" } = $$props;
  let { rightPanelClass = "" } = $$props;
  let { contentClass = "" } = $$props;
  $$self.$$set = ($$props2) => {
    if ("title" in $$props2) $$invalidate(0, title = $$props2.title);
    if ("showTitle" in $$props2) $$invalidate(1, showTitle = $$props2.showTitle);
    if ("tabName" in $$props2) $$invalidate(5, tabName = $$props2.tabName);
    if ("leftPanelClass" in $$props2) $$invalidate(2, leftPanelClass = $$props2.leftPanelClass);
    if ("rightPanelClass" in $$props2) $$invalidate(3, rightPanelClass = $$props2.rightPanelClass);
    if ("contentClass" in $$props2) $$invalidate(4, contentClass = $$props2.contentClass);
    if ("$$scope" in $$props2) $$invalidate(7, $$scope = $$props2.$$scope);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*tabName, $readOnlyTabs*/
    96) {
      tabName && $readOnlyTabs.includes(tabName);
    }
  };
  return [
    title,
    showTitle,
    leftPanelClass,
    rightPanelClass,
    contentClass,
    tabName,
    $readOnlyTabs,
    $$scope,
    slots
  ];
}
class StandardTabLayout extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {
      title: 0,
      showTitle: 1,
      tabName: 5,
      leftPanelClass: 2,
      rightPanelClass: 3,
      contentClass: 4
    });
  }
}
export {
  StandardTabLayout as S
};
//# sourceMappingURL=StandardTabLayout-9ZI_nKTM.js.map
