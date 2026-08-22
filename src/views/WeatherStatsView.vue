<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'

// 요구사항 6. 본인이 추가한 view - 도시 6개를 집계해서 보여주는 통계 페이지.
// 과제 6. 집계 대상이 목업 배열에서 weatherStore 의 실시간 목록으로 바뀌었다. 계산식은 그대로다.
// 과제 7. 두 가지가 바뀌었다.
//   1) 평균·랭킹·최고/최저 계산을 weatherStore.summary getter 로 올렸다.
//      홈 화면에도 같은 요약이 필요해졌는데, 계산식을 복사하면 평균 구하는 방식이 두 곳에 생겨 나중에 갈라진다.
//      "값은 한 곳에서만 태어난다" 원칙대로 스토어에 두고 두 화면이 같은 것을 읽는다.
//   2) fetchAll() 호출을 뺐다. App.vue 한 곳에서만 부른다. 이 화면은 이제 스토어를 읽기만 한다.
const router = useRouter()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()

const summary = computed(() => weatherStore.summary)

// 미세먼지 나쁨 판정은 사용자가 정한 경계값(configStore)에 걸려 있어서 화면에서 센다.
// weatherStore 가 configStore 를 끌어다 쓰면 스토어끼리 얽히므로 그 선을 넘지 않는다.
const dustBadCities = computed(() =>
  weatherStore.cityList.filter((city) => configStore.dustGrade(city.dust) === 'bad'),
)

// 막대 길이 계산용 - 가장 더운 도시를 100% 로 잡는다.
// 여기는 일부러 원본 섭씨로 계산한다. 화씨는 0 이 기준점이 아니라서(32 부터 시작) 변환값으로 비율을 내면
// 막대 길이가 전부 균등해져 버린다.
const barPercent = (temp) => {
  const top = summary.value?.hottest?.temp || 1
  return Math.round((temp / top) * 100)
}

// 통계표의 도시를 클릭하면 그대로 상세 페이지로 이동한다.
const goDetail = (cityId) => {
  router.push('/weather/' + cityId)
}
</script>

<template>
  <div>
    <h3>도시 통계</h3>

    <el-empty v-if="!summary" description="아직 집계할 데이터가 없습니다." :image-size="80" />

    <template v-else>
      <BaseDashboardCard>
        <template v-slot:title>전체 요약 ({{ summary.count }}개 도시)</template>
        <div class="summary-grid">
          <el-statistic
            :value="configStore.convertTemp(summary.avgTemp)"
            :precision="1"
            :suffix="configStore.unitSymbol"
          >
            <template #title>평균 기온</template>
          </el-statistic>
          <el-statistic :value="summary.avgHumidity" suffix="%">
            <template #title>평균 습도</template>
          </el-statistic>
          <el-statistic
            :value="configStore.convertTemp(summary.hottest.temp)"
            :precision="1"
            :suffix="configStore.unitSymbol"
          >
            <template #title>최고 · {{ summary.hottest.name }}</template>
          </el-statistic>
          <el-statistic
            :value="configStore.convertTemp(summary.coldest.temp)"
            :precision="1"
            :suffix="configStore.unitSymbol"
          >
            <template #title>최저 · {{ summary.coldest.name }}</template>
          </el-statistic>
        </div>
      </BaseDashboardCard>

      <BaseDashboardCard>
        <template v-slot:title>기온 랭킹 (클릭하면 상세 페이지로 이동)</template>
        <div
          v-for="(city, index) in summary.ranking"
          :key="city.id"
          class="rank-row"
          @click="goDetail(city.id)"
        >
          <span class="rank-no">{{ index + 1 }}</span>
          <span class="rank-name">{{ city.name }}</span>
          <!-- 과제 7 : 손으로 만든 막대 → el-progress. 색은 판정 결과가 고른다 -->
          <el-progress
            class="rank-bar"
            :percentage="barPercent(city.temp)"
            :color="configStore.isHot(city.temp) ? 'var(--c-hot)' : 'var(--c-cool)'"
            :stroke-width="12"
            :show-text="false"
          />
          <span class="rank-temp">
            {{ configStore.convertTemp(city.temp) }}{{ configStore.unitSymbol }}
          </span>
        </div>
      </BaseDashboardCard>

      <BaseDashboardCard>
        <template v-slot:title>주의가 필요한 도시</template>
        <div class="alert-line">
          <el-tag type="danger" effect="dark" round size="small">미세먼지 나쁨</el-tag>
          <template v-if="dustBadCities.length">
            <el-tag
              v-for="city in dustBadCities"
              :key="city.id"
              effect="plain"
              round
              size="small"
              class="alert-chip"
              @click="goDetail(city.id)"
            >
              {{ city.name }} {{ city.dust }}
            </el-tag>
          </template>
          <span v-else class="alert-none">해당 없음</span>
        </div>

        <div class="alert-line">
          <el-tag type="primary" effect="dark" round size="small">강수확률 40% 이상</el-tag>
          <template v-if="summary.rainy.length">
            <el-tag
              v-for="city in summary.rainy"
              :key="city.id"
              effect="plain"
              round
              size="small"
              class="alert-chip"
              @click="goDetail(city.id)"
            >
              {{ city.name }} {{ city.rainProb }}%
            </el-tag>
          </template>
          <span v-else class="alert-none">해당 없음</span>
        </div>
      </BaseDashboardCard>
    </template>
  </div>
</template>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-3);
}
.summary-grid :deep(.el-statistic__head) {
  font-size: 12px;
  color: var(--c-text-muted);
}
.summary-grid :deep(.el-statistic__content) {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--c-text);
}
.rank-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  margin-bottom: 6px;
  background-color: var(--c-surface);
  border: 1px solid var(--c-line);
  border-radius: var(--radius-s);
  cursor: pointer;
  transition: all 0.15s ease;
}
.rank-row:hover {
  border-color: var(--c-brand);
  background-color: var(--c-surface-soft);
}
.rank-no {
  width: 20px;
  font-size: 13px;
  font-weight: 700;
  color: var(--c-text-faint);
  text-align: center;
}
.rank-name {
  width: 48px;
  font-size: 14px;
  font-weight: 600;
  color: var(--c-text);
}
.rank-bar {
  flex: 1;
}
.rank-temp {
  width: 56px;
  font-size: 13px;
  color: var(--c-text-sub);
  text-align: right;
}
.alert-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin: 0 0 10px 0;
  font-size: 14px;
  color: var(--c-text-sub);
}
.alert-line:last-child {
  margin-bottom: 0;
}
.alert-chip {
  cursor: pointer;
}
.alert-none {
  color: var(--c-text-faint);
  font-size: 13px;
}
</style>
