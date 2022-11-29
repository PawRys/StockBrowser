<script setup>
import { inject } from 'vue';
import { db as idb } from '../assets/dexiedb.js';

const dataSet_ref = inject('dataSet_ref');

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
</script>

<template>
	<section class="data-set">
		<label v-for="(attr, set) in sets" :for="set">
			{{ attr.label }}:
			<input
				type="radio"
				name="dataset"
				:id="set"
				:value="set"
				v-model="dataSet_ref" />
			({{ attr.count }})
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
