<script setup>
import { ref, reactive, computed, watchEffect, watch } from 'vue'

const mother_ref = ref(1)
const first_ref = ref(1)
const second_ref = ref(1)
const third_ref = ref(1)
const vat = ref(false)
const editedFieldId = ref()
const shadowValue = ref()

function full(val) {
	mother_ref.value = val.target.value.trim() / 1
}
function half(val) {
	mother_ref.value = val.target.value.trim() / 2
}
function qart(val) {
	if (editedFieldId.value === 'cub') shadowValue.value = val.target.value.trim()
	mother_ref.value = val.target.value.trim() / 4 / (vat.value ? 1.23 : 1)
}

const one = computed(() => {
	return mother_ref.value * 1
})
const two = computed(() => {
	return mother_ref.value * 2
})
const tre = computed(() => {
	return mother_ref.value * 4 * (vat.value ? 1.23 : 1)
})

function test(ev) {
	console.log(ev)
}
</script>

<template>
	<h2>{{ mother_ref }}</h2>
	<label for="vat">Vat: <input type="checkbox" name="vat" id="" v-model="vat" /></label>
	<p><input type="number" :value="one.toFixed(2)" @input="full" /></p>
	<p><input type="number" :value="two.toFixed(2)" @input="half" /></p>
	<p>
		<input
			v-if="editedFieldId !== 'cub'"
			type="number"
			:value="tre.toFixed(2)"
			@focus="
				() => {
					editedFieldId = 'cub'
					shadowValue = tre
				}
			" />
		<input
			v-else
			type="number"
			:value="shadowValue"
			:placeholder="tre.toFixed(2)"
			@input="qart"
			@blur="editedFieldId = ''"
			@keypress.enter="$event.target.select()"
			@vnode-mounted="({ el }) => el.focus()" />
	</p>
</template>
