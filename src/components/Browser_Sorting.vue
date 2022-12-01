<script setup>
import {
	ref,
	computed,
	reactive,
	inject,
	watch,
	watchEffect,
	unref,
} from 'vue';
import { calcPrice, calcQuant } from './DataCollector_Scripts.js';

const filteredData = inject('filteredData_global');
const sortedData = inject('sortedData_global');
const sortParams = ref(['code', 1]);
const ascText = 'od małych ilości';
const dscText = 'od dużych ilości';
const sortKeys = reactive({
	code: [1, 'Kod towaru', 'od początku', 'od końca'],
	pCub: [0, 'Cena m<sup>3</sup>', 'od tanich', 'od drogich'],
	pSqr: [0, 'Cena m<sup>2</sup>', 'od tanich', 'od drogich'],
	pPcs: [0, 'Cena szt', 'od tanich', 'od drogich'],
	tCub: [0, 'Stan cał. m<sup>3</sup>', ascText, dscText],
	tSqr: [0, 'Stan cał. m<sup>2</sup>', ascText, dscText],
	tPcs: [0, 'Stan cał. szt', ascText, dscText],
	aCub: [0, 'Stan han. m<sup>3</sup>', ascText, dscText],
	aSqr: [0, 'Stan han. m<sup>2</sup>', ascText, dscText],
	aPcs: [0, 'Stan han. szt', ascText, dscText],
});

watch([sortParams, filteredData], () => {
	const [column, direction] = sortParams.value;
	let data = unref(filteredData);
	if (!data) return;

	data = data.sort((a, b) => {
		const aSize = a.size;
		const bSize = b.size;
		const group = column.slice(0, 1);
		let unit = column.slice(-3);

		if (!unit.match(/Sqr|Pcs/)) {
			a = a[column];
			b = b[column];
		} else {
			if (unit === 'Sqr') unit = 'm2';
			if (unit === 'Pcs') unit = 'szt';
			if (group === 'p') {
				a = calcPrice(aSize, a[`${group}Cub`], 'm3', unit);
				b = calcPrice(bSize, b[`${group}Cub`], 'm3', unit);
			}
			if (group === 't' || group === 'a') {
				a = calcQuant(aSize, a[`${group}Cub`], 'm3', unit);
				b = calcQuant(bSize, b[`${group}Cub`], 'm3', unit);
			}
		}
		return (a === b ? 0 : a > b ? 1 : -1) * direction;
	});
	sortedData.value = data;
});

const showSortingInfo = computed(() => {
	const [currentId] = sortParams.value;
	const [dir, text, ascText, dscText] = sortKeys[currentId];
	return `Sortowanie: ${text} - ${dir > 0 ? ascText : dscText}`;
});

function setSortParams(currentId) {
	const [prevId] = sortParams.value;
	if (currentId !== prevId) sortKeys[prevId][0] = 0;
	sortKeys[currentId][0] =
		sortKeys[currentId][0] == 0 ? 1 : (sortKeys[currentId][0] *= -1);
	sortParams.value = [currentId, sortKeys[currentId][0]];
}

function logme(el) {
	console.log(`update`);
	console.log(el);
}
</script>

<template>
	<!-- <section class="sorting" style="grid-area: sort"> -->
	<!-- <h2 v-html="currentSorting"></h2> -->
	<!-- <div class="filterKeys"> -->
	<button
		v-for="([dir, name, ascText, dscText], index) in sortKeys"
		:key="index"
		:id="index"
		:class="['button small', { active: dir != 0 ? true : false }]"
		:style="`grid-area: ${index}`"
		@click="setSortParams(index)">
		<span v-html="`${name}`"></span>
		<span v-if="dir != 0">
			<i v-if="dir > 0" class="bi bi-sort-down-alt"></i>
			<i v-else class="bi bi-sort-down"></i>
		</span>
	</button>
	<!-- </div> -->
	<!-- </section> -->
</template>

<style scoped>
.filterKeys {
	display: grid;
	gap: 0.3ch 0.3ch;
	grid-template-columns: repeat(3, 1fr);
	grid-template-areas:
		'code last drop'
		'tCub tSqr tPcs'
		'aCub aSqr aPcs'
		'pCub pSqr pPcs';
}

/* :is(.button, button) {
	display: flex;
} */
.material-symbols-outlined {
	font-size: 1rem;
}
.active {
	font-weight: 600;
}
</style>
