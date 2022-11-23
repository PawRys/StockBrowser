<script setup>
import { ref, reactive, computed, watch, provide, inject } from 'vue';
const data = inject('filteredProducts');
const filter_ref = inject('filter_ref');
const filterCount_ref = inject('filterCount_ref');
const products_ref = inject('products_ref');

console.log('Filter:');
console.log(data.value);
</script>

<template>
	<section>
		<label for="filter">
			Szukaj:<input type="search" name="filter" id="filter" v-model="filter_ref" />
		</label>
		<div class="counter" style="grid-area: count">
			Rekordów: {{ filterCount_ref }} z {{ products_ref.length }}
		</div>
	</section>
</template>

<style scoped>
section {
	display: grid;
}
</style>
