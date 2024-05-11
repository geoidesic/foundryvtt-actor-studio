<script>
import SvelteSelect from 'svelte-select';
import IconSelect from '~/src/components/atoms/select/IconSelect.svelte';
import { extractMapIteratorObjectProperties } from "~/src/helpers/Utility.js";

let items = [
	{ value: 'one', label: 'One', icon: "fas fa-image" },
	{ value: 'two', label: 'Two' },
	{ value: 'three', label: 'Three' },
	{ value: 'four', label: 'Four' },
	{ value: 'five', label: 'Five' },
	{ value: 'six', label: 'Six' },
	{ value: 'seven', label: 'Seven' },
];
let options = [...items];
let filterText;
let floatingConfig = {
	strategy: 'fixed',
};

let active = null;
let value = null;

let handler = async (option) => {
	console.log(await fromUuid(option));
}

// $: pack = game.packs.get('dnd5e.races');

let pack = game.packs.get('dnd5e.races');
console.log(pack);


$: options = extractMapIteratorObjectProperties(pack.index.entries(), ['name->label','img', 'type', 'folder', 'uuid->value', '_id']);
$: console.log(options);
</script>

<template lang="pug">
div.tab-content
	h1 Race
	//- SvelteSelect(
	//- 	{items} 
	//- 	bind:filterText 
	//- 	floatingConfig 
	//- 	listOpen
	//- 	loading
	//- 	placeholder="jmsp"
	//- )
	IconSelect({options} {handler} {active} {value} id="asdlfkj")
</template>

<style lang="scss" scoped>
.tab-content {
	--tjs-app-overflow: visible;
}
</style>