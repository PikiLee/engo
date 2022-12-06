<template>
  <div class="container">
    <a-row :gutter="16">
      <!-- input -->
      <a-col :span="24"><a-typography-title :level="4">源文件或目录</a-typography-title></a-col>
      <a-col :span="24">
        <p class="text-center">
          {{ inputPath }}
        </p>
      </a-col>
      <a-col :span="12">
        <a-button @click="getInputFile('file')">选择文件</a-button>
      </a-col>
      <a-col :span="12">
        <a-button @click="getInputFile('dir')">选择目录</a-button>
      </a-col>

      <!-- output -->
      <a-col :span="24"><a-typography-title :level="4">目标目录</a-typography-title></a-col>
      <a-col :span="24">
        <p class="text-center">
          {{ outputPath }}
        </p>
      </a-col>
      <a-col :span="24">
        <a-button @click="getOutputPath">选择目录</a-button>
      </a-col>
    </a-row>
    <a-divider />
    <a-typography-paragraph
      data-test="msg"
      strong
    >
      {{ msg }}
    </a-typography-paragraph>
    <a-button
      type="primary"
      :loading="loading"
      data-test="startBtn"
      @click="en"
    >
      开始加密
    </a-button>
    <p>{{ versions }}</p>
    <AppLoading></AppLoading>
  </div>
</template>

<script setup lang="ts">
import {versions, selectFile, invokeEncrypt} from '#preload';
import {ref} from 'vue';
import type {Event} from 'electron';
import AppLoading from './AppLoading.vue';

const inputPath = ref('');
const outputPath = ref('');
const msg = ref('');
const loading = ref(false);

const getInputFile = (type: 'file' | 'dir') => {
  selectFile(type, (event: Event, filePath: string) => {
    inputPath.value = filePath;
  });
};

const getOutputPath = () => {
  selectFile('dir', (event: Event, filePath: string) => {
    outputPath.value = filePath;
  });
};

const en = () => {
  if (!inputPath.value || !outputPath.value) {
    msg.value = '路径不能为空';
  }
  msg.value = '开始加密';
  loading.value = true;

  invokeEncrypt(inputPath.value, outputPath.value, (_, message: string) => {
    msg.value = message;
    loading.value = false;
  });
};
</script>

<style lang="scss" scoped>
.container {
  padding: 1rem;
}

.text-center {
  text-align: center;
}
</style>
