<template>
  <button
    class="button"
    :class="classes"
  >
    <slot> </slot>
  </button>
</template>

<script setup lang="ts">
import {computed} from 'vue';

const props = defineProps<{
  type: 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
}>();

const classes = computed(() => {
  let size = props.size ?? 'sm';
  return {
    [`size-${size}`]: true,
    [props.type]: true,
  };
});
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

  &.size-md {
    font-size: 1.3rem;
    line-height: 1.3rem;
    padding: 0.3rem 1.5rem;
  }
  &.size-lg {
    font-size: 1.5rem;
    line-height: 1.5rem;
    padding: 0.3rem 1.8rem;
  }
}
</style>
