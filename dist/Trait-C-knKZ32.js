import { S as SvelteComponent, i as init, s as safe_not_equal, e as element, a as empty, b as attr, c as insert, d as append, A as noop, j as detach, o as onMount, z as ensure_array_like, B as destroy_each, F as text, G as set_data, an as ucfirst, bd as writable } from "./index-9xkAWKkS.js";
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[9] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[12] = list[i];
  return child_ctx;
}
function get_each_context_2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[15] = list[i];
  return child_ctx;
}
function create_if_block_4(ctx) {
  let each_1_anchor;
  let each_value_2 = ensure_array_like(
    /*grants*/
    ctx[1]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_2.length; i += 1) {
    each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
  }
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert(target, each_1_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & /*grants*/
      2) {
        each_value_2 = ensure_array_like(
          /*grants*/
          ctx2[1]
        );
        let i;
        for (i = 0; i < each_value_2.length; i += 1) {
          const child_ctx = get_each_context_2(ctx2, each_value_2, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_2(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_2.length;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(each_1_anchor);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_if_block_5(ctx) {
  let div;
  let t_value = (
    /*grant*/
    ctx[15].value + ""
  );
  let t;
  return {
    c() {
      div = element("div");
      t = text(t_value);
      attr(div, "class", "flex0 right badge inset nowrap svelte-gas-1ytcpk3");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, t);
    },
    p(ctx2, dirty) {
      if (dirty & /*grants*/
      2 && t_value !== (t_value = /*grant*/
      ctx2[15].value + "")) set_data(t, t_value);
    },
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_each_block_2(ctx) {
  let div1;
  let div0;
  let t_value = (
    /*grant*/
    ctx[15].label + ""
  );
  let t;
  let if_block = (
    /*grant*/
    ctx[15].value && create_if_block_5(ctx)
  );
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      t = text(t_value);
      if (if_block) if_block.c();
      attr(div0, "class", "flex left");
      attr(div1, "class", "flexrow");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, div0);
      append(div0, t);
      if (if_block) if_block.m(div1, null);
    },
    p(ctx2, dirty) {
      if (dirty & /*grants*/
      2 && t_value !== (t_value = /*grant*/
      ctx2[15].label + "")) set_data(t, t_value);
      if (
        /*grant*/
        ctx2[15].value
      ) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block_5(ctx2);
          if_block.c();
          if_block.m(div1, null);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div1);
      }
      if (if_block) if_block.d();
    }
  };
}
function create_if_block(ctx) {
  let each_1_anchor;
  let each_value = ensure_array_like(
    /*choices*/
    ctx[3]
  );
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert(target, each_1_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & /*choices, game, fromAll*/
      12) {
        each_value = ensure_array_like(
          /*choices*/
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
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value.length;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(each_1_anchor);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_else_block_1(ctx) {
  let div2;
  let div0;
  let span0;
  let span1;
  let div1;
  return {
    c() {
      div2 = element("div");
      div0 = element("div");
      span0 = element("span");
      span0.textContent = "Choose ";
      span1 = element("span");
      span1.textContent = `${/*choice*/
      ctx[9].count} `;
      div1 = element("div");
      div1.textContent = "any";
      attr(div0, "class", "flex");
      attr(div1, "class", "flex0 badge inset right svelte-gas-1ytcpk3");
      attr(div2, "class", "flexrow");
    },
    m(target, anchor) {
      insert(target, div2, anchor);
      append(div2, div0);
      append(div0, span0);
      append(div0, span1);
      append(div2, div1);
    },
    p: noop,
    d(detaching) {
      if (detaching) {
        detach(div2);
      }
    }
  };
}
function create_if_block_1(ctx) {
  let div;
  let h3;
  let span0;
  let span1;
  let span2;
  let each_1_anchor;
  let each_value_1 = ensure_array_like(
    /*choice*/
    ctx[9].pool
  );
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  }
  return {
    c() {
      div = element("div");
      h3 = element("h3");
      span0 = element("span");
      span0.textContent = "Choose ";
      span1 = element("span");
      span1.textContent = ` ${/*choice*/
      ctx[9].count}  `;
      span2 = element("span");
      span2.textContent = "of the following:";
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
      attr(h3, "class", "flex");
      attr(div, "class", "flexrow");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      append(div, h3);
      append(h3, span0);
      append(h3, span1);
      append(h3, span2);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert(target, each_1_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & /*game, choices*/
      8) {
        each_value_1 = ensure_array_like(
          /*choice*/
          ctx2[9].pool
        );
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1(ctx2, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_1.length;
      }
    },
    d(detaching) {
      if (detaching) {
        detach(div);
        detach(each_1_anchor);
      }
      destroy_each(each_blocks, detaching);
    }
  };
}
function create_if_block_2(ctx) {
  let if_block_anchor;
  function select_block_type_1(ctx2, dirty) {
    if (
      /*pool*/
      ctx2[12].type == "tool"
    ) return create_if_block_3;
    return create_else_block;
  }
  let current_block_type = select_block_type_1(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, dirty) {
      if_block.p(ctx2, dirty);
    },
    d(detaching) {
      if (detaching) {
        detach(if_block_anchor);
      }
      if_block.d(detaching);
    }
  };
}
function create_else_block(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      div.textContent = `${ucfirst(
        /*pool*/
        ctx[12].value
      )}`;
      attr(div, "class", "flex0 right badge inset svelte-gas-1ytcpk3");
    },
    m(target, anchor) {
      insert(target, div, anchor);
    },
    p: noop,
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_if_block_3(ctx) {
  let div;
  return {
    c() {
      div = element("div");
      div.textContent = `${game.system.config.toolProficiencies[
        /*pool*/
        ctx[12].value
      ]}`;
      attr(div, "class", "flex0 right badge inset nowrap svelte-gas-1ytcpk3");
    },
    m(target, anchor) {
      insert(target, div, anchor);
    },
    p: noop,
    d(detaching) {
      if (detaching) {
        detach(div);
      }
    }
  };
}
function create_each_block_1(ctx) {
  let div1;
  let div0;
  let if_block = (
    /*pool*/
    ctx[12].value && create_if_block_2(ctx)
  );
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      div0.textContent = `${/*pool*/
      ctx[12].label}`;
      if (if_block) if_block.c();
      attr(div0, "class", "flex left");
      attr(div1, "class", "flexrow");
    },
    m(target, anchor) {
      insert(target, div1, anchor);
      append(div1, div0);
      if (if_block) if_block.m(div1, null);
    },
    p(ctx2, dirty) {
      if (
        /*pool*/
        ctx2[12].value
      ) if_block.p(ctx2, dirty);
    },
    d(detaching) {
      if (detaching) {
        detach(div1);
      }
      if (if_block) if_block.d();
    }
  };
}
function create_each_block(ctx) {
  let if_block_anchor;
  function select_block_type(ctx2, dirty) {
    if (!/*fromAll*/
    ctx2[2](
      /*choice*/
      ctx2[9].pool
    )) return create_if_block_1;
    return create_else_block_1;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_block.m(target, anchor);
      insert(target, if_block_anchor, anchor);
    },
    p(ctx2, dirty) {
      if_block.p(ctx2, dirty);
    },
    d(detaching) {
      if (detaching) {
        detach(if_block_anchor);
      }
      if_block.d(detaching);
    }
  };
}
function create_fragment(ctx) {
  let div;
  let if_block0_anchor;
  let div_data_type_value;
  let if_block0 = (
    /*grants*/
    ctx[1].length > 0 && create_if_block_4(ctx)
  );
  let if_block1 = (
    /*choices*/
    ctx[3].length > 0 && create_if_block(ctx)
  );
  return {
    c() {
      div = element("div");
      if (if_block0) if_block0.c();
      if_block0_anchor = empty();
      if (if_block1) if_block1.c();
      attr(div, "class", "advancement mt-sm svelte-gas-1ytcpk3");
      attr(div, "data-type", div_data_type_value = /*advancement*/
      ctx[0].type);
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if (if_block0) if_block0.m(div, null);
      append(div, if_block0_anchor);
      if (if_block1) if_block1.m(div, null);
    },
    p(ctx2, [dirty]) {
      if (
        /*grants*/
        ctx2[1].length > 0
      ) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
        } else {
          if_block0 = create_if_block_4(ctx2);
          if_block0.c();
          if_block0.m(div, if_block0_anchor);
        }
      } else if (if_block0) {
        if_block0.d(1);
        if_block0 = null;
      }
      if (
        /*choices*/
        ctx2[3].length > 0
      ) if_block1.p(ctx2, dirty);
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
      if (if_block0) if_block0.d();
      if (if_block1) if_block1.d();
    }
  };
}
function getBaseItemUUID(identifier) {
  if (!identifier) {
    return null;
  }
  window.GAS.log.d("identifier", identifier);
  let pack = CONFIG.DND5E.sourcePacks.ITEMS;
  let [scope, collection, id] = identifier.split(".");
  if (scope && collection) pack = `${scope}.${collection}`;
  if (!id) id = identifier;
  return `Compendium.${pack}.Item.${id}`;
}
function instance($$self, $$props, $$invalidate) {
  let { advancement = null } = $$props;
  let grants = [];
  const morphPool = (p) => {
    const arr = Array.from(p);
    const nuarr = arr.map((x) => {
      const split = x.split(":");
      if (split[2]) {
        return {
          all: false,
          label: split[2],
          value: split[1],
          type: split[0]
        };
      }
      return {
        all: true,
        label: split[0],
        value: split[1]
      };
    });
    return nuarr;
  };
  const fromAll = (p) => {
    return p.some((x) => {
      return x.all;
    });
  };
  let choices = advancement.configuration.choices.map((c) => {
    return { count: c.count, pool: morphPool(c.pool) };
  });
  const item = writable(null);
  const fetchAndSetItem = async (uuid) => {
    const itemObj = await fromUuid(uuid);
    item.set(itemObj);
  };
  const processGrant = async (grant) => {
    const split = grant.split(":");
    switch (split[0]) {
      case "languages":
        return {
          label: ucfirst(split[1]),
          value: ucfirst(split[2])
        };
      case "tool":
        if (split[2]) {
          return {
            label: ucfirst(split[2]),
            value: game.system.config.toolProficiencies[split[1]]
          };
        } else {
          const uuid = getBaseItemUUID(CONFIG.DND5E.toolIds[split[1]]);
          await fetchAndSetItem(uuid);
          let fetchedItem;
          item.subscribe((value) => {
            fetchedItem = value;
          })();
          return {
            label: fetchedItem?.name,
            value: game.system.config.toolProficiencies[split[1]]
          };
        }
      case "saves":
        return {
          label: game.system.config.abilities[split[1]].label,
          value: null
        };
      case "armor":
        return {
          label: game.system.config.armorProficiencies[split[1]],
          value: null
        };
      case "weapon":
        if (split[2]) {
          return {
            label: ucfirst(split[2]),
            value: game.system.config.weaponProficiencies[split[1]]
          };
        } else {
          return {
            label: game.system.config.weaponProficiencies[split[1]],
            value: null
          };
        }
      case "dr":
        return {
          label: game.system.config.damageTypes[split[1]].label,
          value: split[1]
        };
      default:
        return {
          label: game.system.config[split[0]][split[1]].label,
          value: ""
        };
    }
  };
  const initializeGrants = async () => {
    const grantPromises = Array.from(advancement.configuration.grants).map(processGrant);
    $$invalidate(1, grants = await Promise.all(grantPromises));
  };
  onMount(async () => {
    if (advancement.configuration.grants.size > 0) {
      await initializeGrants();
    }
  });
  $$self.$$set = ($$props2) => {
    if ("advancement" in $$props2) $$invalidate(0, advancement = $$props2.advancement);
  };
  return [advancement, grants, fromAll, choices];
}
class Trait extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { advancement: 0 });
  }
}
export {
  Trait as default
};
//# sourceMappingURL=Trait-C-knKZ32.js.map
