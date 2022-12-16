<script setup>
import { ref, watchEffect, computed } from 'vue';
import { db as idb } from './dexiedb.js';

import BrowserTab from './components/Browser__.vue';
import DataCollectorTab from './components/DataCollector_.vue';
import DataShareTab from './components/DataShare_.vue';
import TestTab from './components/Test.vue';

import LastModified from './components/LastModified.vue';

const lasttab = localStorage.StockBrowser_LastUsedPanel || 0;
const currentTab = ref(lasttab);
const tabs = [
	{ id: BrowserTab, name: 'Lista', icon: 'bi bi-list-ul' },
	{ id: DataCollectorTab, name: 'Załadauj', icon: 'bi bi-download' },
	{ id: DataShareTab, name: 'Udostępnij', icon: 'bi bi-cloud-arrow-up' },
	{ id: TestTab, name: 'Test', icon: 'bi bi-bug-fill' },
];

watchEffect(() => {
	localStorage.StockBrowser_LastUsedPanel = currentTab.value;
});
</script>

<template>
	<nav class="tab-switch">
		<button
			v-for="(tab, i) of tabs"
			:key="i"
			:class="['button', { active: currentTab == i }]"
			@click="currentTab = i">
			<span>{{ tab.name }}</span>
			<i :class="tab.icon"></i>
		</button>
	</nav>

	<Suspense>
		<LastModified />
	</Suspense>

	<main>
		<Suspense>
			<component :is="tabs[currentTab].id"></component>
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
</template>

<style scoped>
.tab-switch {
	display: flex;
	gap: 1ch;
}
.tab-switch .button > i {
	font-size: 1.1em;
}
footer {
	margin-top: 3rem;
	border-top: solid 1px var(--accent-shade);
}
</style>
