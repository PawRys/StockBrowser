<script setup>
import { ref, reactive } from 'vue'
import { db as idb } from '../assets/dexiedb.js'

const timeName = 'DataTable'
console.time(timeName)

const db = ref({
	// stocks: null,
	// proces: null,
	// products: null,
})

async function loadFromDB() {
	const ss = await idb.stocks.where('aviable').notEqual(0).sortBy('id')
	const s = await idb.stocks.toArray()
	const p = await idb.prices.toArray()
	const pr = await idb.products.toArray()
	console.log(ss)
	return {
		stocks: ss,
		prices: p,
		products: pr,
	}
	// const stocks = await db.stocks.toArray()
	// const products = await db.products.toArray()

	// for (const item of stocks) {
	// const product = await db.products.get(item.id)
	// const product = products.find((pro) => pro.id == item.id)
	// console.log(product.name)
	// }
}

loadFromDB().then((result) => {
	db.value = result
})

console.timeEnd(timeName)
</script>

<template>
	<h2>Main Table</h2>
	<!-- <p>{{ data }}</p> -->
	<table>
		<tbody>
			<tr v-for="plywood in db.stocks">
				<td>
					{{ plywood.id }}
				</td>
				<td>
					{{ plywood.aviable }}
				</td>
				<td>
					{{ db.products.find((i) => i.id === plywood.id).name }}
				</td>
			</tr>
		</tbody>
	</table>
</template>

<style scoped></style>
