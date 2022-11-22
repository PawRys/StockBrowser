<script setup>
import { ref, computed, reactive, inject, onUpdated } from 'vue';

const sortParams = inject('sortParams');
const ascText = 'od małych ilości';
const dscText = 'od dużych ilości';
const sortKeys = reactive({
	code: [1, 'Kod', 'od początku', 'od końca'],
	// name: [0, 'Nazwa', 'A...Z', 'Z...A'],
	pCub: [0, 'Cena zakupu m<sup>3</sup>', 'od tanich', 'od drogich'],
	pSqr: [0, 'Cena zakupu m<sup>2</sup>', 'od tanich', 'od drogich'],
	pPcs: [0, 'Cena zakupu szt', 'od tanich', 'od drogich'],
	// tCub: [0, 'Stan całkowity m<sup>3</sup>', ascText, dscText],
	// tSqr: [0, 'Stan całkowity m<sup>2</sup>', ascText, dscText],
	// tPcs: [0, 'Stan całkowity szt', ascText, dscText],
	// aCub: [0, 'Stan handlowy m<sup>3</sup>', ascText, dscText],
	// aSqr: [0, 'Stan handlowy m<sup>2</sup>', ascText, dscText],
	// aPcs: [0, 'Stan handlowy szt', ascText, dscText],
});

const currentSorting = computed(() => {
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
	<section class="sorting">
		<!-- <h2 v-html="currentSorting"></h2> -->
		<div class="filterKeys">
			<button
				v-for="([dir, name, ascText, dscText], index) in sortKeys"
				:key="index"
				:id="index"
				class="button small"
				:class="dir != 0 ? 'active' : ''"
				:style="`grid-area: ${index}`"
				@click="setSortParams(index)">
				<span v-html="`${name}`"></span>
				<span v-if="dir != 0" class="material-symbols-outlined">{{
					dir > 0 ? 'arrow_downward' : 'arrow_upward'
				}}</span>
			</button>
		</div>
	</section>
</template>

<style scoped>
/* #filterKeys {
   display: grid;
	gap: 0.3ch 0.3ch;
	grid-template-columns: repeat(3, 25ch);
	grid-template-areas:
		'code tCub aCub'
		'name tSqr aSqr'
		'pCub tPcs aPcs';
} */

.material-symbols-outlined {
	font-size: 1rem;
}
.active {
	font-weight: 600;
}
</style>
