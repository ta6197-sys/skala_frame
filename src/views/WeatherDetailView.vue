<script setup>
import { ref, computed, watch, onMounted, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cities, findCity } from '@/data/cities'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useRecentStore } from '@/stores/recentStore'
import { useCityForecast } from '@/composables/useCityForecast'
import { useQueryParam } from '@/composables/useQueryParam'
import { getLifeIndexList } from '@/data/lifeIndex'
import { getUvIndex } from '@/api/weather'
import { formatHourLabel } from '@/utils/dayjs'
import { getWeatherKind } from '@/data/weatherKind'
import BaseDashboardCard from '@/components/common/BaseDashboardCard.vue'
import BaseChart from '@/components/common/BaseChart.vue'
import { chartBase, cssVar } from '@/utils/chartTheme'
import WeatherBackdrop from '@/components/weather/WeatherBackdrop.vue'

// 개발용 배경 미리보기 도구.
// 정적 import 로 가져오면 배포 빌드에도 코드가 딸려 들어간다(렌더되지 않을 뿐이다).
// 동적 import 를 삼항 안에 두면 prod 에서 import.meta.env.DEV 가 false 로 치환되면서
// 이 import 에 닿을 길이 없어지고, 번들러가 청크째로 들어낸다.
const WeatherPreviewSwitch = import.meta.env.DEV
  ? defineAsyncComponent(() => import('@/components/weather/WeatherPreviewSwitch.vue'))
  : null
import LifeIndexBar from '@/components/weather/LifeIndexBar.vue'
import OutfitSuggestion from '@/components/weather/OutfitSuggestion.vue'

// 과제 4. /weather/:cityId 동적 경로가 매칭될 때 열리는 상세 페이지.
// 과제 6. 목업에서 도시를 찾던 자리를 weatherStore 로 바꾸고, 이 화면에서만 쓰는 예보/자외선을 여기서 직접 받는다.
// 과제 7. 화면 구성을 바꿨다.
//   - 상단에 히어로(아이콘 + 큰 기온 + 날씨별 배경)를 두고 이전/다음 도시 이동을 그 옆으로 올렸다.
//     과제 6 까지는 카드 6개가 세로로만 쌓여서 도시를 옮기려면 맨 아래까지 스크롤해야 했다.
//   - 관측 항목 table 6행 → el-descriptions. 세로 길이가 1/3 로 줄고 반응형·구분선을 공짜로 얻는다.
//   - 시간별 예보를 세로 리스트 → 가로 스크롤 카드로. 시간 흐름은 가로로 읽는 게 자연스럽다.
const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()
const favoritesStore = useFavoritesStore()
const recentStore = useRecentStore()

// 자외선은 이 화면 말고 쓰는 데가 없어서 스토어로 올리지 않고 지역 상태로 둔다.
const uvIndex = ref(null)
const isDetailLoading = ref(false)
const detailError = ref('')

// 도시 정보 + 예보 가공은 composable 이 맡는다.
// 이 화면에 있던 예보 계산(오늘 구간 자르기 · 최적 시간대 · 막대 높이 · 시각 라벨)은 마크업을 하나도 모르는
// 순수 계산이었다. 도시 코드 하나만 주면 나머지는 거기서 끝난다.
// ref 에 복사하지 않고 computed 로 읽는 이유는 그대로다 - 복사해두면 스토어가 갱신돼도 이 화면만 옛날 값을 붙든다.
// timezone 은 아래 '가장 좋은 시간' 의 formatHourLabel(best.time, timezone) 이 쓰는데 여기서 빠져 있었다.
// 템플릿에서 없는 변수를 참조하면 undefined 가 넘어가고, formatHourLabel 의 기본값(Asia/Seoul)이 대신 먹어서
// 한국 도시만 있는 지금은 결과가 맞아 보였다. 도시를 해외로 늘리는 순간 조용히 틀린 시각을 그린다.
const { cityData, targetSlots, isTodayRange, bestTimeList, slotHourLabel, timezone } =
  useCityForecast(() => route.params.cityId)

// 주소창의 도시 코드가 바뀔 때마다 해야 할 일 : 방문 기록 + 없는 데이터 채우기 + 자외선 재요청
const loadCity = async (cityId) => {
  if (!findCity(cityId)) return // /weather/city_99 처럼 없는 코드면 아무것도 하지 않는다

  recentStore.addRecent(cityId)
  isDetailLoading.value = true
  detailError.value = ''
  uvIndex.value = null

  // 대시보드를 거치지 않고 이 주소로 바로 들어온 경우엔 스토어가 비어 있다. 그때만 받아온다.
  // 실패하면 스토어가 목업으로 내려앉히므로 여기서는 통신 결과를 다시 판단하지 않는다.
  await weatherStore.ensureCity(cityId)

  // 자외선은 Open-Meteo 라 OpenWeatherMap 키와 무관하다.
  // 위 호출이 실패해도 이건 성공할 수 있어서 try 를 따로 잡는다. 한 덩어리로 묶으면 멀쩡한 값까지 같이 날아간다.
  try {
    const city = findCity(cityId)
    uvIndex.value = await getUvIndex({ lat: city.lat, lon: city.lon })
  } catch (caught) {
    detailError.value = caught.message
  } finally {
    isDetailLoading.value = false
  }
}

// 요구사항대로 Mount 시점에 route.params.cityId 를 읽어 도시를 선택한다.
onMounted(() => {
  loadCity(route.params.cityId)
})

// 주의: /weather/city_01 → /weather/city_02 처럼 같은 컴포넌트끼리 이동하면
// 컴포넌트가 재사용되어 onMounted 가 다시 실행되지 않는다. 그래서 파라미터 변화도 함께 감시한다.
// 과제 4 에서는 화면이 안 바뀌는 문제였지만, 이제는 여기에 API 호출이 걸려 있어서 자외선이 이전 도시 값으로 남는 문제가 된다.
watch(
  () => route.params.cityId,
  (newId) => {
    if (newId) loadCity(newId)
  },
)

// 예보 시점의 아이콘은 API 가 안 주므로(우리 getForecast 가 status 만 뽑아온다) 문구로 판단해 이모지를 붙인다.
const slotEmoji = (status) => {
  if (status.includes('비') || status.includes('소나기')) return '🌧️'
  if (status.includes('눈')) return '🌨️'
  if (status.includes('흐림') || status.includes('구름')) return '☁️'
  if (status.includes('맑')) return '☀️'
  return '🌤️'
}

// ===== 과제 9. 시간별 예보 콤보 차트 =====
// 과제 7 에서 이 자리는 CSS 로 만든 세로 막대였다. 기온 하나만 길이로 바꾸는 일이라 그걸로 충분했고,
// "막대 높이는 원본 섭씨 기준" 이라는 주석까지 달아 화씨에서 비율이 압축되는 문제를 설명해 두었다.
// 바꾼 이유는 축이 하나 더 필요해졌기 때문이다.
//   - 기온(℃/℉)과 강수확률(%)은 단위가 다르고 범위도 다르다(24~28 vs 0~100).
//     같은 막대 트랙에 얹을 수가 없어서 강수확률은 막대 아래 '💧40%' 라는 글자로만 남아 있었다.
//   - 글자로 흩어져 있으면 "기온이 꺾이는 시각에 비 확률이 오르는가" 를 눈으로 잇지 못한다. 그게 이 표의 핵심인데.
// 축 두 개(왼쪽 기온 / 오른쪽 강수확률)를 겹치는 순간부터는 손으로 만들 일이 아니다.
//
// 화씨 문제도 여기서 사라진다. ECharts 의 y축은 scale: true 로 데이터 범위에 맞춰 눈금을 잡으므로
// 0 을 기준점으로 삼지 않는다. 단위를 바꿔도 선의 모양이 그대로다.
const forecastChart = computed(() => {
  const slots = targetSlots.value
  if (!slots.length) return null

  const base = chartBase()
  const tempColor = cssVar('--c-hot', '#f04452')
  const rainColor = cssVar('--c-cool', '#0ea5e9')
  const axisLabel = base.yAxis.axisLabel

  return {
    ...base,
    // 오른쪽 축 라벨(%)이 잘리지 않도록 기본 여백에서 오른쪽만 넓힌다.
    grid: { ...base.grid, right: 20, top: 34 },
    legend: {
      top: 0,
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 14,
      textStyle: { color: axisLabel.color, fontSize: 12 },
    },
    tooltip: {
      ...base.tooltip,
      // 두 계열의 단위가 다르므로 valueFormatter 하나로는 안 된다. 행을 직접 만든다.
      // 날씨 상태(맑음/비)는 계열이 아니라 그 시각의 성질이라, 계열 목록 위에 한 줄로 붙인다.
      formatter: (params) => {
        const slot = slots[params[0].dataIndex]
        const head = `${params[0].axisValue} · ${slotEmoji(slot.status)} ${slot.status}`
        const rows = params
          .map((item) => {
            const unit = item.seriesName === '강수확률' ? '%' : configStore.unitSymbol
            return `${item.marker}${item.seriesName} <b>${item.value}${unit}</b>`
          })
          .join('<br/>')
        return `${head}<br/>${rows}`
      },
    },
    xAxis: { ...base.xAxis, boundaryGap: true, data: slots.map((slot) => slotHourLabel(slot.time)) },
    yAxis: [
      {
        ...base.yAxis,
        axisLabel: { ...axisLabel, formatter: `{value}${configStore.unitSymbol}` },
      },
      {
        ...base.yAxis,
        // 강수확률은 0~100 이 정해진 범위다. scale 로 늘렸다 줄였다 하면 "40%" 막대가 시각마다 다른 높이로 보인다.
        scale: false,
        min: 0,
        max: 100,
        // 오른쪽 축까지 가로선을 그리면 왼쪽 축의 눈금선과 어긋나 격자가 두 겹으로 보인다.
        splitLine: { show: false },
        axisLabel: { ...axisLabel, formatter: '{value}%' },
      },
    ],
    series: [
      {
        name: '강수확률',
        type: 'bar',
        yAxisIndex: 1,
        barWidth: '38%',
        itemStyle: { color: rainColor, opacity: 0.35, borderRadius: [4, 4, 0, 0] },
        data: slots.map((slot) => slot.rainProb),
      },
      {
        name: '기온',
        type: 'line',
        yAxisIndex: 0,
        smooth: true,
        symbolSize: 7,
        lineStyle: { width: 2.5, color: tempColor },
        itemStyle: { color: tempColor },
        areaStyle: { color: tempColor, opacity: 0.06 },
        // 막대 뒤로 숨지 않게 선을 위에 올린다.
        z: 3,
        // 변환은 그릴 때 한 번만. 통계 화면의 추이 차트와 같은 원칙이다.
        data: slots.map((slot) => configStore.convertTemp(slot.temp)),
      },
    ],
  }
})

// 이전/다음 도시 이동용 인덱스 계산. 목록의 출처만 cities.js 로 바뀌었다.
const currentIndex = computed(() => cities.findIndex((city) => city.id === route.params.cityId))
const prevCity = computed(() => (currentIndex.value > 0 ? cities[currentIndex.value - 1] : null))
const nextCity = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < cities.length - 1
    ? cities[currentIndex.value + 1]
    : null,
)

// 과제 5 : 화면에 뿌릴 온도는 전부 configStore 의 convertTemp 를 거친다.
// 기온만 바꾸고 체감온도를 그냥 두면 화씨 모드에서 "82℉ / 체감 30℉" 처럼 어긋나므로 둘 다 변환한다.
const displayTemp = computed(() =>
  cityData.value ? configStore.convertTemp(cityData.value.temp) : 0,
)
const displayFeelsLike = computed(() =>
  cityData.value ? configStore.convertTemp(cityData.value.feelsLike) : 0,
)

// 과제 7. 히어로 배경을 날씨에 따라 바꾼다.
// 색을 CSS 에 박지 않고 데이터가 클래스를 고르게 하는 방식 - Vue.pdf p.6 의 ":class 로 동적 표현" 지침.
// 판정식은 data/weatherKind.js 한 곳에 있다. 화면 전체 배경(WeatherBackdrop)도 같은 함수를 쓰기 때문에
// 여기에 if 문을 다시 두면 나중에 한쪽만 고쳐서 히어로와 배경이 서로 다른 날씨를 그리게 된다.
// ===== 개발용 : 배경 연출 미리보기 =====
// 도시 6곳이 전부 비슷한 날씨면 눈·안개·뇌우 배경을 영영 못 본다. 그래서 주소창으로 강제할 수 있게 뒀다.
//   /weather/city_01?preview=13n  → 밤에 내리는 눈으로 그린다
//
// 검색어(WeatherHomeView)와 같은 방식이다. 주소창이 원본이고 화면은 computed 로 파생만 한다.
// ref 를 따로 두면 값이 두 곳에 생기고 뒤로가기에서 어긋난다. (과제 7 원칙 1)
//
// import.meta.env.DEV 는 Vite 가 빌드할 때 false 로 치환한다.
// 그래서 배포본에서는 이 computed 가 항상 null 이고, ?preview= 를 붙여도 아무 일도 일어나지 않는다.
// 아무 문자열이나 받으면 unknown 으로 떨어져 배경이 사라진다. 아는 코드일 때만 통과시킨다.
const { value: previewParam, setValue: handleUpdatePreview } = useQueryParam('preview', {
  validate: (value) => getWeatherKind(value) !== 'unknown',
})

const previewIcon = computed(() => (import.meta.env.DEV ? previewParam.value || null : null))

const isPreviewing = computed(() => previewIcon.value !== null)

// 화면이 실제로 그릴 때 쓰는 아이콘. 미리보기가 켜져 있으면 그것을, 아니면 관측값을.
// 히어로 그라디언트 · 히어로 아이콘 이미지 · 화면 배경이 전부 이 하나를 본다.
const displayIcon = computed(() => previewIcon.value ?? cityData.value?.icon ?? null)

const heroTheme = computed(() => `hero-${getWeatherKind(displayIcon.value)}`)

const heroIconUrl = computed(() =>
  displayIcon.value ? `https://openweathermap.org/img/wn/${displayIcon.value}@4x.png` : null,
)

// 미세먼지 등급 판정은 스토어에 맡기고, 여기서는 문구만 만든다. 경계값은 설정 화면에서 바뀐다.
// 과제 6 부터 이 숫자는 실제 PM10 관측값이다.
const dustInfo = computed(() => {
  if (!cityData.value) return { text: '', type: 'info' }
  const dust = cityData.value.dust
  const grade = configStore.dustGrade(dust)
  if (grade === 'good') return { text: `좋음 (PM10 ${dust})`, type: 'success' }
  if (grade === 'normal') return { text: `보통 (PM10 ${dust})`, type: 'warning' }
  return { text: `나쁨 (PM10 ${dust})`, type: 'danger' }
})

// 자외선 등급. 기상청/WHO 가 쓰는 구간을 그대로 따른다.
const uvLevel = computed(() => {
  if (!uvIndex.value) return ''
  const value = uvIndex.value.max
  if (value >= 11) return '위험'
  if (value >= 8) return '매우 높음'
  if (value >= 6) return '높음'
  if (value >= 3) return '보통'
  return '낮음'
})

// 생활지수 3종. 계산은 data/lifeIndex.js 의 순수 함수가 하고 여기서는 결과 배열만 받아 v-for 로 그린다.
const lifeIndexList = computed(() => (cityData.value ? getLifeIndexList(cityData.value) : []))

// 차이도 현재 단위 기준으로 계산한다. 섭씨 2도 차이는 화씨로는 3.6도라서, 원본끼리 빼면 화면과 숫자가 안 맞는다.
const tempGap = computed(() => {
  if (!cityData.value) return ''
  const gap = Math.round((displayFeelsLike.value - displayTemp.value) * 10) / 10
  const symbol = configStore.unitSymbol
  if (gap > 0) return `실제보다 ${gap}${symbol} 덥게 느껴집니다.`
  if (gap < 0) return `실제보다 ${Math.abs(gap)}${symbol} 춥게 느껴집니다.`
  return '체감온도와 실제 기온이 같습니다.'
})

// 화면에 띄울 에러 문구. 자외선 쪽 실패는 이 화면만의 문제이고, 나머지는 스토어가 들고 있다.
const visibleError = computed(() => detailError.value || weatherStore.error)

// Programmatic Navigation : 이름 있는 라우트 + params 조합으로도 이동할 수 있다.
const goCity = (cityId) => {
  router.push({ name: 'WeatherDetail', params: { cityId } })
}
const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="detail-page">
    <!-- 과제 7(나만의 추가) : 지금 보고 있는 도시의 날씨가 화면 전체 배경이 된다.
         icon 이 없으면(폴백 목업) 컴포넌트가 스스로 아무것도 그리지 않는다. -->
    <WeatherBackdrop :icon="displayIcon" />

    <!-- 본문은 배경보다 위(z-index: 1)에 둔다. 안 그러면 빗줄기가 글자 위로 지나간다 -->
    <div class="detail-content">
      <h3>지역별 상세 기상관측 정보</h3>

      <!-- 개발 중에만 보이는 도구. 배포 빌드에서는 WeatherPreviewSwitch 가 null 이라 렌더되지 않는다. -->
      <component
        :is="WeatherPreviewSwitch"
        v-if="WeatherPreviewSwitch"
        :current-icon="displayIcon"
        :is-previewing="isPreviewing"
        @update-preview="handleUpdatePreview"
      />

      <!-- 미리보기 중에는 화면의 배경/아이콘이 실제 관측값이 아니라는 걸 분명히 밝힌다.
           안 그러면 스크린샷을 찍어두고 나중에 진짜 날씨로 착각하게 된다. -->
      <el-alert
        v-if="isPreviewing"
        class="alert-gap"
        :title="`배경 미리보기 중입니다 (${displayIcon}). 기온·습도 등 표의 숫자는 실제 관측값 그대로입니다.`"
        type="warning"
        show-icon
        :closable="false"
      />

      <!-- 정상적으로 도시를 찾은 경우 -->
      <template v-if="cityData">
        <el-alert
          v-if="visibleError"
          class="alert-gap"
          :title="visibleError"
          type="error"
          show-icon
          :closable="false"
        />

        <!-- 과제 7 : 히어로. 배경은 icon 코드가 고른다 -->
        <section class="hero" :class="heroTheme">
          <div class="hero-left">
            <div class="hero-name-row">
              <h2 class="hero-name">{{ cityData.name }}</h2>
              <el-tag v-if="weatherStore.isFallback" type="info" size="small" effect="dark" round>
                오프라인 데이터
              </el-tag>
            </div>
            <p class="hero-temp num">
              {{ displayTemp }}<span class="hero-unit">{{ configStore.unitSymbol }}</span>
            </p>
            <p class="hero-status">
              {{ cityData.status }} · 체감 {{ displayFeelsLike }}{{ configStore.unitSymbol }}
            </p>
            <p class="hero-gap">{{ tempGap }}</p>
          </div>

          <img v-if="heroIconUrl" class="hero-icon" :src="heroIconUrl" :alt="cityData.status" />

          <div class="hero-nav">
            <!-- 과제 7 : 도시 간 이동을 맨 아래에서 히어로 옆으로 올렸다. 스크롤 없이 옆 도시로 넘어갈 수 있다 -->
            <el-button-group>
              <el-button size="small" :disabled="!prevCity" @click="goCity(prevCity.id)">
                ← {{ prevCity ? prevCity.name : '이전' }}
              </el-button>
              <el-button size="small" :disabled="!nextCity" @click="goCity(nextCity.id)">
                {{ nextCity ? nextCity.name : '다음' }} →
              </el-button>
            </el-button-group>

            <el-button
              :type="favoritesStore.isFavorite(cityData.id) ? 'warning' : 'default'"
              size="small"
              @click="favoritesStore.toggleFavorite(cityData.id)"
            >
              {{ favoritesStore.isFavorite(cityData.id) ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기 추가' }}
            </el-button>
          </div>
        </section>

        <BaseDashboardCard>
          <template v-slot:title>관측 항목</template>
          <!-- 과제 7 : table 6행 → el-descriptions. column 을 3 으로 두면 좁은 화면에서 알아서 줄바꿈된다 -->
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="습도">{{ cityData.humidity }}%</el-descriptions-item>
            <el-descriptions-item label="풍속">{{ cityData.wind }}m/s</el-descriptions-item>
            <el-descriptions-item label="강수확률">{{ cityData.rainProb }}%</el-descriptions-item>

            <el-descriptions-item label="미세먼지">
              <el-tag :type="dustInfo.type" size="small" effect="light">{{ dustInfo.text }}</el-tag>
            </el-descriptions-item>

            <el-descriptions-item label="자외선">
              <template v-if="uvIndex">
                {{ uvLevel }} (오늘 최고 {{ uvIndex.max }} · 현재 {{ uvIndex.current }})
              </template>
              <template v-else-if="isDetailLoading">불러오는 중...</template>
              <template v-else>정보 없음</template>
            </el-descriptions-item>

            <el-descriptions-item label="도시 코드">
              <code>{{ cityData.id }}</code>
            </el-descriptions-item>
          </el-descriptions>
        </BaseDashboardCard>

        <BaseDashboardCard>
          <template v-slot:title>오늘 이 동네 옷차림</template>
          <OutfitSuggestion :city="cityData" />
        </BaseDashboardCard>

        <BaseDashboardCard>
          <template v-slot:title>생활지수 (지금 기준)</template>
          <LifeIndexBar v-for="index in lifeIndexList" :key="index.key" :index="index" />
        </BaseDashboardCard>

        <!-- 과제 6 차별점 : 예보가 있어야만 만들 수 있는 정보 -->
        <BaseDashboardCard v-if="bestTimeList.length">
          <template v-slot:title>
            {{ isTodayRange ? '오늘 중 가장 좋은 시간' : '앞으로 24시간 중 가장 좋은 시간' }}
          </template>
          <div v-for="best in bestTimeList" :key="best.key" class="best-row">
            <span class="best-label">{{ best.label }}</span>
            <strong class="best-time">{{ formatHourLabel(best.time, timezone) }}</strong>
            <el-tag size="small" effect="plain" round>{{ best.score }}점 · {{ best.grade }}</el-tag>
            <span class="best-reason">{{ best.reason }}</span>
          </div>
          <p class="best-note">
            3시간 간격 예보 {{ targetSlots.length }}개 시점에 생활지수 계산식을 각각 돌려 최고점을
            고른 값입니다.
          </p>
        </BaseDashboardCard>

        <!-- 과제 7 : 세로 리스트 → 가로 스크롤 CSS 막대.
             과제 9 : 기온(선) + 강수확률(막대) 콤보 차트. 축이 둘로 늘면서 손으로 그릴 범위를 넘었다. -->
        <BaseDashboardCard v-if="forecastChart">
          <template v-slot:title
            >시간별 예보 ({{ isTodayRange ? '오늘' : '앞으로 24시간' }})</template
          >
          <BaseChart :option="forecastChart" height="260px" />
          <p class="best-note">
            왼쪽 축은 기온({{ configStore.unitSymbol }}), 오른쪽 축은 강수확률(%)입니다. 3시간 간격
            예보 {{ targetSlots.length }}개 시점을 그립니다. 그래프의 한 지점에 마우스를 올리면 그
            시각의 날씨 상태까지 같이 보여줍니다.
          </p>
        </BaseDashboardCard>

        <el-button type="primary" class="home-btn" @click="goHome">대시보드로 돌아가기</el-button>
      </template>

      <!-- 주소는 형식에 맞지만 그런 도시 코드가 없는 경우 (예: /weather/city_99) -->
      <el-result
        v-else
        icon="warning"
        title="관측 데이터가 없습니다"
        :sub-title="`도시 코드 ${route.params.cityId} 에 해당하는 도시를 찾지 못했습니다.`"
      >
        <template #extra>
          <el-button type="primary" @click="goHome">대시보드로 돌아가기</el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<style scoped>
/* ===== 과제 7 : 날씨 배경 위에 본문을 올리는 층 구조 ===== */
.detail-page {
  position: relative;
}
/* WeatherBackdrop 은 position: fixed / z-index: 0 이다.
   본문에 z-index 를 주지 않으면 배경보다 아래에 깔려서 빗줄기가 글자 위를 지나간다. */
.detail-content {
  position: relative;
  z-index: 1;
}

/* ===== 히어로 ===== */
.hero {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-4);
  /* 과제 7. 히어로는 화면에서 가장 큰 덩어리라 안쪽 여백도 한 단계 넓게 준다.
     토스 화면에서 큰 숫자가 시원해 보이는 건 글자 크기보다 주변 여백 덕이 크다. */
  padding: var(--space-6) var(--space-7);
  margin-bottom: var(--space-4);
  overflow: hidden;
  color: var(--c-on-brand);
  border-radius: var(--radius-l);
}
/* 날씨 종류별 배경. icon 코드가 어떤 클래스를 붙일지 고른다 */
.hero-clear {
  background: linear-gradient(135deg, #f6b93b 0%, #e58e26 100%);
}
.hero-cloud {
  background: linear-gradient(135deg, #74849b 0%, #4b6584 100%);
}
.hero-rain {
  background: linear-gradient(135deg, #4b7bec 0%, #2c5aa8 100%);
}
.hero-snow {
  background: linear-gradient(135deg, #7ec8e3 0%, #4a90a4 100%);
}
.hero-fog {
  background: linear-gradient(135deg, #a4b0be 0%, #747d8c 100%);
}
/* 뇌우. 비(hero-rain)보다 한 단계 어둡게 해서 배경의 번개가 잘 보이게 한다 */
.hero-storm {
  background: linear-gradient(135deg, #3d4d7a 0%, #1e2749 100%);
}
/* icon 이 없을 때(폴백 목업 데이터). 브랜드 색으로 돌아간다 */
.hero-unknown {
  background: linear-gradient(135deg, var(--c-brand) 0%, var(--c-brand-darker) 100%);
}
.hero-left {
  flex: 1;
  min-width: 180px;
}
.hero-name-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.hero-name {
  margin: 0;
  font-size: var(--fs-h2);
  font-weight: var(--fw-bold);
  color: var(--c-on-brand);
  border: none;
  padding: 0;
}
/* 과제 7. 이 화면 전체에서 가장 큰 글자다. base.css 의 --fs-display 는 이 자리를 위해 만든 단계로,
   다른 곳에서는 쓰지 않는다. 홈 카드(--fs-h1, 28px)보다 확실히 커야 "목록 → 상세" 로 들어왔다는
   느낌이 난다. 같은 크기면 화면만 바뀌고 위계는 안 바뀐 것처럼 보인다.
   .num 유틸(base.css)로 자릿수가 바뀌어도 폭이 고정되고, 음수 기온의 부호 자리도 흔들리지 않는다. */
.hero-temp {
  margin: var(--space-1) 0 0 0;
  font-size: var(--fs-display);
  font-weight: var(--fw-bold);
  line-height: var(--lh-display);
  letter-spacing: -0.02em;
}
.hero-unit {
  margin-left: 2px;
  font-size: var(--fs-h2);
  font-weight: var(--fw-medium);
  opacity: 0.85;
}
.hero-status {
  margin: 2px 0 0 0;
  font-size: var(--fs-body);
  opacity: 0.92;
}
.hero-gap {
  margin: 6px 0 0 0;
  font-size: var(--fs-sm);
  opacity: 0.75;
}
.hero-icon {
  width: 130px;
  height: 130px;
  margin: -20px 0;
  /* 아이콘이 밝은 배경에 묻히지 않도록 그림자를 살짝 준다 */
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.25));
}
.hero-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* ===== 나머지 ===== */
code {
  padding: 2px 6px;
  background-color: var(--c-surface-mute);
  border-radius: 4px;
  color: var(--c-hot);
}
.home-btn {
  width: 100%;
  margin-top: var(--space-1);
}
.alert-gap {
  margin-bottom: 10px;
}
.best-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 8px 10px;
  margin-bottom: 6px;
  background-color: var(--c-surface);
  border: 1px solid var(--c-line);
  border-radius: var(--radius-s);
}
.best-label {
  width: 62px;
  font-size: var(--fs-sm);
  font-weight: var(--fw-bold);
  color: var(--c-text);
}
.best-time {
  width: 96px;
  font-size: 14px;
  color: var(--c-brand);
}
.best-reason {
  flex: 1;
  font-size: 12px;
  color: var(--c-text-faint);
  text-align: right;
}
.best-note {
  margin: 6px 0 0 0;
  font-size: var(--fs-xs);
  line-height: var(--lh-base);
  color: var(--c-text-faint);
}

@media (max-width: 640px) {
  .hero {
    padding: var(--space-4);
  }
  .hero-icon {
    width: 88px;
    height: 88px;
  }
  /* 폰 폭에서 44px 은 아이콘과 부딪힌다. 한 단계 내려서 홈 카드와 같은 크기로 맞춘다.
     화면이 좁으면 어차피 히어로 말고 볼 게 없어서 위계가 흐려지지 않는다. */
  .hero-temp {
    font-size: var(--fs-h1);
  }
}
</style>
