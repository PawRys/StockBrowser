<script setup>
	import { ref } from 'vue'
	
	const clip = ref()

	async function paste(e) {
		const permission = await navigator.permissions.query({ name: "clipboard-read" })
		if (permission.state == 'denied') {
			alert(`Uprawnienia do schowka dla tej witryny zostały wyłączone. Ask Google for help.`)
			return
		}
		const clipboardData = await navigator.clipboard.readText().catch(reason=>console.error(reason))
		clip.value = clipboardData
		console.log(permission);
		console.log(clipboardData);
	}

</script>

<template>
	<h1>Data Insert Template</h1>
	<hr>

	<p></p>

	<!-- <form action=""> -->
		<textarea id="datainsert" name="datainsert" rows="10" :value="clip"></textarea>
		<button @click="paste">Wklej ze schowka</button>
		<button type="reset" for="datainsert">Wyczyść</button>
	<!-- </form> -->
	<!-- <button @click="counter++">You clicked T1 {{ counter }} times.</button> -->
</template>

<style scoped>
	#datainsert {
		width: 100%;
	}
</style>
