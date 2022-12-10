<script lang="ts" setup>
import {ref} from 'vue';
import AppTabs from './components/AppTabs.vue';
import EncryptionHome from './components/EncryptionHome.vue';
import TabPane from './components/TabPane.vue';

const activeKey = ref(1);
</script>

<template>
  <AppTabs
    v-model:active-key="activeKey"
  >
    <TabPane
      :key="1"
      tab="加密"
    >
      <EncryptionHome type="en"></EncryptionHome>
    </TabPane>
    <TabPane
      :key="2"
      tab="解密"
    >
      <EncryptionHome type="de"></EncryptionHome>
    </TabPane>
  </AppTabs>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
  max-width: 600px;
  margin: auto;
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
  --green-main: #509638;
  --green-dark: #509638;
  --warning: #A74E4E;

  background-color: var(--bg);
}
</style>
