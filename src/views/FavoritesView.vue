<script setup>
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useRecentStore } from '@/stores/recentStore'
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'

// 과제 5(요구사항 4). 과제 4 때는 favorites 가 홈의 지역 상태라 만들 수 없었던 화면.
// 스토어로 올리고 나니 이 view 는 상태를 하나도 갖지 않고 스토어만 읽으면 끝난다.
// 과제 7. fetchAll() 호출을 뺐다(App.vue 로 이동). 목록도 홈과 같은 카드 그리드를 쓴다.
//         "전부 비우기" 는 되돌릴 수 없는 동작이라 ElMessageBox 로 한 번 물어본다.
const router = useRouter()
const favoritesStore = useFavoritesStore()
const recentStore = useRecentStore()

const goDetail = (cityId) => {
  router.push('/weather/' + cityId)
}

const confirmClear = () => {
  ElMessageBox.confirm(
    `즐겨찾기 ${favoritesStore.favoriteCount}개를 모두 지웁니다. 되돌릴 수 없습니다.`,
    '즐겨찾기 비우기',
    {
      confirmButtonText: '전부 지우기',
      cancelButtonText: '취소',
      type: 'warning',
    },
  )
    .then(() => {
      favoritesStore.clearFavorites()
      ElMessage.success('즐겨찾기를 비웠습니다.')
    })
    .catch(() => {
      ElMessage.info('취소했습니다.')
    })
}
</script>

<template>
  <div>
    <h3>즐겨찾기</h3>

    <BaseDashboardCard>
      <template v-slot:title>내가 등록한 도시 ({{ favoritesStore.favoriteCount }}개)</template>

      <el-empty
        v-if="favoritesStore.favoriteCount === 0"
        description="아직 등록한 도시가 없습니다."
        :image-size="80"
      >
        <el-button type="primary" plain @click="router.push('/')">
          대시보드에서 등록하러 가기
        </el-button>
      </el-empty>

      <template v-else>
        <div class="city-grid">
          <WeatherCard
            v-for="city in favoritesStore.favoriteCities"
            :key="city.id"
            :city="city"
            @select-card="goDetail(city.id)"
            @click-detail="goDetail"
          />
        </div>

        <el-button class="clear-btn" type="warning" plain @click="confirmClear">
          즐겨찾기 전부 비우기
        </el-button>
      </template>
    </BaseDashboardCard>

    <BaseDashboardCard v-if="recentStore.hasRecent">
      <template v-slot:title>최근 본 도시</template>
      <div class="recent-row">
        <el-tag
          v-for="city in recentStore.recentCities"
          :key="city.id"
          class="recent-chip"
          effect="plain"
          round
          @click="goDetail(city.id)"
        >
          {{ city.name }}
        </el-tag>
      </div>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.city-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-3);
}
.clear-btn {
  width: 100%;
  margin-top: var(--space-3);
}
.recent-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}
.recent-chip {
  cursor: pointer;
}
</style>
