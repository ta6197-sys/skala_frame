import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from 'eslint-config-prettier/flat'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,js,mjs,jsx}'],
  },

  // 과제 7. skala-vue-main 은 강사님이 나눠준 참고 소스라 내가 고칠 대상이 아니다.
  // 그대로 두면 그쪽 warning 이 내 린트 결과에 섞여서 "Error 0" 판단이 흐려진다.
  // (Vue.pdf p.14 : ESLint 로 점검하여 제출 과제의 Error 를 없도록 한다)
  globalIgnores([
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    'skala-vue-main/**',
  ]),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  {
    // 과제 6. 이 파일들만 브라우저가 아니라 Node 에서 실행된다.
    // 서버리스 함수와 Vite 설정은 process.env 로 API 키를 읽으므로 Node 전역이 필요하다.
    // 반대로 말하면, 여기 적힌 파일 외에는 process 를 쓸 수 없다 - 키가 브라우저 코드로 새는 걸 린트가 막아준다.
    name: 'app/server-files',
    files: ['api/**/*.js', 'vite.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
])
