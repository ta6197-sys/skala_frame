<script setup>
import { ref } from 'vue'
import { weatherData } from '@/data/weatherData'

// 요구사항 5-B) 본인 데이터 : 미세먼지(dust)
// 요구사항 2 는 2분기(v-if/v-else)였으므로 여기서는 v-else-if 로 3분기를 다룬다.
const weatherList = ref([...weatherData])
</script>

<template>
  <div class="practice-section">
    <h2>요구사항 5-B) 본인 데이터 : 미세먼지 + v-else-if 3단계</h2>

    <div class="weather-card" v-for="city in weatherList" :key="city.id">
      <div class="card-info">
        <p class="city-name">{{ city.name }} ({{ city.status }})</p>

        <!-- 좋음(30 미만) / 보통(80 미만) / 나쁨(80 이상) -->
        <p class="badge-row">
          <span v-if="city.dust < 30" :class="['badge', 'badge-good']">
            좋음 ({{ city.dust }})
          </span>
          <span v-else-if="city.dust < 80" :class="['badge', 'badge-normal']">
            보통 ({{ city.dust }})
          </span>
          <span v-else :class="['badge', 'badge-bad']">나쁨 ({{ city.dust }})</span>
        </p>
      </div>
    </div>
  </div>
</template>
