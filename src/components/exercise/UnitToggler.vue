<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

// 과제 5(요구사항 1). 대시보드 상단에 배치되어 단위 설정을 변경하는 UI
// props 도 emit 도 없다. 부모를 거치지 않고 스토어를 직접 읽고 직접 고친다.
//
// 과제 7. 직접 만든 button 을 el-switch 로 바꿨다. 참고 파일 practices/library/ElementPlus.vue
// 실습 1번에 나오는 컴포넌트다. 키보드 포커스와 aria 속성을 공짜로 얻는다.
//
// 주의한 점: el-switch 에 v-model 을 걸면 스토어 state 에 직접 대입하게 된다.
// 그러면 "읽기는 getter, 쓰기는 action" 규칙이 깨지고, 나중에 toggleUnit 안에
// 다른 처리를 넣어도 이 스위치만 그걸 건너뛰게 된다.
// 그래서 :model-value 로 읽고 @change 로 action 을 부른다. 흐름이 한 방향으로 유지된다.
const configStore = useConfigStore()

const isFahrenheit = computed(() => configStore.unit === 'fahrenheit')
</script>

<template>
  <div class="unit-toggler">
    <span class="unit-text">날씨단위</span>
    <el-switch
      :model-value="isFahrenheit"
      active-text="℉"
      inactive-text="℃"
      inline-prompt
      size="default"
      @change="configStore.toggleUnit"
    />
    <span class="unit-label">{{ configStore.unitLabel }}</span>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.unit-text {
  font-size: 13px;
  color: var(--c-text-muted);
}
.unit-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text-sub);
}
</style>
