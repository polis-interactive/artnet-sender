import { createApp } from 'vue';
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Select from 'primevue/select';

import 'primeicons/primeicons.css';
import './assets/base.css';
import './assets/tailwind.css';

import App from './App.vue';

const pinia = createPinia()
const app = createApp(App);
app.use(pinia)
app.use(PrimeVue, {
  theme: 'none'
});
app.component('Select', Select);
app.mount('#app')