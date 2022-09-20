<script setup>
import { ref } from 'vue'
import DataTable from './components/DataTable.vue'
import DataInsert from './components/DataInsert.vue'
import DexieTest from './components/DexieTest.vue'

import IconGrid from './components/icons/IconGrid.vue'
import IconDisk from './components/icons/IconDisk.vue'
import IconCloud from './components/icons/IconCloudUpload.vue'
import IconCalendar from './components/icons/IconCalendar.vue'

const panelSwitch = ref('tablePanel')
</script>

<template>
	<div class="panel-switch flex">
		<button class="button" @click="panelSwitch = 'tablePanel'">Tabela<IconGrid /></button>
		<button class="button" @click="panelSwitch = 'loadPanel'">Załaduj<IconDisk /></button>
		<button class="button" @click="panelSwitch = 'sharePanel'">Udostępnij<IconCloud /></button>
		<button class="button" @click="panelSwitch = 'historyPanel'">Historia<IconCalendar /></button>
	</div>

	<DataTable v-if="panelSwitch === 'tablePanel'" />
	<DataInsert v-if="panelSwitch === 'loadPanel'" />
</template>

<style>
.flex {
	display: flex;
}
</style>
