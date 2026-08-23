<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useIntervalFn, useOnline } from '@vueuse/core'
import { useWeatherStore } from '@/stores/weatherStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useRecentStore } from '@/stores/recentStore'
import { useConfigStore } from '@/stores/configStore'
import { useQueryParam } from '@/composables/useQueryParam'
import { useMyLocation } from '@/composables/useMyLocation'
import { logDev } from '@/utils/devLog'
import BaseDashboardCard from '@/components/common/BaseDashboardCard.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import WeatherCard from '@/components/weather/WeatherCard.vue'

// 과제 4. 과제 3 의 WeatherParent 를 "/" 경로의 페이지 컴포넌트로 승격시킨 화면.
// 과제 5. 즐겨찾기/최근 본 도시는 스토어로 옮기고, 이 화면에는 검색 상태만 남겼다.
// 과제 6. 목업 배열(weatherData)을 직접 들고 있던 자리를 weatherStore 로 바꿨다.
//         이 화면은 이제 데이터를 "가지고" 있지 않고 스토어에 요청하고 그리기만 한다. URL 도 키도 모른다.
// 과제 7. 두 가지가 바뀌었다.
//   1) fetchAll() 호출이 여기서 사라졌다. App.vue 한 곳으로 올렸다.
//      이 화면은 이제 데이터를 "받아오는" 일에도 관여하지 않고 오로지 읽고 그리기만 한다.
//   2) 검색어를 주소창 단방향으로 바꿨다. 아래 설명 참고.
//
// 정리. 이 화면이 한 파일에서 하던 일이 여섯 가지였다(검색어 URL 동기화 · 지오로케이션 2단 API ·
// 자동 갱신 · 요약 집계 · 선택 상태 · 로깅). 그중 스스로 완결되는 두 덩어리를 composable 로 내보냈다.
//   - 검색어 ↔ 주소창  → composables/useQueryParam.js  (상세 화면의 ?preview= 와 같은 패턴이라 공유한다)
//   - 내 위치 날씨      → composables/useMyLocation.js
// 남은 것은 "스토어에서 읽어 화면에 배치하는 일" 이다. 그게 view 가 할 일이다.
const router = useRouter()
const weatherStore = useWeatherStore()
const favoritesStore = useFavoritesStore()
const recentStore = useRecentStore()
const configStore = useConfigStore()

// ===== 검색어 (과제 7 - 단방향 전환) =====
// 주소창 하나를 원본으로 삼고 화면은 거기서 파생만 한다.
//   입력 → router.replace → route.query → computed → 화면
// 그 흐름 자체는 useQueryParam 이 들고 있다. 여기에는 "이 화면이 쓰는 키는 search 다" 만 남는다.
// (과제 7 이전에는 ref 와 주소창 두 곳에 값이 있었고, 뒤로가기로 주소만 바뀌면 화면이 따라오지 못했다.)
const { value: searchQuery, setValue: handleUpdateQuery } = useQueryParam('search')

// 과제 6 : 10분마다 자동 갱신. 캐시 유효시간과 같은 간격이라 화면을 켜둔 채로 두면 계속 최신값이 된다.
// setInterval 을 직접 쓰면 화면을 떠날 때 clearInterval 을 잊기 쉬운데, useIntervalFn 은 언마운트 시 알아서 멈춘다.
// 과제 7 : fetchAll 은 App.vue 로 올렸지만 이건 홈에 남긴다. 안 보고 있는 화면 때문에 호출 한도를 쓸 이유가 없다.
useIntervalFn(() => weatherStore.refresh(), 10 * 60 * 1000)

// 과제 6 : 브라우저의 온라인/오프라인 상태. 끊긴 상태에서 새로고침을 눌러봐야 실패만 하므로 버튼을 잠근다.
const isOnline = useOnline()

// ===== 내 위치 날씨 (요구사항 2 - 역지오코딩 API) =====
// 권한 요청 · 좌표 유효성 · 지명/날씨 2단 호출 · 거부 처리까지가 composable 안에 있다.
// 이 화면은 "버튼을 누르면 request(), 결과는 place 에 담긴다" 만 알면 된다.
const {
  place: myPlace,
  isLocating,
  errorMessage: myPlaceError,
  request: requestMyLocation,
} = useMyLocation()

// 선택된 도시 (하단 상태바용) - 이 화면 안에서만 쓰는 값이라 스토어로 올리지 않고 지역 상태로 둔다.
const selectedCityInfo = ref(null)
const handleSelectCard = (city) => {
  selectedCityInfo.value = city
}

// 과제 4 핵심 : window.alert() 를 제거하고 Programmatic Navigation 으로 대체한다.
const handleClickDetail = (cityId) => {
  router.push('/weather/' + cityId)
}

// 목록의 출처만 스토어로 바뀌었을 뿐 필터링 방식은 과제 2 때 그대로다.
const filteredWeatherList = computed(() =>
  weatherStore.cityList.filter((city) => city.name.includes(searchQuery.value.trim())),
)

// 첫 통신이 끝나기 전에는 카드 대신 스켈레톤을 보여준다.
// 새로고침(이미 값이 있는 상태에서의 재요청) 때는 화면을 비우지 않는다. 멀쩡히 보이던 카드가 사라졌다 나타나면 더 불안하다.
const isFirstLoading = computed(() => weatherStore.isLoading && !weatherStore.hasData)

// ===== 과제 7 : 상단 요약 타일 =====
// 계산은 weatherStore.summary getter 가 한다. 통계 화면과 같은 것을 읽는다.
// 단, 미세먼지 나쁨 개수는 사용자가 정한 경계값에 따라 달라지므로 여기서 configStore 로 센다.
const summary = computed(() => weatherStore.summary)

const dustBadCount = computed(
  () => weatherStore.cityList.filter((city) => configStore.dustGrade(city.dust) === 'bad').length,
)

watch(selectedCityInfo, (newVal) => {
  logDev(`[watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newVal?.name}가 선택되었습니다"`)
})

// 과제 2 요구사항 3. searchQuery 가 computed 로 바뀌어도 watchEffect 는 그대로 추적한다.
// (반응형 소스가 ref 든 computed 든 watchEffect 는 읽은 것을 알아서 의존성으로 잡는다)
watchEffect(() => {
  logDev(
    `[watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다`,
  )
})

// 즐겨찾기 개수는 스토어의 getter 를 그대로 읽는다. 이 화면에는 이제 favorites 배열이 없다.
watch(
  () => favoritesStore.favoriteCount,
  (newVal, oldVal) => {
    logDev(`[watch] 즐겨찾기 개수가 ${oldVal}개 -> ${newVal}개로 변경되었습니다`)
  },
)
</script>

<template>
  <div>
    <!-- 과제 8. 제목 줄과 동기화 줄을 한 행으로 합쳤다.
         두 줄 다 "지금 무엇을 보고 있는가" 를 말하는 줄이라 나란히 두는 편이 읽기 쉽다.
         h3 는 지우지 않고 이 행 안으로 옮기기만 했다. 위쪽 헤더(App.vue)의 h1 과 겹쳐 보이던
         제목을 작은 글씨로 낮춰서, 같은 문구가 두 번 크게 나오지 않게만 했다. -->

    <!-- 과제 6 : 지금 보고 있는 값이 언제 것인지, 실제 관측값인지 목업인지 화면에 밝힌다 -->
    <div class="sync-bar">
      <h3 class="page-title">날씨 대시보드</h3>
      <el-tag v-if="weatherStore.isFallback" type="info" size="small" effect="dark" round>
        오프라인 데이터
      </el-tag>
      <el-tag v-else-if="weatherStore.lastFetched" type="success" size="small" effect="dark" round>
        실시간 관측
      </el-tag>
      <span class="sync-time">
        <template v-if="weatherStore.isLoading">불러오는 중...</template>
        <!-- "받은 시각" 이 아니라 "관측 시각" 을 말한다.
             엣지 캐시가 앞에 서 있으면 둘이 갈라지는데, 요청 시각을 쓰면 화면이
             "몇 초 전 · 실시간 관측" 이라고 하면서 실제로는 몇 분 전 값을 보여준다. -->
        <template v-else-if="weatherStore.observedLabel">
          {{ weatherStore.observedLabel }} 관측
        </template>
      </span>
      <el-button
        size="small"
        :loading="weatherStore.isLoading"
        :disabled="!isOnline"
        @click="weatherStore.refresh()"
      >
        새로고침
      </el-button>
    </div>

    <el-alert
      v-if="!isOnline"
      class="alert-gap"
      title="네트워크에 연결되어 있지 않습니다. 마지막으로 받아둔 값을 보여주는 중입니다."
      type="warning"
      show-icon
      :closable="false"
    />
    <el-alert
      v-else-if="weatherStore.error"
      class="alert-gap"
      :title="weatherStore.error"
      type="error"
      show-icon
      :closable="false"
    />

    <!-- 과제 8-2. 화면 순서를 "찾기 -> 보기 -> 곁들이기" 로 다시 짰다.
         지금까지는 검색·내 위치·즐겨찾기·최근 본 도시 카드가 먼저 나오고 도시 카드가 맨 아래였다.
         이 앱을 여는 이유는 도시 날씨를 보는 것이므로 그게 맨 위에 와야 한다.

         검색은 카드 껍데기를 벗기고 이 카드 안쪽 맨 위에 긴 바 하나로 넣었다.
         BaseDashboardCard 를 하나 덜 쓰게 되지만(5장 -> 4장) 컴포넌트도 슬롯 인터페이스도
         그대로 살아 있고 아래 세 카드가 계속 같은 껍데기를 쓴다. SearchBar 의 props/emits 도 그대로다.
         상자를 한 겹 줄인 만큼 "검색 -> 결과" 가 한 덩어리로 읽힌다. -->
    <BaseDashboardCard class="board-card">
      <template v-slot:title> 지역별 날씨 현황 </template>

      <!-- 검색 바. 알맹이(SearchBar)는 한 줄도 안 고쳤다.
           과제 1 요구사항 3 의 :model-value + @input 한글 처리가 그 안에 그대로 있다. -->
      <div class="search-bar">
        <SearchBar :search-query="searchQuery" @update-query="handleUpdateQuery" />
      </div>

      <!-- 과제 7 : 스켈레톤도 카드 그리드와 같은 격자에 깐다.
           과제 6 의 el-skeleton :rows="4" 는 실제 카드 모양과 안 닮아서 로딩→완료 때 화면이 튀었다. -->
      <div v-if="isFirstLoading" class="city-grid">
        <el-skeleton v-for="n in 6" :key="n" animated>
          <template #template>
            <div class="skeleton-card">
              <el-skeleton-item variant="text" style="width: 40%" />
              <el-skeleton-item variant="h1" style="width: 60%" />
              <el-skeleton-item variant="text" style="width: 90%" />
              <el-skeleton-item variant="button" style="width: 100%" />
            </div>
          </template>
        </el-skeleton>
      </div>

      <template v-else>
        <el-empty
          v-if="filteredWeatherList.length === 0"
          description="검색 결과와 일치하는 도시가 없습니다."
          :image-size="80"
        >
          <el-button type="primary" plain @click="handleUpdateQuery('')">검색어 지우기</el-button>
        </el-empty>

        <!-- 과제 7 : 세로 1열 → auto-fill 그리드.
             minmax(280px, 1fr) 이라 미디어쿼리 없이 폰 1열 / 태블릿 2열 / 데스크톱 3열이 된다. -->
        <div v-else class="city-grid">
          <WeatherCard
            v-for="city in filteredWeatherList"
            :key="city.id"
            :city="city"
            @select-card="handleSelectCard"
            @click-detail="handleClickDetail"
          />
        </div>
      </template>
    </BaseDashboardCard>

    <!-- 여기서부터는 곁들이는 정보. 위의 본체와 눈으로 끊어준다. -->
    <div class="section-divider" role="presentation"></div>

    <!-- 과제 7 추가 : 도시 6곳을 한 줄로 요약. 계산은 weatherStore.summary 가 하고 통계 화면과 공유한다.
         과제 8 이전에는 이 줄이 v-if="summary" 뿐이었고, 첫 진입 1~2초 동안
         "평균 기온 0.0℃ · 가장 더운 곳 서울 0.0℃" 가 그대로 노출됐다.
         cityList 가 EMPTY_WEATHER 로 6칸을 항상 채우기 때문에 통신 전에도 summary 가 null 이 아니었던 것이다.
         (바로 위 카드 그리드는 isFirstLoading 으로 스켈레톤을 깔고 있는데 이 줄만 빠져 있었다.)
         이제 summary 는 "도착한 도시" 만 집계하고 한 곳도 없으면 null 이라, v-if 하나로 갈린다. -->
    <div v-if="summary" class="summary-row">
      <el-card class="summary-tile" shadow="never">
        <!-- el-statistic 의 기본 precision 은 0 이라 24.9 가 25 로 반올림된다. 소수 한 자리를 그대로 보여준다 -->
        <el-statistic
          :value="configStore.convertTemp(summary.avgTemp)"
          :precision="1"
          :suffix="configStore.unitSymbol"
        >
          <template #title>평균 기온</template>
        </el-statistic>
      </el-card>
      <el-card class="summary-tile" shadow="never">
        <el-statistic :value="summary.avgHumidity" suffix="%">
          <template #title>평균 습도</template>
        </el-statistic>
      </el-card>
      <!-- 누르면 상세로 넘어가는 타일이라 실제로 버튼이다. div 에 @click 만 걸면 키보드로는 닿지 않는다.
           el-card 안에 다른 컨트롤이 없어서 role="button" 을 그대로 붙일 수 있다(카드 쪽과 다른 점). -->
      <el-card
        class="summary-tile summary-tile-link"
        shadow="never"
        role="button"
        tabindex="0"
        @click="handleClickDetail(summary.hottest.id)"
        @keydown.enter.prevent="handleClickDetail(summary.hottest.id)"
        @keydown.space.prevent="handleClickDetail(summary.hottest.id)"
      >
        <el-statistic
          :value="configStore.convertTemp(summary.hottest.temp)"
          :precision="1"
          :suffix="configStore.unitSymbol"
        >
          <template #title>가장 더운 곳 · {{ summary.hottest.name }}</template>
        </el-statistic>
      </el-card>
      <el-card class="summary-tile" shadow="never">
        <el-statistic :value="dustBadCount" suffix="곳">
          <template #title>미세먼지 나쁨</template>
        </el-statistic>
      </el-card>
    </div>

    <!-- 과제 8-2. 남은 보조 카드 3장. 도시 목록 아래로 내렸다.
         전부 과제 산출물이라 없애지 않고 자리만 옮긴다 - 내 위치(과제 6),
         즐겨찾기 / 최근 본 도시(과제 5 본인 추가 스토어의 유일한 노출면). -->
    <div class="utility-grid">
      <!-- 과제 6 추가 : 브라우저 위치 → 역지오코딩으로 한글 지명 → 그 좌표의 실제 날씨 -->
      <BaseDashboardCard>
        <template v-slot:title>내 위치 날씨</template>
        <div v-if="myPlace" class="myplace-row">
          <div>
            <p class="myplace-name">{{ myPlace.name }}</p>
            <p class="myplace-desc">
              {{ myPlace.temp }}℃ (체감 {{ myPlace.feelsLike }}℃) · {{ myPlace.status }} · 습도
              {{ myPlace.humidity }}%
            </p>
          </div>
          <el-button size="small" @click="requestMyLocation">다시 확인</el-button>
        </div>
        <div v-else class="myplace-row">
          <p class="myplace-desc">
            <template v-if="isLocating">위치를 확인하는 중입니다...</template>
            <template v-else-if="myPlaceError">{{ myPlaceError }}</template>
            <template v-else
              >브라우저 위치 권한을 허용하면 지금 있는 곳의 날씨를 보여줍니다.</template
            >
          </p>
          <el-button
            size="small"
            type="primary"
            plain
            :loading="isLocating"
            @click="requestMyLocation"
          >
            내 위치 확인
          </el-button>
        </div>
      </BaseDashboardCard>

      <!-- 즐겨찾기 요약 : 같은 껍데기를 재사용 -->
      <BaseDashboardCard>
        <template v-slot:title>즐겨찾기</template>
        <div class="favorite-row">
          <span class="favorite-list">
            <span v-if="favoritesStore.favoriteCount">
              {{ favoritesStore.favoriteCities.map((city) => city.name).join(', ') }}
              ({{ favoritesStore.favoriteCount }}개)
            </span>
            <span v-else>카드 왼쪽 체크박스로 즐겨찾기를 등록해 보세요.</span>
          </span>
          <el-button
            size="small"
            :disabled="favoritesStore.favoriteCount === 0"
            @click="favoritesStore.clearFavorites"
          >
            즐겨찾기 비우기
          </el-button>
        </div>
      </BaseDashboardCard>

      <!-- 과제 5 추가 : 상세 페이지에서 기록해둔 방문 이력을 여기서 꺼내 쓴다 -->
      <BaseDashboardCard v-if="recentStore.hasRecent">
        <template v-slot:title>최근 본 도시</template>
        <div class="recent-row">
          <el-tag
            v-for="city in recentStore.recentCities"
            :key="city.id"
            class="recent-chip"
            effect="plain"
            round
            role="button"
            tabindex="0"
            @click="handleClickDetail(city.id)"
            @keydown.enter.prevent="handleClickDetail(city.id)"
            @keydown.space.prevent="handleClickDetail(city.id)"
          >
            {{ city.name }}
          </el-tag>
          <el-button link type="info" class="recent-clear" @click="recentStore.clearRecent">
            기록 지우기
          </el-button>
        </div>
      </BaseDashboardCard>
    </div>

    <div class="status-bar">
      <span v-if="selectedCityInfo">{{ selectedCityInfo.name }}가 선택되었습니다.</span>
      <span v-else>카드를 클릭하거나 검색해 보세요.</span>
    </div>
  </div>
</template>

<style scoped>
/* slot 으로 주입한 마크업은 부모 스코프에서 컴파일되므로 이 scoped 스타일이 그대로 적용된다 */
.city-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  /* 과제 7. 카드 안 여백이 넓어져서 칸 사이도 12 → 16 으로 같이 올렸다.
     간격이 안쪽 여백보다 좁으면 카드 두 장이 한 덩어리로 붙어 보인다. */
  gap: var(--space-4);
}
/* 과제 8. minmax 하한이 컨테이너보다 커지는 구간을 막는다.
   실측: 뷰포트 360px 에서 .city-grid 의 컨테이너는 268px 인데 컬럼은 하한값 280px 로 잡힌다.
   지금은 12px 이 카드 안쪽 여백에 먹혀서 눈에 안 보이지만, 340px 이하로 더 좁아지면
   그대로 가로 스크롤이 된다 (과제 7 에서 없앤 바로 그 증상).
   폰에서는 어차피 1열이라 하한이 할 일이 없으므로 1fr 로 바꿔 하한 자체를 없앤다.
   420px 초과 구간의 auto-fill/minmax 는 건드리지 않는다 - 데스크톱 3열은 그대로다. */
@media (max-width: 420px) {
  .city-grid {
    grid-template-columns: 1fr;
  }
}
.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--c-surface);
  border: 1px solid var(--c-line);
  border-radius: var(--radius-m);
}
.summary-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
/* 과제 8. 폰에서 요약 타일이 세로로 4개 쌓여 380px 를 쓰고 있었다 (실측 375px 기준).
   minmax 하한이 160px 라 컨테이너 317px 에서 2열(160*2+12=332)이 안 들어가 1열로 떨어진다.
   타일 안에 든 것은 제목 한 줄 + 숫자 한 줄뿐이라 152px 폭이면 충분하다.
   보조 카드에 쓴 것과 같은 방법 - 칸 수를 내가 정해야 하는 자리에선 고정 열 수를 쓴다.
   380px -> 184px. 이 화면에서 도시 카드 다음으로 큰 블록이었다. */
@media (max-width: 720px) {
  .summary-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
.summary-tile {
  border-radius: var(--radius-m);
  border-color: var(--c-line);
}
.summary-tile :deep(.el-card__body) {
  padding: 14px 16px;
}
.summary-tile :deep(.el-statistic__head) {
  font-size: var(--fs-xs);
  color: var(--c-text-muted);
}
/* 과제 7. 요약 타일도 카드와 같은 규칙을 따른다 - 제목은 작고 흐리게, 숫자는 크고 진하게.
   tabular-nums 는 10분마다 값이 갱신될 때 타일 네 개의 숫자 폭이 제각각 달라지는 것을 막는다.
   (.num 유틸은 el-statistic 이 만드는 내부 엘리먼트에 붙일 수 없어서 :deep 으로 같은 속성만 준다) */
.summary-tile :deep(.el-statistic__content) {
  font-size: var(--fs-h2);
  font-weight: var(--fw-bold);
  color: var(--c-text);
  font-variant-numeric: tabular-nums;
}
.summary-tile-link {
  cursor: pointer;
  transition: border-color var(--dur) ease;
}
.summary-tile-link:hover {
  border-color: var(--c-line-strong);
}
/* 과제 8-2. 보조 카드가 4장 -> 3장이 되면서(검색이 본체 카드 안으로 들어갔다) 3열로 바꿨다.
   - min-width: 0 - 격자 칸의 기본값은 auto 라서, 안쪽에 안 잘리는 긴 문자열이 들어오면
     칸이 스스로 넓어지며 컨테이너를 밀어낸다. 즐겨찾기 도시 이름이 길어질 때를 대비한다.
   - "최근 본 도시" 는 v-if 라 기록이 없으면 2장만 남는다. 고정 3열이면 오른쪽 한 칸이
     빈 채로 남으므로, 여기서는 auto-fit 을 써서 남은 카드가 폭을 나눠 갖게 한다.
   - minmax 하한 300px 은 1106px 에서 3열(300*3+32=932), 768px 구간에서 2열이 되는 값이다.
     하한이 컨테이너보다 커지는 폰 구간은 아래 미디어쿼리에서 1fr 로 없앤다. */
.utility-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}
.utility-grid > * {
  min-width: 0;
}
/* BaseDashboardCard 는 세로로 쌓이는 걸 전제로 margin-bottom 을 갖고 있다.
   격자 안에서는 gap 이 그 역할을 하므로 마진이 남으면 행 사이만 벌어진다.
   자식 컴포넌트의 루트 엘리먼트라 scoped 에서 :deep() 없이도 닿지만, 의도를 드러내려고 명시한다. */
.utility-grid :deep(.dashboard-card) {
  margin-bottom: 0;
  height: 100%;
}

/* 폰에서는 여러 열이 들어갈 폭이 안 나온다. 한 줄에 카드 하나씩으로 되돌리면서
   minmax 하한(300px)도 같이 없앤다. 하한이 컨테이너보다 크면 칸이 밖으로 삐져나온다. */
@media (max-width: 720px) {
  .utility-grid {
    grid-template-columns: 1fr;
  }
}

/* ===== 과제 8-2. 본체 카드 (검색 바 + 도시 그리드) ===== */

/* 이 카드 하나가 화면의 주인공이다. 나머지(요약 타일·보조 카드 3장)는 아래에서
   곁들이는 정보라 시각적으로 한 단계 낮다. 그 차이를 여백으로만 준다.
   면 색이나 그림자를 더 얹지 않는 이유 - base.css 가 "그림자 대신 1px 보더" 로 잡혀 있어서
   여기만 규칙을 깨면 오히려 겉돈다. */
.board-card {
  margin-bottom: var(--space-6);
}


/* 검색 바. 카드 안쪽 맨 위에서 폭을 꽉 채운다.
   el-input 은 자기 내부(.el-input__wrapper)에서 높이와 반경을 정하므로 :deep 으로 닿아야 한다.
   SearchBar 쪽 <style scoped> 는 손대지 않았다 - 그쪽은 컴포넌트가 어디에 놓이든 같아야 하는 규칙이고,
   "이 화면에서 얼마나 큰 바로 보일지" 는 놓는 쪽이 정할 일이다. */
.search-bar {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--c-line);
}
.search-bar :deep(.el-input__wrapper) {
  padding: 4px 16px;
  border-radius: var(--radius-m);
  background-color: var(--c-surface-mute);
  /* none 이 아니라 "투명한 링" 으로 둔다.
     el-input 은 box-shadow 에 transition 을 걸어두는데, none -> 링 은 보간 시작값이 없어서
     전환이 어정쩡하게 끊긴다. 두께를 맞춰두면 색만 바뀌어 깔끔하게 들어온다. */
  box-shadow: 0 0 0 2px transparent inset;
}
.search-bar :deep(.el-input__wrapper:hover) {
  background-color: var(--c-surface-soft);
}
/* 포커스일 때만 브랜드색 링. 평소에 테두리를 그리지 않아서 바가 화면에 묻지 않고 떠 있는다 */
.search-bar :deep(.el-input__wrapper.is-focus) {
  background-color: var(--c-surface);
  box-shadow: 0 0 0 2px var(--c-brand) inset;
}
.search-bar :deep(.el-input__inner) {
  height: 40px;
  font-size: var(--fs-body);
}

/* 본체와 곁들이는 정보 사이의 경계. 제목을 하나 더 만들지 않고 선 하나로 끊는다.
   role="presentation" 을 준 이유 - 이건 순수하게 보기 위한 선이라 스크린리더가 읽을 것이 없다. */
.section-divider {
  height: 1px;
  margin-bottom: var(--space-6);
  background-color: var(--c-line);
}

/* .myplace-row 와 같은 이유로 wrap 을 쓰지 않는다 (위 주석 참고). */
.favorite-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
.favorite-list {
  min-width: 0;
  font-size: var(--fs-sm);
  color: var(--c-text-sub);
}
.favorite-row .el-button {
  flex-shrink: 0;
}

/* 원래 assets/weather.css 에 있던 규칙이다. 그 파일은 과제 1~3 화면(/legacy)을 위해
   전역으로 깔려 있었는데, 그 화면이 사라지면서 이 한 줄만 쓰이고 있었다.
   유일한 사용처인 여기로 옮기고 파일은 지웠다. */
.status-bar {
  margin-top: var(--space-4);
  padding: var(--space-3);
  font-size: var(--fs-sm);
  text-align: center;
  color: var(--c-text);
  background-color: var(--c-brand-soft);
  border: 1px solid var(--c-brand-line);
  border-radius: var(--radius-m);
}
.recent-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1);
}
.recent-chip {
  cursor: pointer;
}
.recent-clear {
  margin-left: auto;
  font-size: var(--fs-xs);
}
.sync-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}
/* 과제 8. 이 행으로 옮겨온 h3.
   practice.css 의 h3 는 margin-top:20px 을 갖고 있어서 그대로 두면 행이 위로 어긋난다.
   위쪽 헤더에 이미 같은 문구가 h1(20px)으로 있으므로 여기서는 한 단계 낮춘 크기로 쓴다. */
.page-title {
  margin: 0;
  font-size: var(--fs-h3);
  font-weight: var(--fw-bold);
  color: var(--c-text);
}
.sync-time {
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}
.sync-bar .el-button {
  margin-left: auto;
}
.alert-gap {
  margin-bottom: 10px;
}
/* 과제 8. 카드 폭이 1106 -> 545px(데스크톱 2열) / 317px(폰) 로 좁아진다.
   여기에 flex-wrap: wrap 을 주면 안 된다. 실측으로 확인한 내용:
   wrap 이 켜지면 flex 아이템이 기본 크기(<p> 의 max-content) 아래로 줄어들기 전에 먼저 줄바꿈해서,
   버튼이 통째로 다음 줄로 내려간다. 375px 에서 카드가 98px -> 153px 로 커졌다.
   wrap 없이 두면 <p> 가 눌리면서 글자만 안에서 접히고 버튼은 옆에 남는다. 이쪽이 훨씬 낮다.
   대신 버튼이 눌려 글자가 쪼개지지 않도록 flex-shrink 를 잠그고, <p> 만 줄어들게 한다. */
.myplace-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
.myplace-row > div {
  min-width: 0;
}
.myplace-row .el-button {
  flex-shrink: 0;
}
.myplace-name {
  margin: 0;
  font-size: var(--fs-body);
  font-weight: var(--fw-bold);
  color: var(--c-text);
}
.myplace-desc {
  margin: 2px 0 0 0;
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}
</style>
