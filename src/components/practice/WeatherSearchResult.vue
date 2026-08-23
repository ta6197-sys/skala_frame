<script setup>
import { ref, computed } from 'vue'
import { weatherData } from '@/data/weatherData'

const searchQuery = ref('')
const weatherList = ref([...weatherData])

const onSearchInput = (e) => {
  searchQuery.value = e.target.value
}

const filteredWeatherList = computed(() =>
  weatherList.value.filter((city) => city.name.includes(searchQuery.value)),
)
</script>

<template>
  <div class="practice-section">
    <h2>요구사항 4) 검색 결과 표시</h2>

    <input
      type="text"
      :value="searchQuery"
      @input="onSearchInput"
      placeholder="검색할 도시 이름 입력"
      class="search-input"
    />

    <!-- 검색어가 비었을 때는 filteredWeatherList 가 전체 리스트와 같아서(includes('')는 항상 true)
         별도 분기 없이도 자동으로 원본이 출력된다. -->
    <div class="weather-card" v-for="city in filteredWeatherList" :key="city.id">
      <div class="card-info">
        <p class="city-name">{{ city.name }} ({{ city.status }})</p>
        <p class="city-temp">현재 기온: {{ city.temp }}°C</p>
      </div>
    </div>

    <p v-if="filteredWeatherList.length === 0" class="no-result">
      검색 결과가 일치하는 도시가 없습니다.
    </p>
  </div>
</template>
