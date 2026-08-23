# 기술 스택 범위 안내 (평가 참고용)

이 문서는 `skala-vue-main`(강사님이 배포한 기준 템플릿)과 현재 제출 프로젝트(`skala-vue-task`)를 실제로 diff 해서,
"수업에서 다루지 않았는데 스스로 찾아 적용한 기술"이 무엇인지 정리한 것이다.
기준 템플릿이 보장하는 범위를 먼저 확정한 뒤, 그 밖에서 스스로 조사해 적용한 기술과 각각의 도입 근거를 정리했다.

- 기준: `skala-vue-main.zip` (프로젝트 루트에 보관 중인 원본 템플릿)
- 비교 대상: 현재 저장소(`skala-vue-task`, 이 프로젝트)
- 비교 방법: 두 프로젝트의 `package.json`, `vite.config.js`, `src/` 전체 구조를 직접 대조

---

## 1. 기준 템플릿(`skala-vue-main`)이 제공하는 스택

### 1-1. 의존성 (`package.json`)

```json
"dependencies": {
  "axios": "^1.18.1",
  "element-plus": "^2.14.2",
  "pinia": "^3.0.4",
  "vue": "^3.5.32",
  "vue-router": "^5.0.4"
},
"devDependencies": {
  "@eslint/js": "^10.0.1",
  "@vitejs/plugin-vue": "^6.0.6",
  "eslint": "^10.2.1",
  "eslint-config-prettier": "^10.1.8",
  "eslint-plugin-oxlint": "~1.60.0",
  "eslint-plugin-vue": "~10.8.0",
  "globals": "^17.5.0",
  "npm-run-all2": "^8.0.4",
  "oxlint": "~1.60.0",
  "prettier": "3.8.3",
  "vite": "^8.0.8",
  "vite-plugin-vue-devtools": "^8.1.1"
}
```

즉 기준 템플릿이 보장하는 것은 **Vue 3 + Vue Router + 순수 Pinia + Element Plus + Axios**, 그리고 Vite/ESLint/Prettier/oxlint 툴체인뿐이다.
그 외의 런타임 라이브러리는 하나도 직접 의존성으로 선언되어 있지 않다.

> 참고: 템플릿의 `package-lock.json`에는 `@vueuse/core@14.3.0`이 등장하지만, 이는 `element-plus`가 내부적으로 물고 오는 **간접(전이) 의존성**이다.
> `package.json`에 직접 선언되어 있지 않으므로, 원래 이 프로젝트에서 `import { xxx } from '@vueuse/core'` 형태로 앱 코드에서 가져다 쓰는 것은 템플릿이 의도한 사용법이 아니다. (마침 node_modules에 존재해서 우연히 동작할 뿐인 "phantom dependency".)

### 1-2. `vite.config.js` — 정적 설정만 존재

```js
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 3000, open: true },
  build: { outDir: 'dist' },
})
```

`defineConfig`에 **객체를 그대로** 넘기는 가장 기본적인 형태다. `mode` 인자를 받는 함수형 설정, `loadEnv`, 프록시(`server.proxy`) 같은 개념은 템플릿에 전혀 없다.

### 1-3. `src` 구조와 커리큘럼 범위

템플릿은 파일명에 `.beforeAxios` / `.afterAxios` / `.beforeStore` / `.afterStore` / `.1st` / `.2nd` / `.3rd` / `.question` / `.answer` 같은 접미사를 붙여, **단계별로 무엇을 배우고 무엇을 새로 넣는지**를 명시적으로 구분해 두고 있다. 즉 템플릿 자체가 "여기까지가 이번 과제 범위"라는 경계를 파일로 그어둔 셈이다.

**기초 문법 (`src/components/practices/basic/`)**
`EventBasic`, `EventModifier`, `EventObject`, `ModelBasic`, `ModelForm`, `ModelModifier`, `SampleOne`, `SampleTwo`, `StyleScoped`, `VueBind`, `VueBindClass`, `VueBindShorthand`, `VueBindStyle`, `VueCloak`, `VueFor`, `VueHtml`, `VueHtmlXss`, `VueIf`, `VueMemo`, `VueOnce`, `VuePre`, `VueShow`, `VueText`

**컴포넌트 (`src/components/practices/component/`)**
`LifecycleChild/Parent`, `PropsEmitsChild/Parent`, `SlotDefaultChild/Parent`, `SlotNamedChild/Parent`, `SlotScopedChild/Parent`

**Composition API (`src/components/practices/composition/`)**
`ComputedBasic`, `ReactiveReactive`, `ReactiveRef`, `WatchersBasic`, `WatchersDeep`, `WatchersMulti`, `WatchersReactive`, `WatchersReactiveArray`, `WatchersRefArray`, `WatchersWatchEffect`

**라이브러리 연동 (`src/components/practices/library/`)**
`AxiosJson`, `AxiosWeather`, `EcmaScript`(+`.question`/`.answer`), `ElementPlus`, `StoreCounter`

**뷰/라우팅**
`AboutView`, `HomeView`, `NotFoundView`, `WeatherAboutView`, `WeatherHomeView`(+`.beforeAxios`/`.afterAxios`), `WeatherDetailView`(+`.beforeAxios`/`.afterAxios`/`.beforestore`/`.afterStore`)

**스토어**
`configStore.js` (단위 celsius/fahrenheit 토글 — Pinia 순정 기능만), `counter.js` (Pinia 공식 예제)

정리하면 템플릿이 실제로 가르치는 범위는:

- Vue 3 반응형 3종(`ref`/`reactive`/`computed`) + `watch`/`watchEffect`
- 이벤트/모델 바인딩, 클래스/스타일 바인딩, 디렉티브(`v-if`/`v-for`/`v-show`/`v-once`/`v-memo`/`v-pre`/`v-cloak`)
- 컴포넌트 통신: props/emit, slot 3종, lifecycle hook
- Vue Router 기본 라우팅 + lazy import
- Pinia 순정 스토어 (persist 없음)
- Element Plus 컴포넌트 사용
- Axios로 REST API(날씨) 직접 호출

여기까지가 "기준 템플릿이 보장하는 = 원래 수업에서 다루는" 기술 범위다.

---

## 2. 현재 프로젝트가 이 범위를 넘어서 사용한 기술

diff 결과, 아래 7가지는 기준 템플릿에 전혀 없던 것을 현재 프로젝트에서 직접 조사해서 추가한 것이다.

### 2-1. `@vueuse/core` — Vue 컴포저블 유틸 라이브러리

- `package.json`에 직접 의존성으로 명시 (`^14.4.0`, 템플릿의 간접 의존성 버전 `14.3.0`과 다름 → 별도로 설치한 것)
- 실사용 위치:
  - [src/App.vue](src/App.vue) — `useOnline`
  - [src/views/WeatherHomeView.vue](src/views/WeatherHomeView.vue) — `useOnline`, `useIntervalFn`
  - [src/composables/useMyLocation.js](src/composables/useMyLocation.js) — `useGeolocation`
  - [src/stores/weatherStore.js](src/stores/weatherStore.js) — `useIntervalFn` (상대시간 표시를 30초마다 다시 계산시키는 시계)
- 사용 목적: 브라우저 온라인/오프라인 감지(`useOnline`), Geolocation API 래핑(`useGeolocation`), 언마운트 시 자동 정리되는 인터벌(`useIntervalFn`)
- 템플릿에 이런 컴포저블 유틸 개념(서드파티 composable 라이브러리) 자체가 없음. 순수 Vue API(`onMounted`, `setInterval`/`clearInterval` 직접 관리)로 구현하는 것이 템플릿 범위에 맞는 방식.
- 소비만 하지 않고 같은 방식으로 직접 만든 것도 있다: [src/composables/](src/composables/) 의 `useQueryParam` / `useMyLocation` / `useCityForecast`.

### 2-2. `dayjs` — 날짜/시간 라이브러리 + 플러그인 확장

- `package.json`에 직접 의존성으로 추가 (`^1.11.23`)
- 전용 설정 파일을 새로 만듦: [src/utils/dayjs.js](src/utils/dayjs.js)
  - `dayjs/plugin/utc`, `dayjs/plugin/timezone`, `dayjs/plugin/relativeTime`, `dayjs/locale/ko`까지 플러그인 확장(`dayjs.extend(...)`)해서 사용
  - UNIX timestamp → 도시별 현지 시각 변환(`fromUnix`), "오늘 오후 3시" 같은 상대적 라벨링(`formatHourLabel`), "3분 전" 표시(`fromNow`) 구현
- 사용처: [src/stores/weatherStore.js](src/stores/weatherStore.js), [src/views/WeatherDetailView.vue](src/views/WeatherDetailView.vue)
- 템플릿에는 날짜 라이브러리 자체가 없고, 시간대 변환/상대시간 같은 요구사항도 없음.

### 2-3. `pinia-plugin-persistedstate` — Pinia 상태 영속화 플러그인

- `package.json`에 직접 의존성으로 추가 (`^4.7.1`)
- 전역 등록: [src/main.js](src/main.js)
  ```js
  import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
  ...
  pinia.use(piniaPluginPersistedstate)
  ```
- 스토어별로 선택 적용: [src/stores/configStore.js](src/stores/configStore.js), `favoritesStore.js`, `recentStore.js`에는 `{ persist: true }` 옵션을 켜서 새로고침해도 localStorage에서 상태를 복원하도록 함. 반대로 `weatherStore.js`는 의도적으로 켜지 않음(날씨 데이터가 오래된 값으로 남는 것을 방지).
- 템플릿의 `configStore.js`는 Pinia 순정 상태(`ref`/`computed`/함수)만 다루고, 영속화라는 개념 자체가 없음.

### 2-4. `vite.config.js`의 동적 설정(함수형 config + `loadEnv` + 프록시)

- 템플릿: `defineConfig({...})` — 고정 객체
- 현재 프로젝트: [vite.config.js](vite.config.js) — `defineConfig(({ mode }) => { const env = loadEnv(mode, process.cwd(), ''); ... })`
  - `mode` 인자를 받는 **함수형 설정**으로 전환
  - `loadEnv`로 `VITE_` 접두사 없는 서버 전용 환경변수(`OWM_API_KEY`)를 Node 실행 컨텍스트에서만 읽음
  - `server.proxy` / `preview.proxy`에 `/api/owm` 경로를 OpenWeatherMap으로 중계하는 프록시를 직접 구성 (요청 경로 재작성 + API 키 자동 부착)
- 템플릿에는 프록시라는 개념 자체가 없고, 환경변수를 다루는 코드도 없음.

### 2-5. `api/owm.js` (Vercel 서버리스 함수) + `vercel.json`

- 완전히 새로 추가된 디렉토리/설정 — 템플릿에는 `api/` 폴더도 `vercel.json`도 없음
- [api/owm.js](api/owm.js): 웹 표준 `Request`/`Response`를 사용하는 Vercel Function. 허용된 4개 경로(`ALLOWED_PATHS`)만 중계하는 화이트리스트 방식으로 구현, API 키(`process.env.OWM_API_KEY`)는 서버에서만 붙여서 브라우저에 노출되지 않게 처리
- 배포 시점(Vercel)에는 이 함수가 개발 시점(Vite proxy, 2-4번)과 **동일한 역할**을 서버에서 대신 수행 — 즉 "개발 중엔 프록시, 배포 후엔 서버리스 함수"라는 이중 구조를 스스로 설계함
- 이는 프론트엔드 과제 범위를 넘어 **백엔드/서버리스 배포**개념을 도입한 것으로, 템플릿 커리큘럼에는 전혀 등장하지 않음

### 2-6. `unplugin-vue-components` — Element Plus 온디맨드 등록

- `package.json` 의 devDependencies 에 추가 (`unplugin-vue-components`)
- 등록: [vite.config.js](vite.config.js) 의 `Components({ resolvers: [ElementPlusResolver()] })`
- 하는 일: 템플릿을 훑어 실제로 쓰인 `<el-xxx>` 만 찾아 해당 컴포넌트와 CSS 를 import 문으로 바꿔 넣는다.
- 도입 이유와 실측:

  | 첫 화면에 내려받는 양 | 전 (`app.use(ElementPlus)`) |          후 (온디맨드) |
  | --------------------- | --------------------------: | ---------------------: |
  | JS                    |                 1,087,907 B |              314,999 B |
  | CSS                   |                   373,736 B |               84,290 B |
  | 합계                  |                 1,461,643 B | **399,289 B** (-72.7%) |

- 대안 검토: 컴포넌트를 하나씩 `app.component()` 로 개별 등록하는 방법도 있다. 추가 라이브러리가 필요 없다는 게 장점이지만,
  컴포넌트를 하나 더 쓸 때마다 import 두 줄(JS + CSS)을 같이 넣어야 해서 CSS 를 빠뜨리기 쉽다.
  플러그인 쪽은 템플릿을 근거로 삼으므로 빠뜨릴 여지가 없다.
- 템플릿의 `main.js` 는 `app.use(ElementPlus)` 전체 등록만 다룬다. 번들 크기를 재보거나 줄이는 내용 자체가 없다.

### 2-7. `vitest` — 순수 함수 단위 테스트

- devDependencies 에 추가 (`vitest`). 설정은 [vite.config.js](vite.config.js) 의 `test` 블록 (`environment: 'node'`)
- 테스트 파일: `src/data/lifeIndex.spec.js`, `src/stores/configStore.spec.js`, `src/stores/weatherStore.spec.js` (3 files / 29 tests)
- 대상 선정 기준: **눈으로 봐서는 틀린 것을 알 수 없는 계산**만 고름.
  생활지수 알고리즘(점수가 몇 점 틀려도 그럴듯한 시각이 찍힌다), 미세먼지 등급 경계(30/80 이 한 칸 밀리면 세 화면이 동시에 틀어진다),
  도시 집계(평균 자릿수·정렬 부작용·강수확률 40% 경계).
- 화면 렌더링 테스트(`@vue/test-utils` + jsdom)는 하지 않았다. 지금 검증하려는 것 중 DOM 을 필요로 하는 것이 없어서,
  환경만 무거워지고 얻는 게 없다고 판단했다.
- 템플릿에는 테스트 러너도 테스트 파일도 없다.

---

## 3. 버전 차이

| 패키지       | 템플릿    | 현재 프로젝트 | 성격                                  |
| ------------ | --------- | ------------- | ------------------------------------- |
| axios        | `^1.18.1` | `^1.19.0`     | 마이너 — 설치 시점 차이로 자연 발생   |
| element-plus | `^2.14.2` | `^2.14.4`     | 패치 — 설치 시점 차이로 자연 발생     |
| vue-router   | `^5.0.4`  | `^5.2.0`      | 마이너 — 설치 시점 차이로 자연 발생   |
| **pinia**    | `^3.0.4`  | `^4.0.3`      | **메이저 1단계 — 의도적으로 올린 것** |

pinia 만 성격이 다르므로 따로 적는다.
`^3.0.4` 는 캐럿 범위라 메이저를 넘지 않는다. 즉 `npm install` 시점 차이로 4.x 가 설치될 수는 없고,
이 차이는 설치 과정에서 자연히 생긴 것이 아니라 명시적으로 올린 결과다.
(처음 문서를 쓸 때 이 줄을 다른 셋과 같이 "마이너/패치" 로 묶어뒀는데, 캐럿 범위의 동작과 맞지 않는 서술이라 바로잡았다.)

- 기능상 4.x 가 필요해서 올린 것은 아니다. 이 프로젝트가 쓰는 API 는 전부 3.x 에도 있다
  (`defineStore` + setup 함수, `ref`/`computed`/함수 반환, `{ persist: true }`).
  같이 쓰는 `pinia-plugin-persistedstate@4.7.1` 도 `pinia >=3.0.0` 이면 동작한다(peerDependencies 확인).
- 따라서 3.x 로 맞춰야 한다면 `package.json` 의 버전만 낮추면 되고, 소스는 한 줄도 고칠 필요가 없다.

---

## 4. 요약 표

| 구분               | 기준 템플릿                          | 현재 프로젝트                                      | 비고                                            |
| ------------------ | ------------------------------------ | -------------------------------------------------- | ----------------------------------------------- |
| 상태관리           | Pinia (순정)                         | Pinia + `pinia-plugin-persistedstate`              | 영속화는 스스로 추가                            |
| 유틸 라이브러리    | 없음                                 | `@vueuse/core`                                     | 컴포저블 유틸, 간접의존성을 직접의존성으로 승격 |
| 날짜 처리          | 없음 (직접 Date 다루는 수준)         | `dayjs` + 3개 플러그인 + 한국어 로케일             | 시간대/상대시간 변환까지 구현                   |
| Vite 설정          | 정적 객체                            | `mode` 기반 함수형 + `loadEnv` + 프록시            | 환경변수/프록시 개념 추가                       |
| 배포 인프라        | 없음                                 | Vercel 서버리스 함수(`api/owm.js`) + `vercel.json` | 백엔드성 개념 도입                              |
| UI 라이브러리 등록 | `app.use(ElementPlus)` 전체          | `unplugin-vue-components` 온디맨드                 | 첫 화면 1,461KB → 399KB                         |
| 테스트             | 없음                                 | `vitest` 3 files / 29 tests                        | 순수 함수 단위 검증                             |
| 컴포저블           | 없음                                 | `src/composables/` 3개 직접 작성                   | 소비만이 아니라 작성까지                        |
| 코어 프레임워크    | Vue3 / Router / Element Plus / Axios | 동일 (버전만 상향)                                 | 변화 없음                                       |

**결론**: 코어 프레임워크(Vue / Router / Pinia / Element Plus / Axios) 사용법 자체는 기준 템플릿 범위를 벗어나지 않는다.
그 위에 7가지 기술을 추가로 도입했으며(`@vueuse/core`, `dayjs`, `pinia-plugin-persistedstate`, Vite 동적 프록시 설정,
Vercel 서버리스 함수, `unplugin-vue-components`, `vitest`), 각각의 도입 근거와 대안 검토 내역은 위에 적은 대로다.
공통점은 하나다 — 전부 과제를 진행하다 실제로 막힌 지점에서 출발했다.
키가 번들에 박히는 것을 보고 프록시와 서버리스 함수를 찾았고, 번들이 1.4MB 인 것을 재고 나서 온디맨드로 바꿨다.
