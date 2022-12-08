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
      <BaseButton
        v-if="finalFilePath"
        type="success"
        @click="showFile(finalFilePath)"
      >
        打开文件位置
      </BaseButton>
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
import {selectFile, invokeEncrypt, showFile} from '#preload';
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
const finalFilePath = ref('');
const mainButtonText = computed(() => {
  return formState.inputPath ? '加密' : '打开';
});
const info = ref('');

// input file
const getInputFile = () => {
  if (loading.value) return;
  finalFilePath.value = '';
  if (formState.inputPath) {
    en();
  } else {
    selectFile(['dir', 'file'], (event: Event, filePath: string) => {
      formState.inputPath = filePath;
      info.value = '已选择' + filePath;
    });
  }
};

const clearInputPath = () => {
  formState.inputPath = '';
  info.value = '选择已取消';
};

const en = () => {
  if (!formState.inputPath) {
    info.value = '路径不能为空';
    return;
  }
  if (!formState.password) {
    info.value = '请输入密码';
    return;
  }
  loading.value = true;
  finalFilePath.value = '';

  const options = formState.outputPath ? {outputDir: formState.outputPath} : {};

  invokeEncrypt(
    formState.password,
    formState.inputPath,
    (_, message: string) => {
      info.value = message;
    },
    (
      _,
      message: {
        code: number;
        info: string;
        outputPath?: string;
      },
    ) => {
      info.value = message.info;
      loading.value = false;
      if (message.code === -1) {
        formState.inputPath = '';
        formState.password = '';
        formState.outputPath = '';
        console.log(message.outputPath);
        finalFilePath.value = message.outputPath ?? '';
      }
    },

    options,
  );
};
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
