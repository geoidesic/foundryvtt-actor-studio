<script>
import SvelteSelect from 'svelte-select';
import IconSelect from '~/src/components/atoms/select/IconSelect.svelte';
import { extractMapIteratorObjectProperties, getPackFolders } from "~/src/helpers/Utility.js";

// export const actor;

let items = [
	{ value: 'one', label: 'One', icon: "fas fa-image" },
	{ value: 'two', label: 'Two' },
	{ value: 'three', label: 'Three' },
	{ value: 'four', label: 'Four' },
	{ value: 'five', label: 'Five' },
	{ value: 'six', label: 'Six' },
	{ value: 'seven', label: 'Seven' },
];
let filterText;
let floatingConfig = {
	strategy: 'fixed',
};

let active = null;
let value = null;

let handler = async (option) => {
	const race = await fromUuid(option);
	let active = option;  
}

// $: pack = game.packs.get('dnd5e.races');

let pack = game.packs.get('dnd5e.races');
let folders = getPackFolders(pack, 1);
let folderIds = folders.map(x => x._id);
let allRaceItems = extractMapIteratorObjectProperties(pack.index.entries(), ['name->label','img', 'type', 'folder', 'uuid->value', '_id']);
let raceDefinitions = allRaceItems.filter(x => folderIds.includes(x.folder));

console.log('folders', folders);
console.log('folderIds', folderIds);
console.log('allRaceItems', allRaceItems);
console.log('raceDefinitions', raceDefinitions);

// let placeHolder = {
// 	label: "Races",
// 	value: -1
// }

let placeHolder = "Races";

const addItemToCharacter = async (itemData) => {
	itemData = itemData instanceof Array ? itemData : [itemData];
	return this.actor.createEmbeddedDocuments("Item", itemData);
}

$: options = raceDefinitions;
$: console.log(options);
</script>

<template lang="pug">
div.tab-content
	h1 Race
	+if("value")
		button(label="Submit") Next
	IconSelect({options} {handler} {active} bind:value {placeHolder} id="asdlfkj")
</template>

<style lang="scss" scoped>
.tab-content {
	--tjs-app-overflow: visible;
}
</style>