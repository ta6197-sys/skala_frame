import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useWeatherStore } from './weatherStore'
import { cities } from '@/data/cities'

// summary 는 홈의 요약 타일과 통계 화면이 같이 읽는 집계다.
// 두 화면이 같은 값을 보게 하려고 getter 로 올렸으므로, 집계 규칙 자체가 계약이 된다.

const observation = (overrides = {}) => ({
  temp: 20,
  feelsLike: 20,
  humidity: 50,
  wind: 1,
  status: '맑음',
  dust: 10,
  rainProb: 0,
  icon: '01d',
  observedAt: 1_700_000_000,
  ...overrides,
})

describe('weatherStore.summary', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('그릴 목록은 도시 수만큼 채우지만 집계 목록은 도착한 것만 센다', () => {
    const store = useWeatherStore()
    // cityList 는 화면이 NaN 을 그리지 않도록 EMPTY_WEATHER 로 cities.length 칸을 만든다.
    expect(store.cityList).toHaveLength(cities.length)
    // 집계는 그 6칸을 믿으면 안 된다. 안 온 도시의 0℃ 가 평균에 섞인다.
    expect(store.loadedCityList).toHaveLength(0)
  })

  it('한 곳도 도착하지 않았으면 null 이다 (화면이 v-if 하나로 0℃ 노출을 막을 수 있게)', () => {
    const store = useWeatherStore()
    expect(store.hasData).toBe(false)
    expect(store.summary).toBeNull()
  })

  it('일부만 도착한 동안에도 평균에 0℃ 가 섞이지 않는다', () => {
    const store = useWeatherStore()
    store.weatherMap = {
      city_01: observation({ temp: 20.1 }),
      city_02: observation({ temp: 20.2 }),
    }
    // 도착한 두 곳만 본다. (20.1 + 20.2) / 2 = 20.15 → 20.2
    // 6칸으로 나눴다면 6.7 이 나왔을 자리다.
    expect(store.summary.count).toBe(2)
    expect(store.summary.avgTemp).toBe(20.2)
  })

  it('평균 기온은 소수 한 자리까지 남긴다 (el-statistic 이 반올림해 버리는 것을 막는 값)', () => {
    const store = useWeatherStore()
    store.weatherMap = {
      city_01: observation({ temp: 20.1 }),
      city_02: observation({ temp: 20.2 }),
      city_03: observation({ temp: 20.4 }),
    }
    // (20.1 + 20.2 + 20.4) / 3 = 20.2333... → 20.2
    expect(store.summary.avgTemp).toBe(20.2)
  })

  it('평균 습도는 정수로 반올림한다', () => {
    const store = useWeatherStore()
    store.weatherMap = Object.fromEntries(
      cities.map((city, index) => [city.id, observation({ humidity: index === 0 ? 61 : 60 })]),
    )
    // (61 + 60*6) / 7 = 60.1428... → 60
    expect(store.summary.avgHumidity).toBe(60)
  })

  it('가장 더운 곳과 추운 곳을 찾는다', () => {
    const store = useWeatherStore()
    store.weatherMap = Object.fromEntries(
      cities.map((city, index) => [city.id, observation({ temp: 10 + index })]),
    )
    expect(store.summary.hottest.id).toBe(cities.at(-1).id)
    expect(store.summary.coldest.id).toBe(cities[0].id)
  })

  it('순위를 만들면서 원본 목록의 순서를 흐트러뜨리지 않는다', () => {
    const store = useWeatherStore()
    store.weatherMap = Object.fromEntries(
      cities.map((city, index) => [city.id, observation({ temp: index })]),
    )
    // summary 안에서 sort 를 부르기 때문에, 복사본을 쓰지 않으면 cityList 자체가 뒤집힌다.
    expect(store.cityList.map((city) => city.id)).toEqual(cities.map((city) => city.id))
    expect(store.summary.ranking[0].temp).toBeGreaterThan(store.summary.ranking.at(-1).temp)
  })

  it('강수확률 40% 이상만 rainy 로 센다 (경계 포함)', () => {
    const store = useWeatherStore()
    store.weatherMap = {
      city_01: observation({ rainProb: 39 }),
      city_02: observation({ rainProb: 40 }),
      city_03: observation({ rainProb: 100 }),
    }
    expect(store.summary.rainy.map((city) => city.id)).toEqual(['city_02', 'city_03'])
  })

  it('가장 오래된 관측 시각을 고른다 (한 곳이라도 오래되면 "방금" 이라고 말하면 안 된다)', () => {
    const store = useWeatherStore()
    store.weatherMap = {
      city_01: observation({ observedAt: 1_700_000_900 }),
      city_02: observation({ observedAt: 1_700_000_100 }), // 이쪽이 더 오래됐다
      city_03: observation({ observedAt: 1_700_000_500 }),
    }
    expect(store.oldestObservedAt).toBe(1_700_000_100 * 1000) // 초 -> 밀리초
  })

  it('관측 시각이 없으면 null 이다 (목업 폴백에는 dt 가 없다)', () => {
    const store = useWeatherStore()
    store.weatherMap = { city_01: observation({ observedAt: null }) }
    expect(store.oldestObservedAt).toBeNull()
    // 그때만 "요청한 시각" 으로 물러선다. 라벨이 비어 있으면 안 되기 때문이다.
    store.lastFetched = Date.now()
    expect(store.observedLabel).not.toBe('')
  })

  it('0 은 관측 시각으로 치지 않는다 (UNIX 0 은 1970년이다)', () => {
    const store = useWeatherStore()
    store.weatherMap = { city_01: observation({ observedAt: 0 }) }
    expect(store.oldestObservedAt).toBeNull()
  })

  it('hasData 는 관측값이 한 곳이라도 채워졌을 때 참이 된다', () => {
    const store = useWeatherStore()
    expect(store.hasData).toBe(false)
    store.weatherMap = { city_01: observation() }
    expect(store.hasData).toBe(true)
  })
})
