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
        <RouterLink to="/download">Download</RouterLink>
        <RouterLink to="/store">Store</RouterLink>
      </nav>
      <p>Not affiliated with Bethesda Softworks. Skyrim is a trademark of ZeniMax Media.</p>
    </div>
  </footer>
</template>

<script setup>
import SiteHeader from './components/SiteHeader.vue';
</script>
