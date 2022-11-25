<script setup>
import { ref, reactive, computed, watch, provide, inject } from 'vue';
import { db as idb } from '../assets/dexiedb.js';
import Filters from './Browser_Filter.vue';
import Sorting from './Browser_Sorting.vue';
import VatSetup from './Browser_VatSetup.vue';
import Pagination from './Browser_Pagination.vue';
import Quantities from './Browser_Quantities.vue';
import DataSettings from './Browser_DataSettings.vue';
import PriceCalculator from './Browser_PriceCalculator_.vue';
import { calcPrice, calcQuant } from './DataCollector_Scripts.js';

console.time('DataTable');

const filter_ref = ref('');
const filterCount_ref = ref(1);
const pageSize_ref = ref(20);
const pageCount_ref = ref(1);
const pageNumber_ref = ref(1);
const sortParams = ref(['code', 1]);
const dataSet_ref = ref('dataset-total');
const products_ref = ref(
	await idb.products.where('tCub').above(0).sortBy('id')
);
const vat = reactive({ m3: 1, m2: 1, szt: 1.23 });

provide('filter_ref', filter_ref);
provide('filterCount_ref', filterCount_ref);
provide('products_ref', products_ref);
provide('pageSize_ref', pageSize_ref);
provide('pageCount_ref', pageCount_ref);
provide('pageNumber_ref', pageNumber_ref);
provide('sortParams', sortParams);
provide('dataSet_ref', dataSet_ref);
provide('vat', vat);

watch(dataSet_ref, async () => {
	if (dataSet_ref.value === 'dataset-full') {
		products_ref.value = await idb.products.toArray();
	}
	if (dataSet_ref.value === 'dataset-total') {
		products_ref.value = await idb.products
			.where('tCub')
			.above(0)
			.sortBy('id');
	}
	if (dataSet_ref.value === 'dataset-aviable') {
		products_ref.value = await idb.products
			.where('aCub')
			.above(0)
			.sortBy('id');
	}

	// console.log(products_ref.value);
});

const filteredProducts = computed(() => {
	const data = products_ref.value;
	let query = filter_ref.value
		.split(' ')
		.map((filter) => {
			console.log(filter);
			const isSize = /(?=(\d*x\d*x\d*))(?=\d+)/i.test(filter);
			const isWholeWord = /=/.test(filter) ? '\\b' : '';
			filter = filter.replace(/\|(?=(x|$))/g, '');
			filter = filter.replace(/(\?)/g, '\\$1');
			filter = filter.replace('=', '');
			let subQuery = '';
			if (isSize) {
				// filter = filter.replace(/\//g, '|');
				filter = filter
					.split('x')
					.map((subFilter) => {
						return subFilter.length > 0 ? `(${subFilter})` : '(\\d+)';
					})
					.join('x');
			}
			subQuery = `(?=.*${isWholeWord}(?<!,)(${filter})${isWholeWord})`;
			return subQuery;
		})
		.join('');

	console.log(query);
	return data.filter((row) => {
		const str = `${row.code} ${row.tags} ${row.name}`;
		return str.match(new RegExp(query, 'i'));
	});
});
provide('filteredProducts', filteredProducts);

const sortedProducts = computed(() => {
	if (!sortParams.value) sortParams.value = ['code', 1];
	const [column, direction] = sortParams.value;
	let data = filteredProducts.value;
	data = data.sort((a, b) => {
		const aSize = a.size;
		const bSize = b.size;
		const group = column.slice(0, 1);
		let unit = column.slice(-3);

		if (!unit.match(/Sqr|Pcs/)) {
			a = a[column];
			b = b[column];
		} else {
			if (unit === 'Sqr') unit = 'm2';
			if (unit === 'Pcs') unit = 'szt';
			if (group === 'p') {
				a = calcPrice(aSize, a[`${group}Cub`], 'm3', unit);
				b = calcPrice(bSize, b[`${group}Cub`], 'm3', unit);
			}
			if (group === 't' || group === 'a') {
				a = calcQuant(aSize, a[`${group}Cub`], 'm3', unit);
				b = calcQuant(bSize, b[`${group}Cub`], 'm3', unit);
			}
		}

		return (a === b ? 0 : a > b ? 1 : -1) * direction;
	});
	return data;
});

const paginatedProducts = computed(() => {
	let data = sortedProducts.value;
	const pageSize = pageSize_ref.value;
	const pageNumber = pageNumber_ref.value;
	const filterCount = data.length;
	const validPageSize = pageSize < 1 ? 1 : pageSize;
	const pageCount = Math.ceil(filterCount / validPageSize);
	const validPageNumber = pageNumber > pageCount ? pageCount : pageNumber || 1;
	const start = validPageNumber * validPageSize - validPageSize;
	const end = validPageNumber * validPageSize;
	data = data.slice(start, end);

	// Update UI
	pageCount_ref.value = pageCount;
	pageNumber_ref.value = validPageNumber;
	filterCount_ref.value = filterCount;

	return data;
});

console.timeEnd('DataTable');
</script>

<template>
	<h2 id="pageTop">Main Table</h2>
	<section>
		<DataSettings />

		<label for="filter">
			Szukaj:<input
				type="search"
				name="filter"
				id="filter"
				v-model="filter_ref" />
		</label>
		<div class="counter" style="grid-area: count">
			Rekordów: {{ filterCount_ref }} z {{ products_ref.length }}
		</div>
	</section>
	<header class="header">
		<Filters style="grid-area: fter" />
		<Sorting style="grid-area: sort" />
		<VatSetup style="grid-area: vats" />
		<Pagination style="grid-area: page" />
	</header>
	<ul class="list-container" v-if="paginatedProducts.length">
		<li v-for="ply in paginatedProducts" :key="ply.code" class="list-item">
			<div style="grid-area: code" class="code">{{ ply.code }}</div>
			<div style="grid-area: name" class="name">{{ ply.name }}</div>
			<div style="grid-area: tags" class="tags">{{ ply.tags }}</div>
			<div style="grid-area: err" v-if="ply.error.length">
				<span v-for="error of ply.error">{{ error }}</span>
			</div>

			<Quantities :total="ply.tCub" :aviable="ply.aCub" :size="ply.size" />
			<PriceCalculator :plySize="ply.size" :buyPrice="ply.pCub" />
		</li>
	</ul>
	<p v-else>Nie znaleziono produktów.</p>
	<footer style="display: flex">
		<Pagination style="margin-left: auto" />
	</footer>
</template>

<style>
#filter {
	width: 100%;
}

.header {
	display: grid;
	align-items: center;
	gap: 1ch;
	grid-template-columns: repeat(3, 1fr);
	grid-template-areas:
		'fter fter fter'
		'sort vats page';
}
.sorting {
	justify-self: left;
}
.pagination {
	justify-self: right;
}
.vatsetup {
	justify-self: center;
}
.counter {
	justify-self: center;
}

.list-container {
	padding: 0;
}

.list-item {
	margin-block: 1rem;
	padding: 0.5ex 1ex;

	display: grid;
	gap: 0.5ch;
	grid-template-columns: repeat(2, 2fr) repeat(6, minmax(max-content, 11ch));
	grid-template-areas:
		'code tags tCub tSqr tPcs pCub pSqr pPcs'
		'name name aCub aSqr aPcs buyp marg perc'
		'err  err  err  err  err  err  err  err  ';
}

[class*='price'],
[class*='quantity'] {
	text-align: right;
	/* color: tomato; */
}

:is(.code, .tags) {
	font-weight: 300;
}

/* [class*='price']:not(.buyp) { */
/* background-color: whitesmoke;
	box-shadow: 0 0 0 5px; */
/* font-style: italic; */
/* font-weight: 300; */
/* color: cadetblue; */
/* } */

[class*='total'] {
	font-weight: 600;
}

.flex-column {
	display: flex;
	flex-direction: column;
}
</style>
