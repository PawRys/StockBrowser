<script setup>
import { closeDialog } from 'vue3-promise-dialog';
</script>

<template>
	<dialog class="dialog">
		<div class="center">
			<h3>Wybierz, które dane zapisać</h3>

			<p>
				W danych, które importujesz istnieje spis z natury (inwentaryzacja).<br />
				Wybierz, które dane zapisać na urządzeniu:
			</p>

			<p>
				<button @click="closeDialog('local')" class="btn">
					<span>Lokalne</span>
					<span><i class="bi bi-database"></i></span>
				</button>
				- pozostaw dane lokalne <i class="bi bi-database"></i>, ignoruj dane z chmury
				<i class="bi bi-cloud-slash-fill"></i>
			</p>

			<p>
				<button @click="closeDialog('cloud')" class="btn">
					<span>Chmura</span>
					<span><i class="bi bi-cloud"></i></span>
				</button>
				- usuń dane lokalne <i class="bi bi-database-fill-slash"></i>, zapisz dane z chmury
				<i class="bi bi-cloud"></i>
			</p>

			<p>
				<button @click="closeDialog('merge')" class="btn">
					<span>Sumuj</span>
					<span><i class="bi bi-database"></i> + <i class="bi bi-cloud"></i></span>
				</button>
				- sumuj dane lokalne <i class="bi bi-database"></i> i dane z chmury
				<i class="bi bi-cloud"></i>
			</p>
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
.center {
	padding: 2rem;
	max-width: fit-content;
	background-color: var(--bg-shade);
}

.dialog ul {
	padding-left: 0;
	list-style: none;
}

.dialog li {
	margin-block: 0.5rem;
}
</style>
