<script setup>
import { ref } from 'vue'
import { db as idb } from '../assets/dexiedb.js'
import { message_ref, dataType_ref, validate } from '../assets/DataInsertScripts.js'
import IconBroom from './icons/IconBroom.vue'
import IconCheck from './icons/IconCheck.vue'
import IconDisk from './icons/IconDisk.vue'
import ExampleData from './DataInsert_ExampleData.vue'

const textareaVal_ref = ref()

function checkValidation() {
	validate(textareaVal_ref.value)
}

function clearTextarea() {
	textareaVal_ref.value = ''
	validate(textareaVal_ref.value)
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

	textareaVal_ref.value = clipboardData
	validate(textareaVal_ref.value)
}

async function saveInDB2() {
	console.time('saveInDB2')

	const products = await idb.products.toArray()
	const linesArray = textareaVal_ref.value.match(/[^\r\n]+/g)

	for (let line of linesArray) {
		const lineFragments = line.match(/[^\t]+/g)

		// Ommit garbage
		if (/\b(kod|podsumowanie|dostawa|transport|usługa|zamówienie)/i.test(lineFragments[0])) continue
		if (dataType_ref.value === 'products' && lineFragments.length !== 2) continue
		if (dataType_ref.value === 'prices' && lineFragments.length !== 6) continue
		if (dataType_ref.value === 'stocks' && lineFragments.length !== 7) continue

		const id = lineFragments[0]
		const name = lineFragments[1]
		const idx = products.findIndex((row) => row.id === id)
		const data = idx < 0 ? {} : products[idx]

		Object.assign(data, {
			id: id,
			name: name,
			size: getProductSize(`${id} ${name}`),
		})

		if (idx < 0) {
			Object.assign(data, {
				// size: 0,
				price: 0,
				total: 0,
				aviable: 0,
				priceUnit: 'm3',
				stockUnit: 'm3',
			})
		}

		if (dataType_ref.value === 'prices') {
			Object.assign(data, {
				price: lineFragments[4].replace(',', '.') * 1 || 0,
				priceUnit: lineFragments[2],
			})
		}

		if (dataType_ref.value === 'stocks') {
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

	message_ref.value = 'Loading... ⏳'
	await idb.products.clear()
	await idb.products
		.bulkAdd(products)
		.then(async () => {
			message_ref.value = '📜 Zaktualizowano produkty ✔'
			if (dataType_ref.value === 'prices') message_ref.value = '💵 Zaktualizowano ceny ✔'
			if (dataType_ref.value === 'stocks') message_ref.value = '📦 Zaktualizowano ilości ✔'
			console.timeEnd('saveInDB2')
			// await timeout(2000)
			// clearTextarea()
		})
		.catch((err) => {
			message_ref.value = 'Coś poszło nie tak ❗'
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

function test(input) {
	return input.split(' ')
}
// const test = { pik: 'pik', pok: 'pok' }
let [a, b] = test('AAA BBB')

console.log(a)
console.log(b)
</script>

<template>
	<h2>Załaduj dane</h2>
	<p>[Tu instrukcja]</p>
	<div class="grid">
		<textarea
			id="datainsert"
			name="datainsert"
			rows="10"
			v-model="textareaVal_ref"
			@input="checkValidation"
		></textarea>
		<p class="message" :class="{ visible: message_ref, hidden: !message_ref }">
			{{ message_ref }}
		</p>
		<button class="button" @click="clearTextarea">
			Wyczyść
			<IconBroom />
		</button>
		<button class="button" @click="pasteTextarea">
			Schowek
			<IconDisk />
		</button>
		<button class="button accent" @click="saveInDB2" v-if="dataType_ref">
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
