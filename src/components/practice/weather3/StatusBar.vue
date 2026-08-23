<script setup>
// 과제 3(요구사항 7): 하단 상태바. 선택된 도시 객체를 props 로 받아 문구만 출력한다.
defineProps({
  selectedCityInfo: {
    type: Object,
    default: null,
  },
})
</script>

<template>
  <div class="status-bar">
    <span v-if="selectedCityInfo">{{ selectedCityInfo.name }}가 선택되었습니다.</span>
    <span v-else>카드를 클릭하거나 검색해 보세요.</span>
  </div>
</template>

<style scoped>
.status-bar {
  margin-top: 16px;
  padding: 10px;
  font-size: 14px;
  text-align: center;
  color: var(--c-text);
  background-color: var(--c-brand-soft);
  border: 1px solid var(--c-brand-line);
  border-radius: 6px;
}
</style>
