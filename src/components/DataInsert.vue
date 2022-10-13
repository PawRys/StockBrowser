<script setup>
import { ref } from 'vue'
import { db as idb } from '../assets/dexiedb.js'
import { textareaValue_ref, message_ref, dataType_ref } from './DataInsertScripts.js'
import { validate, prepareData, calcQuant, calcPrice } from './DataInsertScripts.js'
import IconBroom from './icons/IconBroom.vue'
import IconCheck from './icons/IconCheck.vue'
import IconDisk from './icons/IconDisk.vue'
import ExampleData from './DataInsert_ExampleData.vue'

async function textareaPaste(e) {
	const permission = await navigator.permissions.query({
		name: 'clipboard-read',
	})
	if (permission.state == 'denied') {
		alert(`Uprawnienia do schowka dla tej witryny zostały wyłączone. Ask Google for help.`)
		return
	}
	const clipboardData = await navigator.clipboard.readText().catch(reason => console.error(reason))
	textareaValue_ref.value = clipboardData
	validate(textareaValue_ref.value)
}

function checkValidation() {
	validate(textareaValue_ref.value)
}

function textareaClear() {
	textareaValue_ref.value = ''
	validate(textareaValue_ref.value)
}

async function bulkAddIDB() {
	console.time('bulkAddIDB')
	const productsTable = await idb.products.toArray()
	const productsNewData = prepareData(textareaValue_ref.value)
	for (let newProduct of productsNewData) {
		const productId = newProduct[0]
		const productName = newProduct[1]
		const productIndex = productsTable.findIndex(row => row.id === productId)
		const currentProduct = productIndex < 0 ? {} : productsTable[productIndex]
		const size = getProductSize(`${productId} ${productName}`).replace(',', '.')
		Object.assign(currentProduct, {
			id: productId,
			name: productName,
			// size: getProductSize(`${productId} ${productName}`).replace(',', '.'),
		})
		if (productIndex < 0) {
			Object.assign(currentProduct, {
				price: 0,
				total_m3: 0,
				total_m2: 0,
				total_szt: 0,
				aviable_m3: 0,
				aviable_m2: 0,
				aviable_szt: 0,
			})
		}
		if (dataType_ref.value === 'prices') {
			Object.assign(currentProduct, {
				price: calcPrice(size, newProduct[4], newProduct[2], 'm3'),
			})
		}
		if (dataType_ref.value === 'stocks') {
			Object.assign(currentProduct, {
				total_m3: calcQuant(size, newProduct[6], newProduct[2], 'm3'),
				total_m2: calcQuant(size, newProduct[6], newProduct[2], 'm2'),
				total_szt: calcQuant(size, newProduct[6], newProduct[2], 'szt'),
				aviable_m3: calcQuant(size, newProduct[3], newProduct[2], 'm3'),
				aviable_m2: calcQuant(size, newProduct[3], newProduct[2], 'm2'),
				aviable_szt: calcQuant(size, newProduct[3], newProduct[2], 'szt'),
				// total: newProduct[6],
				// aviable: newProduct[3],
				// stockUnit: newProduct[2],
			})
		}
		const cursor = productIndex < 0 ? productsTable.length : productIndex
		const replace = productIndex < 0 ? 0 : 1
		productsTable.splice(cursor, replace, currentProduct)
	}
	message_ref.value = 'Loading... ⏳'
	await idb.products.clear()
	await idb.products.bulkAdd(productsTable).catch(err => {
		message_ref.value = 'Coś poszło nie tak ❗'
		console.log(err)
		return
	})
	message_ref.value = '📜 Zaktualizowano produkty ✔'
	if (dataType_ref.value === 'prices') message_ref.value = '💵 Zaktualizowano ceny ✔'
	if (dataType_ref.value === 'stocks') message_ref.value = '📦 Zaktualizowano ilości ✔'
	console.timeEnd('bulkAddIDB')
}

function getProductSize(line) {
	const fullSizeB = line.match(/\d+[,\.]?\d*x\d+x\d+/i)
	return fullSizeB ? fullSizeB[0] : '0'
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
			v-model="textareaValue_ref"
			@input="checkValidation"></textarea>
		<p class="message" :class="{ visible: message_ref, hidden: !message_ref }">
			{{ message_ref }}
		</p>
		<button class="button" @click="textareaClear">
			Wyczyść
			<IconBroom />
		</button>
		<button class="button" @click="textareaPaste">
			Schowek
			<IconDisk />
		</button>
		<button class="button accent" @click="bulkAddIDB" v-if="dataType_ref">
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
