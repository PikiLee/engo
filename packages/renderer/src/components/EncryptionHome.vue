<template>
  <div class="container">
    <AppModal
      v-model:visible="modalVisible"
      title="选择打开类型"
      cancel
    >
      <div class="modal">
        <BaseButton
          type="success"
          size="md"
          @click="getInputFile"
        >
          文件
        </BaseButton>
        <BaseButton
          type="success"
          size="md"
          @click="getInputDir"
        >
          目录
        </BaseButton>
      </div>
    </AppModal>
    <AppLoading
      :loading="loading"
      @click:button="chooseInputType"
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
import {selectFile, invokeEncrypt, showFile, waitForEnMessage, waitForDeMessage} from '#preload';
import {ref, reactive, computed} from 'vue';
import AppInfo from './AppInfo.vue';
import AppLoading from './AppLoading.vue';
import BaseInput from './BaseInput.vue';
import BaseButton from './BaseButton.vue';
import AppModal from './AppModal.vue';

const props = defineProps<{
  type: 'en' | 'de';
}>();

const loading = ref(false);
const formState = reactive({
  inputPath: '',
  password: '',
  outputPath: '',
});
const finalFilePath = ref('');
const mainButtonText = computed(() => {
  const text = props.type === 'en' ? '加密' : '解密';
  return formState.inputPath ? text : '打开';
});
const info = ref('');
const modalVisible = ref(false);

// input
const chooseInputType = () => {
  if (loading.value) return;
  finalFilePath.value = '';
  if (formState.inputPath) {
    en();
  } else if (props.type === 'en') {
    modalVisible.value = true;
  } else {
    getInputFile();
  }
};

const getInputFile = () => {
  selectFile(
    (_, message: string) => {
      formState.inputPath = message;
      info.value = '已选择' + formState.inputPath;
    },
    ['openFile'],
  );
  modalVisible.value = false;
};
const getInputDir = () => {
  selectFile(
    (_, message: string) => {
      formState.inputPath = message;
      info.value = '已选择' + formState.inputPath;
    },
    ['openDirectory'],
  );
  modalVisible.value = false;
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
    props.type,
    formState.password,
    formState.inputPath,

    formState.outputPath,
  );
};

// wait for message sent from main process
if (props.type === 'en') {
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
} else {
  waitForDeMessage(
    (_, message: string) => {
      info.value = message;
    },
    (_, message: string) => {
      info.value = message;
      loading.value = false;
    },
    (_, message) => {
      info.value = '解密成功';
      loading.value = false;
      formState.inputPath = '';
      formState.password = '';
      formState.outputPath = '';
      finalFilePath.value = message;
    },
  );
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: start;

  .modal {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 7rem;
    gap: 2rem;
  }

  .bottom {
    flex: 1;
    .password {
      margin-top: 1rem;
    }
    .actions {
      min-height: 2rem;
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
