<script setup>
import { inject, ref, isRef, watchEffect, watch } from 'vue';
import { db as idb } from '../utils/dexiedb.js';
import ExampleData from './DataCollector_ExampleData.vue';
import {
	defineDataType,
	prepareBeforeUpdate,
	fetchProducts,
	updateProducts,
} from './DataCollector_.js';

import { openDialog } from 'vue3-promise-dialog';
import ConfirmDialog from '../utils/Dialog_MergeFetchedData.vue';

const textareaData = ref();
const dataType = ref(null);
const messageBox = ref('');
const globalEvent = inject('GlobalEvents');
const modalIsOpen = ref(false);

function checkDataType() {
	const { message, data } = defineDataType(textareaData.value);
	messageBox.value = message;
	dataType.value = data;
}

function textareaClear() {
	textareaData.value = '';
	checkDataType();
}

function generateTimestamp(name) {
	return {
		id: name,
		timestamp: new Date(),
	};
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
		textareaData.value = clipboardData;
		checkDataType();
	}
}

async function saveInIDB() {
	console.time('saveInIDB');
	messageBox.value = 'Loading... ⏳';
	let result;

	if (dataType.value === 'code') {
		result = await getRemoteData();
	}
	if (dataType.value === 'stocks' || dataType.value === 'prices') {
		result = await getCopypasteData();
	}
	const { data, message } = result;

	const isNewInventory = checkInventory(data);
	if (isNewInventory) {
		const answer = await openDialog(ConfirmDialog);
		if (answer === 'merge') mergeInventory();
		if (answer === 'leave') leaveInventory();
		if (answer === 'replace') replaceInventory();
	}

	messageBox.value = message;
	if (message === 'positive') messageBox.value = '📜 Pobrano dane z chmury ✔';
	if (message === 'negative') messageBox.value = 'Podany kod jest nieaktualny. ❌';

	if (data) {
		try {
			await idb.products.clear();
			await idb.products.bulkAdd(data);
			if (dataType.value === 'code' || dataType.value === 'stocks') {
				await idb.timestamps.put(generateTimestamp('stocks'));
				globalEvent.value = 'stocks updated';
			}
			if (dataType.value === 'code' || dataType.value === 'prices') {
				await idb.timestamps.put(generateTimestamp('prices'));
				globalEvent.value = 'prices updated';
			}
		} catch (err) {
			messageBox.value = 'Coś poszło nie tak ❗';
			console.error(err);
		}
	}
	console.timeEnd('dexie-bulkAdd');

	async function getRemoteData() {
		// const fetchURL = 'http://localhost:3000/stock_browser_server/index.php';
		const fetchURL = 'https://bossman.hekko24.pl/stock_browser_server/index.php';
		return await fetchProducts(fetchURL, textareaData.value);
	}

	async function getCopypasteData() {
		const oldData = await idb.products.toArray();
		const newData = prepareBeforeUpdate(textareaData.value, dataType.value);
		return await updateProducts(oldData, newData, dataType.value);
	}

	function checkInventory(data) {
		if (!data) return;
		let result = false;
		data.every(row => {
			if (!!row?.iCub || !!row?.iSqr || !!row?.iPcs) {
				result = true;
				return;
			}
		});
		return result;
	}

	function mergeInventory() {
		console.log('merge fn');
	}

	function leaveInventory() {
		return;
	}

	function replaceInventory() {
		console.log('swap fn');
	}
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
			v-model="textareaData"
			@input="checkDataType"></textarea>

		<p class="messageBox" :class="{ visible: messageBox, hidden: !messageBox }">
			{{ messageBox }}
		</p>

		<button class="button" @click="textareaClear">
			<span>Wyczyść</span>
			<i class="bi bi-backspace"></i>
		</button>

		<button class="button" @click="textareaPaste">
			<span>Schowek</span>
			<i class="bi bi-save"></i>
		</button>

		<button class="button accent" @click="saveInIDB" v-if="dataType">
			<span>Zatwierdź</span>
			<i class="bi bi-check2"></i>
		</button>
	</div>

	<section id="modal" v-show="modalIsOpen">
		<p>Co zrobić z nowymi danymi?</p>
		<button id="leave">Pozostaw stare</button>
		<button id="swap">Zastąp nowymi</button>
		<button id="merge">Złącz</button>
	</section>

	<!-- <hr />
	<ExampleData /> -->
</template>

<style scoped>
.grid {
	display: grid;
	gap: 0.5ex;
	grid-template-columns: repeat(3, max-content) 1fr;
}

#datainsert,
.messageBox {
	grid-column: 1 / span 4;
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
	height: 3ch;
	scale: 1 1;
}

p {
	overflow: hidden;
	max-height: 8ch;
}
</style>
