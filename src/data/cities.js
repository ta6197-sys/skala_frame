// 과제 6. 도시 목록 (좌표 사전)
// - 과제 5 까지는 weatherData.js 한 파일이 "도시가 무엇인가" 와 "지금 날씨가 어떤가" 를 같이 들고 있었다.
//   실제 API 를 붙이면서 이 둘을 갈랐다. 안 변하는 것(id/이름/좌표)은 여기에 박아두고, 변하는 것(기온·습도 등)만 통신으로 받는다.
// - 도시 이름을 쿼리(q=Seoul)로 넘기지 않고 좌표(lat/lon)를 쓰는 이유:
//   1) 현재날씨·대기오염·예보·자외선 네 API 가 전부 좌표를 공통으로 받는다. 이름을 받는 건 현재날씨뿐이다.
//   2) 이름 검색은 동명 도시가 걸릴 수 있고 한글 지명도 안 통한다. 좌표는 그런 흔들림이 없다.
// - timezone 은 예보 시각을 그 도시 현지 시간으로 바꿀 때 쓴다(시간대별 최적 추천). 한국 도시뿐이라 전부 같지만,
//   "UNIX 초는 시간대 정보가 없다" 는 사실을 코드에 남겨두려고 명시한다.
export const cities = [
  { id: 'city_01', name: '서울', lat: 37.5665, lon: 126.978, timezone: 'Asia/Seoul' },
  { id: 'city_02', name: '수원', lat: 37.2636, lon: 127.0286, timezone: 'Asia/Seoul' },
  { id: 'city_03', name: '부산', lat: 35.1796, lon: 129.0756, timezone: 'Asia/Seoul' },
  { id: 'city_04', name: '제주', lat: 33.4996, lon: 126.5312, timezone: 'Asia/Seoul' },
  { id: 'city_05', name: '강릉', lat: 37.7519, lon: 128.8761, timezone: 'Asia/Seoul' },
  { id: 'city_06', name: '대구', lat: 35.8714, lon: 128.6014, timezone: 'Asia/Seoul' },
  { id: 'city_07', name: '광주', lat: 35.1595, lon: 126.8526, timezone: 'Asia/Seoul' },
]

// id 로 도시 하나를 찾는다. 상세 페이지가 route.params.cityId 로 부른다.
export const findCity = (cityId) => cities.find((city) => city.id === cityId) ?? null
