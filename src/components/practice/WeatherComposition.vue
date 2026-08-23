<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { logDev } from '@/utils/devLog'
import { weatherData } from '@/data/weatherData'

// 과제 2: 날씨 (Composition API) 통합 완성본
const weatherList = ref([...weatherData])

// 3) 검색어 : v-model 대신 :value + @input (한글 IME 조합 대응)
const searchQuery = ref('')
const onSearchInput = (e) => {
  searchQuery.value = e.target.value
}

// 4) 선택된 도시 / 상세보기 alert
const selectedCityInfo = ref(null)
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}

// 5-D) 즐겨찾기 (다중 checkbox → 배열 누적)
const favorites = ref([])
const clearFavorites = () => {
  favorites.value = []
}

// 5-E) 상세 패널 토글
const openCity = ref('')
const toggleDetailPanel = (cityId) => {
  openCity.value = openCity.value === cityId ? '' : cityId
}

const filteredWeatherList = computed(() =>
  weatherList.value.filter((city) => city.name.includes(searchQuery.value)),
)

watch(selectedCityInfo, (newVal) => {
  logDev(`[watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newVal?.name}가 선택되었습니다"`)
})

watchEffect(() => {
  logDev(
    `[watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다`,
  )
})

// 5) 본인만의 반응형 상태 + computed + watcher (즐겨찾기 개수 추적)
const favoriteCount = computed(() => favorites.value.length)

watch(favoriteCount, (newVal, oldVal) => {
  logDev(`[watch] 즐겨찾기 개수가 ${oldVal}개 -> ${newVal}개로 변경되었습니다`)
})
</script>

<template>
  <div class="practice-section">
    <h2>과제 2: 날씨 (컴포지션)</h2>

    <!-- 3) 양방향 바인딩 + 한글 처리 -->
    <h3>도시 검색</h3>
    <input
      type="text"
      :value="searchQuery"
      @input="onSearchInput"
      placeholder="검색할 도시 이름 입력"
      class="search-input"
    />
    <p class="search-result">검색 중인 도시: {{ searchQuery }}</p>

    <!-- 5-D) 즐겨찾기 요약 -->
    <h3>즐겨찾기</h3>
    <div class="favorite-bar">
      <span class="favorite-list">
        <span v-if="favorites.length">{{ favorites.join(', ') }} ({{ favorites.length }}개)</span>
        <span v-else>카드 왼쪽 체크박스로 즐겨찾기를 등록해 보세요.</span>
      </span>
      <button :disabled="favorites.length === 0" @click="clearFavorites">즐겨찾기 비우기</button>
    </div>

    <!-- 1) v-for 배열 렌더링 (:key 에 id 바인딩) + 2) computed 필터링 결과 -->
    <h3>지역별 날씨 현황</h3>
    <p v-if="filteredWeatherList.length === 0" class="no-result">
      검색 결과가 일치하는 도시가 없습니다.
    </p>
    <div
      class="weather-card"
      v-for="city in filteredWeatherList"
      :key="city.id"
      @click="selectedCityInfo = city"
    >
      <!-- 5-D) .stop 으로 즐겨찾기 체크와 카드 선택을 분리 -->
      <input type="checkbox" :value="city.name" v-model="favorites" @click.stop />

      <div class="card-info">
        <p class="city-name">{{ city.name }} ({{ city.status }})</p>
        <p class="city-temp">현재 기온: {{ city.temp }}°C</p>

        <p class="badge-row">
          <!-- 2) 25도 기준 조건부 렌더링 -->
          <span v-if="city.temp >= 25" :class="['badge', 'badge-hot']">더움 (25도 이상)</span>
          <span v-else :class="['badge', 'badge-cool']">선선함 (25도 미만)</span>

          <!-- 5-B) 미세먼지 3단계 -->
          <span v-if="city.dust < 30" :class="['badge', 'badge-good']">
            좋음 ({{ city.dust }})
          </span>
          <span v-else-if="city.dust < 80" :class="['badge', 'badge-normal']">
            보통 ({{ city.dust }})
          </span>
          <span v-else :class="['badge', 'badge-bad']">나쁨 ({{ city.dust }})</span>
        </p>

        <!-- 5-A) 습도 게이지 -->
        <div class="gauge-row">
          <span class="gauge-label">습도 {{ city.humidity }}%</span>
          <div class="gauge">
            <div class="gauge-fill" :style="{ width: city.humidity + '%' }"></div>
          </div>
        </div>

        <!-- 5-E) v-show 상세 패널 -->
        <div v-show="openCity === city.id" class="detail-panel">
          <p>체감온도: {{ city.feelsLike }}°C</p>
          <p>풍속: {{ city.wind }}m/s</p>
          <p>강수확률: {{ city.rainProb }}%</p>
        </div>
      </div>

      <div class="card-actions">
        <button @click.stop="toggleDetailPanel(city.id)">
          {{ openCity === city.id ? '접기' : '펼치기' }}
        </button>
        <!-- 4) 버블링 없이 alert -->
        <button @click.stop="showDetail(city.name, city.status)">상세보기</button>
      </div>
    </div>

    <!-- 4) 상태바 -->
    <div class="status-bar">
      <span v-if="selectedCityInfo">{{ selectedCityInfo.name }}가 선택되었습니다.</span>
      <span v-else>카드를 클릭하거나 검색해 보세요.</span>
    </div>
  </div>
</template>
