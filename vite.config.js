import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
// 과제 6. 함수 형태로 바꾼 이유 : mode 를 받아 환경변수를 읽어야 해서다.
// 이 파일은 브라우저가 아니라 Node 에서 실행되므로 키를 다뤄도 안전하다.
export default defineConfig(({ mode }) => {
  // 세 번째 인자 '' 는 "접두사 제한 없이 전부 읽어라". 기본값은 'VITE_' 라서 OWM_API_KEY 를 못 읽는다.
  const env = loadEnv(mode, process.cwd(), '')

  // 개발 중에는 Vercel 서버리스 함수(api/owm)가 실행되지 않는다.
  // 그래서 Vite 개발 서버가 같은 역할을 대신한다 - 브라우저가 보는 주소(/api/owm/...)는 배포 후와 똑같고,
  // 키를 붙이는 주체만 상황에 따라 달라진다.
  const owmProxy = {
    target: 'https://api.openweathermap.org',
    changeOrigin: true,
    rewrite: (path) => {
      const [pathname, search = ''] = path.replace(/^\/api\/owm/, '').split('?')
      const params = new URLSearchParams(search)
      params.set('appid', env.OWM_API_KEY)
      return `${pathname}?${params}`
    },
  }

  return {
    plugins: [
      vue(),
      vueDevTools(),
      // 과제 8. Element Plus 온디맨드 등록.
      //
      // 과제 7 까지는 main.js 에서 app.use(ElementPlus) 로 전체를 등록했다. 화면을 만드는 동안에는
      // 컴포넌트를 하나 더 쓸 때마다 import 두 줄(JS + CSS)을 같이 추가해야 하는 개별 등록보다
      // 빠뜨릴 여지가 적어서 그렇게 뒀는데, 화면이 확정된 지금은 그 대가만 남는다.
      // 실측(과제 8 시점): index.js 941KB / index.css 374KB. 이 프로젝트가 실제로 쓰는 el- 태그는 26종이고
      // Element Plus 는 80종이 넘으므로, 안 쓰는 쪽이 번들의 대부분이었다.
      //
      // 이 플러그인은 템플릿을 훑어 <el-xxx> 를 찾고 그 컴포넌트와 CSS 만 자동으로 import 문으로 바꿔 넣는다.
      // 개별 등록의 이득(쓰는 것만 들어감)을 가져오면서 "import 를 빠뜨린다" 는 위험은 없앤다.
      // 템플릿에 안 쓰고 코드에서 직접 부르는 ElMessage / ElMessageBox 는 플러그인이 볼 수 없으므로
      // 해당 화면에서 계속 명시적으로 import 한다(스타일도 그 옆에서 같이 부른다).
      Components({
        resolvers: [ElementPlusResolver()],
        // 자동 생성되는 타입 선언 파일. JS 프로젝트라 필요 없고, 저장소에 잡동사니만 남는다.
        dts: false,
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // 과제 8. 공통 청크 이름 정리.
    // 이 옵션을 한 번도 건드리지 않았을 때는 vue/pinia/router 가 들어간 74KB 짜리 공통 청크가
    // configStore-CKgBNols.js 라는 이름으로 나왔다. Rollup 이 청크 이름을 "그 안에 들어간 모듈 중
    // 알파벳 순으로 처음 만난 것" 에서 물려받기 때문인데, dist 를 열어본 사람은 스토어 파일이
    // 74KB 라고 읽게 된다. 이름만 거짓말을 하는 상태였다.
    //
    // element-plus 는 일부러 여기서 묶지 않는다. 지금은 컴포넌트별로 잘게 쪼개져서
    // 캐러셀·타임라인처럼 특정 화면에서만 쓰는 것은 그 화면에 들어갈 때 내려받는다.
    // 한 덩어리로 묶으면 이름은 예뻐지지만 첫 화면이 안 쓰는 컴포넌트까지 같이 받게 된다.
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Windows 에서는 경로 구분자가 역슬래시로 들어온다. 한 종류로 맞춰놓고 판정한다.
            const path = id.split('\\').join('/')
            if (!path.includes('/node_modules/')) return
            if (
              /\/node_modules\/(@vue|vue|vue-router|pinia|pinia-plugin-persistedstate)\//.test(path)
            ) {
              return 'vendor-vue'
            }
            if (/\/node_modules\/(axios|dayjs|@vueuse)\//.test(path)) return 'vendor-utils'
            // echarts 는 여기서 묶지 않는다. manualChunks 로 이름을 붙이면 그 청크가 엔트리의
            // 정적 의존성으로 끌려 올라가서(index.html 에 modulepreload 로 박힌다), 차트를 쓰지 않는
            // 첫 화면이 627KB(gzip 215KB)를 같이 받게 된다. 실제로 그렇게 나가고 있었다.
            // 지금은 규칙을 두지 않고 자동 분할에 맡긴다 - 차트를 쓰는 화면이 둘 다 지연 로딩
            // 라우트(stats / weather/:cityId)라서, 공유 청크가 그 두 화면에 들어갈 때 처음 내려간다.
            // 아래 chunkFileNames 가 그 청크에 vendor-chart 라는 이름만 따로 붙여준다.
          },
          // 자동 분할이 만든 공유 청크는 "안에 들어간 모듈 중 알파벳 순으로 처음 만난 것" 에서
          // 이름을 물려받는다. echarts 가 들어간 550KB 짜리 청크가 chartTheme-*.js 로 나오는 이유다.
          // 위 주석의 configStore 사례와 같은 문제라, 이름만 실제 내용에 맞게 바로잡는다.
          chunkFileNames(chunkInfo) {
            // moduleIds 는 배열이다(객체가 아니다). Object.keys 로 읽으면 경로가 아니라 인덱스가 나온다.
            const hasChart = (chunkInfo.moduleIds ?? []).some((id) =>
              /[\\/]node_modules[\\/](echarts|zrender|vue-echarts)[\\/]/.test(id),
            )
            return hasChart ? 'assets/vendor-chart-[hash].js' : 'assets/[name]-[hash].js'
          },
        },
      },
    },

    // npm run dev 용
    server: {
      proxy: { '/api/owm': owmProxy },
    },
    // npm run preview 용 (빌드 결과물을 로컬에서 확인할 때)
    preview: {
      proxy: { '/api/owm': owmProxy },
    },

    // 과제 8. vitest.
    // 화면을 붙잡고 흔들어 보는 대신, 화면이 읽는 값을 만드는 쪽을 검사한다.
    // 대상은 이미 순수 함수로 분리해 둔 세 곳이다 - 생활지수 계산(data/lifeIndex.js),
    // 미세먼지 등급 경계(configStore), 도시 집계(weatherStore.summary).
    // 셋 다 눈으로는 틀린 것을 알아채기 어려운 종류다. 점수가 몇 점 어긋나도 화면은 그럴듯하게 그려진다.
    //
    // environment 는 'node'. DOM 을 만들지 않는다 - 여기서 검사하는 것 중 화면을 필요로 하는 것이 없다.
    test: {
      environment: 'node',
      include: ['src/**/*.spec.js'],
    },
  }
})
