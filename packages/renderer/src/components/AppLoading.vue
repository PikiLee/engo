<template>
  <div class="container">
    <svg
      ref="svgEl"
      class="svgEl"
      width="100%"
      height="100%"
      viewBox="0 0 259 254"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        ref="outCircleEl"
        class="outCircleEl"
      >
        <circle
          cx="130.595"
          cy="126.341"
          r="71.4326"
          stroke="#8BAA8B"
          stroke-width="6.39695"
        />
        <path
          d="M130.595 54.9084C150.852 55.9746 163.646 60.2392 179.639 74.0993"
          stroke="#1C5C26"
          stroke-width="6.82342"
          stroke-linecap="round"
        />
      </g>
      <g
        ref="mainEl"
        filter="url(#filter0_ddi_4_18)"
        class="mainEl"
      >
        <circle
          cx="130.595"
          cy="126.341"
          r="53.3079"
          fill="#509638"
        />
        <g v-if="loading">
          <rect
            ref="rect1El"
            class="rect1El"
            x="143"
            y="144"
            width="13"
            height="4"
            rx="2"
            fill="#EAEAEA"
          />
          <rect
            ref="rect2El"
            class="rect2El"
            x="124"
            y="144"
            width="13"
            height="4"
            rx="2"
            fill="#EAEAEA"
          />
          <rect
            ref="rect3El"
            class="rect3El"
            x="105"
            y="144"
            width="13"
            height="4"
            rx="2"
            fill="#EAEAEA"
          />
        </g>
      </g>
      <path
        ref="waveEl"
        class="waveEl"
        d="M221.806 86.5917C210.236 50.9882 187.392 39.9374 147.247 26.4341C125.306 20.94 114.473 21.6623 98.3975 31.3449C98.3975 31.3449 77.8294 52.2159 68.8309 58.3545C59.8323 64.493 35.4077 73.0869 37.9788 87.8194C40.5499 102.552 28.9803 114.829 36.6933 134.472C44.4063 154.116 32.8367 157.799 43.1208 161.482C53.4048 165.165 55.9759 179.897 55.9759 179.897C57.6899 180.716 120.788 260.903 163.958 216.729C199.952 179.897 207.142 211.777 215.378 173.759C223.091 138.155 233.375 122.195 221.806 86.5917Z"
        stroke="#95DFA1"
        stroke-opacity="0.69"
        stroke-width="0.426464"
        stroke-linecap="round"
      />
      <defs>
        <filter
          id="filter0_ddi_4_18"
          x="67.2874"
          y="70.0331"
          width="126.616"
          height="126.616"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood
            flood-opacity="0"
            result="BackgroundImageFix"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="3"
            operator="erode"
            in="SourceAlpha"
            result="effect1_dropShadow_4_18"
          />
          <feOffset dy="7" />
          <feGaussianBlur stdDeviation="6.5" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_4_18"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="2" />
          <feGaussianBlur stdDeviation="2" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_4_18"
            result="effect2_dropShadow_4_18"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_4_18"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="-3" />
          <feComposite
            in2="hardAlpha"
            operator="arithmetic"
            k2="-1"
            k3="1"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect3_innerShadow_4_18"
          />
        </filter>
      </defs>
    </svg>
    <p
      ref="textEl"
      class="text"
    >
      <slot />
    </p>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
// import anime from 'animejs/lib/anime.es.js';
import {gsap} from 'gsap';

defineProps<{
  loading: boolean;
}>();

// const svgEl = ref(null);
const mainEl = ref(null);
const waveEl = ref(null);
const outCircleEl = ref(null);
const rect1El = ref(null);
const rect2El = ref(null);
const rect3El = ref(null);
const textEl = ref(null);
onMounted(() => {
  gsap.registerEffect({
    name: 'scale',
    defaults: {duration: 1, scale: 1.2},
    effect: (targets: gsap.TweenTarget, config: gsap.TweenVars) => {
      return gsap.to(targets, {
        duration: config.duration,
        scale: config.scale,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        transformOrigin: 'center center',
      });
    },
  });

  gsap.effects.scale(mainEl.value);
  gsap.effects.scale(textEl.value);
  gsap.effects.scale(outCircleEl.value, {
    scale: 1.6,
  });
  gsap.effects.scale(waveEl.value, {
    scale: 1.8,
  });

  gsap.to(outCircleEl.value, {
    rotate: 360,
    duration: 1,
    repeat: -1,
    ease: 'power4.inOut',
    transformOrigin: 'center center',
  });

  gsap.registerEffect({
    name: 'grow',
    defaults: {duration: 0.5, scaleY: 5, delay: 0},
    effect: (targets: gsap.TweenTarget, config: gsap.TweenVars) => {
      return gsap.to(targets, {
        duration: config.duration,
        scaleY: config.scaleY,
        repeat: -1,
        yoyo: true,
        ease: 'power4.inOut',
        delay: config.delay,
        transformOrigin: 'center bottom',
      });
    },
  });

  gsap.effects.grow(rect1El.value, {
    scaleY: 8,
    delay: 0.2,
    duration: 0.6,
  });

  gsap.effects.grow(rect2El.value, {
    scaleY: 10,
    duration: 0.7,
  });
  gsap.effects.grow(rect3El.value, {
    delay: 0.3,
  });
});
</script>

<style scoped lang="scss">
.container {
  padding-block: 5rem;
  padding-inline: 4rem;
  overflow: visible;
  position: relative;

  .svgEl {
    overflow: visible;
  }

  .text {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-main);
  }
}
</style>
