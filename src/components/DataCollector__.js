import { ref } from 'vue';
import { db as idb } from '../utils/dexiedb.js';
import { calcQuant, calcPrice } from '../utils/functions.js';
import { openDialog } from 'vue3-promise-dialog';
import Dialog_MergeFetchedData from '../utils/Dialog_MergeFetchedData.vue';

export function defineDataType(input) {
	let dataType, message;
	if (!input) {
		dataType = null;
		message = ``;
	} else {
		dataType = false;
		message = `Nie rozpoznano danych. ❌`;
	}
	const isStocks = /Stany i rezerwacje towarów/i.test(input);
	const isCorrectStockColumns =
		/Kod towaru		nazwa towaru		jm		stan handlowy	rezerwacje R	rezerwacje A		stan  całkowity	/i.test(
			input
		);
	if (isStocks && isCorrectStockColumns) {
		dataType = 'stocks';
		message = `📦 Rozpoznano stany i rezerwacje towarów.`;
	}

	const isPrices = /Stany magazynowe towarów/i.test(input);
	const isCorrectPriceColumns = /Kod towaru		nazwa towaru		jm		stan	cena	wartość		/i.test(input);
	if (isPrices && isCorrectPriceColumns) {
		dataType = 'prices';
		message = `💵 Rozpoznano ceny zakupowe towarów.`;
	}

	const isProdutsList = /Kod	Nazwa/i.test(input);
	const isProdutsItem = /\d+s\d+\/\d+/i.test(input);
	if (isProdutsList && isProdutsItem) {
		// dataType = 'products';
		// message = `📜 Rozpoznano listę produktów.`;
	}

	const isFullExchangeCode = /^\d{4}$/i.test(input);
	if (isFullExchangeCode) {
		dataType = 'code';
		message = `🔢 Rozpoznano kod wymiany danych.`;
	}

	const isPartExchangeCode = /^\d{1,3}$/i.test(input);
	if (isPartExchangeCode) {
		dataType = null;
		message = ``;
	}

	return { data: dataType, message: message };
}

export function prepareBeforeUpdate(input, dataType) {
	const linesArray = input.match(/[^\r\n]+/g);
	const garbageWords = /\b(kod|podsumowanie|dostawa|transport|usługa|zamówienie)/gi;
	let output = [];

	for (let line of linesArray) {
		const row = line.match(/[^\t]+/g);
		// Ommit garbage
		if (!row) continue;
		if (garbageWords.test(line)) continue;

		if (dataType === 'products' && row.length !== 2) continue;
		if (dataType === 'prices' && row.length !== 6) continue;
		if (dataType === 'stocks' && row.length !== 7) continue;

		for (let i = 3; i < row.length; i++) {
			row[i] = row[i].replace(',', '.') * 1;
		}
		output.push(row);
	}
	return output;
}

export async function updateProducts(currentData, newData, dataType) {
	if (dataType === 'prices') {
		currentData.map(row => {
			row.pCub = 0;
		});
	}

	if (dataType === 'stocks') {
		currentData.map(row => {
			row.tCub = 0;
			row.aCub = 0;
		});
	}

	for (let newProduct of newData) {
		const productCode = newProduct[0];
		const productName = newProduct[1];
		const productIndex = currentData.findIndex(row => row.code === productCode);
		const isNewProduct = productIndex < 0 ? true : false;
		const currentProduct = isNewProduct ? {} : currentData[productIndex];
		const productSize = getProductSize(productName);
		const isError = productSize === null ? 'error' : '';
		const productGroup = getProductGroups(`${productCode} ${productName} ${isError}`);
		let errors = [];

		if (productSize === null) {
			errors.push('Błąd: Brak prawidłowego wymiaru w opisie. Obliczenia niemożliwe.');
		}

		Object.assign(currentProduct, {
			code: productCode,
			name: productName,
			size: productSize,
			group: productGroup,
			error: errors,
		});
		if (isNewProduct) {
			Object.assign(currentProduct, {
				pCub: 0,
				tCub: 0,
				aCub: 0,
			});
		}
		if (dataType === 'prices') {
			Object.assign(currentProduct, {
				pCub: calcPrice(productSize, newProduct[4], newProduct[2], 'm3'),
			});
		}
		if (dataType === 'stocks') {
			Object.assign(currentProduct, {
				tCub: calcQuant(productSize, newProduct[6], newProduct[2], 'm3'),
				aCub: calcQuant(productSize, newProduct[3], newProduct[2], 'm3'),
			});
		}

		const cursor = isNewProduct ? 0 : productIndex;
		const replace = isNewProduct ? 0 : 1;
		currentData.splice(cursor, replace, currentProduct);
	}

	let message = '';
	if (dataType === 'products') {
		message = '📜 Zaktualizowano produkty ✔';
	}
	if (dataType === 'prices') {
		message = '💵 Zaktualizowano ceny ✔';
	}
	if (dataType === 'stocks') {
		message = '📦 Zaktualizowano ilości ✔';
	}
	return { data: currentData, message: message };
}

export async function fetchProducts(fetchURL, pinCode) {
	const URLparams = {
		action: 'request',
		pin: pinCode,
	};

	const fetchSettings = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
		},
		body: new URLSearchParams(URLparams).toString(),
	};

	try {
		let response = await fetch(fetchURL, fetchSettings);
		return await response.json();
	} catch (error) {
		console.error(error);
		return { message: 'Problem z połączeniem ❌' };
	}
}

export function structurizeData(data, dataType) {
	data = formatToArray(data);
	data = removeGarbage(data, dataType);
	// data = integrateData(data, dataType);
	return { data: data };
}

function formatToArray(data) {
	const lines = data.match(/[^\r\n]+/g);
	let result = [];
	for (let line of lines) {
		const row = line.match(/[^\t]+/g);
		result.push(row);
	}
	return result;
}

function removeGarbage(data, dataType) {
	const garbageWords = /(kod|podsumowanie|dostawa|transport|usługa|zamówienie)/gi;
	let result = [];

	for (let row of data) {
		// Ommit garbage
		if (!row.length) continue;
		if (!!row.find(el => el.match(garbageWords))) continue;
		if (dataType === 'prices' && row.length !== 6) continue;
		if (dataType === 'stocks' && row.length !== 7) continue;
		if (dataType === 'products' && row.length !== 2) continue;
		result.push(row);
	}
	return result;
}

export function integrateData(data, dataType) {
	let result = [];
	for (const row of data) {
		let product = {};
		let errorsList = [];

		const productCode = row?.code || row[0];
		const productName = row?.name || row[1];
		const productSize = row?.size || getProductSize(productName);
		const productUnit = row[2] || 'm3';
		const productTCub = row?.tCub || row[6]?.replace(',', '.') * 1;
		const productACub = row?.aCub || row[3]?.replace(',', '.') * 1;
		const productPCub = row?.pCub || row[4]?.replace(',', '.') * 1;
		const productICub = row?.iCub || '';
		const productISqr = row?.iSqr || '';
		const productIpcs = row?.iPcs || '';
		if (productSize === null)
			errorsList.push('Błąd: Brak prawidłowego wymiaru w opisie. Obliczenia niemożliwe.');
		const isError = !!errorsList.length ? 'error' : '';
		const productGroup = getProductGroup(`${productCode} ${productName} ${isError}`);

		Object.assign(product, {
			code: productCode,
			name: productName,
			size: productSize,
			group: productGroup,
			iCub: productICub,
			iSqr: productISqr,
			iPcs: productIpcs,
			errors: errorsList,
		});
		// if (!!isError) {
		// 	Object.assign(product, {});
		// }
		if (dataType.match(/stocks|code/i)) {
			Object.assign(product, {
				tCub: calcQuant(productSize, productTCub, productUnit, 'm3'),
				aCub: calcQuant(productSize, productACub, productUnit, 'm3'),
			});
		}
		if (dataType.match(/prices|code/i)) {
			Object.assign(product, {
				pCub: calcPrice(productSize, productPCub, productUnit, 'm3'),
			});
		}
		result.push(product);
	}

	return result;
}

function getProductSize(line) {
	const fullSizeB = line.match(/\d+[,\.]?\d*x\d+x\d+/i);
	return fullSizeB ? fullSizeB[0].replace(',', '.') : null;
}

function getProductGroup(input) {
	let group = [];

	if (/error/i.test(input)) group.push('ERROR');
	if (/ppl/i.test(input)) group.push('PPL');
	if (/hpl/i.test(input)) group.push('HPL');
	if (/osb/i.test(input)) group.push('OSB');
	if (/topol/i.test(input)) group.push('China');
	if (/honey/i.test(input)) group.push('Honey');
	if (/PF|poli/i.test(input)) group.push('Poliform');
	if (/RP|radiata/i.test(input)) group.push('RP');
	if (/EUK|eukaliptus/i.test(input)) group.push('EUK');
	if (/wodo|wd|ext|\bE\b/i.test(input)) group.push('WD');
	if (/such|mr|int/i.test(input)) group.push('MR');
	if (/mel|\bM\/M\b/i.test(input)) group.push('MM');
	if (/heksa|F\/WH/i.test(input)) group.push('Heksa');
	if (/less|transpa/i.test(input)) group.push('C.less');
	if (/folio|\bF\/F\b/i.test(input)) group.push('FF');
	if (/anty|\bF\/W\b|\bW\/W\b/i.test(input)) group.push('FW');
	if (!group.length) group.push('??');

	group.sort();
	const result = group.reduce((a, c) => `${a} ${c}`, '');
	return result.trim();
}

export async function localDataMerge(newData, dataType) {
	let message = 'Coś poszło nie tak ❗';
	let answer = false;
	let localData = await idb.products.toArray();
	const isNewInventory = checkInventory(newData);
	if (isNewInventory) {
		answer = await openDialog(Dialog_MergeFetchedData);
		// if (answer === 'merge') data = await mergeInventory(data);
		if (answer === 'local') newData = await clearInventory(newData);
		if (answer === 'cloud') localData = await clearInventory(localData);
	}

	if (dataType.match(/stocks|code/i)) {
		clearStocks(localData);
	}
	if (dataType.match(/prices|code/i)) {
		clearPrices(localData);
	}

	for (const importedProduct of newData) {
		const localProductIndex = localData.findIndex(row => row.code === importedProduct.code);
		const isNewProduct = localProductIndex < 0 ? true : false;
		const localProduct = isNewProduct ? undefined : localData[localProductIndex];
		const currentProduct = isNewProduct ? importedProduct : localProduct;

		// Merge inventory data
		if (isNewProduct === false && answer === 'merge') {
			importedProduct.iCub = `${localProduct.iCub}+(${importedProduct.iCub})`;
			importedProduct.iSqr = `${localProduct.iSqr}+(${importedProduct.iSqr})`;
			importedProduct.iPcs = `${localProduct.iPcs}+(${importedProduct.iPcs})`;
		}

		// Update with imported data
		if (isNewProduct === false) {
			Object.assign(currentProduct, importedProduct);
		}

		const cursor = isNewProduct ? localData.length : localProductIndex;
		const replace = isNewProduct ? 0 : 1;
		localData.splice(cursor, replace, currentProduct);
	}

	try {
		await idb.products.clear();
		await idb.products.bulkAdd(localData);
		if (dataType === 'products') message = '📜 Zaktualizowano produkty ✔';
		if (dataType === 'stocks') message = '📦 Zaktualizowano ilości ✔';
		if (dataType === 'prices') message = '💵 Zaktualizowano ceny ✔';
		if (dataType === 'code') message = '📜 Pobrano dane z chmury ✔';
	} catch (err) {
		console.error(err);
	}

	return message;
}

function clearStocks(data) {
	for (const row of data) {
		row.tCub = 0;
		row.aCub = 0;
	}
}
function clearPrices(data) {
	for (const row of data) {
		row.pCub = 0;
	}
}
async function clearInventory(data) {
	return new Promise((resolve, reject) => {
		for (const row of data) {
			delete row.iCub;
			delete row.iSqr;
			delete row.iPcs;
		}
		resolve(data);
	});
}
function checkInventory(data) {
	if (!data) return;
	let result = false;
	for (const row of data) {
		if (!!row?.iCub || !!row?.iSqr || !!row?.iPcs) {
			result = true;
			break;
		}
	}
	return result;
}
