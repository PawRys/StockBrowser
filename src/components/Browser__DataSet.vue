<script setup>
import { inject, watchEffect } from 'vue';
import { db as idb } from '../utils/dexiedb.js';

const unfilteredData = inject('unfilteredData_global');
const dataSet = inject('dataSet_global');

const items = {
	'dataset-full': {
		label: 'Stany zerowe',
		count: await idb.products.count(),
	},
	'dataset-total': {
		label: 'Stany całkowite',
		count: await idb.products.where('tCub').above(0).count(),
	},
	'dataset-available': {
		label: 'Stany handlowe',
		count: await idb.products.where('aCub').above(0).count(),
	},
};

watchEffect(async () => {
	if (dataSet.value === 'dataset-full') {
		unfilteredData.value = await idb.products.toArray();
	}
	if (dataSet.value === 'dataset-total') {
		unfilteredData.value = await idb.products.where('tCub').above(0).toArray();
	}
	if (dataSet.value === 'dataset-available') {
		unfilteredData.value = await idb.products.where('aCub').above(0).toArray();
	}
});
</script>

<template>
	<section class="dataSet">
		<h4>Zestaw danych</h4>
		<label class="button inline" v-for="({ label, count }, set) in items" :for="set">
			<span>{{ label }}:</span>
			<input type="radio" name="dataset" :id="set" :value="set" v-model="dataSet" />
			<span>({{ count }})</span>
		</label>
	</section>
</template>

<style scoped>
.dataSet {
	display: grid;
	justify-items: start;
	gap: 0.5ex;
}
</style>
