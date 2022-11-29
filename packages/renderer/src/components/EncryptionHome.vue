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
      <!-- <a-col :span="6">目标目录</a-col>
      <a-col :span="12">c:/toot/toto</a-col>
      <a-col :span="6">
        <a-button>选择目录</a-button>
      </a-col> -->
    </a-row>
    <a-divider />
    <a-button type="primary">开始加密</a-button>
    <p>{{ versions }}</p>
  </div>
</template>

<script setup lang="ts">
import {versions, selectFile} from '#preload';
import {ref} from 'vue';
import type {Event} from 'electron';

const inputPath = ref('');
const outputPath = ref('');

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
</script>

<style lang="scss" scoped>
.container {
  padding: 1rem;
}

.text-center {
  text-align: center;
}
</style>
