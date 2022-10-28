<script setup>
import { ref, reactive, computed, watch, provide, inject } from 'vue'
import { db as idb } from '../assets/dexiedb.js'
import Sorting from './Browser_Sorting.vue'
import Settings from './Browser_Settings.vue'
import PriceCalc from './Browser_PriceCalc_.vue'
import Pagination from './Browser_Pagination.vue'

console.time('DataTable')

const filter_ref = ref()
const filterCount_ref = ref(1)
const pageSize_ref = ref(20)
const pageCount_ref = ref(1)
const pageNumber_ref = ref(1)
const sortParams = ref(['id', 1])
const dataSet_ref = ref('dataset-total')
const products_ref = ref(await idb.products.where('tCub').above(0).sortBy('id'))

provide('pageSize_ref', pageSize_ref)
provide('pageCount_ref', pageCount_ref)
provide('pageNumber_ref', pageNumber_ref)
provide('sortParams', sortParams)
provide('dataSet_ref', dataSet_ref)

const vat = reactive({ m3: 1, m2: 1, szt: 1.23 })
provide('vat', vat)

watch(dataSet_ref, async () => {
	if (dataSet_ref.value === 'dataset-full') products_ref.value = await idb.products.toArray()
	if (dataSet_ref.value === 'dataset-total')
		products_ref.value = await idb.products.where('tCub').above(0).sortBy('id')
	if (dataSet_ref.value === 'dataset-aviable')
		products_ref.value = await idb.products.where('aCub').above(0).sortBy('id')
})

const filteredProducts = computed(() => {
	let data = products_ref.value.filter(row =>
		`${row.id} ${row.name}`.match(new RegExp(filter_ref.value, 'i'))
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
	<input
		type="checkbox"
		name="vatCub"
		id=""
		v-model="vat.m3"
		:true-value="1.23"
		:false-value="1" />
	<input
		type="checkbox"
		name="vatSqr"
		id=""
		v-model="vat.m2"
		:true-value="1.23"
		:false-value="1" />
	<input
		type="checkbox"
		name="vatPcs"
		id=""
		v-model="vat.szt"
		:true-value="1.23"
		:false-value="1" />
	<Settings />
	<div>
		<label for="filter">
			Szukaj:<input type="search" name="filter" id="filter" v-model="filter_ref" />
		</label>
	</div>
	<p>Rekordów: {{ filterCount_ref }} z {{ products_ref.length }}</p>
	<div style="display: flex">
		<Sorting />
		<Pagination style="margin-left: auto" />
	</div>
	<ul id="table" v-if="filteredProducts.length">
		<li v-for="ply in filteredProducts" :key="ply.id">
			<div class="id">{{ ply.id }}</div>
			<div class="name">{{ ply.name }}</div>
			<div class="tags">search tags</div>
			<div class="text-align_right tCub">{{ ply.tCub.toFixed(3) }}<small>m3</small></div>
			<div class="text-align_right tSqr">{{ ply.tSqr.toFixed(2) }}<small>m2</small></div>
			<div class="text-align_right tPcs">{{ ply.tPcs.toFixed(1) }}<small>szt</small></div>
			<div class="text-align_right aCub">{{ ply.aCub.toFixed(3) }}<small>m3</small></div>
			<div class="text-align_right aSqr">{{ ply.aSqr.toFixed(2) }}<small>m2</small></div>
			<div class="text-align_right aPcs">{{ ply.aPcs.toFixed(1) }}<small>szt</small></div>
			<div class="text-align_right buy_price">{{ ply.pCub.toFixed(2) }}<small>zł/m3</small></div>
			<PriceCalc :plySize="ply.size" :buyPrice="ply.pCub" />
		</li>
	</ul>
	<p v-else>Nie znaleziono produktów.</p>
	<div style="display: flex">
		<Pagination style="margin-left: auto" />
	</div>
</template>

<style>
.id {
	grid-area: id__;
}
.name {
	grid-area: name;
}
.tags {
	grid-area: tags;
}
.tCub {
	grid-area: tCub;
}
.tSqr {
	grid-area: tSqr;
}
.tPcs {
	grid-area: tPcs;
}
.aCub {
	grid-area: aCub;
}
.aSqr {
	grid-area: aSqr;
}
.aPcs {
	grid-area: aPcs;
}
.pCub {
	grid-area: pCub;
}
.pSqr {
	grid-area: pSqr;
}
.pPcs {
	grid-area: pPcs;
}

.buy_price {
	grid-area: buyp;
}
.perc {
	grid-area: perc;
}
.marg {
	grid-area: marg;
}

ul {
	padding: 0;
}

li {
	margin-block: 1rem;
	padding: 0.5ex 1ex;

	display: grid;
	gap: 0 0.5ex;
	grid-template-columns: repeat(2, 2fr) repeat(6, minmax(max-content, 11ch));
	grid-template-areas:
		/* 'id__ tags buyp tCub tSqr tPcs'
		'name name marg aCub aSqr aPcs'
		'name name perc pCub pSqr pPcs'; */
		'id__ tags tCub tSqr tPcs pCub pSqr pPcs'
		'name name aCub aSqr aPcs buyp marg perc';
}

li:nth-of-type(2n) {
	background-color: var(--bg-shade);
}
li:nth-of-type(2n + 1) {
	background-color: var(--bg-color);
}

.text-align_right {
	text-align: right;
}
.flex-column {
	display: flex;
	flex-direction: column;
}
</style>
