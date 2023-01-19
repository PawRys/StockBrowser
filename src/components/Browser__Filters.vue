<script setup>
import { ref, inject, watch, computed } from 'vue';
import {
	columnNames,
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
	}

	return {
		group: Array.from(group).sort(collator),
		thick: Array.from(thick).sort(collator),
		sizeA: Array.from(sizeA).sort(collator),
		sizeB: Array.from(sizeB).sort(collator),
		grade: Array.from(grade).sort(collator),
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
	let dimension = '';
	let grade = inputs.grade.join('|');
	let words = inputs.words.join('|');
	if (group) group = `${group} `;
	if (grade) grade = `=${grade} `;
	if (x.length) dimension = `=${thick}${x}${sizeA}${x}${sizeB} `;

	return `${group}${dimension}${grade}${words}`.trim();
});

// APPLY FILTERING
watch([textFilter, tagFilter, unfilteredData], () => {
	let data = unfilteredData.value;
	if (!data) return;
	let filterString = `${textFilter.value} ${tagFilter.value}`;
	let fliterRegexp = convertStringToRegexp(filterString);
	console.log(fliterRegexp);
	data = data.filter(row => {
		const str = `${row.code} ${row.group} ${row.name}`;
		return str.match(new RegExp(fliterRegexp, 'i'));
	});
	filteredData.value = data;
});

function getAllSelectedFilters(groupID, tag) {
	const form = document.querySelector('#tagFilter');
	const formData = new FormData(form);
	let checkedFilters = {
		group: formData.getAll('group'),
		thick: formData.getAll('thick'),
		sizeA: formData.getAll('sizeA'),
		sizeB: formData.getAll('sizeB'),
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
	selectedTagsCollection.value = {
		group: [],
		thick: [],
		sizeA: [],
		sizeB: [],
		grade: [],
		words: [],
	};
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
</script>

<template>
	<section class="filters" :class="{ 'filters--opened': showFilters }">
		<header v-show="!showFilters" class="filters__header">
			<span class="filters__heading">Wyników: {{ filteredData.length }}</span>
			<i v-show="isFilterApplied('any') === true" @click="clearAllFilters()" class="button">
				Pokaż wszystkie
			</i>
			<i @click="showFilters = true" class="bi bi-search button accent"> Filtry </i>
		</header>

		<input
			v-show="showFilters"
			class="textFilter"
			type="search"
			name="filter"
			placeholder="Szukaj"
			v-model="textFilter" />
		<div v-show="showFilters" class="textFilter__quickFilters">
			<button class="small" @click="textFilter = ' =x1525x1525'">Kwadraty</button>
			<button
				class="small"
				@click="textFilter = ' x1220|1250|2440|2500x1220|1250|2440|2500'">
				4x8'
			</button>
			<button class="small" @click="textFilter = ' =x1500|1525x2440|2500'">5x8'</button>
			<button class="small" @click="textFilter = ' =x1500|1525x3000|3050'">5x10'</button>
			<button class="small" @click="textFilter = ' =x2150x3050|3340|3850|4000'">
				Verems
			</button>
		</div>

		<form v-show="showFilters" class="tagFilter" id="tagFilter" action="javascript:void(0)">
			<fieldset
				v-for="(tagsSet, setID) in tagsCollection"
				class="tagFilter__fieldset"
				:class="[setID]"
				:key="setID">
				<h3>
					{{ columnNames[setID] }}
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

		<i
			v-show="showFilters"
			@click="showFilters = false"
			class="filters__closeButton button bi bi-x-square"></i>
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
	margin: 0;
	padding: 1ex;

	overflow: auto;
	background-color: var(--bg-color);
}

.filters__header {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;

	margin-block: 1rem;
	max-width: 100%;
	/* cursor: pointer; */
}
.filters__heading {
	margin: 0;
	padding: 1ex;
	font-weight: 700;
	/* font-style: italic; */
	background-color: var(--bg-color);
}

.textFilter {
	display: block;
	padding: 1ex;
	width: min(100%, 60ch);
	font-size: 1.2rem;
}
.textFilter:focus::placeholder {
	opacity: 0;
}
.textFilter__quickFilters {
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

.filters__closeButton {
	position: fixed;
	top: 1ex;
	right: 1ex;
}
</style>
