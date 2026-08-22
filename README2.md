# 과제 6 계획서 (Weather Axios)

이 문서만 읽고 과제 6 작업에 바로 착수할 수 있도록 정리한 것. 과제 1~5 의 진행 기록은 README.md 에 있음.

---

## 0. 지금 상태

- 위치: `/Users/k/수업자료/Java Script/TASK/skala-vue-task`
- 실행: `npm install` 후 `npm run dev`
- 원격: github.com/ta6197-sys/skala_front (private), 브랜치 main
- 과제 5(Pinia)까지 완료. 데이터는 **전부 목업**이고 네트워크 요청이 한 건도 없음.
- **이미 손대둔 것**: axios(1.19)와 element-plus(2.14) 설치 완료. main.js 에서 `app.use(ElementPlus)` 로 전역 등록했고 `element-plus/dist/index.css` 도 불러오는 중. Element Plus 캐러셀 예제(`/carousel`, CarouselDemoView.vue)를 만들어 둠 (nav 링크는 없고 주소로만 접근).
- 강사님 참고 프로젝트(`practice/skala-vue-reference`)도 현재 활성 파일은 목업 상태이며, `.afterAxios` 파일이 과제 6 의 정답지로 따로 들어있음.

### 현재 폴더 구조 (과제 4~5 산출물)

```
src/
├── main.js                       # createPinia() + router 주입
├── App.vue                       # nav + RouterView 껍데기, UnitToggler 배치
├── router/index.js               # 10개 라우트, 홈만 정적 import 나머지 Lazy
├── data/
│   ├── weatherData.js            # 목업 도시 6개 (과제 6 에서 cities.js 로 정리 예정)
│   ├── lifeIndex.js              # 빨래/세차/외출 지수 계산 (순수 함수)
│   └── troubleshooting.js        # 트러블슈팅 기록 데이터
├── stores/
│   ├── configStore.js            # 단위 + 내 기준(임계값, 체질)
│   ├── favoritesStore.js         # 즐겨찾기 id 목록
│   └── recentStore.js            # 최근 본 도시 최대 5개
├── components/exercise/
│   ├── BaseDashboardCard.vue     # slot 껍데기
│   ├── SearchBar.vue             # props + emit
│   ├── WeatherCard.vue           # 스토어 직접 참조 (단위/즐겨찾기)
│   ├── UnitToggler.vue
│   ├── LifeIndexBar.vue          # 지수 한 줄, 3회 재사용
│   ├── OutfitSuggestion.vue      # 체감온도 5단계 + 체질 보정
│   └── weather3/                 # 과제 3 제출물 (손대지 말 것)
└── views/
    ├── WeatherHomeView.vue       # /
    ├── WeatherDetailView.vue     # /weather/:cityId
    ├── WeatherStatsView.vue      # /stats
    ├── FavoritesView.vue         # /favorites
    ├── SettingsView.vue          # /settings
    ├── WeatherAboutView.vue      # /about
    ├── TroubleshootingView.vue   # /troubleshooting
    ├── CarouselDemoView.vue      # /carousel (Element Plus 예제 확인용)
    ├── NotFoundView.vue          # catch-all
    └── LegacyTaskView.vue        # /legacy (과제 1~3 보존)
```

---

## 1. 과제 요구사항 (슬라이드 원문)

### Axios 활용 준비
1. Axios 라이브러리 설치
2. OpenWeatherMap API 가입 및 Key 발급

### 과제 요구사항
1. OpenWeatherMap API를 통해 실제 날씨 데이터를 가져와 적용한다.
2. OpenWeatherMap에서 제공되는 API를 추가하여 Application 기능을 확장한다.
3. 기타 외부 API를 추가하여 Application 기능을 확장한다.

---

## 2. 확정된 결정사항

- **백엔드는 띄우지 않는다.** 브라우저가 API 를 직접 호출해서 바로 화면에 뿌린다. 프록시도 서버리스도 없음.
- **도시 자유 검색(지오코딩으로 아무 도시나 추가)은 하지 않는다.** 도시 6개 고정 유지.
- **피니아는 필요한 곳에만.** 판단 기준은 아래 두 질문 중 하나라도 예일 때만 스토어로 올린다.
  1. 두 개 이상의 화면이 같은 데이터를 필요로 하는가
  2. 화면을 떠났다 돌아와도 값이 살아 있어야 하는가
  → 나머지는 컴포넌트 안에서 받아서 바로 쓴다.
- **새로 만드는 스토어는 weatherStore 하나뿐.**
- **Element Plus 는 부분 사용.** 직접 만들기 번거로운 것만 골라 쓰고 전체 레이아웃은 지금 CSS 유지.
- 이모티콘은 코드에 넣지 않는다 (전체 제거 완료 상태).

---

## 3. 쓸 API 5개

| API | 엔드포인트 | 무엇을 채우나 | 요구사항 |
|---|---|---|---|
| 현재 날씨 | `/data/2.5/weather` | 기온·체감·습도·풍속·날씨상태 | 1번 |
| 대기오염 | `/data/2.5/air_pollution` | PM10 (미세먼지) | 2번 |
| 5일/3시간 예보 | `/data/2.5/forecast` | 강수확률 + 시간별 예보 | 2번 |
| 역지오코딩 | `/geo/1.0/reverse` | 좌표 → 한글 지명 (내 위치용) | 2번 |
| Open-Meteo | `https://api.open-meteo.com/v1/forecast` | 자외선 지수 | **3번** |

- OpenWeatherMap 베이스: `https://api.openweathermap.org`
- 공통 파라미터: `appid`, `units=metric`, `lang=kr` (지오코딩·대기오염은 units/lang 불필요)
- **자외선은 OpenWeatherMap 무료 플랜에 없다.** One Call 3.0 은 카드 등록이 필요해서 제외했고, 대신 키가 필요 없는 Open-Meteo 로 받는다. 이게 요구사항 3번을 채운다.
- **One Call 3.0 은 쓰지 말 것** (결제수단 등록 필요).
- 무료 플랜 제한: **분당 60회 / 월 100만회**.

### 응답에서 꺼내 쓸 필드

- 현재 날씨: `main.temp`, `main.feels_like`, `main.humidity`, `wind.speed`, `weather[0].description`
- 대기오염: `list[0].components.pm10`
- 예보: `list[]` 이 3시간 간격 40개(5일). 각 항목의 `dt`(UNIX 초), `main.temp`, `pop`(강수확률, **0~1 소수라 ×100 필요**), `main.humidity`, `wind.speed`
- 역지오코딩: `[0].local_names.ko` (없으면 `[0].name`)
- Open-Meteo: `daily.uv_index_max` 또는 `current.uv_index`

---

## 4. 목업 필드 → 실제 데이터 매핑

과제 6 의 핵심은 새 기능 추가가 아니라 **이미 만든 기능의 바닥을 실제 관측값으로 갈아끼우는 것**이다.

| 지금 목업 필드 | 실제 출처 | 어느 API |
|---|---|---|
| `temp` `feelsLike` `humidity` | `main.temp` / `main.feels_like` / `main.humidity` | 현재 날씨 |
| `wind` | `wind.speed` | 현재 날씨 |
| `status` | `weather[0].description` | 현재 날씨 |
| `dust` | `components.pm10` | 대기오염 |
| `rainProb` | `list[].pop × 100` | 예보 |

**중요**: 설정 화면의 미세먼지 기본 경계값 30/80 은 **한국 환경부 PM10 등급 기준과 일치**한다 (30 이하 좋음, 80 이하 보통, 초과 나쁨). 지금까지는 근거 없는 숫자였는데 실제 PM10 을 받는 순간 출처가 생긴다. README 에 적을 것.

---

## 5. 구조 계획

### 4층 구조

```
화면(views/components) → weatherStore → api 함수 → axios 인스턴스 → 서버
```

- **화면**: 그리기만. URL 도 키도 모름.
- **weatherStore**: 도시별 현재 날씨/미세먼지 보관, 로딩·에러 상태 관리.
- **api 함수**: 어떤 주소로 무엇을 물어볼지. `getCurrentWeather(city)` 같은 이름으로 감싼다.
- **axios 인스턴스**: baseURL, 공통 파라미터(appid/units/lang), timeout, 인터셉터.

나중에 백엔드가 생기면 api 파일의 주소만 바꾸면 되도록 만들어 둔다.

### 새로 만들 파일

- `src/data/cities.js` — 도시 6개의 id / 한글이름 / 위경도만. **안 변하는 건 박아두고 변하는 것만 통신한다.**
- `src/api/client.js` — axios 인스턴스 (OpenWeatherMap 용). Open-Meteo 는 별도 인스턴스 또는 직접 호출.
- `src/api/weather.js` — API 함수 5개.
- `src/stores/weatherStore.js` — cities 별 날씨 맵, isLoading, error, lastFetched, fetchAll / refresh.

### 도시 좌표 (cities.js 에 넣을 값)

| id | 이름 | lat | lon |
|---|---|---|---|
| city_01 | 서울 | 37.5665 | 126.9780 |
| city_02 | 수원 | 37.2636 | 127.0286 |
| city_03 | 부산 | 35.1796 | 129.0756 |
| city_04 | 제주 | 33.4996 | 126.5312 |
| city_05 | 강릉 | 37.7519 | 128.8761 |
| city_06 | 대구 | 35.8714 | 128.6014 |

기존 `weatherData.js` 는 지우지 말고 남긴다. API 실패 시 폴백 데이터로 쓴다.

### 상태를 어디에 둘지

| 데이터 | 어디에 | 이유 |
|---|---|---|
| 단위·내 기준·체질 | configStore (기존) | 전 화면이 같은 기준을 봐야 함 |
| 즐겨찾기 | favoritesStore (기존) | 대시보드·상세·즐겨찾기 화면이 공유 |
| 최근 본 도시 | recentStore (기존) | 기록하는 화면과 보여주는 화면이 다름 |
| 도시 목록 + 현재 날씨 | **weatherStore (신설)** | 대시보드·통계·즐겨찾기가 같은 목록을 씀 |
| 시간별 예보 | 상세 페이지 안에 | 그 화면만 씀 |
| 자외선 지수 | 상세 페이지 안에 | 그 화면만 씀 |
| 내 위치 좌표 | 대시보드 안에 | 그 화면만 씀 |
| 검색어·선택된 카드 | 대시보드 안에 (지금 그대로) | 화면 벗어나면 의미 없음 |

**favoritesStore 와 recentStore 가 지금 weatherData 를 직접 import 하고 있다.** 이 참조를 cities.js(도시 정보) + weatherStore(날씨)로 나누는 것이 이번 리팩터링의 유일한 까다로운 지점.

---

## 6. 쓸 라이브러리 5개

전부 설정만 하면 되는 것들이라 새로 익힐 문법이 없다. 난이도는 도구가 아니라 기능 쪽에서 올린다.

| 라이브러리 | 용도 | 붙는 자리 |
|---|---|---|
| **axios** | API 통신 | 과제 필수. **설치 완료** |
| **day.js** | UNIX 타임스탬프 → "오늘 오후 3시", 도시별 UTC 오프셋 처리 | 시간대별 최적 추천에 사실상 필수 |
| **VueUse** | `useGeolocation`(내 위치), `useIntervalFn`(자동 갱신, 언마운트 시 자동 정리), `useOnline`(오프라인 감지) | 내 위치 + 폴백 |
| **pinia-plugin-persistedstate** | 스토어 localStorage 자동 저장 | configStore / favoritesStore / recentStore. **weatherStore 는 저장하지 말 것** (어제 날씨를 오늘 보여주게 됨) |
| **element-plus** | `el-skeleton`(로딩), `el-alert`(에러), `el-slider`(설정 임계값), `el-empty`(빈 상태)만 부분 사용 | 직접 만들기 번거로운 것만. **설치·전역등록 완료** |

### 조건부

- **axios-cache-interceptor** — 호출 제한 대응. 일단 없이 시작하고 개발 중 429 를 만나면 그때 붙인다. 그러면 왜 필요했는지가 트러블슈팅 기록으로 남는다.
- **axios-retry** — 5xx·네트워크 오류만 지수 백오프 재시도. 설정 3줄. 발표 중 통신 불안 대비.

### 쓰지 않기로 한 것과 이유

- **Vue Query**: 서버 상태를 가져가면서 방금 배운 Pinia 역할이 사라짐. 배운 걸 우회한 걸로 보임.
- **Zod**: 값은 확실하나 API 5개 스키마를 다 정의하기엔 부담.
- **MSW**: 서비스워커 셋업이 과제 규모 대비 무거움.
- **Chart.js / ECharts**: 시간별 예보 막대는 통계 화면 랭킹 막대와 같은 방식으로 순수 CSS 면 충분. 이미 만들어봤고 잘 됨.
- **Fuse.js**: 자유 검색을 안 하기로 해서 쓸 자리 없음.
- **Vitest**: 넣으면 확실한 차별점이지만 시간대별 추천 구현과 병행하면 과부하. 과제 6 끝내고 여유 있으면 그때.

---

## 7. 차별점 (교수님 파일보다 더 나아가는 지점)

강사님 참고 파일은 **현재 날씨 API 하나로 3개 도시를 Promise.all 로 받아 목업 자리에 끼워넣는** 수준까지만 있다. 요구사항 2·3 은 비어 있음.

### A. 시간대별 최적 생활지수 (메인)

지금 생활지수는 "지금 빨래하기 좋은가"만 답한다. 예보 API 가 붙으면 **"오늘 중 언제가 제일 좋은가"** 를 답할 수 있다.

- 예보 40개 시점 중 오늘 남은 구간만 잘라냄
- 각 시점마다 빨래/세차/외출 점수를 계산 (기존 `data/lifeIndex.js` 재사용)
- 최고점 시각을 찾아 "빨래는 오늘 오후 3시가 최적(82점)" 형태로 표시
- UNIX 타임스탬프를 해당 도시 타임존으로 변환해야 함 (day.js)

**예보 데이터가 없으면 원리적으로 불가능한 기능**이라 "API 를 추가해 기능을 확장했다"에 가장 정확히 맞고, 과제 5 산출물을 재료로 쓴다.

### B. 내 위치 날씨

브라우저 위치 권한 → 좌표 → 역지오코딩으로 한글 지명 → 그 좌표의 날씨. 권한 거부 시 폴백(기본 서울).

### C. 받침 기능

- API 실패 시 기존 `weatherData.js` 목업으로 내려앉고 "오프라인 데이터" 배지 표시. 발표 당일 통신 불안에 대한 보험이기도 함.
- 갱신 시각 표시("3분 전 기준") + 수동 새로고침 버튼.

---

## 8. 작업 순서

1. **OpenWeatherMap 가입 + 키 발급** — 활성화까지 10분~2시간. 가장 먼저.
2. `.env` / `.env.example` / `.gitignore` 정리. 키는 `VITE_` 접두사 필요 (예: `VITE_OWM_API_KEY`).
3. `npm install dayjs @vueuse/core pinia-plugin-persistedstate` (axios·element-plus 는 이미 설치됨)
4. `src/data/cities.js` 정리 (기존 weatherData.js 는 폴백용으로 남김)
5. `src/api/client.js` + `src/api/weather.js` — axios 인스턴스와 API 함수
6. `src/stores/weatherStore.js` 신설, 화면들을 목업 대신 스토어를 읽도록 전환
7. 대기오염 API 연결 → `dust` 를 실제 PM10 으로 대체
8. 예보 API 연결 → 강수확률 + **시간대별 최적 추천** (차별점 A)
9. Open-Meteo 자외선 지수 (요구사항 3번)
10. 내 위치 날씨 (차별점 B)
11. 로딩/에러/폴백 처리 + Element Plus 부분 적용 + persistedstate 적용
12. README.md 에 과제 6 섹션 추가, 트러블슈팅 항목 추가, 커밋·푸시

2~6 은 **키가 없어도 진행 가능**하다. 키 발급을 기다리는 동안 구조 작업을 먼저 해도 됨.

---

## 9. 주의사항 / 이미 아는 함정

### API 키

- 강사님 참고 파일에는 키가 소스에 그대로 박혀 있다. **따라 하지 말 것.** 그 키는 강사님 개인 키를 수강생 전체가 공유하는 상태이고, 슬라이드 요구사항도 본인 발급이다.
- `.env` 는 `.gitignore` 에 넣고 `.env.example` 만 커밋한다. 다른 PC 에서 클론하면 example 을 복사해 자기 키를 넣도록.
- **한계를 알고 쓸 것**: Vite 환경변수는 빌드 결과물에 그대로 들어가서 브라우저 개발자도구에서 보인다. `.env` 로 빼는 건 "브라우저에서 숨기는 것"이 아니라 **"저장소에 남기지 않는 것"**이다. 프론트 단독 앱에서 키를 완전히 숨기는 방법은 없고 진짜 해결책은 백엔드다. 이 한계를 README 에 한 줄 적어둘 것.

### 호출 수

- 대시보드 진입: 도시 6개 × (현재날씨 + 대기오염) = **12회**
- 상세 진입: 예보 1 + 자외선 1 = **2회**
- 분당 60회 제한이라 화면을 오가며 테스트하면 금방 참. weatherStore 캐싱이 1차 방어선.

### 과제 4~5 에서 이미 겪은 함정 (반복 주의)

- `defineProps()` 는 반환값을 `const props =` 로 받아야 script 영역에서 쓸 수 있다.
- 온도 변환은 `temp` 뿐 아니라 `feelsLike` 도 해야 하고, 두 값의 차이도 변환값끼리 빼야 한다.
- 그래프 막대 비율은 **원본 섭씨로** 계산한다. 화씨는 0 이 기준점이 아니라 비율이 압축된다.
- 판정(더움/미세먼지 등급)은 항상 원본 섭씨/원본 수치 기준. 단위 표시만 바꾼다.
- 같은 라우트끼리 이동하면 `onMounted` 가 다시 안 돈다. `watch(() => route.params...)` 필요. **상세 페이지에 API 호출을 넣을 때 이게 다시 문제가 된다.**
- 자세한 내용은 `/troubleshooting` 화면 또는 `src/data/troubleshooting.js` 참고.

### Element Plus 전역 등록

- 현재 `app.use(ElementPlus)` 로 **전체 컴포넌트를 통째로** 등록한 상태다. 그래서 메인 번들이 937KB(gzip 302KB)까지 커졌고 빌드 때 chunk size 경고가 뜬다. 실제로 쓰는 건 몇 개뿐인데 안 쓰는 것까지 전부 들어간 것.
- 동작에는 문제가 없어서 그대로 둬도 되지만, 번들 크기를 줄이려면 필요한 컴포넌트만 개별 import 하는 방식(on-demand)으로 바꾸면 된다. 과제 6 을 마치고 여유가 있을 때 정리해도 되는 항목.
- `element-plus/dist/index.css` 가 전역으로 들어와 있는데, 확인 결과 기존 화면 디자인에는 영향이 없었다. 다만 Element Plus 컴포넌트를 추가로 붙일 때 기존 CSS 와 톤이 어긋나는지 그때그때 확인할 것.

### API 응답 다룰 때

- 예보의 `pop` 은 0~1 소수. ×100 해야 퍼센트.
- 현재 날씨의 `name` 은 영문("Seoul"). `lang=kr` 은 `description` 에만 적용된다. 한글 지명은 역지오코딩의 `local_names.ko` 를 써야 함.
- 응답 필드가 없을 수 있다. `main.feels_like` 가 undefined 면 화면에 조용히 `NaN℃` 가 뜬다. 옵셔널 체이닝과 기본값으로 방어할 것.

---

## 10. 완료 후

- `README.md` 에 "# 과제 6" 섹션을 기존 형식(요구사항 원문을 `###` 로 인용, 판단 근거를 `-` 불릿으로, `~함`/`~됨` 종결)에 맞춰 추가.
- 새로 겪은 문제는 `src/data/troubleshooting.js` 에 항목 추가.
- 커밋 후 push. 커밋 작성자는 이 저장소 로컬 설정(noreply 주소)을 따르므로 그대로 두면 됨.
