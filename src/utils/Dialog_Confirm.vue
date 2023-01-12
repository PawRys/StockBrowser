<script setup>
import { defineProps } from 'vue';
import { closeDialog } from 'vue3-promise-dialog';
const props = defineProps({ text: String });
</script>

<template>
	<dialog class="dialog">
		<div class="dialog__center">
			<h3 class="dialog__heading">Potwierdź akcję</h3>

			<article class="dialog__text" v-html="props.text"></article>

			<section class="dialog__decision">
				<button class="dialog__yes accent2" @click="closeDialog(true)">
					<span>Tak</span>
					<span><i class="bi bi-check-square-fill"></i></span>
				</button>
				<button class="dialog__no" @click="closeDialog(false)">
					<span>Nie</span>
					<span><i class="bi bi-x-square"></i></span>
				</button>
			</section>
		</div>
	</dialog>
</template>

<style scoped>
.dialog {
	display: flex;
	align-items: center;
	justify-content: center;

	position: fixed;
	inset: 0;

	border: 0;
	padding: 0;
	box-shadow: 0 0 0 100vmax rgb(0 0 0 / 0.5);
}
.dialog__center {
	padding: 2rem;
	max-width: fit-content;
	background-color: var(--bg-shade);
}
.dialog__decision {
	display: flex;
	justify-content: flex-end;
}
</style>
