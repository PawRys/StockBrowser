<script setup>
import { ref, computed, watch, provide } from 'vue'
import { db as idb } from '../assets/dexiedb.js'
console.time('DataTable')

const filter = ref()
const filterCount = ref(1)
const dataSet = ref('dataset-total')
const pageSize = ref(10)
const pageNumber = ref(1)
const products = ref(await idb.products.where('total').above(0).sortBy('id'))

watch(dataSet, async () => {
	if (dataSet.value === 'dataset-full')
		products.value = await idb.products.toArray()
	if (dataSet.value === 'dataset-total')
		products.value = await idb.products.where('total').above(0).sortBy('id')
	if (dataSet.value === 'dataset-aviable')
		products.value = await idb.products.where('aviable').above(0).sortBy('id')
})

const filteredProducts = computed(() => {
	const start = pageNumber.value * pageSize.value - pageSize.value
	const end = pageNumber.value * pageSize.value
	let data = products.value

	filterCount.value = data.filter(row =>
		`${row.id} ${row.name}`.match(filter.value)
	)
	data = filterCount.value.slice(start, end)
	return data
})

const pageCount = computed(() => {
	return Math.ceil(filterCount.value / pageSize.value)
})

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
				v-model="dataSet" />
		</label>
		<label for="dataset-total">
			Total:
			<input
				type="radio"
				name="dataset"
				id="dataset-total"
				value="dataset-total"
				v-model="dataSet"
				checked />
		</label>
		<label for="dataset-aviable">
			Aviable:
			<input
				type="radio"
				name="dataset"
				id="dataset-aviable"
				value="dataset-aviable"
				v-model="dataSet" />
		</label>
	</div>
	<p>Rekordów: {{ filterCount }} z {{ products.length }}</p>
	<p>
		<label for="pagenum">
			Numer strony:
			<select name="pagenum" id="pagenum" v-model="pageNumber">
				<template v-for="n in pageCount">
					<option :value="n || 1">{{ n }}</option>
				</template>
			</select>
			z {{ pageCount }}
		</label>
		<label for="pagesize">
			<input
				type="number"
				name="pagesize"
				id="pagesize"
				v-model="pageSize"
				min="1" />
		</label>
	</p>

	<p>
		<label for="filter">
			Szukaj:<input type="text" name="filter" id="filter" v-model="filter" />
		</label>
	</p>

	<table>
		<tbody>
			<!-- <tr v-for="ply in paginatedProducts"> -->
			<tr v-for="ply in filteredProducts">
				<td>{{ ply.id }}</td>
				<td>{{ ply.name }}</td>
				<td>{{ ply.size }}</td>
				<td>{{ ply.total }} {{ ply.stockUnit }}</td>
				<!-- <td>{{ recalc(ply.total) }} {{ ply.stockUnit }}</td> -->
				<td>{{ ply.aviable }} {{ ply.stockUnit }}</td>
				<td>{{ ply.price }} zł/{{ ply.priceUnit }}</td>
			</tr>
		</tbody>
	</table>
</template>

<style scoped>
.flex-column {
	display: flex;
	flex-direction: column;
}
</style>
