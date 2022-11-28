<script setup>
import { provide, ref } from 'vue';
import Test2 from './Test2.vue';
import Test3 from './Test3.vue';

const result = ref('A');
const resultB = ref();

provide('parentvalue', result);
provide('resultB', resultB);
</script>

<template>
	<h1>1. Grand Parent</h1>
	<Test2 />
	<Test3 />
	<div>
		<h2>Final result:</h2>
		<p>{{ resultB }}</p>
	</div>
</template>
