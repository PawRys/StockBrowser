<script setup>
import { ref, computed, watch, inject } from 'vue'

const dataSet_ref = inject('dataSet_ref')
const pageSize_ref = inject('pageSize_ref')
</script>

<template>
	<div class="flex-column">
		<label for="dataset-full">
			Stany zerowe:
			<input
				type="radio"
				name="dataset"
				id="dataset-full"
				value="dataset-full"
				v-model="dataSet_ref" />
		</label>
		<label for="dataset-total">
			Stany całkowite:
			<input
				type="radio"
				name="dataset"
				id="dataset-total"
				value="dataset-total"
				v-model="dataSet_ref"
				checked />
		</label>
		<label for="dataset-aviable">
			Stany handlowe:
			<input
				type="radio"
				name="dataset"
				id="dataset-aviable"
				value="dataset-aviable"
				v-model="dataSet_ref" />
		</label>
		<label for="pagesize">
			Ilość na stronę:
			<select name="sortOrder" id="sortOrder" v-model="pageSize_ref">
				<option value="10">10</option>
				<option value="20">20</option>
				<option value="40">40</option>
			</select>
			<!-- <input type="number" name="pagesize" id="pagesize" min="1" v-model="pageSize_ref" /> -->
		</label>
	</div>
</template>

<style scoped></style>
