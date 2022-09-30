import { ref } from 'vue'

export const message_ref = ref('')
export const dataType_ref = ref(null)
export const textareaValue_ref = ref()

export function timeout(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export function validate(input) {
	if (!input) {
		dataType_ref.value = null
		message_ref.value = ``
	} else {
		dataType_ref.value = false
		message_ref.value = `Nie rozpoznano danych. ❌`
	}
	const isStocks = /Stany i rezerwacje towarów/i.test(input)
	const isCorrectStockColumns =
		/Kod towaru		nazwa towaru		jm		stan handlowy	rezerwacje R	rezerwacje A		stan  całkowity	/i.test(input)
	if (isStocks && isCorrectStockColumns) {
		dataType_ref.value = 'stocks'
		message_ref.value = `📦 Rozpoznano stany i rezerwacje towarów.`
	}
	const isPrices = /Stany magazynowe towarów/i.test(input)
	const isCorrectPriceColumns = /Kod towaru		nazwa towaru		jm		stan	cena	wartość		/i.test(input)
	if (isPrices && isCorrectPriceColumns) {
		dataType_ref.value = 'prices'
		message_ref.value = `💵 Rozpoznano ceny zakupowe towarów.`
	}
	const isProdutsList = /Kod	Nazwa/i.test(input)
	const isProdutsItem = /\d+s\d+\/\d+/i.test(input)
	if (isProdutsList && isProdutsItem) {
		dataType_ref.value = 'products'
		message_ref.value = `📜 Rozpoznano listę produktów.`
	}
	const isFullExchangeCode = /^\d{4}$/i.test(input)
	if (isFullExchangeCode) {
		dataType_ref.value = 'code'
		message_ref.value = `🔢 Rozpoznano kod wymiany danych.`
	}
	const isPartExchangeCode = /^\d{1,3}$/i.test(input)
	if (isPartExchangeCode) {
		dataType_ref.value = null
		message_ref.value = ``
	}
}

export function prepareData(input) {
	let output = []
	const linesArray = input.match(/[^\r\n]+/g)
	for (let line of linesArray) {
		const splits = line.match(/[^\t]+/g)
		// Ommit garbage
		if (/\b(kod|podsumowanie|dostawa|transport|usługa|zamówienie)/i.test(splits[0])) continue
		if (dataType_ref.value === 'products' && splits.length !== 2) continue
		if (dataType_ref.value === 'prices' && splits.length !== 6) continue
		if (dataType_ref.value === 'stocks' && splits.length !== 7) continue

		for (let i = 3; i < splits.length; i++) {
			splits[i] = splits[i].replace(',', '.') * 1
		}
		output.push(splits)
	}
	return output
}
