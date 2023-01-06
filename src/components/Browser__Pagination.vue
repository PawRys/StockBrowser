<script setup>
import { inject, watch, watchEffect } from 'vue';
import { animateScrollTo } from '../utils/functions.js';

const pagedData = inject(['pagedData_global']);
const sortedProducts = inject(['sortedData_global']);
const pageSize_global = inject(['pageSize_global']);
const pageCount_global = inject(['pageCount_global']);
const pageNumber_global = inject(['pageNumber_global']);
const pageSizes = [10, 20, 50];

watchEffect(() => {
	let data = sortedProducts.value;
	if (!data) return;

	const pageSize = pageSize_global.value;
	const pageNumber = pageNumber_global.value;
	const filterCount = data.length;
	const validPageSize = pageSize < 1 ? 1 : pageSize;
	const pageCount = Math.ceil(filterCount / validPageSize);
	const validPageNumber = pageNumber > pageCount ? pageCount : pageNumber || 1;
	const start = validPageNumber * validPageSize - validPageSize;
	const end = validPageNumber * validPageSize;
	data = data.slice(start, end);

	// Update UI
	pageSize_global.value = validPageSize;
	pageCount_global.value = data.length > 0 ? pageCount : 1;
	pageNumber_global.value = data.length > 0 ? validPageNumber : 1;
	pagedData.value = data;
});

function setPrevPage() {
	pageNumber_global.value -= 1;
}
function setNextPage() {
	pageNumber_global.value += 1;
}
</script>

<template>
	<section class="pagination">
		<div class="page-selector" v-if="pageCount_global > 1">
			<span>Pokaż: </span>
			<select name="pageSize" v-model="pageSize_global">
				<template v-for="val in pageSizes">
					<option :value="val">{{ val }}</option>
				</template>
			</select>

			<button class="button small" @click="[setPrevPage(), animateScrollTo('#results')]">
				<i class="bi bi-chevron-left"></i>
			</button>

			<select
				name="pagenum"
				class="select-pagenum"
				v-model="pageNumber_global"
				@input="animateScrollTo('#results')">
				<template v-for="n in pageCount_global">
					<option :value="n || 1">
						{{ n }}
					</option>
				</template>
			</select>
			<span class="page-count"> z {{ pageCount_global }}</span>

			<button class="button small" @click="[setNextPage(), animateScrollTo('#results')]">
				<i class="bi bi-chevron-right"></i>
			</button>
		</div>
	</section>
</template>

<style scoped>
select {
	cursor: pointer;
}

.pagination {
	display: flex;
	flex-direction: row;
	justify-self: right;
	width: max-content;
}
.page-selector {
	display: flex;
	align-items: center;
}
.page-selector > a {
	text-decoration: none;
	font-size: 2rem;
}
</style>
