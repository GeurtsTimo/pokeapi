import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js');
    });
}

const app = createApp(App)

app.use(router)

app.mount('#app')
