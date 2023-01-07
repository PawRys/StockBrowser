<script setup>
import DataSet from './Browser__DataSet.vue';
import DataMode from './Browser__DataMode.vue';
import Sorting from './Browser__Sorting.vue';
import VatSetup from './Browser__VatSetup.vue';
</script>

<template>
	<aside class="browserList__settings">
		<div class="sticker">
			<DataSet />
			<DataMode />
			<VatSetup />
			<Sorting />
			<footer></footer>
		</div>
	</aside>
</template>

<style scoped>
.sticker {
	position: sticky;
	top: 1rem;

	padding: 0.5rem;
	max-height: 100vh;
	overflow-y: auto;
	background-color: var(--bg-shade);
}

footer {
	height: 4rem;
}
</style>
