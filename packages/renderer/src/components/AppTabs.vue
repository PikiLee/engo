<template>
  <div>
    <header class="head">
      <div
        ref="tabContainer"
        class="tabs"
      >
        <div
          v-for="tab in tabs"
          ref="tabEls"
          :key="tab.key"
          :data-key="tab.key"
          class="tab"
          :class="{active: activeKey === tab.key}"
          @click="() => $emit('update:activeKey', tab.key)"
        >
          {{ tab.tab.split('').reduce((p, c) => p + '&nbsp;&nbsp;&nbsp;' + c) }}
        </div>

        <span
          ref="barEl"
          class="bar"
        ></span>
      </div>
    </header>
    <div class="content"> <slot /> </div>
  </div>
</template>

<script setup lang="ts">
import {useSlots, watch, ref, type VNode, onMounted} from 'vue';
import {gsap} from 'gsap';

const props = defineProps<{
  activeKey: string | number;
}>();

defineEmits(['update:activeKey']);

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

// animation
const tabContainer = ref<HTMLElement | null>(null);
const tabEls = ref<HTMLElement[] | null>(null);
const barEl = ref<HTMLElement | null>(null);
onMounted(() => {
  watch(
    () => props.activeKey,
    newValue => {
      if (tabEls.value && barEl.value && tabContainer.value) {
        const activeEl = tabEls.value.find(tabEl => {
          return tabEl.dataset.key === String(newValue);
        });

        if (activeEl) {
          const activeElRect = activeEl.getBoundingClientRect();

          const containerRect = tabContainer.value.getBoundingClientRect();

          const distanceX = activeElRect.x - containerRect.x + activeElRect.width * 0.5;
          const distanceY = activeElRect.y - containerRect.y + activeElRect.height * 1.2;

          gsap.to(barEl.value, {
            left: distanceX,
            top: distanceY,
          });
        }
      }
    },
    {immediate: true},
  );
});
</script>
<style scoped lang="scss">
.head {
  padding-block: 2rem;
  .tabs {
    display: flex;
    align-items: center;
    justify-content: space-around;

    font-size: 1rem;
    font-weight: 800;
    color: var(--text-dark);
    cursor: pointer;
    position: relative;
    .tab {
      &.active {
        color: var(--text-main);
      }
    }
    .bar {
      position: absolute;
      left: 0;
      top: 0;
      transform: translateX(-50%);
      width: 1.6rem;
      height: 3px;
      background: var(--green-light);
    }
  }
}
</style>
