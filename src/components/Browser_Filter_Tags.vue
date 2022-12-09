<script setup>
import { ref, inject, watch, watchEffect, unref } from 'vue';
import { animateScrollTo } from '../assets/handy_functions.js';
const userFilter = inject('userFilter');
const filteredData = inject('filteredData_global');
const searchTags = ref({
	tags: [],
	thick: [],
	sizeA: [],
	sizeB: [],
	grades: [],
	words: [],
});
const checkedInputs = ref({
	tags: [],
	thick: [],
	sizeA: [],
	sizeB: [],
	grades: [],
	words: [],
});
const columnNames = {
	tags: 'Grupa',
	thick: 'Grubość',
	sizeA: 'Wymiar A',
	sizeB: 'Wymiar B',
	grades: 'Klasa',
	words: 'Opis',
};
const collator = (a, b) => {
	return new Intl.Collator(undefined, { numeric: true }).compare(a, b);
};

// Collect search tags
watch([userFilter, filteredData], () => {
	let tags = new Set();
	let thick = new Set();
	let sizeA = new Set();
	let sizeB = new Set();
	let grade = new Set();
	let words = new Set();

	for (const row of filteredData.value) {
		const codename = `${row.code} ${row.name}`;
		const chunks = codename.split(/[ \/]/gi);
		const grades = getProductGrade(codename);
		if (row.tags) {
			row.tags.split(' ').map(s => tags.add(s));
		}
		if (row.size) {
			const [t, a, b] = row.size.split('x');
			if (t) thick.add(t);
			if (a) sizeA.add(a);
			if (b) sizeB.add(b);
		}
		if (grades) {
			grades.map(s => grade.add(s));
		}
		for (const chunk of chunks) {
			if (/\d/.test(chunk)) continue;
			if (chunk.length < 3) continue;
			words.add(chunk.toLowerCase().replace(/[\.,]$/gi, ''));
		}
	}

	searchTags.value = {
		tags: Array.from(tags).sort(collator),
		thick: Array.from(thick).sort(collator),
		sizeA: Array.from(sizeA).sort(collator),
		sizeB: Array.from(sizeB).sort(collator),
		grades: Array.from(grade).sort(collator),
		words: Array.from(words).sort(collator),
	};
});

// Build filter string from checked inputs
watchEffect(() => {
	const inputs = unref(checkedInputs);
	const x = inputs.thick.length || inputs.sizeA.length || inputs.sizeB.length ? 'x' : '';
	// const eq = x.length || inputs.tags.length || inputs.grades.length ? '=' : '';
	let tags = inputs.tags.join('|');
	let thick = inputs.thick.join('|');
	let sizeA = inputs.sizeA.join('|');
	let sizeB = inputs.sizeB.join('|');
	let dimension = '';
	let grades = inputs.grades.join('|');
	let words = inputs.words.join('|');
	if (tags) tags = `=${tags} `;
	if (grades) grades = `=${grades} `;
	if (x.length) dimension = `=${thick}${x}${sizeA}${x}${sizeB} `;

	userFilter.value = `${tags}${dimension}${grades}${words}`.trim();
});

function getProductGrade(input) {
	const className = 'KILO|BB|B|CP|CC|C|WGE|WG|PQF|PQ|PF|F|WH|W|M';
	const pattern = `\\b(${className}){1}(\/(${className})){0,1}(?!\\.)\\b`;
	const grade = input.toUpperCase().match(new RegExp(pattern, 'gi'));
	return grade;
}

function getAllCheckedBoxes(colId, tag) {
	const form = document.querySelector('#tag-selector');
	const formData = new FormData(form);
	let checkedBoxes = {
		tags: formData.getAll('tags'),
		thick: formData.getAll('thick'),
		sizeA: formData.getAll('sizeA'),
		sizeB: formData.getAll('sizeB'),
		grades: formData.getAll('grades'),
		words: formData.getAll('words'),
	};
	// Add checkbox in direct filtering (label pressed)
	if (colId && tag) {
		checkedBoxes[colId].push(tag);
	}
	Object.assign(checkedInputs.value, checkedBoxes);
}

function clearCheckboxesInGroup(groupName) {
	const inputs = unref(checkedInputs);
	inputs[groupName] = [];
	checkedInputs.value = inputs;
}

function clearAllCheckboxes() {
	checkedInputs.value = {
		tags: [],
		thick: [],
		sizeA: [],
		sizeB: [],
		grades: [],
		words: [],
	};
}

function isChecked(colId, tag) {
	const inputs = unref(checkedInputs);
	const test = inputs[colId].findIndex(e => e === tag) < 0 ? false : true;
	return test;
}

function addListener(evName, el) {
	// listner added to onUpdated hook because when regular 'click' happens
	// #results.offsetTop changes height witch resulting in scrolling to wrong position.
	el.addEventListener(
		evName,
		() => {
			animateScrollTo('#results');
		},
		{ once: true }
	);
}

function vnodelog(x) {
	console.log(x);
}
</script>

<template>
	<form id="tag-selector" action="javascript:void(0);">
		<fieldset
			v-for="(columnTags, colId) in searchTags"
			:key="colId"
			:class="['tag-group', colId]">
			<header>
				<h3>
					{{ columnNames[colId] }}
				</h3>
			</header>

			<label
				v-for="(tag, tagIndex) in columnTags"
				class="tag"
				:key="`${colId}-${tag}`"
				:for="`${colId}-${tagIndex}`"
				@click.prevent="getAllCheckedBoxes(colId, tag)">
				<input
					type="checkbox"
					:checked="isChecked(colId, tag)"
					:name="colId"
					:id="`${colId}-${tagIndex}`"
					:value="tag"
					@click.stop="" />

				<span class="button inline">{{ tag }}</span>
			</label>

			<footer class="tag-group-footer">
				<button class="button small" @click="getAllCheckedBoxes">
					<span>Filtruj</span>
					<i class="bi bi-funnel"></i>
				</button>
				<button
					:class="[
						'button small delete',
						{ disabled: checkedInputs[colId].length ? false : true },
					]"
					@click="clearCheckboxesInGroup(colId)">
					<span>Usuń</span>
					<i class="bi bi-trash3"></i>
				</button>
			</footer>
		</fieldset>
	</form>

	<footer id="footer-buttons">
		<button :class="['button']" @click="clearAllCheckboxes()">
			<span>Usuń wszystkie</span>
			<i class="bi bi-trash3"></i>
		</button>
		<button
			href="#results"
			id="show-results"
			class="button accent"
			@vnode-updated="addListener('click', $event.el)"
			@click="getAllCheckedBoxes">
			<span>Pokaż wyniki ({{ filteredData.length }})</span>
			<!-- <i class="bi bi-check-square"></i> -->
		</button>
	</footer>
</template>

<style scoped>
#tag-selector {
	display: flex;
	max-width: 100%;
	/* max-height: 80vh; */
	overflow-x: auto;
	scroll-snap-type: x mandatory;
}

#footer-buttons {
	position: sticky;
	bottom: 0.2rem;

	display: flex;
	flex-wrap: nowrap;
	align-items: center;
	justify-content: center;
	gap: 0.4ch;

	margin: 0.1rem;
	margin-inline: auto;
	padding: 0.3ch 0.4ch;
	width: fit-content;
	border-radius: 0.4rem;
	background: var(--bg-shade);
}

.tag-group {
	border: none;
	scroll-snap-align: center;
	/* overflow-y: auto; */
}

.tag-group > header {
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	justify-content: space-between;
	width: 100%;
}

.tag-group .tag {
	margin-block: 0.5rem;
}

.tag-group > footer {
	display: flex;
	flex-wrap: wrap;
	border-top: solid 1px var(--bg-shade);
}

label {
	display: flex;
	width: max-content;
	user-select: none;
}
label > input {
	cursor: pointer;
}
:is(.button, button) i {
	font-size: 1em;
}
</style>
