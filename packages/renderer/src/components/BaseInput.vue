<template>
  <div class="wrapper">
    <div class="input-wrapper">
      <input
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

const props = defineProps<{
  type: 'password' | 'file';
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const isPassword = computed(() => {
  return props.type === 'password';
});
const showPassword = ref(false);
const value = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

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

onMounted(() => {
  watch(
    [() => props.modelValue, showPassword],
    () => {
      resizeInput();
    },
    {immediate: true},
  );
});
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

    .input {
      background: none;
      outline: none;
      border: none;
    color: var(--text-gray);

      &::placeholder {
        color: var(--text-gray)
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
