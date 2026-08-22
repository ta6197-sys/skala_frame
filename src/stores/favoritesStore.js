import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useWeatherStore } from '@/stores/weatherStore'

// 과제 5(요구사항 4). 본인 추가 스토어 1 - 즐겨찾기
// 과제 4 까지는 favorites 가 WeatherHomeView 의 지역 상태여서, 상세 페이지에 들어갔다 돌아오면
// 홈이 언마운트되면서 체크가 전부 날아갔다. 스토어로 올려 화면이 바뀌어도 값이 남아 있게 한다.
export const useFavoritesStore = defineStore(
  'favorites',
  () => {
    // 과제 6. 즐겨찾기는 id 만 들고 있고, 실제 날씨는 weatherStore 가 가진 실시간 값을 그때그때 꺼내 쓴다.
    // 과제 5 까지는 여기서 목업 배열(weatherData)을 직접 import 했는데, 그러면 이 스토어가 목업에 묶여버린다.
    const weatherStore = useWeatherStore()

    // state : 도시 이름이 아니라 id 를 담는다. 이름은 바뀔 수 있지만 id 는 데이터의 열쇠라서.
    const favoriteIds = ref([])

    // getters : 개수
    const favoriteCount = computed(() => favoriteIds.value.length)

    // getters : 즐겨찾기한 도시 객체 목록 (id 만 갖고 있으므로 원본 데이터에서 다시 찾아온다)
    const favoriteCities = computed(() =>
      weatherStore.cityList.filter((city) => favoriteIds.value.includes(city.id)),
    )

    // getters : 특정 도시가 즐겨찾기인지 묻는, 인자를 받는 getter
    const isFavorite = computed(() => {
      return (cityId) => favoriteIds.value.includes(cityId)
    })

    // actions
    function toggleFavorite(cityId) {
      if (favoriteIds.value.includes(cityId)) {
        favoriteIds.value = favoriteIds.value.filter((id) => id !== cityId)
      } else {
        favoriteIds.value.push(cityId)
      }
    }

    function clearFavorites() {
      favoriteIds.value = []
    }

    return {
      favoriteIds,
      favoriteCount,
      favoriteCities,
      isFavorite,
      toggleFavorite,
      clearFavorites,
    }
  },
  // 과제 6. 이 스토어의 state 를 localStorage 에 자동 저장한다(pinia-plugin-persistedstate).
  // 새로고침해도 사용자가 정한 값이 남는다. 저장 키는 스토어 id 를 그대로 쓴다.
  // 반대로 weatherStore 는 이 옵션을 켜지 않았다. 어제 받아둔 기온을 오늘 화면에 띄우게 되기 때문이다.
  { persist: true },
)
