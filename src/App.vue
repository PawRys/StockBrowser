<script setup>
import { ref, watchEffect } from 'vue';
import BrowserTab from './components/Browser_.vue';
import DataCollectorTab from './components/DataCollector_.vue';
import DataShareTab from './components/DataShare_.vue';
import TestTab from './components/Test.vue';

import IconGrid from './components/icons/IconGrid.vue';
import IconDisk from './components/icons/IconDisk.vue';
import IconCloud from './components/icons/IconCloudUpload.vue';
import IconCalendar from './components/icons/IconCalendar.vue';

// const name = localStorage.StockBrowser_LastUsedPanel || 'tablePanel';
// const panelName = ref(name);
// function panelSwitch(name) {
// 	panelName.value = name;
// 	localStorage.StockBrowser_LastUsedPanel = name;
// }

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
	<div class="panel-switch flex">
		<button
			v-for="(tab, i) of tabs"
			:key="i"
			:class="['button', { active: currentTab == i }]"
			@click="currentTab = i">
			{{ tab.name }}
			<i :class="tab.icon"></i>
		</button>
	</div>
	<!-- <KeepAlive> -->
	<Suspense>
		<component :is="tabs[currentTab].id"></component>
		<template #fallback>Loading...</template>
	</Suspense>
	<!-- </KeepAlive> -->

	<!-- <Suspense> <BrowserTab v-if="panelName === 'tablePanel'" /></Suspense>
	<DataCollectorTab v-if="panelName === 'loadPanel'" />
	<DataShareTab v-if="panelName === 'sharePanel'" />
	<TestTab v-if="panelName === 'test'" /> -->
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
