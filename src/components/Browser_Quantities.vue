<script setup>
const props = defineProps(['quants']);
const [tCub, tSqr, tPcs, aCub, aSqr, aPcs] = props.quants;
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
