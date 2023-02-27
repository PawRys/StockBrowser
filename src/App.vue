<script setup>
import { ref, watchEffect, computed, provide } from 'vue';
import { DialogWrapper } from 'vue3-promise-dialog';
import { db as idb } from './utils/dexiedb.js';

import DataCollectorTab from './components/DataCollector__.vue';
import DataManagerTab from './components/DataManager__.vue';
import DataBrowserTab from './components/Browser__.vue';
import DataShareTab from './components/DataShare__.vue';
import LastModified from './components/LastModified.vue';
// import TestTab from './components/Test.vue';

// const lasttab = (await idb.settings.get('currentAppTab')) || DataBrowserTab;
const lasttab = localStorage.StockBrowser_LastUsedPanel || DataBrowserTab;
const currentAppTab = ref(lasttab);
provide('currentAppTab', currentAppTab);
const tabs = {
	BrowserTab: { id: DataBrowserTab, name: 'Lista produktów', icon: 'bi bi-list-ul' },
	DataCollectorTab: { id: DataCollectorTab, name: 'Załadauj dane', icon: 'bi bi-download' },
	DataShareTab: { id: DataShareTab, name: 'Udostępnij dane', icon: 'bi bi-cloud-arrow-up' },
	DataManagerTab: { id: DataManagerTab, name: 'Zarządzaj bazą danych', icon: 'bi bi-database' },
	// TestTab: { id: TestTab, name: 'Test', icon: 'bi bi-bug-fill' },
};

watchEffect(async () => {
	localStorage.StockBrowser_LastUsedPanel = currentAppTab.value;
	// await idb.settings.put({ id: 'currentAppTab', value: currentAppTab.value });
});

(function setRandomUUID() {
	const UUID = localStorage.getItem('UUID');
	const UUIDpattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(UUID);
	if (UUIDpattern === false) {
		localStorage.setItem('UUID', crypto.randomUUID());
	}
})();
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
			<component :is="tabs[currentAppTab]?.id || DataBrowserTab"></component>
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
	justify-content: center;
}
.tab-switch .button > i {
	font-size: 1.1em;
}
footer {
	margin-top: 3rem;
	border-top: solid 1px var(--accent-shade);
}
</style>
