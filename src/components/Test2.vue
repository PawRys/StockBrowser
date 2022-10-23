<script setup>
import { ref, reactive, computed, watchEffect, watch } from 'vue'

const mother_ref = ref(1)
const first_ref = ref(1)
const second_ref = ref(1)
const third_ref = ref(1)
const vat = ref(false)

watch(first_ref, () => {
	mother_ref.value = first_ref.value / 1
	// console.log(`first_ref changed`)
})
watch(second_ref, () => {
	mother_ref.value = second_ref.value / 2
	// console.log(`second_ref changed`)
})
watch(third_ref, () => {
	mother_ref.value = third_ref.value / 4 / (vat.value ? 1.23 : 1)
	// console.log(`third_ref changed`)
})
watchEffect(() => {
	// console.log(`watchEffect triggered`)
	first_ref.value = (mother_ref.value * 1).toFixed(2)
	second_ref.value = (mother_ref.value * 2).toFixed(2)
	third_ref.value = (mother_ref.value * 4 * (vat.value ? 1.23 : 1)).toFixed(2)
	// console.log(vat.value)
})
</script>

<template>
	<h2>{{ mother_ref }}</h2>
	<label for="multi"><input type="checkbox" name="multi" id="" v-model="vat" /></label>
	<p><input type="number" v-model="ficomprst_ref" />: {{ first_ref }}</p>
	<p><input type="number" v-model="second_ref" />: {{ second_ref }}</p>
	<p><input type="number" v-model="third_ref" />: {{ third_ref }}</p>
</template>
