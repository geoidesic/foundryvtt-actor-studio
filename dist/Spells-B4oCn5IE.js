import { S as SvelteComponent, i as init, s as safe_not_equal, e as element, b as attr, c as insert, d as append, A as noop, j as detach, n as getContext, k as component_subscribe, o as onMount, p as getRules, q as tick } from "./index-CcbYbLK_.js";
function create_fragment(ctx) {
  let div4;
  let div3;
  let div0;
  let div1;
  let div2;
  return {
    c() {
      div4 = element("div");
      div3 = element("div");
      div0 = element("div");
      div1 = element("div");
      div1.innerHTML = ``;
      div2 = element("div");
      attr(div0, "class", "flex2 pr-sm col-a");
      attr(div1, "class", "flex0 border-right right-border-gradient-mask");
      attr(div2, "class", "flex3 left pl-md scroll col-b");
      attr(div3, "class", "flexrow svelte-gas-lfe2zn");
      attr(div4, "class", "content svelte-gas-lfe2zn");
    },
    m(target, anchor) {
      insert(target, div4, anchor);
      append(div4, div3);
      append(div3, div0);
      append(div3, div1);
      append(div3, div2);
      div2.innerHTML = /*richHTML*/
      ctx[0];
    },
    p(ctx2, [dirty]) {
      if (dirty & /*richHTML*/
      1) div2.innerHTML = /*richHTML*/
      ctx2[0];
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching) {
        detach(div4);
      }
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let html;
  let $actor;
  const actor = getContext("#doc");
  component_subscribe($$self, actor, (value) => $$invalidate(3, $actor = value));
  const ruleConfig = {
    journalId: "QvPDSUsAiEn3hD8s",
    pageId: "evx9TWix4wYU51a5"
  };
  let rules = "", richHTML = "";
  onMount(async () => {
    $$invalidate(2, rules = await getRules(ruleConfig));
    await tick();
    $$invalidate(0, richHTML = await TextEditor.enrichHTML(html));
  });
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*$actor*/
    8) {
      $actor.toObject();
    }
    if ($$self.$$.dirty & /*rules*/
    4) {
      html = rules?.content || "";
    }
  };
  return [richHTML, actor, rules, $actor];
}
class Spells extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, {});
  }
}
export {
  Spells as default
};
//# sourceMappingURL=Spells-B4oCn5IE.js.map
