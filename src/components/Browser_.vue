<script setup>
import { ref, reactive, computed, watch, provide, inject } from 'vue'
import { db as idb } from '../assets/dexiedb.js'
import Sorting from './Browser_Sorting.vue'
import VatSetup from './Browser_VatSetup.vue'
import PriceCalc from './Browser_PriceCalc_.vue'
import Pagination from './Browser_Pagination.vue'
import DataSettings from './Browser_DataSettings.vue'

console.time('DataTable')

const filter_ref = ref()
const filterCount_ref = ref(1)
const pageSize_ref = ref(20)
const pageCount_ref = ref(1)
const pageNumber_ref = ref(1)
const sortParams = ref(['code', 1])
const dataSet_ref = ref('dataset-total')
const products_ref = ref(await idb.products.where('tCub').above(0).sortBy('id'))
const vat = reactive({ m3: 1, m2: 1, szt: 1.23 })

provide('pageSize_ref', pageSize_ref)
provide('pageCount_ref', pageCount_ref)
provide('pageNumber_ref', pageNumber_ref)
provide('sortParams', sortParams)
provide('dataSet_ref', dataSet_ref)
provide('vat', vat)

watch(dataSet_ref, async () => {
	if (dataSet_ref.value === 'dataset-full')
		products_ref.value = await idb.products.toArray()
	if (dataSet_ref.value === 'dataset-total')
		products_ref.value = await idb.products
			.where('tCub')
			.above(0)
			.sortBy('id')
	if (dataSet_ref.value === 'dataset-aviable')
		products_ref.value = await idb.products
			.where('aCub')
			.above(0)
			.sortBy('id')

	console.log(products_ref.value)
})

const filteredProducts = computed(() => {
	let data = products_ref.value.filter(row =>
		`${row.code} ${row.name}`.match(new RegExp(filter_ref.value, 'i'))
	)

	if (sortParams.value) {
		const [column, direction] = sortParams.value
		data = data.sort((a, b) => {
			a = a[column]
			b = b[column]
			return (a === b ? 0 : a > b ? 1 : -1) * direction
		})
	}

	const pageSize = pageSize_ref.value
	const pageNumber = pageNumber_ref.value
	const filterCount = data.length
	const validPageSize = pageSize < 1 ? 1 : pageSize
	const pageCount = Math.ceil(filterCount / validPageSize)
	const validPageNumber = pageNumber > pageCount ? pageCount : pageNumber || 1
	const start = validPageNumber * validPageSize - validPageSize
	const end = validPageNumber * validPageSize
	data = data.slice(start, end)

	// Update UI
	pageCount_ref.value = pageCount
	pageNumber_ref.value = validPageNumber
	filterCount_ref.value = filterCount

	return data
})

console.timeEnd('DataTable')
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
		<Sorting style="grid-area: sort" />
		<VatSetup style="grid-area: vats" />
		<Pagination style="grid-area: page" />
	</header>
	<ul class="list-container" v-if="filteredProducts.length">
		<li v-for="ply in filteredProducts" :key="ply.code" class="list-item">
			<div style="grid-area: code" class="code">{{ ply.code }}</div>
			<div style="grid-area: name" class="name">{{ ply.name }}</div>
			<div style="grid-area: tags" class="tags">search tags</div>

			<div style="grid-area: tCub" class="quantity-total tCub">
				{{ ply.tCub.toFixed(3) }}<small>m<sup>3</sup></small>
			</div>
			<div style="grid-area: tSqr" class="quantity-total tSqr">
				{{ ply.tSqr.toFixed(2) }}<small>m<sup>2</sup></small>
			</div>
			<div style="grid-area: tPcs" class="quantity-total tPcs">
				{{ ply.tPcs.toFixed(1) }}<small>szt</small>
			</div>

			<div style="grid-area: aCub" class="quantity-aviable aCub">
				{{ ply.aCub.toFixed(3) }}<small>m<sup>3</sup></small>
			</div>
			<div style="grid-area: aSqr" class="quantity-aviable aSqr">
				{{ ply.aSqr.toFixed(2) }}<small>m<sup>2</sup></small>
			</div>
			<div style="grid-area: aPcs" class="quantity-aviable aPcs">
				{{ ply.aPcs.toFixed(1) }}<small>szt</small>
			</div>

			<div style="grid-area: buyp" class="price buyp">
				{{ ply.pCub.toFixed(2) }}<small>zł/m<sup>3</sup></small>
			</div>
			<PriceCalc :plySize="ply.size" :buyPrice="ply.pCub" />
		</li>
	</ul>
	<p v-else>Nie znaleziono produktów.</p>
	<footer style="display: flex">
		<Pagination style="margin-left: auto" />
	</footer>
</template>

<style>
.header {
	display: grid;
	align-items: center;
	gap: 1ch;
	grid-template-columns: repeat(3, 1fr);
	grid-template-areas:
		'. . .'
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
		'name name aCub aSqr aPcs buyp marg perc';
}

[class*='price'],
[class*='quantity'] {
	text-align: right;
	/* color: tomato; */
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
