<script>
  import { localize as t } from "~/src/helpers/Utility";
  import { getAdvancementValue } from "~/src/helpers/Utility";

  export let advancements = [];
  export let components = {};
  export let tooltipLocked = false;
  export let emptyMessage = true;
</script>

<template lang="pug">
ul.icon-list
  +if("!advancements.length && emptyMessage")
    li.left {t('NoAdvancements')}
  +each("advancements as advancement")
    li.left(data-type="{advancement.type}")
      .flexrow(data-tooltip="{getAdvancementValue(advancement)}" data-tooltip-locked="{tooltipLocked}" data-tooltip-class="gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip")
        .flex0.relative.image
          img.icon(src="{advancement.icon}" alt="{advancement.title}")
        .flex2 {advancement.title}
      .flexrow
        svelte:component(this="{components[advancement.type]}" advancement="{advancement}")
</template>
