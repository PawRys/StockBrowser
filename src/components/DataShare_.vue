<script setup>
import { ref, reactive, computed, watch, provide, inject } from 'vue';
import { db as idb } from '../assets/dexiedb.js';

const shareCode = ref();
const password = ref();
const message = ref();

async function generateCode() {
	message.value = 'Wysyłanie danych...';
	shareCode.value = Math.random().toString().substring(2, 6);
	const URLparams = {
		action: 'provide',
		pin: shareCode.value,
		password: password.value,
		data: JSON.stringify(await idb.products.toArray()),
	};

	const fetchSettings = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
		},
		body: new URLSearchParams(URLparams).toString(),
	};

	const fetchResult = await fetch(
		// 'https://bossman.hekko24.pl/apps/assets/website/app_stocks/stocks.3.php',
		'https://bossman.hekko24.pl/stock_browser_server/index.php',
		// 'http://localhost:3000/stock_browser_server/index.php',
		fetchSettings
	).catch(reason => console.error(reason));

	// console.log(await msg.json())
	message.value = (await fetchResult.json()).message;
}
</script>

<template>
	<h2>Udostępnij</h2>
	<p>
		<input
			id="share-password"
			type="password"
			placeholder="Sekretne hasło"
			v-model="password" />
		<button class="button small accent" @click="generateCode">Generuj kod</button>
	</p>
	<p id="share-code">{{ shareCode }}</p>
	<p>{{ message }}</p>
</template>

<style scoped></style>
