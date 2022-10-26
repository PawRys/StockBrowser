<script setup>
import { ref, computed, inject } from 'vue'
import { calcPrice } from './DataInsert_Scripts.js'

const props = defineProps(['size', 'unit'])
const priceRoot = inject('priceRoot')
const buyPrice = inject('buyPrice')
const isEdited = ref(false)
const shadowValue = ref()
const vat = inject('vat')

function calcPriceRoot(event) {
	const inputVal = event.target.value.trim() * 1
	if (props.unit === 'pCub') priceRoot.value = calcPrice(props.size, inputVal, 'm3', 'm3') / vat.m3
	if (props.unit === 'pSqr') priceRoot.value = calcPrice(props.size, inputVal, 'm2', 'm3') / vat.m2
	if (props.unit === 'pPcs')
		priceRoot.value = calcPrice(props.size, inputVal, 'szt', 'm3') / vat.szt
	if (props.unit === 'marg') priceRoot.value = buyPrice + inputVal
	if (props.unit === 'perc') priceRoot.value = buyPrice + (buyPrice / 100) * inputVal
	shadowValue.value = event.target.value.trim()
}

const calcValues = computed(() => {
	const root = priceRoot.value
	let result = 0
	if (props.unit === 'pCub') result = calcPrice(props.size, root, 'm3', 'm3') * vat.m3
	if (props.unit === 'pSqr') result = calcPrice(props.size, root, 'm3', 'm2') * vat.m2
	if (props.unit === 'pPcs') result = calcPrice(props.size, root, 'm3', 'szt') * vat.szt
	if (props.unit === 'marg') result = -buyPrice + root
	if (props.unit === 'perc') result = ((root - buyPrice) / buyPrice) * 100
	if (props.unit === 'perc') return result.toFixed(1)
	return result.toFixed(2)
})

function focusHandler() {
	isEdited.value = true
	shadowValue.value = calcValues.value
}

const pfix = computed(() => {
	if (props.unit === 'marg') return '+'
	return ''
})

const sfix = computed(() => {
	let result = ''
	if (props.unit === 'pCub') result = 'zł/m3'
	if (props.unit === 'pSqr') result = 'zł/m2'
	if (props.unit === 'pPcs') result = 'zł/szt'
	if (props.unit === 'marg') result = 'zł/m3'
	if (props.unit === 'perc') result = '%'
	return result
})

const vatClass = computed(() => {
	let text = ''
	if (props.unit === 'pCub' && vat.m3 > 1) text = 'vatApplied'
	if (props.unit === 'pSqr' && vat.m2 > 1) text = 'vatApplied'
	if (props.unit === 'pPcs' && vat.szt > 1) text = 'vatApplied'
	return text
})
</script>

<template>
	<div class="text-align_right">
		<span
			v-if="!isEdited"
			class="result"
			:class="vatClass"
			contenteditable="true"
			@focus="focusHandler"
			>{{ pfix }}{{ calcValues }}<small>{{ sfix }}</small></span
		>
		<input
			v-else
			class="text-align_right"
			type="number"
			:value="shadowValue"
			@input="calcPriceRoot"
			@blur="isEdited = false"
			@focus="$event.target.select()"
			@keypress.enter="$event.target.select()"
			@vnode-mounted="({ el }) => el.focus()" />
	</div>
</template>

<style scoped>
.result {
	cursor: pointer;
	border-bottom: dashed 1px var(--font-color);
}

.vatApplied {
	font-weight: 600;
}
input {
	width: 10ch;
}
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
	-webkit-appearance: none;
	appearance: none;
	margin: 0;
}

/* Firefox */
input[type='number'] {
	-moz-appearance: textfield;
	appearance: textfield;
}
</style>
