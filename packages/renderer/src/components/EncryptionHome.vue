<template>
  <div class="container">
    <AppLoading :loading="loading">打 开</AppLoading>
    <AppInfo />
    <div class="password">
      <BaseInput
        v-model="password"
        type="password"
        placeholder="输入密码"
      ></BaseInput>
    </div>
    <div class="password">
      <BaseInput
        v-model="file"
        type="dir"
        placeholder="选择输出目录"
      ></BaseInput>
    </div>
  </div>
</template>

<script setup lang="ts">
// import {versions, selectFile, invokeEncrypt} from '#preload';
import {ref} from 'vue';
import AppInfo from './AppInfo.vue';
// import type {Event} from 'electron';
import AppLoading from './AppLoading.vue';
import BaseInput from './BaseInput.vue';

// const inputPath = ref('');
// const outputPath = ref('');
// const msg = ref('');
const loading = ref(false);
const password = ref('');
const file = ref('');

// const getInputFile = (type: 'file' | 'dir') => {
//   selectFile(type, (event: Event, filePath: string) => {
//     inputPath.value = filePath;
//   });
// };

// const getOutputPath = () => {
//   selectFile('dir', (event: Event, filePath: string) => {
//     outputPath.value = filePath;
//   });
// };

// const en = () => {
//   if (!inputPath.value || !outputPath.value) {
//     msg.value = '路径不能为空';
//   }
//   msg.value = '开始加密';
//   loading.value = true;

//   invokeEncrypt(inputPath.value, outputPath.value, (_, message: string) => {
//     msg.value = message;
//     loading.value = false;
//   });
// };
</script>

<style lang="scss" scoped>
.text-center {
  text-align: center;
}

.password {
  margin-top: 1rem;
}
</style>
