<script setup>
import { ref } from 'vue'
import { weatherData } from '@/data/weatherData'

// 요구사항 1) 검색어, 선택된 도시, 날씨 리스트를 반응형 상태로 정의한다. (1일차와 동일한 상태 정의 방식)
const searchQuery = ref('')
const selectedCityInfo = ref(null)
const weatherList = ref([...weatherData])

const onSearchInput = (e) => {
  searchQuery.value = e.target.value
}
</script>

<template>
  <div class="practice-section">
    <h2>요구사항 1) 반응형 상태 관리</h2>

    <input
      type="text"
      :value="searchQuery"
      @input="onSearchInput"
      placeholder="검색할 도시 이름 입력"
      class="search-input"
    />
    <p class="search-result">검색 중인 도시: {{ searchQuery }}</p>

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
      <span v-if="selectedCityInfo">{{ selectedCityInfo.name }}가 선택되었습니다.</span>
      <span v-else>카드를 클릭하거나 검색해 보세요.</span>
    </div>
  </div>
</template>
