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
    return Response.json(data, { status: upstream.status })
  } catch {
    return Response.json({ message: '날씨 서버에 연결하지 못했습니다.' }, { status: 502 })
  }
}
