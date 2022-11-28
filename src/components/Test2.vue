<script setup>
import { ref, reactive, computed, watchEffect, watch, inject } from 'vue';
const parentvalue = inject('parentvalue');
const resultB = inject('resultB');

const result = ref(`${parentvalue.value}+B`);
// resultB.value = `${parentvalue.value}+B`;
resultB.value = computed(() => `${parentvalue.value}+B`);
</script>

<template>
	<h2>1.1 Child - add B</h2>
	<p>{{ result }}</p>
</template>
