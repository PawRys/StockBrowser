<script setup>
import { ref, reactive, watch, provide, watchEffect } from 'vue';
import { db as idb } from '../assets/dexiedb.js';
import Filters from './Browser_Filter_.vue';
import Sorting from './Browser_Sorting.vue';
import VatSetup from './Browser_VatSetup.vue';
import Pagination from './Browser_Pagination.vue';
import Quantities from './Browser_Quantities.vue';
import DataSettings from './Browser_DataSettings.vue';
import PriceCalculator from './Browser_PriceCalculator_.vue';

console.time('DataTable');

const productsSet = ref('dataset-total');
const unfilteredProducts = ref(await idb.products.where('tCub').above(0).sortBy('id'));
const filteredProducts = ref();
const sortedProducts = ref();
const pagedProducts = ref();
const showProducts = ref();
const vat = reactive({ m3: 1, m2: 1, szt: 1.23 });

provide('unfilteredProducts', unfilteredProducts);
provide('filteredProducts', filteredProducts);
provide('sortedProducts', sortedProducts);
provide('pagedProducts', pagedProducts);
provide('dataSet_ref', productsSet);
provide('vat', vat);

watchEffect(() => {
	showProducts.value =
		pagedProducts.value ||
		sortedProducts.value ||
		filteredProducts.value ||
		unfilteredProducts.value ||
		null;
});

watch(productsSet, async () => {
	if (productsSet.value === 'dataset-full') {
		unfilteredProducts.value = await idb.products.toArray();
	}
	if (productsSet.value === 'dataset-total') {
		unfilteredProducts.value = await idb.products.where('tCub').above(0).sortBy('id');
	}
	if (productsSet.value === 'dataset-aviable') {
		unfilteredProducts.value = await idb.products.where('aCub').above(0).sortBy('id');
	}
});

console.timeEnd('DataTable');
</script>

<template>
	<h2 id="pageTop">Main Table</h2>
	<section>
		<DataSettings />
	</section>
	<header class="header">
		<Filters />
		<Sorting />
		<VatSetup />
		<Pagination />
	</header>
	<ul class="list-container" v-if="showProducts">
		<li v-for="ply in showProducts" :key="ply.code" class="list-item">
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
		<!-- <Pagination style="margin-left: auto" /> -->
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
