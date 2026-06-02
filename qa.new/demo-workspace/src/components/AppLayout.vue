<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const isOpen = ref(false);
const router = useRouter();
</script>

<template>
  <div class="app-layout">
    <nav :class="{ open: isOpen }">
      <slot name="sidebar" />
    </nav>
    <main>
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}
</style>
