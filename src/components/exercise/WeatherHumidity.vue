<script setup>
import { ref } from 'vue'
import { weatherData } from '@/data/weatherData'

// 요구사항 5-A) 본인 데이터 : 습도(humidity)
//   숫자 값을 게이지 바의 너비(%)로 변환해 눈에 보이게 만든다.
const weatherList = ref([...weatherData])
</script>

<template>
  <div class="practice-section">
    <h2>요구사항 5-A) 본인 데이터 : 습도 + :style 바인딩</h2>

    <div class="weather-card" v-for="city in weatherList" :key="city.id">
      <div class="card-info">
        <p class="city-name">{{ city.name }} ({{ city.status }})</p>

        <!-- 인라인 스타일 객체 바인딩 : humidity 값이 그대로 CSS width 가 된다. -->
        <div class="gauge-row">
          <span class="gauge-label">습도 {{ city.humidity }}%</span>
          <div class="gauge">
            <div class="gauge-fill" :style="{ width: city.humidity + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
