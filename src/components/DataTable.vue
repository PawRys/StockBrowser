<script setup>
import { ref, computed, watch, provide } from 'vue'
import { db as idb } from '../assets/dexiedb.js'
import Pagination from './DataTablePagination.vue'
import Sorting from './DataTableSorting.vue'

console.time('DataTable')

const filter_ref = ref()
const filterCount_ref = ref(1)
const pageSize_ref = ref(10)
const pageCount_ref = ref(1)
const pageNumber_ref = ref(1)
const sortOrder_ref = ref('id')
const dataSet_ref = ref('dataset-total')
const products_ref = ref(await idb.products.where('tCub').above(0).sortBy('id'))

provide('pageSize_ref', pageSize_ref)
provide('pageCount_ref', pageCount_ref)
provide('pageNumber_ref', pageNumber_ref)
provide('sortOrder_ref', sortOrder_ref)

sortOrder_ref

watch(dataSet_ref, async () => {
	if (dataSet_ref.value === 'dataset-full') products_ref.value = await idb.products.toArray()
	if (dataSet_ref.value === 'dataset-total')
		products_ref.value = await idb.products.where('tCub').above(0).sortBy('id')
	if (dataSet_ref.value === 'dataset-aviable')
		products_ref.value = await idb.products.where('aCub').above(0).sortBy('id')
})

const filteredProducts = computed(() => {
	let data

	data = products_ref.value.filter(row =>
		`${row.id} ${row.name}`.match(new RegExp(filter_ref.value, 'i'))
	)

	if (sortOrder_ref.value) {
		const [column, direction] = sortOrder_ref.value.split('_')
		data = data.sort((a, b) => {
			a = a[column]
			b = b[column]
			return (a === b ? 0 : a > b ? 1 : -1) * (!direction ? 1 : -1)
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
	<h2>Main Table</h2>
	<div class="flex-column">
		<label for="dataset-full">
			Stany zerowe:
			<input
				type="radio"
				name="dataset"
				id="dataset-full"
				value="dataset-full"
				v-model="dataSet_ref" />
		</label>
		<label for="dataset-total">
			Stany całkowite:
			<input
				type="radio"
				name="dataset"
				id="dataset-total"
				value="dataset-total"
				v-model="dataSet_ref"
				checked />
		</label>
		<label for="dataset-aviable">
			Stany handlowe:
			<input
				type="radio"
				name="dataset"
				id="dataset-aviable"
				value="dataset-aviable"
				v-model="dataSet_ref" />
		</label>
		<label for="pagesize">
			Ilość na stronę:
			<input type="number" name="pagesize" id="pagesize" min="1" v-model="pageSize_ref" />
		</label>
	</div>

	<div>
		<label for="filter">
			Szukaj:<input type="text" name="filter" id="filter" v-model="filter_ref" />
		</label>
	</div>
	<p>Rekordów: {{ filterCount_ref }} z {{ products_ref.length }}</p>

	<div style="display: flex">
		<Sorting style="margin-right: auto" />
		<Pagination id="pagination" />
	</div>
	<table id="table" v-if="filteredProducts.length">
		<tbody>
			<!-- <tr v-for="ply in paginatedProducts"> -->
			<tr v-for="ply in filteredProducts" :key="ply.id">
				<td class="id">{{ ply.id }}</td>
				<td class="name">{{ ply.name }}</td>
				<td class="tags">search tags</td>
				<td class="text-align_right tCub">{{ ply.tCub.toFixed(3) }}<small>m3</small></td>
				<td class="text-align_right tSqr">{{ ply.tSqr.toFixed(2) }}<small>m2</small></td>
				<td class="text-align_right tPcs">{{ ply.tPcs.toFixed(1) }}<small>szt</small></td>
				<td class="text-align_right aCub">{{ ply.aCub.toFixed(3) }}<small>m3</small></td>
				<td class="text-align_right aSqr">{{ ply.aSqr.toFixed(2) }}<small>m2</small></td>
				<td class="text-align_right aPcs">{{ ply.aPcs.toFixed(1) }}<small>szt</small></td>
				<td class="text-align_right pCub">
					<input
						class="text-align_right"
						type="number"
						name=""
						id=""
						:value="ply.price.toFixed(2)" />
					<small>zł/m3</small>
				</td>
				<td class="text-align_right pSqr">
					<input
						class="text-align_right"
						type="number"
						name=""
						id=""
						:value="ply.price.toFixed(2)" />
					<small>zł/m2</small>
				</td>
				<td class="text-align_right pPcs">
					<input
						class="text-align_right"
						type="number"
						name=""
						id=""
						:value="ply.price.toFixed(2)" />
					<small>zł/szt</small>
				</td>
				<td class="text-align_right buy_price">
					{{ ply.price.toFixed(2) }}<small>zł/m3</small>
				</td>
				<td class="text-align_right marg_perc">
					<input class="text-align_right" type="number" name="" id="" :value="0" />
					<small>%</small>
				</td>
				<td class="text-align_right marg_rel">
					<input class="text-align_right" type="number" name="" id="" :value="0" />
					<small>zł/m3</small>
				</td>
			</tr>
		</tbody>
	</table>
	<p v-else>Nie znaleziono produktów.</p>
</template>

<style scoped>
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
.marg_perc {
	grid-area: perc;
}
.marg_rel {
	grid-area: marg;
}

table,
tr {
	padding: 0.6ex 1ex;
	border: solid 1px silver;
}

table {
	border-collapse: collapse;
}

td {
	/* padding: 0.6ex 1ex; */
	padding: 0 0.5ex;
}

tr {
	display: grid;
	grid-template-columns: repeat(2, 2fr) repeat(6, minmax(max-content, 1fr));
	grid-template-areas:
		/* 'id__ tags buyp tCub tSqr tPcs'
		'name name marg aCub aSqr aPcs'
		'name name perc pCub pSqr pPcs'; */
		'id__ tags tCub tSqr tPcs buyp marg perc'
		'name name aCub aSqr aPcs pCub pSqr pPcs';
}

.text-align_right {
	text-align: right;
}
.flex-column {
	display: flex;
	flex-direction: column;
}

table input {
	width: 8ch;
}
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}

/* Firefox */
input[type='number'] {
	-moz-appearance: textfield;
}
</style>
