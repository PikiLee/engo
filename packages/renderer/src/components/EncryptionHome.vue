<template>
  <div class="container">
    <AppLoading
      :loading="loading"
      @click="getInputFile"
    >
      {{ mainButtonText }}
    </AppLoading>
    <AppInfo :info="info" />
    <div class="actions">
      <BaseButton
        v-if="formState.inputPath"
        type="warning"
        @click="clearInputPath"
      >
        取消
      </BaseButton>
      <BaseButton type="success">打开文件位置</BaseButton>
    </div>
    <div class="password">
      <BaseInput
        v-model="formState.password"
        type="password"
        placeholder="输入密码"
      ></BaseInput>
    </div>
    <div class="password">
      <BaseInput
        v-model="formState.outputPath"
        type="dir"
        placeholder="选择输出目录"
      ></BaseInput>
    </div>
  </div>
</template>

<script setup lang="ts">
import {selectFile} from '#preload';
import {ref, reactive, computed} from 'vue';
import AppInfo from './AppInfo.vue';
// import type {Event} from 'electron';
import AppLoading from './AppLoading.vue';
import BaseInput from './BaseInput.vue';
import BaseButton from './BaseButton.vue';

// const inputPath = ref('');
// const outputPath = ref('');
// const msg = ref('');
const loading = ref(false);
const formState = reactive({
  inputPath: '',
  password: '',
  outputPath: '',
});
const mainButtonText = computed(() => {
  return formState.inputPath ? '加密' : '打开';
});
const info = ref('');

// input file
const getInputFile = (type: 'file' | 'dir') => {
  selectFile(type, (event: Event, filePath: string) => {
    formState.inputPath = filePath;
    info.value = '已选择' + filePath;
  });
};

const clearInputPath = () => {
  formState.inputPath = '';
  info.value = '选择已取消';
};

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
.actions {
  margin-top: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}
</style>
