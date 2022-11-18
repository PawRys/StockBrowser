<script setup>
import { calcQuant } from './DataCollector_Scripts.js';

const props = defineProps(['total', 'aviable', 'size']);
const tCub = props.total;
const tSqr = calcQuant(props.size, props.total, 'm3', 'm2');
const tPcs = calcQuant(props.size, props.total, 'm3', 'szt');
const aCub = props.aviable;
const aSqr = calcQuant(props.size, props.aviable, 'm3', 'm2');
const aPcs = calcQuant(props.size, props.aviable, 'm3', 'szt');
</script>

<template>
	<div style="grid-area: tCub" class="quantity-total tCub">
		{{ tCub.toFixed(3) }}<small>m<sup>3</sup></small>
	</div>
	<div style="grid-area: tSqr" class="quantity-total tSqr">
		{{ tSqr.toFixed(2) }}<small>m<sup>2</sup></small>
	</div>
	<div style="grid-area: tPcs" class="quantity-total tPcs">
		{{ tPcs.toFixed(1) }}<small>szt</small>
	</div>

	<div style="grid-area: aCub" class="quantity-aviable aCub">
		{{ aCub.toFixed(3) }}<small>m<sup>3</sup></small>
	</div>
	<div style="grid-area: aSqr" class="quantity-aviable aSqr">
		{{ aSqr.toFixed(2) }}<small>m<sup>2</sup></small>
	</div>
	<div style="grid-area: aPcs" class="quantity-aviable aPcs">
		{{ aPcs.toFixed(1) }}<small>szt</small>
	</div>
</template>
