<script setup>
import { ref, reactive, computed, watchEffect, watch } from 'vue'

const mother_ref = ref(1)
const vat = reactive({ cub: false, sqr: false, pcs: true })
const editedFieldId = ref()
const shadowValue = ref()

function allInOne(event) {
	if (editedFieldId.value === 'pcs')
		mother_ref.value = event.target.value.trim() / 1 / (vat.pcs ? 1.23 : 1)
	if (editedFieldId.value === 'sqr')
		mother_ref.value = event.target.value.trim() / 2 / (vat.sqr ? 1.23 : 1)
	if (editedFieldId.value === 'cub')
		mother_ref.value = event.target.value.trim() / 4 / (vat.cub ? 1.23 : 1)
	shadowValue.value = event.target.value.trim()
}

const one = computed(() => {
	return mother_ref.value * 1 * (vat.pcs ? 1.23 : 1)
})
const two = computed(() => {
	return mother_ref.value * 2 * (vat.sqr ? 1.23 : 1)
})
const tre = computed(() => {
	return mother_ref.value * 4 * (vat.cub ? 1.23 : 1)
})
</script>

<template>
	<h2>{{ mother_ref }}</h2>
	<label for="vat">Vat szt: <input type="checkbox" name="vat" id="" v-model="vat.pcs" /></label>
	<label for="vat">Vat m2: <input type="checkbox" name="vat" id="" v-model="vat.sqr" /></label>
	<label for="vat">Vat m3: <input type="checkbox" name="vat" id="" v-model="vat.cub" /></label>
	<p>
		<span
			contenteditable="true"
			v-if="editedFieldId !== 'pcs'"
			@focus="
				() => {
					editedFieldId = 'pcs'
					shadowValue = one.toFixed(2)
				}
			"
			>{{ one.toFixed(2) }}zł</span
		>
		<input
			v-else
			type="number"
			:value="shadowValue"
			:placeholder="one.toFixed(2)"
			@input="allInOne"
			@blur="editedFieldId = ''"
			@keypress.enter="$event.target.select()"
			@vnode-mounted="({ el }) => el.focus()" />
	</p>
	<p>
		<span
			contenteditable="true"
			v-if="editedFieldId !== 'sqr'"
			@focus="
				() => {
					editedFieldId = 'sqr'
					shadowValue = two.toFixed(2)
				}
			"
			>{{ two.toFixed(2) }}zł</span
		>
		<input
			v-else
			type="number"
			:value="shadowValue"
			:placeholder="tre.toFixed(2)"
			@input="allInOne"
			@blur="editedFieldId = ''"
			@keypress.enter="$event.target.select()"
			@vnode-mounted="({ el }) => el.focus()" />
	</p>
	<p>
		<span
			contenteditable="true"
			v-if="editedFieldId !== 'cub'"
			@focus="
				() => {
					editedFieldId = 'cub'
					shadowValue = tre.toFixed(2)
				}
			"
			>{{ tre.toFixed(2) }}zł</span
		>
		<input
			v-else
			type="number"
			:value="shadowValue"
			:placeholder="tre.toFixed(2)"
			@input="allInOne"
			@blur="editedFieldId = ''"
			@keypress.enter="$event.target.select()"
			@vnode-mounted="({ el }) => el.focus()" />
	</p>
</template>
