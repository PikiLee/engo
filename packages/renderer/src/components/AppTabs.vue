<script lang="ts">
import {watch, ref, type VNode, onMounted, defineComponent, h} from 'vue';
import {gsap} from 'gsap';

interface Tab {
  key: number;
  tab: string;
}

export default defineComponent({
  props: {
    activeKey: {
      type: Number,
      required: true,
    },
  },
  emits: ['update:activeKey'],
  setup(props, {emit, slots}) {
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

    const barEl = ref<HTMLElement | null>(null);

    const relocateBar = () => {
      if (tabContainer.value) {
        const activeTab = tabContainer.value.querySelector(`[data-key="${props.activeKey}"`); 
        if (activeTab) {
          const activeElRect = activeTab.getBoundingClientRect();
          const containerRect = tabContainer.value.getBoundingClientRect();

          const distanceX = activeElRect.x - containerRect.x + activeElRect.width * 0.5;
          const distanceY = activeElRect.y - containerRect.y + activeElRect.height * 1.2;

          gsap.to(barEl.value, {
            left: distanceX,
            top: distanceY,
          });
        }
      }
    };

    onMounted(() => {
      watch(
        () => props.activeKey,
        () => {
          relocateBar();
        },
        {immediate: true},
      );

      window.addEventListener('resize', () => {
        relocateBar();
      });
    });

    return () =>
      h('div', [
        h(
          'header',
          {class: 'head'},
          h('div', {ref: tabContainer, class: 'tabs'}, [
            tabs.value.map(({key, tab}) => {
              const classes = 'tab' + (props.activeKey === key ? ' active' : '');
              return h(
                'div',
                {
                  class: classes,
                  key,
                  'data-key': key,
                  onClick: () => emit('update:activeKey', key),
                },
                tab.split('').reduce((p, c) => p + '    ' + c),
              );
            }),
            h('span', {ref: barEl, class: 'bar'}),
          ]),
        ),
        h(
          'div',
          {class: 'content'},
          slots.default ? slots.default().find(s => s.key === props.activeKey) : '',
        ),
      ]);
  },
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
