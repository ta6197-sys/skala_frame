<script setup>
import { ref, computed } from 'vue'
import { weatherData } from '@/data/weatherData'

const searchQuery = ref('')
const weatherList = ref([...weatherData])

const onSearchInput = (e) => {
  searchQuery.value = e.target.value
}

// 요구사항 2) 전체 리스트 중 검색어가 도시 이름에 포함된 항목만 computed 로 필터링한다.
const filteredWeatherList = computed(() =>
  weatherList.value.filter((city) => city.name.includes(searchQuery.value)),
)
</script>

<template>
  <div class="practice-section">
    <h2>요구사항 2) 검색 도시 (computed 활용)</h2>

    <input
      type="text"
      :value="searchQuery"
      @input="onSearchInput"
      placeholder="검색할 도시 이름 입력"
      class="search-input"
    />

    <div class="weather-card" v-for="city in filteredWeatherList" :key="city.id">
      <div class="card-info">
        <p class="city-name">{{ city.name }} ({{ city.status }})</p>
        <p class="city-temp">현재 기온: {{ city.temp }}°C</p>
      </div>
    </div>
  </div>
</template>
