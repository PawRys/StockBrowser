<script setup>
import { ref, inject } from 'vue';

import { calcQuant, evalMath } from '../utils/functions.js';
import Dexie from 'dexie';
import { db as idb } from '../utils/dexiedb.js';
import { spreadsheetHeader, spreadsheetRow } from './DataManager__.js';
import { openDialog } from 'vue3-promise-dialog';
import Dialog_Confirm from '../utils/Dialog_Confirm.vue';

const globalEvent = inject('GlobalEvents');
const exportInventoryField = ref();
const exportInventoryMessage = ref();

async function exportInventory() {
	const productsDB = await idb.products.toArray();
	let textFile = spreadsheetHeader();

	for (const row of productsDB) {
		let string = spreadsheetRow(row);
		textFile += string;
	}

	await navigator.clipboard
		.writeText(textFile)
		.then(() => {
			exportInventoryMessage.value = '🙂 Skopiowano do schowka';
		})
		.catch(reason => console.error(reason));
	exportInventoryField.value = textFile;
}

async function purgeInventory() {
	console.time('purgeInventory');
	let text = '<h3>Usuwasz inwentaryzację</h3>';
	text += '<p>Zostaną wyzerowane tylko dane ze zlicznia towaru.</p>';
	text += '<p>Akcja jest nieodwracalna. Czy jesteś pewien?</p>';
	let answer = false || (await openDialog(Dialog_Confirm, { text }));
	if (answer === false) return;

	idb.transaction('rw', idb.products, async () => {
		await idb.products.toCollection().modify(row => {
			delete row.iCub;
			delete row.iSqr;
			delete row.iPcs;
		});
	})
		.catch(Dexie.ModifyError, error => {
			console.error(error.failures.length + ' items failed to modify');
		})
		.catch(error => {
			console.error('Generic error: ' + error);
		});
	console.timeEnd('purgeInventory');
}

async function purgeProducts() {
	console.time('purgeProducts');
	let text = '<h3>Usuwasz bazę danych sklejki</h3>';
	text += '<p>Cała baza danych z tego urządzenia zostanie usunięta.</p>';
	text += '<p>Akcja jest nieodwracalna. Czy jesteś pewien?</p>';
	let answer = false || (await openDialog(Dialog_Confirm, { text }));
	if (answer === false) return;
	await idb.products.clear();
	await idb.timestamps.clear();
	globalEvent.value = 'timestamps removed';
	console.timeEnd('purgeProducts');
}

// myFunction();
function myFunction() {
	if ((navigator.userAgent.indexOf('Opera') || navigator.userAgent.indexOf('OPR')) != -1) {
		alert('Opera');
	} else if (navigator.userAgent.indexOf('Edg') != -1) {
		alert('Edge');
	} else if (navigator.userAgent.indexOf('Chrome') != -1) {
		alert('Chrome');
	} else if (navigator.userAgent.indexOf('Safari') != -1) {
		alert('Safari');
	} else if (navigator.userAgent.indexOf('Firefox') != -1) {
		alert('Firefox');
	} else if (navigator.userAgent.indexOf('MSIE') != -1 || !!document.documentMode == true) {
		//IF IE > 10
		alert('IE');
	} else {
		alert('unknown');
	}
}
</script>

<template>
	<h2>Zarządzanie bazą danych</h2>
	<section>
		<h3>Export do pliku (kopia zapasowa)</h3>
		<h3>Import z pliku</h3>
	</section>

	<section class="exportInventory">
		<h3>Export inwentaryzacji</h3>
		<!-- <p>Dane można wkleić do arkusza kalkulacyjnego.</p> -->

		<button class="exportInventory__button accent" @click="exportInventory">
			Eksport inwentaryzacji
		</button>
		<span class="exportInventory__message">{{ exportInventoryMessage }}</span>

		<textarea
			v-if="exportInventoryField"
			v-model="exportInventoryField"
			name="exportInventory"
			id="exportInventory"
			class="exportInventory__textarea"
			cols="30"
			rows="10"></textarea>
	</section>

	<section>
		<h3>Wymazywanie danych</h3>
		<button class="accent2" @click="purgeInventory">
			<i class="bi bi-calculator-fill"></i>
			<span>Wyzeruj inwentaryzację</span>
		</button>
		<button class="accent2" @click="purgeProducts">
			<i class="bi bi-cart4"></i>
			<span>Wyczyść bazę danych</span>
		</button>
	</section>
</template>

<style scoped>
.exportInventory__textarea {
	width: 100%;
}
</style>
