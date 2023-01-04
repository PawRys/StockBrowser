<script setup>
import { ref, watchEffect, computed, provide } from 'vue';
import { DialogWrapper } from 'vue3-promise-dialog';
import { db as idb } from './utils/dexiedb.js';

import BrowserTab from './components/Browser__.vue';
import DataCollectorTab from './components/DataCollector__.vue';
import DataShareTab from './components/DataShare__.vue';
import TestTab from './components/Test.vue';

import LastModified from './components/LastModified.vue';

const lasttab = localStorage.StockBrowser_LastUsedPanel || BrowserTab;
const currentAppTab = ref(lasttab);
provide('currentAppTab', currentAppTab);
const tabs = {
	BrowserTab: { id: BrowserTab, name: 'Lista', icon: 'bi bi-list-ul' },
	DataCollectorTab: { id: DataCollectorTab, name: 'Załadauj', icon: 'bi bi-download' },
	DataShareTab: { id: DataShareTab, name: 'Udostępnij', icon: 'bi bi-cloud-arrow-up' },
	TestTab: { id: TestTab, name: 'Test', icon: 'bi bi-bug-fill' },
};

watchEffect(() => {
	localStorage.StockBrowser_LastUsedPanel = currentAppTab.value;
});
</script>

<template>
	<nav class="tab-switch">
		<button
			v-for="({ name, icon }, tabID) in tabs"
			:key="tabID"
			:class="['button', { active: currentAppTab === tabID }]"
			@click="currentAppTab = tabID">
			<span>{{ name }}</span>
			<i :class="icon"></i>
		</button>
	</nav>

	<Suspense>
		<LastModified />
	</Suspense>

	<main>
		<Suspense>
			<component :is="tabs[currentAppTab]?.id || BrowserTab"></component>
			<template #fallback>Loading...</template>
		</Suspense>
	</main>

	<footer>
		<p>Wszelkie prawa zastrzeżone - Paweł Ryszkowski</p>
		<p>
			Uwagi i pomoc techniczna - Paweł:
			<a href="mailto:pawrys.kontakt@gmail.com">pawrys.kontakt@gmail.com</a>
		</p>
	</footer>

	<DialogWrapper />
</template>

<style scoped>
.tab-switch {
	display: flex;
	gap: 1ch;
	flex-wrap: wrap;
	justify-content: flex-start;
}
.tab-switch .button > i {
	font-size: 1.1em;
}
footer {
	margin-top: 3rem;
	border-top: solid 1px var(--accent-shade);
}
</style>
