<script setup>
import { ref, computed, reactive, inject, watch, unref } from 'vue';
import { calcPrice, calcQuant } from '../utils/functions';

const filteredData = inject('filteredData_global');
const sortedData = inject('sortedData_global');
const sortParams = ref(['code', 1]);
const sortKeys = reactive({
	code: [1, 'bi bi-hash', 'Kod towaru'],
	pCub: [0, 'bi bi-cash', 'Cena zakupu zł/m<sup>3</sup>'],
	pSqr: [0, 'bi bi-cash', 'Cena zakupu zł/m<sup>2</sup>'],
	pPcs: [0, 'bi bi-cash', 'Cena zakupu zł/szt'],
	tCub: [0, 'bi bi-cart4', 'Stan całkowity m<sup>3</sup>'],
	tSqr: [0, 'bi bi-cart4', 'Stan całkowity m<sup>2</sup>'],
	tPcs: [0, 'bi bi-cart4', 'Stan całkowity szt'],
	aCub: [0, 'bi bi-cart2', 'Stan handlowy m<sup>3</sup>'],
	aSqr: [0, 'bi bi-cart2', 'Stan handlowy m<sup>2</sup>'],
	aPcs: [0, 'bi bi-cart2', 'Stan handlowy szt'],
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

function setSortParams(currentId) {
	const [prevId] = sortParams.value;
	if (currentId !== prevId) sortKeys[prevId][0] = 0;
	sortKeys[currentId][0] = sortKeys[currentId][0] == 0 ? 1 : (sortKeys[currentId][0] *= -1);
	sortParams.value = [currentId, sortKeys[currentId][0]];
}
</script>

<template>
	<section class="sorting">
		<h4>Sortowanie</h4>
		<button
			v-for="([dir, icon, name], index) in sortKeys"
			:key="index"
			:id="index"
			:class="['button inline', { active: dir != 0 ? true : false }]"
			:style="`grid-area: ${index}`"
			@click="setSortParams(index)">
			<i v-if="icon" :class="icon"></i>
			<span v-html="`${name}`"></span>
			<span v-if="dir != 0">
				<i v-if="dir > 0" class="bi bi-sort-down-alt"></i>
				<i v-else class="bi bi-sort-down"></i>
			</span>
			<span v-else><i class="bi bi-arrow-down-short"></i></span>
		</button>
	</section>
</template>

<style scoped>
.sorting {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 0.8ex;
}
.active {
	font-weight: 600;
}
button:nth-of-type(3n - 1) {
	margin-top: 0.5rem;
}
</style>
