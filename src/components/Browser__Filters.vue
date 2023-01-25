<script setup>
import { ref, inject, watch, computed } from 'vue';
import {
	filterNames,
	addListener,
	getProductGrades,
	convertStringToRegexp,
} from './Browser__Filters.js';

import { stringToCode, switchClass } from '../utils/functions.js';

const unfilteredData = inject('unfilteredData_global');
const filteredData = inject('filteredData_global');

const showFilters = ref(false);
const textFilter = ref('');
const selectedTagsCollection = ref({
	group: [],
	sizeG: [],
	thick: [],
	sizeA: [],
	sizeB: [],
	grade: [],
	words: [],
});

const tagsCollection = computed(() => {
	const data = filteredData.value;
	let group = new Set();
	let thick = new Set();
	let sizeA = new Set();
	let sizeB = new Set();
	let sizeG = new Set();
	let grade = new Set();
	let words = new Set();
	const collator = (a, b) => {
		return new Intl.Collator(undefined, { numeric: true }).compare(a, b);
	};

	for (const row of data) {
		const codename = `${row.code} ${row.name}`;
		const chunks = codename.split(/[ \/]/gi);
		const productGrades = getProductGrades(codename);
		if (row.group) {
			row.group.split(' ').map(s => group.add(s));
		}
		if (row.size) {
			const [t, a, b] = row.size.split('x');
			if (t) thick.add(t);
			if (a) sizeA.add(a);
			if (b) sizeB.add(b);
		}
		if (productGrades) {
			productGrades.map(s => grade.add(s));
		}
		for (const chunk of chunks) {
			if (/\d/.test(chunk)) continue;
			if (chunk.length < 3) continue;
			words.add(chunk.toLowerCase().replace(/[\.,]$/gi, ''));
		}
		if (row.sizeGroup) {
			sizeG.add(row.sizeGroup);
		}
	}

	return {
		group: Array.from(group).sort(collator),
		thick: Array.from(thick).sort(collator),
		grade: Array.from(grade).sort(collator),
		// sizeG: Array.from(sizeG).sort(collator),
		sizeA: Array.from(sizeA).sort(collator),
		sizeB: Array.from(sizeB).sort(collator),
		words: Array.from(words).sort(collator),
	};
});

const tagFilter = computed(() => {
	const inputs = selectedTagsCollection.value;
	const x = inputs.thick.length || inputs.sizeA.length || inputs.sizeB.length ? 'x' : '';
	let group = inputs.group.join('|');
	let thick = inputs.thick.join('|');
	let sizeA = inputs.sizeA.join('|');
	let sizeB = inputs.sizeB.join('|');
	let sizeG = inputs.sizeG.join('|');
	let dimension = '';
	let grade = inputs.grade.join('|');
	let words = inputs.words.join('|');
	if (group) group = `${group} `;
	if (grade) grade = `=${grade} `;
	if (sizeG) sizeG = `=${sizeG} `;
	if (x.length) dimension = `=${thick}${x}${sizeA}${x}${sizeB} `;

	return `${group}${grade}${sizeG}${dimension}${words}`.trim();
});

// APPLY FILTERING
watch([textFilter, tagFilter, unfilteredData], () => {
	console.time('APPLY FILTERING');
	let data = unfilteredData.value;
	if (!data) return;
	let filterString = `${textFilter.value} ${tagFilter.value}`;
	let fliterRegexp = convertStringToRegexp(filterString);
	console.log(fliterRegexp);
	data = data.filter(row => {
		const str = `${row.code} ${row.group} ${row.sizeGroup} ${row.name}`;
		return str.match(new RegExp(fliterRegexp, 'i'));
	});
	filteredData.value = data;
	console.timeEnd('APPLY FILTERING');
});

function getAllSelectedFilters(groupID, tag) {
	const form = document.querySelector('#tagFilter');
	const formData = new FormData(form);
	let checkedFilters = {
		group: formData.getAll('group'),
		thick: formData.getAll('thick'),
		sizeA: formData.getAll('sizeA'),
		sizeB: formData.getAll('sizeB'),
		sizeG: formData.getAll('sizeG'),
		grade: formData.getAll('grade'),
		words: formData.getAll('words'),
	};
	// Add checkbox in direct filtering (label pressed)
	if (groupID && tag) {
		checkedFilters[groupID].push(tag);
	}
	Object.assign(selectedTagsCollection.value, checkedFilters);
}

function clearFiltersInGroup(groupName) {
	const inputs = selectedTagsCollection.value;
	inputs[groupName] = [];
	selectedTagsCollection.value = inputs;
}

function clearAllFilters() {
	textFilter.value = '';
	const object = selectedTagsCollection.value;
	for (const key in object) {
		if (Object.hasOwnProperty.call(object, key)) {
			object[key] = [];
		}
	}
	selectedTagsCollection.value = object;
}

function isChecked(colId, tag) {
	const inputs = selectedTagsCollection.value;
	const test = inputs[colId].findIndex(e => e === tag) < 0 ? false : true;
	return test;
}

function isFilterApplied(groupID) {
	const tagFilters = selectedTagsCollection.value;
	groupID = groupID === 'any' ? undefined : groupID;
	if (groupID) {
		return tagFilters[groupID].length ? true : false;
	} else {
		if (textFilter.value.length > 0) return true;
		for (const groupId in tagFilters) {
			if (tagFilters[groupId].length > 0) return true;
		}
		return false;
	}
}

function openListSettings() {
	const optionsEl = document.querySelector('.browser__settings');
	const overlayEl = document.querySelector('.browser__settingsOverlay');
	optionsEl.classList.add('browser__settings--opened');
	overlayEl.classList.add('browser__settingsOverlay--opened');
}
</script>

<template>
	<section class="filters" :class="{ 'filters--opened': showFilters }">
		<header v-show="!showFilters" class="filters__header">
			<button @click="showFilters = true" class="bi bi-search button accent">Filtry</button>
			<button
				v-show="isFilterApplied('any') === true"
				@click="clearAllFilters()"
				class="button bi bi-trash3"
				title="Usuń filtry"></button>
			<span class="filters__counter">Wyników: {{ filteredData.length }}</span>
			<button
				class="bi bi-gear"
				id="browser__settingsOpenBtn"
				@click="openListSettings"
				title="Ustawienia"></button>
		</header>

		<div v-show="showFilters" class="filters__topBar">
			<input
				class="textFilter"
				type="search"
				name="filter"
				placeholder="Szukaj"
				v-model="textFilter" />
			<button
				class="button small bi bi-trash3"
				@click="textFilter = ''"
				title="Wyczyść"></button>
			<button
				class="button small bi bi-x-square"
				@click="showFilters = false"
				title="Zamknij"></button>
		</div>

		<div v-show="showFilters" class="textFilter__quickFilters">
			<button class="small" @click="textFilter = `=5x5'|4x4'`">Kwadraty</button>
			<button class="small" @click="textFilter = `=4x8'|8x4'`">4x8'</button>
			<button class="small" @click="textFilter = `=5x8'|8x5'`">5x8'</button>
			<button class="small" @click="textFilter = `=5x10'`">5x10'</button>
			<button class="small" @click="textFilter = `=7x1.'|8x1.'`">Verems</button>
			<button class="small" @click="textFilter = `=5x7'|7x5'`">Mini Verems</button>
		</div>

		<form v-show="showFilters" class="tagFilter" id="tagFilter" action="javascript:void(0)">
			<fieldset
				v-for="(tagsSet, setID) in tagsCollection"
				class="tagFilter__fieldset"
				:class="[setID]"
				:key="setID">
				<h3>
					{{ filterNames[setID] }}
				</h3>

				<div class="tagFilter__fieldsetTrack">
					<div
						v-for="(tag, tagIndex) in tagsSet"
						class="tagFilter__tag"
						:key="stringToCode(`${setID}-${tag}`)">
						<input
							type="checkbox"
							:checked="isChecked(setID, tag)"
							:name="setID"
							:id="stringToCode(`${setID}-${tag}`)"
							:value="tag" />
						<label
							class="button inline"
							:for="stringToCode(`${setID}-${tag}`)"
							@click.prevent="getAllSelectedFilters(setID, tag)">
							{{ tag }}
						</label>
					</div>
				</div>

				<i @click="getAllSelectedFilters" class="button small bi bi-funnel"> Filtruj </i>

				<i
					v-show="isFilterApplied(setID) === true"
					@click="clearFiltersInGroup(setID)"
					class="button small delete bi bi-trash3">
					Usuń
				</i>
			</fieldset>
		</form>

		<footer v-show="showFilters" class="filters__footer">
			<i @click="clearAllFilters()" class="button bi bi-trash3"> Usuń wszystkie </i>
			<button
				id="show-results"
				class="button accent"
				@vnode-updated="addListener('click', $event.el)"
				@click="[getAllSelectedFilters(), (showFilters = false)]">
				<span>Pokaż wyniki ({{ filteredData.length }})</span>
			</button>
		</footer>
	</section>
</template>

<style>
body:has(.filters--opened) {
	overflow: hidden;
}
</style>

<style scoped>
.filters {
	display: flex;
	flex-direction: column;
	align-items: center;

	position: sticky;
	z-index: 2;
	top: 0ex;
}
.filters--opened {
	position: fixed;
	inset: 0;

	margin: auto;
	padding: 1ex;
	max-width: fit-content;

	background-color: var(--bg-color);
	box-shadow: 0 0 0 100vw var(--bg-color);

	overflow: auto;
}

.filters__header {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;

	margin-block: 1ex;
	padding: 0.5ex;
	border-radius: 0.5ex;
	max-width: 100%;
	background-color: var(--bg-shade);
}
.filters__counter {
	margin: 0;
	padding: 1ex;
	font-weight: 700;
	/* background-color: var(--bg-color); */
}

.filters__topBar {
	display: flex;
	width: 100%;
}

.textFilter {
	flex-grow: 1;
	display: block;
	padding: 1ex;
	width: min(100%, 60ch);
	font-size: 1.2rem;
}
.textFilter:focus::placeholder {
	opacity: 0;
}
.textFilter__quickFilters {
	display: flex;
	flex-wrap: wrap;
	margin-block: 0.5ex;
	font-size: 1.2rem;
}

.tagFilter {
	display: flex;
	overflow-x: auto;
	margin-bottom: 1ex;
	max-width: 100%;
}
.tagFilter__fieldset {
	display: flex;
	flex-direction: column;
	border: 0;
	margin: 0;
	padding: 1ex;
}
.tagFilter__fieldsetTrack {
	margin-bottom: 1ex;
	max-height: 100%;
	overflow-y: auto;
}
.tagFilter__tag {
	display: flex;
	flex-wrap: nowrap;
	padding-block: 0.2ex;
}

.filters__footer {
	position: sticky;
	z-index: 2;
	bottom: 0;
	display: flex;
}
</style>
