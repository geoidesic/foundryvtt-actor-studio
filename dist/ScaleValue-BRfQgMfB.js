import { S as SvelteComponent, i as init, s as safe_not_equal, o as onMount } from "./index-B-uGecMo.js";
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
class ScaleValue extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, null, safe_not_equal, { advancement: 0 });
  }
}
export {
  ScaleValue as default
};
//# sourceMappingURL=ScaleValue-BRfQgMfB.js.map
