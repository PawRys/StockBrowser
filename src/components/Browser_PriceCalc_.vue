<script setup>
import { ref, reactive, computed, watch, inject, provide } from 'vue'
import Field from './Browser_PriceCalc_Field.vue'

const props = defineProps(['plySize', 'buyPrice'])
const priceRoot = ref(props.buyPrice)
provide('priceRoot', priceRoot)
provide('buyPrice', props.buyPrice)

const priceColor = computed(() => {
	const diffrence = priceRoot.value - props.buyPrice
	if (diffrence > 1) return 'green'
	if (diffrence < -1) return 'red'
	return ''
})
</script>

<template>
	<Field
		style="grid-area: pCub"
		class="price pCub"
		:class="priceColor"
		:size="props.plySize"
		:unit="'pCub'" />
	<Field
		style="grid-area: pSqr"
		class="price pSqr"
		:class="priceColor"
		:size="props.plySize"
		:unit="'pSqr'" />
	<Field
		style="grid-area: pPcs"
		class="price pPcs"
		:class="priceColor"
		:size="props.plySize"
		:unit="'pPcs'" />
	<Field
		style="grid-area: marg"
		class="price marg"
		:class="priceColor"
		:size="props.plySize"
		:unit="'marg'" />
	<Field
		style="grid-area: perc"
		class="price perc"
		:class="priceColor"
		:size="props.plySize"
		:unit="'perc'" />
</template>

<style scoped>
.green {
	color: limegreen;
}
.red {
	color: crimson;
}

/* .blue {
	color: darkslateblue;
} */
</style>
