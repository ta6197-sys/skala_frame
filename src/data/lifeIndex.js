// 과제 5(나만의 추가). 생활지수 계산기
// weatherData 의 습도/강수확률/미세먼지/바람/기온을 조합해서 0~100 점짜리 새 정보를 만들어낸다.
// 상태가 없는 순수 계산이라 스토어가 아니라 그냥 함수로 둔다. (스토어는 "여러 화면이 공유하는 값"을 담는 자리)

// 점수를 0~100 사이로 자르는 공용 함수
const clamp = (score) => Math.max(0, Math.min(100, Math.round(score)))

// 점수를 등급 문구로 바꾼다. 세 지수가 같은 기준을 쓰도록 여기 한 곳에만 둔다.
const toGrade = (score) => {
  if (score >= 80) return '아주 좋음'
  if (score >= 60) return '좋음'
  if (score >= 40) return '보통'
  if (score >= 20) return '나쁨'
  return '아주 나쁨'
}

// 빨래지수 : 습할수록, 비 올 확률이 높을수록 낮다.
const laundryIndex = (city) => {
  const score = clamp(100 - (city.humidity * 0.6 + city.rainProb * 0.4))
  return {
    key: 'laundry',
    label: '빨래지수',
    score,
    grade: toGrade(score),
    reason: `습도 ${city.humidity}% · 강수확률 ${city.rainProb}%`,
  }
}

// 세차지수 : 비 올 확률과 미세먼지가 높을수록 낮다. 어차피 금방 더러워지므로.
const carWashIndex = (city) => {
  const dustPenalty = Math.min(city.dust, 100)
  const score = clamp(100 - (city.rainProb * 0.6 + dustPenalty * 0.4))
  return {
    key: 'carwash',
    label: '세차지수',
    score,
    grade: toGrade(score),
    reason: `강수확률 ${city.rainProb}% · 미세먼지 ${city.dust}`,
  }
}

// 외출지수 : 22도에서 멀어질수록, 먼지가 많을수록, 비가 올수록, 바람이 셀수록 낮다.
const outdoorIndex = (city) => {
  const tempPenalty = Math.abs(city.temp - 22) * 4
  const dustPenalty = Math.min(city.dust, 100) * 0.35
  const rainPenalty = city.rainProb * 0.3
  const windPenalty = city.wind * 2
  const score = clamp(100 - (tempPenalty + dustPenalty + rainPenalty + windPenalty))
  return {
    key: 'outdoor',
    label: '외출지수',
    score,
    grade: toGrade(score),
    reason: `기온 ${city.temp}℃ · 미세먼지 ${city.dust} · 바람 ${city.wind}m/s`,
  }
}

// 세 지수를 한 배열로 묶어서 돌려준다. 화면에서는 v-for 한 번으로 그리면 된다.
export const getLifeIndexList = (city) => [
  laundryIndex(city),
  carWashIndex(city),
  outdoorIndex(city),
]

// 과제 6(차별점). 시간대별 최적 시각 찾기
// 과제 5 까지의 생활지수는 "지금 빨래하기 좋은가" 한 가지만 답했다. 지금 값 하나밖에 없었으니 그럴 수밖에 없었다.
// 예보 API 가 붙으면서 3시간 간격 시점이 여러 개 생겼으므로, 같은 계산식을 시점마다 돌려
// "오늘 중 언제가 제일 좋은가" 를 답할 수 있게 됐다. 계산식은 위 함수들을 그대로 재사용한다.
//
// slots : [{ time, temp, humidity, wind, rainProb }] - api/weather.js 의 getForecast 가 만들어준 모양
// dust  : 미세먼지는 예보 구간마다 값이 없어서 현재 관측값을 전 구간에 같게 적용한다(세차/외출지수에 쓰인다).
export const getBestTimeList = (slots, { dust = 0 } = {}) => {
  if (!slots.length) return []

  // 각 시점의 세 지수를 한 번씩만 계산해두고, 지수별로 최고점을 고른다.
  const scoredSlots = slots.map((slot) => ({
    time: slot.time,
    indexes: getLifeIndexList({ ...slot, dust }),
  }))

  return scoredSlots[0].indexes.map((sample, position) => {
    const best = scoredSlots.reduce((winner, current) =>
      current.indexes[position].score > winner.indexes[position].score ? current : winner,
    )

    return {
      ...best.indexes[position],
      time: best.time,
      label: sample.label,
    }
  })
}
