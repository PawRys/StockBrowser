<script setup>
import { ref } from 'vue';
import { db as idb } from '../dexiedb.js';

const shareCode = ref();
const password = ref();
const message = ref();
let msgcode = '';

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
		'https://bossman.hekko24.pl/stock_browser_server/index.php',
		// 'http://localhost:3000/stock_browser_server/index.php',
		fetchSettings
	).catch(reason => console.error(reason));

	// console.log(await msg.json())
	msgcode = (await fetchResult.json()).message;
	if (msgcode === 'positive') {
		message.value = 'Hasło poprawne. Udostępniasz pełne dane. 😄';
	}
	if (msgcode === 'negative') {
		message.value = 'Błędne hasło. Udostępniasz okrojone dane. 😐';
	}
}
</script>

<template>
	<section id="share-tab">
		<h2>Udostępnij</h2>
		<form action="javascript:void(0);">
			<input
				id="share-password"
				type="password"
				placeholder="Sekretne hasło"
				v-model="password" />
			<button class="button small accent" @click="generateCode">Generuj kod</button>
		</form>
		<p id="share-code">{{ shareCode }}</p>
		<p>{{ message }}</p>
	</section>
</template>

<style scoped>
#share-tab {
	width: 100%;
	height: 60vh;

	display: flex;
	justify-content: center;
	flex-direction: column;
	align-items: center;
}
#share-code {
	font-size: 3rem;
	font-weight: 600;
}
</style>
