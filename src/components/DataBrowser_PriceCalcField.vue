<script setup>
import { ref, computed, watch, inject, defineProps } from 'vue'
import { calcPrice } from './DataInsert_Scripts.js'

const edit = ref(false)
const props = defineProps({
	size: String,
	unit: String,
})
const buyPrice = inject('buyPrice_ref')
const recalcs = inject('recalcs')

const roundup = computed(() => (edit.value ? 0 : 2))

// console.log(price_base)
// recalc(buyPrice)
function recalc(e) {
	const val = e.target.value * 1
	let basePrice = 0

	if (props.unit !== 'marg' && props.unit !== 'perc')
		basePrice = calcPrice(props.size, val, props.unit, 'm3')
	if (props.unit === 'marg') basePrice = buyPrice.value + val
	if (props.unit === 'perc') basePrice = buyPrice.value + buyPrice.value * (val / 100)

	recalcs.m3 = calcPrice(props.size, basePrice, 'm3', 'm3').toFixed(2)
	recalcs.m2 = calcPrice(props.size, basePrice, 'm3', 'm2').toFixed(2)
	recalcs.szt = calcPrice(props.size, basePrice, 'm3', 'szt').toFixed(2)
	recalcs.marg = (basePrice - buyPrice.value).toFixed(2)
	recalcs.perc = ((basePrice / buyPrice.value) * 100 - 100).toFixed(1)
}
</script>

<template>
	<div class="price-calculator text-align_right" @focusin="edit = true">
		<!-- <span v-if="!edit" class="result"> -->
		<!-- <span v-if="unit == 'marg'">+</span> -->
		<!-- {{ calculated.toFixed(2) }} -->
		<!-- <small v-if="unit == 'perc'">%</small> -->
		<!-- <small v-else-if="unit == 'marg'">zł/m3</small> -->
		<!-- <small v-else>zł/{{ unit }}</small> -->
		<!-- </span> -->

		<input
			class="text-align_right"
			type="number"
			:value="recalcs[props.unit]"
			@keyup="recalc"
			@blur="edit = false" />
	</div>
</template>

<style scoped>
.result {
	cursor: pointer;
	border-bottom: dashed 1px var(--font-color);
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
