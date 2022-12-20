import { ref } from 'vue';
import { db as idb } from '../utils/dexiedb.js';
import { calcQuant, calcPrice } from '../utils/functions.js';

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
		dataType = 'products';
		message = `📜 Rozpoznano listę produktów.`;
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
		const lineChunks = line.match(/[^\t]+/g);
		// Ommit garbage
		if (!lineChunks) continue;
		if (garbageWords.test(line)) continue;
		if (dataType === 'products' && lineChunks.length !== 2) continue;
		if (dataType === 'prices' && lineChunks.length !== 6) continue;
		if (dataType === 'stocks' && lineChunks.length !== 7) continue;

		for (let i = 3; i < lineChunks.length; i++) {
			lineChunks[i] = lineChunks[i].replace(',', '.') * 1;
		}
		output.push(lineChunks);
	}
	return output;
}

export async function updateProducts(currentData, updatedData, dataType) {
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

	for (let newProduct of updatedData) {
		const productCode = newProduct[0];
		const productName = newProduct[1];
		const productIndex = currentData.findIndex(row => row.code === productCode);
		const currentProduct = productIndex < 0 ? {} : currentData[productIndex];
		const productSize = getProductSize(productName);
		const isError = productSize === null ? 'error' : '';
		const productFlags = getProductFlags(`${productCode} ${productName} ${isError}`);
		let errors = [];

		if (productSize === null) {
			errors.push('Błąd: Brak prawidłowego wymiaru w opisie. Obliczenia niemożliwe.');
		}

		Object.assign(currentProduct, {
			code: productCode,
			name: productName,
			size: productSize,
			tags: productFlags,
			error: errors,
		});
		if (productIndex < 0) {
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

		const cursor = productIndex < 0 ? currentData.length : productIndex;
		const replace = productIndex < 0 ? 0 : 1;
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

function getProductSize(line) {
	const fullSizeB = line.match(/\d+[,\.]?\d*x\d+x\d+/i);
	return fullSizeB ? fullSizeB[0].replace(',', '.') : null;
}

function getProductFlags(input) {
	let tags = [];

	if (/error/i.test(input)) tags.push('ERROR');
	if (/ppl/i.test(input)) tags.push('PPL');
	if (/hpl/i.test(input)) tags.push('HPL');
	if (/osb/i.test(input)) tags.push('OSB');
	if (/topol/i.test(input)) tags.push('China');
	if (/honey/i.test(input)) tags.push('Honey');
	if (/PF|poli/i.test(input)) tags.push('Poliform');
	if (/RP|radiata/i.test(input)) tags.push('RP');
	if (/EUK|eukaliptus/i.test(input)) tags.push('EUK');
	if (/wodo|wd|ext|\bE\b/i.test(input)) tags.push('WD');
	if (/such|mr|int/i.test(input)) tags.push('MR');
	if (/mel|\bM\/M\b/i.test(input)) tags.push('MM');
	if (/heksa|F\/WH/i.test(input)) tags.push('Heksa');
	if (/less|transpa/i.test(input)) tags.push('C.less');
	if (/folio|\bF\/F\b/i.test(input)) tags.push('FF');
	if (/anty|\bF\/W\b|\bW\/W\b/i.test(input)) tags.push('FW');
	if (!tags.length) tags.push('??');

	tags.sort();
	const result = tags.reduce((a, c) => `${a} ${c}`, '');
	return result.trim();
}
