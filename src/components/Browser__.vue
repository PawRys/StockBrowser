<script setup>
import { ref, reactive, provide, watchEffect } from 'vue';

import Prices from './Browser__Prices.vue';
import Filters from './Browser__Filters.vue';
import Inventory from './Browser__Inventory.vue';
import Pagination from './Browser__Pagination.vue';
import Quantities from './Browser__Quantities.vue';
import ListSettings from './Browser__ListSettings.vue';
import { animateScrollTo } from '../utils/functions.js';

const unfilteredData_global = ref([]);
const filteredData_global = ref([]);
const sortedData_global = ref([]);
const pagedData_global = ref([]);
provide('unfilteredData_global', unfilteredData_global);
provide('filteredData_global', filteredData_global);
provide('sortedData_global', sortedData_global);
provide('pagedData_global', pagedData_global);

const pageSize_global = ref(localStorage.StockBrowser_PageSize || 20);
const pageCount_global = ref(1);
const pageNumber_global = ref(1);
provide('pageSize_global', pageSize_global);
provide('pageCount_global', pageCount_global);
provide('pageNumber_global', pageNumber_global);
watchEffect(() => {
	localStorage.StockBrowser_PageSize = pageSize_global.value;
});

const dataSet_global = ref('dataset-total');
provide('dataSet_global', dataSet_global);

const dataMode = ref(localStorage.StockBrowser_DataMode || 'dataMode__trade');
provide('dataMode', dataMode);
watchEffect(() => {
	localStorage.StockBrowser_DataMode = dataMode.value;
});

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
		<Filters />
	</section>

	<section class="productList" :class="dataMode" id="results">
		<ListSettings class="productList__settings" />
		<Pagination class="productList__pagination--top" />
		<ul class="productList__ul" v-if="pagedData_global && pagedData_global.length">
			<li class="productList__product" v-for="ply in pagedData_global" :key="ply.code">
				<div class="product__code">
					<b>{{ ply.code }}</b> - {{ ply.group }}
				</div>
				<div class="product__name" v-html="wrapText(ply.name)"></div>
				<div class="product__error" v-if="ply.errors?.length">
					<span v-for="error of ply.errors">{{ error }}</span>
				</div>

				<Inventory
					v-if="dataMode === 'dataMode__inventory'"
					:code="ply.code"
					:size="ply.size"
					:total="ply.tCub" />
				<Quantities
					v-if="dataMode === 'dataMode__trade'"
					:size="ply.size"
					:total="ply.tCub"
					:aviable="ply.aCub" />
				<Prices
					v-if="dataMode === 'dataMode__trade'"
					:plySize="ply.size"
					:buyPrice="ply.pCub" />
			</li>
		</ul>

		<p v-else class="productList__empty">Nie znaleziono produktów.</p>

		<Pagination class="productList__pagination--bottom" />

		<button class="scrollTo__search button accent" @click="animateScrollTo('#search')">
			<span>Szukaj...</span><i class="bi bi-search"></i>
		</button>
	</section>
</template>

<style>
.productList {
	display: grid;
	grid-template-columns: minmax(300px, 3fr) 8fr;
	justify-items: center;
	gap: 0.8rem;

	margin: 0 auto;

	grid-template-areas:
		'. page-top .'
		'settings main .'
		'. page-bottom .'
		'search-btn search-btn .';
	/* max-width: fit-content; */
}

.productList__ul,
.productList__empty {
	grid-area: main;
}
.productList__settings {
	grid-area: settings;
	position: absolute;
}
.productList__pagination--top {
	grid-area: page-top;
}
.productList__pagination--bottom {
	grid-area: page-bottom;
}
.scrollTo__search {
	grid-area: search-btn;
}

.productList__product {
	display: grid;
	grid-template-columns: 5fr repeat(3, minmax(auto, 12ch));
	align-items: baseline;
	justify-content: space-evenly;
	gap: 0.5ch;
}

.productList__product {
	margin-block: 1rem 2rem;
	grid-template-areas:
		'code tCub tSqr tPcs'
		'name aCub aSqr aPcs'
		'name pCub pSqr pPcs'
		'erro buyp marg perc';
}
@media (max-width: 800px) {
	.productList__product {
		grid-template-columns: repeat(3, minmax(auto, 14ch));
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
