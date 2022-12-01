<script setup>
import { ref, inject, watch, watchEffect } from 'vue';
let tagCloud_obj = {};
const tagCloud_ref = ref({
	tags: [],
	sizeA: [],
	sizeB: [],
	sizeC: [],
	grades: [],
	words: [],
});
const userFilter = inject('userFilter');
const data = inject('filteredData_global');
const collator = (a, b) => {
	return new Intl.Collator(undefined, { numeric: true }).compare(a, b);
};

// watch(userFilter, () => {
watchEffect(() => {
	let tags = new Set();
	let sizeA = new Set();
	let sizeB = new Set();
	let sizeC = new Set();
	let grades = new Set();
	let words = new Set();

	// console.clear();
	for (const row of data.value) {
		const codename = `${row.code} ${row.name}`;

		if (row.tags) {
			tags.add(...row.tags.split(' '));
		}

		if (row.size) {
			const [a, b, c] = row.size.split('x');
			if (a) sizeA.add(a);
			if (b) sizeB.add(b);
			if (c) sizeC.add(c);
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
		tags: Array.from(tags),
		sizeA: Array.from(sizeA).sort(collator),
		sizeB: Array.from(sizeB).sort(collator),
		sizeC: Array.from(sizeC).sort(collator),
		grades: Array.from(grades).sort(collator),
		words: Array.from(words).sort(collator),
	});

	console.log(tagCloud_ref.value);

	// console.log(tags);
	// console.log(sizeA);
	// console.log(sizeB);
	// console.log(sizeC);
	// console.log(grades);
	// console.log(words);
});

function getProductGrade(input) {
	const part = 'KILO|BB|B|CP|C|WGE|WG|PQF|PQ|PF|F|WH|W|M';
	const pattern = `\\b(${part}){1}(\/(${part})){0,1}(?!\\.)\\b`;
	const grade = input.toUpperCase().match(new RegExp(pattern, 'gi'));
	return grade;
	// return grade ? grade : ['??/??'];
}
</script>

<template>
	<pre>{{ tagCloud_obj }}</pre>
</template>
