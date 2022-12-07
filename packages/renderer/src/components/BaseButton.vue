<template>
  <button
    class="button"
    :class="{warning: type === 'warning', success: type === 'success'}"
  >
    <slot> </slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  type: 'warning' | 'success';
}>();
</script>

<style scoped lang="scss">
.button {
  color: var(--text-main);
  padding-inline: 1.2rem;
  padding-block: 0.3rem;
  width: max-content;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;

  font-size: 1rem;
  line-height: 1rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  &.warning {
    background-color: var(--warning);
  }
  &.success {
    background-color: var(--green-main);
  }
}
</style>
