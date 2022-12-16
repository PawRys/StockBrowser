import { ref, createApp } from 'vue';
import App from './App.vue';
import './assets/main.css';

const app = createApp(App);
app.provide('GlobalEvents', ref());
app.mount('#app');
