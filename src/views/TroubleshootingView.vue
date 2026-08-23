<script setup>
import { ref, computed } from 'vue'
import { troubleshootingList } from '@/data/troubleshooting'
import BaseDashboardCard from '@/components/common/BaseDashboardCard.vue'

// 과제 진행 중 막혔던 지점을 모아 보는 페이지
// 항목 데이터는 data/troubleshooting.js 에 있고, 이 화면은 필터링해서 그리기만 한다.
//
// 과제 7. 필터 버튼 → el-radio-group(button 형), 항목 카드 → el-collapse 로 바꿨다.
// - 항목이 늘면서 세로로 계속 길어지던 화면이 제목만 보이는 목록으로 접혔다.
//   기록을 찾을 때는 제목만 훑다가 필요한 것만 펼치는 게 맞는 순서다.
// - 필터를 라디오 그룹으로 바꾸면 "여러 개 중 하나" 라는 의미가 마크업에도 드러나고,
//   좌우 화살표 키로 넘길 수 있게 된다.
const selectedTask = ref('전체')

// 데이터에 들어있는 과제 이름만 뽑아 필터 버튼을 만든다. 항목이 늘어도 버튼은 자동으로 따라온다.
const taskList = computed(() => ['전체', ...new Set(troubleshootingList.map((item) => item.task))])

const filteredList = computed(() => {
  if (selectedTask.value === '전체') return troubleshootingList
  return troubleshootingList.filter((item) => item.task === selectedTask.value)
})

const solvedCount = computed(
  () => troubleshootingList.filter((item) => item.status === 'solved').length,
)
const knownCount = computed(
  () => troubleshootingList.filter((item) => item.status === 'known').length,
)

// el-collapse 는 펼친 항목의 name 배열을 v-model 로 관리한다.
// 이건 이 화면 안에서만 쓰는 UI 상태(어떤 패널이 열려 있는가)라 스토어로 올리지 않고,
// 스토어 state 도 아니라서 v-model 을 그대로 써도 단방향 원칙과 충돌하지 않는다.
const openPanels = ref([])
</script>

<template>
  <div>
    <h3>트러블슈팅 기록</h3>

    <BaseDashboardCard>
      <template v-slot:title>기록 요약</template>
      <div class="summary-row">
        <el-tag effect="plain" round>총 {{ troubleshootingList.length }}건</el-tag>
        <el-tag type="success" effect="light" round>해결 {{ solvedCount }}건</el-tag>
        <el-tag type="warning" effect="light" round>원인만 파악 {{ knownCount }}건</el-tag>
      </div>

      <el-radio-group v-model="selectedTask" size="small" class="filter-row">
        <el-radio-button v-for="task in taskList" :key="task" :value="task">
          {{ task }}
        </el-radio-button>
      </el-radio-group>
    </BaseDashboardCard>

    <el-empty
      v-if="filteredList.length === 0"
      description="해당 과제의 기록이 아직 없습니다."
      :image-size="80"
    />

    <el-collapse v-else v-model="openPanels" class="ts-collapse">
      <el-collapse-item v-for="item in filteredList" :key="item.id" :name="item.id">
        <template #title>
          <div class="ts-head">
            <el-tag size="small" effect="plain" round>{{ item.task }}</el-tag>
            <span class="ts-title">{{ item.title }}</span>
            <el-tag
              :type="item.status === 'solved' ? 'success' : 'warning'"
              size="small"
              effect="dark"
              round
            >
              {{ item.status === 'solved' ? '해결' : '남겨둠' }}
            </el-tag>
          </div>
        </template>

        <dl class="ts-body">
          <dt>증상</dt>
          <dd>{{ item.symptom }}</dd>
          <dt>원인</dt>
          <dd>{{ item.cause }}</dd>
          <dt>해결</dt>
          <dd>{{ item.solution }}</dd>
        </dl>

        <div class="ts-tags">
          <el-tag v-for="tag in item.tags" :key="tag" size="small" type="info" effect="plain">
            {{ tag }}
          </el-tag>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style scoped>
.summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
}
.ts-collapse {
  border-top: none;
}
.ts-head {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--space-2);
  padding-right: var(--space-3);
  min-width: 0;
}
.ts-title {
  flex: 1;
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ts-body {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
}
.ts-body dt {
  margin-top: 8px;
  font-weight: 600;
  color: var(--c-text-muted);
}
.ts-body dt:first-child {
  margin-top: 0;
}
.ts-body dd {
  margin: 2px 0 0 0;
  color: var(--c-text-sub);
}
.ts-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--c-surface-mute);
}
</style>
