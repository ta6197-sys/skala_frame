<script setup>
import { ref } from 'vue'
import { weatherData } from '@/data/weatherData'

// 요구사항 1) 임의의 날씨 데이터 배열을 화면에 반복 출력한다.
const weatherList = ref([...weatherData])
</script>

<template>
  <div class="practice-section">
    <h2>요구사항 1) 배열 렌더링 (v-for)</h2>

    <!-- :key 는 index 가 아니라 고유한 id 로 바인딩해야 한다.
         index 를 쓰면 목록이 삭제/정렬될 때 Vue 가 DOM 을 잘못 재사용한다. -->
    <div class="weather-card" v-for="city in weatherList" :key="city.id">
      <div class="card-info">
        <p class="city-name">{{ city.name }} ({{ city.status }})</p>
        <p class="city-temp">현재 기온: {{ city.temp }}°C</p>
      </div>
    </div>
  </div>
</template>
