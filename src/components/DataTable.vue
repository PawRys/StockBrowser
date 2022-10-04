<script setup>
import { ref, reactive, computed, watch, watchEffect, watchPostEffect } from 'vue'
import { db as idb } from '../assets/dexiedb.js'
console.time('DataTable')

const filter = ref()
const pageSize = ref(10)
const pageNumber = ref(1)
const products = await idb.products.toArray()

const filteredProducts = computed(() => {
	return products.filter(row => `${row.id} ${row.name}`.match(filter.value))
})

const paginatedProducts = computed(() => {
	const start = pageNumber.value * pageSize.value - pageSize.value
	const end = pageNumber.value * pageSize.value
	return filteredProducts.value.slice(start, end)
})

const pageCount = computed(() => {
	return Math.ceil(filteredProducts.value.length / pageSize.value)
})

console.timeEnd('DataTable')
</script>

<template>
	<h2>Main Table</h2>
	<p>Rekordów:{{ filteredProducts.length }}</p>
	<p>Ilość stron: {{ pageCount }}</p>
	<p>
		<label for="pagesize">
			Wielkość strony:
			<input type="number" name="pagesize" id="pagesize" v-model="pageSize" min="1" />
		</label>
	</p>
	<p>
		<label for="pagenum">
			Numer strony:
			<select name="pagenum" id="pagenum" v-model="pageNumber">
				<template v-for="n in pageCount">
					<option :value="n || 1">{{ n }}</option>
				</template>
			</select>
		</label>
	</p>

	<p>
		<label for="filter">
			Szukaj:<input type="text" name="filter" id="filter" v-model="filter"
		/></label>
	</p>

	<table>
		<tbody>
			<tr v-for="ply in paginatedProducts">
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

<style scoped></style>
