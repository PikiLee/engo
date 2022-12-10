<template>
  <div
    v-if="value"
    class="container"
  >
    <div class="title">{{ title }}</div>
    <div class="contents">
      <slot />
    </div>
    <div
      v-if="cancel || ok"
      class="actions"
    >
      <BaseButton
        v-if="cancel"
        type="warning"
        @click="handleCancel"
      >
        取消
      </BaseButton>
      <BaseButton
        v-if="ok"
        type="success"
        @click="handleOk"
      >
        确定
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';

const props = defineProps<{
  title: string;
  visible: boolean;
  cancel?: boolean;
  ok?: boolean;
}>();

const value = computed({
  get() {
    return props.visible;
  },
  set(value) {
    emit('update:visible', value);
  },
});

const emit = defineEmits(['update:visible', 'ok', 'cancel']);

const handleCancel = () => {
  value.value = false;
};
const handleOk = () => {
  value.value = false;
  emit('ok');
};
</script>

<style scoped lang="scss">
.container {
  position: fixed;
  width: 80%;
  left: 50%;
  top: 12%;
  transform: translate(-50%, 50%);
  background-color: var(--bg);
  z-index: 100;
  border: 1px solid var(--text-main);
  border-radius: 0.3rem;

  .title {
    padding-block: 0.7rem;
    color: var(--text-main);
    border-bottom: 1px solid var(--text-dark);
  }

  .contents {
    padding: 1rem;
  }

  .actions {
    border-top: 1px solid var(--text-dark);
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 1rem;
    padding: 0.5rem 2rem;
  }
}
</style>
