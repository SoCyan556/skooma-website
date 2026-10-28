<template>
  <main class="page center-page not-found">
    <section>
      <div class="lost-bottle" aria-hidden="true"><img src="/img/spilled.webp" alt="" width="340" height="193" /></div>
      <p class="code">404</p>
      <h1>Nothing here yet</h1>
      <RouterLink to="/" class="button button-ghost"><ArrowLeft :size="17" />Back home</RouterLink>
    </section>
  </main>
</template>

<script setup>
import { ArrowLeft } from 'lucide-vue-next';
</script>
