<script setup>
import { ref, watch, watchEffect } from 'vue'
import { logDev } from '@/utils/devLog'
import { weatherData } from '@/data/weatherData'

const searchQuery = ref('')
const selectedCityInfo = ref(null)
const weatherList = ref([...weatherData])

const onSearchInput = (e) => {
  searchQuery.value = e.target.value
}

// 요구사항 3-a) selectedCityInfo 감시 (watch) : 상태바 문구가 바뀔 때마다 콘솔로그를 남긴다.
watch(selectedCityInfo, (newVal) => {
  logDev(`[watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newVal?.name}가 선택되었습니다"`)
})

// 요구사항 3-b) searchQuery 감시 (watchEffect) : 타이핑할 때마다 자동으로 추적해서 콘솔로그를 남긴다.
watchEffect(() => {
  logDev(
    `[watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다`,
  )
})
</script>

<template>
  <div class="practice-section">
    <h2>요구사항 3) 반응형 변수 변화 감시 (watch, watchEffect)</h2>

    <input
      type="text"
      :value="searchQuery"
      @input="onSearchInput"
      placeholder="검색할 도시 이름 입력 (콘솔에서 watchEffect 로그 확인)"
      class="search-input"
    />

    <div
      class="weather-card"
      v-for="city in weatherList"
      :key="city.id"
      @click="selectedCityInfo = city"
    >
      <div class="card-info">
        <p class="city-name">{{ city.name }} ({{ city.status }})</p>
        <p class="city-temp">현재 기온: {{ city.temp }}°C</p>
      </div>
    </div>

    <div class="status-bar">
      <span v-if="selectedCityInfo">
        {{ selectedCityInfo.name }}가 선택되었습니다. (콘솔에서 watch 로그 확인)
      </span>
      <span v-else>카드를 클릭하거나 검색해 보세요.</span>
    </div>
  </div>
</template>
