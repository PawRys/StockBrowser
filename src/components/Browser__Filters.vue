<script setup>
import { ref, inject, watch, computed } from 'vue';
import {
	columnNames,
	addListener,
	getProductGrades,
	convertStringToRegexp,
} from './Browser__Filters.js';

import { stringToCode } from '../utils/functions.js';

const unfilteredData = inject('unfilteredData_global');
const filteredData = inject('filteredData_global');

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

function isDisabled(groupID) {
	const data = selectedTagsCollection.value;
	return data[groupID].length ? false : true;
}
</script>

<template>
	<section class="filters" style="grid-area: fltr">
		<div class="textFilter">
			Szukaj:<input
				class="textFilter__input"
				type="search"
				name="filter"
				v-model="textFilter" />
		</div>

		<!-- <span class="counter" style="grid-area: count">
			Rekordów: {{ filteredData ? filteredData.length : 0 }} z
			{{ unfilteredData ? unfilteredData.length : 0 }}
		</span> -->

		<form id="tagFilter" class="tagFilter" action="javascript:void(0)">
			<fieldset
				class="tagFilter__fieldset"
				v-for="(tagsSet, setID) in tagsCollection"
				:class="[setID]"
				:key="setID">
				<h3>
					{{ columnNames[setID] }}
				</h3>

				<div
					class="tagFilter__tag"
					v-for="(tag, tagIndex) in tagsSet"
					:key="stringToCode(`${setID}-${tag}`)">
					<input
						type="checkbox"
						:checked="isChecked(setID, tag)"
						:name="setID"
						:id="stringToCode(`${setID}-${tagIndex}`)"
						:value="tag" />

					<label
						class="button inline"
						:for="stringToCode(`${setID}-${tagIndex}`)"
						@click.prevent="getAllSelectedFilters(setID, tag)">
						{{ tag }}
					</label>
				</div>

				<button class="button small" @click="getAllSelectedFilters">
					<i class="bi bi-funnel"></i>
					<span>Filtruj</span>
				</button>

				<button
					class="button small delete"
					:class="{ disabled: isDisabled(setID) }"
					@click="clearFiltersInGroup(setID)">
					<i class="bi bi-trash3"></i>
					<span>Usuń</span>
				</button>
			</fieldset>
		</form>

		<footer class="filters__footer">
			<button :class="['button']" @click="clearAllFilters()">
				<span>Usuń wszystkie</span>
				<i class="bi bi-trash3"></i>
			</button>
			<button
				id="show-results"
				class="button accent"
				@vnode-updated="addListener('click', $event.el)"
				@click="getAllSelectedFilters">
				<span>Pokaż wyniki ({{ filteredData.length }})</span>
				<!-- <i class="bi bi-check-square"></i> -->
			</button>
		</footer>
	</section>
</template>

<style scoped>
.textFilter__input {
	padding: 0.4rem;
	width: 100%;
}

.tagFilter {
	display: flex;
	overflow-x: auto;
	justify-content: center;
}

.tagFilter__fieldset {
	display: flex;
	flex-direction: column;
	scroll-snap-align: center;
	padding: 1ex;
	margin: 0;
	border: none;
}

.tagFilter__tag {
	padding-block: 0.2ex;
}

.filters__footer {
	position: sticky;
	bottom: 0.5rem;

	display: flex;
	flex-wrap: nowrap;
	align-items: center;
	justify-content: center;
	gap: 0.4ch;

	margin: 1rem;
	margin-inline: auto;
	padding: 0.3ch 0.4ch;
	width: fit-content;
	border-radius: 0.4rem;
	background: var(--bg-shade);
}

:is(.button, button) i {
	font-size: 1em;
}
</style>
