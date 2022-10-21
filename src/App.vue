<script setup>
import { ref } from 'vue'
import DataTable from './components/DataBrowser.vue'
import DataInsert from './components/DataInsert.vue'
import Test from './components/Test.vue'

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
		<!-- <button class="button" @click="panelSwitch('sharePanel')">Udostępnij<IconCloud /></button>
         <button class="button" @click="panelSwitch('historyPanel')">Historia<IconCalendar /></button>
         <button class="button" @click="panelSwitch('settings')">Ustawienia</button> -->
		<button class="button" @click="panelSwitch('test')">Test</button>
	</div>

	<Suspense>
		<DataTable v-if="panelName === 'tablePanel'" />
	</Suspense>

	<DataInsert v-if="panelName === 'loadPanel'" />
	<Test v-if="panelName === 'test'" />
	<p>The End</p>
</template>

<style>
.flex {
	display: flex;
}
</style>
