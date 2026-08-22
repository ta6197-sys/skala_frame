<script setup>
import { useRoute, useRouter } from 'vue-router'

// 과제 4. Catch-all Route 가 잡아오는 화면.
// 어떤 주소로 잘못 들어왔는지 route.fullPath 로 보여주면 디버깅에도 도움이 된다.
// 과제 7. 직접 만든 마크업을 el-result 로 바꿨다. 아이콘·여백·제목 위계를 라이브러리가 잡아준다.
const route = useRoute()
const router = useRouter()

const goHome = () => {
  router.push({ name: 'WeatherHome' })
}
</script>

<template>
  <el-result icon="warning" title="페이지를 찾을 수 없습니다">
    <template #sub-title>
      <p class="not-found-text">
        요청하신 주소 <code>{{ route.fullPath }}</code> 는<br />
        존재하지 않거나 아직 만들어지지 않았습니다.
      </p>
    </template>

    <template #extra>
      <el-button type="primary" @click="goHome">날씨 대시보드로 이동</el-button>
    </template>
  </el-result>
</template>

<style scoped>
.not-found-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: var(--c-text-muted);
}
code {
  padding: 2px 6px;
  background-color: var(--c-surface-mute);
  border-radius: 4px;
  color: var(--c-hot);
}
</style>
