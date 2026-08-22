<script setup>
// 과제 3(요구사항 7): 습도 게이지 바만 담당하는 컴포넌트
defineProps({
  humidity: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <div class="gauge-row">
    <span class="gauge-label">습도 {{ humidity }}%</span>
    <div class="gauge">
      <div class="gauge-fill" :style="{ width: humidity + '%' }"></div>
    </div>
  </div>
</template>

<style scoped>
.gauge-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.gauge-label {
  min-width: 72px;
  font-size: 13px;
  color: var(--c-text-muted);
}
.gauge {
  flex: 1;
  height: 10px;
  background-color: var(--c-track);
  border-radius: 5px;
  overflow: hidden;
}
.gauge-fill {
  height: 100%;
  background-color: var(--c-brand);
  border-radius: 5px;
  transition: width 0.3s ease;
}
</style>
