import { ref } from 'vue'
export const message_ref = ref('')
export const dataType_ref = ref(null)

export function validate(input) {
	// const input = textareaVal_ref.value

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
