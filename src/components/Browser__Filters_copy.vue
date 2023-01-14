<script setup>
import { ref, reactive, inject, watch, computed, onUpdated, watchEffect } from 'vue';
import {
	columnNames,
	addListener,
	getProductGrades,
	convertStringToRegexp,
} from './Browser__Filters.js';

const unfilteredData = inject('unfilteredData_global');
const filteredData = inject('filteredData_global');
const textFilter = ref('');

const tagCollection = computed(() => {
	const data = filteredData.value;
	let groupSet = new Set();
	let thickSet = new Set();
	let sizeASet = new Set();
	let sizeBSet = new Set();
	let gradeSet = new Set();
	let wordsSet = new Set();
	const collator = (a, b) => {
		return new Intl.Collator(undefined, { numeric: true }).compare(a, b);
	};

	for (const row of data) {
		const codename = `${row.code} ${row.name}`;
		const stringChunks = codename.split(/[ \/]/gi);
		const productGrades = getProductGrades(codename);
		if (row.group) {
			row.group?.split(' ').map(s => groupSet.add(s));
		}
		if (productGrades) {
			productGrades.map(s => gradeSet.add(s));
		}
		if (row.size) {
			const [t, a, b] = row.size.split('x');
			if (t) thickSet.add(t);
			if (a) sizeASet.add(a);
			if (b) sizeBSet.add(b);
		}
		for (const chunk of stringChunks) {
			if (/\d/.test(chunk)) continue;
			if (chunk.length < 3) continue;
			wordsSet.add(chunk.toLowerCase().replace(/[\.,]$/gi, ''));
		}
	}

	return {
		group: Array.from(groupSet).sort(collator),
		thick: Array.from(thickSet).sort(collator),
		sizeA: Array.from(sizeASet).sort(collator),
		sizeB: Array.from(sizeBSet).sort(collator),
		grade: Array.from(gradeSet).sort(collator),
		words: Array.from(wordsSet).sort(collator),
	};
});

function checkedTagsCollection() {
	let inputs = document.querySelectorAll('#tagFilter :checked');
	let outputs = Array.from(inputs).map(item => item.value);
	console.log(outputs);
}

function stringToCode(string) {
	string = toBinary(string || '');
	return btoa(string);
}
function toBinary(string) {
	const codeUnits = Uint16Array.from({ length: string.length }, (element, index) =>
		string.charCodeAt(index)
	);
	const charCodes = new Uint8Array(codeUnits.buffer);

	let result = '';
	charCodes.forEach(char => {
		result += String.fromCharCode(char);
	});
	return result;
}

function isChecked(tag) {
	tag = tag.replace(/([\?])/, '\\$1');
	const searchString = textFilter.value.replace(/([\?])/, '\\$1');
	const result = searchString.match(new RegExp(tag, 'i'));
	return result ? true : false;
}

// APPLY FILTERS
watch([textFilter, unfilteredData], () => {
	//console.log(tagCollection.value);
	let data = unfilteredData.value;
	if (!data) return;
	let fliterRegexp = convertStringToRegexp(textFilter.value);
	data = data.filter(row => {
		const str = `${row.code} ${row.group} ${row.name}`;
		return str.match(new RegExp(fliterRegexp, 'i'));
	});
	filteredData.value = data;
});

watchEffect(() => {
	// console.log('changed', tagCollection.value);
});

onUpdated(() => {});
</script>

<template>
	<section class="filters">
		<label class="textFilter__label" for="textFilter__input">
			<span class="textFilter__name">Szukaj:</span>
			<input
				type="search"
				class="textFilter__input"
				name="textFilter__input"
				id="textFilter__input"
				placeholder="Szukaj"
				v-model="textFilter" />
			<i class="textFilter__icon bi bi-search"></i>
			<h6>{{ stringToCode(textFilter) }}</h6>
		</label>

		<form id="tagFilter" class="tagFilter" action="javascript:void(0)">
			<fieldset
				v-for="(tagSet, setID) in tagCollection"
				:key="setID"
				class="tagFilter__fieldset">
				<h4>{{ columnNames[setID] }}</h4>

				<label
					v-for="tag in tagSet"
					:key="stringToCode(`${setID}-${tag}`)"
					:for="stringToCode(`${setID}-${tag}`)"
					class="tagFilter__label button inline">
					<input
						type="checkbox"
						class="tagFilter__input"
						:value="tag"
						:checked="isChecked(tag)"
						:name="setID"
						:id="stringToCode(`${setID}-${tag}`)" />
					<span>{{ tag }}</span>
				</label>

				<button class="button" @click="checkedTagsCollection">
					<span>Filtruj</span>
					<i class="bi bi-funnel"></i>
				</button>

				<!-- <button
					class="button delete"
					:class="{ disabled: isDisabled(groupID) }"
					@click="clearFiltersInGroup(groupID)">
					<span>Usuń</span>
					<i class="bi bi-trash3"></i>
				</button> -->
			</fieldset>
		</form>
	</section>
</template>

<style scoped>
.filters {
	margin-block: 1rem 3rem;
}
.textFilter__label {
	display: flex;
	max-width: 60em;
	margin-inline: auto;
}
.textFilter__input {
	flex-grow: 1;
	padding: 1ex;
	font-size: 1.4rem;
	text-align: center;
}
.textFilter__input:focus::placeholder {
	color: transparent;
}
.textFilter__name {
	display: none;
}
.textFilter__icon {
	display: none;
}

.tagFilter {
	display: flex;
	justify-content: center;
}
.tagFilter__fieldset {
	display: flex;
	align-items: flex-start;
	flex-direction: column;

	padding: 1ex;
	border: 0;
}
.tagFilter__label {
	margin-block: 0.5ex;
}
</style>
