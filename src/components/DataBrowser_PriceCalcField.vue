<script setup>
import { ref, computed, watch, inject, defineProps } from 'vue'
const props = defineProps({
	unit: String,
})
const edited = ref(false)
const price_base = inject('price_base')
const calculated = computed(() => {
	if (props.unit === 'm3') return price_base
	if (props.unit === 'm2') return price_base / 2
	if (props.unit === 'szt') return price_base / 3
})
</script>

<template>
	<div class="price-calculator text-align_right" @click="edited = true">
		<span v-if="!edited" class="result">
			<span v-if="unit == 'marg'">+</span>
			{{ calculated.toFixed(2) }}
			<small v-if="unit == 'perc'">%</small>
			<small v-else-if="unit == 'marg'">zł/m3</small>
			<small v-else>zł/{{ unit }}</small>
		</span>
		<input
			v-else
			class="text-align_right"
			type="number"
			v-model="price_base"
			@blur="edited = false"
			@vnode-mounted="({ el }) => el.focus()" />
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
