<script setup>
import { ref } from 'vue'
import { weatherData } from '@/data/weatherData'

const weatherList = ref([...weatherData])

// 요구사항 5-D) 다중 checkbox + v-model 이므로 배열에 도시명이 누적된다.
const favorites = ref([])

// 선택된 항목이 없으면 버튼이 :disabled 로 잠긴다.
const clearFavorites = () => {
  favorites.value = []
}
</script>

<template>
  <div class="practice-section">
    <h2>요구사항 5-D) 즐겨찾기 : 다중 checkbox + :disabled</h2>

    <div class="favorite-bar">
      <span class="favorite-list">
        <span v-if="favorites.length">{{ favorites.join(', ') }} ({{ favorites.length }}개)</span>
        <span v-else>카드 왼쪽 체크박스로 즐겨찾기를 등록해 보세요.</span>
      </span>
      <button :disabled="favorites.length === 0" @click="clearFavorites">즐겨찾기 비우기</button>
    </div>

    <div class="weather-card" v-for="city in weatherList" :key="city.id">
      <!-- value 를 바인딩한 다중 checkbox 는 체크된 값이 favorites 배열에 쌓인다. -->
      <input type="checkbox" :value="city.name" v-model="favorites" />

      <div class="card-info">
        <p class="city-name">{{ city.name }} ({{ city.status }})</p>
      </div>
    </div>
  </div>
</template>
