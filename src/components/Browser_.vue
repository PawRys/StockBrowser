<script setup>
import { ref, reactive, provide, watchEffect } from 'vue';
import { db as idb } from '../assets/dexiedb.js';
import DataSet from './Browser_DataSet.vue';
import Filters from './Browser_Filter_.vue';
import Sorting from './Browser_Sorting.vue';
import VatSetup from './Browser_VatSetup.vue';
import Pagination from './Browser_Pagination.vue';
import Quantities from './Browser_Quantities.vue';
import PriceCalculator from './Browser_PriceCalculator_.vue';

const unfilteredProducts = ref();
const filteredProducts = ref();
const sortedProducts = ref();
const pagedProducts = ref();
provide('unfilteredProducts', unfilteredProducts);
provide('filteredProducts', filteredProducts);
provide('sortedProducts', sortedProducts);
provide('pagedProducts', pagedProducts);

const pageSize_global = ref(20);
const pageCount_global = ref(1);
const pageNumber_global = ref(1);
provide('pageSize_global', pageSize_global);
provide('pageCount_global', pageCount_global);
provide('pageNumber_global', pageNumber_global);

const dataSet = ref('dataset-total');
provide('dataSet_ref', dataSet);
watchEffect(async () => {
	console.time('change-dataset');
	if (dataSet.value === 'dataset-full') {
		unfilteredProducts.value = await idb.products.toArray();
	}
	if (dataSet.value === 'dataset-total') {
		unfilteredProducts.value = await idb.products.where('tCub').above(0).toArray();
	}
	if (dataSet.value === 'dataset-aviable') {
		unfilteredProducts.value = await idb.products.where('aCub').above(0).toArray();
	}
	console.timeEnd('change-dataset');
});

const vat = reactive({ m3: 1, m2: 1, szt: 1.23 });
provide('vat', vat);
</script>

<template>
	<h2 id="pageTop">Main Table</h2>
	<section>
		<DataSet />
	</section>
	<header class="header">
		<VatSetup />
		<Filters />
		<Sorting />
		<Pagination />
	</header>
	<ul class="list-container" v-if="pagedProducts && pagedProducts.length">
		<li v-for="ply in pagedProducts" :key="ply.code" class="list-item">
			<div style="grid-area: code" class="code">{{ ply.code }}</div>
			<div style="grid-area: name" class="name">{{ ply.name }}</div>
			<div style="grid-area: tags" class="tags">{{ ply.tags }}</div>
			<div style="grid-area: err" v-if="ply.error">
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
