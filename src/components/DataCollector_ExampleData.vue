<script setup>
import { ref } from 'vue';
import { db as idb } from '../utils/dexiedb.js';
import { raw_stocks } from '../utils/raw_stocks.js';
import { raw_prices } from '../utils/raw_prices.js';
import { raw_products } from '../utils/raw_products.js';

async function clipboardPut(type) {
	const permission = await navigator.permissions.query({
		name: 'clipboard-read',
	});

	if (permission.state == 'denied') {
		alert(`Uprawnienia do schowka dla tej witryny zostały wyłączone. Ask Google for help.`);
		return;
	}

	let data = 'No data submitted';
	if (type === 'raw_stocks') data = raw_stocks;
	if (type === 'raw_prices') data = raw_prices;
	if (type === 'raw_products') data = raw_products;

	navigator.clipboard.writeText(data).catch(reason => console.error(reason));
}

async function clearDatabase() {
	await idb.products
		.clear()
		.then(res => console.log(`Table 'products' dropped. Response: ${res}`))
		.catch(err => console.log(err));
	await idb.timestamps
		.clear()
		.then(res => console.log(`Table 'timestamps' dropped. Response: ${res}`))
		.catch(err => console.log(err));
	// await idb.tables.forEach(table => {
	// 	table
	// 		.clear()
	// 		.then(res => console.log(`Table dropped. Response: ${res}`))
	// 		.catch(err => console.log(err));
	// });
}
</script>

<template>
	<section class="dev">
		<h3>Dev things</h3>
		<div class="grid">
			<button class="button" @click="clipboardPut('raw_stocks')">
				Do schowka: 📦 Ilości
			</button>
			<button class="button" @click="clipboardPut('raw_prices')">Do schowka: 💵 Ceny</button>
			<button class="button" @click="clipboardPut('raw_products')">
				Do schowka: 📜 Baza kodów
			</button>
			<button class="button" @click="clearDatabase()">Clear database</button>
		</div>
	</section>
</template>

<style scoped>
.dev {
	border: solid 1px blue;
	padding: 1rem;
	background-color: lightsteelblue;
}
</style>
