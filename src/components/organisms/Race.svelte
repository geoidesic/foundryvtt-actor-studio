<script>
import SvelteSelect from 'svelte-select';
import IconSelect from '~/src/components/atoms/select/IconSelect.svelte';
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

let item = {
	update: () => {
		console.log('update item')
	}
}
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
	IconSelect({item} {options} active="three" value="three")
</template>

<style lang="scss" scoped>
.tab-content {
	--tjs-app-overflow: visible;
}
</style>