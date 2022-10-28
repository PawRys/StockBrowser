<script setup>
import { ref, reactive, inject } from 'vue'

const sortParams = inject('sortParams')
const order = ref()
const sortKeys = reactive({
	id: 1,
	name: 1,
	pCub: 1,
	tCub: -1,
	tSqr: -1,
	tPcs: -1,
	aCub: -1,
	aSqr: -1,
	aPcs: -1,
})

function setSortParams(id) {
	sortKeys[id] *= -1
	sortParams.value = [id, sortKeys[id]]
}
</script>

<template>
	<div>
		<h2>Sortuj:</h2>

		<div>
			<button class="button small" @click="setSortParams('id')">
				<span>Kod</span>
			</button>
			<button class="button small" @click="setSortParams('name')">
				<span>Nazwa</span>
			</button>
			<button class="button small" @click="setSortParams('pCub')">
				<span>Cena zakupu</span>
			</button>
		</div>
		<div>
			<button class="button small" @click="setSortParams('tCub')">
				<span>Stan całkowity m<sup>3</sup></span>
			</button>
			<button class="button small" @click="setSortParams('tSqr')">
				<span>Stan całkowity m<sup>2</sup></span>
			</button>
			<button class="button small" @click="setSortParams('tPcs')">
				<span>Stan całkowity szt</span>
			</button>
		</div>
		<div>
			<button class="button small" @click="setSortParams('aCub')">
				<span>Stan handlowy m<sup>3</sup></span>
			</button>
			<button class="button small" @click="setSortParams('aSqr')">
				<span>Stan handlowy m<sup>2</sup></span>
			</button>
			<button class="button small" @click="setSortParams('aPcs')">
				<span>Stan handlowy szt</span>
			</button>
		</div>
	</div>
</template>

<style scoped></style>
