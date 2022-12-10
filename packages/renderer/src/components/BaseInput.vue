<template>
  <div class="wrapper">
    <div class="input-wrapper">
      <p
        v-if="isDir"
        class="file"
        @click="getOutputPath"
      >
        {{ value.length === 0 ? placeholder : value }}
      </p>
      <input
        v-if="isPassword"
        ref="inputEl"
        v-model="value"
        class="input"
        :type="isPassword && showPassword ? 'text' : type"
        :style="{
          width: inputWidth,
        }"
        :placeholder="placeholder"
      />
    </div>
    <div
      v-if="isPassword"
      class="icon"
      @click="() => (showPassword = !showPassword)"
    >
      <EyeOutlined v-if="!showPassword" />
      <EyeInvisibleOutlined v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {EyeOutlined, EyeInvisibleOutlined} from '@ant-design/icons-vue';
import {selectFile} from '#preload';

const props = defineProps<{
  type: 'password' | 'dir';
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

const isPassword = computed(() => {
  return props.type === 'password';
});
const isDir = computed(() => {
  return props.type === 'dir';
});

// type: password
const showPassword = ref(false);

// resize the width of input element as user inputs.
const inputWidth = ref('10rem');
function resizeInput() {
  let width = 10;
  if (props.modelValue) {
    if (showPassword.value) {
      width = props.modelValue.length * 0.9;
    } else {
      width = props.modelValue.length * 0.7;
    }
  } else if (props.placeholder) {
    width = props.placeholder.length * 1.9;
  }
  inputWidth.value = `${width}ch`;
}

const inputEl = ref<HTMLElement | null>(null);
onMounted(() => {
  watch(
    [() => props.modelValue],
    () => {
      resizeInput();
    },
    {immediate: true},
  );

  if (isPassword.value) {
    watch(
      [() => showPassword],
      () => {
        resizeInput();
      },
      {immediate: true},
    );
  }
});

// type: dir
const getOutputPath = () => {
  selectFile((_, message: string) => {
    value.value = message;
  }, ['openDirectory']);
};
</script>

<style scoped lang="scss">
.wrapper {
  background-color: var(--green-dark);
  padding-block: 0.5rem;
  display: grid;
  place-items: center;
  position: relative;

  .input-wrapper {
    width: min-content;
    position: relative;
    color: var(--text-gray);
    font-size: 1rem;

    .file {
      white-space: nowrap;
      cursor: pointer;
    }

    .input {
      font-size: inherit;
      background: none;
      outline: none;
      border: none;
      color: var(--text-gray);

      &::placeholder {
        color: var(--text-gray);
      }
    }
  }

  .icon {
    position: absolute;
    right: 5%;
    top: 50%;
    transform: translateY(-50%);
    font-size: 1.5rem;
    cursor: pointer;
  }
}
</style>
