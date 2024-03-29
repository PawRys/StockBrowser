<script setup>
import { ref, computed, inject, watchEffect } from 'vue';
import { calcQuant, evalMath, stringToCode } from '../utils/functions.js';
import Field from './Browser__Inventory_Field.vue';

const props = defineProps(['total', 'size', 'code']);
const tCub = -1 * props.total;
const tSqr = -1 * calcQuant(props.size, props.total, 'm3', 'm2');
const tPcs = -1 * calcQuant(props.size, props.total, 'm3', 'szt');
const database = inject('unfilteredData_global');
const productIndex = database.value.findIndex(row => row.code === props.code);

const summary = computed(() => {
	let iCub = database.value[productIndex]['iCub'] || '';
	let iSqr = database.value[productIndex]['iSqr'] || '';
	let iPcs = database.value[productIndex]['iPcs'] || '';
	let result = 0;
	iCub = evalMath(iCub);
	iSqr = evalMath(iSqr);
	iPcs = evalMath(iPcs);
	iCub = calcQuant(props.size, iCub, 'm3', 'm3');
	iSqr = calcQuant(props.size, iSqr, 'm2', 'm3');
	iPcs = calcQuant(props.size, iPcs, 'szt', 'm3');
	result = iCub + iSqr + iPcs;
	// console.log(`Summary: ${result}`);
	return result;
});

const iCubDiff = computed(() => {
	let result = summary.value - props.total;
	return result;
});
const iSqrDiff = computed(() => {
	const sqrQuantity = calcQuant(props.size, props.total, 'm3', 'm2');
	const sqrSummary = calcQuant(props.size, summary.value, 'm3', 'm2');
	let result = sqrSummary - sqrQuantity;
	return result;
});
const iPcsDiff = computed(() => {
	const pcsQuantity = calcQuant(props.size, props.total, 'm3', 'szt');
	const pcsSummary = calcQuant(props.size, summary.value, 'm3', 'szt');
	let result = pcsSummary - pcsQuantity;
	return result;
});

const iCub = computed(() => {
	return calcQuant(props.size, summary.value, 'm3', 'm3');
});
const iSqr = computed(() => {
	return calcQuant(props.size, summary.value, 'm3', 'm2');
});
const iPcs = computed(() => {
	return calcQuant(props.size, summary.value, 'm3', 'szt');
});

const pfix = computed(() => {
	let result = '';
	if (iCubDiff.value > 0) result = '+';
	return result;
});

const colorClass = computed(() => {
	let color = '';
	if (iPcsDiff.value >= 1) color = 'green';
	if (iPcsDiff.value <= -1) color = 'red';
	if (1 > iPcsDiff.value && iPcsDiff.value > -1) color = 'blue';
	if (summary.value === 0) color = 'grey';
	return color;
});
</script>

<template>
	<div class="product__tCub">
		{{ tCub.toFixed(3) }}<small>m<sup>3</sup></small>
	</div>
	<div class="product__tSqr">
		{{ tSqr.toFixed(2) }}<small>m<sup>2</sup></small>
	</div>
	<div class="product__tPcs">{{ tPcs.toFixed(1) }}<small>szt</small></div>

	<Field class="product__iCub" :code="props.code" :unit="'iCub'">{{ iCub.toFixed(3) }}</Field>
	<Field class="product__iSqr" :code="props.code" :unit="'iSqr'">{{ iSqr.toFixed(2) }}</Field>
	<Field class="product__iPcs" :code="props.code" :unit="'iPcs'">{{ iPcs.toFixed(1) }}</Field>

	<div class="product__sCub" :class="colorClass">
		{{ pfix }}{{ iCubDiff.toFixed(3) }}<small>m<sup>3</sup></small>
	</div>
	<div class="product__sSqr" :class="colorClass">
		{{ pfix }}{{ iSqrDiff.toFixed(2) }}<small>m<sup>2</sup></small>
	</div>
	<div class="product__sPcs" :class="colorClass">
		{{ pfix }}{{ iPcsDiff.toFixed(1) }}<small>szt</small>
	</div>

	<!-- <div class="expression-teleport"></div> -->
</template>

<style scoped>
.green {
	color: limegreen;
}
.red {
	color: crimson;
}
.blue {
	color: dodgerblue;
}
.grey {
	color: grey;
}

.product__iCub {
	grid-area: aCub;
}
.product__iSqr {
	grid-area: aSqr;
}
.product__iPcs {
	grid-area: aPcs;
}
.product__sCub {
	grid-area: pCub;
}
.product__sSqr {
	grid-area: pSqr;
}
.product__sPcs {
	grid-area: pPcs;
}
.expression-teleport {
	grid-area: pCub / pCub / pPcs / pPcs;
	z-index: 1;
}

[class*='product__'] {
	text-align: right;
}
[class*='product__s'] {
	font-weight: 600;
}
</style>
