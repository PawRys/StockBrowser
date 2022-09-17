<script setup>
import { ref } from 'vue'
import { db } from '../assets/dexiedb.js'

const status = ref('')
const friendName = ref('')
const friendAge = ref(21)

async function addFriend() {
	try {
		const random = Math.floor(Math.random() * 1000)
		await db.products.clear()
		await db.products.put({
			id: 999,
			name: `Name-${random}`,
			flags: `Flag-${random}`,
			groups: `Group-${random}`,
		})
	} catch (error) {
		status.value = `Error: ${error}`
	}
}
</script>

<template>
	<fieldset>
		<legend>Add new friend</legend>
		<label>
			Name:
			<input
				v-model="friendName"
				type="text"
			/>
		</label>
		<br />
		<label>
			Age:
			<input
				v-model="friendAge"
				type="number"
			/>
		</label>
		<br />
		<button @click="addFriend">Add Friend</button>
		<p>{{ status }}</p>
	</fieldset>
</template>
