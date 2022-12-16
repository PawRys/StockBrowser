<script setup>
import { inject, watchEffect } from 'vue';
import { db as idb } from '../dexiedb.js';

const unfilteredData = inject('unfilteredData_global');
const dataSet = inject('dataSet_global');

console.time('count-dataset');
const sets = {
	'dataset-full': {
		label: 'Stany zerowe',
		count: await idb.products.count(),
	},
	'dataset-total': {
		label: 'Stany całkowite',
		count: await idb.products.where('tCub').above(0).count(),
	},
	'dataset-aviable': {
		label: 'Stany handlowe',
		count: await idb.products.where('aCub').above(0).count(),
	},
};
console.timeEnd('count-dataset');

watchEffect(async () => {
	console.time('change-dataset');
	if (dataSet.value === 'dataset-full') {
		unfilteredData.value = await idb.products.toArray();
	}
	if (dataSet.value === 'dataset-total') {
		unfilteredData.value = await idb.products.where('tCub').above(0).toArray();
	}
	if (dataSet.value === 'dataset-aviable') {
		unfilteredData.value = await idb.products.where('aCub').above(0).toArray();
	}
	console.timeEnd('change-dataset');
});
</script>

<template>
	<section class="data-set">
		<label v-for="({ label, count }, set) in sets" :for="set">
			{{ label }}:
			<input type="radio" name="dataset" :id="set" :value="set" v-model="dataSet" />
			({{ count }})
		</label>
	</section>
</template>

<style scoped>
.data-set {
	display: grid;
}

.data-set > label {
	cursor: pointer;
}
</style>
