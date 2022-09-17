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

function fnClear() {
	rawData.value = ''
	fnValidate()
}

async function fnPaste(e) {
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

	fnValidate()
}

async function clipData(type) {
	const permission = await navigator.permissions.query({
		name: 'clipboard-read',
	})

	if (permission.state == 'denied') {
		alert(`Uprawnienia do schowka dla tej witryny zostały wyłączone. Ask Google for help.`)
		return
	}

	let data = 'No data submitted'
	switch (type) {
		case 'raw_stocks':
			data = raw_stocks
			break

		case 'raw_prices':
			data = raw_prices
			break

		case 'raw_products':
			data = raw_products
			break

		default:
			break
	}

	navigator.clipboard.writeText(data).catch((reason) => console.error(reason))
}

function fnValidate() {
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

async function fnAccept() {
	if (!rawData.value) return
	console.time('t')
	const linesArray = rawData.value.match(/[^\r\n]+/g)

	if (dataType.value === 'prices') await db.prices.clear()
	if (dataType.value === 'stocks') await db.stocks.clear()
	for (let lineId in linesArray) {
		message.value = `Ładowanie danych ${Math.round((lineId * 100) / linesArray.length)}%`

		const line = linesArray[lineId]
		const lineSegments = line.match(/[^\t]+/g)

		if (dataType.value === 'prices' && lineSegments.length !== 6) continue
		if (dataType.value === 'stocks' && lineSegments.length !== 7) continue

		db.products.put({
			id: lineSegments[0],
			name: lineSegments[1],
			size: getProductSize(line),
		})

		if (dataType.value === 'prices') {
			const price = lineSegments[4].replace(',', '.') * 1
			if (price === 0) continue
			db.prices.add({
				id: lineSegments[0],
				unit: lineSegments[2],
				price: price,
			})
		}

		if (dataType.value === 'stocks') {
			const total = lineSegments[6].replace(',', '.') * 1
			const aviable = lineSegments[3].replace(',', '.') * 1
			if (total === 0) continue
			db.stocks.add({
				id: lineSegments[0],
				unit: lineSegments[2],
				total: total,
				aviable: aviable,
			})
		}
	}
	if (dataType.value === 'prices') message.value = '💵 Zaktualizowano ceny ✔'
	if (dataType.value === 'stocks') message.value = '📦 Zaktualizowano ilości ✔'

	console.log(`Done.`)
	console.timeEnd('t')
}

function getProductSize(line) {}
</script>

<template>
	<div class="grid">
		<button class="button" @click="clipData('raw_stocks')">Do schowka: Ilości</button>
		<button class="button" @click="clipData('raw_prices')">Do schowka: Ceny</button>
		<button class="button" @click="clipData('raw_products')">Do schowka: Baza kodów</button>
	</div>
	<h1>Data Insert Template</h1>
	<div class="grid">
		<textarea
			id="datainsert"
			name="datainsert"
			rows="10"
			v-model="rawData"
			@input="fnValidate"
		></textarea>
		<p class="message" :class="{ visible: message, hidden: !message }">
			{{ message }}
		</p>
		<button class="button" @click="fnClear">
			Wyczyść
			<IconBroom />
		</button>
		<button class="button" @click="fnPaste">
			Schowek
			<IconDisk />
		</button>
		<button class="button accent" @click="fnAccept" v-if="dataType">
			Zatwierdź
			<IconCheck />
		</button>
		<!-- <button class="button accent" @click="fnAccept"
			:class="{visible: dataType, hidden: !dataType }">Zatwierdź <IconCheck /></button> -->
	</div>

	<div id="debug">
		<!-- <p><b>Text value:</b> {{ rawData }}</p> -->
		<p><b>Data type:</b> {{ dataType }}</p>
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
