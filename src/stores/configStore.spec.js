import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useConfigStore } from './configStore'

// dustGrade 의 경계값(30/80)은 카드·상세·통계 세 화면의 색과 문구를 동시에 정한다.
// "미만" 인지 "이하" 인지가 한 칸만 밀려도 화면 전체가 조용히 틀린 등급을 그린다.
// 눈으로는 확인이 안 되는 종류의 오류라 여기서 못을 박아둔다.

describe('configStore', () => {
  beforeEach(() => {
    // 스토어마다 새 pinia. 안 그러면 앞 테스트가 바꾼 경계값이 다음 테스트로 새어 나간다.
    setActivePinia(createPinia())
  })

  describe('dustGrade 경계', () => {
    it('기본 경계 30 / 80 을 정확히 가른다', () => {
      const config = useConfigStore()
      expect(config.dustGrade(0)).toBe('good')
      expect(config.dustGrade(29)).toBe('good')
      expect(config.dustGrade(30)).toBe('normal') // 30 은 "좋음 상한 미만" 이 아니다
      expect(config.dustGrade(79)).toBe('normal')
      expect(config.dustGrade(80)).toBe('bad') // 80 부터 나쁨
      expect(config.dustGrade(500)).toBe('bad')
    })

    it('사용자가 경계를 옮기면 판정도 같이 움직인다', () => {
      const config = useConfigStore()
      config.setDustGoodMax(50)
      expect(config.dustGrade(40)).toBe('good') // 기본값이었으면 normal
    })
  })

  describe('경계값이 서로를 넘지 못하게 막는 액션', () => {
    it('좋음 상한을 나쁨 하한 위로 올려도 하한 아래로 잘린다', () => {
      const config = useConfigStore()
      config.setDustGoodMax(200) // 나쁨 하한은 80
      expect(config.dustGoodMax).toBe(79)
      expect(config.dustGrade(79)).toBe('normal') // 등급 순서가 뒤집히지 않는다
    })

    it('나쁨 하한을 좋음 상한 아래로 내려도 상한 위로 밀린다', () => {
      const config = useConfigStore()
      config.setDustBadMin(5) // 좋음 상한은 30
      expect(config.dustBadMin).toBe(31)
    })
  })

  describe('convertTemp', () => {
    it('섭씨일 때는 원본을 그대로 돌려준다 (반올림도 하지 않는다)', () => {
      const config = useConfigStore()
      expect(config.convertTemp(24.9)).toBe(24.9)
    })

    it('화씨로 바꾸면 정수로 변환한다', () => {
      const config = useConfigStore()
      config.toggleUnit()
      expect(config.unit).toBe('fahrenheit')
      expect(config.convertTemp(0)).toBe(32)
      expect(config.convertTemp(100)).toBe(212)
      expect(config.unitSymbol).toBe('℉')
    })
  })

  describe('isHot / personalTemp', () => {
    it('더움 판정은 단위와 무관하게 원본 섭씨로 한다', () => {
      const config = useConfigStore()
      config.toggleUnit() // 화씨로 바꿔도
      expect(config.isHot(25)).toBe(true) // 판정 기준은 섭씨 25 그대로
      expect(config.isHot(24.9)).toBe(false)
    })

    it('체질 보정은 체감온도에 ±3 도로 얹힌다', () => {
      const config = useConfigStore()
      expect(config.personalTemp(20)).toBe(20)
      config.setBodyType('cold')
      expect(config.personalTemp(20)).toBe(17)
      config.setBodyType('heat')
      expect(config.personalTemp(20)).toBe(23)
    })
  })

  it('resetSettings 는 isCustomized 를 다시 false 로 만든다', () => {
    const config = useConfigStore()
    expect(config.isCustomized).toBe(false)
    config.setHotThreshold(30)
    expect(config.isCustomized).toBe(true)
    config.resetSettings()
    expect(config.isCustomized).toBe(false)
  })
})
