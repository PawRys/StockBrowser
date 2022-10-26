<script setup>
import { ref, reactive, computed, watch, inject, provide } from 'vue'
import { calcPrice } from './DataInsert_Scripts.js'
import Field from './DataBrowser_PriceCalcField.vue'

const props = defineProps(['plySize', 'buyPrice'])
const priceRoot = ref(props.buyPrice)
provide('priceRoot', priceRoot)
provide('buyPrice', props.buyPrice)

const priceColor = computed(() => {
	const diffrence = priceRoot.value - props.buyPrice
	if (diffrence > 1) return 'green'
	if (diffrence < -1) return 'red'
	return 'blue'
})
</script>

<template>
	<Field class="pCub" :class="priceColor" :size="props.plySize" :unit="'pCub'" />
	<Field class="pSqr" :class="priceColor" :size="props.plySize" :unit="'pSqr'" />
	<Field class="pPcs" :class="priceColor" :size="props.plySize" :unit="'pPcs'" />
	<Field class="marg" :class="priceColor" :size="props.plySize" :unit="'marg'" />
	<Field class="perc" :class="priceColor" :size="props.plySize" :unit="'perc'" />
</template>

<style scoped>
.green {
	color: limegreen;
}
.red {
	color: crimson;
}

.blue {
	color: darkslateblue;
}
</style>
