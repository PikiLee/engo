<template>
  <div>
    <div class="info">{{ info }}</div>
  </div>
</template>

<script setup lang="ts">

defineProps<{
  info: string;
}>();
</script>

<style scoped lang="scss">
.info {
  color: var(--text-main);
  font-size: 1.2rem;
  font-weight: 600;
}


</style>
