<template>
  <SiteHeader />
  <RouterView v-slot="{ Component, route }">
    <Transition name="page" mode="out-in">
      <component :is="Component" :key="route.path.split('/')[1] || 'home'" />
    </Transition>
  </RouterView>
  <footer class="site-footer">
    <div class="footer-inner">
      <RouterLink to="/" class="footer-brand"><img src="/img/bottle.webp" alt="" width="22" height="22" />SKOOMA</RouterLink>
      <nav aria-label="Footer">
        <RouterLink to="/news">News</RouterLink>
        <RouterLink to="/guide">Guide</RouterLink>
        <button type="button" class="footer-link" @click="showDownloadModal">Download</button>
        <RouterLink to="/store">Store</RouterLink>
      </nav>
      <p>Not affiliated with Bethesda Softworks. Skyrim is a trademark of ZeniMax Media.</p>
    </div>
  </footer>
  <DownloadModal />
</template>

<script setup>
import SiteHeader from './components/SiteHeader.vue';
import DownloadModal from './components/DownloadModal.vue';
import { showDownloadModal } from './lib/ui.js';
</script>
