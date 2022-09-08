<script setup>
	import { ref } from 'vue'

	const textareavalue = ref()

	function clear() {
		textareavalue.value = ''
	}

	async function paste(e) {
		const permission = await navigator.permissions.query({ name: "clipboard-read" })
		if (permission.state == 'denied') {
			alert(`Uprawnienia do schowka dla tej witryny zostały wyłączone. Ask Google for help.`)
			return
		}
		const clipboardData = await navigator.clipboard.readText().catch(reason=>console.error(reason))
		textareavalue.value += clipboardData

		log()
	}


	function log() {console.log(`changed`)}

</script>

<template>
	<h1>Data Insert Template</h1>
	<hr>

	<p></p>

	<!-- <form action=""> -->
		<textarea id="datainsert" name="datainsert" rows="10" v-model="textareavalue" @input="log"></textarea>
		<button @click="paste">Wklej ze schowka</button>
		<button @click="clear">Wyczyść</button>
	<!-- </form> -->
</template>

<style scoped>
	#datainsert {
		width: 100%;
	}
</style>
