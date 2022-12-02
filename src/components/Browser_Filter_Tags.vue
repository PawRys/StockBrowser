<script setup>
import { ref, inject, watch, watchEffect, unref } from 'vue';
const filteredProducts_Tags = ref({
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

const userFilter = inject('userFilter');
const data = inject('filteredData_global');
const collator = (a, b) => {
	return new Intl.Collator(undefined, { numeric: true }).compare(a, b);
};

watch([userFilter, data], () => {
	// watchEffect(() => {
	let tags = new Set();
	let thick = new Set();
	let sizeA = new Set();
	let sizeB = new Set();
	let grades = new Set();
	let words = new Set();

	// console.clear();
	for (const row of data.value) {
		const codename = `${row.code} ${row.name}`;

		if (row.tags) {
			row.tags.split(' ').map(s => tags.add(s));
		}

		if (row.size) {
			const [t, a, b] = row.size.split('x');
			if (t) thick.add(t);
			if (a) sizeA.add(a);
			if (b) sizeB.add(b);
		}

		const grade = getProductGrade(codename);
		if (grade) {
			grade.map(s => grades.add(s));
		}

		const chunks = codename.split(/[ \/]/gi);
		for (const c of chunks) {
			if (/\d/.test(c)) continue;
			if (c.length < 3) continue;
			words.add(c.toLowerCase().replace(/\.$/gi, ''));
		}
	}

	filteredProducts_Tags.value = {
		tags: Array.from(tags).sort(collator),
		thick: Array.from(thick).sort(collator),
		sizeA: Array.from(sizeA).sort(collator),
		sizeB: Array.from(sizeB).sort(collator),
		grades: Array.from(grades).sort(collator),
		words: Array.from(words).sort(collator),
	};
});

watchEffect(() => {
	// watch(checkedInputs, () => {
	console.log(`watch checkedInputs`);
	const inputs = unref(checkedInputs);
	console.log(inputs);
	const eq = inputs.grades.length ? '=' : '';
	const x = inputs.thick.length || inputs.sizeA.length || inputs.sizeB.length ? 'x' : '';
	let tags = inputs.tags.join('|');
	let thick = inputs.thick.join('|');
	let sizeA = inputs.sizeA.join('|');
	let sizeB = inputs.sizeB.join('|');
	let grades = inputs.grades.join('|');
	let words = inputs.words.join('|');

	userFilter.value =
		`${tags} ${thick}${x}${sizeA}${x}${sizeB} ${eq}${grades} ${words}`.trim();
});

function getProductGrade(input) {
	const part = 'KILO|BB|B|CP|C|WGE|WG|PQF|PQ|PF|F|WH|W|M';
	const pattern = `\\b(${part}){1}(\/(${part})){0,1}(?!\\.)\\b`;
	const grade = input.toUpperCase().match(new RegExp(pattern, 'gi'));
	return grade;
}

function getAllCheckedBoxes() {
	const form = document.querySelector('#tag-selector');
	const data = new FormData(form);
	let tags = data.getAll('tags');
	let thick = data.getAll('thick');
	let sizeA = data.getAll('sizeA');
	let sizeB = data.getAll('sizeB');
	let grades = data.getAll('grades');
	let words = data.getAll('words');

	checkedInputs.value = {
		tags: tags,
		thick: thick,
		sizeA: sizeA,
		sizeB: sizeB,
		grades: grades,
		words: words,
	};
	// console.log(unref(checkedInputs));
}

function clearCheckboxesInGroup(groupName) {
	console.log(checkedInputs.value);
	const inputs = unref(checkedInputs);
	inputs[groupName] = [];
	checkedInputs.value = inputs;
	console.log(checkedInputs.value);
}

function isChecked(colId, tag) {
	const inputs = unref(checkedInputs);
	const test = inputs[colId].findIndex(e => e === tag) < 0 ? false : true;
	return test;
}

function vnodelog(x) {
	console.log(x);
}
</script>

<template>
	<button class="button accent" @click="getAllCheckedBoxes">OK</button>
	<form id="tag-selector" action="javascript:void(0);">
		<fieldset
			v-for="(columnTags, colId) in filteredProducts_Tags"
			:key="colId"
			:class="['search-tags', colId]">
			<h3>
				{{ colId }}
			</h3>
			<button class="button accent" @click="getAllCheckedBoxes">Dodaj filtr</button>
			<button class="button" @click="clearCheckboxesInGroup(colId)">
				<span>Usuń</span><i class="bi bi-trash3"></i>
			</button>
			<label
				v-for="(tag, tagIndex) in columnTags"
				:key="`${colId}-${tag}`"
				:for="`${colId}-${tagIndex}`">
				<input
					type="checkbox"
					:checked="isChecked(colId, tag)"
					:name="colId"
					:id="`${colId}-${tagIndex}`"
					:value="tag" />
				{{ tag }}
			</label>
		</fieldset>
	</form>
</template>

<style scoped>
form {
	display: flex;
}
label {
	display: block;
	user-select: none;
}
.button > i {
	font-size: 1em;
}
</style>
