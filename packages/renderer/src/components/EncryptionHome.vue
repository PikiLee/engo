<template>
  <div class="container">
    <AppLoading
      :loading="loading"
      @click:button="getInputFile"
    >
      {{ mainButtonText }}
    </AppLoading>
    <div class="bottom">
      <AppInfo :info="info" />
      <div class="actions">
        <BaseButton
          v-if="formState.inputPath && !loading"
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
  </div>
</template>

<script setup lang="ts">
import {selectFile, invokeEncrypt, showFile, waitForEnMessage} from '#preload';
import {ref, reactive, computed} from 'vue';
import AppInfo from './AppInfo.vue';
import AppLoading from './AppLoading.vue';
import BaseInput from './BaseInput.vue';
import BaseButton from './BaseButton.vue';

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
const getInputFile = async () => {
  if (loading.value) return;
  finalFilePath.value = '';
  if (formState.inputPath) {
    en();
  } else {
    const path = await selectFile([]);
    formState.inputPath = String(path);
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

  invokeEncrypt(
    formState.password,
    formState.inputPath,

    formState.outputPath,
  );
};

// wait for message sent from main process
waitForEnMessage(
  (_, message: string) => {
    info.value = message;
  },
  (_, message: string) => {
    info.value = message;
    loading.value = false;
  },
  (_, message) => {
    info.value = '加密成功';
    loading.value = false;
    formState.inputPath = '';
    formState.password = '';
    formState.outputPath = '';
    finalFilePath.value = message;
  },
);
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: start;

  .bottom {
    flex: 1;
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
  }
}
.text-center {
  text-align: center;
}
</style>
