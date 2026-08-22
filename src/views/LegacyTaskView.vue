<script setup>
// 과제 4 로 App.vue 가 라우터 껍데기가 되면서, 기존 App.vue 가 그리던 과제 1~3 화면을
// 그대로 이 view 로 옮겨 /legacy 경로에서 계속 확인할 수 있게 했다. (import 경로만 '@/' 로 변경)

// 과제 3. 날씨 (Component) - 기능 변경 없이 4개 + 추가 컴포넌트로 분리한 버전
import WeatherParent from '@/components/exercise/weather3/WeatherParent.vue'

// 0. 통합 완성본 (제출용, 요구사항 1~5 를 한 화면에 합침)
import WeatherComposition from '@/components/exercise/WeatherComposition.vue'

// 1. 반응형 상태 관리
import WeatherState from '@/components/exercise/WeatherState.vue'

// 2. 검색 도시 (computed 활용)
import WeatherFilterComputed from '@/components/exercise/WeatherFilterComputed.vue'

// 3. 반응형 변수 변화 감시 (watch, watchEffect)
import WeatherWatcher from '@/components/exercise/WeatherWatcher.vue'

// 4. 검색 결과 표시 (Template 영역)
import WeatherSearchResult from '@/components/exercise/WeatherSearchResult.vue'

// 5. 본인 데이터 기반 기능 추가
import WeatherFavoriteCount from '@/components/exercise/WeatherFavoriteCount.vue'
</script>

<template>
  <div>
    <h3>이전 과제 모아보기 (과제 1~3)</h3>

    <h1>과제 3. 날씨 (Component)</h1>
    <hr />
    <WeatherParent />

    <h1>과제 2. 날씨 (Composition)</h1>
    <hr />
    <WeatherComposition />

    <h1>요구사항 1. 반응형 상태 관리</h1>
    <hr />
    <WeatherState />

    <h1>요구사항 2. 검색 도시 (computed 활용)</h1>
    <hr />
    <WeatherFilterComputed />

    <h1>요구사항 3. 반응형 변수 변화 감시 (watch, watchEffect)</h1>
    <hr />
    <WeatherWatcher />

    <h1>요구사항 4. 검색 결과 표시</h1>
    <hr />
    <WeatherSearchResult />

    <h1>요구사항 5. 본인 데이터 추가</h1>
    <hr />
    <WeatherFavoriteCount />
  </div>
</template>
