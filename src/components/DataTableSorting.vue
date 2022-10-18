<script setup>
import { ref, computed, watch, inject } from 'vue'

const sortOrder_ref = inject('sortOrder_ref')
</script>

<template>
	<div>
		Sortuj:
		<select name="sortOrder" id="sortOrder" v-model="sortOrder_ref">
			<option value="id">Id - rosnąco</option>
			<option value="id_desc">Id - malejąco</option>
			<option value="name">Nazwa A -> Z</option>
			<option value="name_desc">Nazwa Z -> A</option>
			<option value="price">💶 Cena - od najtańszych</option>
			<option value="price_desc">💶 Cena - od najdroższych</option>
			<option disabled></option>
			<option disabled>Sortuj ilość:</option>
			<option value="tCub_desc"> Całkowita m3 - od największej</option>
			<option value="tCub"> Całkowita m3 - od najmniejszej</option>
			<option value="tSqr_desc"> Całkowita m2 - od największej</option>
			<option value="tSqr"> Całkowita m2 - od najmniejszej</option>
			<option value="tPcs_desc"> Całkowita szt - od największej</option>
			<option value="tPcs"> Całkowita szt - od najmniejszej</option>
			<option disabled></option>
			<option disabled>Sortuj ilość:</option>
			<option value="aCub_desc"> Handlowa m3 - od największej</option>
			<option value="aCub"> Handlowa m3 - od najmniejszej</option>
			<option value="aSqr_desc"> Handlowa m2 - od największej</option>
			<option value="aSqr"> Handlowa m2 - od najmniejszej</option>
			<option value="aPcs_desc"> Handlowa szt - od największej</option>
			<option value="aPcs"> Handlowa szt - od najmniejszej</option>
		</select>
	</div>
</template>

<style scoped></style>
