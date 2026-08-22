import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 과제 5. 날씨 단위를 세팅하는 스토어
// Setup Store 문법으로 작성함 - ref 가 state, computed 가 getters, 일반 function 이 actions 에 대응된다.
// 요구사항 4 : 여기에 "내 기준" 설정(더움 기준 온도 / 미세먼지 경계 / 체질)을 state·getter·action 으로 추가했다.
export const useConfigStore = defineStore(
  'config',
  () => {
    // 기본값. '기본값으로 되돌리기' 에서 다시 쓰려고 상수로 빼둔다.
    const DEFAULT_HOT_THRESHOLD = 25
    const DEFAULT_DUST_GOOD_MAX = 30
    const DEFAULT_DUST_BAD_MIN = 80

    // ===== state =====
    // 단위를 저장하는 변수 (초기값 celsius). 값은 'celsius' 또는 'fahrenheit' 둘 중 하나만 가진다.
    const unit = ref('celsius')

    // 과제 1에서 강사가 정해준 "25도 이상이면 더움" 기준을 사용자가 직접 옮길 수 있게 state 로 뺐다.
    const hotThreshold = ref(DEFAULT_HOT_THRESHOLD)

    // 미세먼지 좋음/보통/나쁨을 가르는 두 경계
    const dustGoodMax = ref(DEFAULT_DUST_GOOD_MAX)
    const dustBadMin = ref(DEFAULT_DUST_BAD_MIN)

    // 체질 : 'cold'(추위를 많이 탐) / 'normal' / 'heat'(더위를 많이 탐). 옷차림 추천에 쓴다.
    const bodyType = ref('normal')

    // ===== getters =====
    // 현재 단위 상태에 맞는 기호
    const unitSymbol = computed(() => (unit.value === 'celsius' ? '℃' : '℉'))

    // 화면에 붙일 한글 라벨 (UnitToggler 표시용)
    const unitLabel = computed(() => (unit.value === 'celsius' ? '섭씨(℃)' : '화씨(℉)'))

    // 섭씨 원본값을 현재 단위에 맞게 바꿔주는 "인자를 받는 getter"
    // computed 가 값이 아니라 함수를 리턴하는 형태. 카드/상세/통계 세 군데에 똑같이 복붙될 변환식을 여기 한 곳에만 둔다.
    const convertTemp = computed(() => {
      return (celsius) => {
        if (unit.value === 'fahrenheit') {
          return Math.round((celsius * 9) / 5 + 32) // 화씨 변환 연산
        }
        return celsius // celsius 일 때는 원본 그대로 반환
      }
    })

    // 더움 판정도 같은 방식으로 스토어가 맡는다. 판정은 항상 원본 섭씨로 한다(단위를 바꿨다고 더위가 바뀌지는 않으므로).
    const isHot = computed(() => {
      return (celsius) => celsius >= hotThreshold.value
    })

    // 미세먼지 등급을 'good' / 'normal' / 'bad' 셋 중 하나로 돌려준다.
    // 카드·상세·통계에 흩어져 있던 30/80 숫자를 전부 이 getter 하나로 모았다.
    const dustGrade = computed(() => {
      return (dust) => {
        if (dust < dustGoodMax.value) return 'good'
        if (dust < dustBadMin.value) return 'normal'
        return 'bad'
      }
    })

    // 체질 보정값. 추위를 많이 타면 같은 온도를 3도 더 춥게 느낀다고 본다.
    const bodyOffset = computed(() => {
      if (bodyType.value === 'cold') return -3
      if (bodyType.value === 'heat') return 3
      return 0
    })

    const bodyTypeLabel = computed(() => {
      if (bodyType.value === 'cold') return '추위를 많이 탐 (-3도)'
      if (bodyType.value === 'heat') return '더위를 많이 탐 (+3도)'
      return '보통 (보정 없음)'
    })

    // 체감온도에 체질 보정을 얹은 값. 옷차림 추천은 이 값을 기준으로 판단한다.
    const personalTemp = computed(() => {
      return (feelsLike) => feelsLike + bodyOffset.value
    })

    // 기본값에서 하나라도 바뀌었는지 (설정 화면에서 '되돌리기' 버튼을 켜고 끄는 용도)
    const isCustomized = computed(
      () =>
        hotThreshold.value !== DEFAULT_HOT_THRESHOLD ||
        dustGoodMax.value !== DEFAULT_DUST_GOOD_MAX ||
        dustBadMin.value !== DEFAULT_DUST_BAD_MIN ||
        bodyType.value !== 'normal',
    )

    // ===== actions =====
    // 'celsius' 와 'fahrenheit' 를 토글(스위칭)하는 함수
    function toggleUnit() {
      unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
    }

    function setHotThreshold(value) {
      hotThreshold.value = Number(value)
    }

    // 두 경계가 서로를 넘어서면 좋음/보통/나쁨 판정이 뒤집히므로 액션 안에서 막는다.
    // 화면(v-model)에 값을 직접 물리지 않고 액션을 거치게 한 이유가 이것.
    function setDustGoodMax(value) {
      const next = Number(value)
      dustGoodMax.value = Math.min(next, dustBadMin.value - 1)
    }

    function setDustBadMin(value) {
      const next = Number(value)
      dustBadMin.value = Math.max(next, dustGoodMax.value + 1)
    }

    function setBodyType(value) {
      bodyType.value = value
    }

    function resetSettings() {
      hotThreshold.value = DEFAULT_HOT_THRESHOLD
      dustGoodMax.value = DEFAULT_DUST_GOOD_MAX
      dustBadMin.value = DEFAULT_DUST_BAD_MIN
      bodyType.value = 'normal'
    }

    return {
      unit,
      hotThreshold,
      dustGoodMax,
      dustBadMin,
      bodyType,
      unitSymbol,
      unitLabel,
      convertTemp,
      isHot,
      dustGrade,
      bodyOffset,
      bodyTypeLabel,
      personalTemp,
      isCustomized,
      toggleUnit,
      setHotThreshold,
      setDustGoodMax,
      setDustBadMin,
      setBodyType,
      resetSettings,
    }
  },
  // 과제 6. 이 스토어의 state 를 localStorage 에 자동 저장한다(pinia-plugin-persistedstate).
  // 새로고침해도 사용자가 정한 값이 남는다. 저장 키는 스토어 id 를 그대로 쓴다.
  // 반대로 weatherStore 는 이 옵션을 켜지 않았다. 어제 받아둔 기온을 오늘 화면에 띄우게 되기 때문이다.
  { persist: true },
)
