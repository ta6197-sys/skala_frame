import { describe, it, expect } from 'vitest'
import { getLifeIndexList, getBestTimeList } from './lifeIndex'

// getBestTimeList 는 이 프로젝트에서 유일하게 남이 만들어주지 않은 알고리즘이다.
// "예보 구간마다 생활지수를 돌려 지수별 최고점 시각을 고른다" 는 규칙이 맞는지는
// 화면을 눈으로 봐서는 확인할 수 없다 - 점수가 하나 틀려도 그럴듯한 시각이 찍히기 때문이다.

const slot = (time, overrides = {}) => ({
  time,
  temp: 22,
  feelsLike: 22,
  humidity: 50,
  wind: 0,
  rainProb: 0,
  status: '맑음',
  ...overrides,
})

describe('getLifeIndexList', () => {
  it('세 지수를 항상 같은 순서로 돌려준다 (화면이 v-for 로 그리므로 순서가 계약이다)', () => {
    const list = getLifeIndexList(slot(0, { dust: 10 }))
    expect(list.map((item) => item.key)).toEqual(['laundry', 'carwash', 'outdoor'])
  })

  it('점수는 0~100 을 벗어나지 않는다', () => {
    // 모든 감점 요소를 최악으로 몰아넣어도 음수가 나오면 안 된다.
    const worst = getLifeIndexList(
      slot(0, { temp: -40, humidity: 100, wind: 30, rainProb: 100, dust: 900 }),
    )
    const best = getLifeIndexList(slot(0, { temp: 22, humidity: 0, wind: 0, rainProb: 0, dust: 0 }))

    for (const item of [...worst, ...best]) {
      expect(item.score).toBeGreaterThanOrEqual(0)
      expect(item.score).toBeLessThanOrEqual(100)
    }
  })

  it('등급 경계 80/60/40/20 에서 문구가 바뀐다', () => {
    // 빨래지수 = 100 - (습도*0.6 + 강수확률*0.4). 습도만 움직여 점수를 정확히 맞춘다.
    // 점수 s 를 만드는 습도 = (100 - s) / 0.6
    const gradeAtScore = (score) =>
      getLifeIndexList(slot(0, { humidity: (100 - score) / 0.6, dust: 0 }))[0].grade

    expect(gradeAtScore(100)).toBe('아주 좋음')
    expect(gradeAtScore(80)).toBe('아주 좋음') // 경계 포함
    expect(gradeAtScore(79)).toBe('좋음')
    expect(gradeAtScore(60)).toBe('좋음') // 경계 포함
    expect(gradeAtScore(59)).toBe('보통')
    expect(gradeAtScore(40)).toBe('보통') // 경계 포함
  })
})

describe('getBestTimeList', () => {
  it('빈 예보에는 빈 배열을 돌려준다 (늦은 밤 오늘 구간이 없을 때)', () => {
    expect(getBestTimeList([], { dust: 0 })).toEqual([])
  })

  it('구간이 하나뿐이면 그 구간이 세 지수 모두의 최적 시각이 된다', () => {
    const result = getBestTimeList([slot(1000)], { dust: 0 })
    expect(result).toHaveLength(3)
    expect(result.every((item) => item.time === 1000)).toBe(true)
  })

  it('지수마다 서로 다른 시각을 고를 수 있다', () => {
    // 12시: 건조해서 빨래에 좋고, 21시: 서늘해서 외출에 좋다.
    const slots = [
      slot(1200, { humidity: 10, temp: 35, wind: 5 }),
      slot(2100, { humidity: 90, temp: 22, wind: 0 }),
    ]
    const [laundry, , outdoor] = getBestTimeList(slots, { dust: 0 })

    expect(laundry.label).toBe('빨래지수')
    expect(laundry.time).toBe(1200)
    expect(outdoor.label).toBe('외출지수')
    expect(outdoor.time).toBe(2100)
  })

  it('동점이면 앞선 시각을 남긴다 (reduce 가 > 비교라 먼저 온 쪽이 이긴다)', () => {
    const slots = [slot(900), slot(1200)]
    expect(getBestTimeList(slots, { dust: 0 }).every((item) => item.time === 900)).toBe(true)
  })

  it('미세먼지는 예보 구간별 값이 없으므로 전 구간에 같은 값이 적용된다', () => {
    const clean = getBestTimeList([slot(900)], { dust: 0 })[1] // 세차지수
    const dirty = getBestTimeList([slot(900)], { dust: 100 })[1]
    expect(clean.score).toBeGreaterThan(dirty.score)
    expect(dirty.reason).toContain('미세먼지 100')
  })
})
