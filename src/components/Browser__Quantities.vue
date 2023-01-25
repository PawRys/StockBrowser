<script setup>
import { calcQuant } from '../utils/functions.js';

const props = defineProps(['total', 'available', 'size']);
const tCub = calcQuant(props.size, props.total, 'm3', 'm3');
const tSqr = calcQuant(props.size, props.total, 'm3', 'm2');
const tPcs = calcQuant(props.size, props.total, 'm3', 'szt');
const aCub = calcQuant(props.size, props.available, 'm3', 'm3');
const aSqr = calcQuant(props.size, props.available, 'm3', 'm2');
const aPcs = calcQuant(props.size, props.available, 'm3', 'szt');
</script>

<template>
	<div class="product__tCub">
		<i class="bi bi-cart4 product__icon"></i>
		<span>{{ tCub.toFixed(3) }}</span>
		<small>m<sup>3</sup></small>
	</div>
	<div class="product__tSqr">
		<!-- <i class="bi bi-cart4 product__icon"></i> -->
		<span>{{ tSqr.toFixed(2) }}</span>
		<small>m<sup>2</sup></small>
	</div>
	<div class="product__tPcs">
		<!-- <i class="bi bi-cart4 product__icon"></i> -->
		<span>{{ tPcs.toFixed(1) }}</span>
		<small>szt</small>
	</div>

	<div class="product__aCub">
		<i class="bi bi-cart2 product__icon"></i>
		<span>{{ aCub.toFixed(3) }}</span>
		<small>m<sup>3</sup></small>
	</div>
	<div class="product__aSqr">
		<!-- <i class="bi bi-cart2 product__icon"></i> -->
		<span>{{ aSqr.toFixed(2) }}</span>
		<small>m<sup>2</sup></small>
	</div>
	<div class="product__aPcs">
		<!-- <i class="bi bi-cart2 product__icon"></i> -->
		<span>{{ aPcs.toFixed(1) }}</span>
		<small>szt</small>
	</div>
</template>

<style scoped>
[class*='product__'] {
	display: flex;
	align-items: baseline;
	justify-content: flex-end;
	gap: 0.5ex;
}
.product__icon {
	margin-right: auto;
}
.product__tCub {
	grid-area: tCub;
}
.product__tSqr {
	grid-area: tSqr;
}
.product__tPcs {
	grid-area: tPcs;
}
.product__aCub {
	grid-area: aCub;
}
.product__aSqr {
	grid-area: aSqr;
}
.product__aPcs {
	grid-area: aPcs;
}
[class*='product__'] {
	text-align: right;
}
[class*='product__t'] {
	font-weight: 600;
}
</style>
