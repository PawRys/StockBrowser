<script setup>
import { ref, computed, watchEffect } from 'vue';
import { db as idb } from '../dexiedb.js';

const stocksModTime = ref({});
const pricesModTime = ref({});

watchEffect(async () => {
	stocksModTime.value = await getDataModificationDate('stocks');
	pricesModTime.value = await getDataModificationDate('prices');
});

async function getDataModificationDate(dataType) {
	let today = new Date().toJSON().split('T')[0];
	let modDate = await idb.timestamps.get(dataType);
	modDate = modDate.timestamp.toJSON().split('T')[0];
	let diffDays = Math.abs(new Date(today) - new Date(modDate));
	diffDays = diffDays / 1000 / 60 / 60 / 24;

	return {
		date: modDate,
		diff: diffDays,
	};
}

function inHuman(diff) {
	if (diff === 0) return 'dziś';
	if (diff === 1) return 'wczoraj';
	if (diff > 1) return `${diff} dni`;
	return `${diff} ??`;
}
</script>

<template>
	<aside class="lastModified">
		<p class="lastModified__type" :class="{ red: stocksModTime.diff > 1 }">
			<span class="lastMofified__label">Stany:</span>
			<span class="lastModified__date">{{ stocksModTime.date }}</span>
			<span class="lastModified__diff">{{ inHuman(stocksModTime.diff) }}</span>
		</p>
		<p class="lastModified__type" :class="{ red: pricesModTime.diff > 1 }">
			<span class="lastMofified__label">Ceny:</span>
			<span class="lastModified__date">{{ pricesModTime.date }}</span>
			<span class="lastModified__diff">{{ inHuman(pricesModTime.diff) }}</span>
		</p>
	</aside>
</template>

<style scoped>
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
