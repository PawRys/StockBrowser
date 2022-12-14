<script setup>
import { calcQuant } from '../functions.js';

const props = defineProps(['total', 'aviable', 'size']);
const tCub = props.total;
const tSqr = calcQuant(props.size, props.total, 'm3', 'm2');
const tPcs = calcQuant(props.size, props.total, 'm3', 'szt');
const aCub = props.aviable;
const aSqr = calcQuant(props.size, props.aviable, 'm3', 'm2');
const aPcs = calcQuant(props.size, props.aviable, 'm3', 'szt');
</script>

<template>
	<div class="product__tCub">
		{{ tCub.toFixed(3) }}<small>m<sup>3</sup></small>
	</div>
	<div class="product__tSqr">
		{{ tSqr.toFixed(2) }}<small>m<sup>2</sup></small>
	</div>
	<div class="product__tPcs">{{ tPcs.toFixed(1) }}<small>szt</small></div>

	<div class="product__aCub">
		{{ aCub.toFixed(3) }}<small>m<sup>3</sup></small>
	</div>
	<div class="product__aSqr">
		{{ aSqr.toFixed(2) }}<small>m<sup>2</sup></small>
	</div>
	<div class="product__aPcs">{{ aPcs.toFixed(1) }}<small>szt</small></div>
</template>

<style scoped>
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
