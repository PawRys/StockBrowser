<script setup>
import { ref, reactive, computed, watch, inject, provide } from 'vue'
import { calcPrice } from './DataInsert_Scripts.js'
import Field from './DataBrowser_PriceCalcField.vue'

const props = defineProps({
	price: Number,
	size: String,
})
const buyPrice_ref = ref(props.price)
const temp = 0
const recalcs = reactive({
	m3: buyPrice_ref.value.toFixed(2),
	m2: calcPrice(props.size, buyPrice_ref.value, 'm3', 'm2').toFixed(2),
	szt: calcPrice(props.size, buyPrice_ref.value, 'm3', 'szt').toFixed(2),
	marg: 0.0,
	perc: 0.0,
})

provide('buyPrice_ref', buyPrice_ref)
provide('recalcs', recalcs)
</script>

<template>
	<Field class="pCub" :size="props.size" :unit="'m3'" />
	<Field class="pSqr" :size="props.size" :unit="'m2'" />
	<Field class="pPcs" :size="props.size" :unit="'szt'" />
	<Field class="marg" :size="props.size" :unit="'marg'" />
	<Field class="perc" :size="props.size" :unit="'perc'" />
</template>

<style scoped></style>
