<script setup>
import { ref, inject, watch, provide } from 'vue';
import SearchTags from './Browser_Filter_Tags.vue';

const unfilteredData = inject('unfilteredData_global');
const filteredData = inject('filteredData_global');
const userFilter = ref('');
provide('userFilter', userFilter);

watch([userFilter, unfilteredData], () => {
	let data = unfilteredData.value;
	if (!data) return;

	let filterString = userFilter.value;
	let fliterRegexp = convertStringToRegexp(filterString);

	data = data.filter(row => {
		const str = `${row.code} ${row.tags} ${row.name}`;
		return str.match(new RegExp(fliterRegexp, 'i'));
	});

	filteredData.value = data;
});

function convertStringToRegexp(str) {
	return str
		.split(' ')
		.map(filter => {
			const trimPipes = /^\|+|\|+$/g;
			const isDimension = /\d*x[\d\|]*x\d*/i.test(filter);
			const wholeWordsOnly = /=/.test(filter) ? '\\b' : '';
			let subQuery = '';

			filter = filter.replace('=', '');
			filter = filter.replace(trimPipes, '');
			filter = filter.replace(/(\?)/g, '\\$1');
			if (isDimension) {
				filter = filter
					.split('x')
					.map(subFilter => {
						subFilter = subFilter.replace(trimPipes, '');
						return subFilter.length > 0 ? `(${subFilter})` : '(\\d+)';
					})
					.join('x');
				filter = `(?<!,)${filter}(mm)?`;
			}
			subQuery = `(?=.*${wholeWordsOnly}(${filter})${wholeWordsOnly})`;
			return subQuery;
		})
		.join('');
}
</script>

<template>
	<section class="filters" style="grid-area: fltr">
		<label for="filter">
			Szukaj:<input type="search" name="filter" id="filter" v-model="userFilter" />
		</label>
		<span class="counter" style="grid-area: count">
			Rekordów: {{ filteredData ? filteredData.length : 0 }} z
			{{ unfilteredData ? unfilteredData.length : 0 }}
		</span>
		<div class="tags">
			<SearchTags />
		</div>
	</section>
</template>

<style scoped>
#filter {
	width: 100%;
}

.filters {
	margin-top: 1rem;
	margin-bottom: 3rem;
}
</style>
