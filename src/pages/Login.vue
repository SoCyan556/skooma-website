<template>
  <main class="page center-page">
    <div class="page-backdrop" style="--art: url('/img/snow-ruins.webp')"></div>
    <section class="auth-card" v-reveal>
      <img src="/img/bottle.webp" alt="" width="64" height="64" class="auth-bottle" />
      <h1>{{ auth.user ? 'Signed in' : 'Sign in' }}</h1>
      <template v-if="auth.user">
        <div class="auth-user"><img :src="auth.user.avatar" alt="" width="40" height="40" /><span>{{ auth.user.name }}</span></div>
        <RouterLink to="/" class="button button-primary button-block">Continue<ArrowRight :size="17" /></RouterLink>
        <button class="button button-ghost button-block" @click="signOut">Sign out</button>
      </template>
      <template v-else>
        <p>Use the same Discord account as the launcher.</p>
        <button class="button button-discord button-block" @click="signIn(returnTo)"><DiscordIcon :size="20" />Continue with Discord</button>
        <p v-if="auth.error" class="auth-error" role="alert">{{ auth.error }}</p>
      </template>
    </section>
  </main>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowRight } from 'lucide-vue-next';
import DiscordIcon from '../components/DiscordIcon.vue';
import { auth, signIn, signOut } from '../lib/auth.js';

const route = useRoute();
const returnTo = computed(() => typeof route.query.next === 'string' && route.query.next.startsWith('/') && !route.query.next.startsWith('//') ? route.query.next : '/');
</script>
