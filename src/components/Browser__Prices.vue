<script setup>
import { ref, computed, provide } from 'vue';
import Field from './Browser__Price_Field.vue';

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
	<div class="product__buyp">
		{{ props.buyPrice.toFixed(2) }}<small>zł/m<sup>3</sup></small>
	</div>
	<Field
		class="product__pCub"
		:class="priceColor"
		:size="props.plySize"
		:unit="'pCub'" />
	<Field
		class="product__pSqr"
		:class="priceColor"
		:size="props.plySize"
		:unit="'pSqr'" />
	<Field
		class="product__pPcs"
		:class="priceColor"
		:size="props.plySize"
		:unit="'pPcs'" />
	<Field
		class="product__marg"
		:class="priceColor"
		:size="props.plySize"
		:unit="'marg'" />
	<Field
		class="product__perc"
		:class="priceColor"
		:size="props.plySize"
		:unit="'perc'" />
</template>

<style scoped>
.product__buyp {
	grid-area: buyp;
}
.product__pCub {
	grid-area: pCub;
}
.product__pSqr {
	grid-area: pSqr;
}
.product__pPcs {
	grid-area: pPcs;
}
.product__marg {
	grid-area: marg;
}
.product__perc {
	grid-area: perc;
}

[class*='product__'] {
	text-align: right;
}

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
