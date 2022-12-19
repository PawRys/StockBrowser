<script setup>
import { inject, ref, isRef, watchEffect, watch } from 'vue';
import { db as idb } from '../utils/dexiedb.js';
import ExampleData from './DataCollector_ExampleData.vue';
import {
	recognise,
	prepareBeforeUpdate,
	fetchProducts,
	updateProducts,
} from './DataCollector_.js';

const textareaData = ref();
const dataType = ref(null);
const messageBox = ref('');
const globalEvent = inject('GlobalEvents');
const modalIsOpen = ref(false);

function recogniseData() {
	const { message, data } = recognise(textareaData.value);
	messageBox.value = message;
	dataType.value = data;
}

function textareaClear() {
	textareaData.value = '';
	recogniseData();
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
		alert(
			`Uprawnienia do schowka dla tej witryny zostały wyłączone. Ask Google for help.`
		);
		return;
	} else {
		const clipboardData = await navigator.clipboard
			.readText()
			.catch(reason => console.error(reason));
		textareaData.value = clipboardData;
		recogniseData();
	}
}

async function saveInIDB() {
	console.time('saveInIDB');
	messageBox.value = 'Loading... ⏳';
	let result;

	// function testfn() {
	// 	return new Promise((resolve, reject) => {
	// 		const el = document.getElementById('testel');
	// 		const ev = el.addEventListener(
	// 			'click',
	// 			() => {
	// 				resolve('resolve value');
	// 			},
	// 			{ once: true }
	// 		);
	// console.log('inside promise');
	// console.log(ev);
	// console.log(testval.value);
	// if (testval.value) {
	// }
	// 	});
	// }

	// console.log('before pompt');
	// let prompt = await testfn();
	// console.log(prompt);
	// console.log('after pompt');

	if (dataType.value === 'code') {
		const fetchURL = 'https://bossman.hekko24.pl/stock_browser_server/index.php';
		// const fetchURL = 'http://localhost:3000/stock_browser_server/index.php';
		result = await fetchProducts(fetchURL, textareaData.value);
	}
	if (dataType.value === 'stocks' || dataType.value === 'prices') {
		const oldData = await idb.products.toArray();
		const newData = prepareBeforeUpdate(textareaData.value, dataType.value);
		result = await updateProducts(oldData, newData, dataType.value);
	}
	const { data, message } = result;

	function checkNewInventory(data) {
		let result = false;
		data.every(row => {
			if (!!row?.iCub || !!row?.iSqr || !!row?.iPcs) {
				result = true;
				return;
			}
		});
		return result;
	}

	function openModal() {
		modalIsOpen.value = true;
	}

	function closeModal() {
		modalIsOpen.value = false;
	}

	function mergeInventory() {
		console.log('merge fn');
	}
	function leaveInventory() {
		return;
	}
	function swapInventory() {
		console.log('swap fn');
	}

	async function askHowToHandle() {
		result = new Promise((resolve, reject) => {
			const buttons = document.querySelectorAll('#leave, #swap, #merge');
			buttons.forEach(el => {
				el.addEventListener('click', e => {
					resolve(e.target.id);
				});
			});
			console.log(buttons);
		});
		return result;
	}

	const isNewInventory = checkNewInventory(data);
	// if (isNewInventory) {
	openModal();
	const handle = await askHowToHandle();
	closeModal();
	if (handle === 'merge') mergeInventory();
	if (handle === 'leave') leaveInventory();
	if (handle === 'swap') swapInventory();
	// }

	messageBox.value = message;
	if (message === 'positive') messageBox.value = '📜 Pobrano dane z chmury ✔';
	if (message === 'negative') messageBox.value = 'Podany kod jest nieaktualny. ❌';

	if (data) {
		try {
			await idb.products.clear();
			await idb.products.bulkAdd(data);
			if (dataType.value === 'code' || dataType.value === 'stocks') {
				// console.log(generateTimestamp('stocks'));
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
			@input="recogniseData"></textarea>

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
