<script setup>
import { inject } from 'vue';

const vat = inject('vat');
</script>

<template>
	<!-- <section class="vatsetup" style="grid-area: vats"> -->
	<label for="vatCub" class="button small" style="grid-area: vat3">
		<span>Vat m<sup>3</sup></span>
		<input
			type="checkbox"
			name="vatCub"
			id="vatCub"
			v-model="vat.m3"
			:true-value="1.23"
			:false-value="1" />
	</label>
	<label for="vatSqr" class="button small" style="grid-area: vat2">
		<span>Vat m<sup>2</sup></span>
		<input
			type="checkbox"
			name="vatSqr"
			id="vatSqr"
			v-model="vat.m2"
			:true-value="1.23"
			:false-value="1" />
	</label>
	<label for="vatPcs" class="button small" style="grid-area: vat1">
		<span>Vat szt</span>
		<input
			type="checkbox"
			name="vatPcs"
			id="vatPcs"
			v-model="vat.szt"
			:true-value="1.23"
			:false-value="1" />
	</label>
	<!-- </section> -->
</template>
