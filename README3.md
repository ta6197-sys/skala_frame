# 과제 7 계획서 — UI Library 적용 + 화면 개선

README2(과제 6 계획서)와 같은 형식. 요구사항 원문을 `###` 로 인용하고, 판단 근거를 `-` 불릿으로 적음.

---

## 0. Vue.pdf 에서 확인한 것

### 지금 단원이 무엇인가 (p.13)

> **Hands on - Weather UI Library**
> 외부 UI Library 를 선정하고 3일차 과제에 외부 UI Library 를 자유롭게 적용해 본다.

- 즉 이번 단원의 과제 본체는 **"UI 라이브러리를 실제로 화면에 적용하는 것"** 이다. 화면을 꾸미는 일이 곁다리가 아니라 과제 그 자체다.
- 슬라이드의 1~3번 항목은 p.12(과제 6, Axios)와 글자까지 똑같다. 슬라이드 복사 실수로 보이며, 이 단원의 실질 요구는 제목 줄 하나다. **그래서 "무엇을 어디까지 적용할지" 를 스스로 정하고 README 에 근거를 남기는 게 채점 대상이 된다.**
- 현재 상태: Element Plus 는 `main.js` 에 전역 등록까지 끝나 있는데 **실제로 쓰는 컴포넌트는 4종뿐**이다 (`el-alert`, `el-empty`, `el-skeleton`, `el-carousel`). 나머지 화면은 전부 순수 CSS 로 직접 그렸다. 라이브러리를 설치만 하고 안 쓴 상태에 가깝다.

### 어떻게 채점되는가 (p.3)

| 항목 | 배점 | 이번 개선이 닿는 지점 |
|---|---|---|
| 기본 문법 | 25 | v-directive / composition api / component — 이미 충족. **§6 단방향 정리**로 품질을 올린다 |
| 확장 문법 | 25 | router / store / axios / **ui library** — **ui library 만 비어 있다. 이번 작업의 1순위** |
| 앱 완성도 | 25 | 배포 결과물의 완성도 및 **창의성**. **§4 레이아웃 버그 + §5 화면 개선**이 여기 |
| 수업 참여 | 25 | 코드로 할 수 있는 게 없음 |

- 91점 이상(Excellent) 조건이 "기본 요구사항을 완벽히 충족 + **충분한 개인 실습을 넘어 창의성과 완성도가 높으며**" 다. 요구사항 충족은 이미 끝났으므로, 남은 점수는 완성도·창의성 쪽에 있다.

### Customization 을 어떻게 보는가 (p.6)

> 데이터만 추가하고 화면에서 사용하지 않는 것보다, **데이터 → 조건/바인딩 → Mockup 변화**까지 이어지게 만드는 것이 과제 취지에 가깝다.
> 색상을 하드코딩하지 않고 `:class` / `:style` 로 동적 표현

- 이 문장이 §5-3(날씨 아이콘)과 §4-2(색 토큰화)의 직접적인 근거다. **지금 `icon` 필드를 API 로 받아만 두고 화면에서 안 쓰고 있는데, 이건 교수님이 지적한 "데이터만 추가하고 안 쓰는" 상태에 정확히 해당한다.**

### 마지막 단원 (p.14)

- ESLint Error 0, API 키 환경변수 처리(완료), 빌드 후 정적 호스팅.
- 이번 작업 끝에 `npm run lint` 와 `npm run build` 를 반드시 통과시켜 다음 단원 진입 상태를 만든다.

---

## 1. 상한 기준 (skala-vue-main)

교수님 참고 파일에 실제로 등장하는 것만 "써도 되는 것" 으로 본다.

| 구분 | 참고 파일에 나오는 것 |
|---|---|
| 문법 | `<script setup>`, `ref`/`reactive`/`computed`/`watch`/`watchEffect`, 라이프사이클 훅 |
| 컴포넌트 | `defineProps`/`defineEmits`, slot 3종(default·named·scoped), `<style scoped>` |
| 디렉티브 | `v-for`/`v-if`/`v-show`/`v-bind`(class·style)/`v-model`/이벤트 수식어 |
| 라우터 | 지연 로딩, 동적 경로, 쿼리 스트링, catch-all, `RouterView v-slot` + `KeepAlive` |
| 스토어 | Pinia **Setup Store** 문법 |
| 통신 | axios |
| UI | Element Plus — `el-card`/`el-input`/`el-switch`/`el-input-number`/`el-rate`/`el-button`/`el-progress`/`el-message`/`el-messagebox` (`practices/library/ElementPlus.vue`) |
| 스타일 | 순수 CSS 파일 + `:root` CSS 변수(`base.css` 에 이미 존재), 컴포넌트별 `<style scoped>` |

### 판단이 필요했던 것

| 항목 | 판단 | 근거 |
|---|---|---|
| Element Plus 의 나머지 컴포넌트(`el-tag`, `el-descriptions`, `el-slider`, `el-radio-group`, `el-collapse`, `el-result`, `el-statistic`, `el-badge`…) | **쓴다** | p.13 이 "자유롭게 적용" 이라고 명시. 참고 파일은 9종만 예시로 든 것이고, 라이브러리는 이미 전역 등록되어 있어 새 설치가 없음 |
| `@element-plus/icons-vue` | **안 쓴다** | 새 패키지 설치가 필요함. 날씨 아이콘은 OpenWeatherMap 이 이미 주고 있어서 대체 가능 |
| `<Transition>` | **쓴다(최소한만)** | Vue 빌트인이라 라이브러리 추가 없음. 참고 파일 `App.vue.exercise` 에 형제격인 `KeepAlive` 가 주석으로 들어 있음. 라우트 전환 페이드 1곳에만 적용 |
| Composable(`use*.js`) 추출 | **안 한다** | p.11 슬라이드에 "Composable 로 해결 가능함 **(범위 제외)**" 로 명시 |
| Tailwind / TypeScript / 차트 라이브러리 | **안 쓴다** | 참고 파일에 없고, README2 §6 에서 이미 배제 결정을 기록함 |

**결론: 새 npm 패키지를 하나도 설치하지 않는다.** 이미 있는 Element Plus 와 Vue 빌트인, 순수 CSS 만으로 한다.

---

## 2. 현재 상태 진단 (실측)

`npm run dev` 로 띄우고 브라우저에서 직접 측정했다.

### 2-1. 레이아웃이 스캐폴드 잔재에 눌려 있음

- `src/assets/main.css` 에 `create-vue` 기본 CSS 가 그대로 남아 있다.

  ```css
  @media (min-width: 1024px) {
    body { display: flex; place-items: center; }
    #app { display: grid; grid-template-columns: 1fr 1fr; padding: 0 2rem; }
  }
  ```

- `#app` 의 자식은 `.practice-container` **하나뿐**이다. 2열 그리드에 자식이 하나면 왼쪽 칸만 채우고 오른쪽 절반은 영구 공백이 된다. 넓은 모니터에서 화면이 왼쪽으로 쏠려 보이는 원인.
- `src/assets/practice.css` 의 `div.practice-container { max-width: 1200px; width: 800px; }` — `width` 가 뒤에 와서 **항상 800px 고정**이다. `max-width` 는 아무 일도 하지 않는다.
- 실측: 뷰포트 800px 에서 `scrollWidth 832` / `clientWidth 785` → **47px 가로 스크롤 발생**.
- 즉 지금은 어떤 화면에서도 본문 폭이 800px 고정이고, 좁은 화면에서는 가로 스크롤이 생긴다. 폰으로 배포본을 열면 바로 보이는 문제다(앱 완성도 항목).

### 2-2. 받아온 데이터를 화면이 안 쓰고 있음

- `src/api/weather.js:29` 의 `getCurrentWeather` 가 `icon`(OpenWeatherMap 아이콘 코드, 예: `04n`)을 리턴하고 `weatherStore` 의 `EMPTY_WEATHER` 에도 자리가 있는데, **이걸 그리는 화면이 0곳**이다.
- p.6 이 지적한 "데이터만 추가하고 화면에서 안 쓰는" 상태. 추가 호출 없이 그릴 수 있으므로 가장 싼 개선 재료다.

### 2-3. UI 라이브러리를 설치만 하고 거의 안 씀

- 전체 `.vue` 파일에서 쓰는 Element Plus 컴포넌트: `el-alert`, `el-empty`, `el-skeleton`, `el-carousel` **4종**.
- 나머지(카드·배지·게이지·슬라이더·라디오·표·버튼 그룹)는 전부 손으로 CSS 를 짰다. 잘 만들었지만 **이번 단원의 요구는 정반대 방향**이다.
- `main.js` 는 `app.use(ElementPlus)` 로 전체를 등록 중이라, 컴포넌트를 더 쓰는 데는 추가 비용이 0 이다. (README2 §9 에 기록된 번들 937KB 는 이미 지불된 비용이고, 4종만 쓰는 지금이 가장 손해인 상태다)

### 2-4. 색이 6개 파일에 하드코딩되어 있음

- `#42b883`(브랜드) `#e74c3c`(더움) `#3498db`(선선) `#27ae60`(좋음) `#f39c12`(보통) `#7f4b8b`(나쁨) `#6c757d`/`#adb5bd`(보조) 가
  `weather.css` · `WeatherCard.vue` · `LifeIndexBar.vue` · `WeatherDetailView.vue` · `WeatherStatsView.vue` · `App.vue` 에 각각 다시 적혀 있다.
- 배지 색 하나 바꾸려면 5군데를 고쳐야 한다. `base.css` 에 `:root` 블록이 이미 있는데 프로젝트 색은 거기 없다.

### 2-5. `weather.css` 와 `WeatherCard.vue` 의 스타일이 두 벌

- `.weather-card` / `.badge*` / `.gauge*` / `.card-info` 가 양쪽에 같은 내용으로 있다.
- 단, `weather.css` 는 과제 1~3 컴포넌트 16개가 쓰고 있어 **지울 수 없다.** 죽은 코드가 아니라 갈라진 코드다.
- 해법은 삭제가 아니라 **양쪽이 같은 CSS 변수를 보게 만드는 것**(§4-2).

### 2-6. 흐름의 방향이 갈라지는 두 지점

- 검색어가 `state → URL` 과 `URL → state` **양쪽으로** 흐른다 (`WeatherHomeView.vue` 의 `onMounted` + `watch`).
- `weatherStore.fetchAll()` 호출 지점이 `WeatherHomeView` / `FavoritesView` / `WeatherStatsView` **3곳**에 흩어져 있다.

---

## 3. 개선 원칙 (단방향)

이번 작업에서 코드를 고칠 때 지킬 규칙. 세 줄로 고정한다.

1. **값은 한 곳에서만 태어난다.** 같은 값을 두 곳이 각자 들고 동기화하지 않는다. 원본을 하나 정하고 나머지는 `computed` 로 파생시킨다.
2. **아래로는 props, 위로는 emit, 옆으로는 store.** 형제 컴포넌트끼리 직접 주고받지 않는다.
3. **읽기는 getter, 쓰기는 action.** 컴포넌트가 store 의 `state` 에 직접 대입하지 않는다. (`configStore.setDustGoodMax` 처럼 이미 지키는 방식)

### axios 호출 형태 — 단축 메서드만 쓴다

슬라이드 `Axios - Method List` 의 빨간 메모("가능하면 병렬요청을 사용하지 않고 코드를 짜보면 더 좋을 듯")가 가리키는 대상은
표의 **병렬 요청** 행, 즉 `axios.all([...])` 과 `axios.spread(callback)` 이다.

- 확인 결과 이 프로젝트에는 **`axios.all` / `axios.spread` 가 0건**이다.
- API 함수 5개가 전부 **HTTP 단축 메서드**로 되어 있다. `axios({ method: 'get', url: ... })` 같은 config 호출 형태도 쓰지 않는다.

| 파일 | 호출 |
|---|---|
| `api/weather.js:15` | `owmClient.get('/data/2.5/weather', { params })` |
| `api/weather.js:33` | `owmClient.get('/data/2.5/air_pollution', { params })` |
| `api/weather.js:46` | `owmClient.get('/data/2.5/forecast', { params })` |
| `api/weather.js:63` | `owmClient.get('/geo/1.0/reverse', { params })` |
| `api/weather.js:74` | `openMeteoClient.get('/v1/forecast', { params })` |

### `Promise.all` 은 그대로 둔다

남아 있는 `Promise.all` 3곳(`fetchCity`, `fetchAll`, `WeatherHomeView` 의 내 위치)은 **표준 JavaScript** 이지
슬라이드가 말하는 axios 의 병렬 요청 API 가 아니다. 그래서 메모의 대상이 아니라고 보고 유지한다. 근거 세 가지.

1. **성능** : 실측했다. 대시보드 첫 로딩에 나가는 요청이 19개이고 평균 응답이 693ms 다.
   전부 순차로 바꾸면 **합계 13.2초**가 된다(현재는 1.2~2초). 화면을 열 때마다 13초를 기다리는 건 앱 완성도 항목에서 잃는 게 더 크다.
2. **`allSettled` 는 성능 장치가 아니라 기능 장치다** : `fetchAll` 은 실패한 도시 **개수를 세서** 폴백 여부를 정한다.
   전부 실패하면 목업으로 내려앉고, 일부만 실패하면 알림만 띄운다. 순차 `await` 로 바꾸면 첫 실패에서 멈추므로 이 로직을 처음부터 다시 짜야 한다.
3. **흐름의 방향과 무관하다** : §3 의 세 원칙은 "어떤 값이 어디서 어디로 흐르는가" 에만 적용한다.
   `Promise.all` 은 값이 흐르는 방향을 바꾸지 않고 "몇 개를 동시에 기다리는가" 만 정한다.

---

## 4. A. 기반 정리

### 4-1. 레이아웃 정상화

- `main.css` 에서 스캐폴드 잔재(`body` flex, `#app` 2열 그리드)를 걷어낸다.
- `practice.css` 의 고정폭을 반응형으로 바꾼다.

  ```css
  div.practice-container {
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;
    padding-inline: 16px;
  }
  ```

- 이것만으로 가로 스크롤이 사라지고, 넓은 화면에서 본문이 가운데로 오고, §5-4(카드 그리드)를 넣을 가로 공간이 생긴다.
- 근거: 이 두 파일은 과제 1 때 스캐폴드에서 받은 그대로였다. 화면이 1개일 땐 안 보이던 문제가 9개가 되니 드러났다.

### 4-2. 색·간격을 `base.css` 의 CSS 변수로 통일

- `base.css` 의 `:root` 아래에 프로젝트 토큰을 추가한다. 브랜드/판정색/텍스트/면/형태(radius·shadow·space).
- Element Plus 의 `--el-color-primary` 도 같은 자리에서 브랜드 색으로 덮어쓴다. **이 한 줄이 없으면 el-button·el-slider·el-progress 가 전부 Element Plus 기본 파랑(#409EFF)으로 나와 기존 초록 톤과 어긋난다.** README2 §9 에서 미리 걱정해 둔 지점이 실제로 문제가 되는 곳이다.
- 그다음 6개 파일의 하드코딩 hex 를 `var(--c-*)` 로 치환한다.
- **2-5 의 중복이 여기서 해결된다.** `weather.css` 와 `WeatherCard.vue` 가 각자 `.badge-hot` 을 갖고 있어도 둘 다 `var(--c-hot)` 을 보므로 색이 갈라지지 않고, 과제 1~3 화면도 같이 새 톤으로 바뀐다.
- p.6 의 "색상을 하드코딩하지 않고" 지침과도 방향이 같다.

---

## 5. B. UI Library 적용 (이번 단원의 본체)

**적용 원칙**: 라이브러리로 바꿔서 더 나아지는 곳만 바꾼다. 이미 잘 도는 것을 el- 로 갈아끼우는 것 자체가 목적이 되면 코드만 길어진다. 아래는 전부 "직접 짜면 번거롭거나, 접근성·키보드 조작을 공짜로 얻는" 자리다.

### 5-1. 헤더 / 네비게이션 — `el-badge`, `el-switch`, `el-tag`

- 현재 최상단이 `<h1>과제 6. 날씨 (Axios)</h1> + <hr>` 이고 링크 9개가 평평하게 나열돼 있다.
- 개선: 브랜드 블록(서비스명 + 한 줄 설명) / 주 메뉴 5개 / 보조 2개 분리 / 우측에 단위 토글.
- `즐겨찾기` 링크의 개수 배지를 손으로 만든 `.nav-badge` → **`el-badge`**.
- `UnitToggler` 의 버튼 → **`el-switch`** (`active-text="℉"` / `inactive-text="℃"`). 참고 파일 `ElementPlus.vue` 에 나오는 컴포넌트라 상한 안쪽이 확실하다.
- 과제 번호("과제 6. 날씨 (Axios)")는 지우지 않고 헤더 우측 `el-tag` 로 옮긴다. 제출물이라 어느 과제인지는 화면에 남아야 한다.

### 5-2. 카드 껍데기 — `BaseDashboardCard` 를 `el-card` 위에 얹기

- `BaseDashboardCard` 는 과제 3 요구사항(슬롯 실습)의 산출물이라 **컴포넌트 자체를 없애면 안 된다.**
- 대신 내부 구현만 `el-card` 로 바꾸고 `<slot name="title">` / `<slot>` 인터페이스는 그대로 둔다. 부모 화면들은 한 줄도 안 고쳐도 된다.
- 이게 "슬롯으로 감싼 공통 껍데기" 라는 과제 3 의 의도를 지키면서 UI 라이브러리를 적용하는 방법이다. README 에 쓸 거리.

### 5-3. `WeatherCard` 리디자인 — 아이콘 + `el-tag` + `el-progress` + `el-checkbox`

- **이번 개선에서 시각적으로 가장 크게 달라지는 지점.** 이미 받아오고 있는 `city.icon` 을 쓴다.

  ```vue
  <img :src="`https://openweathermap.org/img/wn/${city.icon}@2x.png`" :alt="city.status" />
  ```

- 손으로 만든 `.badge` → **`el-tag`** (`type` 을 `:type` 으로 동적 바인딩 → p.6 의 "`:class`/`:style` 동적 표현" 지침에 부합)
- 손으로 만든 `.gauge` → **`el-progress`** (습도)
- 즐겨찾기 `<input type="checkbox">` → **`el-checkbox`**
- 상세보기 `<button>` → **`el-button type="primary"`**
- 카드 구성: 도시명 + 즐겨찾기 / 아이콘 + 큰 기온 + 상태 / 배지 2개 / 습도 게이지 / 상세보기 버튼(전체 폭). 그리드 칸에 맞게 가로형 → 세로형으로.
- 아이콘은 외부 이미지라 실패할 수 있다. 폴백(목업) 데이터에는 `icon` 이 없으므로 `v-if="city.icon"` 으로 자동 처리된다.

### 5-4. 홈 — 카드 그리드 + 요약 타일

- 카드 6장이 세로 1열로만 쌓인다. 4-1 로 폭이 넓어지면 오른쪽이 비므로 그리드로 바꾼다.

  ```css
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  ```

  `auto-fill` + `minmax` 라서 미디어쿼리 없이 폰 1열 / 태블릿 2열 / 데스크톱 3열이 된다.
- 상단에 `평균 기온` / `가장 더운 도시` / `미세먼지 나쁨 N곳` 요약 타일 3칸.
- **중요**: 이 계산식은 `WeatherStatsView` 에 이미 있다. 홈에 복사하면 §3 원칙 1 위반이다. → `weatherStore` 에 `summary` getter 를 만들고 **홈과 통계가 같은 getter 를 읽는다.**
  단, "미세먼지 나쁨 개수" 는 `configStore` 의 사용자 기준에 따라 달라지므로 스토어끼리 얽히지 않게 화면에서 `configStore.dustGrade` 로 센다(통계 화면이 이미 그 방식).
- 검색창 → **`el-input`**. 단, 과제 1 요구사항 3(한글 IME)에 따라 `v-model` 이 아니라 `:model-value` + `@input` 을 유지한다. 라이브러리를 쓰면서 앞 단원 요구사항도 지키는 지점이라 README 에 남긴다.
- 스켈레톤을 카드 그리드와 같은 격자 모양으로 바꿔 로딩→완료 시 화면이 튀지 않게 한다.

### 5-5. 상세 — 히어로 + `el-descriptions` + 가로 예보

- 지금은 카드 6개가 세로로 길게 쌓여 스크롤이 길다.
- **히어로**: 아이콘(100px) + 큰 기온 + 체감 + 상태 + 도시명. 배경은 `icon` 코드 앞 두 자리(`01`~`50`)로 판정해 `:class` 로 그라디언트를 갈아끼운다(맑음/구름/비/눈). → p.6 의 동적 표현 지침.
- **관측 항목**: `<table>` 6행 → **`el-descriptions`** (`:column="3"` `border`). 세로 길이가 1/3 로 줄고, 반응형·구분선을 공짜로 얻는다.
- **시간별 예보**: 세로 막대 리스트 → 가로 스크롤 카드(`overflow-x: auto`). 시간 흐름이 직관적으로 읽힌다.
- 이전/다음 도시 → **`el-button-group`**, 히어로 우측으로 올려 스크롤 없이 이동 가능하게.
- 즐겨찾기 토글 → **`el-button`** (`:type` 동적).

### 5-6. 설정 — `el-slider`, `el-radio-group`, `el-input-number`

- 현재 `<input type="range">` 2개와 `<input type="radio">` 3개. **UI 라이브러리 효과가 가장 큰 화면**이고, 참고 파일 `ElementPlus.vue` 의 실습 2번(수량·별점)과 성격이 같다.
- 더움 기준 온도 → **`el-slider`** (`:marks` 로 눈금 표시) 또는 `el-input-number`
- 미세먼지 경계 2개 → **`el-slider`** (`show-stops`)
- 체질 3택 → **`el-radio-group`** + `el-radio-button`
- 되돌리기 → **`el-button`** + **`ElMessageBox.confirm`** (참고 파일 실습 3번과 같은 패턴)
- 저장/초기화 피드백 → **`ElMessage`**
- 주의: 모두 `:model-value` + `@change` → **action 호출** 형태를 유지한다. `v-model` 로 store state 에 직접 물리면 §3 원칙 3 위반이고, `setDustGoodMax` 안의 경계 보정 로직이 우회된다.

### 5-7. 나머지 화면

| 화면 | 적용 |
|---|---|
| 통계 | 랭킹 막대 → `el-progress`, 주의 도시 → `el-tag`, 요약 → `el-statistic` |
| 즐겨찾기 | `el-empty` 유지 + 비우기 버튼에 `ElMessageBox.confirm` |
| 트러블슈팅 | 필터 버튼 → `el-radio-group`(button 형), 항목 → `el-collapse`, 상태 → `el-tag` |
| 404 | 직접 만든 마크업 → **`el-result`** (`icon="warning"`) |
| 소개 | `el-descriptions` 로 라우트 표 정리 |

### 5-8. 라우트 전환 페이드 (`<Transition>`)

- `App.vue` 의 `<RouterView>` 를 `v-slot` 형태로 바꾸고 `<Transition name="fade" mode="out-in">` 으로 감싼다. CSS 4줄.
- 참고 파일 `App.vue.exercise` 에 `RouterView v-slot` + `KeepAlive` 조합이 주석으로 들어 있어 형태 자체는 상한 안쪽이다.

---

## 6. C. 단방향 정리

### 6-1. 검색어의 양방향 루프를 한 방향으로

- 현재 `WeatherHomeView.vue` 는 `onMounted` 에서 `URL → state`, `watch` 에서 `state → URL` 로 양쪽으로 흐른다. 값 하나에 저장소가 둘이고 서로를 갱신한다. 지금은 `replace` 라서 무한루프는 안 나지만, **뒤로가기로 URL 이 바뀌면 화면이 안 따라온다**(`onMounted` 는 이미 끝났으므로).
- **URL 을 원본으로 삼는다.**

  ```js
  // 원본은 주소창 하나. 화면은 거기서 파생만 한다.
  const searchQuery = computed(() => String(route.query.search ?? ''))

  // 입력이 오면 상태가 아니라 주소를 고친다. 그러면 위 computed 가 알아서 따라온다.
  const handleUpdateQuery = (newQuery) => {
    router.replace({ path: route.path, query: { search: newQuery || undefined } })
  }
  ```

- `onMounted` 의 복원 코드와 `watch(searchQuery)` 가 **둘 다 사라진다.** 흐름이 `입력 → router.replace → route.query → computed → 화면` 한 방향이 되고, 새로고침·링크 공유·뒤로가기가 전부 자동으로 맞는다.
- 참고 파일의 같은 자리에는 교수님 주석으로 "현재 큰 의미없음", "KeepAlive 를 적용해야만 동작함" 이 적혀 있다. **상한 안에서 그 한계를 해결한 셈**이라 README 거리가 된다.
- 과제 2 요구사항 3 의 `watchEffect` 로그는 `searchQuery` 가 `computed` 가 돼도 그대로 동작하므로 지우지 않는다.

### 6-2. `fetchAll()` 진입점을 하나로

- 지금 세 화면이 각자 `onMounted(() => weatherStore.fetchAll())` 을 부른다. 캐시 덕에 중복 호출은 안 나지만 "언제 받아오는가" 를 아는 곳이 3곳이다.
- `App.vue` 의 `onMounted` 한 곳으로 올린다. 이후 각 화면은 **스토어를 읽기만** 한다.
- 상세의 `ensureCity(cityId)` 는 역할이 달라서(이 도시만 없으면 채움) 그대로 둔다.
- `useIntervalFn` 자동 갱신은 홈에 남긴다. App 으로 올리면 안 보는 화면 때문에 호출 한도를 쓰게 된다.
- 효과: `App.vue(1회 요청) → weatherStore → 각 화면(읽기 전용)` 한 줄이 된다.

### 6-3. `WeatherCard` 의 props/store 혼용은 문서화만

- `city` 는 props, 단위·즐겨찾기는 store 직접 참조 — 이건 과제 5 주석에 근거가 적힌 **의도된 설계**다. 코드 변경 없이 §3 세 줄 규칙을 컴포넌트 상단 주석에 명시해 다음에 헷갈리지 않게 한다.

---

## 7. D. 마감 (p.14 대비)

1. `npm run lint` — oxlint + eslint Error 0
2. `npm run build` — 빌드 통과 확인, 번들 크기 전후 기록
3. `README.md` 에 "# 과제 7" 섹션 추가 (기존 형식 유지: 요구사항 원문 `###` 인용 + 근거 불릿 + `~함`/`~됨` 종결)
4. `src/data/troubleshooting.js` 에 이번에 겪은 항목 추가

---

## 8. 작업 순서

앞 단계가 끝나야 다음이 편해지는 순서.

| # | 작업 | 파일 |
|---|---|---|
| 1 | 스캐폴드 잔재 제거 + 컨테이너 반응형 | `main.css`, `practice.css` |
| 2 | CSS 토큰 + Element Plus 테마 변수 덮어쓰기 | `base.css` |
| 3 | 하드코딩 hex → `var()` 치환 | `weather.css` 외 5개 |
| 4 | 헤더/네비 재구성 + 라우트 전환 + `fetchAll` 통합 | `App.vue`, `UnitToggler.vue` |
| 5 | `BaseDashboardCard` → `el-card` 내부 교체 | `BaseDashboardCard.vue` |
| 6 | `WeatherCard` 세로형 + 아이콘 + el- 컴포넌트 | `WeatherCard.vue` |
| 7 | 홈 그리드 + 요약 타일 + 검색어 단방향 | `WeatherHomeView.vue`, `weatherStore.js`, `SearchBar.vue` |
| 8 | 상세 히어로 + `el-descriptions` + 가로 예보 | `WeatherDetailView.vue` |
| 9 | 설정 `el-slider`/`el-radio-group` | `SettingsView.vue` |
| 10 | 통계·즐겨찾기·트러블슈팅·404·소개 | 각 view |
| 11 | lint / build / README / troubleshooting | |

---

## 9. 안 하기로 한 것과 이유

| 항목 | 이유 |
|---|---|
| `@element-plus/icons-vue` 설치 | 새 패키지가 필요함. 날씨 아이콘은 OWM 이 이미 제공 |
| Element Plus 온디맨드 전환 | 이번엔 **더 많이 쓰는 게** 과제 방향(p.13)이라 통째 등록이 오히려 맞다. 번들 크기는 README 에 한계로 기록 |
| Tailwind / 차트 라이브러리 / TypeScript | 참고 파일에 없음. README2 §6 배제 결정 유지 |
| Composable 추출 | p.11 "범위 제외" 명시 |
| 다크 모드 | 화면 9개 색을 두 벌 검증해야 함. 이번 범위 밖 |
| 과제 1~3 화면(`/legacy`) 리디자인 | 제출 이력이라 보존. §4-2 토큰 치환으로 색만 자동으로 따라옴 |
| `Promise.all` → 순차 변경 | §3 참조. 흐름의 방향이 아니라 네트워크 동시성 |

---

## 10. 루브릭 대조 (p.3)

| 평가 항목 | 이번 작업에서 대응하는 것 |
|---|---|
| 기본 문법 (25) | `:class`/`:style` 동적 바인딩 확대(p.6), 검색어 단방향 전환으로 `computed` 파생 구조 정리, slot 인터페이스 보존한 채 내부 교체 |
| 확장 문법 (25) | **Element Plus 4종 → 15종 이상 적용.** router/store/axios 는 이미 충족 |
| 앱 완성도 (25) | 가로 스크롤·좌측 쏠림 버그 제거, 반응형 그리드, 날씨 아이콘 도입, 라우트 전환, 로딩 스켈레톤 정합 |
| 수업 참여 (25) | 코드 범위 밖 |
