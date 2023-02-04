<script setup>
import { ref, inject } from 'vue';

import { calcQuant, evalMath } from '../utils/functions.js';
import Dexie from 'dexie';
import { db as idb } from '../utils/dexiedb.js';
import { generateTimestamp } from './DataCollector__.js';
import { spreadsheetHeader, spreadsheetRow } from './DataManager__.js';
import { openDialog } from 'vue3-promise-dialog';
import Dialog_Confirm from '../utils/Dialog_Confirm.vue';
import CryptoJS from 'crypto-js';

import FingerprintJS from '@fingerprintjs/fingerprintjs';
const fpPromise = FingerprintJS.load();
const globalEvent = inject('GlobalEvents');
const messageBox__database = ref('');

async function exportIDB() {
	const file = `StockBrowserBackup-${new Date().toJSON().split('T')[0]}.json`;
	const data = JSON.stringify(await idb.products.toArray());
	const type = 'application/json; charset=UTF-8';
	const fp = await fpPromise;
	const fpresult = await fp.get();
	console.log(fpresult.visitorId);
	const encryptedData = CryptoJS.AES.encrypt(data, fpresult.visitorId).toString();

	try {
		downloadFile(file, encryptedData, type);
	} catch (error) {
		console.error(`**exportIDB()**`, error);
		messageBox__database.value = `❌ Błąd podczas zapisywania bazy danych.`;
	}
}

async function importIDB(event) {
	const file = event.target.files[0];
	if (!file) return;
	const reader = new FileReader();

	reader.onload = async evt => {
		try {
			const fp = await fpPromise;
			const fpresult = await fp.get();
			const decryptedData = CryptoJS.AES.decrypt(evt.target.result, fpresult.visitorId).toString(
				CryptoJS.enc.Utf8
			);
			const result = JSON.parse(decryptedData);
			await idb.products.clear();
			await idb.products.bulkAdd(result);
			generateTimestamp('code');
			globalEvent.value = 'timestamp updated';
			messageBox__database.value = `✅ Baza danych została przywrócona pomyślnie.`;
		} catch (error) {
			console.error('**importBackup()**', error);
			messageBox__database.value = `❌ Błąd podczas przywracania bazy danych.`;
			if (error.message.match(/Malformed UTF-8 data/))
				messageBox__database.value = `❌ Błąd. Kopia zapasowa może zostać przywrócona tylko w przeglądarce, w której została utworzona.`;
		}
	};
	reader.readAsText(file);
}

async function purgeIDB() {
	console.time('purgeProducts');
	let text = '<h3>Usuwasz bazę danych sklejki</h3>';
	text += '<p>Cała baza danych z tego urządzenia zostanie usunięta.</p>';
	text += '<p>Akcja jest nieodwracalna. Czy usunąć?</p>';
	let answer = false || (await openDialog(Dialog_Confirm, { text }));
	if (answer === false) return;
	await idb.products.clear();
	await idb.timestamps.clear();
	messageBox__database.value = `❗ Baza danych została usunięta.`;
	globalEvent.value = 'timestamps removed';
	console.timeEnd('purgeProducts');
}

async function createInventorySpreadsheet() {
	const productsDB = await idb.products.toArray();
	let tableHead = spreadsheetHeader();
	let tableBody = '';
	let table = '';

	for (const row of productsDB) {
		tableBody += spreadsheetRow(row);
	}
	tableHead = tableHead.replace(/\t?([^\t\n]+)\t?/g, '<th>$1</th>');
	tableHead = tableHead.replace(/^(.+)$/gm, '<tr>$1</tr>');
	tableBody = tableBody.replace(/\t?([^\t\n]+)\t?/g, '<td>$1</td>');
	tableBody = tableBody.replace(/^(.+)$/gm, '<tr>$1</tr>');
	table = `<table><thead>${tableHead}</thead><tbody>${tableBody}</tbody></table>`;
	return table;
}

async function exportInventory() {
	const file = `Inwentaryzacja-${new Date().toJSON().split('T')[0]}.xls`;
	const data = await createInventorySpreadsheet();
	const type = 'application/vnd.ms-excel; charset=UTF-8';
	try {
		downloadFile(file, data, type);
	} catch (error) {
		console.error(`**exportInventory()**`, error);
	}
}

async function purgeInventory() {
	console.time('purgeInventory');
	let text = '<h3>Usuwasz inwentaryzację</h3>';
	text += '<p>Zostaną wyzerowane tylko dane ze zlicznia towaru.</p>';
	text += '<p>Akcja jest nieodwracalna. Czy usunąć?</p>';
	let answer = false || (await openDialog(Dialog_Confirm, { text }));
	if (answer === false) return;

	idb
		.transaction('rw', idb.products, async () => {
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
			console.error('**purgeInventory()**', error);
		});
	console.timeEnd('purgeInventory');
}

function downloadFile(file, data, type) {
	const blob = new Blob([data], { type: type });
	const blobUrl = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = blobUrl;
	link.download = file;
	document.body.appendChild(link);
	link.dispatchEvent(
		new MouseEvent('click', {
			bubbles: true,
			cancelable: true,
			view: window,
		})
	);
	document.body.removeChild(link);
	URL.revokeObjectURL(blob);
}

function passClick(query) {
	const element = document.querySelector(query);
	element.click();
}
</script>

<template>
	<section>
		<h2>Baza danych</h2>
		<button class="exportBackup__button button" @click="exportIDB()">
			<i class="bi bi-file-earmark-arrow-down"></i>
			<span>Utwórz kopię zapasową</span>
		</button>

		<button for="backupImport" class="button" @click="passClick('#backupImport')">
			<i class="bi bi-file-earmark-arrow-up"></i>
			<span>Wczytaj kopię zapasową</span>
		</button>
		<input type="file" name="backupImport" id="backupImport" @change="importIDB($event)" />

		<button class="accent2" @click="purgeIDB">
			<i class="bi bi-file-earmark-x"></i>
			<span>Wyczyść bazę danych</span>
		</button>
		<p class="messageBox__database">{{ messageBox__database }}</p>
	</section>

	<section class="exportInventory">
		<h2>Inwentaryzacja</h2>
		<button class="exportInventory__button button" @click="exportInventory()">
			<i class="bi bi-file-earmark-spreadsheet"></i>
			<span>Eksportuj inwentaryzację</span>
		</button>
		<button class="accent2" @click="purgeInventory">
			<i class="bi bi-file-earmark-minus"></i>
			<span>Wyczyść inwentaryzację</span>
		</button>
	</section>
</template>

<style scoped>
#backupImport {
	display: none;
}
</style>
