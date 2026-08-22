<script setup>
// 과제 3(요구사항 7): 기온 뱃지와 미세먼지 뱃지가 모양이 같아서 하나로 합친 재사용 컴포넌트
// - 어떤 문구를 띄울지(v-if 판정)는 부모(WeatherCard)가 하고, 여기는 받은 대로 그리기만 한다.
defineProps({
  type: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <span :class="['badge', 'badge-' + type]">{{ text }}</span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 2px 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--c-surface);
  border-radius: 12px;
}
.badge-hot {
  background-color: var(--c-hot);
}
.badge-cool {
  background-color: var(--c-cool);
}
.badge-good {
  background-color: var(--c-good);
}
.badge-normal {
  background-color: var(--c-normal);
}
.badge-bad {
  background-color: var(--c-bad);
}
</style>
