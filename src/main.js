// 과제 7. import 순서가 중요하다. 아래 두 줄의 순서를 바꾸면 화면 색이 통째로 달라진다.
//
// Element Plus 도 우리 base.css 도 둘 다 `:root { ... }` 에 변수를 정의한다. 선택자 우선순위가 같으므로
// "나중에 불린 쪽" 이 이긴다. 그래서 element-plus/dist/index.css 를 먼저 불러 기본값을 깔고,
// 그 위에 base.css 가 --el-color-primary 등을 브랜드 초록으로 덮어쓰게 한다.
//
// 과제 6 까지는 main.css 가 먼저였다. 그때는 el- 컴포넌트를 4개만 써서 눈에 안 띄었는데,
// 과제 7 에서 버튼·슬라이더·태그·프로그레스를 붙이자 화면 절반이 Element Plus 기본 파랑(#409EFF)으로 나왔다.
// README2 §9 에 "Element Plus 컴포넌트를 추가로 붙일 때 기존 CSS 와 톤이 어긋나는지 확인할 것" 이라고
// 적어둔 지점이 실제로 문제가 된 자리다.
import 'element-plus/dist/index.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 과제 7. 전체 등록을 유지한다.
// 번들이 커지는 건 알고 있지만(README2 §9 기록: 937KB), 이번 단원의 요구가 "UI 라이브러리를 자유롭게 적용" 이라
// 쓰는 컴포넌트를 계속 늘려가는 상황이다. 필요한 것만 개별 등록하는 방식은 컴포넌트를 하나 더 쓸 때마다
// import 두 줄(JS + CSS)을 같이 추가해야 해서, 지금 단계에서는 빠뜨리기 쉬운 쪽이다.
// 화면이 확정된 뒤에 정리하는 게 순서가 맞다.
app.use(ElementPlus)

// 과제 5. 피니아 인스턴스를 앱 전역에 주입한다. 이 줄이 있어야 useXxxStore() 를 어디서든 호출할 수 있다.
// 과제 6. 여기에 persistedstate 플러그인을 얹었다. 스토어별로 persist: true 를 켜면 그 스토어의 state 가 localStorage 에 자동 저장된다.
// 단위·내 기준·즐겨찾기·최근 본 도시는 새로고침해도 남아야 하지만, 날씨(weatherStore)는 저장하지 않는다.
// 어제 받아온 기온을 오늘 화면에 그대로 띄우게 되기 때문이다.
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

// 과제 4. 라우터 인스턴스를 앱 전역에 주입한다.
// 이 한 줄 덕분에 모든 컴포넌트에서 <RouterLink>/<RouterView> 와 useRoute()/useRouter() 를 쓸 수 있다.
app.use(router)

app.mount('#app')
