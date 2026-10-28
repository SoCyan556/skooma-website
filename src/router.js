import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home, meta: { title: 'Skooma' } },
    { path: '/download', component: () => import('./pages/Download.vue'), meta: { title: 'Download' } },
    { path: '/news', component: () => import('./pages/News.vue'), meta: { title: 'News' } },
    { path: '/guide/:section?/:article?', component: () => import('./pages/Guide.vue'), meta: { title: 'Guide' } },
    { path: '/login', component: () => import('./pages/Login.vue'), meta: { title: 'Sign in' } },
    { path: '/auth/callback', component: () => import('./pages/AuthCallback.vue'), meta: { title: 'Signing in' } },
    // Store and account pages aren't built yet; they show the 404 page.
    { path: '/:path(.*)*', component: () => import('./pages/NotFound.vue'), meta: { title: 'Not found' } },
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved;
    if (to.path.startsWith('/guide') && from.path.startsWith('/guide')) return { top: 0, behavior: 'smooth' };
    return { top: 0 };
  },
});

router.afterEach(to => { document.title = to.meta.title === 'Skooma' ? 'Skooma' : `${to.meta.title} · Skooma`; });
