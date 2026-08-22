// 과제 7. OpenWeatherMap 아이콘 코드 → 날씨 종류 / 낮밤
//
// 아이콘 코드는 "앞 두 자리 = 날씨 종류, 마지막 한 자리 = d(낮) / n(밤)" 구조다.
//   '01d' 맑은 낮 / '10n' 밤에 내리는 비 / '04d' 흐린 낮
//
// 이 판정을 여기 한 곳에 둔 이유:
//   상세 페이지의 히어로 배경(WeatherDetailView)과 화면 전체 배경 애니메이션(WeatherBackdrop)이
//   같은 기준으로 갈려야 한다. 두 곳에 각각 if 문을 두면 나중에 한쪽만 고쳐서 어긋난다.
//   ("값은 한 곳에서만 태어난다" - 과제 7 개선 원칙 1)
//
// data/lifeIndex.js 와 같은 자리에 두는 순수 함수다. 반응형 값도 상태도 갖지 않는다.

// 09(소나기) 와 10(비) 을 하나로 묶은 이유: 화면에서 둘을 다르게 그릴 방법이 없다. 둘 다 빗줄기다.
// 반대로 11(뇌우) 은 따로 뒀다. 번쩍임을 얹을 수 있어서 표현이 갈린다.
const ICON_KIND_MAP = {
  '01': 'clear',
  '02': 'cloud',
  '03': 'cloud',
  '04': 'cloud',
  '09': 'rain',
  10: 'rain',
  11: 'storm',
  13: 'snow',
  50: 'fog',
}

/**
 * 아이콘 코드에서 날씨 종류를 뽑는다.
 * 값이 없거나(폴백 목업 데이터에는 icon 이 없다) 모르는 코드면 'unknown' 을 돌려준다.
 * 화면 쪽에서 'unknown' 이면 아무것도 그리지 않도록 걸러 쓴다.
 */
export const getWeatherKind = (icon) => {
  if (typeof icon !== 'string' || icon.length < 2) return 'unknown'
  return ICON_KIND_MAP[icon.slice(0, 2)] ?? 'unknown'
}

/** 밤인지. 같은 비라도 밤이면 배경을 어둡게 깐다. */
export const isNightIcon = (icon) => typeof icon === 'string' && icon.endsWith('n')

// ===== 아래 둘은 개발용 미리보기(WeatherPreviewSwitch)가 쓴다 =====
// 위 ICON_KIND_MAP 의 반대 방향이다. "비" 를 고르면 어떤 코드를 넣을지 정한다.
// 09(소나기)와 10(비)처럼 한 종류에 코드가 여럿인 경우가 있어서 자동으로 뒤집을 수 없고, 대표 코드를 직접 고른다.
export const KIND_ICON_CODE = {
  clear: '01',
  cloud: '04',
  rain: '10',
  storm: '11',
  snow: '13',
  fog: '50',
}

export const KIND_LABEL = {
  clear: '맑음',
  cloud: '구름',
  rain: '비',
  storm: '뇌우',
  snow: '눈',
  fog: '안개',
}
