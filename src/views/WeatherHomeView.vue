<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGeolocation, useIntervalFn, useOnline } from '@vueuse/core'
import { useWeatherStore } from '@/stores/weatherStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useRecentStore } from '@/stores/recentStore'
import { useConfigStore } from '@/stores/configStore'
import { getCurrentWeather, getPlaceName } from '@/api/weather'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'

// 과제 4. 과제 3 의 WeatherParent 를 "/" 경로의 페이지 컴포넌트로 승격시킨 화면.
// 과제 5. 즐겨찾기/최근 본 도시는 스토어로 옮기고, 이 화면에는 검색 상태만 남겼다.
// 과제 6. 목업 배열(weatherData)을 직접 들고 있던 자리를 weatherStore 로 바꿨다.
//         이 화면은 이제 데이터를 "가지고" 있지 않고 스토어에 요청하고 그리기만 한다. URL 도 키도 모른다.
// 과제 7. 두 가지가 바뀌었다.
//   1) fetchAll() 호출이 여기서 사라졌다. App.vue 한 곳으로 올렸다.
//      이 화면은 이제 데이터를 "받아오는" 일에도 관여하지 않고 오로지 읽고 그리기만 한다.
//   2) 검색어를 주소창 단방향으로 바꿨다. 아래 설명 참고.
const route = useRoute()
const router = useRouter()
const weatherStore = useWeatherStore()
const favoritesStore = useFavoritesStore()
const recentStore = useRecentStore()
const configStore = useConfigStore()

// ===== 검색어 (과제 7 - 단방향 전환) =====
// 과제 6 까지는 이랬다.
//   - onMounted 에서 route.query.search → searchQuery  (URL → 상태)
//   - watch(searchQuery) 에서 searchQuery → router.replace  (상태 → URL)
// 값 하나에 저장소가 둘이고 서로를 갱신하는 구조였다. replace 라서 무한루프는 안 났지만,
// 뒤로가기로 주소가 바뀌면 화면이 안 따라왔다. onMounted 는 이미 끝난 뒤라서.
//
// 이제 주소창 하나를 원본으로 삼는다. 화면은 거기서 파생만 한다.
//   입력 → router.replace → route.query → computed → 화면
// 흐름이 한 방향이고, 상태를 복원하는 코드도 동기화하는 watch 도 둘 다 없어졌다.
// 새로고침·링크 공유·뒤로가기가 전부 자동으로 맞는다.
const searchQuery = computed(() => String(route.query.search ?? ''))

const handleUpdateQuery = (newQuery) => {
  // 상태를 고치는 게 아니라 주소를 고친다. 그러면 위 computed 가 알아서 따라온다.
  // push 가 아니라 replace 인 이유 - 글자 하나마다 히스토리가 쌓이면 뒤로가기가 먹통이 된다.
  router.replace({
    path: route.path,
    query: { search: newQuery || undefined },
  })
}

// 과제 6 : 10분마다 자동 갱신. 캐시 유효시간과 같은 간격이라 화면을 켜둔 채로 두면 계속 최신값이 된다.
// setInterval 을 직접 쓰면 화면을 떠날 때 clearInterval 을 잊기 쉬운데, useIntervalFn 은 언마운트 시 알아서 멈춘다.
// 과제 7 : fetchAll 은 App.vue 로 올렸지만 이건 홈에 남긴다. 안 보고 있는 화면 때문에 호출 한도를 쓸 이유가 없다.
useIntervalFn(() => weatherStore.refresh(), 10 * 60 * 1000)

// 과제 6 : 브라우저의 온라인/오프라인 상태. 끊긴 상태에서 새로고침을 눌러봐야 실패만 하므로 버튼을 잠근다.
const isOnline = useOnline()

// ===== 내 위치 날씨 (요구사항 2 - 역지오코딩 API) =====
// 이 화면에서만 쓰는 값이라 스토어로 올리지 않는다. 다른 화면은 내 위치를 궁금해하지 않는다.
// immediate: false - 화면에 들어오자마자 위치 권한 팝업을 띄우면 무례하다. 버튼을 눌렀을 때만 물어본다.
const { coords, error: geoError, resume } = useGeolocation({ immediate: false })

const myPlace = ref(null) // { name, temp, feelsLike, status, humidity }
const isLocating = ref(false)
const myPlaceError = ref('')

const requestMyLocation = () => {
  isLocating.value = true
  myPlaceError.value = ''
  resume() // 여기서 브라우저 권한 팝업이 뜬다
}

// 좌표가 잡히면 두 API 를 이어서 부른다 : 좌표 → 한글 지명(역지오코딩) + 그 좌표의 현재 날씨.
// useGeolocation 은 권한을 받기 전까지 좌표를 Infinity 로 채워두므로 유효한 값인지 먼저 걸러야 한다.
watch(coords, async (newCoords) => {
  const { latitude, longitude } = newCoords
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return

  try {
    const [name, current] = await Promise.all([
      getPlaceName({ lat: latitude, lon: longitude }),
      getCurrentWeather({ lat: latitude, lon: longitude }),
    ])
    myPlace.value = { name, ...current }
  } catch (error) {
    myPlaceError.value = error.message
  } finally {
    isLocating.value = false
  }
})

// 권한을 거부하면 좌표가 영영 오지 않는다. 그때는 로딩 표시를 풀고 안내 문구로 바꾼다.
watch(geoError, (newError) => {
  if (!newError) return
  isLocating.value = false
  myPlaceError.value =
    newError.code === 1
      ? '위치 권한이 거부되었습니다. 아래 도시 목록은 그대로 사용할 수 있습니다.'
      : '위치를 확인하지 못했습니다.'
})

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
  console.log(
    `[watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newVal?.name}가 선택되었습니다"`,
  )
})

// 과제 2 요구사항 3. searchQuery 가 computed 로 바뀌어도 watchEffect 는 그대로 추적한다.
// (반응형 소스가 ref 든 computed 든 watchEffect 는 읽은 것을 알아서 의존성으로 잡는다)
watchEffect(() => {
  console.log(
    `[watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다`,
  )
})

// 즐겨찾기 개수는 스토어의 getter 를 그대로 읽는다. 이 화면에는 이제 favorites 배열이 없다.
watch(
  () => favoritesStore.favoriteCount,
  (newVal, oldVal) => {
    console.log(`[watch] 즐겨찾기 개수가 ${oldVal}개 -> ${newVal}개로 변경되었습니다`)
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
        <template v-else-if="weatherStore.lastFetched">
          {{ weatherStore.lastFetchedLabel }} 기준
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

    <!-- 과제 7 추가 : 도시 6곳을 한 줄로 요약. 계산은 weatherStore.summary 가 하고 통계 화면과 공유한다 -->
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
      <el-card
        class="summary-tile summary-tile-link"
        shadow="never"
        @click="handleClickDetail(summary.hottest.id)"
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

    <!-- 과제 8. 한 줄짜리 보조 카드 4장을 2x2 격자로 묶었다.
         세로로 쌓았을 때 438px 를 쓰던 자리다. 내용은 전부 한 줄인데 폭 1106px 를
         혼자 차지하고 있어서, 아래 도시 카드 그리드가 첫 화면 밖(y=959)으로 밀려나 있었다.
         카드를 지운 게 아니라 자리만 바꿨다 - 검색(과제 1~3)·내 위치(과제 6)·
         즐겨찾기/최근 본 도시(과제 5)는 전부 과제 산출물이라 하나도 없애면 안 된다.
         순서는 검색 > 내 위치 > 즐겨찾기 > 최근 본 도시.
         조건부(v-if)인 최근 본 도시를 마지막에 둬야 기록이 없을 때 격자가 깔끔하게 3칸이 된다. -->
    <div class="utility-grid">
      <!-- 검색박스 : 껍데기는 BaseDashboardCard, 알맹이는 SearchBar 를 slot 으로 주입 -->
      <BaseDashboardCard>
        <template v-slot:title>도시 검색 (한글 즉시 동기화)</template>
        <SearchBar :search-query="searchQuery" @update-query="handleUpdateQuery" />
      </BaseDashboardCard>

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
            @click="handleClickDetail(city.id)"
          >
            {{ city.name }}
          </el-tag>
          <el-button link type="info" class="recent-clear" @click="recentStore.clearRecent">
            기록 지우기
          </el-button>
        </div>
      </BaseDashboardCard>
    </div>

    <!-- 리스트박스 : 같은 껍데기 안에 WeatherCard 를 v-for 로 주입 -->
    <BaseDashboardCard>
      <template v-slot:title>지역별 날씨 현황 (상세보기 → /weather/:cityId 이동)</template>

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
/* 과제 8. 보조 카드 4장을 담는 격자.
   - repeat(2, 1fr) 을 쓴다. auto-fit + minmax 를 쓰면 1106px 폭에서 3열로 떨어져
     2x2 가 안 나온다. 여기는 칸 수를 내가 정해야 하는 자리라 고정 2열이 맞다.
   - 아래 .city-grid 의 minmax(280px, 1fr) 은 손대지 않았다. 도시 카드 그리드는 폭이
     그대로(1106px)라 열 수가 바뀌지 않는다. minmax 하한을 건드리면 가로 스크롤이 다시 생긴다.
   - min-width: 0 - 격자 칸의 기본값은 auto 라서, 안쪽에 안 잘리는 긴 문자열이 들어오면
     칸이 스스로 넓어지며 컨테이너를 밀어낸다. 즐겨찾기 도시 이름이 길어질 때를 대비한다. */
.utility-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

/* 폰에서는 2열이 들어갈 폭이 안 나온다. 한 줄에 카드 하나씩으로 되돌린다.
   720px 은 카드 하나가 최소한의 폭(약 330px)을 유지할 수 있는 경계다. */
@media (max-width: 720px) {
  .utility-grid {
    grid-template-columns: 1fr;
  }
}

.favorite-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}
.favorite-list {
  font-size: var(--fs-sm);
  color: var(--c-text-sub);
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
/* 과제 8. 카드 폭이 1106 -> 545px 로 절반이 되면서 한 줄에 안 들어가는 경우가 생긴다.
   flex-wrap 이 없으면 안쪽 요소가 서로를 눌러 버튼 글자가 세로로 쪼개진다. */
.myplace-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
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
