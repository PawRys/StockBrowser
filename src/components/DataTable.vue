<script setup>
import { ref, computed, watch, provide } from 'vue'
import { db as idb } from '../assets/dexiedb.js'
console.time('DataTable')

const filter_ref = ref()
const filterCount_ref = ref(1)
const order_ref = ref(true)
const pageSize_ref = ref(10)
const pageCount_ref = ref(1)
const pageNumber_ref = ref(1)
const dataSet_ref = ref('dataset-total')
const products_ref = ref(await idb.products.where('total').above(0).sortBy('id'))

watch(dataSet_ref, async () => {
	if (dataSet_ref.value === 'dataset-full') products_ref.value = await idb.products.toArray()
	if (dataSet_ref.value === 'dataset-total')
		products_ref.value = await idb.products.where('total').above(0).sortBy('id')
	if (dataSet_ref.value === 'dataset-aviable')
		products_ref.value = await idb.products.where('aviable').above(0).sortBy('id')
})

const filteredProducts = computed(() => {
	let data

	data = products_ref.value.filter(row =>
		`${row.id} ${row.name}`.match(new RegExp(filter_ref.value, 'i'))
	)

	const col = 'total'
	const order = 1
	// data = data.sort((a, b) => b[col] - a[col])
	data = data.slice().sort((a, b) => {
		a = a[col]
		b = b[col]
		return (a === b ? 0 : a > b ? 1 : -1) * (order_ref.value ? 1 : -1)
	})

	console.log(order_ref.value)

	const pageSize = pageSize_ref.value
	const pageNumber = pageNumber_ref.value
	const filterCount = data.length
	const validPageSize = pageSize < 1 ? 1 : pageSize
	const pageCount = Math.ceil(filterCount / validPageSize)
	const validPageNumber = pageNumber > pageCount ? pageCount : pageNumber || 1
	const start = validPageNumber * validPageSize - validPageSize
	const end = validPageNumber * validPageSize
	data = data.slice(start, end)

	// Update pagination UI
	pageCount_ref.value = pageCount
	pageNumber_ref.value = validPageNumber
	filterCount_ref.value = filterCount

	return data
})

// const pageCount = computed(() => {
// 	// Keep value in range to calculation purposes but leave user input intact
// 	const pageSizeInRange = pageSize.value > 0 ? pageSize.value : 1

// 	return Math.ceil(filterCount.value / pageSizeInRange)
// })

console.timeEnd('DataTable')
</script>

<template>
	<h2>Main Table</h2>
	<div class="flex-column">
		<label for="dataset-full">
			Full:
			<input
				type="radio"
				name="dataset"
				id="dataset-full"
				value="dataset-full"
				v-model="dataSet_ref" />
		</label>
		<label for="dataset-total">
			Total:
			<input
				type="radio"
				name="dataset"
				id="dataset-total"
				value="dataset-total"
				v-model="dataSet_ref"
				checked />
		</label>
		<label for="dataset-aviable">
			Aviable:
			<input
				type="radio"
				name="dataset"
				id="dataset-aviable"
				value="dataset-aviable"
				v-model="dataSet_ref" />
		</label>
	</div>
	<p>Rekordów: {{ filterCount_ref }} z {{ products_ref.length }}</p>
	<p>
		<label for="pagenum">
			Numer strony:
			<select name="pagenum" id="pagenum" v-model="pageNumber_ref">
				<template v-for="n in pageCount_ref">
					<option :value="n || 1">{{ n }}</option>
				</template>
			</select>
			z {{ pageCount_ref }}
		</label>
		<label for="pagesize">
			<input type="number" name="pagesize" id="pagesize" min="1" v-model="pageSize_ref" />
		</label>
	</p>

	<p>
		<input type="checkbox" name="" id="" v-model="order_ref" />
		<label for="filter">
			Szukaj:<input type="text" name="filter" id="filter" v-model="filter_ref" />
		</label>
	</p>

	<table v-if="filteredProducts.length">
		<tbody>
			<!-- <tr v-for="ply in paginatedProducts"> -->
			<tr v-for="ply in filteredProducts">
				<td>{{ ply.id }}</td>
				<td>{{ ply.name }}</td>
				<!-- <td>{{ ply.size }}</td> -->
				<td>{{ ply.total.toFixed(2) }} {{ ply.stockUnit }}</td>
				<!-- <td>{{ recalc(ply.total) }} {{ ply.stockUnit }}</td> -->
				<td>{{ ply.aviable.toFixed(2) }} {{ ply.stockUnit }}</td>
				<td>{{ ply.price.toFixed(2) }} zł/{{ ply.priceUnit }}</td>
			</tr>
		</tbody>
	</table>
	<p v-else>Nie znaleziono produktów.</p>
</template>

<style scoped>
table,
td {
	border: solid 1px;
}

table {
	border-collapse: collapse;
}

td {
	padding: 0.6ex 1ex;
}
.flex-column {
	display: flex;
	flex-direction: column;
}
</style>
