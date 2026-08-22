<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { useFavoritesStore } from '@/stores/favoritesStore'

// 과제 4: 도시 한 곳을 카드 한 장으로 그린다.
// 과제 5: 단위(configStore)와 즐겨찾기(favoritesStore)는 부모를 거치지 않고 스토어에서 직접 읽는다.
// - 그래서 과제 4 까지 있던 isFavorite props 와 toggle-favorite emit 이 사라졌다.
// - 다만 "어디로 이동할지"는 여전히 부모가 정할 일이라 select-card / click-detail emit 은 그대로 둔다.
//
// 과제 7. 이 컴포넌트가 지키는 규칙을 명시해 둔다 (다음에 고칠 때 헷갈리지 않도록).
//   1) 값은 한 곳에서만 태어난다 - 온도 변환식은 configStore.convertTemp 한 곳에만 있다.
//   2) 아래로는 props, 위로는 emit, 옆으로는 store - 형제 카드끼리 직접 주고받지 않는다.
//   3) 읽기는 getter, 쓰기는 action - favoritesStore.favoriteIds 에 직접 대입하지 않고 toggleFavorite 를 부른다.
//
// 과제 7 변경점:
// - 가로형(좌우 배치) → 세로형. 홈이 카드 그리드로 바뀌면서 칸에 맞는 모양이 필요해졌다.
// - 날씨 아이콘 추가. API 가 icon 코드를 주고 있었는데(api/weather.js) 과제 6 까지 아무 화면도 안 썼다.
//   Vue.pdf p.6 이 지적한 "데이터만 추가하고 화면에서 안 쓰는" 상태였다. 추가 호출 없이 그릴 수 있다.
// - 손으로 만든 .badge → el-tag, .gauge → el-progress, checkbox → el-checkbox, button → el-button.
const props = defineProps({
  city: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['select-card', 'click-detail'])

const configStore = useConfigStore()
const favoritesStore = useFavoritesStore()

// 기본 원본 데이터는 섭씨 숫자. 변환식은 configStore 의 convertTemp getter 한 곳에만 있다.
const displayTemp = computed(() => configStore.convertTemp(props.city.temp))
const dustGrade = computed(() => configStore.dustGrade(props.city.dust))

// OpenWeatherMap 아이콘 주소. 폴백(목업) 데이터에는 icon 이 없으므로 null 이 되고, 템플릿의 v-if 가 걸러낸다.
const iconUrl = computed(() =>
  props.city.icon ? `https://openweathermap.org/img/wn/${props.city.icon}@2x.png` : null,
)

// 과제 7. el-tag 의 type 을 문자열로 넘겨야 해서, 판정 결과를 태그 타입으로 옮기는 표를 둔다.
// Vue.pdf p.6 의 "색상을 하드코딩하지 않고 :class / :style 로 동적 표현" 과 같은 방향이다.
// 색을 CSS 에 박는 대신 상태값이 태그 종류를 고르게 한다.
const dustTag = computed(() => {
  if (dustGrade.value === 'good')
    return { type: 'success', text: `미세먼지 좋음 ${props.city.dust}` }
  if (dustGrade.value === 'normal')
    return { type: 'warning', text: `미세먼지 보통 ${props.city.dust}` }
  return { type: 'danger', text: `미세먼지 나쁨 ${props.city.dust}` }
})

// 습도 게이지 색도 값에 따라 바뀐다. 60% 넘으면 눅눅하다는 신호로 색을 올린다.
// 과제 7. hex 대신 토큰 이름을 넘긴다. el-progress 는 이 값을 인라인 style 의 background-color 로
// 그대로 꽂기 때문에 var(--c-cool) 형태가 브라우저에서 정상 해석된다.
// 카드가 색을 직접 아는 상태(#3498db)를 없애서, 팔레트를 바꿔도 이 파일은 손댈 일이 없다.
const humidityColor = computed(() => {
  if (props.city.humidity >= 80) return 'var(--c-cool)'
  if (props.city.humidity >= 60) return 'var(--c-brand)'
  return 'var(--c-normal)'
})
</script>

<template>
  <div class="weather-card" @click="emit('select-card', city)">
    <header class="card-head">
      <!-- 즐겨찾기: 이제 부모의 배열이 아니라 스토어를 직접 보고 action 으로 고친다 -->
      <el-checkbox
        :model-value="favoritesStore.isFavorite(city.id)"
        size="large"
        @click.stop
        @change="favoritesStore.toggleFavorite(city.id)"
      />
      <p class="city-name">{{ city.name }}</p>
    </header>

    <div class="card-main">
      <!-- 과제 7. 이미 받아오고 있던 icon 코드를 처음으로 화면에 쓴다 -->
      <img
        v-if="iconUrl"
        class="card-icon"
        :src="iconUrl"
        :alt="city.status"
        width="72"
        height="72"
      />
      <div class="card-temp-box">
        <p class="card-temp num">
          {{ displayTemp }}<span class="card-unit">{{ configStore.unitSymbol }}</span>
        </p>
        <p class="card-status">{{ city.status }}</p>
      </div>
    </div>

    <div class="card-tags">
      <!-- 판정은 단위와 상관없이 원본 섭씨(city.temp) 기준. 기준값 자체는 설정 화면에서 사용자가 정한다 -->
      <el-tag
        :type="configStore.isHot(city.temp) ? 'danger' : 'primary'"
        size="small"
        effect="dark"
        round
      >
        {{ configStore.isHot(city.temp) ? '더움' : '선선함' }} · {{ configStore.hotThreshold }}도
        기준
      </el-tag>
      <!-- 미세먼지 3단계. 경계값 30/80 도 스토어가 들고 있다 -->
      <el-tag :type="dustTag.type" size="small" effect="light" round>{{ dustTag.text }}</el-tag>
    </div>

    <div class="card-gauge">
      <span class="gauge-label">습도</span>
      <el-progress
        :percentage="city.humidity"
        :color="humidityColor"
        :stroke-width="10"
        :show-text="false"
        class="gauge-bar"
      />
      <span class="gauge-value">{{ city.humidity }}%</span>
    </div>

    <!-- 과제 4 핵심: window.alert 대신 부모에게 id 를 넘겨 라우터 이동을 요청한다 -->
    <el-button type="primary" class="card-btn" @click.stop="emit('click-detail', city.id)">
      상세보기 →
    </el-button>
  </div>
</template>

<style scoped>
/* 과제 7. 가로형에서 세로형으로. 홈의 카드 그리드 한 칸에 들어가는 모양이다.
   같은 이름의 클래스가 assets/weather.css 에도 있지만(과제 1~3 화면용), 이쪽은 scoped 라 서로 침범하지 않는다. */
.weather-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  margin-bottom: 0;
  background-color: var(--c-surface);
  border: 1px solid var(--c-line);
  border-radius: var(--radius-m);
  cursor: pointer;
  transition:
    border-color var(--dur) ease,
    background-color var(--dur) ease;
}
/* 과제 7. hover 를 "떠오르기(translateY + 그림자)" 에서 "선이 진해지기" 로 바꿨다.
   카드가 그리드에 6장 깔리는데 마우스가 지나갈 때마다 칸이 들썩이면 목록을 훑기가 어렵다.
   Vercel 대시보드가 카드 hover 에 그림자를 안 쓰는 이유도 같다. 레이아웃이 움직이지 않는다. */
.weather-card:hover {
  border-color: var(--c-line-strong);
  background-color: var(--c-surface-soft);
}
.card-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.city-name {
  margin: 0;
  font-size: var(--fs-h3);
  font-weight: var(--fw-bold);
  color: var(--c-text);
}
.card-main {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.card-icon {
  flex-shrink: 0;
  /* 아이콘 원본이 여백을 크게 물고 있어서 살짝 키워야 숫자와 균형이 맞는다 */
  margin: -8px 0 -8px -8px;
}
.card-temp-box {
  min-width: 0;
}
/* 과제 7. 카드에서 가장 먼저 읽혀야 하는 것은 기온이다. 도시명(17px)의 두 배 가까이 키워
   위계를 분명히 했다. .num 유틸(base.css)이 붙어 있어서 8도 → 21도 로 자릿수가 바뀌어도
   숫자 폭이 고정된다. 10분마다 자동 갱신되는 화면이라 이게 없으면 카드가 미세하게 흔들린다. */
.card-temp {
  margin: 0;
  font-size: var(--fs-h1);
  font-weight: var(--fw-bold);
  line-height: var(--lh-tight);
  letter-spacing: -0.02em;
  color: var(--c-text);
}
.card-unit {
  margin-left: 2px;
  font-size: var(--fs-h3);
  font-weight: var(--fw-medium);
  color: var(--c-text-muted);
}
.card-status {
  margin: 2px 0 0 0;
  font-size: var(--fs-sm);
  color: var(--c-text-muted);
}
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}
.card-gauge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.gauge-label {
  font-size: var(--fs-xs);
  color: var(--c-text-muted);
}
.gauge-bar {
  flex: 1;
}
.gauge-value {
  min-width: 38px;
  font-size: var(--fs-xs);
  color: var(--c-text-sub);
  text-align: right;
}
.card-btn {
  width: 100%;
}
</style>
