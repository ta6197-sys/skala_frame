<script setup>
// 과제 4 로 App.vue 가 라우터 껍데기가 되면서, 기존 App.vue 가 그리던 과제 1~3 화면을
// 그대로 이 view 로 옮겨 /legacy 경로에서 계속 확인할 수 있게 했다. (import 경로만 '@/' 로 변경)
//
// 과제 8. 과제 1 컴포넌트 9개를 여기에 붙였다.
// 화면 제목은 "과제 1~3 모아보기" 인데 실제로는 2~3 만 그리고 있었다. 과제 1 파일들은
// components 안에 남아 있기만 하고 어디서도 import 되지 않아, 저장소를 열어야만 존재를 알 수 있는 상태였다.
// 지우는 선택지도 있었지만 이건 제출물이다. 안 보이는 것과 없는 것은 다르므로, 지우는 대신 화면에 올린다.

// ===== 과제 3. 날씨 (Component) - 기능 변경 없이 4개 + 추가 컴포넌트로 분리한 버전 =====
import WeatherParent from '@/components/practice/weather3/WeatherParent.vue'

// ===== 과제 2. 날씨 (Composition) =====
// 0. 통합 완성본 (제출용, 요구사항 1~5 를 한 화면에 합침)
import WeatherComposition from '@/components/practice/WeatherComposition.vue'
import WeatherState from '@/components/practice/WeatherState.vue'
import WeatherFilterComputed from '@/components/practice/WeatherFilterComputed.vue'
import WeatherWatcher from '@/components/practice/WeatherWatcher.vue'
import WeatherSearchResult from '@/components/practice/WeatherSearchResult.vue'
import WeatherFavoriteCount from '@/components/practice/WeatherFavoriteCount.vue'

// ===== 과제 1. 날씨 (기본 문법) =====
// 통합 완성본 + 요구사항별로 하나씩 뜯어본 데모
import WeatherMockup from '@/components/practice/WeatherMockup.vue'
import WeatherVFor from '@/components/practice/WeatherVFor.vue'
import WeatherVIf from '@/components/practice/WeatherVIf.vue'
import WeatherVModel from '@/components/practice/WeatherVModel.vue'
import WeatherEvent from '@/components/practice/WeatherEvent.vue'
import WeatherHumidity from '@/components/practice/WeatherHumidity.vue'
import WeatherDust from '@/components/practice/WeatherDust.vue'
import WeatherFavorite from '@/components/practice/WeatherFavorite.vue'
import WeatherDetail from '@/components/practice/WeatherDetail.vue'
</script>

<template>
  <div>
    <h3>이전 과제 모아보기 (과제 1~3)</h3>
    <p class="legacy-note">
      과제 4 부터는 이 화면들이 대시보드로 흡수됐습니다. 각 단원의 원본 산출물을 그대로 남겨둔
      자리입니다. 파일은 <code>src/components/practice/</code> 아래에 격리해 두었고, 살아 있는
      화면이 쓰는 컴포넌트(<code>common/</code>, <code>weather/</code>)와 섞이지 않습니다.
    </p>

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

    <h1>과제 1. 날씨 (기본 문법)</h1>
    <hr />
    <WeatherMockup />

    <h1>요구사항 1. 배열 렌더링 (v-for)</h1>
    <hr />
    <WeatherVFor />

    <h1>요구사항 2. 조건부 렌더링 (v-if / v-else)</h1>
    <hr />
    <WeatherVIf />

    <h1>요구사항 3. 양방향 바인딩과 한글 입력 (v-model 대신 :value + @input)</h1>
    <hr />
    <WeatherVModel />

    <h1>요구사항 4. 이벤트와 수식어 (.stop)</h1>
    <hr />
    <WeatherEvent />

    <h1>요구사항 5-A. 본인 데이터 : 습도 (:style 바인딩)</h1>
    <hr />
    <WeatherHumidity />

    <h1>요구사항 5-B. 본인 데이터 : 미세먼지 (v-else-if 3단계)</h1>
    <hr />
    <WeatherDust />

    <h1>요구사항 5-D. 본인 데이터 : 즐겨찾기 (다중 checkbox + v-model)</h1>
    <hr />
    <WeatherFavorite />

    <h1>요구사항 5-E. 본인 데이터 : 상세 패널 토글</h1>
    <hr />
    <WeatherDetail />
  </div>
</template>

<style scoped>
.legacy-note {
  margin: 0 0 var(--space-4) 0;
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
  line-height: var(--lh-base);
}
.legacy-note code {
  padding: 1px 4px;
  font-size: 0.92em;
  background-color: var(--c-surface-mute);
  border-radius: var(--radius-s);
}
</style>
