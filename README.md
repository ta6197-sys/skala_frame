# 전체적인 구조
- 가능한 원래 있는 폴더를 활용해서 코드를 만들기 위해 노력.
- 가능하다면 원래 가지고 있던 파일을 복사해서 활용함.


## 1. 배열 렌더링
### 임의의 날씨 데이터 배열을 활용해 화면에 날씨 카드를 반복 출력한다.
- :key를 index가 아닌 city.id로 바인딩.
- index를 사용하면 배열 중간이 삭제나 정렬될 때 Vue가 DOM을 잘못 재사용할 수 있음
- Sample

## 2. 조건부 렌더링 (v-if)
### 기온이 25도 이상인 도시는 "더움 (25도 이상badge-cool)", 25도 미만인 도시는 "선선함 (25도 미만)" 라벨을 붙인다. (조건은 다르게 해도 된다)
- 조건은 동일하게 진행함.
- v-if,v-else로 라벨을 나누고, 색 구분은 배열 형식 :class 바인딩으로 처리
- .badge는 공통 모양, .badge-hot,.badge-cool이 색만 덮어씀

## 3. 양방향 바인딩 및 한글 처리
### 도시 이름을 한글로 검색하는 input을 만든 후 한글 입력 후 입력한 도시명을 출력한다.
- 처음엔 v-model로 코드를 짰는데 한글 입력 시 화면 반영이 밀림
- v-model은 compositionstart~compositionend 사이의 input 이벤트를 의도적으로 무시하기 때문에 글자가 완성되어야 나타남.
- v-model이 내부적으로 하던 일(:value로 내려주고 @input으로 되돌려 받기)을 직접 풀어 쓰면 조합 가드를 타지 않아 조합 중인 글자까지 실시간 반영됨. (Vue 런타임 소스)
- 요구사항이 필터링이 아닌 입력한 도시를 출력하는 것이기 때문에 입력값을 그대로 출력

## 4. 이벤트 및 수식어
### 지역별 날씨 현황 카드를 누르면 상태바에 "{도시}이 선택되었습니다." 표기
### 지역별 날씨 현황 카드 내부의 [상세보기] 버튼을 누르면 버블링 없이 해당 도시의 날씨 내용을 window.alert로 띄운다.
- 카드와 버튼 즉 부모와 자식이 의도적으로 겹처있도록.
- .stop이 없으면 버튼을 눌렀을 때 alert가 뜨고 이어서 부모의 클릭까지 실행되어 상태바 변경
- 버블링 차단 예제를 적용
- 카드 전체에 @click을 걸어 내부 어디를 눌러도 버블링으로 선택, 내부 [상세보기] 버튼에만 @click.stop을 적용해 버블링 차단.
- 버튼 클릭 시 alert만 실행, 카드 선택 상태는 변하지 않음

## 5. 나만의 추가
- 습도를 추가. 각 지역마다의 습도를 게이지바 형태로 표현.
- 추가적으로 체감온도, 풍속, 강수확률을 추가하여 더 많은 정보를 담으려고 하였음.
- 미세먼지 농도를 좋음, 보톤, 나쁨 세가지로 분류하여 화면에 나오도록 진행함
- 즐겨찾기 기능 추가. 다중 checkbox + :disabled 조합. 체크박스에도 .stop을 걸어 즐겨찾기 등록이 카드 선택과 섞이지 않게 진행
- 상세 패널 토글. openCity에 id 하나만 담아 한 번에 한 카드만 연리도록, 같은 버튼을 누르면 다시 닫힘. 기존 [상세보기] alert 버튼은 그대로

# 과제 2
- 1일차 때 쓰던 weatherData, practice.css/weather.css를 그대로 재사용함.
- 1일차와 똑같이 통합 완성본(WeatherComposition) 하나 + 요구사항별 개별 파일 5개, 이렇게 두 가지 형태로 구성.
- 개별 파일은 서로 상태를 공유하지 않고 각자 필요한 ref/computed를 자기 파일 안에서 다시 선언함 (한 파일만 열어봐도 그 요구사항이 뭘 하는지 바로 파악되게 하려고).

## 1. 반응형 상태 관리
### 검색어(searchQuery), 선택된 도시(selectedCityInfo), 지역별 날씨 데이터 배열(weatherList)을 반응형 상태로 정의한다. (1일차 동일)
- 1일차 때 쓰던 searchText/selectedCity를 그대로 안 쓰고 searchQuery/selectedCityInfo로 이름을 바꿈.
- selectedCity는 도시 이름 문자열만 담았는데, watch 콜백에서 newVal?.name처럼 객체 프로퍼티에 접근해야 해서 selectedCityInfo에는 도시 객체 전체를 저장하도록 변경함.

## 2. 검색 도시 (computed 활용)
### 전체 날씨 리스트 중에서 사용자가 입력한 검색어가 도시 이름에 포함된 항목만 필터링하여 computed 배열(filteredWeatherList)에 담아 놓는다.
- weatherList.value.filter(city => city.name.includes(searchQuery.value)) 형태로 구현.
- 검색어가 빈 문자열일 때는 includes('')가 항상 true라서, 별도 분기 없이도 filteredWeatherList가 자동으로 원본 전체와 같아짐. 이 성질을 요구사항 4(검색 결과 표시)에서 그대로 활용함.

## 3. 반응형 변수 변화 감시 (watch, watchEffect)
### selectedCityInfo 감시(watch 이용): 상태바 문구가 바뀔때 마다 콘솔로그를 작성.
### searchQuery 감시(watchEffect 이용): 도시 검색어를 타이핑할 때 마다 변하는 searchQuery를 추적하여 콘솔로그로 작성.
- watch는 감시 대상(selectedCityInfo)을 명시적으로 지정해야 하고, 콜백에서 newVal/oldVal 둘 다 받을 수 있어서 "값이 바뀌기 전/후"를 비교하는 이번 요구사항에 맞음.
- watchEffect는 감시 대상을 따로 안 적어도 콜백 내부에서 참조한 반응형 값(searchQuery.value)을 알아서 추적해서, 타이핑마다 자동으로 다시 실행됨. 대신 이전 값은 못 받음.
- 콘솔 로그 문구를 watch는 "[watch 감지]", watchEffect는 "[watchEffect 자동 호출]"로 구분해서 어떤 방식으로 실행됐는지 로그만 보고도 알 수 있게 함.

## 4. 검색 결과 표시 (Template 영역)
### 검색어가 비었을 때는 원본 데이터를 출력, 검색어와 일치하는 데이터가 있을 때는 해당 데이터를 출력, 일치하는 도시가 없으면 안내 문구를 출력한다.
- v-if/v-else-if/v-else로 카드 마크업을 두 번 나눠 쓰는 대신, v-for를 filteredWeatherList 하나로만 돌리고 필터링 결과가 0개일 때만 안내 문구를 추가로 띄우는 방식으로 단순화함 (요구사항 2에서 설명한 computed 성질 덕분에 가능).

## 5. 나만의 추가
- 즐겨찾기 개수(favoriteCount)를 computed로 뽑아내고, 그 값이 바뀔 때마다 watch로 콘솔에 몇 개에서 몇 개로 바뀌었는지 로그를 남기도록 추가함.
 
# 과제 3
- 1~2일차 때 쓰던 weatherData, practice.css/weather.css를 그대로 재사용함.
- 과제 2의 통합 완성본(WeatherComposition)을 기준으로, 기능은 하나도 바꾸지 않고 파일만 쪼개는 것이 목표.
- 과제 1·2 파일은 그대로 두고 components/exercise/weather3/ 폴더를 새로 만들어 과제 3 파일만 모아둠 (분리 전/후를 나란히 비교할 수 있게).
- 상태(ref/computed/watch)는 전부 WeatherParent 한 곳에만 두고, 나머지 자식은 props로 받아 그리기만 하는 구조로 통일함.

## 1. WeatherParent.vue
### 모든 반응형 데이터 유지
- WeatherComposition에 있던 weatherList, searchQuery, selectedCityInfo, favorites, openCity와 computed/watch/watchEffect를 그대로 옮김. 변수명도 안 바꿈.
- 자식이 emit한 값을 받아서 상태를 고치는 핸들러(handleUpdateQuery, handleSelectCard, handleToggleFavorite, handleToggleDetail)만 새로 추가함.
- 데이터를 부모에 몰아두면 어떤 카드가 열려 있는지(openCity), 어떤 도시가 즐겨찾기인지(favorites)를 한 곳에서 판단할 수 있어서 카드끼리 상태가 어긋나지 않음.

## 2. BaseDashboardCard.vue
### 검색박스와 리스트박스의 디자인을 공통화. <slot> 배치하여 부모 컴포넌트가 도시 검색, 날씨 현황 주입
- 스크립트 영역을 아예 비워두고 껍데기(테두리/배경/제목 위치)만 담당하게 함.
- 제목은 named slot(title), 내용은 default slot으로 나눔. 검색박스와 리스트박스가 "제목 + 내용" 구조로 똑같아서 basic3에서 배운 Named Slot 형태가 그대로 맞아떨어짐.
- 두 slot 모두 기본값을 넣어둬서 부모가 아무것도 주입하지 않아도 화면이 비어 보이지 않게 함.
- 검색박스 / 즐겨찾기 / 리스트박스 세 군데에 같은 컴포넌트를 재사용함.

## 3. SearchBar.vue
### 부모로부터 검색도시 반응형 데이터를 전달받아 표시 (props) / 도시 검색 시 update-query 이벤트를 발생하면서 검색어를 부모에게 전달 (emits)
- props로 받은 searchQuery는 자식이 직접 못 고치므로(단방향), 과제 1에서 쓰던 :value + @input 방식이 오히려 그대로 맞음. :value로 받아 표시하고 @input에서 emit('update-query', e.target.value)로 되돌려 보냄.
- 즉 v-model이 내부적으로 하던 일을 부모-자식 사이에서 다시 한 번 손으로 푼 셈이고, 한글 조합 중인 글자까지 실시간 반영되는 성질도 과제 1과 똑같이 유지됨.

## 4. WeatherCard.vue
### 선택된 도시 객체를 전달 받아 표시 (props) / 카드를 선택하는 것(select-card 이벤트)과 상세보기(click-detail 이벤트)를 부모에게 전달 (emits)
- city 객체 하나를 props로 받아 카드 한 장만 그리도록 함. v-for는 부모가 돌리고 :key="city.id"도 부모 쪽에 남김.
- 카드 전체 @click은 select-card를, [상세보기] 버튼은 @click.stop으로 click-detail을 emit함. 실제 window.alert는 부모가 띄우기 때문에 자식은 "눌렸다"는 사실만 알리는 역할.
- .stop을 자식 안쪽에 그대로 둔 이유는, 버블링은 부모/자식 컴포넌트 문제가 아니라 DOM 문제라서 카드 안에서 막아야 emit 자체가 두 번 일어나지 않기 때문.
- 즐겨찾기 체크박스는 아직 defineModel을 안 배웠고 props도 자식이 못 고치므로, :checked로 상태를 받고 @change로 toggle-favorite을 emit하는 형태로 바꿈. 배열에 넣고 빼는 판단은 부모가 함.
- 상세 패널도 같은 이유로 openCity 대신 isOpen(Boolean)을 받고, 버튼을 누르면 toggle-detail만 emit함.

## 5. <style scoped> 분리
### 각 컴포넌트로 분리하면서 Component에 해당되는 디자인은 <style scoped>로 각각 분리
- weather.css에 몰려 있던 CSS를 잘라서 각 컴포넌트로 옮김. 카드 스타일은 WeatherCard, 뱃지는 WeatherBadge, 게이지는 HumidityGauge, 상태바는 StatusBar가 자기 것만 갖게 함.
- weather.css는 과제 1·2가 계속 쓰고 있어서 지우지 않고 그대로 둠. 클래스 이름이 겹치지만 scoped는 [data-v-xxx] 속성 선택자가 붙어 우선순위가 더 높고, 값도 동일해서 화면은 그대로임.
- 다만 즐겨찾기 바는 BaseDashboardCard 안으로 들어가면서 테두리가 이중으로 보여서, 전역 .favorite-bar를 상속받지 않도록 .favorite-row로 이름을 바꿈.

## 6. Slot과 스코프 확인
### Slot으로 전달되는 자식 컴포넌트는 시각적으로 BaseDashboardCard 내부에 있지만, 스크립트적으로는 부모 컴포넌트의 스코프에서 컴파일된다
- 그래서 SearchBar와 WeatherCard를 BaseDashboardCard 안에 넣었는데도 :search-query, @update-query 같은 바인딩을 WeatherParent가 직접 걸 수 있었음.
- 만약 이 성질이 없었다면 BaseDashboardCard가 props를 한 번 받아서 다시 자식에게 넘기는 릴레이 코드를 써야 했을 텐데, 껍데기 컴포넌트가 데이터를 전혀 몰라도 되게 만들 수 있었음.
- 같은 이유로 slot 안에 넣은 즐겨찾기 바는 BaseDashboardCard가 아니라 WeatherParent의 <style scoped>가 적용됨.

## 7. 나만의 추가
- StatusBar.vue : 하단 상태바를 분리함. 선택된 도시 객체만 props로 받아 문구를 출력하는, props만 쓰는 가장 단순한 형태.
- WeatherBadge.vue : 기온 뱃지와 미세먼지 뱃지가 모양이 완전히 같아서 하나로 합침. type과 text를 props로 받고 :class="['badge', 'badge-' + type]"로 색만 바꿈. 카드 한 장에서 두 번 재사용됨.
- HumidityGauge.vue : 습도 게이지 바만 떼어냄. humidity 숫자 하나만 받아 :style로 width를 계산하므로 카드 코드가 훨씬 짧아짐.
- 이 세 개는 전부 emit이 없는 표시 전용 컴포넌트라서, "이벤트가 필요한 컴포넌트(SearchBar, WeatherCard)"와 역할이 확실히 나뉨.

# 과제 4
- 1~3일차 때 쓰던 weatherData, practice.css/weather.css를 그대로 재사용함.
- 과제 3의 WeatherParent를 기준으로, 기능은 그대로 두고 "한 화면에 다 있던 것"을 주소별 페이지로 쪼개는 것이 목표.
- 과제 1·2·3 파일은 그대로 두고 router/, views/ 폴더를 새로 만들고 부품은 components/exercise/ 바로 아래에 복사해서 씀 (weather3/는 과제 3 제출물이라 손대지 않음).
- App.vue가 라우터 껍데기로 바뀌면서 과제 1~3 화면이 사라지기 때문에, 기존 App.vue 내용을 LegacyTaskView로 옮겨 /legacy 경로에서 계속 볼 수 있게 함.

## 1. Vue Router 설정
### 라우터 지연 로딩 적용, Catch-all Route 적용
- 홈(/)만 import WeatherHomeView로 정적 import하고, 나머지는 전부 component: () => import('@/views/...') 형태로 지연 로딩함.
- 홈은 앱을 켜자마자 무조건 필요해서 청크를 쪼개봤자 요청만 한 번 더 생김. 나머지는 사용자가 그 주소로 들어갈 때 처음 내려받으면 됨.
- npm run build로 확인해보니 WeatherDetailView, WeatherStatsView, WeatherAboutView, NotFoundView, LegacyTaskView가 각각 별도 js/css 청크로 떨어짐. 지연 로딩이 실제로 걸렸는지는 이렇게 빌드 결과로 확인하는 게 제일 확실함.
- Catch-all은 path: '/:pathMatch(.*)*'로 잡고 routes 배열 맨 마지막에 둠. 라우터는 배열을 위에서부터 훑기 때문에 이걸 위로 올리면 /about이든 /stats든 전부 이 규칙이 먼저 먹어서 404만 나옴.
- pathMatch는 파라미터 이름이고 (.*)* 부분이 "슬래시 포함 아무 문자열이나"라는 뜻. /a/b/c처럼 여러 단계로 들어와도 하나로 흡수됨.
- history는 createWebHistory(import.meta.env.BASE_URL)로 씀. 해시(#) 없는 주소가 나오는 대신 서버가 모든 경로를 index.html로 돌려줘야 하는데, vite dev 서버는 기본으로 그렇게 동작해서 /weather/city_06에서 새로고침해도 잘 뜸.

## 2. App.vue
### Navigation Bar 추가 (RouterLink) 및 메인 콘텐츠 영역 배치(RouterView)
- App.vue에서 컴포넌트 import를 전부 걷어내고 script 영역을 비움. 이제 App.vue는 화면을 그리지 않고 nav와 RouterView 자리만 잡는 껍데기임.
- 메뉴는 a 태그가 아니라 RouterLink로 만듦. a 태그를 쓰면 브라우저가 페이지를 통째로 다시 받아와서 SPA가 아니게 되고, RouterLink는 클릭을 가로채서 주소만 바꿔줌.
- RouterView가 "수문장" 역할이라 현재 주소에 매칭된 view가 이 자리에 끼워짐. 그래서 nav는 화면이 바뀌어도 다시 그려지지 않음.
- 현재 메뉴 표시는 직접 만들지 않고 vue-router가 자동으로 붙여주는 router-link-exact-active 클래스에 색만 입힘.
- router-link-active가 아니라 exact를 쓴 이유는, / 링크는 모든 주소의 앞부분이라 active만 쓰면 /about에 있을 때도 대시보드 메뉴가 같이 켜져 있음.
- 전역 CSS(practice.css/weather.css) import는 계속 App.vue의 style 블록에 두고, nav 스타일만 style scoped로 따로 씀.

## 3. WeatherHomeView.vue
### WeatherParent 대체 (WeatherParent를 참고하여 / 경로에 맞게 작성)
### 상세보기 버튼 클릭 시 window.alert()를 제거하고, Programmatic Navigation 처리 (router.push('/weather/' + id))
- WeatherParent의 weatherList, searchQuery, selectedCityInfo, favorites와 computed/watch/watchEffect를 그대로 옮김. 변수명도 핸들러 이름도 안 바꿈.
- 바뀐 건 "부모 컴포넌트"였던 것이 "/ 경로의 페이지"가 됐다는 점뿐이고, 상태는 전부 여기 두고 자식은 props로 받아 그리기만 하는 구조는 과제 3과 동일함.
- handleClickDetail에서 window.alert를 지우고 router.push('/weather/' + cityId)로 바꿈. alert는 화면 위에 잠깐 떴다 사라지지만 push는 주소가 바뀌면서 진짜 페이지가 열리는 거라, 그 주소를 복사해서 다시 들어갈 수 있음.
- 이동에 필요한 건 도시 이름이 아니라 id라서, WeatherCard가 emit하는 값을 city 객체 전체에서 city.id로 바꿈 (과제 3에서는 부모가 alert 문구를 만들어야 해서 객체를 통째로 올려보냈음).
- openCity로 관리하던 v-show 상세 패널은 없앰. 상세 정보를 보여주는 일이 /weather/:cityId라는 별도 페이지로 넘어갔는데 카드 안에도 같은 게 남아 있으면 역할이 겹침.

### 나만의 추가 (검색어 쿼리 스트링 동기화)
- 검색어를 화면 안에만 두지 않고 주소창의 ?search=에도 같이 기록되게 함. 검색한 상태로 새로고침하거나 주소를 복사해서 열어도 결과가 유지됨.
- 들어올 때는 onMounted에서 route.query.search를 읽어 searchQuery에 넣고, 나갈 때는 watch(searchQuery)로 주소를 갱신하는 양방향 구조.
- 주소를 바꿀 때 push가 아니라 replace를 씀. push를 쓰면 글자 하나 칠 때마다 히스토리가 쌓여서 뒤로가기를 "서", "서울", "서"... 처럼 여러 번 눌러야 대시보드를 빠져나감.
- query에 빈 문자열 대신 undefined를 넣으면 vue-router가 그 키를 아예 빼주기 때문에, 검색어를 다 지우면 주소도 깔끔하게 /로 돌아감.

## 4. WeatherDetailView.vue
### 지역별 상세 기상관측 정보를 보여주는 페이지
### 도시 코드에 해당하는 Mock Data를 임시로 활용
### Router 동적 경로 매칭에 해당되는 도시ID (cityId)를 기반으로 Mount 시점에 Mock Data에서 도시 객체 선택
- 라우트를 /weather/:cityId로 잡아서 주소의 city_01 부분이 route.params.cityId로 들어옴. useRoute()는 "지금 주소가 뭔지 읽는 쪽", useRouter()는 "주소를 바꾸는 쪽"이라 둘 다 씀.
- 요구사항대로 onMounted에서 weatherData.find(city => city.id === cityId)로 도시 객체를 골라 cityData에 담음. Mock Data는 과제 1부터 쓰던 weatherData를 그대로 씀.
- 여기서 한 번 막혔는데, /weather/city_01에서 /weather/city_02로 이동하면 화면이 안 바뀜. 같은 라우트끼리의 이동이라 vue-router가 컴포넌트를 파괴하지 않고 재사용해서 onMounted가 다시 실행되지 않기 때문.
- 그래서 watch(() => route.params.cityId, ...)로 파라미터 변화도 같이 감시하게 함. 최초 진입은 onMounted가, 같은 페이지 안에서의 이동은 watch가 담당하는 셈.
- 이미 온도/습도/미세먼지는 카드에서 보여주고 있어서, 상세 페이지에서는 과제 1에서 추가해둔 체감온도, 풍속, 강수확률까지 표로 펼치고 체감온도와 실제 기온 차이를 문장으로 계산해서 붙임.
- 데이터를 못 찾은 경우(/weather/city_99처럼 형식은 맞는데 없는 코드)는 404로 보내지 않고 안내 문구와 돌아가기 버튼을 띄움. 주소 자체는 라우터가 아는 형식이 맞아서 "없는 페이지"가 아니라 "없는 데이터"이기 때문.
- 이전/다음 도시 버튼은 router.push({ name: 'WeatherDetail', params: { cityId } }) 형태로 씀. 문자열로 주소를 조립하는 방식과 결과는 같지만, 경로가 바뀌어도 이름만 맞으면 되니까 이런 방법도 있다는 걸 확인하려고 일부러 다르게 씀.

## 5. WeatherAboutView.vue
### 적당한 내용 작성 및 메인 대시보드로 돌아가기 작성
- 상태가 하나도 없는 정적 페이지라 지연 로딩 대상으로 두기 딱 좋음.
- 어떤 앱인지, 어떤 주소가 있는지, 어떤 라우터 기능을 썼는지 세 덩어리로 나눠서 적음. 껍데기는 과제 3에서 만든 BaseDashboardCard를 그대로 재사용함.
- 돌아가기는 RouterLink가 아니라 버튼 + router.push('/')로 함. 요구사항이 버튼이기도 하고, 링크로 이동하는 것과 코드로 이동하는 것을 한 화면 안에서 둘 다 보여주려고 함.

## 6. 나만의 추가
### 상기 정의된 view 이외에 본인의 추가 view 를 작성하고 Routing 한다.
- WeatherStatsView.vue (/stats) : 도시 6개를 전부 집계해서 보여주는 통계 페이지.
- 평균 기온/평균 습도, 최고·최저 기온 도시, 기온 랭킹 막대, 미세먼지 나쁨과 강수확률 40% 이상인 도시 목록을 computed로만 계산함.
- 라우트끼리 상태를 공유하는 방법(스토어)은 아직 안 배워서, weatherData만 있으면 혼자 다 계산되는 주제로 고름. 즐겨찾기 모아보기 같은 걸 만들려면 홈의 favorites를 넘겨야 해서 이번 과제 범위를 벗어남.
- 랭킹은 [...weatherData].sort(...)로 복사본을 만들어 정렬함. sort는 원본 배열을 직접 뒤집기 때문에 그냥 쓰면 다른 화면의 도시 순서까지 같이 바뀜.
- 막대 길이는 가장 더운 도시를 100%로 잡고 비율을 계산함. 과제 1에서 만든 습도 게이지와 같은 방식(:style로 width 지정).
- 랭킹 행을 누르면 router.push로 그 도시 상세 페이지로 이동함. 대시보드 말고 다른 화면에서도 상세 페이지로 들어갈 수 있게 함.
- NotFoundView.vue : Catch-all이 잡아오는 화면. 어떤 주소로 잘못 들어왔는지 route.fullPath로 같이 보여주면 오타인지 없는 페이지인지 바로 구분됨.
- LegacyTaskView.vue (/legacy) : 기존 App.vue가 그리던 과제 1~3 화면을 통째로 옮긴 것. import 경로만 './components/...'에서 '@/components/...'로 바꾸고 내용은 그대로 둠.

## 7. 확인한 것
- 대시보드에서 상세보기를 누르면 주소가 /weather/city_01로 바뀌고, 그 주소에서 새로고침해도 데이터가 그대로 뜸.
- 상세 페이지에서 이전/다음 도시를 눌러도 화면이 바뀜 (위의 watch 때문).
- /weather/city_99는 안내 문구, /nothing-here는 404 페이지로 갈림.
- /?search=부로 바로 들어가면 검색창에 "부"가 채워지고 부산만 남음.
- npm run build 결과에서 view별 청크가 따로 생성되는 것으로 지연 로딩 확인.

# 과제 5
- 1~4일차 때 쓰던 weatherData, practice.css/weather.css를 그대로 재사용함.
- 과제 4까지는 상태가 화면(view)마다 흩어져 있었는데, 그중 "화면이 바뀌어도 남아 있어야 하는 값"만 골라서 스토어로 올리는 것이 목표.
- 스토어는 세 개를 만듦. configStore(단위 + 내 기준 설정), favoritesStore(즐겨찾기), recentStore(최근 본 도시).
- 반대로 검색어(searchQuery)나 선택된 카드(selectedCityInfo)는 그 화면을 벗어나면 의미가 없어서 일부러 스토어로 안 올리고 view의 지역 상태로 남겨둠. "전역에 둘 값 / 화면에 둘 값"을 나누는 게 이번 과제의 핵심이라고 봄.

## 1. stores/configStore.js
### state: unit (단위를 저장하는 변수, 초기값 celsius) / getters: unitSymbol (현재 단위 상태에 맞는 기호) / actions: toggleUnit ('celsius'와 'fahrenheit'를 토글하는 함수)
- Option Store 대신 Setup Store 문법으로 작성함. ref가 state, computed가 getters, 일반 function이 actions에 그대로 대응돼서 지금까지 쓰던 컴포지션 API 문법을 그대로 쓸 수 있음.
- defineStore의 첫 번째 인자('config')는 스토어를 구분하는 이름이라 파일마다 겹치지 않게 붙임.
- Setup Store는 return에 적은 것만 밖에서 보이기 때문에, 내부 상수(DEFAULT_HOT_THRESHOLD 등)는 return에서 빼서 자연스럽게 감춰짐.

## 2. UnitToggler.vue
### 대시보드 상단에 배치되어 단위 설정을 변경하는 UI 버튼과 영역
- props도 emit도 없는 컴포넌트가 됨. 부모에게 값을 받지도, 부모에게 알리지도 않고 스토어를 직접 읽고 직접 고침.
- 과제 3에서 SearchBar를 만들 때는 검색어를 props로 받고 emit으로 되돌려주는 릴레이를 직접 짰는데, 그 릴레이가 통째로 없어진 셈. 스토어를 왜 쓰는지가 이 파일 하나에서 제일 잘 드러남.
- 표시 문구("섭씨(℃)")를 컴포넌트에서 삼항연산자로 만들지 않고 unitLabel getter로 빼둠. 나중에 설정 화면에서도 같은 문구를 써서 결과적으로 두 곳에서 재사용됨.

## 3. Navigation Bar 옆에 UnitToggler.vue 배치
- App.vue의 nav 안, 링크들 뒤쪽에 배치함. 사이에 flex: 1인 빈 span을 하나 넣어서 토글러를 오른쪽 끝으로 밀어냄.
- 요소가 늘어나면서 800px 컨테이너 안에서 nav가 잘려서 flex-wrap: wrap을 줌.
- 겸사겸사 즐겨찾기 링크에 개수 배지를 붙임. App.vue가 favoritesStore를 직접 읽는데, 여기가 라우터 껍데기라 어차피 어떤 view의 부모도 아니어서 props로는 받을 방법이 없음.

## 4. 메인과 상세 날씨에 단위 설정 변경 적용
### 메인/상세 날씨에 단위 설정을 변경을 적용할 경우 유사한 코드가 중복됨 → Composable로 해결 가능함 (범위 제외)
- 강사님 예시 코드를 그대로 옮기면 props is not defined 에러가 남. script setup에서는 defineProps()의 반환값을 const props = 로 받아야 props를 쓸 수 있음.
- 중복 문제는 Composable 대신 스토어 getter로 풀었음. convertTemp를 "값을 리턴하는 computed"가 아니라 "함수를 리턴하는 computed"로 만들면 인자를 받는 getter가 되고, 변환식이 스토어 한 곳에만 남음.
- 실제로 카드, 상세, 통계 세 화면이 전부 configStore.convertTemp(원본섭씨)만 호출함. 화씨 공식은 프로젝트 전체에서 딱 한 줄만 존재함.
- 체감온도(feelsLike)도 온도라서 같이 변환해야 함. 기온만 바꾸면 화씨 모드에서 "82℉ / 체감 30℉"처럼 어긋남.
- 체감온도와 실제 기온의 차이 문구도 변환된 값끼리 빼도록 고침. 섭씨 2도 차이는 화씨로는 3.6도라서 원본끼리 빼면 화면에 보이는 숫자와 안 맞음.
- 통계 화면의 평균 기온은 섭씨 원본으로 평균을 먼저 내고 마지막에 한 번만 변환함. 도시별로 변환한 뒤 평균을 내면 반올림 오차가 6번 쌓임.
- 반대로 기온 랭킹 막대 길이는 일부러 원본 섭씨로 계산함. 화씨는 0이 기준점이 아니라(물이 어는 점이 32) 변환값으로 비율을 내면 막대가 전부 비슷한 길이로 뭉개짐.
- 더움/선선함 판정도 항상 원본 섭씨로 함. 단위를 바꿨다고 실제 더위가 바뀌는 건 아니므로.

## 5. 나만의 추가 (1) - 즐겨찾기 스토어
### 본인만의 추가 Store를 작성하고 활용하거나, configStore에서 state, getter, action을 추가한다.
- 과제 4까지 favorites는 WeatherHomeView의 지역 상태였음. 그래서 카드를 몇 개 체크하고 상세보기로 들어갔다 돌아오면 체크가 전부 풀려 있었음. 홈이 언마운트되면서 ref가 같이 사라지기 때문.
- 스토어로 올리니 화면을 옮겨도 값이 남고, 과제 4 README에 "홈의 favorites를 넘길 방법이 없어서 범위를 벗어남"이라고 적었던 즐겨찾기 모아보기 화면(/favorites)을 만들 수 있게 됨.
- 도시 이름이 아니라 id를 담도록 바꿈. 이름은 표시용이고 id가 데이터의 열쇠라서, 목록을 다시 그릴 때 weatherData에서 찾아오기도 편함.
- isFavorite도 convertTemp와 같은 "인자를 받는 getter"로 만듦. 카드마다 자기가 즐겨찾기인지 물어봐야 하는데 도시별로 getter를 만들 수는 없으므로.
- WeatherCard에서 isFavorite props와 toggle-favorite emit이 사라짐. 대신 select-card와 click-detail emit은 그대로 둠. 즐겨찾기는 "데이터"라서 스토어가 갖고, 어느 주소로 이동할지는 "그 화면의 결정"이라 여전히 부모가 하는 게 맞다고 판단함.
- FavoritesView는 자기 상태가 하나도 없음. 스토어에서 favoriteCities를 읽어 WeatherCard를 v-for로 돌리는 게 전부라 파일이 아주 짧아짐.

## 6. 나만의 추가 (2) - 최근 본 도시 스토어
- 상세 페이지(/weather/:cityId)에 들어갈 때마다 도시 id를 기록해두고, 대시보드 상단에서 칩 형태로 꺼내 씀.
- 기록하는 화면과 보여주는 화면이 아예 다른 라우트라서 props로는 전달할 방법이 애초에 없음. 즐겨찾기보다 이쪽이 "스토어가 아니면 안 되는" 경우에 더 가까움.
- addRecent는 이미 본 도시면 기존 자리에서 빼고 맨 앞에 다시 넣음. 중복 없이 최신순이 유지되고, slice(0, 5)로 5개까지만 남김.
- 기록은 도시를 실제로 찾은 경우에만 함. /weather/city_99처럼 없는 코드로 들어온 것까지 이력에 남으면 안 되므로 loadCity 안에서 찾기 성공 여부를 보고 호출함.

## 7. 나만의 추가 (3) - 내 기준 설정 (configStore 확장)
- 과제 1에서 "25도 이상이면 더움"은 강사님이 정해준 숫자였고, 미세먼지 30/80도 내가 임의로 정한 숫자였음. 이 숫자들을 사용자가 직접 옮길 수 있게 configStore의 state로 뺐음 (hotThreshold, dustGoodMax, dustBadMin, bodyType).
- 판정 자체도 isHot(섭씨)과 dustGrade(먼지) getter로 스토어에 올림. 원래 카드, 상세, 통계 세 곳에 30/80이라는 숫자가 흩어져 있었는데 전부 스토어 한 곳을 보게 됨. 4번에서 온도 변환식을 모은 것과 같은 방식.
- dustGrade는 문구가 아니라 'good'/'normal'/'bad' 등급만 돌려줌. 뱃지 색이나 문구는 화면마다 다를 수 있어서 판정만 스토어가 하고 표현은 컴포넌트가 하도록 나눔.
- 설정 화면의 슬라이더는 v-model로 스토어 state를 직접 물리지 않고 :value + @input으로 액션(setDustGoodMax 등)을 거치게 함. 과제 1에서 v-model을 풀어 썼던 것과 같은 형태인데, 이번에는 이유가 달라서 값 검증 때문임.
- 좋음 상한이 나쁨 하한을 넘어가면 좋음/보통/나쁨 판정이 뒤집히므로 액션 안에서 Math.min/Math.max로 막음. 실제로 좋음 50 / 나쁨 45를 넣어보면 나쁨이 51로 밀려남.
- 설정 화면에 미리보기를 넣어서 기준을 옮기면 지금 데이터 6개가 어떻게 갈리는지 바로 보이게 함 (더움 4개 → 1개, 좋음/보통/나쁨 개수 변화).
- isCustomized getter로 기본값에서 하나라도 바뀌었는지 판단해서, 안 바뀌었으면 '되돌리기' 버튼을 :disabled로 잠금.

## 8. 나만의 추가 (4) - 생활지수와 옷차림 추천
- 원본 관측값(습도/강수확률/미세먼지/바람/기온)을 조합해서 새 정보를 만들어내는 쪽도 해보고 싶어서 상세 페이지에 두 가지를 추가함.
- 생활지수는 빨래/세차/외출 세 가지를 0~100점으로 환산함. 계산은 data/lifeIndex.js에 순수 함수로 두고 화면은 결과 배열만 받아 v-for로 그림.
- 이건 일부러 스토어로 안 만듦. 도시 하나만 넣으면 답이 정해지는 계산이고 여러 화면이 공유하는 값도 아니라서, 스토어에 넣으면 오히려 왜 넣었는지 설명이 안 됨. "스토어는 화면 사이에 공유되는 상태를 담는 자리"라는 기준을 그대로 적용함.
- LifeIndexBar.vue는 지수 하나를 그리는 표시 전용 컴포넌트. 세 지수의 생김새가 완전히 같아서 컴포넌트 하나를 props만 바꿔 세 번 재사용함. 과제 3에서 기온 뱃지와 미세먼지 뱃지를 WeatherBadge 하나로 합쳤던 것과 같은 판단.
- 옷차림 추천은 체감온도를 5단계로 나눠서 판정하는데, 여기에 configStore의 체질 보정(bodyType)을 얹음. 설정에서 "추위를 많이 탐"을 고르면 판정 온도가 3도 내려가서 수원(체감 25도)의 추천이 반팔에서 긴팔·가디건으로 바뀜.
- 그래서 OutfitSuggestion은 표시 전용이 아니라 스토어를 직접 읽는 컴포넌트가 됨. 옷차림은 도시 데이터만으로는 정해지지 않고 "그 사람의 설정"이 있어야 정해지기 때문.
- 판정에 쓰는 온도는 항상 섭씨 원본 기준으로 함. 화씨로 바꿨다고 입을 옷이 달라지지는 않으므로.
- 강수확률 40% 이상이면 우산, 미세먼지가 나쁨 등급이면 마스크, 풍속 5m/s 이상이면 바람막이를 따로 덧붙임. 이 중 마스크 판정도 configStore의 dustGrade를 그대로 씀.

## 9. 확인한 것
- 단위변경을 누르면 대시보드 카드, 상세 페이지(기온+체감), 통계 화면(평균/최고/최저/랭킹)이 동시에 화씨로 바뀜.
- 카드를 체크하고 상세보기로 들어갔다 돌아와도 체크가 유지됨. 과제 4에서는 풀렸음.
- 상세 페이지에서 즐겨찾기를 추가하면 nav의 개수 배지와 /favorites 목록이 같이 갱신됨.
- 설정에서 더움 기준을 31도로 올리면 카드 뱃지가 전부 "선선함 (31도 미만)"으로 바뀌고, 통계의 랭킹 막대 색까지 같이 바뀜.
- 미세먼지 좋음 상한을 나쁨 하한보다 크게 넣어도 액션이 막아서 값이 뒤집히지 않음.
- 체질을 "추위를 많이 탐"으로 바꾸면 옷차림 판정 문구와 근거(체감 25℃ + 보정 -3도 = 22℃)가 같이 바뀜.
- npm run build 성공. 스토어를 쓰는 view들이 공통으로 참조하면서 configStore가 별도 청크로 묶임.
- 다만 브라우저를 새로고침하면 스토어 값이 전부 초기화됨. 피니아는 메모리에만 사는 게 정상이고, localStorage 연동은 아직 안 배운 범위라 넣지 않음.

# 과제 6
- 과제 5까지의 데이터는 전부 목업이었고 네트워크 요청이 한 건도 없었음. 이번 과제의 핵심은 새 기능을 얹는 게 아니라 이미 만들어 둔 기능의 바닥을 실제 관측값으로 갈아끼우는 것이라고 봄.
- 그래서 화면과 계산식은 거의 그대로 두고, 데이터가 오는 길(api → store → view)을 새로 만드는 데 시간을 씀.
- 도시는 6개 그대로 유지함. 지오코딩으로 아무 도시나 검색해 추가하는 기능은 범위에서 뺐음. 도시가 늘어나는 것보다 도시 하나에 대해 더 많이 아는 쪽이 이번 요구사항(API 추가로 기능 확장)에 맞는다고 판단함.
- 백엔드는 띄우지 않음. 브라우저가 API를 직접 호출함. 프록시도 서버리스도 없음.

## 1. Axios 활용 준비
### 1. Axios 라이브러리 설치 / 2. OpenWeatherMap API 가입 및 Key 발급
- 키는 .env에 VITE_OWM_API_KEY로 넣고 .gitignore에 .env를 추가함. 저장소에는 값이 빈 .env.example만 커밋함. 다른 PC에서 클론하면 example을 복사해서 자기 키를 넣으면 됨.
- 강사님 참고 파일처럼 소스에 키를 박아두지 않은 이유가 두 가지임. 하나는 슬라이드 요구사항이 본인 발급이라서고, 다른 하나는 저장소에 올라간 키는 나중에 지워도 커밋 기록에 남기 때문임.
- 다만 한계를 알고 씀. Vite 환경변수는 빌드 결과물에 문자열로 그대로 들어가서 브라우저 개발자도구에서 보임. .env로 빼는 건 "브라우저에서 숨기는 것"이 아니라 "저장소에 남기지 않는 것"임. 프론트 단독 앱에서 키를 완전히 가리는 방법은 없고 진짜 해결책은 키를 들고 대신 호출해 주는 백엔드임.
- 키가 비어 있으면 401이 여섯 번 날아온 뒤에야 이상하다는 걸 알게 되므로, client.js에서 시작할 때 한 번 콘솔 경고를 띄우게 함.
- 이 한계는 과제를 마친 뒤 12번에서 실제로 해결함. 아래 내용은 그 전 상태의 기록임.

## 2. 4층 구조 (화면 → 스토어 → api 함수 → axios 인스턴스)
- axios.get을 화면에서 직접 부르지 않기로 함. 화면이 URL과 키를 알게 되면 나중에 백엔드가 생겼을 때 고칠 곳이 화면 수만큼 늘어남.
- src/api/client.js : baseURL, 공통 파라미터(appid/units/lang), timeout 8초, 인터셉터. 주소와 키를 아는 유일한 파일임.
- src/api/weather.js : "어떤 주소로 무엇을 물어볼지"만 아는 함수 5개. 응답을 그대로 넘기지 않고 앱이 쓰는 필드 이름(temp/feelsLike/dust/rainProb)으로 여기서 번역함. 번역을 여기서 끝내두면 과제 5까지 만든 화면과 lifeIndex 계산식을 거의 손대지 않아도 됨.
- src/stores/weatherStore.js : 도시별 관측값 보관, 로딩·에러·갱신시각 관리.
- 응답 인터셉터에서 두 가지를 함. 성공하면 response.data까지 벗겨서 넘기고(호출부마다 .data를 붙이지 않아도 됨), 실패하면 AxiosError를 한국어 문장으로 바꿔서 넘김. 화면은 error.message만 그리면 됨.
- Open-Meteo는 인스턴스를 따로 만듦. 같은 인스턴스에 baseURL만 덮어쓰면 공통 파라미터인 appid까지 딸려가서 남의 서버에 내 키를 보내게 됨.

## 3. src/data/cities.js 분리
- 과제 5까지 weatherData.js 한 파일이 "도시가 무엇인가(id/이름)"와 "지금 날씨가 어떤가(기온/습도)"를 같이 들고 있었음. 실제 API를 붙이면서 이 둘을 갈랐음. 안 변하는 건 박아두고 변하는 것만 통신함.
- 도시 이름(q=Seoul)이 아니라 좌표(lat/lon)를 씀. 현재날씨·대기오염·예보·자외선 네 API가 전부 좌표를 공통으로 받고, 이름을 받는 건 현재날씨뿐임. 동명 도시가 걸릴 위험도 없음.
- weatherData.js는 지우지 않고 남김. 통신 실패 시 폴백 데이터로 씀 (8번 항목).
- favoritesStore와 recentStore가 weatherData를 직접 import하고 있었는데, 이 참조를 나누는 게 이번 리팩터링에서 제일 손이 많이 간 지점이었음. favoritesStore는 날씨가 필요해서 weatherStore를 보게 하고, recentStore는 이름만 필요해서 cities.js를 보게 함.

## 4. 실제 날씨 데이터 적용
### 1. OpenWeatherMap API를 통해 실제 날씨 데이터를 가져와 적용한다.
- 목업 필드를 하나씩 실제 출처로 갈아끼움. temp/feelsLike/humidity는 main.*, wind는 wind.speed, status는 weather[0].description.
- lang=kr은 description에만 적용됨. 응답의 name은 여전히 영문("Seoul")이라 화면에 쓰지 않고 cities.js의 한글 이름을 씀.
- 응답 필드가 비는 경우가 있어서 전부 옵셔널 체이닝과 기본값으로 받음. main.feels_like가 undefined인 채로 화면까지 가면 조용히 NaN℃가 뜸.
- 실제 값은 28.339999처럼 들어와서 소수점 한 자리로 자름.
- 새 스토어는 weatherStore 하나만 만듦. 스토어로 올릴지는 "두 화면 이상이 같은 데이터를 쓰는가 / 화면을 떠났다 돌아와도 값이 살아 있어야 하는가" 둘 중 하나라도 예인지로 판단함. 도시 목록은 대시보드·통계·즐겨찾기가 같이 쓰므로 예에 해당함.
- 반대로 자외선·내 위치 좌표·검색어는 한 화면에서만 쓰므로 컴포넌트 안에 둠. 과제 5에서 세운 기준을 그대로 적용함.

## 5. OpenWeatherMap API 추가
### 2. OpenWeatherMap에서 제공되는 API를 추가하여 Application 기능을 확장한다.
- 대기오염(/data/2.5/air_pollution) : 지금까지 근거 없는 숫자였던 dust를 실제 PM10 관측값으로 바꿈.
- 여기서 뜻밖의 소득이 있었음. 설정 화면의 미세먼지 경계 기본값 30/80이 한국 환경부 PM10 등급 기준과 그대로 일치함(30 이하 좋음, 80 이하 보통, 초과 나쁨). 과제 5까지는 내가 임의로 정한 숫자였는데, 실제 PM10을 받는 순간 같은 척도를 쓰는 숫자가 됨. 설정 화면에 근거를 적어둠.
- 5일/3시간 예보(/data/2.5/forecast) : 3시간 간격 40개 시점이 옴. rainProb의 실제 출처이자 6번 항목의 재료임.
- pop은 0~1 소수라 ×100을 해야 퍼센트가 됨. 그대로 쓰면 강수확률 80%가 화면에 0.8%로 찍힘.
- 역지오코딩(/geo/1.0/reverse) : 좌표를 한글 지명으로 바꿈. local_names.ko가 없는 지역이 있어서 없으면 영문 name으로 떨어지게 함. 7번 항목에서 씀.
- 계획과 달라진 점 : 예보는 상세 페이지 안에만 두려고 했는데, 강수확률이 예보에서만 나오고 그 값을 대시보드의 생활지수와 통계 화면의 "강수확률 40% 이상"이 이미 쓰고 있었음. 두 화면 이상이 쓰는 데이터라 스토어로 올림. 결과적으로 상세 페이지에 들어갈 때 예보를 다시 받지 않게 되어 호출 수도 줄었음.

## 6. 기타 외부 API 추가 (Open-Meteo 자외선)
### 3. 기타 외부 API를 추가하여 Application 기능을 확장한다.
- 자외선 지수는 OpenWeatherMap 무료 플랜에 없음. One Call 3.0에 들어 있는데 결제수단 등록이 필요해서 제외함.
- 대신 키가 필요 없는 Open-Meteo(api.open-meteo.com)에서 받음. 도메인이 다른 API를 하나 더 붙인 셈이라 요구사항 3을 채움.
- 상세 페이지 관측 항목에 "자외선 보통 (오늘 최고 3.6 · 현재 2.4)" 형태로 표시하고, 등급 구간은 기상청/WHO 기준(3/6/8/11)을 그대로 씀.
- 이 호출만 try를 따로 잡음. OpenWeatherMap 쪽이 실패해도 이건 성공할 수 있는데, 한 덩어리로 묶으면 멀쩡히 받아온 값까지 같이 날아감.

## 7. 나만의 추가 (1) - 시간대별 최적 생활지수
- 과제 5의 생활지수는 "지금 빨래하기 좋은가" 하나만 답했음. 지금 값 하나밖에 없었으니 그럴 수밖에 없었음.
- 예보가 붙으면서 시점이 여러 개 생겼으므로, 같은 계산식을 시점마다 돌려서 "오늘 중 언제가 제일 좋은가"를 답하게 함. "빨래지수 오늘 오후 3시 82점" 형태로 표시함.
- 계산식은 과제 5에서 만든 data/lifeIndex.js의 함수를 그대로 재사용함. 새로 만든 건 시점별로 돌려서 최고점을 고르는 getBestTimeList 하나뿐임.
- 예보 데이터가 없으면 원리적으로 만들 수 없는 정보라서, "API를 추가해 기능을 확장했다"에 제일 정확히 맞는다고 봄.
- UNIX 초에는 시간대 정보가 없음. day.js의 utc/timezone 플러그인으로 도시 타임존으로 옮겨야 "오늘"의 범위와 "오후 3시"가 맞음.
- 늦은 밤이라 오늘 남은 구간이 없으면 다음 24시간(3시간 × 8)을 대신 보고, 카드 제목도 "앞으로 24시간 중"으로 바꿈.
- 미세먼지는 구간별 예보 값이 없어서 현재 관측값을 전 구간에 같게 적용함(세차/외출지수에 쓰임). 대기오염 예보 API가 따로 있지만 호출을 더 늘리지 않기로 함.
- 시간별 예보 막대는 통계 화면의 랭킹 막대와 같은 방식으로 순수 CSS로 그림. 차트 라이브러리를 새로 들이지 않음.

## 8. 나만의 추가 (2) - 내 위치 날씨와 받침 기능
- VueUse의 useGeolocation으로 브라우저 좌표를 받아 역지오코딩으로 한글 지명을 얻고, 그 좌표의 현재 날씨를 표시함.
- immediate: false로 두고 버튼을 눌렀을 때만 권한을 물어봄. 화면에 들어오자마자 권한 팝업이 뜨는 건 무례하다고 봄.
- 권한을 거부하면 좌표가 영영 오지 않아서 로딩 표시가 안 풀림. error도 같이 감시해서 안내 문구로 바꿈. 거부해도 아래 도시 6개는 그대로 쓸 수 있음.
- 통신이 전부 실패하면 weatherData.js 목업으로 내려앉고 "오프라인 데이터" 배지를 띄움. 발표 당일 통신이 불안할 때를 대비한 보험이기도 함.
- Promise.all이 아니라 Promise.allSettled로 도시 6개를 받음. all은 한 도시만 실패해도 전체가 무너지는데, 여섯 중 다섯이 성공했다면 그 다섯은 보여주는 게 맞음.
- 갱신 시각을 "3분 전 기준"으로 표시하고 수동 새로고침 버튼을 둠. useOnline으로 오프라인일 때는 버튼을 잠금.
- useIntervalFn으로 10분마다 자동 갱신함. setInterval을 직접 쓰면 화면을 떠날 때 clearInterval을 잊기 쉬운데 이건 언마운트 시 알아서 멈춤.
- 첫 통신 전에는 el-skeleton을 띄우고, 이미 값이 있는 상태의 새로고침 때는 화면을 비우지 않음. 멀쩡히 보이던 카드가 사라졌다 나타나면 더 불안함.

## 9. 호출 수와 캐싱
- 대시보드 진입 시 도시 6개 × (현재날씨 + 대기오염 + 예보) = 18회. 상세 진입은 자외선 1회.
- 무료 플랜이 분당 60회라서 화면을 오가며 테스트하면 금방 참. weatherStore에 10분 캐시를 둬서 fetchAll이 캐시가 살아 있으면 아무 요청도 보내지 않게 함.
- 대시보드를 안 거치고 /stats나 /weather/city_01로 바로 들어와도 값이 있어야 해서 그 화면들도 fetchAll(또는 ensureCity)을 부름. 캐시 덕분에 중복 호출이 되지 않음.
- axios-cache-interceptor는 넣지 않음. 스토어 캐시로 충분했고, 개발 중 429를 만나지 않았음. 필요해지면 그때 붙이는 게 맞다고 봄.

## 10. 쓴 라이브러리
- axios : 과제 필수.
- day.js : UNIX 초를 도시 타임존으로 옮기고 "오늘 오후 3시" / "3분 전"으로 표시. 설정은 utils/dayjs.js 한 곳에 모음. day.js는 기본 기능만 들어 있어서 utc/timezone/relativeTime을 extend 해야 함.
- VueUse : useGeolocation(내 위치), useIntervalFn(자동 갱신), useOnline(오프라인 감지).
- pinia-plugin-persistedstate : 과제 5 README에 "새로고침하면 스토어가 초기화되는데 localStorage는 아직 안 배운 범위라 남겨둔다"고 적었던 항목을 해결함. configStore/favoritesStore/recentStore에 persist: true를 켬.
- weatherStore에는 일부러 persist를 켜지 않음. 어제 받아둔 기온을 오늘 화면에 그대로 띄우게 됨. 저장해도 되는 값과 안 되는 값이 갈린다는 걸 이번에 알게 됨.
- element-plus : el-skeleton(로딩), el-alert(에러/오프라인), el-empty(빈 상태)만 부분 사용함. 전체 레이아웃은 기존 CSS 그대로 유지함.
- Vue Query는 일부러 안 씀. 서버 상태를 가져가면서 과제 5에서 배운 Pinia의 역할이 사라져서, 배운 걸 우회한 게 됨.

## 11. 확인한 것
- 키를 비운 채로 띄우면 OpenWeatherMap 호출이 전부 401로 떨어지고, 대시보드가 목업으로 내려앉으면서 "오프라인 데이터" 배지와 에러 문구가 뜸. 화면이 빈 채로 서 있지 않음.
- 같은 상태에서 상세 페이지의 자외선은 정상적으로 표시됨. Open-Meteo는 키와 무관한 별개 서버라서, 한쪽이 죽어도 다른 쪽이 사는 구조가 실제로 동작함을 확인함.
- /weather/city_01로 바로 들어와도(대시보드를 안 거쳐도) 값이 채워짐. 처음에는 이 경로에서 폴백이 걸리지 않아 0℃가 표시됐는데, 스토어에 ensureCity를 만들어 "있으면 그대로 / 없으면 받아오고 / 실패하면 목업"까지를 스토어가 끝내도록 고침.
- 새로고침해도 즐겨찾기·내 기준·최근 본 도시가 남음. localStorage에 스토어 id를 키로 저장되는 것을 확인함.
- 통계 화면의 랭킹 막대는 값이 오기 전에 최고 기온이 0이라 0으로 나누게 됨. width: NaN%가 들어가지 않도록 분모를 막아둠.

## 12. 배포와 API 키 서버 이전
- 1번에 "프론트 단독 앱에서 키를 완전히 가리는 방법은 없다"고 적어뒀는데, 배포를 준비하면서 그게 말이 아니라 눈으로 확인됨. 빌드 결과물을 검사해보니 `dist/assets/configStore-*.js` 안에 키가 문자열로 그대로 들어 있었음.
- 번들에서 문자열을 지우는 식으로는 해결되지 않음. 브라우저가 OpenWeatherMap을 직접 호출하는 이상 요청 URL에 appid가 실려 나가고, 그건 개발자도구 Network 탭에 그대로 보임. 코드를 숨겨도 나가는 요청은 못 숨김.
- 그래서 요청 경로를 하나 늘림. **브라우저 → 내 서버 → OpenWeatherMap**. 키를 아는 주체를 브라우저에서 서버로 옮긴 것.
- 배포는 Vercel. `npm run build` 결과가 정적 파일 뭉치라서 올리기만 하면 되고, 서버리스 함수도 같은 곳에서 돌릴 수 있음. `vercel.json`에 rewrite를 넣어 모든 경로를 index.html로 넘김. 없으면 /stats를 주소창에 직접 치거나 그 화면에서 새로고침할 때 404가 남 (createWebHistory를 쓰는 SPA의 공통 함정).
- 단, rewrite 조건을 `/((?!api/).*)` 로 씀. 전부 index.html로 넘기면 /api/owm 요청까지 HTML을 받아와서 함수가 실행되지 않음.
- rewrite 순서도 중요함. `/api/owm/:path*` 규칙이 먼저 와야 함수로 넘어가고, 그 다음 SPA 규칙이 나머지를 받음.

### 무엇을 고쳤나
- `.env`의 변수명을 `VITE_OWM_API_KEY` → `OWM_API_KEY`로 바꿈. Vite는 VITE_로 시작하는 변수만 브라우저 번들에 넣으므로, 접두사를 떼는 순간 번들에 들어갈 방법이 사라짐. 접두사가 존재하는 이유가 이 구분이었음.
- `api/owm.js` 추가. Vercel Function. 브라우저 요청을 받아 appid를 붙여 OpenWeatherMap에 넘기고 응답을 그대로 돌려줌. 이 파일은 서버에서만 실행되고 브라우저로 내려가지 않음.
- 처음에는 `api/owm/[...path].js` 로 만들었다가 배포 후 404를 만남. 대괄호 catch-all은 Next.js 파일 규칙이고, 프레임워크 없는 프로젝트에서 Vercel은 "/api 안의 파일 하나 = 함수 하나"로만 매핑함. 문서에 "Vercel will deploy any file in the /api directory as a function"이라고 적혀 있는 그대로였음.
- 시그니처도 `(req, res)`가 아니라 웹 표준 `export function GET(request)`로 씀. 현재 Vercel Functions는 Web Handler를 쓰고 Request/Response 객체를 주고받음.
- 하위 경로는 vercel.json의 rewrite가 `?path=`로 넘겨줌. 파일 이름으로 라우팅하지 않고 설정으로 명시하니 규칙에 의존하지 않게 됨.
- 아무 경로나 중계하면 남이 내 함수를 공짜 프록시로 쓰게 되므로, 실제로 쓰는 4개 경로만 허용하는 화이트리스트를 둠.
- 상태 코드는 그대로 돌려줌. 401이나 429를 200으로 바꿔버리면 화면이 에러 종류를 구분하지 못함.
- `src/api/client.js`의 baseURL을 `https://api.openweathermap.org` → `/api/owm`으로 바꾸고 params에서 appid를 뺌.
- **고친 화면 코드가 하나도 없음.** 과제 6에서 "주소를 아는 파일을 하나로 몰자"고 층을 나눠둔 덕분에 baseURL 한 줄로 끝났음. 구조를 나눠둔 게 실제로 값을 한 지점.

### 로컬 개발은 어떻게 되나
- Vercel 서버리스 함수는 `npm run dev`에서 실행되지 않음. 그대로 두면 로컬에서 전부 404가 남.
- `vite.config.js`에 프록시를 넣어 개발 중에는 Vite 개발 서버가 같은 역할을 하게 함. 브라우저가 보는 주소(`/api/owm/...`)는 개발이든 배포든 똑같고, 키를 붙이는 주체만 달라짐.
- `loadEnv(mode, process.cwd(), '')`의 세 번째 인자가 빈 문자열인 이유는, 기본값이 'VITE_'라서 접두사 없는 OWM_API_KEY를 못 읽기 때문. 이 파일은 Node에서 실행되므로 키를 다뤄도 안전함.
- `preview`에도 같은 프록시를 걸어둠. `npm run preview`로 빌드 결과물을 확인할 때도 필요함.
- eslint 설정에 `api/**`와 `vite.config.js`만 Node 전역을 쓰도록 블록을 추가함. 뒤집어 말하면 그 외 파일에서는 process를 쓸 수 없어서, 키가 브라우저 코드로 새는 걸 린트가 막아줌.

### 자외선(Open-Meteo)은 그대로 둠
- 애초에 키가 필요 없는 API라 중계할 이유가 없음. 감출 게 없는데 경로만 길어짐.
- 덕분에 "한쪽 서버가 죽어도 다른 쪽은 산다"는 구조도 유지됨.

### 남은 한계 (숨기지 않고 적어둠)
- 내 프록시 주소는 여전히 공개라, 남이 호출해서 무료 플랜 할당량을 쓸 수는 있음.
- 다만 키 유출과는 급이 다른 문제임. 키가 새면 남이 자기 서비스에 갖다 쓰고 내 계정이 정지되지만, 프록시 남용은 경로 화이트리스트와 호출 제한으로 대응할 수 있고 주소를 바꾸는 것도 가능함.
- 완전히 막으려면 인증이 필요한데, 로그인 없는 공개 날씨 앱에서는 의미가 없다고 판단함.

### 확인한 것
- 브라우저가 실제로 보내는 요청이 `/api/owm/data/2.5/weather?units=metric&lang=kr&lat=37.5665&lon=126.978` 형태로 바뀌었고 **appid 파라미터가 없음.**
- `npm run build` 후 dist 전체를 키 문자열로 검색했을 때 **0건**. 바꾸기 전에는 `configStore-*.js` 1건이 나왔음. appid라는 단어조차 번들에 없음.
- 프록시를 거친 뒤에도 5개 API가 전부 정상 동작함 (제주 33.7℃ / PM10 28 / 자외선 8.2 / 시간별 예보 / 역지오코딩).

# 과제 7

강사님 참고 파일(`skala-vue-main`)에서 실제로 쓰인 문법·라이브러리를 상한으로 두고, 그 안에서 화면 완성도를 올린 단원.
계획은 `README3.md` 에 따로 적어뒀고 여기에는 결과와 판단 근거만 남긴다.

## 1. 이번 단원의 요구사항
### 외부 UI Library 를 선정하고 3일차 과제에 외부 UI Library 를 자유롭게 적용해 본다.
- 라이브러리는 **Element Plus** 로 확정. 과제 6 때 이미 설치·전역 등록해둔 상태였고, 강사님 참고 파일의 `practices/library/ElementPlus.vue` 에도 같은 라이브러리 실습이 들어 있어서 상한 안쪽인 게 확실함.
- 다만 과제 6 까지 실제로 쓰던 건 `el-alert`, `el-empty`, `el-skeleton`, `el-carousel` **4종뿐**이었음. 설치만 하고 안 쓴 상태에 가까웠음.
- 이번에 15종 이상으로 늘림 : `el-card` `el-button` `el-button-group` `el-tag` `el-badge` `el-switch` `el-checkbox` `el-input` `el-slider` `el-radio-group` `el-radio-button` `el-progress` `el-statistic` `el-descriptions` `el-collapse` `el-timeline` `el-result` `el-skeleton-item` `ElMessage` `ElMessageBox`.
- **적용 기준은 "바꿔서 더 나아지는 곳만" 으로 잡음.** 잘 도는 것을 el- 로 갈아끼우는 것 자체가 목적이 되면 코드만 길어짐. 직접 만들기 번거롭거나(슬라이더·확인창), 키보드 조작·접근성을 공짜로 얻는 자리(라디오 그룹·체크박스·접기)를 골랐음.
- 새 npm 패키지는 **하나도 설치하지 않음.** `@element-plus/icons-vue` 도 쓰지 않음. 날씨 아이콘은 OpenWeatherMap 이 이미 주고 있어서 대체 가능했음.

## 2. 슬롯 인터페이스를 지키면서 내부만 갈아끼움
- `BaseDashboardCard.vue` 는 과제 3 요구사항 2번(슬롯으로 공통 껍데기 만들기)의 산출물이라 컴포넌트 자체를 없앨 수 없었음.
- 그래서 컴포넌트를 `el-card` 로 **대체하지 않고**, 껍데기 안쪽만 `el-card` 로 바꾸고 `<slot name="title">` / `<slot>` 인터페이스는 그대로 뒀음.
- 결과 : 이 카드를 쓰는 화면 6개(홈·상세·즐겨찾기·통계·설정·소개)를 **한 줄도 안 고쳤음.** 슬롯으로 인터페이스를 잡아두면 내부 구현을 통째로 바꿔도 부모가 안 흔들린다는 걸 실제로 확인함.

## 3. `v-model` 을 쓰지 않은 자리와 이유
- Element Plus 컴포넌트는 대부분 `v-model` 을 전제로 만들어져 있지만, 두 자리에서는 일부러 `:model-value` + `@input`/`@change` 로 붙였음.
- **스토어 값** (`el-switch` 단위 토글, `el-slider` 미세먼지 경계, `el-radio-group` 체질) : `v-model` 은 state 에 직접 대입하므로 액션을 건너뜀. 과제 5 에서 `setDustGoodMax` 안에 넣어둔 "두 경계가 서로를 넘지 못하게 막는" 보정이 통째로 우회됨. 읽기는 getter, 쓰기는 action 을 유지함.
- **검색 입력** (`el-input`) : 과제 1 요구사항 3번(한글 처리)이 `:value` + `@input` 을 요구함. `v-model` 은 IME 조합이 끝나야 값이 반영돼서 타이핑 도중 검색이 한 박자 늦음. 라이브러리를 쓰면서도 앞 단원 요구사항을 그대로 지킨 자리.
- 반대로 `el-collapse` 의 "어떤 패널이 열려 있는가" 는 화면 안에서만 쓰는 UI 상태라 `v-model` 을 그대로 씀. 스토어 값이 아니라서 원칙과 충돌하지 않음.

## 4. 받아만 두고 안 쓰던 데이터를 화면에 씀
- `api/weather.js` 의 `getCurrentWeather` 가 `icon`(OpenWeatherMap 아이콘 코드, 예: `04n`)을 리턴하고 `weatherStore` 에도 자리가 있었는데, 과제 6 까지 **이걸 그리는 화면이 0곳**이었음.
- 카드와 상세 히어로에 아이콘 이미지를 붙임. 추가 호출이 전혀 없음 - 이미 응답에 들어 있던 값임.
- 상세 히어로 배경은 `icon` 코드 앞 두 자리(01 맑음 / 02~04 구름 / 09·10·11 비 / 13 눈 / 50 안개)로 판정해 `:class` 로 갈아끼움. 색을 CSS 에 박지 않고 **데이터가 클래스를 고르게** 함.
- 폴백(목업) 데이터에는 `icon` 이 없으므로 `v-if` 로 자동으로 걸러짐. 오프라인 상태에서 깨진 이미지가 뜨지 않음.

## 5. 색·타이포를 토큰으로 모으고 화면 톤을 정함
- 과제 6 까지 `#42b883`(브랜드) `#e74c3c`(더움) `#3498db`(선선) `#27ae60` `#f39c12` `#7f4b8b` 같은 값이 `weather.css` · `WeatherCard.vue` · `LifeIndexBar.vue` · `WeatherDetailView.vue` · `WeatherStatsView.vue` · `App.vue` 여섯 파일에 각각 다시 적혀 있었음. 배지 색 하나 바꾸려면 다섯 군데를 고쳐야 했음.
- `base.css` 의 `:root` 에 토큰을 정의하고 전부 `var(--c-*)` 로 치환함.
- **`weather.css` 와 `WeatherCard.vue` 의 중복은 지울 수가 없었음.** `.weather-card` / `.badge*` / `.gauge*` 가 양쪽에 같은 내용으로 있는데, `weather.css` 쪽은 과제 1~3 컴포넌트 16개가 쓰고 있음. 죽은 코드가 아니라 갈라진 코드였음.
- 그래서 중복을 지우는 대신 **양쪽이 같은 변수를 보게** 만듦. 이제 값이 갈라지지 않고, `/legacy` 의 과제 1~3 화면도 새 톤을 따라옴.
- 같은 자리에서 `--el-color-primary` 등 Element Plus 테마 변수도 브랜드 색으로 덮음. 이걸 안 하면 el- 컴포넌트만 기본 파랑(#409EFF)으로 나옴 (트러블슈팅 ts_15).

### 5-1. 참고한 서비스와 톤 결정
- 화면 9개가 한 벌로 보이려면 "색을 변수로 뺐다" 만으로는 부족했음. 어떤 톤을 목표로 하는지가 없으니 카드마다 그림자·반경·글자 크기가 조금씩 달랐음.
- 기준으로 **토스**(큰 숫자 + 넓은 여백 + 회색 배경 위 흰 카드)와 **Vercel 대시보드**(그림자 대신 1px 보더로 카드를 끊고 액센트는 한 색만)를 골랐음. 이유 세 가지.
  1. Element Plus 기본 스타일(연한 보더·회색조)이 이미 같은 계열이라 `--el-*` 변수를 덮는 것만으로 대부분 맞아떨어짐. Linear·Notion 톤으로 가려면 컴포넌트를 뜯어고쳐야 해서 이번 범위를 넘음.
  2. 지금 화면 구성이 카드 그리드(홈·즐겨찾기)와 지표 타일(통계)인데, 이게 두 서비스가 잘 하는 형태와 같음.
  3. 다크 모드를 이번 범위에서 뺐으므로(README3 §9) 라이트 전용으로 완성도가 나오는 쪽이어야 했음.
- 브랜드 색을 Vue 초록(`#42b883`)에서 파랑(`#3182F6`)으로 바꿈. "무채색 화면 + 액센트 한 색" 이 전제인 톤이라 회색 위에서 대비가 안정적인 색이 필요했음. 되돌리려면 `base.css` §2 의 네 줄만 바꾸면 되고 다른 파일은 손댈 필요가 없음 — 토큰을 만든 값이 여기서 나왔음.

### 5-2. 토큰 구조 (원시 → 의미 → 라이브러리)
- `base.css` 를 3층으로 나눔. **원시 팔레트**(회색 9단계 + 색상 6종, hex 는 여기서만) → **의미 토큰**(`--c-brand`, `--c-hot`, `--c-text-*`, `--c-line`) → **Element Plus 변수**(`--el-*`).
- 층을 나눈 이유는 바꾸는 단위가 다르기 때문. 팔레트를 통째로 갈아끼울 때는 1층만, 배지 색 하나를 바꿀 때는 2층만 건드림.
- **토큰 이름은 하나도 바꾸지 않았음.** 이미 여러 파일이 `var(--c-text)` 형태로 참조하고 있어서, 이름을 바꾸면 화면이 한 번에 깨짐. 값만 갈아끼우니 `/legacy` 의 과제 1~3 화면 42장까지 자동으로 따라왔음.
- 색만 있던 토큰에 **간격(8단계)·반경·타이포 스케일**을 추가함. 과제 6 까지는 `font-size: 13px` 같은 값이 화면마다 흩어져 있어서 같은 역할의 글자가 12px·13px·14px 로 제각각이었음.

### 5-3. 톤을 만든 규칙 4가지
- **그림자 대신 보더.** 카드가 화면 9개에 수십 장 깔리는데 그림자를 쓰면 스크롤할 때 지저분해짐. `--shadow-1/2` 는 이름을 남기되 값을 거의 0 으로 낮춤. 지우면 그걸 쓰던 4곳이 깨지고, 값을 낮추면 그 4곳도 새 톤을 따라옴.
- **hover 에서 카드를 띄우지 않음.** `translateY(-2px)` + 그림자를 테두리·배경 변화로 바꿈. 3열 그리드에서 마우스가 지나갈 때마다 칸이 들썩이면 목록을 훑기 어려움 (트러블슈팅 ts_22).
- **숫자가 주인공.** 홈 카드 기온 28px(`--fs-h1`), 상세 히어로 44px(`--fs-display`). 히어로가 카드보다 확실히 커야 "목록 → 상세" 로 들어왔다는 느낌이 남. 자동 갱신 때 숫자 폭이 달라져 화면이 흔들리는 문제는 `tabular-nums` 로 잡음 (ts_23).
- **본문은 가장 진한 회색을 쓰지 않음.** 텍스트 4단계 중 900 은 숫자·제목에만 쓰고 본문은 700 을 씀. 큰 숫자가 저절로 앞으로 나옴.

### 5-4. 남긴 것
- 상세 히어로의 날씨별 배경 그라데이션 5개(맑음·흐림·비·눈·안개)는 hex 로 남김. 팔레트가 아니라 날씨 상태를 나타내는 삽화라서 회색조 토큰으로 바꾸면 의미가 사라짐.
- 폰트는 `Pretendard` 를 스택 맨 앞에 두되 **설치하지 않음.** 새 패키지를 넣지 않는다는 이번 단원 원칙(README3 §9) 유지. 설치된 환경이면 잡히고 아니면 시스템 폰트로 자연히 넘어감.

## 6. 검색어를 단방향으로 정리
- 과제 6 까지는 `onMounted` 에서 `주소 → 상태`, `watch` 에서 `상태 → 주소` 로 양쪽으로 흘렀음. 값 하나에 저장소가 둘이고 서로를 갱신하는 구조.
- 동작에는 문제가 없었지만 뒤로가기로 주소가 바뀌면 화면이 안 따라왔음. `onMounted` 는 처음 한 번만 돌기 때문.
- **주소창 하나를 원본으로 정하고 화면은 파생만 하게** 바꿈.
  ```js
  const searchQuery = computed(() => String(route.query.search ?? ''))
  const handleUpdateQuery = (q) =>
    router.replace({ path: route.path, query: { search: q || undefined } })
  ```
- 흐름이 `입력 → router.replace → route.query → computed → 화면` 한 방향이 되면서 복원 코드와 동기화 `watch` 가 둘 다 사라졌음. 코드가 줄었는데 기능은 늘었음(뒤로가기가 이제 맞음).
- 강사님 참고 파일 같은 자리에도 `onMounted` + `watch` 조합이 있고 "KeepAlive 를 적용해야만 동작함" 이라는 주석이 달려 있는데, 원본을 하나로 정하면 KeepAlive 없이 해결되는 문제였음.
- 과제 2 요구사항 3의 `watchEffect` 로그는 그대로 동작함. 반응형 소스가 `ref` 든 `computed` 든 `watchEffect` 는 읽은 것을 알아서 의존성으로 잡음.

## 7. 데이터를 받아오는 지점을 한 곳으로
- 과제 6 까지 `weatherStore.fetchAll()` 을 `WeatherHomeView` / `FavoritesView` / `WeatherStatsView` / `SettingsView` 네 화면이 각자 `onMounted` 에서 불렀음. 캐시 덕에 중복 호출은 안 났지만 "언제 받아오는가" 를 아는 곳이 네 곳이었음.
- `App.vue` 의 `onMounted` 한 곳으로 올림. 이제 각 화면은 스토어를 **읽기만** 함.
- 데이터 흐름이 `App.vue(1회 요청) → weatherStore → 각 화면(읽기 전용)` 한 줄이 됨.
- 상세의 `ensureCity(cityId)` 는 그대로 둠. "이 도시만 없으면 채운다" 라서 역할이 다름.
- 10분 자동 갱신(`useIntervalFn`)도 홈에 남겨둠. `App.vue` 로 올리면 보지도 않는 화면 때문에 호출 한도를 쓰게 됨.
- `Promise.all` / `Promise.allSettled` 는 그대로 둠. 근거는 아래 13번에 따로 정리함.

## 8. 같은 계산을 두 화면이 나눠 쓰게 함
- 홈 상단에 요약 타일(평균 기온·평균 습도·가장 더운 곳·미세먼지 나쁨)을 넣으면서, 통계 화면에 있던 계산식을 복사할 뻔했음.
- 복사하면 평균 구하는 방식이 두 곳에 생겨서 나중에 갈라짐. `weatherStore` 에 `summary` getter 를 만들고 홈과 통계가 **같은 것을 읽게** 함.
- 단, "미세먼지 나쁨 개수" 는 `summary` 에 넣지 않았음. 그 판정 기준(`dustBadMin`)은 사용자가 설정 화면에서 정하는 값이라 `configStore` 소관이고, `weatherStore` 가 `configStore` 를 끌어다 쓰면 스토어끼리 얽힘. 등급이 걸린 집계만 화면에서 셈.

## 9. 레이아웃
- 카드 목록을 세로 1열 → `repeat(auto-fill, minmax(280px, 1fr))` 그리드로 바꿈. 미디어쿼리 없이 폰 1열 / 태블릿 2열 / 데스크톱 3열이 됨.
- 상세 화면은 히어로(아이콘 + 큰 기온 + 날씨별 배경)를 위에 두고, 관측 항목 `<table>` 6행을 `el-descriptions` 로, 시간별 예보를 가로 스크롤 카드로 바꿈. 도시 이동 버튼을 맨 아래에서 히어로 옆으로 올려서 스크롤 없이 옆 도시로 넘어갈 수 있게 함.
- 스켈레톤을 카드 그리드와 같은 격자 모양으로 맞춤. 과제 6 의 `el-skeleton :rows="4"` 는 실제 카드와 안 닮아서 로딩→완료 때 화면이 튀었음.
- 라우트 전환에 `<Transition name="route-fade" mode="out-in">` 을 얹음. Vue 빌트인이라 라이브러리 추가가 없고, 참고 파일 `App.vue.exercise` 에 `RouterView v-slot` + `KeepAlive` 조합이 주석으로 들어 있어서 형태 자체는 배운 범위 안임.

## 10. 스캐폴드 잔재를 걷어냄
- `assets/main.css` 에 `create-vue` 가 준 `@media (min-width: 1024px)` 규칙이 그대로 남아 `body` 를 flex, `#app` 을 2열 그리드로 만들고 있었음. `#app` 의 자식은 `.practice-container` 하나뿐이라 왼쪽 칸만 채우고 오른쪽 절반이 영구 공백이었음.
- `practice.css` 의 `.practice-container` 는 `max-width: 1200px` 뒤에 `width: 800px` 이 와서 `max-width` 가 무력화돼 있었음. 어떤 화면에서도 본문이 800px 고정이었고, 뷰포트 800px 에서 실측하니 `scrollWidth 832 / clientWidth 785` 로 **47px 가로 스크롤**이 생겼음.
- 둘 다 정리해서 `width: 100% / max-width: 1180px / padding-inline: 16px` 로 바꿈. 측정해보니 모든 라우트에서 가로 넘침 0.
- 과제 1 때는 화면이 하나뿐이라 안 보이던 문제였음. view 가 9개로 늘고 카드 그리드를 넣으면서 비로소 드러남.

## 11. 제출 준비 (ESLint / Build)
- `npm run lint` : oxlint 0 warning / 0 error, eslint 0 warning / 0 error.
  - `WeatherComposition.vue` 의 쓰지 않는 `oldVal` 파라미터 하나가 error 로 남아 있어서 제거함.
  - 강사님 참고 폴더(`skala-vue-main/`)가 린트 대상에 들어와 그쪽 warning 2건이 섞이고 있었음. `eslint.config.js` 의 `globalIgnores` 에 추가함. 내가 고칠 대상이 아닌 코드가 내 린트 결과를 흐리면 안 됨.
  - 같은 이유로 `.gitignore` 에 `skala-vue-main/`, `skala-vue-main.zip`, `Vue.pdf` 를 넣음. 배포에도 안 들어가고 내 결과물도 아님.
- `npm run build` : 성공. 메인 번들 **941.51 kB (gzip 301.66 kB)**.
  - 과제 6 때 기록해둔 937KB 와 거의 같음. Element Plus 를 4종에서 15종 이상으로 늘렸는데 **4KB 밖에 안 늘었음.**
  - `app.use(ElementPlus)` 로 전체를 등록하고 있어서 비용이 이미 다 지불된 상태였기 때문. 바꿔 말하면 4종만 쓰던 과제 6 이 가장 손해였음.
  - 온디맨드 등록(필요한 것만 개별 import)으로 줄일 수 있지만 이번엔 하지 않음. 컴포넌트를 하나 더 쓸 때마다 import 두 줄(JS + CSS)을 같이 추가해야 해서 지금 단계에서는 빠뜨리기 쉬움. 화면이 확정된 뒤에 정리하는 게 순서가 맞다고 봄.

## 12. 확인한 것
- 9개 라우트를 전부 열어 가로 넘침 0, 콘솔 에러 0 확인.
- 홈에서 도시 카드 6장에 아이콘이 붙고, 그리드가 화면 폭에 따라 열 수를 바꿈.
- 상세에서 `icon` 코드에 따라 히어로 배경이 갈림 (서울 `04n` → 구름 테마).
- 설정에서 슬라이더를 움직이면 대시보드·통계의 판정이 같이 바뀌고, 새로고침해도 유지됨.
- `/weather/city_99` 는 `el-result` 안내로, 없는 주소는 404 화면으로 각각 떨어짐.
- `/legacy` 의 과제 1~3 화면(카드 42장)이 그대로 살아 있고 색만 새 토큰을 따라옴.
- 톤 적용 후 브라우저에서 실측 : 카드 배경 `#FFF` / 보더 `#E5E8EB` / 반경 12px / **box-shadow none**, 홈 기온 28px·tabular-nums, 상세 히어로 기온 44px, 요약 타일 20px·tabular-nums.
- `/legacy` 도 같이 확인 : h1 28px, `hr` 1px 실선, 배지 `rgb(240, 68, 82)`(`--c-hot`), 상태바가 초록에서 파랑 계열로 전환됨.
- `el-progress` 와 `el-timeline` 의 `:color` 에 넘긴 `var(--c-*)` 문자열이 실제로 해석되는 것을 계산된 색으로 확인함 (게이지 `rgb(14, 165, 233)`, 타임라인 5개 노드 각각).
- 375px 뷰포트에서 상세 히어로 기온이 28px 로 내려가고 가로 넘침 0 (`scrollWidth === clientWidth === 375`).
- `src` 전체 hex 전수 조사 : 날씨 삽화 그라데이션 5개를 제외하고 0건.

## 13. axios 호출 형태 (단축 메서드 / 병렬 요청)
- 슬라이드 `Axios - Method List` 의 메모 "가능하면 병렬요청을 사용하지 않고 코드를 짜보면 더 좋을 듯" 이 가리키는 건 표의 **병렬 요청** 행, 즉 `axios.all([...])` 과 `axios.spread(callback)` 임.
- 점검 결과 이 프로젝트에는 **`axios.all` / `axios.spread` 가 0건**임. API 함수 5개가 전부 **HTTP 단축 메서드**(`owmClient.get(...)` / `openMeteoClient.get(...)`)로 되어 있고, `axios({ method: 'get', url: ... })` 같은 config 호출 형태도 쓰지 않음.
- 단축 메서드를 고른 이유는 `api/weather.js` 가 "어떤 주소로 무엇을 물어볼지" 만 아는 층이기 때문. `.get(경로, { params })` 형태면 그 한 줄만 읽어도 무엇을 조회하는지가 드러나고, method 를 config 객체 안에 넣으면 한 겹 더 들어가야 보임.
- 남아 있는 `Promise.all` 3곳(`fetchCity`, `fetchAll`, `WeatherHomeView` 의 내 위치)은 **표준 JavaScript** 이지 axios 의 병렬 요청 API 가 아니라서 메모의 대상이 아니라고 판단하고 유지함. 근거 세 가지.
  1. **성능** : 실측함. 대시보드 첫 로딩에 나가는 요청이 19개, 평균 응답 693ms. 전부 순차로 바꾸면 합계 **13.2초**가 됨(현재 1.2~2초). 화면을 열 때마다 13초를 기다리는 쪽이 잃는 게 더 큼.
  2. **`allSettled` 는 성능 장치가 아니라 기능 장치임** : `fetchAll` 은 실패한 도시 **개수를 세서** 폴백 여부를 정함. 전부 실패하면 목업으로 내려앉고 일부만 실패하면 알림만 띄움. 순차 `await` 는 첫 실패에서 멈추므로 이 로직을 처음부터 다시 짜야 함.
  3. **흐름의 방향과 무관함** : `Promise.all` 은 값이 어디서 어디로 흐르는지를 바꾸지 않고 "몇 개를 동시에 기다리는가" 만 정함. 과제 7 에서 정리한 단방향 원칙과는 다른 축의 이야기임.
- 정리하면 **axios 가 제공하는 병렬 요청 API 는 쓰지 않고, 표준 Promise 만 필요한 자리에 씀.**

## 14. 나만의 추가 - 날씨가 화면 배경이 되는 연출
- 상세 페이지에 들어가면 **그 도시의 실제 날씨가 화면 전체 배경**이 됨. 비가 오면 빗줄기가 내리고, 눈이 오면 눈이 날리고, 흐리면 구름이 흘러감.
- **추가 API 호출 0회.** 과제 6 부터 이미 받아오고 있던 `icon` 코드 하나만 쓴다. 코드는 "앞 두 자리 = 날씨 종류, 마지막 한 자리 = d(낮)/n(밤)" 구조라, 이 값 하나로 **6종 × 낮밤 = 12가지** 상태가 나옴.

| icon 앞 두 자리 | 종류 | 연출 |
|---|---|---|
| `01` | clear | 햇빛 속 먼지처럼 오르내리는 점 (밤이면 반짝이는 별로 바뀜) |
| `02`~`04` | cloud | 흐릿한 큰 덩어리가 가로로 아주 느리게 흐름 |
| `09`,`10` | rain | 가는 빗줄기가 아래로 |
| `11` | storm | 빗줄기 + 9초에 한 번 화면이 짧게 두 번 번쩍임 |
| `13` | snow | 동그란 눈이 좌우로 밀리며 천천히 |
| `50` | fog | 반투명 띠가 옆으로 아주 느리게 |

### 왜 이렇게 만들었나
- Vue.pdf p.6 의 **"데이터 → 조건/바인딩 → 화면 변화까지 이어지게"** 와 **"색상을 하드코딩하지 않고 `:class`/`:style` 로 동적 표현"** 지침을 가장 크게 적용한 자리임. 색을 CSS 에 박아두고 고르는 게 아니라, API 값이 클래스와 스타일을 직접 고름.
- 입자는 `v-for` 로 만들고 위치·속도·투명도·크기를 `:style` 로 **하나씩 다르게** 물림. 전부 같은 값이면 줄이 맞아서 비가 아니라 창살처럼 보임. 난수는 `computed` 안에서 뽑으므로 날씨 종류가 바뀔 때만 다시 생성되고, 기온이 갱신되는 정도로는 다시 계산되지 않음.
- 입자 개수는 비 70 / 뇌우 90 / 눈 45 / 구름 7 / 안개 5 / 맑음 12. 눈으로 보면서 정한 값이고, 늘리면 그럴듯해지지만 DOM 이 그만큼 늘어남.

### 판정식을 한 곳에 둔 이유
- 상세 히어로의 그라디언트와 화면 전체 배경이 **같은 날씨로 갈려야** 함. 두 곳에 각각 `if` 문을 두면 나중에 한쪽만 고쳐서 히어로는 비인데 배경은 구름인 상태가 됨.
- `src/data/weatherKind.js` 에 `getWeatherKind(icon)` / `isNightIcon(icon)` 순수 함수로 빼고 양쪽이 같은 함수를 부름. `data/lifeIndex.js` 와 같은 자리, 같은 성격의 파일임.
- 이 과정에서 과제 7 초반에 만들었던 히어로의 `if` 문 6줄이 `` `hero-${getWeatherKind(...)}` `` 한 줄로 줄었음. 겸사겸사 뇌우(`11`)가 비와 한 덩어리로 묶여 있던 것도 분리해서 `hero-storm` 을 따로 만듦.

### 성능을 위해 지킨 것
- **`transform` 과 `opacity` 만 애니메이트함.** `top`/`left` 를 움직이면 매 프레임 레이아웃을 다시 계산해서 입자가 많아질수록 눈에 띄게 끊김. `translate3d` 로 GPU 합성에 넘김.
- 입자 90개마다 `@keyframes` 를 따로 만들 수는 없으므로, **애니메이션은 하나만 두고 값만 CSS 변수로 주입**함. 예를 들어 눈의 좌우 밀림은 `--drift` 를 `:style` 로 내려보내고 keyframes 안에서 `translate3d(var(--drift), 115vh, 0)` 로 읽음.
- 음수 `animation-delay` 를 줘서 화면에 들어온 순간 이미 떨어지는 중이게 함. `0` 부터 시작하면 처음 1초간 화면 위쪽이 비어서 "이제 비가 시작됩니다" 처럼 보임.
- 빌드 결과 메인 번들은 941.51 → 941.54 kB 로 사실상 그대로고, 늘어난 3.2 kB 는 상세 화면 CSS 청크에만 들어감. 상세 페이지는 Lazy Loading 대상이라 첫 화면 로딩에 영향이 없음.

### 접근성
- `@media (prefers-reduced-motion: reduce)` 로 **입자를 아예 감추고 하늘 톤만 남김.** 움직이는 배경에 어지러움이나 멀미를 느끼는 사람이 있고, 운영체제에 "동작 줄이기" 설정이 있음. 이 경우에도 날씨 정보는 배경 색으로 그대로 전달됨.
- `pointer-events: none` 과 `aria-hidden="true"` 를 줌. 배경이 클릭을 가로채면 그 아래 버튼이 안 눌리고, 스크린리더가 의미 없는 빈 요소 90개를 읽으면 안 됨.
- 본문에 `z-index: 1` 을 줘서 빗줄기가 글자 위로 지나가지 않게 함.

### 확인한 것
- `getWeatherKind` 를 13개 코드 + 잘못된 입력 5가지로 검사함. `null`/`undefined`/빈 문자열/모르는 코드는 전부 `unknown` 으로 떨어지고, 그때는 컴포넌트가 아무것도 그리지 않음. **폴백(목업) 데이터에는 `icon` 이 없으므로 통신이 끊긴 상태에서는 배경 연출이 자동으로 꺼짐.**
- 서울(`10n`, 밤비) 진입 시 빗줄기 70개가 각각 다른 `left`/`animation-delay`/`animation-duration`/`opacity` 를 갖고 생성되는 것과, 히어로(`hero-rain`)와 배경(`bd-rain`)이 같은 날씨로 갈리는 것을 확인함.
- 배경 위에서 네비게이션 링크와 히어로 버튼이 정상적으로 클릭 대상으로 잡히는 것을 확인함(`pointer-events: none` 동작).

## 15. 개발용 배경 미리보기
- 14번의 배경 연출은 실제 관측값(`icon`)을 따라간다. 그런데 도시 6곳이 전부 비슷한 날씨면 **눈·안개·뇌우 배경을 영영 확인할 수 없다.** 날씨가 바뀌기를 기다리거나 API 응답을 손으로 고쳐가며 보는 건 방법이 아니라서 도구를 만듦.
- 상세 화면 상단(개발 중에만 보임)에서 날씨 6종과 낮/밤을 눌러 배경을 강제할 수 있음. 주소로도 직접 지정 가능.
  ```
  /weather/city_01?preview=13n   → 밤에 내리는 눈
  /weather/city_01?preview=11d   → 낮 뇌우
  ```

### 상태를 하나도 안 늘린 방법
- **주소창을 원본으로 씀.** 6번(검색어)에서 쓴 것과 같은 구조다. `?preview=` 를 `computed` 로 읽고, 버튼을 누르면 상태가 아니라 `router.replace` 로 주소를 고침. `ref` 를 따로 두면 값이 두 곳에 생기고 뒤로가기에서 어긋남.
- 화면이 실제로 쓰는 아이콘을 `displayIcon` computed 하나로 모음(`미리보기 값 ?? 관측값`). 히어로 그라디언트 · 히어로 아이콘 이미지 · 화면 배경 셋이 전부 이 하나만 봄. 미리보기를 켜면 세 개가 동시에 갈림.
- `WeatherPreviewSwitch` 는 상태를 갖지 않음. 지금 무엇이 선택돼 있는지도 `props(currentIcon)` 에서 파생시키고, 고른 값은 `emit` 으로 부모에게 올림. `SearchBar` 가 검색어를 다루는 방식과 같은 형태.
- 아는 아이콘 코드일 때만 통과시킴. `?preview=아무거나` 를 붙이면 `unknown` 으로 떨어져 무시되고 관측값으로 돌아감.

### 배포 빌드에서 빼는 방법
- `import.meta.env.DEV` 는 Vite 가 빌드할 때 `false` 로 치환한다. 그래서 `previewIcon` computed 는 배포본에서 항상 `null` 이고, 주소에 `?preview=` 를 붙여도 아무 일도 일어나지 않음.
- 다만 **정적 `import` 로 컴포넌트를 가져오면 렌더되지 않을 뿐 코드는 번들에 그대로 들어감.** 그래서 동적 import 를 삼항 안에 뒀음.
  ```js
  const WeatherPreviewSwitch = import.meta.env.DEV
    ? defineAsyncComponent(() => import('@/components/exercise/WeatherPreviewSwitch.vue'))
    : null
  ```
  prod 에서는 조건이 `false` 로 굳으면서 이 `import()` 에 닿을 길이 사라지고, 번들러가 청크째로 들어냄.
- 빌드 후 `dist` 를 검색해서 확인함.

| 검색어 | 배포 빌드 |
|---|---|
| `preview-switch` (컴포넌트 CSS 클래스) | 0건 |
| `관측값으로 되돌리기` (컴포넌트 버튼 문구) | 0건 |
| `KIND_ICON_CODE` (미리보기 전용 매핑) | 0건 |
| `배경 미리보기` (부모 화면의 알림 문구) | 1건 |

- `WeatherPreviewSwitch-*.js` 청크 자체가 생성되지 않았고, 메인 번들도 941.54 kB 로 그대로임.
- 마지막 1건은 상세 화면 템플릿에 있는 알림 문구다. `isPreviewing` 이 배포본에서 항상 `false` 라 **화면에 뜨지 않는 죽은 문자열**이고, Vue 가 템플릿을 렌더 함수로 컴파일하면서 문자열만 남긴 것이라 없애려면 마크업을 통째로 들어내야 함. 20바이트라 그대로 둠. 숨기지 않고 여기 적어둠.

### 미리보기 중이라는 걸 화면에 밝힘
- 배경·히어로 아이콘만 바뀌고 기온·습도 같은 표의 숫자는 실제 관측값 그대로다. 그래서 미리보기가 켜져 있으면 경고 알림을 띄워 어떤 코드로 보고 있는지 표시함. 안 그러면 스크린샷을 찍어두고 나중에 진짜 날씨로 착각하게 됨.

### 확인한 것
- 6종 × 낮밤이 전부 의도대로 갈림. `01d` clear 12개 / `01n` clear+night / `04d` cloud 7개 / `10d` rain 70개 / `11n` storm+night 90개 / `13d` snow 45개 / `50d` fog 5개.
- `?preview=99z` 처럼 모르는 코드를 넣으면 무시되고 실제 관측값으로 그려짐.
- 쿼리를 지우면 관측값으로 돌아가고, 이때 서울이 `04d`(낮 구름)로 나옴. 확인 시각이 오전이라 `d` 가 맞았음 — 낮/밤 판정이 실제 데이터에서도 동작하는 걸 확인함.
