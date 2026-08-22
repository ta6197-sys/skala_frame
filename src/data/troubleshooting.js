// 과제 진행 중 막혔던 지점과 해결 과정 기록
// - 화면(TroubleshootingView)은 이 배열을 읽어 그리기만 한다. 항목을 추가할 때 이 파일만 고치면 된다.
// - status: 'solved' 는 해결, 'known' 은 원인은 알지만 이번 범위에서 손대지 않기로 한 것.
export const troubleshootingList = [
  {
    id: 'ts_01',
    task: '과제 4',
    title: '상세 페이지에서 이전/다음 도시로 옮겨도 화면이 그대로였다',
    symptom:
      '/weather/city_01 에서 [다음 도시] 를 눌러 /weather/city_02 로 주소는 바뀌는데, 화면에 표시되는 도시 정보는 계속 city_01 이었다.',
    cause:
      'onMounted 에서만 route.params.cityId 를 읽고 있었기 때문. 같은 라우트끼리의 이동은 vue-router 가 컴포넌트를 파괴하지 않고 재사용하므로 onMounted 가 다시 실행되지 않는다.',
    solution:
      'watch(() => route.params.cityId, ...) 로 파라미터 변화도 함께 감시하도록 추가했다. 최초 진입은 onMounted 가, 같은 페이지 안에서의 이동은 watch 가 담당하는 구조로 정리했다.',
    tags: ['vue-router', 'onMounted', 'watch'],
    status: 'solved',
  },
  {
    id: 'ts_02',
    task: '과제 4',
    title: '검색어를 칠 때마다 뒤로가기가 먹통이 됐다',
    symptom:
      '검색어를 주소창 쿼리스트링(?search=)에 동기화했더니, "서울" 을 입력한 뒤 뒤로가기를 누르면 "서", "서우", "서울" 순으로 한 글자씩 되돌아가 대시보드를 빠져나갈 수가 없었다.',
    cause:
      'watch 안에서 router.push 를 쓰고 있었기 때문. push 는 히스토리에 새 항목을 쌓으므로 타이핑 한 글자마다 방문 기록이 하나씩 생긴다.',
    solution:
      'router.replace 로 교체했다. replace 는 현재 히스토리 항목을 덮어쓰기 때문에 주소는 갱신되면서 기록은 쌓이지 않는다.',
    tags: ['vue-router', 'push vs replace'],
    status: 'solved',
  },
  {
    id: 'ts_03',
    task: '과제 5',
    title: '강사님 예시 코드를 그대로 옮겼더니 props is not defined 에러',
    symptom:
      '단위 변환 computed 를 만들면서 예시 코드의 props.cityItem.temp 를 그대로 복사했더니 화면이 뜨지 않고 콘솔에 ReferenceError: props is not defined 가 찍혔다.',
    cause:
      'script setup 에서 defineProps() 는 반환값을 변수로 받아야 script 영역에서 쓸 수 있다. 템플릿에서는 이름만으로 접근되지만 script 안에서는 props 라는 변수가 자동으로 생기지 않는다.',
    solution:
      'const props = defineProps({ ... }) 형태로 반환값을 받아서 사용했다. 템플릿에서만 쓸 때는 반환값을 안 받아도 되지만, computed 등 script 안에서 참조할 거라면 반드시 받아야 한다.',
    tags: ['script setup', 'defineProps'],
    status: 'solved',
  },
  {
    id: 'ts_04',
    task: '과제 5',
    title: '화씨로 바꿨더니 기온과 체감온도가 서로 안 맞았다',
    symptom:
      '단위변경을 눌렀을 때 상세 페이지에 "82℉ / 체감 30℉" 처럼 표시됐다. 기온만 변환되고 체감온도는 섭씨 원본이 그대로 나온 것.',
    cause:
      '변환을 적용할 대상을 temp 하나로만 생각했다. feelsLike 도 온도 값이라 같이 변환해야 한다는 걸 놓쳤다.',
    solution:
      'displayFeelsLike computed 를 따로 만들어 같은 convertTemp getter 를 태웠다. 두 값의 차이를 계산하는 문구도 변환된 값끼리 빼도록 고쳤다. 섭씨 2도 차이는 화씨로 3.6도라서 원본끼리 빼면 화면 숫자와 어긋나기 때문이다.',
    tags: ['pinia', 'computed', '단위 변환'],
    status: 'solved',
  },
  {
    id: 'ts_05',
    task: '과제 5',
    title: '화씨 모드에서 기온 랭킹 막대가 전부 비슷한 길이로 뭉개졌다',
    symptom:
      '통계 화면의 기온 랭킹 막대를 변환된 값으로 계산했더니, 섭씨일 때는 도시별 차이가 잘 보이던 막대가 화씨로 바꾸자 전부 고만고만한 길이가 됐다.',
    cause:
      '화씨는 0 이 기준점이 아니다. 물이 어는 점이 32℉ 라서 모든 값에 32 라는 큰 상수가 더해진다. 22℃ 와 33℃ 의 비율은 0.67 이지만 72℉ 와 91℉ 의 비율은 0.79 로 차이가 압축된다.',
    solution:
      '막대 길이만은 원본 섭씨로 계산하도록 되돌렸다. 화면에 적히는 숫자는 변환값, 그래프의 비율은 원본값으로 역할을 나눴다.',
    tags: ['단위 변환', '데이터 시각화'],
    status: 'solved',
  },
  {
    id: 'ts_06',
    task: '과제 5',
    title: '미세먼지 경계값을 잘못 넣으면 등급 판정이 뒤집혔다',
    symptom:
      '설정 화면에서 "좋음 상한" 을 50, "나쁨 하한" 을 45 로 넣었더니 좋음도 나쁨도 아닌 구간이 사라지면서 판정이 이상해졌다.',
    cause:
      '두 슬라이더가 서로를 침범할 수 있는데 검증 장치가 없었다. 좋음 상한이 나쁨 하한보다 커지면 보통 구간이 음수 폭이 된다.',
    solution:
      '화면에서 v-model 로 스토어 state 를 직접 물리지 않고 :value + @input 으로 액션을 거치게 바꿨다. 액션 안에서 Math.min / Math.max 로 상대 값을 침범하지 않도록 잘라낸다. 과제 1 에서 v-model 을 풀어 썼던 것과 형태는 같은데 이번에는 이유가 값 검증이었다.',
    tags: ['pinia', 'actions', '유효성 검증'],
    status: 'solved',
  },
  {
    id: 'ts_07',
    task: '공통',
    title: '내비게이션 바에 항목이 늘자 오른쪽이 잘렸다',
    symptom:
      '과제 5 에서 단위 토글러와 즐겨찾기 배지를 추가했더니 "과제 1~3" 링크가 컨테이너 밖으로 밀려 잘려 보였다.',
    cause:
      'practice.css 의 컨테이너 폭이 800px 로 고정돼 있는데 nav 를 flex 한 줄로만 배치해서 넘치는 항목이 잘렸다.',
    solution:
      'nav 에 flex-wrap: wrap 을 줘서 넘칠 때 다음 줄로 내려가게 했다. 항목이 더 늘어날 수 있는 영역이라 고정 배치보다 안전하다.',
    tags: ['CSS', 'flexbox'],
    status: 'solved',
  },
  {
    id: 'ts_08',
    task: '공통',
    title: '이모티콘 일괄 제거 중 텍스트 사이 공백이 함께 지워졌다',
    symptom:
      '정규식으로 이모티콘을 일괄 제거했더니 "수문장 자리" 가 "수문장자리" 로, "개 -> 3개" 가 "개 ->3개" 로 붙어버렸다.',
    cause:
      '이모티콘이 빠진 자리의 잉여 공백을 정리하는 규칙이 너무 넓었다. 태그 바로 뒤 공백과 따옴표 뒤 공백을 무조건 지우도록 만들어서, 원래부터 필요했던 공백까지 걸려들었다.',
    solution:
      '작업 전에 원본을 백업해두고, 작업 후 원본과 한 줄씩 대조해서 이모티콘 외의 변경이 있는 곳을 전부 찾아냈다. 걸린 16곳을 되돌렸다. 일괄 치환은 되돌릴 수단을 먼저 만들어두고 시작해야 한다는 걸 배웠다.',
    tags: ['정규식', '일괄 치환'],
    status: 'solved',
  },
  {
    id: 'ts_09',
    task: '과제 5',
    title: '새로고침하면 즐겨찾기와 설정이 전부 초기화된다',
    symptom:
      '즐겨찾기를 등록하고 기준 온도를 조정한 뒤 브라우저를 새로고침하면 모든 값이 기본값으로 돌아간다.',
    cause:
      '피니아 스토어는 메모리에만 존재한다. 페이지가 새로 로드되면 자바스크립트 실행 환경 자체가 초기화되므로 스토어도 다시 만들어진다. 버그가 아니라 정상 동작이다.',
    solution:
      '과제 6 에서 pinia-plugin-persistedstate 를 붙여 해결했다. createPinia() 에 플러그인을 한 번 등록하고, 저장하고 싶은 스토어에 persist: true 옵션만 켜면 그 스토어의 state 가 localStorage 에 자동으로 저장된다. 다만 weatherStore 에는 일부러 켜지 않았다. 어제 받아둔 기온을 오늘 화면에 그대로 띄우게 되기 때문이다. 저장해도 되는 값과 안 되는 값이 갈린다는 걸 이때 알았다.',
    tags: ['pinia', '영속성', 'localStorage'],
    status: 'solved',
  },
  {
    id: 'ts_10',
    task: '과제 6',
    title: '상세 페이지로 바로 들어가면 기온이 0℃ 로 표시됐다',
    symptom:
      '대시보드를 거쳐서 들어가면 멀쩡한데, 주소창에 /weather/city_01 을 직접 치고 들어가면 기온 0℃, 습도 0%, 상태 "불러오는 중" 으로 굳어 있었다. 통신이 실패한 상황(키 없음)에서만 재현됐다.',
    cause:
      '대시보드는 fetchAll 이 실패하면 목업으로 내려앉는 폴백을 갖고 있었는데, 상세 페이지는 스토어의 fetchCity 를 직접 부르고 있어서 그 폴백을 못 탔다. 화면마다 실패 처리를 따로 갖게 되면 이런 구멍이 생긴다.',
    solution:
      '스토어에 ensureCity 액션을 만들어 "이미 있으면 그대로 / 없으면 받아오고 / 실패하면 목업으로 내려앉기" 까지를 스토어가 끝내도록 했다. 화면은 부르기만 하고 결과를 판단하지 않는다. 실패 처리를 한 군데로 모으니 화면이 늘어도 같은 구멍이 다시 생기지 않는다.',
    tags: ['pinia', 'axios', '폴백'],
    status: 'solved',
  },
  {
    id: 'ts_11',
    task: '과제 6',
    title: '통신이 실패했는데 화면만 봐서는 왜 실패했는지 알 수 없었다',
    symptom:
      '키를 넣기 전에 실행해 보니 콘솔에 401 Unauthorized 만 열두 줄 찍히고, 화면에는 아무 설명도 없었다. axios 가 던지는 에러를 그대로 띄워도 "Request failed with status code 401" 이라 사용자에게 보여줄 문장이 아니었다.',
    cause:
      '에러를 화면까지 그대로 올려보내고 있었다. 상태 코드를 사람이 읽을 문장으로 바꾸는 자리가 없었다.',
    solution:
      '응답 인터셉터에서 상태 코드별로 한국어 문장을 붙였다(401 은 키 문제와 활성화 대기, 429 는 호출 한도, ECONNABORTED 는 타임아웃). 화면은 error.message 만 그리면 된다. 겸사겸사 키가 비어 있으면 시작할 때 콘솔 경고를 한 번 띄우게 했다. 401 이 여섯 번 날아온 뒤에 원인을 짐작하는 것보다 낫다.',
    tags: ['axios', '인터셉터', '에러 처리'],
    status: 'solved',
  },
  {
    id: 'ts_12',
    task: '과제 6',
    title: '통계 화면 랭킹 막대에 width: NaN% 가 들어갔다',
    symptom:
      '통계 화면에 처음 들어간 순간(값이 오기 전) 막대가 전부 사라졌다. 개발자도구로 보니 style 에 width: NaN% 가 들어가 있었다.',
    cause:
      '막대 길이를 (해당 기온 / 최고 기온) 으로 계산하는데, 데이터가 오기 전에는 모든 기온이 0 이라 0 으로 나눈 것이다. 목업일 때는 항상 값이 채워져 있어서 드러나지 않던 문제다.',
    solution:
      '분모가 0 이면 1 로 대체하도록 막았다. 목업에서 실제 통신으로 바뀌면서 "값이 아직 없는 순간" 이라는 상태가 새로 생겼고, 그 순간을 화면이 견딜 수 있는지 따로 확인해야 한다는 걸 배웠다.',
    tags: ['computed', '로딩 상태'],
    status: 'solved',
  },
  {
    id: 'ts_13',
    task: '과제 6',
    title: '빌드 결과물 안에 API 키가 그대로 들어 있었다',
    symptom:
      '배포를 준비하면서 npm run build 로 만든 dist 폴더를 키 문자열로 검색해봤더니 dist/assets/configStore-*.js 에서 그대로 발견됐다. .env 로 빼두면 안전한 줄 알았는데 아니었다.',
    cause:
      'Vite 환경변수는 빌드할 때 코드 안에 문자열로 치환된다. .env 는 "저장소에 남기지 않는" 장치이지 "브라우저에서 숨기는" 장치가 아니다. 애초에 브라우저가 OpenWeatherMap 을 직접 호출하는 구조에서는 요청 URL 에 appid 가 실려 나가므로, 번들에서 문자열을 지운다 해도 개발자도구 Network 탭에 그대로 보인다. 프론트 단독으로는 막을 방법이 없다.',
    solution:
      '요청 경로를 하나 늘려서 브라우저가 OpenWeatherMap 을 직접 부르지 않게 했다. 브라우저 → 내 서버(Vercel 서버리스 함수) → OpenWeatherMap 순서로 바꾸고, 키는 서버 환경변수에만 두었다. 변수명에서 VITE_ 접두사를 떼는 것만으로 번들에 들어갈 경로가 사라졌다. 개발 중에는 vite.config.js 의 프록시가 같은 역할을 대신해서, 브라우저가 보는 주소는 개발이든 배포든 똑같다. 고친 화면 코드는 하나도 없고 client.js 의 baseURL 한 줄이 전부였는데, 과제 6 에서 주소를 아는 파일을 하나로 몰아둔 덕분이었다.',
    tags: ['보안', '환경변수', 'Vite', '서버리스', '배포'],
    status: 'solved',
  },
  {
    id: 'ts_14',
    task: '과제 6',
    title: '배포하니 서버리스 함수가 404 - 대괄호 파일명은 Next.js 규칙이었다',
    symptom:
      'Vercel 배포는 성공했고 화면도 떴는데, 모든 날씨 요청이 404 로 떨어지면서 목업(오프라인 데이터)으로 내려앉았다. /api/owm/data/2.5/weather 를 직접 열어보니 Vercel 이 NOT_FOUND 를 돌려줬다.',
    cause:
      '함수 파일을 api/owm/[...path].js 로 만들었기 때문. 대괄호 catch-all 은 Next.js 의 파일 규칙이고, 프레임워크 없는 프로젝트에서 Vercel 은 "/api 안의 파일 하나 = 함수 하나" 로만 매핑한다. 그래서 함수가 아예 생성되지 않았고, 요청은 어떤 라우트에도 걸리지 않아 404 가 났다. 로컬에서는 vite 프록시가 대신 처리하고 있어서 이 문제가 드러나지 않았다.',
    solution:
      '파일을 api/owm.js 하나로 평평하게 만들고, 하위 경로는 vercel.json 의 rewrite 가 ?path= 로 넘기도록 바꿨다. 시그니처도 (req, res) 대신 웹 표준 export function GET(request) 로 고쳤다 - 현재 Vercel Functions 는 Web Handler 를 쓴다. 추측으로 고치지 않고 공식 문서에서 "Vercel will deploy any file in the /api directory as a function" 문장을 확인한 뒤 고쳤다.',
    tags: ['배포', 'Vercel', '서버리스', '라우팅'],
    status: 'solved',
  },
  {
    id: 'ts_15',
    task: '과제 7',
    title: 'Element Plus 를 늘려 붙이자 화면 절반이 파랑으로 바뀌었다',
    symptom:
      'el-button, el-slider, el-progress, el-switch 를 붙였더니 그 컴포넌트들만 Element Plus 기본 파랑(#409EFF)으로 나왔다. 기존 화면은 Vue 초록(#42b883) 톤이라 한 화면 안에 두 가지 브랜드 색이 섞였다.',
    cause:
      'Element Plus 도 내 base.css 도 둘 다 :root 에 CSS 변수를 정의한다. 선택자 우선순위가 같으므로 나중에 불린 쪽이 이긴다. main.js 가 ./assets/main.css 를 먼저 import 하고 element-plus/dist/index.css 를 나중에 import 하고 있어서, 내가 덮어쓴 --el-color-primary 를 Element Plus 기본값이 다시 덮고 있었다.',
    solution:
      'main.js 의 import 순서를 뒤집어 element-plus/dist/index.css 를 먼저 불렀다. 그러면 기본값이 먼저 깔리고 base.css 가 그 위에 브랜드 색을 덮는다. 컴포넌트마다 :color 를 넘기는 방법도 있었지만, 붙이는 컴포넌트가 늘 때마다 빠뜨릴 자리가 늘어난다. 변수 한 곳을 덮는 쪽이 맞다고 봤다. README2 에 "Element Plus 를 추가로 붙일 때 기존 CSS 와 톤이 어긋나는지 확인할 것" 이라고 미리 적어둔 지점이 실제로 문제가 된 자리다.',
    tags: ['Element Plus', 'CSS 변수', 'import 순서'],
    status: 'solved',
  },
  {
    id: 'ts_16',
    task: '과제 7',
    title: '넓은 모니터에서 화면이 왼쪽으로 쏠리고 좁은 화면에서는 가로 스크롤이 생겼다',
    symptom:
      '1920px 모니터에서 본문이 가운데가 아니라 왼쪽에 붙어 있고 오른쪽 절반이 비어 있었다. 반대로 브라우저 폭을 800px 근처로 줄이면 가로 스크롤바가 나타났다. 실측하니 scrollWidth 832 / clientWidth 785 로 47px 이 넘쳤다.',
    cause:
      '두 가지가 겹쳐 있었다. (1) assets/main.css 에 create-vue 스캐폴드가 준 @media (min-width: 1024px) 규칙이 그대로 남아 body 를 flex, #app 을 2열 그리드로 만들고 있었다. #app 의 자식은 .practice-container 하나뿐이라 왼쪽 칸만 채우고 오른쪽 절반이 영구 공백이 됐다. (2) practice.css 의 .practice-container 가 max-width: 1200px 뒤에 width: 800px 을 적어서 max-width 가 무력화되고 폭이 800px 로 고정돼 있었다. #app 의 좌우 padding 32px 안쪽에 800px 상자가 들어가니 넘칠 수밖에 없었다.',
    solution:
      '스캐폴드 잔재를 지우고 컨테이너를 width: 100% / max-width: 1180px / padding-inline: 16px 로 바꿨다. 과제 1 때는 화면이 하나뿐이라 문제가 드러나지 않았는데, view 가 9개로 늘고 카드 그리드를 넣으면서 비로소 보였다. 남이 만들어준 기본 설정을 언제까지 그대로 들고 갈 것인지 판단하는 게 필요하다는 걸 알게 됐다.',
    tags: ['CSS', '레이아웃', '반응형', '스캐폴드'],
    status: 'solved',
  },
  {
    id: 'ts_17',
    task: '과제 7',
    title: 'CSS 파일을 통째로 다시 쓴 뒤 스타일이 전부 사라졌다',
    symptom:
      'base.css 와 practice.css 를 새로 쓰고 브라우저를 새로고침했더니 색·간격이 하나도 적용되지 않았다. --c-brand 를 읽어보니 빈 문자열이었고, body 배경도 투명이었다. 파일을 열어보면 내용은 멀쩡히 들어 있었다.',
    cause:
      'Vite dev 서버의 CSS 변환 캐시. 파일을 통째로 덮어쓰는 순간 Vite 가 내용이 비어 있는 상태로 한 번 읽었고("base.css is empty" 경고가 터미널에 남아 있었다), 그 빈 결과를 캐시해버렸다. @import 로 불러오는 파일이라 이후 HMR 로도 다시 읽히지 않았다.',
    solution:
      'dev 서버를 껐다 켰다. 원인을 모른 채 코드를 의심하면서 시간을 쓸 뻔했는데, 터미널의 vite 로그에 "is empty" 경고가 그대로 남아 있어서 금방 찾았다. 브라우저 콘솔만 보면 안 되고 서버 쪽 로그도 같이 봐야 한다는 걸 알게 됐다.',
    tags: ['Vite', 'HMR', '캐시', '개발환경'],
    status: 'solved',
  },
  {
    id: 'ts_18',
    task: '과제 7',
    title: '검색어를 상태와 주소창 양쪽에 두고 서로 동기화하고 있었다',
    symptom:
      '동작에는 문제가 없었지만, 검색 후 뒤로가기를 누르면 주소는 되돌아가는데 입력창의 글자와 목록은 그대로였다.',
    cause:
      'searchQuery 라는 ref 를 두고 onMounted 에서 주소 → 상태로 한 번 복원하고, watch 에서 상태 → 주소로 계속 밀어넣고 있었다. 값 하나에 저장소가 둘이고 서로를 갱신하는 구조였다. onMounted 는 처음 한 번만 돌기 때문에, 이후 주소가 바뀌어도 상태는 따라오지 않았다.',
    solution:
      '주소창 하나를 원본으로 정하고 화면은 computed 로 파생만 하게 바꿨다. const searchQuery = computed(() => String(route.query.search ?? "")) 로 읽고, 입력이 오면 상태가 아니라 router.replace 로 주소를 고친다. 흐름이 입력 → 주소 → computed → 화면 한 방향이 되면서 복원 코드와 동기화 watch 가 둘 다 사라졌고, 새로고침·링크 공유·뒤로가기가 전부 자동으로 맞게 됐다. 강사님 참고 파일에도 같은 자리에 onMounted + watch 조합이 있고 "KeepAlive 를 적용해야만 동작함" 이라는 주석이 달려 있는데, 원본을 하나로 정하면 KeepAlive 없이도 해결되는 문제였다.',
    tags: ['단방향', 'vue-router', 'computed', 'watch'],
    status: 'solved',
  },
  {
    id: 'ts_19',
    task: '과제 7',
    title: 'el-slider 에 v-model 을 걸면 값 검증이 통째로 우회된다',
    symptom:
      '설정 화면의 range 입력을 el-slider 로 바꾸면서 v-model="configStore.dustGoodMax" 를 쓰려다 멈췄다. 그렇게 하면 좋음 상한을 나쁨 하한보다 크게 끌어올릴 수 있게 된다.',
    cause:
      'configStore 는 setDustGoodMax 액션 안에서 Math.min(next, dustBadMin - 1) 로 두 경계가 서로를 넘지 못하게 막고 있다. v-model 은 state 에 직접 대입하므로 이 액션을 거치지 않는다. 컴포넌트를 바꾸는 김에 무심코 v-model 로 옮겼다면 과제 5 에서 만든 방어가 조용히 사라졌을 것이다.',
    solution:
      ':model-value 로 읽고 @input 으로 액션을 부르는 형태를 유지했다. el-switch, el-radio-group, el-checkbox 도 전부 같은 방식으로 붙였다. "읽기는 getter, 쓰기는 action" 이라는 규칙이 UI 라이브러리를 갈아끼울 때 무엇을 지켜야 하는지 알려주는 기준이 됐다.',
    tags: ['Element Plus', 'Pinia', '단방향', 'v-model'],
    status: 'solved',
  },
  {
    id: 'ts_20',
    task: '과제 7',
    title: '브랜드 색을 바꿨는데 화면 곳곳에 옛 초록이 남았다',
    symptom:
      'base.css 의 --c-brand 를 초록(#42b883)에서 파랑(#3182F6)으로 바꿨더니 버튼과 링크는 파랑이 됐는데, 상태바 테두리는 연초록(#c8e6d5), 헤더 배경은 초록빛 그라데이션(#f3faf6), 습도 게이지는 초록(#42b883) 그대로였다. 한 화면에 두 브랜드 색이 섞였다.',
    cause:
      '토큰을 만들어둔 것과 그 토큰을 실제로 쓰는 것은 별개였다. 과제 7 앞부분에서 "색을 CSS 변수로 모았다" 고 적었지만, 그때 치환한 것은 배지·게이지처럼 눈에 띄는 자리였고 테두리 한 줄·그라데이션 끝색·JS 안에서 문자열로 넘기던 색(:color 에 넘긴 #3498db 같은 값)은 그대로 남아 있었다. 값이 바뀌지 않는 동안에는 티가 나지 않다가 팔레트를 갈아끼우는 순간 전부 드러났다.',
    solution:
      'src 전체를 hex 정규식으로 전수 조사해 남은 30여 곳을 토큰으로 치환했다. 브랜드 배경 위 글자색(--c-on-brand)과 연한 브랜드 배경의 테두리색(--c-brand-line)처럼 반복되는 조합은 이름을 새로 줬다. 지금 남은 hex 는 상세 히어로의 날씨별 그라데이션 5개뿐인데, 이건 팔레트가 아니라 맑음·비·눈을 나타내는 삽화라서 의도적으로 남겼다. "토큰을 만들었다" 의 완료 조건은 grep 로 hex 가 안 나오는 상태라는 걸 배웠다.',
    tags: ['CSS 변수', '디자인 토큰', '리팩터링'],
    status: 'solved',
  },
  {
    id: 'ts_21',
    task: '과제 7',
    title: 'el-progress 의 :color 에 CSS 변수를 넘길 수 있는지 몰랐다',
    symptom:
      '습도 게이지 색을 값에 따라 바꾸는 humidityColor 가 hex 문자열 세 개를 리턴하고 있었다. 토큰으로 바꾸고 싶은데, :color 는 라이브러리가 받아서 쓰는 prop 이라 var(--c-cool) 같은 문자열을 이해할지 알 수 없었다.',
    cause:
      'prop 으로 넘긴 값을 라이브러리가 어떻게 쓰는지를 확인하지 않고 짐작하고 있었다. Element Plus 는 이 값을 자바스크립트로 해석하지 않고 내부 엘리먼트의 인라인 style 에 background-color 로 그대로 꽂는다. 인라인 style 이면 var() 는 브라우저가 평소대로 해석한다.',
    solution:
      "humidityColor 가 'var(--c-cool)' / 'var(--c-brand)' / 'var(--c-normal)' 을 리턴하도록 바꾸고, 브라우저에서 실제 계산된 색이 rgb(14, 165, 233) 로 나오는지 확인했다. el-timeline 의 :color 도 같은 방식이라 소개 화면 타임라인 5개 색도 함께 토큰으로 옮겼다. 덕분에 컴포넌트가 색 값을 직접 아는 자리가 사라졌다.",
    tags: ['Element Plus', 'CSS 변수', 'props'],
    status: 'solved',
  },
  {
    id: 'ts_22',
    task: '과제 7',
    title: '카드 hover 에 준 떠오르는 효과가 그리드에서는 방해가 됐다',
    symptom:
      '카드 hover 에 transform: translateY(-2px) 와 그림자를 줬다. 세로 1열이던 과제 6 까지는 괜찮았는데, 그리드로 바꿔 카드 6장이 3열로 깔리자 마우스를 움직일 때마다 칸이 하나씩 들썩여서 목록을 훑기가 불편했다.',
    cause:
      '카드가 하나일 때 좋아 보이는 효과와 여러 장이 격자로 깔릴 때 좋은 효과가 다르다는 걸 고려하지 않았다. 마우스가 지나가는 경로 위의 카드가 전부 순서대로 움직이면 시선이 그걸 따라가게 된다.',
    solution:
      'hover 를 "떠오르기" 에서 "테두리가 진해지고 배경이 한 톤 깔리기" 로 바꿨다. 레이아웃이 전혀 움직이지 않는다. 참고한 Vercel 대시보드가 카드 hover 에 그림자를 쓰지 않는 이유도 같은 것으로 보인다. 같은 이유로 카드를 그림자로 띄우지 않고 1px 테두리로 끊는 방식으로 통일했다.',
    tags: ['CSS', 'hover', '레이아웃', '디자인'],
    status: 'solved',
  },
  {
    id: 'ts_23',
    task: '과제 7',
    title: '10분마다 자동 갱신될 때 카드와 타일이 미세하게 흔들렸다',
    symptom:
      '기온이 8도에서 21도로, 24.8 에서 9.7 로 바뀔 때 카드 안 요소들의 위치가 조금씩 달라졌다. 요약 타일 네 개도 값이 갱신되면 서로 폭이 어긋났다.',
    cause:
      '기본 폰트는 숫자마다 폭이 다르다(1 이 좁고 0 이 넓다). 자릿수가 바뀌면 숫자 상자의 폭 자체가 달라지므로 옆에 붙은 단위와 아래 줄이 따라 움직인다. 평소에는 안 보이다가 useIntervalFn 이 10분마다 값을 갈아끼우는 이 화면에서 드러났다.',
    solution:
      'base.css 에 font-variant-numeric: tabular-nums 를 주는 .num 유틸을 만들고 홈 카드 기온·상세 히어로 기온·시간별 예보 기온에 붙였다. el-statistic 은 내부 엘리먼트를 직접 만들어서 클래스를 못 붙이므로 :deep 으로 같은 속성만 줬다. 히어로에서는 여기에 더해 --lh-display(1.1) 를 새로 뒀는데, 본문용 --lh-tight(1.25)를 44px 에 곱하면 행간이 55px 이 되어 숫자 아래가 허전해졌기 때문이다. 큰 숫자는 크기만 키우면 되는 게 아니라 행간도 같이 조여야 했다.',
    tags: ['CSS', '타이포그래피', 'tabular-nums', 'Element Plus'],
    status: 'solved',
  },
  {
    id: 'ts_20',
    task: '과제 7',
    title: '배경 애니메이션이 멈춰 있는 줄 알았다 - 숨겨진 탭에서는 애니메이션이 얼어붙는다',
    symptom:
      '날씨 배경을 만들고 입자가 실제로 움직이는지 확인하려고 250ms 간격으로 위치를 두 번 재봤더니 값이 똑같았다. 코드가 잘못된 줄 알고 keyframes 와 transform 을 한참 들여다봤다.',
    cause:
      '브라우저가 화면에 그려지지 않는 상태였기 때문. document.visibilityState 가 hidden 이면 브라우저가 CSS 애니메이션과 requestAnimationFrame 을 멈춘다. 안 보이는 탭에서 애니메이션을 돌리는 건 배터리 낭비라서 그렇게 동작한다. 실제로 Animation 객체를 꺼내보니 playState 는 running 인데 currentTime 이 0 에서 안 움직이고 있었다.',
    solution:
      'getAnimations() 로 playState 와 currentTime 을 확인하고, document.visibilityState 를 같이 찍어서 구분했다. 위치를 재는 방식은 화면이 실제로 그려질 때만 쓸 수 있다. 코드 문제와 환경 문제를 가르는 방법을 하나 알게 됐다 - 값이 안 변할 때 "계산이 틀렸나" 보다 "애초에 실행되고 있나" 를 먼저 확인하는 게 빨랐다.',
    tags: ['애니메이션', '브라우저', '디버깅', 'visibilityState'],
    status: 'solved',
  },
  {
    id: 'ts_21',
    task: '과제 7',
    title: '개발용 도구를 import.meta.env.DEV 로 감쌌는데도 배포 번들에 코드가 남았다',
    symptom:
      '배경 미리보기 도구를 만들면서 v-if="import.meta.env.DEV" 로 감싸두면 배포본에서 빠질 거라고 생각했다. 빌드 후 dist 를 검색해보니 컴포넌트의 버튼 문구와 CSS 클래스가 그대로 들어 있었다.',
    cause:
      'import.meta.env.DEV 는 빌드할 때 false 로 치환되므로 화면에 "렌더되지 않는" 것은 맞다. 하지만 파일 맨 위의 정적 import 문은 그것과 별개로 실행되므로 번들러가 컴포넌트 코드를 그대로 포함시킨다. 보이지 않는 것과 들어 있지 않은 것은 다른 얘기였다.',
    solution:
      '정적 import 를 동적 import 로 바꾸고 삼항 안에 넣었다. const X = import.meta.env.DEV ? defineAsyncComponent(() => import(...)) : null 형태다. prod 에서는 조건이 false 로 굳으면서 import() 에 닿을 길이 사라지고 번들러가 청크째로 들어낸다. 빌드 후 dist 를 문자열로 검색해서 0건인 것을 눈으로 확인했다 - "그럴 것이다" 가 아니라 실제로 세어봐야 했다. 다만 부모 화면 템플릿에 있는 알림 문구 하나는 렌더 함수에 문자열로 남는데, 이건 화면에 뜨지 않는 죽은 값이고 20바이트라 그대로 뒀다.',
    tags: ['Vite', '번들', 'tree-shaking', '환경변수', '배포'],
    status: 'solved',
  },
]
