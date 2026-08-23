<script setup>
import { useRouter } from 'vue-router'
import BaseDashboardCard from '@/components/common/BaseDashboardCard.vue'

// 과제 4. 정적 소개 페이지. 상태가 없으므로 Lazy Loading 대상으로 두기 딱 좋다.
// 과제 7. 라우트 표를 el-descriptions 로, 적용 기능을 단원별 el-timeline 으로 바꿨다.
//         목록이 길어지기만 하던 화면에 "어느 단원에서 무엇이 붙었는가" 라는 순서가 생긴다.
const router = useRouter()

const goHome = () => {
  router.push('/')
}

const routeList = [
  { path: '/', desc: '날씨 대시보드 (검색 · 요약 · 내 위치 · 즐겨찾기 · 카드 그리드)' },
  { path: '/weather/:cityId', desc: '도시 코드로 매칭되는 상세 관측 페이지' },
  { path: '/favorites', desc: '스토어에 담아둔 즐겨찾기 도시 모아보기' },
  { path: '/settings', desc: '더움 기준 온도 · 미세먼지 경계 · 체질을 직접 정하는 화면' },
  { path: '/stats', desc: '도시 6곳을 집계한 통계 페이지' },
  { path: '/troubleshooting', desc: '과제를 진행하며 막혔던 지점 기록' },
  { path: '/:pathMatch(.*)*', desc: '없는 주소를 모두 흡수하는 404 페이지' },
]

const timeline = [
  {
    task: '과제 1~3',
    color: 'var(--c-text-faint)',
    items: [
      'v-for / v-if 로 카드 목록',
      ':value + @input 한글 검색',
      'props · emits · slot 으로 컴포넌트 분리',
    ],
  },
  {
    task: '과제 4 · Router',
    color: 'var(--c-cool)',
    items: [
      '지연 로딩 · Catch-all Route',
      '동적 경로 /weather/:cityId',
      '검색어 쿼리스트링 동기화',
    ],
  },
  {
    task: '과제 5 · Store',
    color: 'var(--c-normal)',
    items: [
      'configStore(단위 · 내 기준)',
      'favoritesStore · recentStore',
      '생활지수 · 옷차림 추천',
    ],
  },
  {
    task: '과제 6 · Axios',
    color: 'var(--c-brand)',
    items: [
      '화면 → 스토어 → api 함수 → axios 인스턴스 4층 구조',
      'OpenWeatherMap 현재날씨 · 대기오염 · 예보 · 역지오코딩',
      'Open-Meteo 자외선 · 시간대별 최적 생활지수',
    ],
  },
  {
    task: '과제 7 · UI Library',
    color: 'var(--c-bad)',
    items: [
      'Element Plus 를 4종 → 15종 이상으로 확대 적용',
      '날씨 아이콘 도입 · 카드 그리드 · 상세 히어로',
      '검색어를 주소창 단방향으로 정리',
    ],
  },
  {
    task: '과제 8 · 마감',
    color: 'var(--c-hot)',
    items: [
      'Element Plus 온디맨드 전환 (첫 화면 1,462KB → 399KB)',
      'composable 3종 추출 · 컴포넌트 폴더 재분류',
      'vitest 도입 (3 files / 24 tests) · 서버리스 엣지 캐시',
    ],
  },
]
</script>

<template>
  <div>
    <h3>서비스 소개</h3>

    <BaseDashboardCard>
      <template v-slot:title>어떤 앱인가요?</template>
      <p class="about-text">
        Vue 3 + Vue Router + Pinia + Axios 기반의 기상 관측 대시보드입니다. 페이지를 새로고침하지
        않고 주소만 바꾸는 <strong>클라이언트 사이드 라우팅</strong>으로 화면을 전환하고, 날씨 값은
        <strong>OpenWeatherMap</strong> 과 <strong>Open-Meteo</strong> 에서 실시간으로 받아옵니다.
        통신이 실패하면 목업 데이터로 내려앉고 화면에 "오프라인 데이터" 라고 밝힙니다.
      </p>
    </BaseDashboardCard>

    <BaseDashboardCard>
      <template v-slot:title>화면 구성</template>
      <el-descriptions :column="1" border size="small">
        <el-descriptions-item v-for="route in routeList" :key="route.path">
          <template #label>
            <code>{{ route.path }}</code>
          </template>
          {{ route.desc }}
        </el-descriptions-item>
      </el-descriptions>
    </BaseDashboardCard>

    <BaseDashboardCard>
      <template v-slot:title>단원별로 붙인 것</template>
      <el-timeline>
        <el-timeline-item
          v-for="step in timeline"
          :key="step.task"
          :color="step.color"
          :timestamp="step.task"
          placement="top"
        >
          <ul class="about-list">
            <li v-for="item in step.items" :key="item">{{ item }}</li>
          </ul>
        </el-timeline-item>
      </el-timeline>
    </BaseDashboardCard>

    <el-button type="primary" class="about-btn" @click="goHome">
      메인 대시보드로 돌아가기
    </el-button>
  </div>
</template>

<style scoped>
.about-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: var(--c-text-sub);
}
.about-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--c-text-sub);
}
code {
  padding: 2px 6px;
  background-color: var(--c-surface-mute);
  border-radius: 4px;
  color: var(--c-hot);
  font-size: 13px;
}
.about-btn {
  width: 100%;
  margin-top: var(--space-1);
}
</style>
