  <script setup>
    	import { ref } from 'vue'
      import { db } from '../assets/dexiedb.js';

      const status = ref('')
      const friendName = ref('')
      const friendAge = ref(21)

      async function addFriend() {
        try {
          // Add the new friend!
          const id = await db.friends.add({
            name: friendName.value,
            age: friendAge.value,
          });
  
          status.value = `Friend ${friendName.value}
            successfully added. Got id ${id}`;
  
          // Reset form:
          friendName.value = '';
          friendAge.value = 21;
        } catch (error) {
          status.value = `Failed to add
            ${friendName.value}: ${error}`;
        }
      }

  </script>

<template>
  <fieldset>
    <legend>Add new friend</legend>
    <label>
      Name:
      <input v-model="friendName" type="text" />
    </label>
    <br />
    <label>
      Age:
      <input v-model="friendAge" type="number" />
    </label>
    <br />
    <button @click="addFriend">Add Friend</button>
    <p>{{ status }}</p>
  </fieldset>

</template>