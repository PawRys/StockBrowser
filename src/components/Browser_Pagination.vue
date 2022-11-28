<script setup>
import { ref, inject, watchEffect } from 'vue';

const sortedProducts = inject(['sortedProducts']);
const returnToParent = inject(['pagedProducts']);

const pageSize_ref = ref(20);
const pageCount_ref = ref(1);
const pageNumber_ref = ref(1);

watchEffect(() => {
	let data = sortedProducts.value;
	const pageSize = pageSize_ref.value;
	const pageNumber = pageNumber_ref.value;
	const filterCount = data.length;
	const validPageSize = pageSize < 1 ? 1 : pageSize;
	const pageCount = Math.ceil(filterCount / validPageSize);
	const validPageNumber = pageNumber > pageCount ? pageCount : pageNumber || 1;
	const start = validPageNumber * validPageSize - validPageSize;
	const end = validPageNumber * validPageSize;
	data = data.slice(start, end);

	// Update UI
	pageCount_ref.value = pageCount;
	pageNumber_ref.value = validPageNumber;
	returnToParent.value = data;
});

function setPrevPage() {
	pageNumber_ref.value -= 1;
}
function setNextPage() {
	pageNumber_ref.value += 1;
}
</script>

<template>
	<section class="pagination" style="grid-area: page">
		<!-- <div>
			Wielkość:
			<select name="pageSize" v-model="pageSize_ref">
				<option value="10">10</option>
				<option value="20">20</option>
				<option value="40">40</option>
			</select>
		</div> -->
		<div class="page-selector" v-if="pageCount_ref > 1">
			<a
				class="select-prev material-symbols-outlined"
				href="#pageTop"
				@click="setPrevPage()">
				navigate_before
			</a>
			<select name="pagenum" class="select-pagenum" v-model="pageNumber_ref">
				<template v-for="n in pageCount_ref">
					<option :value="n || 1">{{ n }}</option>
				</template>
			</select>
			<span class="page-count"> z {{ pageCount_ref }}</span>
			<a
				class="select-next material-symbols-outlined"
				href="#pageTop"
				@click="setNextPage()">
				navigate_next
			</a>
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
