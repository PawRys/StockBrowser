<script setup>
import { ref, computed, inject } from 'vue';
import { evalMath } from '../utils/functions.js';
import { db as idb } from '../utils/dexiedb.js';

const props = defineProps(['unit', 'code']);
const database = inject('unfilteredData_global');

const isEdited = ref(false);
const productIndex = database.value.findIndex(row => row.code === props.code);
const expression = ref(database.value[productIndex][props.unit] || '');

// console.log(database.value);

const zerofix = computed(() => {
	let result = 2;
	if (props.unit === 'iCub') result = 3;
	if (props.unit === 'iSqr') result = 2;
	if (props.unit === 'iPcs') result = 1;
	return result;
});

const sfix = computed(() => {
	let result = '';
	if (props.unit === 'iCub') result = 'm<sup>3</sup>';
	if (props.unit === 'iSqr') result = 'm<sup>2</sup>';
	if (props.unit === 'iPcs') result = 'szt';
	return result;
});

async function saveExpression(event) {
	const value = event.target.value;

	// save in IDB...
	await idb.products.update(props.code, { [props.unit]: value });
	// ...and in memory
	Object.assign(database.value[productIndex], {
		[props.unit]: value,
	});
}

function test() {
	alert();
}
</script>

<template>
	<div :class="{ expanded: isEdited }">
		<span
			v-if="!isEdited"
			class="inventory__result"
			contenteditable="true"
			@focus="[(isEdited = true)]">
			{{ evalMath(expression).toFixed(zerofix) }}
			<small v-html="sfix"></small>
		</span>
		<input
			v-else
			class="inventory__edit"
			:value="expression"
			@input="[(expression = $event.target.value), saveExpression($event)]"
			@blur="isEdited = false"
			@keydown.esc="$event.target.blur()"
			@vnode-mounted="({ el }) => el.focus()" />
	</div>
</template>

<style scoped>
.inventory__result {
	cursor: pointer;
	background-color: var(--bg-color);
	box-shadow: 0px 0px 0px 1px var(--accent-shade);
	padding: 0ch 0.5ch;
	display: flow-root;
	overflow: hidden;
	text-overflow: clip;
}
.inventory__edit {
	padding-inline-end: 1ch;
	width: 100%;
	text-align: right;
}
:is(#fakeid, .expanded) {
	grid-area: aCub / aCub / aPcs / aPcs;
	z-index: 1;
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
