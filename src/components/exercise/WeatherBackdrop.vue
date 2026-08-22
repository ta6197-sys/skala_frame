<script setup>
import { computed } from 'vue'
import { getWeatherKind, isNightIcon } from '@/data/weatherKind'

// 과제 7(나만의 추가). 지금 보고 있는 도시의 날씨를 화면 전체 배경으로 표현한다.
//
// 슬라이드 p.6 의 "데이터 → 조건/바인딩 → 화면 변화까지 이어지게" 와
// "색상을 하드코딩하지 않고 :class / :style 로 동적 표현" 지침을 가장 크게 적용한 컴포넌트다.
// API 가 주는 icon 코드 하나만 받아서 6종 × 낮밤 = 12가지 배경으로 갈린다. 추가 통신은 0회다.
//
// ===== 1차 버전을 갈아엎은 이유 (중요) =====
// 처음에는 입자를 전부 흰색 계열로 만들었다. 어두운 하늘 위에 비가 내리는 그림을 떠올리고 만든 색이다.
// 그런데 이 앱은 배경이 흰색인 밝은 테마다. 흰 배경 위의 흰 빗줄기라서 아무것도 안 보였다.
// 밤(bd-night)일 때만 괜찮아 보였는데, 그건 밤에만 어두운 막을 한 겹 깔아서 그때만 대비가 생긴 것이었다.
// 즉 애니메이션은 처음부터 돌고 있었고 문제는 전부 "대비" 였다.
//
// 그래서 두 가지를 바꿨다.
//   1) 입자 색을 배경보다 "진하게" 잡았다. 밝은 바탕에서는 흰 것이 아니라 어두운 것이 보인다.
//   2) 하늘 톤(bd-tint)을 훨씬 진하게 깔아서, 입자가 놓일 무대를 만들었다.
// 더불어 움직임의 크기도 키웠다. 맑음은 20초에 22px 이동이라 정지한 것과 구분되지 않았다.
const props = defineProps({
  icon: {
    type: String,
    default: null,
  },
})

const kind = computed(() => getWeatherKind(props.icon))
const isNight = computed(() => isNightIcon(props.icon))

// 종류별 입자 개수. 비는 촘촘해야 비로 보이고, 구름은 몇 덩어리만 있어야 구름으로 보인다.
const PARTICLE_COUNT = {
  rain: 110,
  storm: 130,
  snow: 60,
  cloud: 9,
  fog: 7,
  clear: 16,
  unknown: 0,
}

// [min, max) 사이 실수. 입자마다 다른 위치·속도를 주려고 쓴다.
// 전부 같은 값이면 줄 맞춰 떨어져서 비가 아니라 창살처럼 보인다.
const rand = (min, max) => Math.random() * (max - min) + min

// 입자 하나의 인라인 스타일을 만든다. 종류마다 필요한 값이 달라서 갈라 뒀다.
// CSS 변수(--drift 등)를 style 로 내려보내면 keyframes 안에서 그 값을 쓸 수 있다.
// 입자 110개마다 keyframes 를 따로 만들 수는 없으니, 애니메이션은 하나만 두고 값만 개별로 주입하는 방식이다.
const makeParticle = (type) => {
  if (type === 'rain' || type === 'storm') {
    const heavy = type === 'storm'
    return {
      // 비스듬히 떨어지므로 오른쪽에서 시작해 왼쪽으로 흐른다. 왼쪽 끝이 비지 않도록 범위를 넓게 잡는다.
      left: `${rand(-10, 120)}%`,
      width: `${rand(1.4, 2.8)}px`,
      height: `${rand(22, 56)}px`,
      // 음수 delay : 화면에 들어온 순간 이미 떨어지는 중이게 만든다.
      // 0 부터 시작하면 처음 1초 동안 화면 위쪽이 텅 비어서 "이제 비가 시작됩니다" 처럼 보인다.
      animationDelay: `${-rand(0, 2)}s`,
      animationDuration: `${heavy ? rand(0.32, 0.6) : rand(0.42, 0.85)}s`,
      opacity: rand(0.4, 0.85),
    }
  }

  if (type === 'snow') {
    return {
      left: `${rand(-4, 104)}%`,
      width: `${rand(5, 13)}px`,
      height: `${rand(5, 13)}px`,
      animationDelay: `${-rand(0, 12)}s`,
      animationDuration: `${rand(6, 13)}s`,
      opacity: rand(0.55, 1),
      // 눈은 똑바로 안 떨어진다. 좌우로 밀리는 거리를 입자마다 다르게 준다.
      '--drift': `${rand(-140, 140)}px`,
    }
  }

  if (type === 'cloud') {
    return {
      top: `${rand(-8, 78)}%`,
      width: `${rand(260, 560)}px`,
      height: `${rand(120, 240)}px`,
      animationDelay: `${-rand(0, 45)}s`,
      // 1차 버전은 55~120초라 화면을 한참 봐야 움직이는 걸 알 수 있었다. 절반 이하로 줄였다.
      animationDuration: `${rand(22, 48)}s`,
      opacity: rand(0.3, 0.62),
    }
  }

  if (type === 'fog') {
    return {
      top: `${rand(-5, 92)}%`,
      height: `${rand(70, 190)}px`,
      animationDelay: `${-rand(0, 30)}s`,
      animationDuration: `${rand(16, 34)}s`,
      opacity: rand(0.3, 0.6),
    }
  }

  // clear : 햇빛 속을 떠다니는 입자.
  // 1차 버전은 22px 만 오르내려서 정지한 것과 구분이 안 됐다. 이동 거리를 입자마다 다르게, 크게 준다.
  return {
    left: `${rand(0, 100)}%`,
    top: `${rand(0, 100)}%`,
    width: `${rand(7, 18)}px`,
    height: `${rand(7, 18)}px`,
    animationDelay: `${-rand(0, 12)}s`,
    animationDuration: `${rand(6, 14)}s`,
    '--op': rand(0.35, 0.8),
    '--rise': `${-rand(90, 260)}px`,
    '--sway': `${rand(-70, 70)}px`,
  }
}

// computed 라서 kind 가 바뀔 때만 다시 만들어진다.
// 도시를 옮기면(비 → 맑음) 새로 뽑히고, 온도가 갱신되는 정도로는 다시 계산되지 않는다.
const particles = computed(() =>
  Array.from({ length: PARTICLE_COUNT[kind.value] ?? 0 }, () => makeParticle(kind.value)),
)

// 입자 모양이 종류마다 달라서 클래스도 갈라 준다. 비/뇌우는 같은 빗줄기를 쓴다.
const particleClass = computed(() => (kind.value === 'storm' ? 'p-rain' : `p-${kind.value}`))

// 맑은 낮에만 해를 그린다. 밤의 맑음은 해가 아니라 별이라 입자 쪽에서 처리한다.
const showSun = computed(() => kind.value === 'clear' && !isNight.value)
</script>

<template>
  <!-- unknown(폴백 목업 데이터처럼 icon 이 없는 경우) 이면 아예 그리지 않는다 -->
  <div
    v-if="kind !== 'unknown'"
    class="backdrop"
    :class="[`bd-${kind}`, { 'bd-night': isNight }]"
    aria-hidden="true"
  >
    <!-- 1. 하늘 톤 : 날씨별 그라디언트. 입자가 놓일 무대이자, 날씨를 색으로 알리는 층이다 -->
    <div class="bd-tint"></div>

    <!-- 2. 해 : 맑은 낮에만. 빛살이 아주 느리게 돌고 크기가 숨쉬듯 변한다 -->
    <div v-if="showSun" class="bd-sun">
      <div class="bd-sun-rays"></div>
      <div class="bd-sun-core"></div>
    </div>

    <!-- 3. 입자 : v-for 로 만들고 위치·속도·투명도·크기를 :style 로 하나씩 다르게 물린다 -->
    <span
      v-for="(particle, index) in particles"
      :key="index"
      class="bd-particle"
      :class="particleClass"
      :style="particle"
    ></span>

    <!-- 4. 뇌우일 때만 번개. 입자가 아니라 화면 전체가 짧게 번쩍인다 -->
    <div v-if="kind === 'storm'" class="bd-flash"></div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  /* 배경이 클릭을 가로채면 그 아래 버튼이 안 눌린다 */
  pointer-events: none;
}

/* ===== 1. 하늘 톤 =====
   1차 버전은 0.16~0.28 이라 화면이 거의 흰색 그대로였고, 그 위에 흰 입자를 얹으니 아무것도 안 보였다.
   진하게 깔아서 입자가 놓일 바탕을 만든다. 본문 카드는 z-index 1 에 불투명하게 있어서 글자 가독성은 그대로다. */
.bd-tint {
  position: absolute;
  inset: 0;
}
.bd-clear .bd-tint {
  background: linear-gradient(180deg, rgba(255, 176, 32, 0.42) 0%, rgba(255, 224, 150, 0.14) 65%);
}
.bd-cloud .bd-tint {
  background: linear-gradient(180deg, rgba(88, 106, 133, 0.5) 0%, rgba(120, 138, 165, 0.16) 75%);
}
.bd-rain .bd-tint {
  background: linear-gradient(180deg, rgba(32, 74, 140, 0.55) 0%, rgba(60, 110, 180, 0.18) 75%);
}
.bd-storm .bd-tint {
  background: linear-gradient(180deg, rgba(24, 33, 66, 0.68) 0%, rgba(48, 62, 108, 0.24) 75%);
}
.bd-snow .bd-tint {
  background: linear-gradient(180deg, rgba(96, 140, 178, 0.45) 0%, rgba(150, 190, 220, 0.16) 75%);
}
.bd-fog .bd-tint {
  background: linear-gradient(180deg, rgba(108, 118, 132, 0.5) 0%, rgba(140, 150, 164, 0.3) 100%);
}
/* 밤이면 같은 날씨라도 한 겹 어둡게. 색을 새로 정의하지 않고 위에 남색을 덧씌운다 */
.bd-night .bd-tint {
  box-shadow: inset 0 0 0 100vmax rgba(12, 20, 44, 0.4);
}

/* ===== 2. 해 (맑은 낮) ===== */
.bd-sun {
  position: absolute;
  top: -120px;
  right: -120px;
  width: 460px;
  height: 460px;
}
.bd-sun-core {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle,
    rgba(255, 244, 200, 0.95) 0%,
    rgba(255, 196, 74, 0.55) 32%,
    rgba(255, 176, 32, 0) 68%
  );
  animation: bd-breathe 7s ease-in-out infinite;
}
.bd-sun-rays {
  position: absolute;
  inset: -60px;
  background: repeating-conic-gradient(
    from 0deg,
    rgba(255, 208, 100, 0.32) 0deg 7deg,
    rgba(255, 208, 100, 0) 7deg 20deg
  );
  border-radius: 50%;
  /* 가장자리를 흐리게 해서 원판이 아니라 빛살로 보이게 한다 */
  mask-image: radial-gradient(circle, #000 20%, transparent 72%);
  animation: bd-spin 44s linear infinite;
}

/* ===== 3. 입자 ===== */
.bd-particle {
  position: absolute;
  display: block;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  /* GPU 합성으로 넘겨서 100개가 넘어가도 버벅이지 않게 한다 */
  will-change: transform;
}

/* 비 · 뇌우 : 비스듬히 떨어지는 빗줄기.
   1차 버전은 수직이라 정지한 창살처럼 보였다. 기울이면 "떨어지는 중" 이라는 게 한눈에 읽힌다.
   색도 흰색에서 진한 남청색으로 바꿨다. 밝은 바탕에서는 어두운 것이 보인다. */
.p-rain {
  top: 0;
  background: linear-gradient(180deg, rgba(30, 64, 124, 0) 0%, rgba(24, 56, 112, 0.95) 100%);
  border-radius: var(--radius-pill);
  animation-name: bd-fall;
}
/* 밤에는 바탕이 어두우니 반대로 밝은 색이 보인다 */
.bd-night .p-rain {
  background: linear-gradient(180deg, rgba(198, 224, 255, 0) 0%, rgba(214, 234, 255, 0.95) 100%);
}

/* 눈 : 동그랗게, 느리게, 좌우로 크게 밀리면서.
   흰 눈이 흰 바탕에 묻히지 않도록 테두리 그림자를 준다. */
.p-snow {
  top: 0;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow:
    0 0 0 1px rgba(70, 110, 150, 0.45),
    0 0 8px rgba(120, 165, 205, 0.75);
  animation-name: bd-snowfall;
}
.bd-night .p-snow {
  box-shadow: 0 0 10px rgba(210, 232, 255, 0.9);
}

/* 구름 : 흐릿한 큰 덩어리가 가로로 흐른다. 밝은 바탕에서 보이도록 회청색으로. */
.p-cloud {
  left: 0;
  background: radial-gradient(closest-side, rgba(72, 92, 122, 0.85), rgba(72, 92, 122, 0));
  animation-name: bd-drift;
}
.bd-night .p-cloud {
  background: radial-gradient(closest-side, rgba(188, 206, 236, 0.8), rgba(188, 206, 236, 0));
}

/* 안개 : 옆으로 긴 띠가 흐르면서 짙어졌다 옅어진다 */
.p-fog {
  left: 0;
  width: 70%;
  background: linear-gradient(
    90deg,
    rgba(236, 240, 246, 0) 0%,
    rgba(246, 249, 252, 0.98) 50%,
    rgba(236, 240, 246, 0) 100%
  );
  filter: blur(18px);
  animation-name: bd-fogdrift;
}
.bd-night .p-fog {
  background: linear-gradient(
    90deg,
    rgba(150, 165, 190, 0) 0%,
    rgba(180, 196, 220, 0.9) 50%,
    rgba(150, 165, 190, 0) 100%
  );
}

/* 맑음 : 햇빛 속을 크게 떠다니는 입자 */
.p-clear {
  background: radial-gradient(circle, rgba(255, 250, 224, 0.98) 0%, rgba(255, 198, 82, 0.5) 70%);
  border-radius: 50%;
  opacity: var(--op);
  animation-name: bd-float;
  animation-timing-function: ease-in-out;
}
.bd-night .p-clear {
  /* 밤의 맑음은 별이다. 떠다니는 대신 제자리에서 반짝인다 */
  background: radial-gradient(circle, #ffffff 0%, rgba(200, 220, 255, 0.6) 70%);
  animation-name: bd-twinkle;
}

/* ===== 4. 번개 ===== */
.bd-flash {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(214, 232, 255, 0.5) 100%);
  opacity: 0;
  /* 1차 버전은 9초에 한 번이라 화면을 보고 있어도 놓치기 쉬웠다. 5초로 줄였다. */
  animation: bd-flash 5s linear infinite;
}

/* ===== keyframes =====
   전부 transform / opacity 만 움직인다. top·left 를 애니메이트하면 매 프레임 레이아웃을 다시 계산해서
   입자가 많아질수록 눈에 띄게 끊긴다. */

/* 비 : 아래로 떨어지면서 왼쪽으로 밀린다. rotate 로 줄기 자체도 같은 방향으로 눕힌다.
   각도는 입자마다 다르게 하지 않는다. 실제 비는 바람 방향이 같아서 전부 같은 각도로 내린다. */
@keyframes bd-fall {
  from {
    transform: translate3d(0, -20vh, 0) rotate(14deg);
  }
  to {
    transform: translate3d(-30vh, 120vh, 0) rotate(14deg);
  }
}
@keyframes bd-snowfall {
  from {
    transform: translate3d(0, -15vh, 0);
  }
  to {
    /* --drift 는 입자마다 :style 로 다르게 들어온다 */
    transform: translate3d(var(--drift, 0px), 115vh, 0);
  }
}
@keyframes bd-drift {
  from {
    transform: translate3d(-60vw, 0, 0);
  }
  to {
    transform: translate3d(160vw, 0, 0);
  }
}
/* 안개는 흐르면서 짙어졌다 옅어진다. 일정한 농도로 지나가면 띠가 아니라 판때기로 보인다. */
@keyframes bd-fogdrift {
  0% {
    transform: translate3d(-80vw, 0, 0);
    opacity: 0;
  }
  25%,
  75% {
    opacity: 1;
  }
  100% {
    transform: translate3d(150vw, 0, 0);
    opacity: 0;
  }
}
/* 맑음 : 위로 크게 오르며 좌우로 흔들린다 */
@keyframes bd-float {
  0% {
    transform: translate3d(0, 0, 0);
    opacity: 0;
  }
  20%,
  70% {
    opacity: var(--op);
  }
  50% {
    transform: translate3d(var(--sway, 0px), calc(var(--rise, -120px) * 0.55), 0);
  }
  100% {
    transform: translate3d(0, var(--rise, -120px), 0);
    opacity: 0;
  }
}
@keyframes bd-twinkle {
  0%,
  100% {
    opacity: calc(var(--op) * 0.15);
    transform: scale(0.7);
  }
  50% {
    opacity: var(--op);
    transform: scale(1.15);
  }
}
@keyframes bd-spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes bd-breathe {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.85;
  }
  50% {
    transform: scale(1.12);
    opacity: 1;
  }
}
/* 번개는 대부분의 시간 동안 꺼져 있다가 짧게 두 번 친다.
   계속 번쩍이면 화면을 볼 수가 없어서, 5초 중 0.25초만 쓴다. */
@keyframes bd-flash {
  0%,
  84%,
  100% {
    opacity: 0;
  }
  85% {
    opacity: 0.85;
  }
  87% {
    opacity: 0.1;
  }
  89% {
    opacity: 0.6;
  }
  92% {
    opacity: 0;
  }
}

/* ===== 접근성 =====
   움직이는 배경에 어지러움·멀미를 느끼는 사람이 있다. 운영체제에서 "동작 줄이기" 를 켠 사용자에게는
   애니메이션을 멈추고 하늘 톤만 남긴다. 날씨 정보는 여전히 색으로 전달된다. */
@media (prefers-reduced-motion: reduce) {
  .bd-particle,
  .bd-flash,
  .bd-sun-rays,
  .bd-sun-core {
    animation: none;
  }
  .bd-particle {
    display: none;
  }
}
</style>
