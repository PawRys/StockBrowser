<script setup>
import { ref, inject, watchEffect, watch } from 'vue';

const unfilteredData = inject('unfilteredProducts');
const returnToParent = inject('filteredProducts');
const userFilter = ref('');

// watch(userFilter, () => {
watchEffect(() => {
	console.time('filtering');
	let data = unfilteredData.value;
	let query = userFilter.value;
	query = query.split(' ');
	query = query.map(filter => {
		const trimPipes = /^\|+|\|+$/g;
		const isSize = /\d*x[\d\|]*x\d*/i.test(filter);
		const wholeWordsOnly = /=/.test(filter) || isSize ? '\\b' : '';
		filter = filter.replace(trimPipes, '');
		filter = filter.replace(/(\?)/g, '\\$1');
		filter = filter.replace('=', '');
		let subQuery = '';
		if (isSize) {
			filter = filter
				.split('x')
				.map(subFilter => {
					subFilter = subFilter.replace(trimPipes, '');
					return subFilter.length > 0 ? `(${subFilter})` : '(\\d+)';
				})
				.join('x');
		}
		subQuery = `(?=.*${wholeWordsOnly}(?<!,)(${filter})${wholeWordsOnly})`;
		return subQuery;
	});
	query = query.join('');

	data = data.filter(row => {
		const str = `${row.code} ${row.tags} ${row.name}`;
		return str.match(new RegExp(query, 'i'));
	});

	returnToParent.value = data;
	console.timeEnd('filtering');
});
</script>

<template>
	<section class="filters" style="grid-area: fter">
		<label for="filter">
			Szukaj:<input type="search" name="filter" id="filter" v-model="userFilter" />
		</label>
		<div class="counter" style="grid-area: count">
			Rekordów: {{ returnToParent.length }} z {{ unfilteredData.length }}
		</div>
	</section>
</template>

<style scoped>
section {
	display: grid;
	/* grid-area: fter; */
}
</style>
