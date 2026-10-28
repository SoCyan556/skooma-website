import { createApp } from 'vue';
import '@fontsource-variable/inter';
import '@fontsource/cinzel/400.css';
import '@fontsource/cinzel/600.css';
import './style.css';
import App from './App.vue';
import { router } from './router.js';
import { reveal } from './lib/reveal.js';

const app = createApp(App).use(router).directive('reveal', reveal);
// Mount once the first route resolves, so the header doesn't flash Home as active on deep links.
router.isReady().then(() => app.mount('#app'));
