<script setup>
import { ref } from 'vue';
import { db as idb } from '../dexiedb.js';
import {
	validate,
	prepareBeforeUpdate,
	fetchProducts,
	updateProducts,
} from './DataCollector_.js';
import ExampleData from './DataCollector_ExampleData.vue';

const textareaData = ref();
const dataType = ref(null);
const messageBox = ref('');

function checkValidation() {
	const { message, data } = validate(textareaData.value);
	messageBox.value = message;
	dataType.value = data;
}

function textareaClear() {
	textareaData.value = '';
	checkValidation();
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
		checkValidation();
	}
}

async function bulkAddIDB() {
	console.time('dexie-bulkAdd');
	messageBox.value = 'Loading... ⏳';
	let result;

	if (dataType.value === 'code') {
		const fetchURL = 'https://bossman.hekko24.pl/stock_browser_server/index.php';
		// const fetchURL = 'http://localhost:3000/stock_browser_server/index.php';
		result = await fetchProducts(fetchURL, textareaData.value);
	} else {
		const oldData = await idb.products.toArray();
		const newData = prepareBeforeUpdate(textareaData.value, dataType.value);
		result = await updateProducts(oldData, newData, dataType.value);
	}

	const { data, message } = result;
	messageBox.value = message;
	if (message === 'positive') {
		messageBox.value = '📜 Pobrano dane z chmury ✔';
	}
	if (message === 'negative') {
		messageBox.value = 'Podany kod jest nieaktualny. ❌';
	}

	if (data) {
		try {
			await idb.products.clear();
			await idb.products.bulkAdd(data);
			if (dataType.value === 'code' || dataType.value === 'stocks') {
				await idb.timestamps.put({
					id: 'stocks',
					timestamp: new Date().toJSON().split('T')[0],
				});
			}
			if (dataType.value === 'code' || dataType.value === 'prices') {
				await idb.timestamps.put({
					id: 'prices',
					timestamp: new Date().toJSON().split('T')[0],
				});
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
			@input="checkValidation"></textarea>
		<p class="messageBox" :class="{ visible: messageBox, hidden: !messageBox }">
			{{ messageBox }}
		</p>
		<button class="button" @click="textareaClear">
			Wyczyść
			<i class="bi bi-backspace"></i>
		</button>
		<button class="button" @click="textareaPaste">
			Schowek
			<i class="bi bi-save"></i>
		</button>
		<button class="button accent" @click="bulkAddIDB" v-if="dataType">
			Zatwierdź
			<i class="bi bi-check2"></i>
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
