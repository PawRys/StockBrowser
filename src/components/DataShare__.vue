<script setup>
import { ref } from 'vue';
import { db as idb } from '../utils/dexiedb.js';

const shareCode = ref();
const password = ref();
const message = ref();
let msgcode = '';

async function shareData() {
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
		message.value = '🔑 Hasło prawidłowe. Udostępniasz wrażliwe dane.';
	}
	if (msgcode === 'negative') {
		message.value = '🔒 Błędne hasło. Udostępniasz bezpieczne dane.';
	}
}
</script>

<template>
	<section class="share-tab" id="share-tab">
		<div class="share-tab__wrapper">
			<h2 class="share-tab__header">Udostępnij</h2>
			<form class="share-tab__form" action="javascript:void(0);">
				<input
					id="share-password"
					type="password"
					placeholder="Sekretne hasło"
					v-model="password" />
				<button class="button small accent" @click="shareData">Generuj kod</button>
			</form>
			<p class="share-tab__share-code" id="share-code">{{ shareCode }}</p>
			<p class="share-tab__message">{{ message }}</p>
		</div>
	</section>
	<section class="share-tab__manual">
		<h3>Instrukcja udostępniania danych w chmurze</h3>
		<input class="openclose__input" type="checkbox" id="manual-share" />
		<label class="openclose__label" for="manual-share"></label>
		<ul>
			<li>Kliknij [Generuj kod], aby wygenerować kod wymiany danych</li>
			<li>Kod wymiany danych jest jednorazowy i ważny przez dwie minuty od wygenerowania</li>
			<li>Podając tajne hasło udostępnisz dane wrażliwe takie jak ceny zakupowe towarów</li>
			<li>
				Tajne hasło znają nieliczni i tak pozostanie dopóki nie wymyślę lepszego systemu
			</li>
		</ul>
	</section>
</template>

<style scoped>
.share-tab {
	width: 100%;
	/* height: 60vh; */

	display: flex;
	justify-content: center;
	flex-direction: column;
	align-items: center;
}
.share-tab__share-code {
	font-size: 3rem;
	font-weight: 600;
}

.openclose__input {
	display: none;
}
.openclose__label {
	color: var(--accent-color);
}
.openclose__input + *::after {
	content: 'rozwiń';
}
.openclose__input:checked + *::after {
	content: 'zwiń';
}
.openclose__input + * + * {
	display: none;
}
.openclose__input:checked + * + * {
	display: block;
}
</style>
