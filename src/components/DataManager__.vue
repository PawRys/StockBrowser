<script setup>
import { ref } from 'vue';
import { calcQuant, evalMath } from '../utils/functions.js';
import { db as idb } from '../utils/dexiedb.js';

const exportInventoryField = ref();
const exportInventoryMessage = ref();

async function exportInventory() {
	const productsDB = await idb.products.toArray();
	let result = 'Kod';
	result += '\tNazwa';
	result += '\tStatus';
	result += '\tRóżnica m3';
	result += '\tRóżnica m2';
	result += '\tRóżnica szt';
	result += '\tMagazyn m3';
	result += '\tMagazyn m2';
	result += '\tMagazyn szt';
	result += '\tSymfonia m3';
	result += '\tSymfonia m2';
	result += '\tSymfonia szt';
	result += '\n';

	for (const row of productsDB) {
		const size = row.size;
		let iCub = row.iCub;
		let iSqr = row.iSqr;
		let iPcs = row.iPcs;
		let tCub = calcQuant(size, row.tCub, 'm3', 'm3', 3);
		let tSqr = calcQuant(size, row.tCub, 'm3', 'm2', 4);
		let tPcs = calcQuant(size, row.tCub, 'm3', 'szt', 1);
		let iSum = 0;

		iCub = evalMath(iCub);
		iSqr = evalMath(iSqr);
		iPcs = evalMath(iPcs);
		iCub = calcQuant(size, iCub, 'm3', 'm3');
		iSqr = calcQuant(size, iSqr, 'm2', 'm3');
		iPcs = calcQuant(size, iPcs, 'szt', 'm3');
		iSum = iCub + iSqr + iPcs;
		iCub = calcQuant(size, iSum, 'm3', 'm3', 3);
		iSqr = calcQuant(size, iSum, 'm3', 'm2', 4);
		iPcs = calcQuant(size, iSum, 'm3', 'szt', 1);
		let dCub = iCub - tCub;
		let dSqr = iSqr - tSqr;
		let dPcs = iPcs - tPcs;

		let status = 'pusty';
		if (dPcs <= -1) status = 'MANKO';
		if (dPcs >= 1) status = 'NADMIAR';
		if (1 > dPcs && dPcs > -1 && tPcs >= 1) status = 'OK';
		if (1 > tPcs && tPcs > 0 && iPcs < 1) status = 'ZERO';

		let string = `${row.code}`;
		string += `\t${row.name}`;
		string += `\t${status}`;
		string += `\t${dCub.toFixed(3)}`;
		string += `\t${dSqr.toFixed(4)}`;
		string += `\t${dPcs.toFixed(1)}`;
		string += `\t${iCub.toFixed(3)}`;
		string += `\t${iSqr.toFixed(4)}`;
		string += `\t${iPcs.toFixed(1)}`;
		string += `\t${tCub.toFixed(3)}`;
		string += `\t${tSqr.toFixed(4)}`;
		string += `\t${tPcs.toFixed(1)}`;
		string += `\n`;
		result += string;
	}

	// const permission = await navigator.permissions.query({ name: 'clipboardWrite' });

	// if (permission.state == 'denied') {
	// 	alert(`Uprawnienia do schowka dla tej witryny zostały wyłączone. Ask Google for help.`);
	// 	return;
	// } else {
	await navigator.clipboard
		.writeText(result)
		.then(() => {
			exportInventoryMessage.value = 'Skopiowano do schowka';
		})
		.catch(reason => console.error(reason));
	// }

	// console.log(result);
	exportInventoryField.value = result;
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

	<section>
		<h3>Export inwentaryzacji</h3>

		<button class="accent" @click="exportInventory">Eksport inwentaryzacji</button>
		<span class="exportInventory__message">{{ exportInventoryMessage }}</span>

		<textarea
			v-model="exportInventoryField"
			name="exportInventory"
			id="exportInventory"
			class="exportInventory"
			cols="30"
			rows="10"></textarea>

		<h3>Wymazywanie</h3>
		<p>- całej bazy danych</p>
		<p>- inwentaryzacji</p>
	</section>
</template>

<style scoped>
.exportInventory {
	width: 100%;
}
</style>
