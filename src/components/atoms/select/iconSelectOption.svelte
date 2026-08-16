<script>
	import SelectOptionIcon from './SelectOptionIcon.svelte';
	import SelectOptionLabel from './SelectOptionLabel.svelte';

	export let option;
	export let value = '';
	export let highlighted = false;
	export let optionIndex = -1;
	export let onSelect;
	export let textOnly;
	export let shrinkIfNoIcon = true;
	export let enableEnrichment = false;
	export let showPackLabel = false;
	export let label;

	function handleClick() {
		onSelect(option);
	}
</script>

<template lang="pug">
div.option(
	role="option"
	on:click|stopPropagation|preventDefault="{handleClick}"
	tabindex!="{option.value === value ? '-1' : '0'}"
	class:highlighted="{highlighted}"
	class:is-current-selection!="{option.value === value}"
	data-index="{optionIndex}"
	aria-selected="{highlighted}"
	aria-disabled!="{option.value === value}"
)
	+if("!textOnly(option) && shrinkIfNoIcon")
		SelectOptionIcon(option="{option}")
	SelectOptionLabel(
		label="{label}"
		enrichedLabel="{option.enrichedLabel}"
		enableEnrichment="{enableEnrichment}"
		showPackLabel="{showPackLabel}"
		sourceBook="{option.sourceBook || option.packId || option.value}"
	)
</template>
