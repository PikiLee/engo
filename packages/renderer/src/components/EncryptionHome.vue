<template>
  <div class="container">
    <a-row :gutter="16">
      <a-col :span="6">输入文件或目录</a-col>
      <a-col :span="12">c:/toot/toto</a-col>
      <a-col :span="6">
        <a-button>选择目录或文件</a-button>
      </a-col>
      <a-col :span="6">输出目录</a-col>
      <a-col :span="12">c:/toot/toto</a-col>
      <a-col :span="6">
        <a-button>选择目录</a-button>
      </a-col>
    </a-row>
    <a-divider />
    <a-button type="primary">开始加密</a-button>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.container {
    padding: 1rem;
}
</style>
