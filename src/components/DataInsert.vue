<script setup>
import { ref } from 'vue'
import { db } from '../assets/dexiedb.js'
import IconBroom from './icons/IconBroom.vue'
import IconCheck from './icons/IconCheck.vue'
import IconDisk from './icons/IconDisk.vue'
import { raw_stocks } from '../raw_stocks.js'
import { raw_prices } from '../raw_prices.js'
import { raw_products } from '../raw_products.js'

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

async function clipboardPut(type) {
	const permission = await navigator.permissions.query({
		name: 'clipboard-read',
	})

	if (permission.state == 'denied') {
		alert(`Uprawnienia do schowka dla tej witryny zostały wyłączone. Ask Google for help.`)
		return
	}

	let data = 'No data submitted'
	if (type === 'raw_stocks') data = raw_stocks
	if (type === 'raw_prices') data = raw_prices
	if (type === 'raw_products') data = raw_products

	navigator.clipboard.writeText(data).catch((reason) => console.error(reason))
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
		const lineSegments = line.match(/[^\t]+/g)

		if (/\b(kod|podsumowanie|dostawa|transport|usługa|zamówienie)/i.test(lineSegments[0])) continue
		if (dataType.value === 'products' && lineSegments.length !== 2) continue
		if (dataType.value === 'prices' && lineSegments.length !== 6) continue
		if (dataType.value === 'stocks' && lineSegments.length !== 7) continue

		productsArray.push({
			id: lineSegments[0],
			name: lineSegments[1],
			size: getProductSize(line),
		})

		if (dataType.value === 'prices') {
			const price = lineSegments[4].replace(',', '.') * 1 || 0 // Must be 0, not falsies
			if (price === 0) continue
			pricesArray.push({
				id: lineSegments[0],
				unit: lineSegments[2],
				price: price,
			})
		}

		if (dataType.value === 'stocks') {
			const total = lineSegments[6].replace(',', '.') * 1 || 0 // Must be 0, not falsies
			const aviable = lineSegments[3].replace(',', '.') * 1 || 0 // Must be 0, not falsies
			if (total === 0) continue
			stocksArray.push({
				id: lineSegments[0],
				unit: lineSegments[2],
				total: total,
				aviable: aviable,
			})
		}
	}

	message.value = 'Loading...'
	await db.products.bulkPut(productsArray)
	message.value = '📜 Zaktualizowano produkty ✔'

	if (dataType.value === 'prices') {
		await db.prices.clear()
		await db.prices.bulkAdd(pricesArray)
		message.value = '💵 Zaktualizowano ceny ✔'
	}

	if (dataType.value === 'stocks') {
		await db.stocks.clear()
		await db.stocks.bulkAdd(stocksArray)
		message.value = '📦 Zaktualizowano ilości ✔'
	}

	// localStorage['products'] = JSON.stringify(productsArray)
	// message.value = '📜 Zaktualizowano produkty ✔'

	// if (dataType.value === 'prices') {
	// 	localStorage.prices = JSON.stringify(pricesArray)
	// 	message.value = '💵 Zaktualizowano ceny ✔'
	// }

	// if (dataType.value === 'stocks') {
	// 	localStorage.stocks = JSON.stringify(stocksArray)
	// 	message.value = '📦 Zaktualizowano ilości ✔'
	// }

	console.log(`Done.`)
	console.timeEnd(timeName)
}

function getProductSize(line) {
	const sizeCode = line.match(/\d+S\d+\/([\d\w]+)\b/i)
	const fullSizeB = line.match(/\d+[,\.]?\d*x(\d+x\d+)/i)

	// console.log(sizeCode)

	// if (sizeCode && fullSizeB) {
	// 	let codeSizes = {}
	// 	codeSizes[fullSizeB[1]] = 1
	// 	db.sizeCodes.put({
	// 		id: sizeCode[1],
	// 		sizes: codeSizes,
	// 	})
	// }

	if (fullSizeB) return fullSizeB[1]
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
		<button class="button accent" @click="saveInDB" v-if="dataType">
			Zatwierdź
			<IconCheck />
		</button>
		<!-- <button class="button accent" @click="fnAccept"
			:class="{visible: dataType, hidden: !dataType }">Zatwierdź <IconCheck /></button> -->
	</div>

	<hr />
	<h3>Dev things</h3>
	<div class="grid">
		<button class="button" @click="clipboardPut('raw_stocks')">Do schowka: 📦 Ilości</button>
		<button class="button" @click="clipboardPut('raw_prices')">Do schowka: 💵 Ceny</button>
		<button class="button" @click="clipboardPut('raw_products')">Do schowka: 📜 Baza kodów</button>
	</div>
	<hr />
	<div id="debug">
		<h3>Debug</h3>
		<!-- <p><b>Text value:</b> {{ rawData }}</p> -->
		<!-- <p><b>Data type:</b> {{ dataType }}</p> -->
		<!-- <p><b>Message:</b> {{ message }}</p> -->
	</div>
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
