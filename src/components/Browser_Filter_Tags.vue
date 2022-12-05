<script setup>
import { ref, inject, watch, watchEffect, unref } from 'vue';
const userFilter = inject('userFilter');
const filteredData = inject('filteredData_global');
const filteredData_Tags = ref({
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

watch([userFilter, filteredData], () => {
	let tags = new Set();
	let thick = new Set();
	let sizeA = new Set();
	let sizeB = new Set();
	let grades = new Set();
	let words = new Set();

	for (const row of filteredData.value) {
		const codename = `${row.code} ${row.name}`;
		const chunks = codename.split(/[ \/]/gi);
		const grade = getProductGrade(codename);
		if (row.tags) {
			row.tags.split(' ').map((s) => tags.add(s));
		}
		if (row.size) {
			const [t, a, b] = row.size.split('x');
			if (t) thick.add(t);
			if (a) sizeA.add(a);
			if (b) sizeB.add(b);
		}
		if (grade) {
			grade.map((s) => grades.add(s));
		}
		for (const chunk of chunks) {
			if (/\d/.test(chunk)) continue;
			if (chunk.length < 3) continue;
			words.add(chunk.toLowerCase().replace(/[\.,]$/gi, ''));
		}
	}

	filteredData_Tags.value = {
		tags: Array.from(tags).sort(collator),
		thick: Array.from(thick).sort(collator),
		sizeA: Array.from(sizeA).sort(collator),
		sizeB: Array.from(sizeB).sort(collator),
		grades: Array.from(grades).sort(collator),
		words: Array.from(words).sort(collator),
	};
});

watchEffect(() => {
	const inputs = unref(checkedInputs);
	const eq = inputs.grades.length ? '=' : '';
	const x =
		inputs.thick.length || inputs.sizeA.length || inputs.sizeB.length
			? 'x'
			: '';
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
	const part = 'KILO|BB|B|CP|CC|C|WGE|WG|PQF|PQ|PF|F|WH|W|M';
	const pattern = `\\b(${part}){1}(\/(${part})){0,1}(?!\\.)\\b`;
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
	const test = inputs[colId].findIndex((e) => e === tag) < 0 ? false : true;
	return test;
}

function vnodelog(x) {
	console.log(x);
}
</script>

<template>
	<button :class="['button']" @click="clearAllCheckboxes()">
		<span>Usuń wszystkie</span><i class="bi bi-trash3"></i>
	</button>

	<form id="tag-selector" action="javascript:void(0);">
		<fieldset
			v-for="(columnTags, colId) in filteredData_Tags"
			:key="colId"
			:class="['search-tags', colId]">
			<h3>
				{{ columnNames[colId] }}
			</h3>

			<button
				:class="[
					'button',
					{ disabled: checkedInputs[colId].length ? false : true },
				]"
				@click="clearCheckboxesInGroup(colId)">
				<span>Usuń</span><i class="bi bi-trash3"></i>
			</button>

			<label
				v-for="(tag, tagIndex) in columnTags"
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

			<button class="button accent" @click="getAllCheckedBoxes">
				<span>Filtruj</span><i class="bi bi-funnel"></i>
			</button>
		</fieldset>
	</form>
</template>

<style scoped>
form {
	display: flex;
}
label {
	display: block;
	flex-direction: row;
	flex-wrap: nowrap;
	user-select: none;
}
label > input {
	cursor: pointer;
	/* outline: solid 1px tomato; */
}
:is(.button, button) i {
	font-size: 1em;
}
</style>
