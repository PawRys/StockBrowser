<script setup>
import { ref, inject } from 'vue';
import { db as idb } from '../utils/dexiedb.js';
import {
	defineDataType,
	fetchProducts,
	structurizeData,
	integrateData,
	localDataMerge,
} from './DataCollector__.js';
import ExampleData from './DataCollector__ExampleData.vue';

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
	const importedDataRef = importedData.value;
	const importedDataTypeRef = importedDataType.value;
	let result, message;
	messageBox.value = 'Loading... ⏳';

	if (importedDataTypeRef.match(/code/i)) {
		// const fetchURL = 'http://localhost:3000/stock_browser_server/index.php';
		const fetchURL = 'https://bossman.hekko24.pl/stock_browser_server/index.php';
		result = await fetchProducts(fetchURL, importedDataRef);
	}

	if (importedDataTypeRef.match(/stocks|prices/i)) {
		result = structurizeData(importedDataRef, importedDataTypeRef);
	}

	let { data, message: server_msg } = result;
	if (server_msg === 'positive') server_msg = '📜 Pobrano dane z chmury ✔';
	if (server_msg === 'negative') server_msg = 'Podany kod jest nieaktualny. ❌';

	if (data) {
		data = integrateData(data, importedDataTypeRef);
		message = await localDataMerge(data, importedDataTypeRef);
		generateTimestamp(importedDataTypeRef);
	}

	messageBox.value = server_msg || message;
	console.timeEnd('importData()');
}

async function generateTimestamp(dataType) {
	if (dataType.match(/stocks|code/i)) {
		await idb.timestamps.put({
			id: 'stocks',
			timestamp: new Date(),
		});
		globalEvent.value = 'stocks updated';
	}
	if (dataType.match(/prices|code/i)) {
		await idb.timestamps.put({
			id: 'prices',
			timestamp: new Date(),
		});
		globalEvent.value = 'prices updated';
	}
}
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
