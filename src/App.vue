<script setup>
import { ref } from 'vue'
import BrowserTab from './components/Browser_.vue'
import DataCollectorTab from './components/DataCollector_.vue'
import DataShareTab from './components/DataShare_.vue'
import TestTab from './components/Test.vue'

import IconGrid from './components/icons/IconGrid.vue'
import IconDisk from './components/icons/IconDisk.vue'
import IconCloud from './components/icons/IconCloudUpload.vue'
import IconCalendar from './components/icons/IconCalendar.vue'

const name = localStorage.StockBrowser_LastUsedPanel || 'tablePanel'
const panelName = ref(name)
function panelSwitch(name) {
	panelName.value = name
	localStorage.StockBrowser_LastUsedPanel = name
}
</script>

<template>
	<div class="panel-switch flex">
		<button class="button" @click="panelSwitch('tablePanel')">Tabela<IconGrid /></button>
		<button class="button" @click="panelSwitch('loadPanel')">Załaduj<IconDisk /></button>
		<button class="button" @click="panelSwitch('sharePanel')">Udostępnij<IconCloud /></button>
		<!-- 
      <button class="button" @click="panelSwitch('historyPanel')">Historia<IconCalendar /></button>
      <button class="button" @click="panelSwitch('settings')">Ustawienia</button>
       -->
		<button class="button" @click="panelSwitch('test')">Test</button>
	</div>

	<Suspense><BrowserTab v-if="panelName === 'tablePanel'" /></Suspense>
	<DataCollectorTab v-if="panelName === 'loadPanel'" />
	<DataShareTab v-if="panelName === 'sharePanel'" />
	<TestTab v-if="panelName === 'test'" />
	<footer>
		<p>The End</p>
	</footer>
</template>

<style>
.flex {
	display: flex;
}
</style>
