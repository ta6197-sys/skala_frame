<script setup>
import { ref, computed, watch } from 'vue'
import { weatherData } from '@/data/weatherData'

const weatherList = ref([...weatherData])

// 요구사항 5) 본인만의 반응형 상태 : 즐겨찾기 목록 (다중 체크박스로 누적)
const favorites = ref([])

// 본인만의 computed : 즐겨찾기 개수
const favoriteCount = computed(() => favorites.value.length)

// 본인만의 watcher : 즐겨찾기 개수가 바뀔 때마다 콘솔로그
watch(favoriteCount, (newVal, oldVal) => {
  console.log(`[watch] 즐겨찾기 개수가 ${oldVal}개 -> ${newVal}개로 변경되었습니다`)
})
</script>

<template>
  <div class="practice-section">
    <h2>요구사항 5) 본인만의 상태 · Computed · Watcher (즐겨찾기 개수)</h2>

    <p class="favorite-count">즐겨찾기 {{ favoriteCount }}개 선택됨 (콘솔에서 watch 로그 확인)</p>

    <div class="weather-card" v-for="city in weatherList" :key="city.id">
      <input type="checkbox" :value="city.name" v-model="favorites" />
      <div class="card-info">
        <p class="city-name">{{ city.name }} ({{ city.status }})</p>
      </div>
    </div>
  </div>
</template>
