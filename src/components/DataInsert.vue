<script setup>
import { ref } from 'vue'
import { db as idb } from '../assets/dexiedb.js'
import IconBroom from './icons/IconBroom.vue'
import IconCheck from './icons/IconCheck.vue'
import IconDisk from './icons/IconDisk.vue'
import ExampleData from './DataInsert_ExampleData.vue'

const rawData = ref()
const dataType = ref(null)
const message = ref('')

function clearTextarea() {
	rawData.value = ''
	validate()
}

async function pasteTextarea(e) {
	const permission = await navigator.permissions.query({
		name: 'clipboard-read',
	})

	if (permission.state == 'denied') {
		alert(`Uprawnienia do schowka dla tej witryny zostały wyłączone. Ask Google for help.`)
		return
	}

	const clipboardData = await navigator.clipboard
		.readText()
		.catch((reason) => console.error(reason))

	rawData.value = clipboardData
	validate()
}

function validate() {
	const input = rawData.value

	if (!input) {
		dataType.value = null
		message.value = ``
	} else {
		dataType.value = false
		message.value = `Nie rozpoznano danych. ❌`
	}

	const isStocks = /Stany i rezerwacje towarów/i.test(input)
	const isCorrectStockColumns =
		/Kod towaru		nazwa towaru		jm		stan handlowy	rezerwacje R	rezerwacje A		stan  całkowity	/i.test(input)
	if (isStocks && isCorrectStockColumns) {
		dataType.value = 'stocks'
		message.value = `📦 Rozpoznano stany i rezerwacje towarów.`
	}

	const isPrices = /Stany magazynowe towarów/i.test(input)
	const isCorrectPriceColumns = /Kod towaru		nazwa towaru		jm		stan	cena	wartość		/i.test(input)
	if (isPrices && isCorrectPriceColumns) {
		dataType.value = 'prices'
		message.value = `💵 Rozpoznano ceny zakupowe towarów.`
	}

	const isProdutsList = /Kod	Nazwa/i.test(input)
	const isProdutsItem = /\d+s\d+\/\d+/i.test(input)
	if (isProdutsList && isProdutsItem) {
		dataType.value = 'products'
		message.value = `📜 Rozpoznano listę produktów.`
	}

	const isFullExchangeCode = /^\d{4}$/i.test(input)
	if (isFullExchangeCode) {
		dataType.value = 'code'
		message.value = `🔢 Rozpoznano kod wymiany danych.`
	}

	const isPartExchangeCode = /^\d{1,3}$/i.test(input)
	if (isPartExchangeCode) {
		dataType.value = null
		message.value = ``
	}
}

async function saveInDB() {
	const timeName = 'save to database'
	console.time(timeName)

	const linesArray = rawData.value.match(/[^\r\n]+/g)
	let productsArray = []
	let pricesArray = []
	let stocksArray = []

	for (let line of linesArray) {
		const lineFragments = line.match(/[^\t]+/g)

		// Ommit garbage
		if (/\b(kod|podsumowanie|dostawa|transport|usługa|zamówienie)/i.test(lineFragments[0])) continue
		if (dataType.value === 'products' && lineFragments.length !== 2) continue
		if (dataType.value === 'prices' && lineFragments.length !== 6) continue
		if (dataType.value === 'stocks' && lineFragments.length !== 7) continue

		productsArray.push({
			id: lineFragments[0],
			name: lineFragments[1],
			size: getProductSize(line),
		})

		if (dataType.value === 'prices') {
			const price = lineFragments[4].replace(',', '.') * 1 || 0 // Must be 0, not falsies
			if (price === 0) continue
			pricesArray.push({
				id: lineFragments[0],
				unit: lineFragments[2],
				price: price,
			})
		}

		if (dataType.value === 'stocks') {
			const total = lineFragments[6].replace(',', '.') * 1 || 0 // Must be 0, not falsies
			const aviable = lineFragments[3].replace(',', '.') * 1 || 0 // Must be 0, not falsies
			if (total === 0) continue
			stocksArray.push({
				id: lineFragments[0],
				unit: lineFragments[2],
				total: total,
				aviable: aviable,
			})
		}
	}

	message.value = 'Loading...'
	await idb.products.bulkPut(productsArray)
	message.value = '📜 Zaktualizowano produkty ✔'

	if (dataType.value === 'prices') {
		await idb.prices.clear()
		await idb.prices.bulkAdd(pricesArray)
		message.value = '💵 Zaktualizowano ceny ✔'
	}

	if (dataType.value === 'stocks') {
		await idb.stocks.clear()
		await idb.stocks.bulkAdd(stocksArray)
		message.value = '📦 Zaktualizowano ilości ✔'
	}

	console.timeEnd(timeName)
}

async function saveInDB2() {
	console.time('saveInDB2')

	const products = await idb.products.toArray()
	const linesArray = rawData.value.match(/[^\r\n]+/g)

	for (let line of linesArray) {
		const lineFragments = line.match(/[^\t]+/g)

		// Ommit garbage
		if (/\b(kod|podsumowanie|dostawa|transport|usługa|zamówienie)/i.test(lineFragments[0])) continue
		if (dataType.value === 'products' && lineFragments.length !== 2) continue
		if (dataType.value === 'prices' && lineFragments.length !== 6) continue
		if (dataType.value === 'stocks' && lineFragments.length !== 7) continue

		const id = lineFragments[0]
		const name = lineFragments[1]
		const idx = products.findIndex((row) => row.id === id)
		const data = idx < 0 ? {} : products[idx]

		Object.assign(data, {
			id: id,
			name: name,
			size: getProductSize(line),
		})

		if (idx < 0) {
			Object.assign(data, {
				size: 0,
				price: 0,
				total: 0,
				aviable: 0,
				priceUnit: 'm3',
				stockUnit: 'm3',
			})
		}

		if (dataType.value === 'prices') {
			Object.assign(data, {
				price: lineFragments[4].replace(',', '.') * 1 || 0,
				priceUnit: lineFragments[2],
			})
		}

		if (dataType.value === 'stocks') {
			Object.assign(data, {
				total: lineFragments[6].replace(',', '.') * 1 || 0,
				aviable: lineFragments[3].replace(',', '.') * 1 || 0,
				stockUnit: lineFragments[2],
			})
		}

		const cursor = idx < 0 ? products.length : idx
		const update = idx < 0 ? 0 : 1
		products.splice(cursor, update, data)
	}

	message.value = 'Loading... ⏳'
	await idb.products.clear()
	await idb.products
		.bulkAdd(products)
		.then(async () => {
			message.value = '📜 Zaktualizowano produkty ✔'
			if (dataType.value === 'prices') message.value = '💵 Zaktualizowano ceny ✔'
			if (dataType.value === 'stocks') message.value = '📦 Zaktualizowano ilości ✔'
			console.timeEnd('saveInDB2')
			// await timeout(2000)
			// clearTextarea()
		})
		.catch((err) => {
			message.value = 'Coś poszło nie tak ❗'
			console.log(err)
		})
}

function getProductSize(line) {
	const fullSizeB = line.match(/\d+[,\.]?\d*x\d+x\d+/i)
	return fullSizeB ? fullSizeB[0] : 0
}

function timeout(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}
</script>

<template>
	<h2>Załaduj dane</h2>
	<p>[Tu instrukcja]</p>
	<div class="grid">
		<textarea
			id="datainsert"
			name="datainsert"
			rows="10"
			v-model="rawData"
			@input="validate"
		></textarea>
		<p class="message" :class="{ visible: message, hidden: !message }">
			{{ message }}
		</p>
		<button class="button" @click="clearTextarea">
			Wyczyść
			<IconBroom />
		</button>
		<button class="button" @click="pasteTextarea">
			Schowek
			<IconDisk />
		</button>
		<button class="button accent" @click="saveInDB2" v-if="dataType">
			Zatwierdź
			<IconCheck />
		</button>
	</div>

	<hr />
	<ExampleData />
</template>

<style scoped>
.grid {
	display: grid;
	gap: 0.5ex;
	grid-template-columns: repeat(3, max-content) 1fr;
}

#datainsert,
.message {
	grid-column: 1 / span 4;
	width: 100%;
}

.message {
	margin: 0;
	transition-property: height, scale;
	transition-duration: var(--transition-duration);
}

.message.hidden {
	height: 0ch;
	scale: 1 0;
}

.message.visible {
	height: 3ch;
	scale: 1 1;
}

p {
	overflow: hidden;
	max-height: 8ch;
}
</style>
