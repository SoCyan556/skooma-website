<template>
  <main class="page center-page">
    <section class="auth-card">
      <LoaderCircle :size="30" class="spin" />
      <h1>Signing in…</h1>
    </section>
  </main>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { LoaderCircle } from 'lucide-vue-next';
import { auth, finishSignIn } from '../lib/auth.js';

const router = useRouter();
onMounted(async () => {
  auth.error = '';
  try { await router.replace(await finishSignIn()); }
  catch (error) { auth.error = error.message; router.replace('/login'); }
});
</script>
