<script setup>
import { ref, reactive, computed, watch, watchEffect, watchPostEffect } from 'vue'
import { db as idb } from '../assets/dexiedb.js'

console.time('DataTable')
const products = ref()
const pageSize = ref(10)
const pagesLength = ref()
const pageNumber = ref(1)

async function updatePage() {
	console.time('page update')
	const data = await idb.products.toArray()
	// products.value = await idb.products.where('total').above(0).sortBy('id')
	// products.value = await idb.products.where('aviable').above(0).sortBy('id')
	products.value = data.slice(
		(pageNumber.value - 1) * pageSize.value,
		pageNumber.value * pageSize.value
	)
	pagesLength.value = Math.ceil(data.length / pageSize.value)
	console.timeEnd('page update')
}

updatePage()
watch(pageNumber, updatePage)

function recalc(data) {
	return (data = data * 2)
}

console.timeEnd('DataTable')
</script>

<template>
	<h2>Main Table</h2>
	<p>Stron:{{ pagesLength }}</p>
	<p>Jesteś na:{{ pageNumber }}</p>
	<input
		type="number"
		name="pagenum"
		id="pagenum"
		v-model="pageNumber"
		:min="1"
		:max="pagesLength"
	/>
	<table>
		<tbody>
			<tr v-for="ply in products">
				<td>{{ ply.id }}</td>
				<td>{{ ply.name }}</td>
				<td>{{ ply.size }}</td>
				<td>{{ ply.total }} {{ ply.stockUnit }}</td>
				<td>{{ recalc(ply.total) }} {{ ply.stockUnit }}</td>
				<td>{{ ply.aviable }} {{ ply.stockUnit }}</td>
				<td>{{ ply.price }} zł/{{ ply.priceUnit }}</td>
			</tr>
		</tbody>
	</table>
</template>

<style scoped></style>
