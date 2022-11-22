<script setup>
import { ref } from 'vue';
import { db as idb } from '../assets/dexiedb.js';
import {
	validate,
	prepareData,
	fetchProducts,
	updateProducts,
} from './DataCollector_Scripts.js';
import IconBroom from './icons/IconBroom.vue';
import IconCheck from './icons/IconCheck.vue';
import IconDisk from './icons/IconDisk.vue';
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
	console.time('bulkAddIDB');
	let result;
	messageBox.value = 'Loading... ⏳';

	if (dataType.value === 'code') {
		// const fetchURL = 'https://bossman.hekko24.pl/apps/assets/website/app_stocks/stocks.3.php'
		const fetchURL = 'http://localhost:3000/api/index.php';
		result = await fetchProducts(fetchURL, textareaData.value);
	} else {
		const oldData = await idb.products.toArray();
		const newData = prepareData(textareaData.value, dataType.value);
		result = await updateProducts(oldData, newData, dataType.value);
	}

	const { data, message } = result;
	messageBox.value = message;

	if (data) {
		try {
			await idb.products.clear();
			await idb.products.bulkAdd(data);
		} catch (err) {
			messageBox.value = 'Coś poszło nie tak ❗';
			console.error(err);
		}
	}
	console.timeEnd('bulkAddIDB');
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
			<IconBroom />
		</button>
		<button class="button" @click="textareaPaste">
			Schowek
			<IconDisk />
		</button>
		<button class="button accent" @click="bulkAddIDB" v-if="dataType">
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
