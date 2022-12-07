<template>
  <div>
    <div class="info">{{ info }}</div>
    <div class="actions">
      <BaseButton type="warning">取消</BaseButton>
      <BaseButton type="success">打开文件位置</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import BaseButton from './BaseButton.vue';

const info = ref('已打开嘀嘀嘀.txt');
</script>

<style scoped lang="scss">
.info {
    color: var(--text-main);
    font-size: 1.2rem;
    font-weight: 600;
}

.actions {
    margin-top: 0.8rem;
    display: grid;
    place-items: center;
}
</style>
