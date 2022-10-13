<script setup>
import { ref, computed, watch, provide } from 'vue'
import { db as idb } from '../assets/dexiedb.js'
console.time('DataTable')

const filter_ref = ref()
const filterCount_ref = ref(1)
const order_ref = ref(true)
const pageSize_ref = ref(10)
const pageCount_ref = ref(1)
const pageNumber_ref = ref(1)
const dataSet_ref = ref('dataset-total')
const products_ref = ref(await idb.products.where('total_m3').above(0).sortBy('id'))

watch(dataSet_ref, async () => {
	if (dataSet_ref.value === 'dataset-full') products_ref.value = await idb.products.toArray()
	if (dataSet_ref.value === 'dataset-total')
		products_ref.value = await idb.products.where('total_m3').above(0).sortBy('id')
	if (dataSet_ref.value === 'dataset-aviable')
		products_ref.value = await idb.products.where('aviable_m3').above(0).sortBy('id')
})

const filteredProducts = computed(() => {
	let data

	data = products_ref.value.filter(row =>
		`${row.id} ${row.name}`.match(new RegExp(filter_ref.value, 'i'))
	)

	const col = 'total'
	const order = 1
	// data = data.sort((a, b) => b[col] - a[col])
	data = data.slice().sort((a, b) => {
		a = a[col]
		b = b[col]
		return (a === b ? 0 : a > b ? 1 : -1) * (order_ref.value ? 1 : -1)
	})

	console.log(order_ref.value)

	const pageSize = pageSize_ref.value
	const pageNumber = pageNumber_ref.value
	const filterCount = data.length
	const validPageSize = pageSize < 1 ? 1 : pageSize
	const pageCount = Math.ceil(filterCount / validPageSize)
	const validPageNumber = pageNumber > pageCount ? pageCount : pageNumber || 1
	const start = validPageNumber * validPageSize - validPageSize
	const end = validPageNumber * validPageSize
	data = data.slice(start, end)

	// Update pagination UI
	pageCount_ref.value = pageCount
	pageNumber_ref.value = validPageNumber
	filterCount_ref.value = filterCount

	return data
})

console.timeEnd('DataTable')
</script>

<template>
	<h2>Main Table</h2>
	<div class="flex-column">
		<label for="dataset-full">
			Full:
			<input
				type="radio"
				name="dataset"
				id="dataset-full"
				value="dataset-full"
				v-model="dataSet_ref" />
		</label>
		<label for="dataset-total">
			Total:
			<input
				type="radio"
				name="dataset"
				id="dataset-total"
				value="dataset-total"
				v-model="dataSet_ref"
				checked />
		</label>
		<label for="dataset-aviable">
			Aviable:
			<input
				type="radio"
				name="dataset"
				id="dataset-aviable"
				value="dataset-aviable"
				v-model="dataSet_ref" />
		</label>
	</div>
	<p>Rekordów: {{ filterCount_ref }} z {{ products_ref.length }}</p>
	<p>
		<label for="pagenum">
			Numer strony:
			<select name="pagenum" id="pagenum" v-model="pageNumber_ref">
				<template v-for="n in pageCount_ref">
					<option :value="n || 1">{{ n }}</option>
				</template>
			</select>
			z {{ pageCount_ref }}
		</label>
		<label for="pagesize">
			<input type="number" name="pagesize" id="pagesize" min="1" v-model="pageSize_ref" />
		</label>
	</p>

	<p>
		<input type="checkbox" name="" id="" v-model="order_ref" />
		<label for="filter">
			Szukaj:<input type="text" name="filter" id="filter" v-model="filter_ref" />
		</label>
	</p>

	<table v-if="filteredProducts.length">
		<tbody>
			<!-- <tr v-for="ply in paginatedProducts"> -->
			<tr v-for="ply in filteredProducts">
				<td class="id">{{ ply.id }}</td>
				<td class="name">{{ ply.name }}</td>
				<td class="tags">search tags</td>
				<td class="text-align_right total_m3">{{ ply.total_m3.toFixed(3) }} m3</td>
				<td class="text-align_right total_m2">{{ ply.total_m2.toFixed(2) }} m2</td>
				<td class="text-align_right total_szt">{{ ply.total_szt.toFixed(1) }} szt</td>
				<td class="text-align_right aviable_m3">{{ ply.aviable_m3.toFixed(3) }} m3</td>
				<td class="text-align_right aviable_m2">{{ ply.aviable_m2.toFixed(2) }} m2</td>
				<td class="text-align_right aviable_szt">{{ ply.aviable_szt.toFixed(1) }} szt</td>
				<td class="text-align_right price_m3">
					<input type="number" name="" id="" :value="ply.price" />
				</td>
				<td class="text-align_right price_m2">
					<input type="number" name="" id="" :value="ply.price" />
				</td>
				<td class="text-align_right price_szt">
					<input type="number" name="" id="" :value="ply.price" />
				</td>
				<td class="text-align_right buy_price">{{ ply.price.toFixed(2) }} zł/m3</td>
				<td class="text-align_right marg_perc">[Narzut %]</td>
				<td class="text-align_right marg_rel">[Narzut zł]</td>
			</tr>
		</tbody>
	</table>
	<p v-else>Nie znaleziono produktów.</p>
</template>

<style scoped>
table,
tr {
	padding: 0.6ex 1ex;
	border: solid 1px silver;
}

table {
	border-collapse: collapse;
}

td {
	/* padding: 0.6ex 1ex; */
	padding: 0 0.5ex;
}

.id {
	grid-area: id__;
}
.name {
	grid-area: name;
}
.tags {
	grid-area: tags;
}
.total_m3 {
	grid-area: t_m3;
}
.total_m2 {
	grid-area: t_m2;
}
.total_szt {
	grid-area: t_sz;
}
.aviable_m3 {
	grid-area: a_m3;
}
.aviable_m2 {
	grid-area: a_m2;
}
.aviable_szt {
	grid-area: a_sz;
}
.price_m3 {
	grid-area: p_m3;
}
.price_m2 {
	grid-area: p_m2;
}
.price_szt {
	grid-area: p_sz;
}

.buy_price {
	grid-area: buyp;
}
.marg_perc {
	grid-area: perc;
}
.marg_rel {
	grid-area: marg;
}

tr {
	display: grid;
	grid-template-columns: repeat(2, 2fr) repeat(4, minmax(max-content, 1fr));
	grid-template-areas:
		'id__ tags t_m3 t_m2 t_sz buyp'
		'name name a_m3 a_m2 a_sz marg'
		'name name p_m3 p_m2 p_sz perc';
}

.text-align_right {
	text-align: right;
}
.flex-column {
	display: flex;
	flex-direction: column;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
	-webkit-appearance: none;
	margin: 0;
}

/* Firefox */
input[type='number'] {
	-moz-appearance: textfield;
}
</style>
