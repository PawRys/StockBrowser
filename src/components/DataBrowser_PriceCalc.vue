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
	m3: buyPrice_ref.value,
	m2: calcPrice(props.size, buyPrice_ref.value, 'm3', 'm2'),
	szt: calcPrice(props.size, buyPrice_ref.value, 'm3', 'szt'),
	marg: 0,
	perc: 0,
})

const priceColor = computed(() => {
	if (recalcs.perc > 0.1) return 'green'
	if (recalcs.perc < -0.1) return 'red'
	return ''
})

provide('buyPrice_ref', buyPrice_ref)
provide('recalcs', recalcs)
</script>

<template>
	<Field class="pCub" :class="priceColor" :size="props.size" :unit="'m3'" />
	<Field class="pSqr" :class="priceColor" :size="props.size" :unit="'m2'" />
	<Field class="pPcs" :class="priceColor" :size="props.size" :unit="'szt'" />
	<Field class="marg" :class="priceColor" :size="props.size" :unit="'marg'" />
	<Field class="perc" :class="priceColor" :size="props.size" :unit="'perc'" />
</template>

<style scoped>
.green {
	color: limegreen;
}
.red {
	color: crimson;
}
</style>
