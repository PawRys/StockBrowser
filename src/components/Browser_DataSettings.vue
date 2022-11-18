<script setup>
import { ref, computed, watch, inject } from 'vue';
import { db as idb } from '../assets/dexiedb.js';

const dataSet_ref = inject('dataSet_ref');

const one = await idb.products.count();
const two = await idb.products.where('tCub').above(0).count();
const tre = await idb.products.where('aCub').above(0).count();
</script>

<template>
	<div class="flex-column">
		<label for="dataset-full">
			Stany zerowe:
			<input
				type="radio"
				name="dataset"
				id="dataset-full"
				value="dataset-full"
				v-model="dataSet_ref" />
			({{ one }})
		</label>
		<label for="dataset-total">
			Stany całkowite:
			<input
				type="radio"
				name="dataset"
				id="dataset-total"
				value="dataset-total"
				v-model="dataSet_ref"
				checked />
			({{ two }})
		</label>
		<label for="dataset-aviable">
			Stany handlowe:
			<input
				type="radio"
				name="dataset"
				id="dataset-aviable"
				value="dataset-aviable"
				v-model="dataSet_ref" />
			({{ tre }})
		</label>
	</div>
</template>

<style scoped></style>
