import { S as SvelteComponent, i as init, s as safe_not_equal, o as onMount } from "./index-B8GR6j_U.js";
function instance($$self, $$props, $$invalidate) {
  let { advancement = null } = $$props;
  onMount(async () => {
  });
  $$self.$$set = ($$props2) => {
    if ("advancement" in $$props2) $$invalidate(0, advancement = $$props2.advancement);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & /*advancement*/
    1) {
      advancement.configuration.sizes;
    }
  };
  return [advancement];
}
class HitPoints extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, null, safe_not_equal, { advancement: 0 });
  }
}
export {
  HitPoints as default
};
//# sourceMappingURL=HitPoints-CYaVn2qZ.js.map
