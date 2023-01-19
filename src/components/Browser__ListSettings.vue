<script setup>
import DataSet from './Browser__DataSet.vue';
import DataMode from './Browser__DataMode.vue';
import Sorting from './Browser__Sorting.vue';
import VatSetup from './Browser__VatSetup.vue';

function closeListSettings() {
	const optionsEl = document.querySelector('.browser__settings');
	const overlayEl = document.querySelector('.browser__settingsOverlay');
	optionsEl.classList.remove('browser__settings--opened');
	overlayEl.classList.remove('browser__settingsOverlay--opened');
}
</script>

<template>
	<aside class="browser__settings">
		<div class="sticker">
			<DataSet />
			<DataMode />
			<VatSetup />
			<Sorting />
			<button
				class="sticker__closeButton button"
				id="browser__settingsCloseBtn"
				@click="closeListSettings">
				<i class="bi bi-x-square"></i>
			</button>
		</div>
		<Teleport to="body">
			<div class="browser__settingsOverlay" @click="closeListSettings"></div>
		</Teleport>
	</aside>
</template>

<style>
.sticker {
	position: sticky;
	top: 0;

	display: flex;
	flex-direction: column;

	padding: 0.5rem;
	overflow-y: auto;
	background-color: var(--bg-shade);
}
.sticker__footer {
	margin-top: auto;
	align-self: flex-end;
}
.sticker__closeButton {
	position: fixed;
	top: 1rem;
	right: 1rem;
}

body:has(.browser__settings--opened) {
	overflow: hidden;
	user-select: none;
}

.browser__settings--opened {
	box-shadow: 0 0 2rem var(--accent-shade);
	z-index: 102;
	bottom: 0;
	top: 0;
}
.browser__settings--opened .sticker {
	height: 100%;
}

.browser__settingsOverlay {
	display: none;
}
.browser__settingsOverlay--opened {
	display: block;
	position: fixed;
	z-index: 100;
	inset: 0;
	background-color: var(--accent-shade);
	opacity: 0.5;
}
</style>
