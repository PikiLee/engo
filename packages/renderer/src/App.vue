<script lang="ts" setup>
import {ref} from 'vue';
import AppTabs from './components/AppTabs.vue';
import EncryptionHome from './components/EncryptionHome.vue';
import TabPane from './components/TabPane.vue';

const activeKey = ref(1);
</script>

<template>
  <AppTabs v-model:active-key="activeKey">
    <TabPane
      :key="1"
      tab="加密"
    >
      <EncryptionHome></EncryptionHome>
    </TabPane>
    <TabPane
      :key="2"
      tab="解密"
    ></TabPane>
  </AppTabs>
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

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  --text-main: #EAEAEA;
  --text-gray: #D1CCCC;
  --text-dark: #696969;
  --bg: #212022;

  --green-light: #95DFA1;

  background-color: var(--bg);
}
</style>
