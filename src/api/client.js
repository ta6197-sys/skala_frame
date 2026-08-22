import axios from 'axios'

// 과제 6. axios 인스턴스
// 화면 → 스토어 → api 함수 → 이 인스턴스 → 서버 의 맨 아래층.
// "주소를 아는 곳" 을 여기 한 파일로 몰아둔 덕분에, 키를 서버로 옮길 때 고친 곳이 이 파일의 baseURL 한 줄뿐이었다.
// 화면도 스토어도 api 함수도 손대지 않았다.

// OpenWeatherMap 공용 인스턴스
// - 목적지가 남의 서버가 아니라 "내 서버" 다. /api/owm 뒤의 경로는 api/weather.js 가 정한다.
//   개발 중에는 vite.config.js 의 프록시가, 배포 후에는 api/owm 서버리스 함수가 이 요청을 받아
//   appid 를 붙여서 OpenWeatherMap 으로 넘긴다. 그래서 브라우저는 키를 모른다.
// - params 에 넣은 값은 모든 요청에 자동으로 붙는다.
//   (지오코딩·대기오염은 units/lang 을 쓰지 않지만, 모르는 파라미터는 서버가 무시하므로 그대로 둔다)
export const owmClient = axios.create({
  baseURL: '/api/owm',
  timeout: 8000,
  params: {
    units: 'metric',
    lang: 'kr',
  },
})

// Open-Meteo 는 키가 필요 없고 도메인도 달라서 인스턴스를 따로 둔다.
// 키가 필요 없으니 중계할 이유도 없어서, 이쪽만 브라우저가 직접 호출한다. 감출 게 없는데 경로만 길어질 뿐이다.
export const openMeteoClient = axios.create({
  baseURL: 'https://api.open-meteo.com',
  timeout: 8000,
})

// 응답 인터셉터
// axios 가 던지는 에러 객체는 화면에 그대로 못 쓴다(AxiosError: Request failed with status code 401).
// 여기서 한국어 문장으로 한 번 번역해서 올려보내면, 스토어와 화면은 error.message 만 그리면 된다.
const toReadableError = (error) => {
  const status = error.response?.status

  if (error.code === 'ECONNABORTED') {
    error.message = '응답이 8초 안에 오지 않았습니다. 네트워크 상태를 확인해 주세요.'
  } else if (status === 401) {
    error.message =
      'API 키가 올바르지 않습니다. 서버에 키가 설정되지 않았거나, 발급 직후라 아직 활성화 전일 수 있습니다.'
  } else if (status === 429) {
    error.message = '호출 한도를 넘었습니다(무료 플랜 분당 60회). 잠시 후 다시 시도해 주세요.'
  } else if (status === 404) {
    error.message = '요청한 좌표의 데이터를 찾지 못했습니다.'
  } else if (status >= 500) {
    error.message = '날씨 서버가 응답하지 못했습니다. 잠시 후 다시 시도해 주세요.'
  } else if (!error.response) {
    error.message = '네트워크에 연결하지 못했습니다.'
  }

  return Promise.reject(error)
}

// 성공 응답은 response.data 까지 벗겨서 넘긴다. 호출부마다 .data 를 붙이지 않아도 된다.
const unwrap = (response) => response.data

owmClient.interceptors.response.use(unwrap, toReadableError)
openMeteoClient.interceptors.response.use(unwrap, toReadableError)
