import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

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
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
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
  }
})
