<script setup>
import { ref, inject, watch, watchEffect } from 'vue';
let tagCloud_obj = {};
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

function serialize(formData) {
	let checked = document.querySelectorAll(
		'#tag-selector input[type="checkbox"]:checked'
	);

	checked = Array.from(checked).map((checkbox) => {
		// Array.map is wrong
		// Make Array.reduce to String

		checkbox.value;
	});

	console.log(checked.join(' '));
}
</script>

<template>
	<form id="tag-selector">
		<fieldset
			v-for="(columnTags, colIndex) in tagCloud_ref"
			class="search-tags"
			:key="colIndex">
			<label
				v-for="(tag, tagIndex) in columnTags"
				:key="tagIndex"
				:for="`tag-${tagIndex}`">
				<input
					type="checkbox"
					:name="colIndex"
					:id="`tag-${tagIndex}`"
					:value="tag"
					@input="serialize" />
				{{ tag }}
			</label>
		</fieldset>
	</form>
</template>
