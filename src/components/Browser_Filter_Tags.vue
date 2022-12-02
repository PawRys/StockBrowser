<script setup>
import { ref, inject, watch, watchEffect } from 'vue';
const tagCloud_ref = ref({
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
			tags.add(...row.tags.split(' '));
		}

		if (row.size) {
			const [t, a, b] = row.size.split('x');
			if (t) thick.add(t);
			if (a) sizeA.add(a);
			if (b) sizeB.add(b);
		}

		const grade = getProductGrade(codename);
		if (grade) {
			grades.add(...grade);
		}

		const chunks = codename.split(/[ \/]/gi);
		for (const c of chunks) {
			if (/\d/.test(c)) continue;
			if (c.length < 3) continue;
			words.add(c.toLowerCase().replace(/\.$/gi, ''));
		}
	}
	Object.assign(tagCloud_ref.value, {
		tags: Array.from(tags).sort(collator),
		thick: Array.from(thick).sort(collator),
		sizeA: Array.from(sizeA).sort(collator),
		sizeB: Array.from(sizeB).sort(collator),
		grades: Array.from(grades).sort(collator),
		words: Array.from(words).sort(collator),
	});

	// console.log(tagCloud_ref.value);
});

function getProductGrade(input) {
	const part = 'KILO|BB|B|CP|C|WGE|WG|PQF|PQ|PF|F|WH|W|M';
	const pattern = `\\b(${part}){1}(\/(${part})){0,1}(?!\\.)\\b`;
	const grade = input.toUpperCase().match(new RegExp(pattern, 'gi'));
	return grade;
	// return grade ? grade : ['??/??'];
}
const checkedIputs = ref({
	tags: [],
	thick: [],
	sizeA: [],
	sizeB: [],
	grades: [],
	words: [],
});
function serialize(formData) {
	const form = document.querySelector('#tag-selector');
	const data = new FormData(form);
	let tags = data.getAll('tags');
	let thick = data.getAll('thick');
	let sizeA = data.getAll('sizeA');
	let sizeB = data.getAll('sizeB');
	let grades = data.getAll('grades');
	let words = data.getAll('words');
	const eq = grades.length ? '=' : '';
	const x = thick.length || sizeA.length || sizeB.length ? 'x' : '';

	checkedIputs.value = {
		tags: tags,
		thick: thick,
		sizeA: sizeA,
		sizeB: sizeB,
		grades: grades,
		words: words,
	};

	tags = tags.join('|');
	thick = thick.join('|');
	sizeA = sizeA.join('|');
	sizeB = sizeB.join('|');
	grades = grades.join('|');
	words = words.join('|');

	const result =
		`${tags} ${thick}${x}${sizeA}${x}${sizeB} ${eq}${grades} ${words}`.trim();
	userFilter.value = result;
	console.log(checkedIputs.value);
}

function isChecked(colId, tag) {
	return checkedIputs.value[colId].findIndex((e) => e === tag) >= 0
		? true
		: false;
}
</script>

<template>
	<button @click="serialize">OK</button>
	<form id="tag-selector">
		<fieldset
			v-for="(columnTags, colId) in tagCloud_ref"
			:key="colId"
			:class="['search-tags', colId]">
			<h3>
				{{ colId }}
			</h3>
			<label
				v-for="(tag, tagIndex) in columnTags"
				:key="`${colId}-${tagIndex}`"
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
}
</style>
