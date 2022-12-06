<script setup>
import { ref, watchEffect } from 'vue';
import BrowserTab from './components/Browser_.vue';
import DataCollectorTab from './components/DataCollector_.vue';
import DataShareTab from './components/DataShare_.vue';
import TestTab from './components/Test.vue';

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
	<nav class="panel-switch flex">
		<button
			v-for="(tab, i) of tabs"
			:key="i"
			:class="['button', { active: currentTab == i }]"
			@click="currentTab = i">
			{{ tab.name }}
			<i :class="tab.icon"></i>
		</button>
	</nav>

	<main>
		<Suspense>
			<component :is="tabs[currentTab].id"></component>
			<template #fallback>Loading...</template>
		</Suspense>
	</main>

	<footer>
		<p>The End</p>
	</footer>
</template>

<style>
.button > i {
	font-size: 1.1em;
}
.flex {
	display: flex;
}
</style>
