<script setup>
import { ref } from 'vue'
import { weatherData } from '@/data/weatherData'

// 요구사항 2) 기온 25도를 기준으로 라벨을 다르게 붙인다.
const weatherList = ref([...weatherData])
</script>

<template>
  <div class="practice-section">
    <h2>요구사항 2) 조건부 렌더링 (v-if / v-else)</h2>

    <div class="weather-card" v-for="city in weatherList" :key="city.id">
      <div class="card-info">
        <p class="city-name">{{ city.name }} ({{ city.status }})</p>
        <p class="city-temp">현재 기온: {{ city.temp }}°C</p>

        <!-- 라벨은 v-if / v-else 로 나누고, 색상은 배열 형식 :class 바인딩으로 구분한다. -->
        <p class="badge-row">
          <span v-if="city.temp >= 25" :class="['badge', 'badge-hot']">더움 (25도 이상)</span>
          <span v-else :class="['badge', 'badge-cool']">선선함 (25도 미만)</span>
        </p>
      </div>
    </div>
  </div>
</template>
