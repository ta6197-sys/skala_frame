<script setup>
import { ref } from 'vue'
import { weatherData } from '@/data/weatherData'

const weatherList = ref([...weatherData])

// 요구사항 4) 카드를 누르면 상태바에 선택된 도시를 표시한다.
const selectedCity = ref('')

// 요구사항 4) 카드 내부 [상세보기] 버튼은 버블링 없이 alert 만 띄운다.
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="practice-section">
    <h2>요구사항 4) 이벤트 및 수식어 (@click, .stop)</h2>

    <!-- 카드 본체는 버블링을 '활용'한다.
         내부 <p> 를 눌러도 이벤트가 카드까지 올라와 @click 이 실행된다. -->
    <div
      class="weather-card"
      v-for="city in weatherList"
      :key="city.id"
      @click="selectedCity = city.name"
    >
      <div class="card-info">
        <p class="city-name">{{ city.name }} ({{ city.status }})</p>
        <p class="city-temp">현재 기온: {{ city.temp }}°C</p>
      </div>

      <!-- 버튼만 .stop 으로 버블링을 '차단'한다.
           .stop 이 없으면 alert 후 부모의 @click 까지 실행되어 상태바가 함께 바뀐다. -->
      <div class="card-actions">
        <button @click.stop="showDetail(city.name, city.status)">상세보기</button>
      </div>
    </div>

    <div class="status-bar">
      <span v-if="selectedCity">{{ selectedCity }}가 선택되었습니다.</span>
      <span v-else>카드를 클릭하거나 검색해 보세요.</span>
    </div>
  </div>
</template>
