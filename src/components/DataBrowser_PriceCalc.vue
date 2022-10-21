<script setup>
import { ref, computed, watch, inject, provide } from 'vue'
import Field from './DataBrowser_PriceCalcField.vue'

const props = defineProps({
	price: Number,
})
const price_base = ref(props.price)
provide('price_base', props.price)
</script>

<template>
	<Field class="pCub" :unit="'m3'" />
	<Field class="pSqr" :unit="'m2'" />
	<Field class="pPcs" :unit="'szt'" />
	<Field class="marg" :unit="'marg'" />
	<Field class="perc" :unit="'perc'" />
</template>

<style scoped></style>
