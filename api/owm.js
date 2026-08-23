// 과제 6. OpenWeatherMap 중계 함수 (Vercel Function)
//
// 왜 만들었나
// - Vite 환경변수는 빌드 결과물에 문자열로 박힌다. 브라우저가 OpenWeatherMap 을 직접 부르는 한
//   요청 URL 에 appid 가 실려 나가므로, 개발자도구만 열면 키가 보인다. 프론트 단독으로는 막을 방법이 없다.
// - 그래서 요청 경로를 하나 늘렸다. 브라우저 → 이 함수 → OpenWeatherMap.
//   이 파일은 Vercel 서버에서만 실행되고 브라우저로 내려가지 않으므로, 키는 서버 밖으로 나가지 않는다.
//
// 파일 이름에 대해
// - 처음에는 api/owm/[...path].js 로 만들었는데 배포하니 404 가 났다. 대괄호 catch-all 은 Next.js 규칙이고,
//   프레임워크 없는 프로젝트에서 Vercel 은 "/api 안의 파일 하나 = 함수 하나" 로만 매핑한다.
// - 그래서 파일은 평범하게 하나 두고, 하위 경로는 vercel.json 의 rewrite 가 ?path= 로 넘겨준다.

// 아무 경로나 중계하면 남이 내 함수를 공짜 프록시로 쓴다. 실제로 쓰는 4개만 허용한다.
const ALLOWED_PATHS = [
  'data/2.5/weather',
  'data/2.5/air_pollution',
  'data/2.5/forecast',
  'geo/1.0/reverse',
]

// 엣지 캐시. 이 함수에서 가장 중요한 한 줄이다.
//
// 경로 화이트리스트는 "무엇을" 만 막고 "얼마나 자주" 는 막지 않았다. 방문자 한 명이 대시보드를 열면
// 21회(도시 7 × API 3)가 나가는데, 클라이언트 캐시는 Pinia 메모리라 새로고침 한 번에 사라진다
// (weatherStore 는 의도적으로 persist 를 끈 스토어다). 채점자 몇 명이 동시에 새로고침을 반복하면
// 무료 플랜 분당 60회에 그대로 닿는다.
//
// s-maxage 는 브라우저가 아니라 Vercel 엣지가 지키는 값이다. 같은 주소로 들어온 요청은
// 10분 동안 엣지가 답하고 OpenWeatherMap 까지 가지 않는다. 도시 좌표는 고정이라 주소도 고정이므로,
// 방문자가 몇 명이든 원본 호출은 10분당 21회로 묶인다.
// 캐시 유효시간은 프런트의 CACHE_DURATION(10분)과 맞췄다.
//
// stale-while-revalidate 는 그 10분이 지난 직후의 첫 요청에게 일단 옛 값을 주고 뒤에서 새로 받아오게 한다.
// 몰려든 요청이 동시에 원본을 때리는 일을 막는 장치다.
//
// 처음에 1800(30분)으로 뒀다가 120(2분)으로 줄였다.
// SWR 창 안에서는 엣지가 "만료됐지만 아직 새로 못 받은" 값을 그대로 준다. 30분이면 최악의 경우
// 40분 된 데이터가 나갈 수 있다는 뜻인데, 이 창이 넓어야 할 이유가 없다 -
// 뒤에서 도는 재검증은 1초 안에 끝나므로 2분이면 몰림을 흡수하기에 충분하다.
// (넓게 잡아도 화면은 이제 관측 시각을 그대로 말하므로 거짓말은 하지 않지만,
//  사용자가 오래된 값을 볼 이유 자체를 줄이는 편이 맞다. weatherStore 의 oldestObservedAt 주석 참고.)
const EDGE_CACHE = 's-maxage=600, stale-while-revalidate=120'

const originHost = (origin) => {
  try {
    return new URL(origin).host
  } catch {
    return null
  }
}

// Vercel Function 은 웹 표준 Request 를 받아 Response 를 돌려준다.
export async function GET(request) {
  const url = new URL(request.url)

  // rewrite 가 넘겨준 path 를 꺼낸다. 혹시 없으면 주소에서 직접 잘라낸다.
  const target = (
    url.searchParams.get('path') ?? url.pathname.replace(/^\/api\/owm\/?/, '')
  ).replace(/^\/+|\/+$/g, '')

  if (!ALLOWED_PATHS.includes(target)) {
    return Response.json({ message: '허용되지 않은 경로입니다.' }, { status: 403 })
  }

  // 다른 사이트가 자기 페이지에서 이 함수를 부르는 것을 막는다.
  // 브라우저는 교차 출처 요청에만 Origin 을 붙이므로, 우리 화면이 부를 때는 이 헤더 자체가 없다.
  // 한계는 분명히 해둔다 - curl 이나 서버 스크립트는 Origin 을 아예 안 보내므로 이 검사를 통과한다.
  // 그쪽은 위의 엣지 캐시가 맡는다(같은 주소를 아무리 때려도 원본까지 가지 않는다).
  // Origin 이 "null" 문자열로 오는 경우가 있다(샌드박스 iframe, file://). new URL('null') 은 예외를 던지므로
  // 파싱할 수 있는 값일 때만 비교하고, 파싱이 안 되면 우리 출처가 아닌 것으로 본다.
  const origin = request.headers.get('origin')
  if (origin && originHost(origin) !== url.host) {
    return Response.json({ message: '허용되지 않은 출처입니다.' }, { status: 403 })
  }

  const apiKey = process.env.OWM_API_KEY
  if (!apiKey) {
    return Response.json({ message: '서버에 API 키가 설정되지 않았습니다.' }, { status: 500 })
  }

  // path 는 경로 조각이므로 넘기지 않는다. 나머지(lat, lon, units, lang)만 그대로 전달한다.
  const params = new URLSearchParams(url.search)
  params.delete('path')
  params.set('appid', apiKey) // 키가 등장하는 유일한 자리

  try {
    const upstream = await fetch(`https://api.openweathermap.org/${target}?${params}`)
    const data = await upstream.json()

    // 상태 코드를 그대로 넘긴다. 401 이나 429 를 200 으로 바꿔버리면 화면이 에러를 구분하지 못한다.
    // 캐시는 성공한 응답에만 건다. 401(키 오류)이나 429(한도 초과)를 10분간 캐시하면
    // 원인을 고친 뒤에도 화면이 계속 같은 에러를 보게 된다.
    return Response.json(data, {
      status: upstream.status,
      headers: { 'cache-control': upstream.ok ? EDGE_CACHE : 'no-store' },
    })
  } catch {
    return Response.json(
      { message: '날씨 서버에 연결하지 못했습니다.' },
      { status: 502, headers: { 'cache-control': 'no-store' } },
    )
  }
}
