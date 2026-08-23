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

  // 과제 8. 스크롤 위치 복원.
  // 홈은 세로로 긴 화면이라, 아래쪽 도시 카드를 눌러 상세로 갔다가 뒤로가기를 하면
  // 맨 위로 튀어서 보던 카드를 다시 찾아 내려가야 했다.
  // savedPosition 은 "뒤로/앞으로" 로 들어왔을 때만 값이 있다. 링크로 새로 들어온 경우엔 null 이라
  // 그때는 맨 위에서 시작한다.
  scrollBehavior(to, from, savedPosition) {
    if (!savedPosition) return { top: 0 }

    // App.vue 의 <Transition mode="out-in"> 이 0.18s 페이드를 돌린다 (practice.css .route-fade-*).
    // 그동안은 이전 화면이 사라지고 새 화면이 아직 안 그려져서 문서 높이가 짧다.
    // 그 상태에서 y=1200 으로 스크롤하면 갈 곳이 없어 맨 아래에 걸린다.
    // 그래서 전환이 끝난 뒤로 한 박자 미룬다. scrollBehavior 는 Promise 를 반환할 수 있다.
    return new Promise((resolve) => {
      setTimeout(() => resolve(savedPosition), 200)
    })
  },
})

export default router
