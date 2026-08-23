<script setup>
import WeatherBadge from './WeatherBadge.vue'
import HumidityGauge from './HumidityGauge.vue'

// 과제 3: 선택된 도시 객체를 props 로 전달 받아 카드 한 장을 그린다.
// - 상태는 하나도 갖지 않고, 사용자가 무엇을 눌렀는지만 부모에게 emit 으로 알린다.
defineProps({
  city: {
    type: Object,
    required: true,
  },
  isFavorite: {
    type: Boolean,
    required: true,
  },
  isOpen: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['select-card', 'click-detail', 'toggle-favorite', 'toggle-detail'])
</script>

<template>
  <div class="weather-card" @click="emit('select-card', city)">
    <!-- 즐겨찾기 체크박스: 부모의 favorites 배열을 직접 못 바꾸므로 :checked 로 받고 @change 로 되돌려 준다 -->
    <input
      type="checkbox"
      :checked="isFavorite"
      @click.stop
      @change="emit('toggle-favorite', city.name)"
    />

    <div class="card-info">
      <p class="city-name">{{ city.name }} ({{ city.status }})</p>
      <p class="city-temp">현재 기온: {{ city.temp }}°C</p>

      <p class="badge-row">
        <!-- 25도 기준 조건부 렌더링 -->
        <WeatherBadge v-if="city.temp >= 25" type="hot" text="더움 (25도 이상)" />
        <WeatherBadge v-else type="cool" text="선선함 (25도 미만)" />

        <!-- 미세먼지 3단계 -->
        <WeatherBadge v-if="city.dust < 30" type="good" :text="`좋음 (${city.dust})`" />
        <WeatherBadge v-else-if="city.dust < 80" type="normal" :text="`보통 (${city.dust})`" />
        <WeatherBadge v-else type="bad" :text="`나쁨 (${city.dust})`" />
      </p>

      <HumidityGauge :humidity="city.humidity" />

      <!-- v-show 상세 패널 (열림 여부는 부모가 관리) -->
      <div v-show="isOpen" class="detail-panel">
        <p>체감온도: {{ city.feelsLike }}°C</p>
        <p>풍속: {{ city.wind }}m/s</p>
        <p>강수확률: {{ city.rainProb }}%</p>
      </div>
    </div>

    <div class="card-actions">
      <button @click.stop="emit('toggle-detail', city.id)">
        {{ isOpen ? '접기' : '펼치기' }}
      </button>
      <!-- 버블링 없이 alert (실제 alert 는 부모가 띄운다) -->
      <button @click.stop="emit('click-detail', city)">상세보기</button>
    </div>
  </div>
</template>

<style scoped>
.weather-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 10px;
  background-color: var(--c-surface);
  border: 1px solid var(--c-line);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.weather-card:hover {
  border-color: var(--c-text-faint);
  background-color: var(--c-surface-soft);
}
.card-info {
  flex: 1;
}
.card-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.city-name {
  margin: 0;
  font-weight: 600;
}
.city-temp {
  margin: 2px 0 6px 0;
  font-size: 14px;
  color: var(--c-text-sub);
}
.badge-row {
  display: flex;
  gap: 6px;
  margin: 0 0 8px 0;
}
.detail-panel {
  margin-top: 10px;
  padding: 10px 12px;
  font-size: 13px;
  color: var(--c-text-sub);
  background-color: var(--c-surface-mute);
  border-left: 3px solid var(--c-brand);
  border-radius: 4px;
}
.detail-panel p {
  margin: 2px 0;
}
</style>
