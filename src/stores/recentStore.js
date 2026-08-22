import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { findCity } from '@/data/cities'

// 과제 5(요구사항 4). 본인 추가 스토어 2 - 최근 본 도시
// 상세 페이지(/weather/:cityId)에 들어갈 때마다 기록해두고, 대시보드 상단에서 다시 꺼내 쓴다.
// 기록하는 화면과 보여주는 화면이 서로 다른 라우트라 props 로는 전달할 방법이 없다.
// 과제 6. 여기서 필요한 건 도시 "이름" 뿐이라 날씨 스토어까지 갈 것 없이 cities.js(좌표 사전)만 참조한다.
export const useRecentStore = defineStore(
  'recent',
  () => {
    const MAX_COUNT = 5

    // state : 최근에 본 순서대로 도시 id 를 담는다. 앞쪽이 가장 최근.
    const recentIds = ref([])

    // getters
    const recentCities = computed(() => recentIds.value.map((id) => findCity(id)).filter(Boolean))
    const hasRecent = computed(() => recentIds.value.length > 0)

    // actions
    function addRecent(cityId) {
      // 이미 본 도시면 기존 자리에서 빼고 맨 앞으로 다시 넣는다 (중복 없이 최신순 유지)
      const rest = recentIds.value.filter((id) => id !== cityId)
      recentIds.value = [cityId, ...rest].slice(0, MAX_COUNT)
    }

    function clearRecent() {
      recentIds.value = []
    }

    return {
      recentIds,
      recentCities,
      hasRecent,
      addRecent,
      clearRecent,
    }
  },
  // 과제 6. 이 스토어의 state 를 localStorage 에 자동 저장한다(pinia-plugin-persistedstate).
  // 새로고침해도 사용자가 정한 값이 남는다. 저장 키는 스토어 id 를 그대로 쓴다.
  // 반대로 weatherStore 는 이 옵션을 켜지 않았다. 어제 받아둔 기온을 오늘 화면에 띄우게 되기 때문이다.
  { persist: true },
)
