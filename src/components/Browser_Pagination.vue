<script setup>
import { inject, watch, watchEffect } from 'vue';

const sortedProducts = inject(['sortedProducts']);
const returnToParent = inject(['pagedProducts']);
const pageSize_global = inject(['pageSize_global']);
const pageCount_global = inject(['pageCount_global']);
const pageNumber_global = inject(['pageNumber_global']);

watchEffect(
	// watch(
	// 	[sortedProducts, pageSize_global, pageCount_global, pageNumber_global],
	() => {
		let data = sortedProducts.value;
		if (!data) return;

		const pageSize = pageSize_global.value;
		const pageNumber = pageNumber_global.value;
		const filterCount = data.length;
		const validPageSize = pageSize < 1 ? 1 : pageSize;
		const pageCount = Math.ceil(filterCount / validPageSize);
		const validPageNumber =
			pageNumber > pageCount ? pageCount : pageNumber || 1;
		const start = validPageNumber * validPageSize - validPageSize;
		const end = validPageNumber * validPageSize;
		data = data.slice(start, end);

		// Update UI
		pageSize_global.value = validPageSize;
		pageCount_global.value = pageCount;
		pageNumber_global.value = validPageNumber;
		returnToParent.value = data;
	},
	{
		// onTrack(e) {
		// 	console.log(e.target);
		// },
		// onTrigger(e) {
		// 	console.log(e);
		// 	// test();
		// },
		// flush: 'sync',
	}
);

function setPrevPage() {
	pageNumber_global.value -= 1;
}
function setNextPage() {
	pageNumber_global.value += 1;
}
</script>

<template>
	<section class="pagination" style="grid-area: page">
		<!-- <div>
			Wielkość:
			<select name="pageSize" v-model="pageSize_global">
				<option value="10">10</option>
				<option value="20">20</option>
				<option value="40">40</option>
			</select>
		</div> -->
		<div class="page-selector" v-if="pageCount_global > 1">
			<a
				class="select-prev material-symbols-outlined"
				href="#pageTop"
				@click="setPrevPage()">
				navigate_before
			</a>
			<select
				name="pagenum"
				class="select-pagenum"
				v-model="pageNumber_global">
				<template v-for="n in pageCount_global">
					<option :value="n || 1">{{ n }}</option>
				</template>
			</select>
			<span class="page-count"> z {{ pageCount_global }}</span>
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
