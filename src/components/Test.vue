<script setup>
import { ref, reactive, computed, watchEffect, watch } from 'vue'

const mother_ref = ref(1)
const first_ref = ref(1)
const second_ref = ref(1)
const third_ref = ref(1)
const vat = ref(false)

function whole(val) {
	mother_ref.value = Math.round((val.target.value.trim() / 1) * 100) / 100
}
function half(val) {
	mother_ref.value = Math.round((val.target.value.trim() / 2) * 100) / 100
}
function qart(val) {
	mother_ref.value = Math.round((val.target.value.trim() / 4 / (vat.value ? 1.23 : 1)) * 100) / 100
}

const first = computed(() => {
	return mother_ref.value * 1
})
const second = computed(() => {
	return mother_ref.value * 2
})
const third = computed(() => {
	return mother_ref.value * 4 * (vat.value ? 1.23 : 1)
})
</script>

<template>
	<h2>{{ mother_ref }}</h2>
	<label for="vat">Vat: <input type="checkbox" name="vat" id="" v-model="vat" /></label>
	<p><input type="number" :value="first" @change="whole" />: {{ first_ref }}</p>
	<p><input type="number" :value="second" @change="half" />: {{ second_ref }}</p>
	<p><input type="number" :value="third" @change="qart" />: {{ third_ref }}</p>
</template>
