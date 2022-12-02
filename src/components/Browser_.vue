<script setup>
import { ref, reactive, provide } from 'vue';
import { db as idb } from '../assets/dexiedb.js';
import DataSet from './Browser_DataSet.vue';
import Filters from './Browser_Filter_.vue';
import Sorting from './Browser_Sorting.vue';
import VatSetup from './Browser_VatSetup.vue';
import Pagination from './Browser_Pagination.vue';
import Quantities from './Browser_Quantities.vue';
import PriceCalculator from './Browser_PriceCalculator_.vue';

const unfilteredData_global = ref();
const filteredData_global = ref();
const sortedData_global = ref();
const pagedData_global = ref();
provide('unfilteredData_global', unfilteredData_global);
provide('filteredData_global', filteredData_global);
provide('sortedData_global', sortedData_global);
provide('pagedData_global', pagedData_global);

const pageSize_global = ref(20);
const pageCount_global = ref(1);
const pageNumber_global = ref(1);
provide('pageSize_global', pageSize_global);
provide('pageCount_global', pageCount_global);
provide('pageNumber_global', pageNumber_global);

const dataSet_global = ref('dataset-total');
provide('dataSet_global', dataSet_global);

const vat = reactive({ m3: 1, m2: 1, szt: 1.23 });
provide('vat', vat);
</script>

<template>
	<h2 id="pageTop">Main Table</h2>
	<section>
		<DataSet />
	</section>
	<header class="header grid-layout">
		<div class="background"></div>
		<!-- Correct order (for keyboard navigation): FPSV -->
		<Filters />
		<Pagination />
		<Sorting />
		<VatSetup />
	</header>
	<ul
		class="list-container"
		v-if="pagedData_global && pagedData_global.length">
		<li
			v-for="ply in pagedData_global"
			:key="ply.code"
			class="list-item grid-layout">
			<div style="grid-area: code" class="code">
				{{ ply.code }} - {{ ply.tags }}
			</div>
			<div style="grid-area: name" class="name">{{ ply.name }}</div>
			<!-- <div style="grid-area: tags" class="tags">{{ ply.tags }}</div> -->
			<div class="error" style="grid-area: err" v-if="ply.error">
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
.background {
	grid-area: code / code / vat1 / vat1;
	position: absolute;
	inset: -0.5rem;
	background-color: var(--bg-color);
}

.grid-layout {
	display: grid;
	align-items: baseline;
	justify-content: space-evenly;
	gap: 0.5ch;
	grid-template-columns: 1fr 1fr repeat(6, 12ch);
}
.header {
	grid-template-areas:
		'fltr fltr fltr fltr fltr fltr fltr fltr'
		'.    .    .    .    .    .    page page'
		'code .    tCub tSqr tPcs pCub pSqr pPcs'
		'.    .    aCub aSqr aPcs vat3 vat2 vat1';
}
.list-item {
	margin-block: 1rem 2rem;
	grid-template-areas:
		'code .    tCub tSqr tPcs pCub pSqr pPcs'
		'name name aCub aSqr aPcs buyp marg perc'
		'err  err  err  err  err  err  err  err ';
}

@media (max-width: 1080px) {
	.grid-layout {
		grid-template-columns: repeat(6, 12ch);
	}
	.header {
		grid-template-areas:
			'fltr fltr fltr fltr fltr fltr'
			'code .    .    .    page page'
			'tCub tSqr tPcs pCub pSqr pPcs'
			'aCub aSqr aPcs vat3 vat2 vat1';
	}
	.list-item {
		grid-template-areas:
			'code code code tags tags tags'
			'name name name name name name'
			'tCub tSqr tPcs pCub pSqr pPcs'
			'aCub aSqr aPcs buyp marg perc'
			'err  err  err  err  err  err ';
	}
}

@media (max-width: 730px) {
	.grid-layout {
		grid-template-columns: repeat(3, 12ch);
	}
	.header {
		grid-template-areas:
			'fltr fltr fltr'
			'code page page'
			'tCub tSqr tPcs '
			'aCub aSqr aPcs '
			'pCub pSqr pPcs'
			'vat3 vat2 vat1';
	}
	.list-item {
		grid-template-areas:
			'code .    tags'
			'name name name'
			'tCub tSqr tPcs'
			'aCub aSqr aPcs'
			'pCub pSqr pPcs'
			'buyp marg perc'
			'err  err  err ';
	}
}

[class*='price'],
[class*='quantity'] {
	text-align: right;
}
[class*='total'] {
	font-weight: 600;
}
.name {
	font-size: 1.15em;
}
.pagination {
	justify-self: right;
}
.list-container {
	padding: 0;
}
.error {
	color: crimson;
}
</style>
