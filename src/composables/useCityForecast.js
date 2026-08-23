import { computed, toValue } from 'vue'
import { findCity } from '@/data/cities'
import { useWeatherStore } from '@/stores/weatherStore'
import { getBestTimeList } from '@/data/lifeIndex'
import { fromUnix } from '@/utils/dayjs'

// 한 도시의 예보를 "오늘 볼 구간" 으로 잘라내고, 그 위에서 파생 지표를 만드는 계산 묶음.
//
// 왜 뽑았나
// - WeatherDetailView 에 예보 가공(오늘 구간 자르기 · 최적 시간대 · 막대 높이 · 시각 라벨)이
//   화면 코드와 나란히 있었다. 이 계산은 마크업을 하나도 모른다 - 도시 하나와 시간만 알면 된다.
//   화면에서 떼어내면 계산이 독립적으로 읽히고, 나중에 통계 화면이 같은 지표를 쓰게 될 때 가져다 쓸 수 있다.
// - "지금 몇 시인가" 에 의존하는 계산이 한 파일에 모이는 것도 이점이다. UNIX 초에는 시간대가 없어서
//   도시 타임존으로 옮겨야 날짜 비교가 맞는데, 그 사실을 아는 곳이 여기 하나로 줄었다.
//
// @param cityId  도시 코드. ref / getter / 문자열 아무거나 받는다(toValue 가 벗겨준다).
export function useCityForecast(cityId) {
  const weatherStore = useWeatherStore()

  const cityInfo = computed(() => findCity(toValue(cityId)))
  const cityData = computed(() => weatherStore.getCity(toValue(cityId)))
  const forecast = computed(() => weatherStore.getForecastOf(toValue(cityId)))

  // 한국 도시뿐이라 지금은 전부 같지만, "UNIX 초는 시간대 정보가 없다" 는 사실을 코드에 남겨둔다.
  const timezone = computed(() => cityInfo.value?.timezone ?? 'Asia/Seoul')

  // 오늘 남은 구간만 잘라낸다.
  const todaySlots = computed(() => {
    const now = fromUnix(Math.floor(Date.now() / 1000), timezone.value)
    return forecast.value.filter((slot) => fromUnix(slot.time, timezone.value).isSame(now, 'day'))
  })

  // 늦은 밤이라 오늘 구간이 없으면 다음 24시간(3시간 × 8)을 대신 본다. 그때는 화면 문구도 바꾼다.
  const targetSlots = computed(() =>
    todaySlots.value.length ? todaySlots.value : forecast.value.slice(0, 8),
  )
  const isTodayRange = computed(() => todaySlots.value.length > 0)

  // 차별점 : 예보가 없으면 원리적으로 만들 수 없는 정보. "오늘 중 언제가 최적인가"
  const bestTimeList = computed(() =>
    getBestTimeList(targetSlots.value, { dust: cityData.value?.dust ?? 0 }),
  )

  // 과제 9. maxSlotTemp / slotBarHeight 를 들어냈다.
  // 둘은 기온을 CSS 막대 높이(%)로 바꾸는 계산이었는데, 상세 화면의 시간별 예보가 ECharts 콤보 차트로
  // 바뀌면서 쓰는 곳이 없어졌다. 축 눈금은 이제 차트가 데이터 범위를 보고 스스로 잡는다.
  // 화씨에서 비율이 압축되던 문제(0 이 기준점이 아니라서)도 그 계산과 함께 사라졌다.
  const slotHourLabel = (time) => fromUnix(time, timezone.value).format('H시')

  return {
    cityInfo,
    cityData,
    forecast,
    timezone,
    todaySlots,
    targetSlots,
    isTodayRange,
    bestTimeList,
    slotHourLabel,
  }
}
