<script setup>
import { ref, inject, watch, watchEffect } from 'vue';
import { animateScrollTo } from '../utils/functions.js';
import { stateManager } from '../utils/stateManager';

const pagedData = inject(['pagedData_global']);
const sortedProducts = inject(['sortedData_global']);
// const pageSize_global = inject(['pageSize_global']);
// const pageCount_global = inject(['pageCount_global']);
// const pageNumber_global = inject(['pageNumber_global']);
const pageSizes = [10, 20, 50];
const { pageSize, pageCount, pageNumber } = inject(['paginationState']);
console.log(pageSize, pageCount, pageNumber);
// const pageSize = ref(localStorage.StockBrowser_PageSize || pageSizes[0]);
// const pageCount = ref(stateManager.pageCount || 2);
// const pageNumber = ref(stateManager.pageNumber || 1);

watchEffect(() => {
	// let data = sortedProducts.value;
	// if (!data) return;
	// const dataLength = data.length;
	// const validPageSize = pageSize.value < 1 ? 1 : pageSize.value;
	// const start = pageNumber.value * validPageSize - validPageSize;
	// const end = pageNumber.value * validPageSize;
	// pagedData.value = data.slice(start, end);
	// stateManager.pageSize = pageSize.value;
	// stateManager.pageCount = Math.ceil(dataLength / validPageSize);
	// stateManager.pageNumber = pageNumber.value;
	// localStorage.StockBrowser_PageSize = pageSize.value;
});

// watchEffect(() => {
// 	let data = sortedProducts.value;
// 	if (!data) return;

// 	const pageSize = pageSize.value;
// 	const pageNumber = pageNumber.value;
// 	const filterCount = data.length;
// 	const validPageSize = pageSize < 1 ? 1 : pageSize;
// 	const pageCount = Math.ceil(filterCount / validPageSize);
// 	const validPageNumber = pageNumber > pageCount ? pageCount : pageNumber || 1;
// 	const start = validPageNumber * validPageSize - validPageSize;
// 	const end = validPageNumber * validPageSize;
// 	data = data.slice(start, end);

// 	// Update UI
// 	pageSize.value = validPageSize;
// 	pageCount.value = data.length > 0 ? pageCount : 1;
// 	pageNumber.value = data.length > 0 ? validPageNumber : 1;
// 	pagedData.value = data;
// });

function setPrevPage() {
	stateManager.pageNumber -= 1;
}
function setNextPage() {
	stateManager.pageNumber += 1;
}
</script>

<template>
	<section class="pagination" v-if="pageCount > 1">
		<div class="page-selector">
			<span>Pokaż: </span>
			<select name="pageSize" v-model="pageSize">
				<template v-for="val in pageSizes">
					<option :value="val">{{ val }}</option>
				</template>
			</select>

			<button class="button small" @click="[setPrevPage(), animateScrollTo('#results', -50)]">
				<i class="bi bi-chevron-left"></i>
			</button>

			<select
				name="pagenum"
				class="select-pagenum"
				:value="stateManager.pageNumber"
				@input="[(pageNumber = $event.target.value), animateScrollTo('#results', -50)]">
				<template v-for="n in stateManager.pageCount">
					<option :value="n || 1">
						{{ n }}
					</option>
				</template>
			</select>
			<span class="page-count"> z {{ stateManager.pageCount }}</span>

			<button class="button small" @click="[setNextPage(), animateScrollTo('#results', -50)]">
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
