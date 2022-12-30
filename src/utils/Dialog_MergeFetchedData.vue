<script setup>
import { closeDialog } from 'vue3-promise-dialog';
</script>

<template>
	<div class="dialog">
		<div class="center">
			<h3>Wykryto dane inwentaryzacyjne</h3>

			<p>
				W danych, które importujesz istnieje spis z natury (inwentaryzacja). Wybierz co
				zrobić:
			</p>

			<button @click="closeDialog('leave')" class="btn">
				<span>Bez zmian</span>
				<span><i class="bi bi-x-square"></i></span>
			</button>

			<button @click="closeDialog('merge')" class="btn">
				<span>Dodaj</span>
				<span><i class="bi bi-plus-circle"></i></span>
			</button>

			<button @click="closeDialog('replace')" class="btn">
				<span>Zamień</span>
				<span><i class="bi bi-arrow-repeat"></i></span>
			</button>
		</div>
	</div>
</template>

<style scoped>
.dialog {
	display: flex;
	align-items: center;
	justify-content: center;

	position: fixed;
	inset: 0;
	box-shadow: inset 0 0 0 100vmax rgb(0 0 0 / 0.5);
}
.center {
	padding: 2rem;
	max-width: fit-content;
	background-color: var(--bg-shade);
}
</style>
