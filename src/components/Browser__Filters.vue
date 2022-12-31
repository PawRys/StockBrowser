<script setup>
import { ref, inject, watch, computed } from 'vue';
import {
	columnNames,
	addListener,
	getProductGrades,
	convertStringToRegexp,
} from './Browser__Filters.js';

const unfilteredData = inject('unfilteredData_global');
const filteredData = inject('filteredData_global');

const textFilter = ref('');
const selectedFilters = ref({
	group: [],
	thick: [],
	sizeA: [],
	sizeB: [],
	grade: [],
	words: [],
});

const filteredDataTags = computed(() => {
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
	const inputs = selectedFilters.value;
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
	const form = document.querySelector('#tags-selector');
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
	Object.assign(selectedFilters.value, checkedFilters);
}

function clearFiltersInGroup(groupName) {
	const inputs = selectedFilters.value;
	inputs[groupName] = [];
	selectedFilters.value = inputs;
}

function clearAllFilters() {
	textFilter.value = '';
	selectedFilters.value = {
		group: [],
		thick: [],
		sizeA: [],
		sizeB: [],
		grade: [],
		words: [],
	};
}

function isChecked(colId, tag) {
	const inputs = selectedFilters.value;
	const test = inputs[colId].findIndex(e => e === tag) < 0 ? false : true;
	return test;
}

function isDisabled(groupID) {
	const data = selectedFilters.value;
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

		<form id="tags-selector" class="tags-selector" action="javascript:void(0)">
			<fieldset
				class="tags-selector__group"
				v-for="(tagsGroup, groupID) in filteredDataTags"
				:class="[groupID]"
				:key="groupID">
				<header class="tags-selector__groupHeader">
					<h3>
						{{ columnNames[groupID] }}
					</h3>
				</header>

				<div
					class="tags-selector__tag"
					v-for="(tag, tagIndex) in tagsGroup"
					:key="`${groupID}-${tag}`">
					<input
						type="checkbox"
						:checked="isChecked(groupID, tag)"
						:name="groupID"
						:id="`${groupID}-${tagIndex}`"
						:value="tag" />

					<label
						class="button inline"
						:for="`${groupID}-${tagIndex}`"
						@click.prevent="getAllSelectedFilters(groupID, tag)">
						{{ tag }}
					</label>
				</div>

				<footer class="tags-selector__groupFooter">
					<button class="button" @click="getAllSelectedFilters">
						<span>Filtruj</span>
						<i class="bi bi-funnel"></i>
					</button>
					<button
						class="button delete"
						:class="{ disabled: isDisabled(groupID) }"
						@click="clearFiltersInGroup(groupID)">
						<span>Usuń</span>
						<i class="bi bi-trash3"></i>
					</button>
				</footer>
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

.tags-selector {
	display: flex;
	overflow-x: auto;
}

.tags-selector__group {
	display: flex;
	flex-direction: column;
	scroll-snap-align: center;
	border: none;
}

.tags-selector__tag {
	min-width: max-content;
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
