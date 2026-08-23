<script setup>
import { ref } from 'vue'
import { weatherData } from '@/data/weatherData'

const weatherList = ref([...weatherData])

// 요구사항 5-E) 펼쳐 둘 도시의 id (한 번에 하나만 열린다)
const openCity = ref('')

// 같은 버튼을 다시 누르면 닫히는 토글
const toggleDetailPanel = (cityId) => {
  openCity.value = openCity.value === cityId ? '' : cityId
}
</script>

<template>
  <div class="practice-section">
    <h2>요구사항 5-E) 상세 패널 : v-show 토글</h2>

    <div class="weather-card" v-for="city in weatherList" :key="city.id">
      <div class="card-info">
        <p class="city-name">{{ city.name }} ({{ city.status }})</p>

        <!-- v-if 와 달리 v-show 는 DOM 을 남겨두고 display:none 만 적용한다.
             자주 여닫는 영역이라 매번 생성/제거하지 않는 v-show 가 유리하다. -->
        <div v-show="openCity === city.id" class="detail-panel">
          <p>체감온도: {{ city.feelsLike }}°C</p>
          <p>풍속: {{ city.wind }}m/s</p>
          <p>강수확률: {{ city.rainProb }}%</p>
        </div>
      </div>

      <div class="card-actions">
        <button @click="toggleDetailPanel(city.id)">
          {{ openCity === city.id ? '접기' : '펼치기' }}
        </button>
      </div>
    </div>
  </div>
</template>
