<script lang="ts" setup>
import {ref} from 'vue';
import EncryptionHome from './components/EncryptionHome.vue';

const activeKey = ref(0);
</script>

<template>
  <a-tabs
    v-model:activeKey="activeKey"
    centered
  >
    <a-tab-pane
      key="0"
      tab="加密"
    >
      <EncryptionHome></EncryptionHome>
    </a-tab-pane>
    <a-tab-pane
      key="1"
      tab="解密"
      force-render
    >
      Content of Tab Pane 2
    </a-tab-pane>
  </a-tabs>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 60px auto;
  max-width: 700px;
}

fieldset {
  margin: 2rem;
  padding: 1rem;
}

.test {
  color: red;
}
</style>
