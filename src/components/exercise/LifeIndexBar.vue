<script setup>
// 과제 5(나만의 추가). 생활지수 한 줄을 그리는 표시 전용 컴포넌트
// 과제 3의 WeatherBadge 처럼, 모양이 같은 것 세 개를 컴포넌트 하나로 만들고 props 만 바꿔 재사용한다.
// 점수 계산은 data/lifeIndex.js 가, 그리기는 여기가 담당한다.
const props = defineProps({
  index: {
    type: Object,
    required: true,
  },
})

// 점수 구간에 따라 막대 색만 바꾼다. 판정 기준은 lifeIndex.js 의 등급과 같은 경계를 쓴다.
const barClass = () => {
  if (props.index.score >= 60) return 'index-fill-good'
  if (props.index.score >= 40) return 'index-fill-normal'
  return 'index-fill-bad'
}
</script>

<template>
  <div class="index-row">
    <div class="index-head">
      <span class="index-label">{{ index.label }}</span>
      <strong class="index-score">{{ index.score }}점 · {{ index.grade }}</strong>
    </div>
    <div class="index-track">
      <div class="index-fill" :class="barClass()" :style="{ width: index.score + '%' }"></div>
    </div>
    <p class="index-reason">{{ index.reason }}</p>
  </div>
</template>

<style scoped>
.index-row {
  margin-bottom: 12px;
}
.index-row:last-child {
  margin-bottom: 0;
}
.index-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 4px;
}
.index-label {
  font-size: 14px;
  color: var(--c-text);
}
.index-score {
  font-size: 13px;
  color: var(--c-text-sub);
}
.index-track {
  height: 10px;
  background-color: var(--c-track);
  border-radius: 5px;
  overflow: hidden;
}
.index-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.3s ease;
}
.index-fill-good {
  background-color: var(--c-good);
}
.index-fill-normal {
  background-color: var(--c-normal);
}
.index-fill-bad {
  background-color: var(--c-hot);
}
.index-reason {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: var(--c-text-faint);
}
</style>
