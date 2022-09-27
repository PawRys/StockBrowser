<script setup>
import { ref, reactive, computed } from 'vue'
import { db as idb } from '../assets/dexiedb.js'

const timeName = 'DataTable'
console.time(timeName)

const data = ref({
	stocks: [],
	prices: [],
	products: [],
})

async function loadFromDB() {
	const stocks = await idb.stocks.toArray()
	const stocksA = await idb.stocks.where('aviable').notEqual(0).sortBy('id')
	const prices = await idb.prices.toArray()
	const products = await idb.products.toArray()
	return {
		stocks: stocks,
		stocksA: stocksA,
		prices: prices,
		products: products,
	}
}
// loadFromDB()
// try {
// console.time(`trycatch`)
// const stocks = await idb.stocks.toArray()
// const stocksA = await idb.stocks.where('aviable').notEqual(0).sortBy('id')
// const prices = await idb.prices.toArray()
// const products = await idb.products.toArray()
// console.log(data.value)
// data.value = {
// 	stocks: stocks,
// 	stocksA: stocksA,
// 	prices: prices,
// 	products: products,
// }
// console.log(data.value.stocks)
// console.timeEnd(`trycatch`)
// } catch (error) {
// 	console.error(error)
// }
// loadFromDB()

console.time('dbload')
loadFromDB().then((result) => {
	data.value = result
	console.timeEnd('dbload')
})

function findAviable(id) {
	const row = data.value.stocks.find((row) => row.id === id)
	if (row) return row.aviable
	else return `not found: ${id}`
}

// const findAviable = computed((id) => {
// 	const x = db.stocks.find((i) => i[id] === id)
// 	return x ? x.aviable : 0
// })

console.timeEnd(timeName)
</script>

<template>
	<h2>Main Table</h2>
	<!-- <p>{{ data.stocks }}</p> -->
	<table>
		<tbody>
			<tr v-for="plywood in data.products">
				<td>
					{{ plywood.id }}
				</td>
				<td>{{ findAviable(plywood.id) }}</td>
			</tr>
		</tbody>
	</table>
</template>

<style scoped></style>
