import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { cities } from '@/data/cities'
import { weatherData } from '@/data/weatherData'
import { getCurrentWeather, getAirPollution, getForecast } from '@/api/weather'
import { fromNow } from '@/utils/dayjs'

// 과제 6. 이번에 새로 만드는 유일한 스토어.
// 스토어로 올릴지 판단한 기준은 두 가지였다.
//   1) 두 개 이상의 화면이 같은 데이터를 필요로 하는가 → 대시보드·통계·즐겨찾기가 같은 도시 목록을 쓴다.
//   2) 화면을 떠났다 돌아와도 값이 살아 있어야 하는가 → 상세 페이지를 다녀올 때마다 다시 호출하면 분당 60회 제한에 금방 걸린다.
// 나머지(내 위치, 자외선, 검색어)는 한 화면에서만 쓰므로 컴포넌트 안에 둔다.
//
// 예보(forecastMap)까지 여기 둔 이유는 계획을 세울 때와 달라진 부분이다.
// 처음에는 "예보는 상세 페이지만 쓴다" 고 봤는데, 강수확률(rainProb)이 예보에서만 나오고
// 그 값을 대시보드의 생활지수와 통계 화면의 "강수확률 40% 이상" 이 이미 쓰고 있었다. 기준 1)에 해당해서 스토어로 올렸다.

// 값이 아직 안 왔을 때 화면이 NaN 을 그리지 않도록 하는 빈 관측값
const EMPTY_WEATHER = {
  temp: 0,
  feelsLike: 0,
  humidity: 0,
  wind: 0,
  status: '불러오는 중',
  dust: 0,
  rainProb: 0,
  icon: null,
  observedAt: null,
}

// 같은 데이터를 10분 안에 다시 받아올 이유가 없다. 화면을 오갈 때마다 18회씩 호출하면 분당 60회 제한에 걸린다.
const CACHE_DURATION = 10 * 60 * 1000

export const useWeatherStore = defineStore('weather', () => {
  // ===== state =====
  const weatherMap = ref({}) // cityId -> 관측값 (현재날씨 + 미세먼지 + 강수확률)
  const forecastMap = ref({}) // cityId -> 3시간 간격 예보 배열
  const isLoading = ref(false)
  const error = ref(null)
  const lastFetched = ref(null) // 마지막으로 성공한 시각(ms)
  const isFallback = ref(false) // 통신 실패로 목업 데이터를 대신 쓰고 있는 상태인지

  // ===== getters =====
  // 도시 정보(cities) + 관측값(weatherMap)을 합쳐서, 과제 5 까지 화면들이 쓰던 weatherData 와 같은 모양으로 돌려준다.
  // 덕분에 화면 쪽은 import 하는 곳만 바꾸면 되고 템플릿은 거의 그대로 살았다.
  const cityList = computed(() =>
    cities.map((city) => ({
      ...city,
      ...EMPTY_WEATHER,
      ...weatherMap.value[city.id],
    })),
  )

  // 인자를 받는 getter. 상세 페이지가 id 로 도시 하나를 꺼낼 때 쓴다.
  const getCity = computed(() => {
    return (cityId) => cityList.value.find((city) => city.id === cityId) ?? null
  })

  const getForecastOf = computed(() => {
    return (cityId) => forecastMap.value[cityId] ?? []
  })

  // 한 번이라도 데이터가 채워졌는지. 스켈레톤을 언제까지 보여줄지 판단한다.
  const hasData = computed(() => Object.keys(weatherMap.value).length > 0)

  // "3분 전 기준" 문구
  const lastFetchedLabel = computed(() => (lastFetched.value ? fromNow(lastFetched.value) : ''))

  // 과제 7. 도시 목록을 집계한 요약값.
  // 원래 이 계산식은 WeatherStatsView 안에만 있었다. 홈 상단에도 요약 타일을 넣으면서
  // 같은 계산을 홈에 복사할 뻔했는데, 그러면 평균 구하는 방식이 두 곳에 생겨 나중에 갈라진다.
  // "값은 한 곳에서만 태어난다" 원칙대로 getter 로 올려서 홈과 통계가 같은 것을 읽게 했다.
  //
  // 미세먼지 나쁨 개수는 여기에 넣지 않았다. 그 판정 기준(dustBadMin)은 사용자가 설정 화면에서 정하는 값이라
  // configStore 소관이고, weatherStore 가 configStore 를 끌어다 쓰면 스토어끼리 얽힌다.
  // 그래서 등급이 걸린 집계만 화면에서 configStore.dustGrade 로 센다 (통계 화면이 이미 쓰던 방식).
  const summary = computed(() => {
    const list = cityList.value
    if (!list.length) return null

    // sort 는 원본 배열을 뒤집으므로 복사본을 만들어 정렬한다
    const ranking = [...list].sort((a, b) => b.temp - a.temp)

    return {
      count: list.length,
      // 평균은 섭씨 원본으로 구한다. 화면에 뿌릴 때 convertTemp 를 한 번만 태운다.
      // 도시별로 변환해서 평균 내면 반올림 오차가 쌓인다.
      avgTemp: Math.round((list.reduce((sum, city) => sum + city.temp, 0) / list.length) * 10) / 10,
      avgHumidity: Math.round(list.reduce((sum, city) => sum + city.humidity, 0) / list.length),
      hottest: ranking[0],
      coldest: ranking[ranking.length - 1],
      ranking,
      rainy: list.filter((city) => city.rainProb >= 40),
    }
  })

  // ===== actions =====
  // 도시 한 곳에 필요한 세 API 를 동시에 쏜다. 순서대로 await 하면 3배 느려진다.
  //
  // 과제 7. 여기 쓰인 건 axios.all() 이 아니라 표준 JavaScript 의 Promise.all 이다.
  // 강의 슬라이드(Axios - Method List)가 "가능하면 쓰지 말라" 고 한 병렬 요청은
  // axios.all([...]) / axios.spread(callback) 두 함수를 가리키는데, 이 프로젝트에는 그 둘이 한 번도 안 나온다.
  // API 호출은 전부 .get() 단축 메서드다(api/weather.js 참고).
  //
  // 순차 await 로 바꾸는 것도 검토했지만 남겨두기로 했다. 실측하니 대시보드 첫 로딩에 요청이 19개 나가고
  // 평균 응답이 693ms 라서, 전부 순차로 돌리면 13.2초가 된다. 지금은 1.2~2초다.
  async function fetchCity(cityId) {
    const city = cities.find((item) => item.id === cityId)
    if (!city) return null

    const coords = { lat: city.lat, lon: city.lon }
    const [current, air, forecast] = await Promise.all([
      getCurrentWeather(coords),
      getAirPollution(coords),
      getForecast(coords),
    ])

    // 지금 강수확률은 예보의 첫 구간(가장 가까운 3시간) 값을 쓴다. 현재 날씨 API 에는 강수확률이 없다.
    const rainProb = forecast[0]?.rainProb ?? 0

    weatherMap.value = {
      ...weatherMap.value,
      [cityId]: { ...current, ...air, rainProb },
    }
    forecastMap.value = { ...forecastMap.value, [cityId]: forecast }

    return weatherMap.value[cityId]
  }

  // 대시보드 진입 시 호출. 도시 6개 × 3 API = 18회.
  // force 가 아니면 캐시가 살아 있는 동안 아무것도 하지 않는다. 이게 호출 제한에 대한 1차 방어선이다.
  async function fetchAll({ force = false } = {}) {
    const isFresh = lastFetched.value && Date.now() - lastFetched.value < CACHE_DURATION
    if (!force && isFresh && !isFallback.value) return

    isLoading.value = true
    error.value = null

    // allSettled 를 쓰는 이유 : all 은 도시 하나만 실패해도 전체가 무너진다.
    // 여섯 곳 중 다섯 곳이 성공했다면 그 다섯 곳은 보여주는 게 맞다.
    // 과제 7. 이건 속도를 위한 장치가 아니라 기능을 위한 장치다.
    // 바로 아래에서 실패한 개수를 세어 "전부 실패면 목업, 일부 실패면 알림만" 을 가른다.
    // 순차 await 로 바꾸면 첫 실패에서 멈춰버려서 개수를 셀 수가 없고, 폴백 판정을 처음부터 다시 짜야 한다.
    const results = await Promise.allSettled(cities.map((city) => fetchCity(city.id)))
    const failed = results.filter((result) => result.status === 'rejected')

    if (failed.length === cities.length) {
      // 전부 실패 = 키가 없거나 네트워크가 끊긴 상황. 목업으로 내려앉는다.
      error.value = failed[0].reason?.message ?? '날씨 정보를 불러오지 못했습니다.'
      useFallbackData()
    } else {
      isFallback.value = false
      lastFetched.value = Date.now()
      // 일부만 실패한 경우는 화면을 막지 않고 알림만 띄운다.
      error.value = failed.length ? `${failed.length}개 도시의 정보를 받지 못했습니다.` : null
    }

    isLoading.value = false
  }

  // 상세 페이지처럼 도시 하나만 필요한 화면이 부른다.
  // fetchCity 는 실패하면 에러를 그대로 던지는데(fetchAll 이 실패 개수를 세야 하므로),
  // 화면 쪽에서 매번 폴백 처리를 반복하지 않도록 "있으면 그대로, 없으면 받아오고, 실패하면 목업" 까지를 여기서 끝낸다.
  async function ensureCity(cityId) {
    if (weatherMap.value[cityId]) return

    isLoading.value = true
    try {
      await fetchCity(cityId)
      lastFetched.value = Date.now()
      isFallback.value = false
      error.value = null
    } catch (caught) {
      error.value = caught.message ?? '날씨 정보를 불러오지 못했습니다.'
      useFallbackData()
    } finally {
      isLoading.value = false
    }
  }

  function refresh() {
    return fetchAll({ force: true })
  }

  // 과제 5 까지 쓰던 목업을 지우지 않고 남겨둔 이유가 이것이다.
  // 발표 중에 통신이 막히더라도 화면이 빈 채로 서 있지 않도록, 마지막 안전망으로 쓴다.
  function useFallbackData() {
    const fallback = {}
    weatherData.forEach((city) => {
      const { id, name, ...observation } = city
      void name // 이름은 cities.js 쪽을 쓴다
      fallback[id] = observation
    })
    weatherMap.value = fallback
    forecastMap.value = {}
    isFallback.value = true
  }

  return {
    weatherMap,
    forecastMap,
    isLoading,
    error,
    lastFetched,
    isFallback,
    cityList,
    getCity,
    getForecastOf,
    hasData,
    lastFetchedLabel,
    summary,
    fetchCity,
    fetchAll,
    ensureCity,
    refresh,
  }
})
