// 과제 9. 차트가 쓰는 색·축·그리드 기본값을 한 곳에 모은다.
//
// 왜 필요한가 - ECharts 는 <canvas> 에 그린다. CSS 가 닿지 않으므로 var(--c-brand) 를 그대로 넘길 수 없고,
// 색을 실제 문자열('#3182f6')로 만들어서 option 에 박아야 한다.
// 그렇다고 화면마다 hex 를 적으면 base.css 의 디자인 토큰 밖에 색이 하나 더 생긴다.
// 과제 7 에서 "컴포넌트는 hex 를 모르는 상태를 유지한다" 고 정해둔 원칙이 차트에서만 깨지는 셈이다.
//
// 그래서 여기서 :root 에 실제로 계산된 값을 읽어다 준다. base.css 의 --c-brand 를 바꾸면 차트 색도 같이 따라온다.

// :root 에 걸린 CSS 변수의 계산값을 문자열로 꺼낸다.
// SSR 이나 테스트(environment: 'node')에서는 document 가 없으므로 fallback 으로 물러선다.
export const cssVar = (name, fallback = '#000000') => {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

// 계열(도시)별 색. 앞의 다섯 개는 base.css 의 판정 색을 그대로 재사용하고,
// 도시가 7개라 모자라는 두 칸만 회색 계열에서 빌린다.
// 순서는 "가장 먼저 눈에 띄어야 하는 것" 순이 아니라 서로 붙어 있을 때 구분이 되는 순으로 놓았다.
export const seriesPalette = () => [
  cssVar('--c-brand', '#3182f6'),
  cssVar('--c-hot', '#f04452'),
  cssVar('--c-good', '#15b76d'),
  cssVar('--c-normal', '#f59f0b'),
  cssVar('--c-bad', '#8b5cf6'),
  cssVar('--c-cool', '#0ea5e9'),
  cssVar('--c-text-sub', '#4e5968'),
]

// 화면 9개가 같은 톤을 유지하도록, 축·그리드·툴팁의 공통 설정을 여기서 만든다.
// 개별 차트는 이 위에 데이터와 계열만 얹는다.
export const chartBase = () => {
  const line = cssVar('--c-line', '#e5e8eb')
  const textMuted = cssVar('--c-text-muted', '#8b95a1')
  const textSub = cssVar('--c-text-sub', '#4e5968')
  const surface = cssVar('--c-surface', '#ffffff')

  return {
    color: seriesPalette(),
    // 좌우 여백을 직접 잡는다. containLabel 이 라벨 길이에 맞춰 매번 다르게 잘라내면
    // 카드가 여러 장 쌓였을 때 차트마다 왼쪽 선이 어긋나 보인다.
    grid: { top: 28, left: 8, right: 12, bottom: 4, containLabel: true },
    textStyle: { fontFamily: 'inherit' },
    tooltip: {
      // axis = 세로선 하나에 걸린 모든 도시를 한 번에 보여준다. item 으로 두면 선 위에 정확히 올려야만 떠서
      // 도시 7개를 비교하는 이 화면에서는 쓸 수가 없다.
      trigger: 'axis',
      backgroundColor: surface,
      borderColor: line,
      borderWidth: 1,
      padding: [8, 10],
      textStyle: { color: textSub, fontSize: 12 },
      axisPointer: { type: 'line', lineStyle: { color: line, width: 1 } },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: { lineStyle: { color: line } },
      axisTick: { show: false },
      axisLabel: { color: textMuted, fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      // 기온은 0 에서 시작할 이유가 없다. scale: true 로 실제 범위에 맞춰야 도시 간 차이가 보인다.
      scale: true,
      splitLine: { lineStyle: { color: line, type: 'dashed' } },
      axisLabel: { color: textMuted, fontSize: 11 },
    },
  }
}
