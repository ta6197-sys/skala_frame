import { owmClient, openMeteoClient } from './client'

// 과제 6. API 함수 모음
// "어떤 주소로 무엇을 물어볼지" 만 아는 층. 화면도 스토어도 URL 을 모른다.
//
// 과제 7. 호출 형태를 HTTP 단축 메서드(.get)로 통일했다.
// axios 는 같은 요청을 세 가지로 쓸 수 있다.
//   axios({ method: 'get', url: '/data/2.5/weather' })   <- config 객체 하나만 넘기는 형태
//   axios('/data/2.5/weather', { method: 'get' })        <- URL + 설정
//   owmClient.get('/data/2.5/weather', { params })       <- 단축 메서드  ★ 이걸 쓴다
// 이 파일은 "무엇을 조회하는가" 만 드러나면 되는 층이라, 메서드가 함수 이름에 그대로 보이는 형태가 맞다.
// config 객체 안에 method 를 넣으면 조회인지 생성인지 알려고 한 겹 더 들어가야 한다.
// 응답을 그대로 올려보내지 않고 여기서 앱이 쓰는 모양(temp/feelsLike/dust/rainProb ...)으로 한 번 번역한다.
// 과제 5 까지 만든 화면과 lifeIndex 계산식이 목업 필드 이름을 그대로 쓰고 있어서,
// 번역을 여기서 끝내두면 그 아래 화면들은 손댈 곳이 확 줄어든다.

// 소수점 한 자리로 자르는 공용 함수. 실제 관측값은 28.339999 처럼 들어오는데 화면에 그대로 뿌리면 지저분하다.
const round1 = (value) => Math.round(value * 10) / 10

// 1. 현재 날씨 (요구사항 1)
// 목업의 temp / feelsLike / humidity / wind / status 자리를 채운다.
export const getCurrentWeather = async ({ lat, lon }) => {
  const data = await owmClient.get('/data/2.5/weather', { params: { lat, lon } })

  // 응답 필드가 비는 경우가 있다. 옵셔널 체이닝 없이 꺼내면 화면에 조용히 NaN℃ 가 뜬다.
  return {
    temp: round1(data.main?.temp ?? 0),
    feelsLike: round1(data.main?.feels_like ?? data.main?.temp ?? 0),
    humidity: data.main?.humidity ?? 0,
    wind: round1(data.wind?.speed ?? 0),
    // lang=kr 은 description 에만 먹는다. name 은 여전히 영문("Seoul")이라 쓰지 않는다.
    status: data.weather?.[0]?.description ?? '정보 없음',
    icon: data.weather?.[0]?.icon ?? null,
    observedAt: data.dt ?? null,
  }
}

// 2. 대기오염 (요구사항 2)
// 지금까지 근거 없는 숫자였던 dust 를 실제 PM10 관측값으로 바꾼다.
export const getAirPollution = async ({ lat, lon }) => {
  const data = await owmClient.get('/data/2.5/air_pollution', { params: { lat, lon } })
  const components = data.list?.[0]?.components ?? {}

  return {
    dust: Math.round(components.pm10 ?? 0), // 미세먼지
    fineDust: Math.round(components.pm2_5 ?? 0), // 초미세먼지
    aqi: data.list?.[0]?.main?.aqi ?? null, // 1(좋음) ~ 5(매우나쁨)
  }
}

// 3. 5일/3시간 예보 (요구사항 2)
// 40개(3시간 간격 5일) 시점이 온다. 강수확률 rainProb 의 출처이자 "오늘 중 언제가 최적인가" 의 재료.
export const getForecast = async ({ lat, lon }) => {
  const data = await owmClient.get('/data/2.5/forecast', { params: { lat, lon } })

  return (data.list ?? []).map((item) => ({
    time: item.dt, // UNIX 초. 시간대 정보가 없으므로 화면에서 도시 타임존으로 변환해야 한다.
    temp: round1(item.main?.temp ?? 0),
    feelsLike: round1(item.main?.feels_like ?? item.main?.temp ?? 0),
    humidity: item.main?.humidity ?? 0,
    wind: round1(item.wind?.speed ?? 0),
    // pop 은 0~1 소수다. 그대로 쓰면 강수확률 80% 가 화면에 0.8% 로 찍힌다.
    rainProb: Math.round((item.pop ?? 0) * 100),
    status: item.weather?.[0]?.description ?? '정보 없음',
  }))
}

// 4. 역지오코딩 (요구사항 2)
// 좌표 → 한글 지명. 브라우저가 알려준 내 위치에 이름을 붙이는 용도.
export const getPlaceName = async ({ lat, lon }) => {
  const data = await owmClient.get('/geo/1.0/reverse', { params: { lat, lon, limit: 1 } })
  const place = data?.[0]

  // local_names.ko 가 없는 지역이 있다. 그때는 영문 name 이라도 쓴다.
  return place?.local_names?.ko ?? place?.name ?? '알 수 없는 위치'
}

// 5. 자외선 지수 (요구사항 3 - 기타 외부 API)
// 자외선은 OpenWeatherMap 무료 플랜에 없다. One Call 3.0 은 결제수단 등록이 필요해서 제외하고,
// 키 없이 쓸 수 있는 Open-Meteo 로 받는다. 도메인이 다른 API 를 하나 더 붙인 셈이라 요구사항 3 을 채운다.
export const getUvIndex = async ({ lat, lon }) => {
  const data = await openMeteoClient.get('/v1/forecast', {
    params: {
      latitude: lat,
      longitude: lon,
      current: 'uv_index',
      daily: 'uv_index_max',
      timezone: 'Asia/Seoul',
      forecast_days: 1,
    },
  })

  return {
    current: round1(data.current?.uv_index ?? 0),
    max: round1(data.daily?.uv_index_max?.[0] ?? 0),
  }
}
