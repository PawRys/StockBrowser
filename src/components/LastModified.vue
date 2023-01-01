<script setup>
import { ref, inject, watchEffect, watch } from 'vue';
import { db as idb } from '../utils/dexiedb.js';

const globalEvent = inject('GlobalEvents');
const test = ref();
const stocksModTime = ref({});
const pricesModTime = ref({});

watch(globalEvent, async () => {
	stocksModTime.value = await getDataModificationDate('stocks');
	pricesModTime.value = await getDataModificationDate('prices');
});
globalEvent.value = 'fake trigger';

async function getDataModificationDate(dataType) {
	let today = new Date().toJSON().split('T')[0];
	let modDate = await idb.timestamps.get(dataType);
	modDate = modDate?.timestamp.toJSON().split('T')[0];
	let diffDays = Math.abs(new Date(today) - new Date(modDate));
	diffDays = diffDays / 1000 / 60 / 60 / 24;
	// console.log(diffDays);

	return {
		date: modDate || 'brak danych',
		diff: diffDays,
	};
}

function inHuman(diff) {
	if (diff < 0) return '';
	if (diff === 0) return 'dziś';
	if (diff === 1) return 'wczoraj';
	if (diff > 1) return `${diff} dni`;
	// console.warn(`variable diff: ${diff} ${typeof diff}`);
	return `??`;
}
</script>

<template>
	<aside class="lastModified">
		<div class="lastModified__type" :class="{ red: pricesModTime.diff > 1 }">
			<span class="lastModified__label">Ceny:</span>
			<span class="lastModified__date">{{ pricesModTime.date }}</span>
			<span class="lastModified__diff">{{ inHuman(pricesModTime.diff) }}</span>
		</div>
		<div class="lastModified__type" :class="{ red: stocksModTime.diff > 1 }">
			<span class="lastModified__label">Stany:</span>
			<span class="lastModified__date">{{ stocksModTime.date }}</span>
			<span class="lastModified__diff">{{ inHuman(stocksModTime.diff) }}</span>
		</div>
	</aside>
</template>

<style scoped>
.lastModified {
	margin-block: 1rem;
}
.lastModified__type {
	display: grid;
	gap: 1ex;
	grid-template-columns: 1fr 1fr 1fr;
	width: fit-content;
}
.lastModified__type > * {
	white-space: nowrap;
}
.red {
	color: crimson;
}
</style>
