<script setup>
import { ref, computed, inject } from 'vue';
import { evalMath, stringToCode, animateScrollTo } from '../utils/functions.js';
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
</script>

<template>
	<div :class="{ isExpanded: isEdited }" :id="`div${stringToCode(props.code)}-${props.unit}`">
		<span
			v-if="isEdited === false"
			class="inventory__result"
			:class="{
				'inventory__result--filled': expression.length > 0,
				'inventory__result--isEdited': isEdited === true,
			}"
			contenteditable="true"
			@focus="isEdited = true">
			<slot>{{ evalMath(expression).toFixed(zerofix) }}</slot>
			<small v-html="sfix"></small>
		</span>
		<!-- <Teleport to=".expression-teleport"> -->
		<label
			v-if="isEdited === true"
			class="inventory__label"
			:for="`_${stringToCode(props.code)}-${props.unit}`">
			<input
				type="text"
				class="inventory__input"
				:id="`_${stringToCode(props.code)}-${props.unit}`"
				:value="expression"
				@input="[(expression = $event.target.value), saveExpression($event)]"
				@blur="isEdited = false"
				@keydown.esc="$event.target.blur()"
				@vnode-mounted="({ el }) => el.focus()" />
			<span>{{ ` = ${evalMath(expression).toFixed(zerofix)}` }}</span>
			<small class="inventory__sfix" v-html="sfix"></small>
			<!-- <i class="bi bi-x-square"></i> -->
		</label>
		<!-- </Teleport> -->
	</div>
</template>

<style scoped>
.inventory__result {
	cursor: pointer;
	background-color: var(--bg-color);
	box-shadow: inset 0px 0px 0px 1px var(--accent-shade);
	padding: 0ch 0.5ch;
	display: flow-root;
	overflow: hidden;
	text-overflow: clip;
}
.inventory__result--isEdited {
	box-shadow: inset 0px 0px 0px 1px var(--accent2-shade);
	/* font-weight: 700; */
}
.inventory__result--filled::before {
	content: '\F72D';
	position: absolute;
	left: 0.2ex;
	font-family: 'bootstrap-icons';
	color: var(--accent-shade);
}
.inventory__label {
	display: flex;
	align-items: baseline;
	flex-direction: row;
	flex-wrap: nowrap;
	margin: 0;
	background-color: var(--bg-color);
	box-shadow: 0 0 0 3px var(--bg-color);
}
/* .inventory__label {
	position: absolute;
	bottom: 0;
	translate: 0 100%;
} */
.inventory__sfix {
	/* font-weight: 700; */
	background-color: var(--bg-color);
	padding-right: 1ex;
}
.inventory__input {
	flex-grow: 1;
	text-align: right;
	line-height: 1.4rem;
	border: 0;
	padding-inline-end: 0.5ex;
}

:is(#fakeid, .isExpanded) {
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
