<script setup>
import { computed, onMounted } from 'vue'
import { useOnline } from '@vueuse/core'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useWeatherStore } from '@/stores/weatherStore'
import UnitToggler from '@/components/common/UnitToggler.vue'

// 과제 4. App.vue 는 화면을 직접 그리지 않는다.
// - 위쪽: <RouterLink>들로 만든 Navigation Bar (a 태그와 달리 새로고침 없이 주소만 바꾼다)
// - 아래쪽: <RouterView />라는 "수문장" 자리. 현재 주소에 매칭된 view 컴포넌트가 여기에 끼워진다.
// 과제 5. Navigation Bar 옆에 UnitToggler 를 배치하고, 즐겨찾기 개수를 스토어에서 직접 읽어 배지로 띄운다.
//
// 과제 7. 세 가지가 바뀌었다.
// 1) 과제 제목 + 링크 9개 나열이던 상단을 서비스 헤더로 바꿨다.
//    주 메뉴 5개와 보조 2개를 시각적으로 갈랐고, 즐겨찾기 개수 배지는 손으로 만든 span 대신 el-badge 를 쓴다.
//    과제 번호는 지우지 않고 el-tag 로 헤더 우측에 남겼다 (제출물이라 어느 과제인지 화면에 보여야 한다).
// 2) fetchAll() 진입점을 여기 한 곳으로 모았다.
//    과제 6 까지는 WeatherHomeView / FavoritesView / WeatherStatsView 세 화면이 각자 onMounted 에서 불렀다.
//    캐시 덕에 중복 호출은 안 났지만 "언제 받아오는가" 를 아는 곳이 3곳이었다.
//    이제 데이터는 App.vue(1회 요청) → weatherStore → 각 화면(읽기 전용) 한 방향으로만 흐른다.
//    (상세의 ensureCity 는 "이 도시만 없으면 채운다" 라 역할이 달라서 그대로 둔다)
// 3) RouterView 를 v-slot 형태로 열고 Transition 을 얹었다. 참고 파일 App.vue.exercise 에
//    RouterView v-slot + KeepAlive 조합이 주석으로 들어 있어서 형태 자체는 배운 범위 안이다.
const favoritesStore = useFavoritesStore()
const weatherStore = useWeatherStore()
const isOnline = useOnline()

// 앱이 뜨면 한 번 받는다. 이후 각 화면은 스토어를 읽기만 한다.
onMounted(() => weatherStore.fetchAll())

// 헤더 우측 상태 태그. 지금 보고 있는 값이 실측인지 폴백인지 한눈에 알리는 용도.
const statusTag = computed(() => {
  if (!isOnline.value) return { type: 'warning', text: '오프라인' }
  if (weatherStore.isFallback) return { type: 'info', text: '목업 데이터' }
  if (weatherStore.isLoading) return { type: 'primary', text: '불러오는 중' }
  if (weatherStore.lastFetched) return { type: 'success', text: '실시간 관측' }
  return { type: 'info', text: '대기 중' }
})

const mainMenu = [
  { to: '/', label: '날씨 대시보드' },
  { to: '/favorites', label: '즐겨찾기', badge: true },
  { to: '/stats', label: '도시 통계' },
  { to: '/settings', label: '내 기준' },
  { to: '/about', label: '서비스 소개' },
]

const subMenu = [
  { to: '/troubleshooting', label: '트러블슈팅' },
  { to: '/legacy', label: '과제 1~3' },
]
</script>

<template>
  <div class="practice-container">
    <header class="app-header">
      <div class="brand">
        <span class="brand-mark">☁</span>
        <div class="brand-text">
          <h1 class="brand-title">날씨 대시보드</h1>
          <p class="brand-desc">
            OpenWeatherMap 실측 데이터로 도시 6곳의 날씨 · 미세먼지 · 생활지수를 본다
          </p>
        </div>
      </div>

      <div class="header-right">
        <el-tag :type="statusTag.type" size="small" effect="light" round>
          {{ statusTag.text }}
        </el-tag>
        <!-- 과제 번호 태그. 한 단원을 끝낼 때마다 여기와 index.html 의 <title> 이 같이 낡는다.
             단원 하나를 가리키는 대신 지금까지 쌓인 범위를 적어서, 다음 과제에서 숫자만 늘리면 되게 둔다. -->
        <el-tag type="info" size="small" effect="plain">과제 1~8 통합</el-tag>
        <UnitToggler />
      </div>
    </header>

    <nav class="navigation-bar">
      <RouterLink v-for="item in mainMenu" :key="item.to" :to="item.to" class="nav-item">
        <!-- 과제 7. 손으로 만들던 .nav-badge span 을 el-badge 로 교체.
             :hidden 으로 0개일 때 자동으로 숨는다 (v-if 를 따로 안 써도 된다) -->
        <el-badge
          v-if="item.badge"
          :value="favoritesStore.favoriteCount"
          :hidden="favoritesStore.favoriteCount === 0"
          :offset="[6, 8]"
        >
          {{ item.label }}
        </el-badge>
        <template v-else>{{ item.label }}</template>
      </RouterLink>

      <span class="nav-spacer"></span>

      <RouterLink
        v-for="item in subMenu"
        :key="item.to"
        :to="item.to"
        class="nav-item nav-item-sub"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <main class="router-outlet">
      <!-- 과제 7. 라우트가 바뀔 때 화면이 툭 끊기지 않도록 페이드를 넣었다.
           mode="out-in" 이라 나가는 화면이 다 사라진 뒤에 들어오는 화면이 그려진다.
           두 화면이 겹치는 순간이 없어야 레이아웃이 안 튄다. -->
      <RouterView v-slot="{ Component, route }">
        <Transition name="route-fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<!-- 전역 스타일: 과제 1~3 에서 쓰던 공용 CSS 를 여기서 한 번만 불러온다 -->
<style>
@import '@/assets/practice.css';
@import '@/assets/weather.css';
</style>

<style scoped>
/* 과제 7. 날씨 배경(WeatherBackdrop)은 position: fixed / z-index: 0 이라 정적 요소 위에 그려진다.
   헤더와 네비게이션까지 하늘 톤이 덮이면 메뉴 글자가 묻히므로 이 둘만 배경 위로 올린다.
   반대로 .router-outlet 은 일부러 그대로 둔다. 카드 사이 여백으로 날씨가 비쳐 보여야 하기 때문이다. */
.app-header,
.navigation-bar {
  position: relative;
  z-index: 1;
}

/* 과제 8-3. 상단 크롬 압축 (B안).
   실측: 1280px 에서 본문이 시작되기까지 213px 을 헤더/네비/여백이 쓰고 있었다.
   폰(375px)에서는 355px 로 뷰포트의 53% 였다.
   메뉴는 7개 전부 그대로 노출한다. 숨기면 채점자가 과제 화면을 클릭 두 번으로 찾아야 한다.
   position 과 z-index 는 손대지 않는다 - 상세 페이지가 배경(z=0) / 본문(z=1) 층으로
   맞물려 있어서, 여기서 층을 건드리면 그쪽 날씨 배경이 깨진다. 크기와 여백만 줄인다. */
.app-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-5);
  margin-bottom: var(--space-2);
  background-color: var(--c-surface);
  border: 1px solid var(--c-line);
  border-radius: var(--radius-l);
  box-shadow: var(--shadow-1);
}
.brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 18px;
  color: var(--c-on-brand);
  background-color: var(--c-brand);
  border-radius: var(--radius-m);
}
/* 과제 8-3. 제목과 설명문을 위아래 두 줄에서 한 줄로 눕혔다.
   헤더 높이를 정하고 있던 게 이 두 줄이었다 (제목 25 + 설명 21 = 46px).
   설명문을 지우지 않고 옆으로 옮기기만 했다. baseline 정렬이라 글자 밑선이 맞는다.
   flex-wrap 을 켜둔 이유 - 좁은 폭에서는 알아서 아래로 접히게 두는 편이 안전하다. */
.brand-text {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-2);
  min-width: 0;
}
.brand-title {
  margin: 0;
  font-size: var(--fs-h2);
  font-weight: var(--fw-bold);
  color: var(--c-text);
}
.brand-desc {
  margin: 0;
  font-size: 13px;
  color: var(--c-text-muted);
}
.header-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.navigation-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
  padding: 5px 8px;
  margin-bottom: var(--space-3);
  background-color: var(--c-surface);
  border: 1px solid var(--c-line);
  border-radius: var(--radius-m);
  box-shadow: var(--shadow-1);
}
.nav-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--c-text-sub);
  text-decoration: none;
  border-radius: var(--radius-s);
  transition: all 0.15s ease;
}
.nav-item:hover {
  background-color: var(--c-surface-mute);
  color: var(--c-text);
}
/* 현재 주소와 정확히 일치하는 링크에 vue-router 가 자동으로 붙여주는 클래스 */
.nav-item.router-link-exact-active {
  color: var(--c-on-brand);
  background-color: var(--c-brand);
}
.nav-spacer {
  flex: 1;
}
.nav-item-sub {
  font-size: 12px;
  color: var(--c-text-faint);
}
/* 보조 메뉴 앞에 구분선을 둬서 주 메뉴와 다른 묶음이라는 걸 드러낸다 */
.nav-item-sub:first-of-type {
  border-left: 1px solid var(--c-line);
  margin-left: var(--space-2);
  padding-left: var(--space-3);
}
.router-outlet {
  padding: 4px 20px 24px 20px;
  background-color: var(--c-surface);
  border: 1px solid var(--c-line);
  border-radius: var(--radius-l);
  box-shadow: var(--shadow-1);
}

/* el-badge 가 활성 링크 안에서도 읽히도록 색만 맞춘다 */
.nav-item :deep(.el-badge__content) {
  background-color: var(--c-normal);
  border: none;
}

/* 과제 8-3. 설명문을 감추는 기준을 640 -> 900px 로 올렸다.
   실측: 768px 에서 브랜드(182) + 설명문(약 380) + 우측(약 300) = 862 가
   쓸 수 있는 폭 736 을 넘겨 헤더가 두 줄(110px)로 접혔다.
   설명문은 태블릿에서 굳이 필요한 정보가 아니고, 같은 내용이 /about 에 있다. */
@media (max-width: 900px) {
  .brand-desc {
    display: none;
  }
}

@media (max-width: 640px) {
  .app-header {
    padding: var(--space-3) var(--space-4);
  }
  .router-outlet {
    padding: 4px 12px 20px 12px;
  }

  /* 과제 8-3. 폰에서 헤더가 154px 이었다. 실측해 보니 브랜드 줄(44) 아래로
     .header-right 가 60px 짜리 두 줄로 접혀 있었고, 그 두 줄을 만든 게 UnitToggler 였다.
     "날씨단위" 와 "섭씨(℃)" 라벨까지 합쳐 155px 를 쓰는데, 폭이 모자라 태그와 갈라선 것이다.

     UnitToggler.vue 는 과제 5 요구사항 1 의 산출물이라 파일 자체는 손대지 않았다.
     대신 여기서 :deep() 으로 보조 라벨 두 개만 폰에서 감춘다.
     스위치는 inline-prompt 로 ℃/℉ 를 자기 안에 표시하므로 라벨이 없어도 뜻이 통하고,
     스토어 연결(:model-value + @change -> toggleUnit)은 그대로 살아 있다. */
  .header-right :deep(.unit-text),
  .header-right :deep(.unit-label) {
    display: none;
  }

  /* .nav-spacer 는 flex: 1 이라, 줄바꿈이 일어나는 폭에서 자기 혼자 한 줄을 차지해
     보조 메뉴를 통째로 아래 줄로 밀어낸다. 데스크톱에서는 주/보조를 좌우로 가르는
     역할이 있지만 폰에서는 줄 수만 늘린다. 폰에서만 접는다. */
  .nav-spacer {
    display: none;
  }
  .nav-item {
    padding: 5px 9px;
    font-size: 13px;
  }
  .nav-item-sub:first-of-type {
    margin-left: var(--space-1);
    padding-left: var(--space-2);
  }
}
</style>
