// import 순서가 중요하다. 아래 두 줄의 순서를 바꾸면 화면 색이 통째로 달라진다.
//
// Element Plus 도 우리 base.css 도 둘 다 `:root { ... }` 에 변수를 정의한다. 선택자 우선순위가 같으므로
// "나중에 불린 쪽" 이 이긴다. 그래서 Element Plus 의 변수 정의를 먼저 깔고,
// 그 위에 base.css 가 --el-color-primary 등을 브랜드 초록으로 덮어쓰게 한다.
//
// 과제 6 까지는 main.css 가 먼저였다. 그때는 el- 컴포넌트를 4개만 써서 눈에 안 띄었는데,
// 과제 7 에서 버튼·슬라이더·태그·프로그레스를 붙이자 화면 절반이 Element Plus 기본 파랑(#409EFF)으로 나왔다.
//
// 과제 8. 온디맨드로 바꾸면서 dist/index.css(374KB, 전체) -> theme-chalk/base.css 로 좁혔다.
// 컴포넌트별 CSS 는 이제 각 컴포넌트가 자기 파일에서 불러온다(vite.config.js 의 Components 플러그인).
// 그 파일들에는 `:root` 정의가 없고 --el-* 를 참조만 하므로, 여기서 base.css 를 먼저 잡아두면
// 순서 문제는 그대로 해결된다. ES 모듈은 한 번만 평가되므로 나중에 누가 다시 import 해도 자리는 여기다.
import 'element-plus/theme-chalk/base.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 과제 8. app.use(ElementPlus) 가 여기서 사라졌다.
// 전역 등록 = "80종 전부 번들에 넣고 그중 26종을 쓴다" 였다. 지금은 vite.config.js 의
// unplugin-vue-components 가 템플릿에 실제로 등장한 태그만 골라 import 문으로 바꿔 넣는다.
// 등록하는 코드가 없어졌을 뿐 화면에서 쓰는 방식(<el-button> 을 그냥 쓴다)은 똑같다.

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
