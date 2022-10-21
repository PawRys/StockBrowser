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
	<div id="" v-if="pageCount_ref > 1">
		<a class="" href="#pageTop" @click="setPrevPage()">Prev</a>
		<select name="pagenum" id="pagenum" v-model="pageNumber_ref">
			<template v-for="n in pageCount_ref">
				<option :value="n || 1">{{ n }}</option>
			</template>
		</select>
		z {{ pageCount_ref }}
		<a class="" href="#pageTop" @click="setNextPage()">Next</a>
	</div>
</template>

<style scoped></style>
