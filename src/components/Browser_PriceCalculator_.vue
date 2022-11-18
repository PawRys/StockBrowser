<script setup>
import { ref, computed, provide } from 'vue';
import Field from './Browser_PriceCalculator_Field.vue';

const props = defineProps(['plySize', 'buyPrice']);
const priceRoot = ref(props.buyPrice);
provide('priceRoot', priceRoot);
provide('buyPrice', props.buyPrice);

const priceColor = computed(() => {
	const diffrence = priceRoot.value - props.buyPrice;
	if (diffrence > 1) return 'green';
	if (diffrence < -1) return 'red';
	return '';
});
</script>

<template>
	<div style="grid-area: buyp" class="price buyp">
		{{ props.buyPrice.toFixed(2) }}<small>zł/m<sup>3</sup></small>
	</div>
	<Field
		style="grid-area: pCub"
		:class="['price', 'pCub', priceColor]"
		:size="props.plySize"
		:unit="'pCub'" />
	<Field
		style="grid-area: pSqr"
		:class="['price', 'pSqr', priceColor]"
		:size="props.plySize"
		:unit="'pSqr'" />
	<Field
		style="grid-area: pPcs"
		:class="['price', 'pPcs', priceColor]"
		:size="props.plySize"
		:unit="'pPcs'" />
	<Field
		style="grid-area: marg"
		:class="['price', 'marg', priceColor]"
		:size="props.plySize"
		:unit="'marg'" />
	<Field
		style="grid-area: perc"
		:class="['price', 'perc', priceColor]"
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
