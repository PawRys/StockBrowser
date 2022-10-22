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

const roundup = computed(() => {
	return edit.value ? Math.round(recalcs[props.unit] * 100) / 100 : recalcs[props.unit].toFixed(2)
})
const prefix = computed(() => {
	return props.unit === 'marg' ? '+' : ''
})
const suffix = computed(() => {
	let text = `zł/${props.unit}`
	if (props.unit === 'perc') text = '%'
	if (props.unit === 'marg') text = 'zł/m3'
	return text
})

function recalc(e) {
	const val = e.target.value * 1
	let basePrice = 0

	if (props.unit !== 'marg' && props.unit !== 'perc')
		basePrice = calcPrice(props.size, val, props.unit, 'm3')
	if (props.unit === 'marg') basePrice = buyPrice.value + val
	if (props.unit === 'perc') basePrice = buyPrice.value + buyPrice.value * (val / 100)

	recalcs.m3 = calcPrice(props.size, basePrice, 'm3', 'm3')
	recalcs.m2 = calcPrice(props.size, basePrice, 'm3', 'm2')
	recalcs.szt = calcPrice(props.size, basePrice, 'm3', 'szt')
	recalcs.marg = basePrice - buyPrice.value
	recalcs.perc = (basePrice / buyPrice.value) * 100 - 100 || 0
}

function test(e) {
	// console.dir(e.path[1])
}
// watch(edit, () => {
// 	console.log(edit.value)
// })
</script>

<template>
	<div class="price-calculator text-align_right" @click="edit = true" @keydown.tab="test">
		<span v-if="!edit" class="result">
			<span>{{ prefix }}</span
			>{{ roundup }}<small>{{ suffix }}</small>
		</span>

		<input
			v-else
			class="text-align_right"
			type="number"
			:value="roundup"
			@keyup="recalc"
			@keyup.enter="$event.target.select()"
			@vnode-mounted="({ el }) => el.focus()"
			@click="$event.target.select()"
			@focus="$event.target.select()"
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
