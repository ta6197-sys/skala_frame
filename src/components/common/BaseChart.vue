<script setup>
// 과제 9. ECharts 래퍼.
//
// 왜 vue-echarts 를 그대로 쓰지 않고 한 겹 감쌌나
//   1) ECharts 는 전체를 import 하면 1MB 가 넘는다. echarts/core 에 필요한 조각만 use() 로 등록하는 방식이
//      권장 사용법인데, 그 등록을 화면마다 반복하면 화면이 늘어날 때마다 같은 코드가 복사된다.
//      과제 8 에서 Element Plus 를 온디맨드로 바꾼 것과 같은 이유다 - 안 쓰는 것을 번들에 넣지 않는다.
//   2) 등록은 앱 전체에 한 번만 하면 된다. ES 모듈은 한 번만 평가되므로 이 파일이 그 "한 곳" 이 된다.
//   3) 화면 쪽은 option 객체 하나만 만들면 되고, ECharts 를 어떻게 등록하는지는 몰라도 된다.
//
// 등록한 조각(이 프로젝트가 실제로 쓰는 것만)
//   LineChart  : 도시별 기온 추이
//   BarChart   : 강수확률
//   Grid/Tooltip/Legend/MarkLine : 축·툴팁·범례·기준선
//   CanvasRenderer : SVG 렌더러도 있지만, 선 7개 × 포인트 8개가 계속 다시 그려지는 화면이라 캔버스가 맞다.
import { use } from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  CanvasRenderer,
])

defineProps({
  // ECharts option 객체. 화면이 만들어서 넘긴다.
  option: { type: Object, required: true },
  // 캔버스는 부모 높이를 물려받지 못한다(0 이 되면 아무것도 안 그려진다). 그래서 높이는 항상 명시한다.
  height: { type: String, default: '280px' },
})
</script>

<template>
  <!-- autoresize : 컨테이너 크기가 바뀌면 다시 그린다. 이게 없으면 창을 줄였을 때 차트만 원래 크기로 남는다. -->
  <VChart class="base-chart" :option="option" :style="{ height }" autoresize />
</template>

<style scoped>
.base-chart {
  width: 100%;
}
</style>
