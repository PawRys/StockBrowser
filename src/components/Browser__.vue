<script setup>
import { ref, reactive, provide, watchEffect } from 'vue';
import { db as idb } from '../utils/dexiedb.js';

import Prices from './Browser__Prices.vue';
import DataSet from './Browser__DataSet.vue';
import Filters from './Browser__Filters.vue';
import Sorting from './Browser__Sorting.vue';
import VatSetup from './Browser__VatSetup.vue';
import Inventory from './Browser__Inventory.vue';
import Pagination from './Browser__Pagination.vue';
import Quantities from './Browser__Quantities.vue';
import { animateScrollTo } from '../utils/functions.js';

const unfilteredData_global = ref([]);
const filteredData_global = ref([]);
const sortedData_global = ref([]);
const pagedData_global = ref([]);
provide('unfilteredData_global', unfilteredData_global);
provide('filteredData_global', filteredData_global);
provide('sortedData_global', sortedData_global);
provide('pagedData_global', pagedData_global);

const pageSize_global = ref(12);
const pageCount_global = ref(1);
const pageNumber_global = ref(1);
provide('pageSize_global', pageSize_global);
provide('pageCount_global', pageCount_global);
provide('pageNumber_global', pageNumber_global);

const dataSet_global = ref('dataset-total');
provide('dataSet_global', dataSet_global);

const dataMode = ref('dataMode__inventory');
// watchEffect(() => {
// 	console.log(sortedData_global.value);
// });

const vatVal = 1.23;
const vat = reactive({ m3: 1, m2: 1, szt: vatVal });
provide('vatVal', vatVal);
provide('vat', vat);

function wrapText(text) {
	return text.replace(/(\d+(,\d+)?x\d+x\d+)/gi, '<b>$1</b>');
}
</script>

<template>
	<h2>Lista produktów</h2>

	<section id="search">
		<DataSet />
		<Filters />
	</section>

	<section class="productList" :class="dataMode" id="results">
		<div class="dataMode">
			<label class="button" for="dataMode__trade">
				<span>Handel</span>
				<input
					type="radio"
					name="dataMode"
					value="dataMode__trade"
					v-model="dataMode"
					id="dataMode__trade" />
			</label>
			<label class="button" for="dataMode__inventory">
				<span>Inwenaryzacja</span>
				<input
					type="radio"
					name="dataMode"
					value="dataMode__inventory"
					v-model="dataMode"
					checked="true"
					id="dataMode__inventory" />
			</label>
		</div>

		<header class="productList__header">
			<div class="productList__headerBackground"></div>
			<!-- Correct order (for keyboard navigation): FPSV -->
			<Pagination />
			<Sorting />
			<VatSetup />
		</header>

		<ul class="productList__ul" v-if="pagedData_global && pagedData_global.length">
			<li class="productList__product" v-for="ply in pagedData_global" :key="ply.code">
				<div class="product__code">
					<b>{{ ply.code }}</b> - {{ ply.tags }}
				</div>
				<div class="product__name" v-html="wrapText(ply.name)"></div>
				<div class="product__error" v-if="ply.error">
					<span v-for="error of ply.error">{{ error }}</span>
				</div>

				<Inventory
					v-if="dataMode == 'dataMode__inventory'"
					:code="ply.code"
					:size="ply.size"
					:total="ply.tCub" />
				<Quantities
					v-if="dataMode == 'dataMode__trade'"
					:size="ply.size"
					:total="ply.tCub"
					:aviable="ply.aCub" />
				<Prices
					v-if="dataMode == 'dataMode__trade'"
					:plySize="ply.size"
					:buyPrice="ply.pCub" />
			</li>
		</ul>

		<p v-else class="productList__empty">Nie znaleziono produktów.</p>

		<footer class="productList__footer">
			<Pagination />
		</footer>

		<button class="scrollTo__search button accent" @click="animateScrollTo('#search')">
			<span>Szukaj...</span><i class="bi bi-search"></i>
		</button>
	</section>
</template>

<style>
.productList {
	display: grid;
	justify-items: center;
	margin: 0 auto;
	/* max-width: fit-content; */
}

.productList__headerBackground {
	grid-area: 1 / 1 / -1 / -1;
	position: absolute;
	inset: -0.5rem;
	background-color: var(--bg-shade);
}

.productList__header,
.productList__product {
	display: grid;
	grid-template-columns: repeat(6, minmax(auto, 14ch));
	align-items: baseline;
	justify-content: space-evenly;
	gap: 0.5ch;
}

.productList__header {
	width: 100%;
	grid-template-areas:
		'code .    .    .    page page'
		'tCub tSqr tPcs pCub pSqr pPcs'
		'aCub aSqr aPcs vat3 vat2 vat1';
}
.productList__product {
	margin-block: 1rem 2rem;
	grid-template-areas:
		'code code code tCub tSqr tPcs'
		'name name name aCub aSqr aPcs'
		'name name name pCub pSqr pPcs'
		'erro erro erro buyp marg perc';
}
@media (max-width: 800px) {
	.productList__header,
	.productList__product {
		grid-template-columns: repeat(3, minmax(auto, 14ch));
	}
	.productList__header {
		grid-template-areas:
			'code page page'
			'tCub tSqr tPcs'
			'aCub aSqr aPcs'
			'pCub pSqr pPcs'
			'vat3 vat2 vat1';
	}
	.productList__product {
		grid-template-areas:
			'code code code'
			'name name name'
			'erro erro erro'
			'tCub tSqr tPcs'
			'aCub aSqr aPcs'
			'pCub pSqr pPcs'
			'buyp marg perc';
	}
}

.productList__ul {
	margin: 0;
	padding: 0;
	width: 100%;
}

.productList__product:is(:hover, :focus-within) {
	/* background-color: var(--bg-shade); */
	box-shadow: inset 0px 0px 0px 100rem var(--bg-shade), 0px 0px 0px 0.5rem var(--bg-shade);
}

.product__code {
	grid-area: code;
	font-size: 0.9em;
}
.product__name {
	grid-area: name;
	font-size: 1.1em;
}
:is(.product__code, .product__name) > b {
	font-weight: 600;
}
.product__tCub {
	grid-area: tCub;
}
.product__tSqr {
	grid-area: tSqr;
}
.product__tPcs {
	grid-area: tPcs;
}
.product__aCub {
	grid-area: aCub;
}
.product__aSqr {
	grid-area: aSqr;
}
.product__aPcs {
	grid-area: aPcs;
}
.product__pCub {
	grid-area: pCub;
}
.product__pSqr {
	grid-area: pSqr;
}
.product__pPcs {
	grid-area: pPcs;
}
.product__vat3 {
	grid-area: vat3;
}
.product__vat2 {
	grid-area: vat2;
}
.product__vat1 {
	grid-area: vat1;
}
.product__error {
	grid-area: erro;
	color: crimson;
}
.productList__empty {
	margin: 5rem;
	font-size: 1.4rem;
	text-align: center;
}
.scrollTo__search {
	position: sticky;
	bottom: 0.5rem;
	margin-inline: auto;
}
</style>