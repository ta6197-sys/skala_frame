<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { weatherData } from '@/data/weatherData'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import StatusBar from './StatusBar.vue'

// 과제 3: 과제 2(WeatherComposition)의 반응형 데이터를 기능 변경 없이 그대로 들고 온다.
// 상태와 로직은 전부 이 부모 컴포넌트에만 두고, 자식들은 props 로 받아 보여주기만 한다.
const weatherList = ref([...weatherData])

// 검색어 : 자식(SearchBar)이 emit 한 값을 여기서 받아 갱신
const searchQuery = ref('')
const handleUpdateQuery = (newQuery) => {
  searchQuery.value = newQuery
}

// 선택된 도시 / 상세보기 alert
const selectedCityInfo = ref(null)
const handleSelectCard = (city) => {
  selectedCityInfo.value = city
}
const handleClickDetail = (city) => {
  window.alert(`${city.name}의 현재 날씨는 [${city.status}] 상태입니다.`)
}

// 즐겨찾기 : 자식은 도시 이름만 보내고, 배열을 넣고 빼는 건 부모가 담당
const favorites = ref([])
const handleToggleFavorite = (cityName) => {
  if (favorites.value.includes(cityName)) {
    favorites.value = favorites.value.filter((name) => name !== cityName)
  } else {
    favorites.value.push(cityName)
  }
}
const clearFavorites = () => {
  favorites.value = []
}

// 상세 패널 토글 : 한 번에 한 카드만 열리도록 id 하나만 담아둔다
const openCity = ref('')
const handleToggleDetail = (cityId) => {
  openCity.value = openCity.value === cityId ? '' : cityId
}

const filteredWeatherList = computed(() =>
  weatherList.value.filter((city) => city.name.includes(searchQuery.value)),
)

watch(selectedCityInfo, (newVal) => {
  console.log(
    `[watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newVal?.name}가 선택되었습니다"`,
  )
})

watchEffect(() => {
  console.log(
    `[watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다`,
  )
})

const favoriteCount = computed(() => favorites.value.length)

watch(favoriteCount, (newVal, oldVal) => {
  console.log(`[watch] 즐겨찾기 개수가 ${oldVal}개 -> ${newVal}개로 변경되었습니다`)
})
</script>

<template>
  <div class="practice-section">
    <h2>과제 3: 날씨 (컴포넌트)</h2>

    <!-- 검색박스 : 껍데기는 BaseDashboardCard, 알맹이는 SearchBar 를 slot 으로 주입 -->
    <BaseDashboardCard>
      <template v-slot:title>도시 검색 (한글 즉시 동기화)</template>
      <SearchBar :search-query="searchQuery" @update-query="handleUpdateQuery" />
    </BaseDashboardCard>

    <!-- 즐겨찾기 요약 : 같은 껍데기를 재사용 -->
    <BaseDashboardCard>
      <template v-slot:title>즐겨찾기</template>
      <div class="favorite-row">
        <span class="favorite-list">
          <span v-if="favorites.length">{{ favorites.join(', ') }} ({{ favoriteCount }}개)</span>
          <span v-else>카드 왼쪽 체크박스로 즐겨찾기를 등록해 보세요.</span>
        </span>
        <button :disabled="favorites.length === 0" @click="clearFavorites">즐겨찾기 비우기</button>
      </div>
    </BaseDashboardCard>

    <!-- 리스트박스 : 같은 껍데기 안에 WeatherCard 를 v-for 로 주입 -->
    <BaseDashboardCard>
      <template v-slot:title>지역별 날씨 현황</template>
      <p v-if="filteredWeatherList.length === 0" class="no-result">
        검색 결과가 일치하는 도시가 없습니다.
      </p>
      <WeatherCard
        v-for="city in filteredWeatherList"
        :key="city.id"
        :city="city"
        :is-favorite="favorites.includes(city.name)"
        :is-open="openCity === city.id"
        @select-card="handleSelectCard"
        @click-detail="handleClickDetail"
        @toggle-favorite="handleToggleFavorite"
        @toggle-detail="handleToggleDetail"
      />
    </BaseDashboardCard>

    <StatusBar :selected-city-info="selectedCityInfo" />
  </div>
</template>

<style scoped>
/* slot 으로 주입한 마크업은 부모 스코프에서 컴파일되므로 이 scoped 스타일이 그대로 적용된다 */
.favorite-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.favorite-list {
  font-size: 14px;
  color: var(--c-text-sub);
}
.no-result {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: var(--c-text-muted);
}
</style>
