<script setup>
import { ref, reactive, computed } from 'vue'
import { db as idb } from '../assets/dexiedb.js'

const timeName = 'DataTable'
console.time(timeName)

const products = ref()

async function init() {
	products.value = await idb.products.toArray()
}

init()

// const test = 'Sklejka liściasta suchotrwała 2,7x1525x1525 BB/BB'.match(/\d+[,\.]?\d*x\d+x\d+/i)
// console.log(test)

function recalc(data) {
	return (data = data * 2)
}

console.timeEnd(timeName)
</script>

<template>
	<h2>Main Table</h2>
	<!-- <p>{{ products }}</p> -->
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
