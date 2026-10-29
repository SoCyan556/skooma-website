<template>
  <header class="site-header" :class="{ solid: scrolled || route.path !== '/' }">
    <div class="header-inner">
      <RouterLink to="/" class="brand" aria-label="Skooma home">
        <img src="/img/bottle.webp" alt="" class="brand-bottle" width="30" height="30" />
        <span>SKOOMA</span>
      </RouterLink>

      <nav class="main-nav" aria-label="Main" ref="navEl" @mouseleave="hovered = null">
        <template v-for="link in links" :key="link.to || link.href">
          <a v-if="link.href" :href="link.href" target="_blank" rel="noopener" class="nav-link" @mouseenter="hovered = link.href">{{ link.label }}</a>
          <RouterLink v-else :to="link.to" class="nav-link" :class="{ active: isActive(link) }" @mouseenter="hovered = link.to">{{ link.label }}</RouterLink>
        </template>
        <span class="nav-indicator" :style="indicator" aria-hidden="true"></span>
      </nav>

      <div class="header-actions">
        <a class="icon-button" :href="config.discordInvite || undefined" :aria-disabled="!config.discordInvite" target="_blank" rel="noopener" aria-label="Discord" data-tip="Discord" @click="!config.discordInvite && $event.preventDefault()">
          <DiscordIcon :size="20" />
        </a>
        <div v-if="auth.user" class="profile" ref="profileEl">
          <button class="profile-button" :aria-expanded="menuOpen" aria-haspopup="menu" @click="menuOpen = !menuOpen">
            <img :src="auth.user.avatar" alt="" width="30" height="30" /><ChevronDown :size="15" class="chevron" />
          </button>
          <Transition name="menu">
            <div v-if="menuOpen" class="profile-menu" role="menu">
              <div class="profile-name">{{ auth.user.name }}</div>
              <RouterLink to="/dashboard" role="menuitem" @click="menuOpen = false"><LayoutDashboard :size="16" />Dashboard</RouterLink>
              <RouterLink to="/characters" role="menuitem" @click="menuOpen = false"><UsersRound :size="16" />Characters</RouterLink>
              <RouterLink to="/account" role="menuitem" @click="menuOpen = false"><Settings :size="16" />Account settings</RouterLink>
              <button role="menuitem" @click="menuOpen = false; signOut()"><LogOut :size="16" />Sign out</button>
            </div>
          </Transition>
        </div>
        <RouterLink v-else to="/login" class="icon-button" aria-label="Sign in" data-tip="Sign in"><CircleUserRound :size="21" :stroke-width="1.6" /></RouterLink>
        <button type="button" class="button button-primary header-download" @click="showDownloadModal"><Download :size="16" />Download</button>
        <button class="icon-button menu-toggle" :aria-expanded="mobileOpen" aria-label="Menu" @click="mobileOpen = !mobileOpen"><X v-if="mobileOpen" :size="20" /><Menu v-else :size="20" /></button>
      </div>
    </div>
    <Transition name="drawer">
      <nav v-if="mobileOpen" class="mobile-nav" aria-label="Mobile">
        <template v-for="link in links" :key="link.to || link.href">
          <a v-if="link.href" :href="link.href" target="_blank" rel="noopener" @click="mobileOpen = false">{{ link.label }}<ChevronRight :size="16" /></a>
          <RouterLink v-else :to="link.to" :class="{ active: isActive(link) }" @click="mobileOpen = false">{{ link.label }}<ChevronRight :size="16" /></RouterLink>
        </template>
        <button type="button" class="button button-primary" @click="mobileOpen = false; showDownloadModal()"><Download :size="16" />Download</button>
      </nav>
    </Transition>
  </header>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ChevronDown, ChevronRight, CircleUserRound, Download, LayoutDashboard, LogOut, Menu, Settings, UsersRound, X } from 'lucide-vue-next';
import DiscordIcon from './DiscordIcon.vue';
import { auth, signOut } from '../lib/auth.js';
import { showDownloadModal } from '../lib/ui.js';
import { config } from '../config.js';

const route = useRoute();
const links = [{ to: '/', label: 'Home' }, { to: '/news', label: 'News' }, { to: '/guide', label: 'Guide' }, { href: config.storeUrl, label: 'Store' }];
const isActive = link => link.to ? (link.to === '/' ? route.path === '/' : route.path.startsWith(link.to)) : false;
const scrolled = ref(false), menuOpen = ref(false), mobileOpen = ref(false), hovered = ref(null);
const navEl = ref(), profileEl = ref(), rects = ref({});

// The underline glides to whichever link is hovered, and rests under the current page.
function measure() {
  if (!navEl.value) return;
  const base = navEl.value.getBoundingClientRect();
  rects.value = Object.fromEntries([...navEl.value.querySelectorAll('.nav-link')].map((el, i) => { const r = el.getBoundingClientRect(); return [links[i].to || links[i].href, { left: r.left - base.left, width: r.width }]; }));
}
const indicator = computed(() => {
  const target = hovered.value ?? links.find(isActive)?.to;
  const rect = target && rects.value[target];
  return rect ? { transform: `translateX(${rect.left + 10}px)`, width: rect.width - 20 + 'px', opacity: 1 } : { opacity: 0 };
});

const onScroll = () => { scrolled.value = scrollY > 24; };
const onClick = event => { if (menuOpen.value && profileEl.value && !profileEl.value.contains(event.target)) menuOpen.value = false; };
const onKey = event => { if (event.key === 'Escape') { menuOpen.value = false; mobileOpen.value = false; } };
onMounted(() => { onScroll(); measure(); document.fonts?.ready.then(measure); addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', measure); addEventListener('click', onClick); addEventListener('keydown', onKey); });
onUnmounted(() => { removeEventListener('scroll', onScroll); removeEventListener('resize', measure); removeEventListener('click', onClick); removeEventListener('keydown', onKey); });
watch(() => route.path, () => { menuOpen.value = false; nextTick(measure); });
</script>
