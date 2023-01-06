<script setup>
import { inject } from 'vue';

const dataMode = inject('dataMode');
const items = {
	dataMode__trade: { label: 'Handel' },
	dataMode__inventory: { label: 'Inwenaryzacja' },
};
</script>

<template>
	<section class="dataMode">
		<h4>Tryb przeglądania</h4>
		<label class="button inline" v-for="({ label }, mode) in items" :key="mode" :for="mode">
			<span>{{ label }}: </span>
			<input type="radio" name="dataMode" :id="mode" :value="mode" v-model="dataMode" />
		</label>
	</section>
</template>
