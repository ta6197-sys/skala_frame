import { createRouter, createWebHistory } from 'vue-router'
import WeatherHomeView from '@/views/WeatherHomeView.vue'

// 과제 4. 라우트 규칙 정의
// - 첫 화면인 홈만 정적 import 한다. 어차피 진입 즉시 필요하므로 지연 로딩 이득이 없다.
// - 나머지는 () => import(...) 형태의 Lazy Loading. 해당 주소로 처음 이동할 때 별도 청크로 내려받는다.
const routes = [
  {
    path: '/',
    name: 'WeatherHome',
    component: WeatherHomeView,
  },
  {
    path: '/about',
    name: 'WeatherAbout',
    component: () => import('@/views/WeatherAboutView.vue'),
  },
  {
    // 동적 경로 매칭: /weather/city_01 로 들어오면 route.params.cityId === 'city_01'
    path: '/weather/:cityId',
    name: 'WeatherDetail',
    component: () => import('@/views/WeatherDetailView.vue'),
  },
  {
    // 과제 5. 스토어로 올린 즐겨찾기를 모아 보는 화면 (과제 4 때는 상태 공유가 안 돼서 못 만들었던 것)
    path: '/favorites',
    name: 'Favorites',
    component: () => import('@/views/FavoritesView.vue'),
  },
  {
    // 과제 5. 더움 기준 온도 / 미세먼지 경계 / 체질을 사용자가 직접 정하는 설정 화면
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
  },
  {
    // 요구사항 6. 본인 추가 view - 목업 데이터 전체를 집계해서 보여주는 통계 페이지
    path: '/stats',
    name: 'WeatherStats',
    component: () => import('@/views/WeatherStatsView.vue'),
  },
  {
    // 과제 진행 중 막혔던 지점 기록
    path: '/troubleshooting',
    name: 'Troubleshooting',
    component: () => import('@/views/TroubleshootingView.vue'),
  },
  {
    // 과제 1~3 화면 보존용. App.vue 가 라우터 껍데기로 바뀌었으므로 이 경로에서 계속 확인할 수 있다.
    path: '/legacy',
    name: 'LegacyTask',
    component: () => import('@/views/LegacyTaskView.vue'),
  },
  {
    // Element Plus Carousel 컴포넌트 예제 확인용
    path: '/carousel',
    name: 'CarouselDemo',
    component: () => import('@/views/CarouselDemoView.vue'),
  },
  {
    // Catch-all Route : 위에서 하나도 매칭되지 않은 주소를 전부 흡수한다.
    // 반드시 배열의 "마지막" 에 있어야 한다. 위로 올리면 모든 주소를 이 규칙이 먼저 먹어버린다.
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
