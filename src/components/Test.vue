<script setup>
import { ref, inject } from 'vue';
import { db as idb } from '../utils/dexiedb.js';
import { defineDataType, fetchProducts, structurizeData } from './DataCollector_.js';
import ExampleData from './DataCollector_ExampleData.vue';

const importedData = ref();
const importedDataType = ref(null);
const messageBox = ref('');
const globalEvent = inject('GlobalEvents');
const modalIsOpen = ref(false);

function checkDataType() {
	const { message, data } = defineDataType(importedData.value);
	messageBox.value = message;
	importedDataType.value = data;
}

function textareaClear() {
	importedData.value = '';
	checkDataType();
}

async function textareaPaste(e) {
	const permission = await navigator.permissions.query({
		name: 'clipboard-read',
	});
	if (permission.state == 'denied') {
		alert(`Uprawnienia do schowka dla tej witryny zostały wyłączone. Ask Google for help.`);
		return;
	} else {
		const clipboardData = await navigator.clipboard
			.readText()
			.catch(reason => console.error(reason));
		importedData.value = clipboardData;
		checkDataType();
	}
}

async function importData() {
	console.time('importData()');
	let result;
	messageBox.value = 'Loading... ⏳';

	if (importedDataType.value === 'code') {
		const code = importedData.value;
		const fetchURL = 'https://bossman.hekko24.pl/stock_browser_server/index.ph';
		// const fetchURL = 'http://localhost:3000/stock_browser_server/index.php';
		result = await fetchProducts(fetchURL, code);
	}

	if (importedDataType.value === 'stocks' || importedDataType.value === 'prices') {
		const data = importedData.value;
		const dataType = importedDataType.value;
		result = structurizeData(data, dataType);
	}

	const { data, message } = result;

	if (data) {
		mergeWithLocalData(data, importedDataType.value);
	}

	messageBox.value = message;
	if (message === 'positive') messageBox.value = '📜 Pobrano dane z chmury ✔';
	if (message === 'negative') messageBox.value = 'Podany kod jest nieaktualny. ❌';
	console.timeEnd('importData()');
}

async function mergeWithLocalData(newData, dataType) {
	const localData = await idb.products.toArray();
	if (dataType === 'stocks') {
		resetStocks(localData);
	}
	if (dataType === 'prices') {
		resetPrices(localData);
	}
	if (dataType === 'code') {
		resetStocks(localData);
		resetPrices(localData);
	}

	for (const newItem of newData) {
		const localProductIndex = localData.findIndex(local => local.code === newItem.code);
		const isNewProduct = localProductIndex < 0 ? true : false;
		const currentProduct = isNewProduct ? {} : currentData[productIndex];
		Object.assign(localData, newItem);
	}
	console.log(localData);

	function resetStocks(data) {
		for (const row of data) {
			row.tCub = 0;
			row.aCub = 0;
		}
	}
	function resetPrices(data) {
		for (const row of data) {
			row.pCub = 0;
		}
	}
}

// async function getRemoteData(code) {}

// async function getCopyPasteData(data, dataType) {
// 	// const oldData = await idb.products.toArray();
// }
</script>

<template>
	<h1>Test Tab</h1>
	<h2>Data collector v2</h2>
	<section class="data-collector">
		<textarea
			id="datainsert"
			name="datainsert"
			rows="10"
			v-model="importedData"
			@input="checkDataType">
		</textarea>

		<p class="messageBox" :class="{ visible: messageBox, hidden: !messageBox }">
			{{ messageBox }}
		</p>

		<p class="buttons">
			<button class="button" @click="textareaClear">
				<span>Wyczyść</span>
				<i class="bi bi-backspace"></i>
			</button>

			<button class="button" @click="textareaPaste">
				<span>Schowek</span>
				<i class="bi bi-save"></i>
			</button>

			<button class="button accent" @click="importData" v-if="importedDataType">
				<span>Zatwierdź</span>
				<i class="bi bi-check2"></i>
			</button>
		</p>
	</section>

	<example-data />
</template>

<style scoped>
.data-collector > * {
	width: 100%;
}

.messageBox {
	margin: 0;
	transition-property: height, scale;
	transition-duration: var(--transition-duration);
}

.messageBox.hidden {
	height: 0ch;
	scale: 1 0;
}

.messageBox.visible {
	height: 2.5ch;
	scale: 1 1;
}
</style>
