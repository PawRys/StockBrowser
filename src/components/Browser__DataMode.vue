<script setup>
import { inject } from 'vue';

const dataMode = inject('dataMode');
const items = {
	dataMode__trade: { label: 'Handel', icon: 'bi bi-coin' },
	dataMode__inventory: { label: 'Inwenaryzacja', icon: 'bi bi-calculator-fill' },
};
</script>

<template>
	<section class="dataMode">
		<h4>Tryb przeglądania</h4>
		<label
			class="button inline"
			v-for="({ label, icon }, mode) in items"
			:key="mode"
			:for="mode">
			<i :class="icon"></i>
			<span>{{ label }}: </span>
			<input type="radio" name="dataMode" :id="mode" :value="mode" v-model="dataMode" />
		</label>
	</section>
</template>

<style scopde>
.dataMode {
	display: grid;
	justify-items: start;
	gap: 0.5ex;
}
</style>
