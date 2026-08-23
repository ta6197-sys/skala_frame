import { ref, watch } from 'vue'
import { useGeolocation } from '@vueuse/core'
import { getCurrentWeather, getPlaceName } from '@/api/weather'

// 브라우저 위치 → 한글 지명(역지오코딩) + 그 좌표의 현재 날씨.
//
// 왜 뽑았나
// - WeatherHomeView 안에서 80줄가량을 차지하면서, 그 화면의 다른 관심사(검색·요약·선택 상태)와
//   같은 평면에 섞여 있었다. 이 덩어리는 자기들끼리만 이야기한다 - 밖에서 필요한 것은
//   "지금 어디이고 몇 도인가" 와 "다시 물어봐" 두 가지뿐이다. 그 경계가 곧 함수의 경계다.
// - 스토어로 올리지 않는 이유는 그대로다. 내 위치를 궁금해하는 화면이 하나뿐이라 공유할 대상이 없다.
//   상태를 공유하지 않으면서 로직만 재사용하는 자리가 composable 이다.
export function useMyLocation() {
  // immediate: false - 화면에 들어오자마자 위치 권한 팝업을 띄우면 무례하다. 버튼을 눌렀을 때만 물어본다.
  const { coords, error: geoError, resume } = useGeolocation({ immediate: false })

  const place = ref(null) // { name, temp, feelsLike, status, humidity ... }
  const isLocating = ref(false)
  const errorMessage = ref('')

  const request = () => {
    isLocating.value = true
    errorMessage.value = ''
    resume() // 여기서 브라우저 권한 팝업이 뜬다
  }

  // useGeolocation 은 권한을 받기 전까지 좌표를 Infinity 로 채워두므로 유효한 값인지 먼저 걸러야 한다.
  watch(coords, async (newCoords) => {
    const { latitude, longitude } = newCoords
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return

    try {
      // 지명과 날씨는 서로를 기다릴 이유가 없다. 순서대로 await 하면 두 배 느려진다.
      const [name, current] = await Promise.all([
        getPlaceName({ lat: latitude, lon: longitude }),
        getCurrentWeather({ lat: latitude, lon: longitude }),
      ])
      place.value = { name, ...current }
    } catch (caught) {
      errorMessage.value = caught.message
    } finally {
      isLocating.value = false
    }
  })

  // 권한을 거부하면 좌표가 영영 오지 않는다. 그때는 로딩 표시를 풀고 안내 문구로 바꾼다.
  watch(geoError, (newError) => {
    if (!newError) return
    isLocating.value = false
    errorMessage.value =
      newError.code === 1
        ? '위치 권한이 거부되었습니다. 아래 도시 목록은 그대로 사용할 수 있습니다.'
        : '위치를 확인하지 못했습니다.'
  })

  return { place, isLocating, errorMessage, request }
}
