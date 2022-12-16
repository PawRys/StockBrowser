<script setup>
import { ref, computed, inject } from 'vue';
import { calcPrice } from '../utils/functions.js';

const props = defineProps(['size', 'unit']);
const priceRoot = inject('priceRoot');
const buyPrice = inject('buyPrice');
const isEdited = ref(false);
const shadowValue = ref();
const vat = inject('vat');

function calcPriceRoot(event) {
	const inputVal = event.target.value.trim() * 1;
	if (props.unit === 'pCub') {
		priceRoot.value = calcPrice(props.size, inputVal, 'm3', 'm3') / vat.m3;
	}
	if (props.unit === 'pSqr') {
		priceRoot.value = calcPrice(props.size, inputVal, 'm2', 'm3') / vat.m2;
	}
	if (props.unit === 'pPcs') {
		priceRoot.value = calcPrice(props.size, inputVal, 'szt', 'm3') / vat.szt;
	}
	if (props.unit === 'marg') {
		priceRoot.value = buyPrice + inputVal;
	}
	if (props.unit === 'perc') {
		priceRoot.value = buyPrice + (buyPrice / 100) * inputVal;
	}
	shadowValue.value = event.target.value.trim();
}

const calcValues = computed(() => {
	const root = priceRoot.value;
	let result = 0;

	if (props.unit === 'pCub') {
		result = calcPrice(props.size, root, 'm3', 'm3') * vat.m3;
	}
	if (props.unit === 'pSqr') {
		result = calcPrice(props.size, root, 'm3', 'm2') * vat.m2;
	}
	if (props.unit === 'pPcs') {
		result = calcPrice(props.size, root, 'm3', 'szt') * vat.szt;
	}
	if (props.unit === 'marg') {
		result = root - buyPrice;
	}
	if (props.unit === 'perc') {
		result = ((root - buyPrice) / buyPrice) * 100;
	}
	if (isNaN(result) || !isFinite(result)) {
		result = 0;
	}
	return props.unit === 'perc' ? result.toFixed(1) : result.toFixed(2);
});

const pfix = computed(() => {
	const diffrence = priceRoot.value - buyPrice;
	if (props.unit === 'marg' && diffrence >= 0) return '+';
	return '';
});

const sfix = computed(() => {
	let result = '';
	if (props.unit === 'pCub') result = 'zł/m<sup>3</sup>';
	if (props.unit === 'pSqr') result = 'zł/m<sup>2</sup>';
	if (props.unit === 'pPcs') result = 'zł/szt';
	if (props.unit === 'marg') result = 'zł/m<sup>3</sup>';
	if (props.unit === 'perc') result = '%';
	return result;
});

const vatClass = computed(() => {
	let text = '';
	if (props.unit === 'pCub' && vat.m3 > 1) text = 'vatApplied';
	if (props.unit === 'pSqr' && vat.m2 > 1) text = 'vatApplied';
	if (props.unit === 'pPcs' && vat.szt > 1) text = 'vatApplied';
	return text;
});

// function focusHandler() {
// 	isEdited.value = true;
// 	shadowValue.value = calcValues.value;
// }

// function logger(x) {
// 	console.log(x);
// 	console.log(`esc`);
// }
</script>

<template>
	<div :class="vatClass">
		<span
			v-if="!isEdited"
			class="price__result"
			contenteditable="true"
			@focus="[(isEdited = true), (shadowValue = calcValues)]">
			{{ pfix }}{{ calcValues }}<small v-html="sfix"></small>
		</span>
		<input
			v-else
			class="price__edit"
			type="number"
			:value="shadowValue"
			@input="calcPriceRoot"
			@blur="isEdited = false"
			@focus="$event.target.select()"
			@keydown.enter="$event.target.select()"
			@keydown.esc="$event.target.blur()"
			@vnode-mounted="({ el }) => el.focus()" />
	</div>
</template>

<style scoped>
.price__result {
	cursor: pointer;
	background-color: var(--bg-color);
	box-shadow: 0px 0px 0px 1px var(--bg-shade);
	padding: 0ch 0.5ch;
	display: flow-root;
	overflow: hidden;
	text-overflow: clip;
}
.price__edit {
	text-align: right;
	width: 14ch;
}
.vatApplied {
	font-weight: 700;
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
