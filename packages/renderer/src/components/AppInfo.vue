<template>
  <div class="container">
    <div class="info">{{ info }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  info: string;
}>();
</script>

<style scoped lang="scss">
.container {
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  .info {
    color: var(--text-main);
    font-size: 1.2rem;
    font-weight: 600;
    line-height: 1.2rem;
  }
}
</style>
