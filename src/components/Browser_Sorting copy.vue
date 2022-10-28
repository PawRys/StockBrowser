<script setup>
import { inject } from 'vue'

const sortOrder_ref = inject('sortOrder_ref')
</script>

<template>
	<div>
		Sortuj:
		<select name="sortOrder" id="sortOrder" v-model="sortOrder_ref">
			<option value="id">Id - rosnąco</option>
			<option value="id_d">Id - malejąco</option>
			<option value="name">Nazwa A -> Z</option>
			<option value="name_d">Nazwa Z -> A</option>
			<option value="pCub_d">💶 Cena - od najdroższych</option>
			<option value="pCub">💶 Cena - od najtańszych</option>
			<option disabled></option>
			<option disabled>Sortuj ilość:</option>
			<option value="tCub_d"> Całkowita m3 - od największej</option>
			<option value="tCub"> Całkowita m3 - od najmniejszej</option>
			<option value="tSqr_d"> Całkowita m2 - od największej</option>
			<option value="tSqr"> Całkowita m2 - od najmniejszej</option>
			<option value="tPcs_d"> Całkowita szt - od największej</option>
			<option value="tPcs"> Całkowita szt - od najmniejszej</option>
			<option disabled></option>
			<option disabled>Sortuj ilość:</option>
			<option value="aCub_d"> Handlowa m3 - od największej</option>
			<option value="aCub"> Handlowa m3 - od najmniejszej</option>
			<option value="aSqr_d"> Handlowa m2 - od największej</option>
			<option value="aSqr"> Handlowa m2 - od najmniejszej</option>
			<option value="aPcs_d"> Handlowa szt - od największej</option>
			<option value="aPcs"> Handlowa szt - od najmniejszej</option>
		</select>

		<h2>Sortuj:</h2>
		<div>
			<button class="button small" @click="setSortParams('id')">
				<span>Kod:</span>
				<span v-if="sortKeys.id < 0">od początku</span>
				<span v-else>od końca</span>
			</button>
			<button class="button small" @click="setSortParams('name')">
				<span>Nazwa:</span>
				<span v-if="sortKeys.name < 0">A -> Z</span>
				<span v-else>Z -> A</span>
			</button>
			<button class="button small" @click="setSortParams('pCub')">
				<span>Cena zakupu:</span>
				<span v-if="sortKeys.pCub > 0">od najtańszej</span>
				<span v-else>od najdroższej</span>
			</button>
		</div>
		<div>
			<button class="button small" @click="setSortParams('tCub')">
				<span>Stan całkowity m<sup>3</sup>:</span>
				<span v-if="sortKeys.tCub < 0">od największego</span>
				<span v-else>od najmniejszego</span>
			</button>
			<button class="button small" @click="setSortParams('tSqr')">
				<span>Stan całkowity m<sup>2</sup>:</span>
				<span v-if="sortKeys.tSqr < 0">od największego</span>
				<span v-else>od najmniejszego</span>
			</button>
			<button class="button small" @click="setSortParams('tPcs')">
				<span>Stan całkowity szt:</span>
				<span v-if="sortKeys.tPcs < 0">od największego</span>
				<span v-else>od najmniejszego</span>
			</button>
		</div>
		<div>
			<button class="button small" @click="setSortParams('aCub')">
				<span>Stan handlowy m<sup>3</sup>:</span>
				<span v-if="sortKeys.aCub < 0">od największego</span>
				<span v-else>od najmniejszego</span>
			</button>
			<button class="button small" @click="setSortParams('aSqr')">
				<span>Stan handlowy m<sup>2</sup>:</span>
				<span v-if="sortKeys.aSqr < 0">od największego</span>
				<span v-else>od najmniejszego</span>
			</button>
			<button class="button small" @click="setSortParams('aPcs')">
				<span>Stan handlowy szt:</span>
				<span v-if="sortKeys.aPcs < 0">od największego</span>
				<span v-else>od najmniejszego</span>
			</button>
		</div>
	</div>
</template>

<style scoped></style>
