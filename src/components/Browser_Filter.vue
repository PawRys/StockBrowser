<script setup>
import { ref, reactive, computed, watch, provide, inject } from 'vue';
const data = inject('filteredProducts');
const filter_ref = inject('filter_ref');
const filterCount_ref = inject('filterCount_ref');
const products_ref = inject('products_ref');

watch(data, () => {
	let grades = [];
	let sizes = [];
	let tags = [];
	let words = [];

	console.clear();
	for (const row of data.value) {
		let x = getProductGrade(`${row.code} ${row.name}`);
		grades.push(...x);
		sizes.push(row.size);
		tags.push(...row.tags.split(' '));
		let w = row.name.match(/\b\w+\b/gi) || [];
		words.push(...w);
	}
	grades = [...new Set(grades)];
	sizes = [...new Set(sizes)];
	tags = [...new Set(tags)];
	words = [...new Set(words)];
	console.log(grades.sort());
	console.log(`-----------`);
	console.log(sizes.sort());
	console.log(`-----------`);
	console.log(tags);
	console.log(`-----------`);
	console.log(words);
});

function getProductGrade(input) {
	const exp = '(KILO|BB|B|CP|C|WGE|WG|PQ|PF|F|WH|W|M)';
	const grade = input.match(new RegExp(`\\b${exp}{1}(\/${exp}){0,1}\\b`, 'gi'));
	return grade ? grade : ['??'];
}
</script>

<template>
	<section>
		<label for="filter">
			Szukaj:<input type="search" name="filter" id="filter" v-model="filter_ref" />
		</label>
		<div class="counter" style="grid-area: count">
			Rekordów: {{ filterCount_ref }} z {{ products_ref.length }}
		</div>
	</section>
</template>

<style scoped>
section {
	display: grid;
}
</style>
