import { ref } from 'vue';
import { db as idb } from '../assets/dexiedb.js';

export function timeout(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function validate(input) {
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
	const isCorrectPriceColumns =
		/Kod towaru		nazwa towaru		jm		stan	cena	wartość		/i.test(input);
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

export function prepareData(input, dataType) {
	const linesArray = input.match(/[^\r\n]+/g);
	const garbageWords =
		/\b(kod|podsumowanie|dostawa|transport|usługa|zamówienie)/i;
	let output = [];

	for (let line of linesArray) {
		const lineChunks = line.match(/[^\t]+/g);
		// Ommit garbage
		if (garbageWords.test(lineChunks[0])) continue;
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

export async function updateProducts(currentData, updates, dataType) {
	for (let newProduct of updates) {
		const productId = newProduct[0];
		const productName = newProduct[1];
		const productIndex = currentData.findIndex(row => row.code === productId);
		const currentProduct = productIndex < 0 ? {} : currentData[productIndex];
		const size = getProductSize(`${productId} ${productName}`).replace(
			',',
			'.'
		);

		Object.assign(currentProduct, {
			code: productId,
			name: productName,
			size: size,
		});

		if (productIndex < 0) {
			Object.assign(currentProduct, {
				pCub: 0,
				tCub: 0,
				tSqr: 0,
				tPcs: 0,
				aCub: 0,
				aSqr: 0,
				aPcs: 0,
			});
		}

		if (dataType === 'prices') {
			Object.assign(currentProduct, {
				pCub: calcPrice(size, newProduct[4], newProduct[2], 'm3'),
			});
		}

		if (dataType === 'stocks') {
			Object.assign(currentProduct, {
				tCub: calcQuant(size, newProduct[6], newProduct[2], 'm3'),
				tSqr: calcQuant(size, newProduct[6], newProduct[2], 'm2'),
				tPcs: calcQuant(size, newProduct[6], newProduct[2], 'szt'),
				aCub: calcQuant(size, newProduct[3], newProduct[2], 'm3'),
				aSqr: calcQuant(size, newProduct[3], newProduct[2], 'm2'),
				aPcs: calcQuant(size, newProduct[3], newProduct[2], 'szt'),
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

	console.log(currentData);
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
		return { message: 'Problem z połączeniem ⛔' };
	}
}

export function calcQuant(size, value, from, to) {
	if (!size) return 0;
	if (!value) return 0;
	if (!from) return 0;
	if (!to) return 0;
	size = size.split('x');
	if (from === 'm3') {
		if (to === 'm2') value = value / (size[0] / 1000);
		if (to === 'szt')
			value = value / (size[0] / 1000) / (size[1] / 1000) / (size[2] / 1000);
	}
	if (from === 'm2') {
		if (to === 'm3') value = value * (size[0] / 1000);
		if (to === 'szt') value = value / (size[1] / 1000) / (size[2] / 1000);
	}
	if (from === 'szt') {
		if (to === 'm3')
			value = value * (size[0] / 1000) * (size[1] / 1000) * (size[2] / 1000);
		if (to === 'm2') value = value * (size[1] / 1000) * (size[2] / 1000);
	}
	// if (to === 'm3') return value.toFixed(3)
	// if (to === 'm2') return value.toFixed(2)
	// if (to === 'szt') return value.toFixed(1)
	return value * 1;
}

export function calcPrice(size, value, from, to) {
	if (size == 0) return 0;
	if (!size) return 0;
	if (!value) return 0;
	if (!from) return 0;
	if (!to) return 0;

	try {
		size = size.split('x');
	} catch {
		console.log(`Variable: ${typeof value}: ${value}`);
	}

	if (from === 'm3') {
		if (to === 'm2') value = value * (size[0] / 1000);
		if (to === 'szt')
			value = value * (size[0] / 1000) * (size[1] / 1000) * (size[2] / 1000);
	}

	if (from === 'm2') {
		if (to === 'm3') value = value / (size[0] / 1000);
		if (to === 'szt') value = value * (size[1] / 1000) * (size[2] / 1000);
	}

	if (from === 'szt') {
		if (to === 'm3')
			value = value / (size[0] / 1000) / (size[1] / 1000) / (size[2] / 1000);
		if (to === 'm2') value = value / (size[1] / 1000) / (size[2] / 1000);
	}

	// value = value * GLOBAL.vat[to]
	return value * 1;
}

function getProductSize(line) {
	const fullSizeB = line.match(/\d+[,\.]?\d*x\d+x\d+/i);
	return fullSizeB ? fullSizeB[0] : '0';
}
