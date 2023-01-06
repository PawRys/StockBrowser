<script setup>
import { inject } from 'vue';

const vat = inject('vat');
const vatVal = inject('vatVal');
const items = {
	m3: { label: 'VAT m<sup>3</sup>' },
	m2: { label: 'VAT m<sup>2</sup>' },
	szt: { label: 'VAT szt' },
};
</script>

<template>
	<section class="vatSetup">
		<h4>Podatek VAT</h4>

		<label class="button inline" v-for="({ label }, vatKey) in items" :for="`vat${vatKey}`">
			<span v-html="label"></span>
			<input
				type="checkbox"
				:name="`vat${vatKey}`"
				:id="`vat${vatKey}`"
				v-model="vat[vatKey]"
				:true-value="vatVal"
				:false-value="1" />
		</label>
	</section>
</template>
