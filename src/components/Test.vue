<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const data = reactive([
	{ id: 1, val: 100 },
	{ id: 2, val: 200 },
	{ id: 3, val: 300 },
])

const recalc = computed(() => {
	return data[0].val * 4
})

function test(e) {
	console.log(e.target.value.trim())
}
</script>

<template>
	<input v-model="data[0].val" @keyup="test" placeholder="A" type="text" />
	<input :value="recalc" placeholder="B" type="text" />
	<input v-model="data[0].val" placeholder="C" type="text" />
</template>
