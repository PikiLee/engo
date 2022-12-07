<template>
  <div>
    <header class="head">
      <div class="tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{active: activeKey === tab.key}"
        >
          {{ tab.tab }}
          <span class="bar"></span>
        </div>
      </div>
    </header>
    <div class="content"> <slot /> </div>
  </div>
</template>

<script setup lang="ts">
import {useSlots, ref, type VNode} from 'vue';

defineProps<{
  activeKey: string | number;
}>();

const slots = useSlots();

interface Tab {
  key: string | number;
  tab: string;
}

const tabs = ref<Tab[]>([]);

const parseTabList = (children: VNode[]) => {
  return children
    .map(child => {
      if (child.props) {
        const {key, tab} = child.props;
        return {
          key,
          tab,
        };
      }

      return null;
    })
    .filter(tab => tab);
};

if (slots.default) {
  const parsedTabs = parseTabList(slots.default());
  if (parsedTabs) tabs.value = parsedTabs as Tab[];
}
</script>
<style scoped lang="scss">
.tabs {
  display: flex;
  align-items: center;
  justify-content: space-around;

  font-size: 1rem;
  font-weight: 800;
  color: var(--text-gray);
  cursor: pointer;

  .tab {
    position: relative;
    &.active {
      color: var(--text-main);
      .bar {
        position: absolute;
        bottom: -40%;
        left: 50%;
        transform: translateX(-50%);
        width: 1rem;
        height: 3px;
        background: var(--green-light);
      }
    }
  }
}
</style>
