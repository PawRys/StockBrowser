<script setup>
import { ref, computed, watch, inject } from 'vue'

const pageSize_ref = inject('pageSize_ref')
const pageCount_ref = inject('pageCount_ref')
const pageNumber_ref = inject('pageNumber_ref')

function setPrevPage() {
	pageNumber_ref.value -= 1
}
function setNextPage() {
	pageNumber_ref.value += 1
}
</script>

<template>
	<section class="pagination">
		<!-- <div>
			Wielkość:
			<select name="pageSize" v-model="pageSize_ref">
				<option value="10">10</option>
				<option value="20">20</option>
				<option value="40">40</option>
			</select>
		</div> -->
		<div class="page-selector" v-if="pageCount_ref > 1">
			<a class="select-prev material-symbols-outlined" href="#pageTop" @click="setPrevPage()">
				navigate_before
			</a>
			<select name="pagenum" class="select-pagenum" v-model="pageNumber_ref">
				<template v-for="n in pageCount_ref">
					<option :value="n || 1">{{ n }}</option>
				</template>
			</select>
			<span class="page-count"> z {{ pageCount_ref }}</span>
			<a class="select-next material-symbols-outlined" href="#pageTop" @click="setNextPage()">
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
