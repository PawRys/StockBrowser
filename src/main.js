import { ref, createApp } from 'vue';
import { PromiseDialog } from 'vue3-promise-dialog';
import App from './App.vue';
import './assets/main.css';

const app = createApp(App);
app.provide('GlobalEvents', ref());
app.use(PromiseDialog);
app.mount('#app');
