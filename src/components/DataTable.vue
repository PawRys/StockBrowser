<script setup>
import { ref } from 'vue'
import { db } from '../assets/dexiedb.js'

const timeName = 'DataTable'
console.time(timeName)
const stocks = await db.stocks.toArray()
const products = await db.products.toArray()
// const products = await db.products.where({ id: '03S04/02' }).toArray()

for (const item of stocks) {
	// const product = await db.products.get(item.id)
	const product = products.find((pro) => pro.id == item.id)
	console.log(product)
}
console.log(stocks)
console.timeEnd(timeName)
</script>

<template>
	<h2>Main Table</h2>
</template>

<style scoped></style>
