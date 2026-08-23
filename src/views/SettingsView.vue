<script setup>
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// 과제 8. 온디맨드 전환 후 추가한 두 줄.
// <el-xxx> 태그는 플러그인이 템플릿에서 찾아 CSS 까지 같이 붙여주지만, ElMessage / ElMessageBox 는
// 템플릿이 아니라 코드에서 부르는 것이라 플러그인 눈에 띄지 않는다. 스타일을 직접 챙겨야 한다.
// (안 붙이면 에러 없이 흰 배경에 테두리 없는 알림이 뜬다 - 실제로 그렇게 한 번 나왔다)
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-message-box.css'
import 'element-plus/theme-chalk/el-overlay.css'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'
import BaseDashboardCard from '@/components/common/BaseDashboardCard.vue'

// 과제 5(요구사항 4). "내 기준" 설정 화면
// 과제 1에서 강사가 정해준 25도/30/80 이라는 숫자를 사용자가 직접 옮길 수 있게 만든 페이지.
// 이 화면은 자기 상태를 하나도 갖지 않는다. 값은 전부 configStore 에 있고 여기서는 읽고 액션을 부를 뿐이다.
//
// 과제 7. UI 라이브러리를 가장 크게 적용한 화면이다.
//   input[type=range] → el-slider, input[type=radio] → el-radio-group + el-radio-button,
//   되돌리기 버튼 → el-button + ElMessageBox.confirm, 결과 안내 → ElMessage
//   참고 파일 practices/library/ElementPlus.vue 의 실습 2번(수량·별점)·3번(확인창) 과 같은 패턴이다.
//
// 여기서도 v-model 은 쓰지 않는다. el-slider 에 v-model 을 걸면 스토어 state 에 직접 대입하게 되고,
// 그러면 setDustGoodMax / setDustBadMin 안의 "두 경계가 서로를 넘지 못하게 막는" 보정이 통째로 우회된다.
// :model-value 로 읽고 @input 으로 액션을 부른다. 읽기는 getter, 쓰기는 action.
//
// fetchAll() 호출도 여기서 뺐다. 과제 7 부터 App.vue 한 곳에서만 부른다.
const configStore = useConfigStore()
const weatherStore = useWeatherStore()

// 설정을 바꾸면 전체 도시 판정이 어떻게 갈리는지 바로 보여주는 미리보기
const hotCities = computed(() =>
  weatherStore.cityList.filter((city) => configStore.isHot(city.temp)),
)
const dustCounts = computed(() => {
  const counts = { good: 0, normal: 0, bad: 0 }
  weatherStore.cityList.forEach((city) => {
    counts[configStore.dustGrade(city.dust)] += 1
  })
  return counts
})

// el-slider 의 :marks 는 { 값: 라벨 } 형태의 객체를 받는다. 눈금이 있으면 어디쯤인지 감이 온다.
const hotMarks = { 15: '15', 20: '20', 25: '기본', 30: '30', 35: '35' }

// 되돌리기는 되돌릴 수 없는 동작이라 한 번 물어본다.
// 참고 파일의 confirmDelete 와 같은 형태: .then 이 확인, .catch 가 취소다.
const confirmReset = () => {
  ElMessageBox.confirm(
    '더움 기준 온도 · 미세먼지 경계 · 체질을 모두 기본값(25℃ / 30 / 80 / 보통)으로 되돌립니다.',
    '설정 초기화',
    {
      confirmButtonText: '되돌리기',
      cancelButtonText: '취소',
      type: 'warning',
    },
  )
    .then(() => {
      configStore.resetSettings()
      ElMessage.success('기본값으로 되돌렸습니다.')
    })
    .catch(() => {
      ElMessage.info('초기화를 취소했습니다.')
    })
}
</script>

<template>
  <div>
    <h3>내 기준 설정</h3>

    <el-alert
      class="alert-gap"
      title="여기서 정한 값은 대시보드 · 상세 · 통계 화면의 판정 기준으로 바로 반영됩니다. 새로고침해도 유지됩니다(localStorage)."
      type="info"
      show-icon
      :closable="false"
    />

    <BaseDashboardCard>
      <template v-slot:title>온도 단위</template>
      <div class="setting-row">
        <span class="setting-label">현재 단위</span>
        <el-tag type="primary" effect="light" round>{{ configStore.unitLabel }}</el-tag>
        <el-button size="small" @click="configStore.toggleUnit">단위변경</el-button>
      </div>
    </BaseDashboardCard>

    <BaseDashboardCard>
      <template v-slot:title>"더움" 기준 온도</template>
      <!-- 과제 7 : input[type=range] → el-slider.
           v-model 로 스토어 state 를 직접 물리지 않고 :model-value + @input 으로 액션을 거친다. -->
      <el-slider
        :model-value="configStore.hotThreshold"
        :min="15"
        :max="35"
        :step="1"
        :marks="hotMarks"
        show-input
        :show-input-controls="false"
        class="setting-slider"
        @input="configStore.setHotThreshold($event)"
      />
      <p class="setting-desc">
        <strong>{{ configStore.hotThreshold }}℃</strong> 이상이면 더움으로 표시합니다. 지금 기준으로
        더움인 도시는
        <strong>{{ hotCities.length }}개</strong>
        <span v-if="hotCities.length"> ({{ hotCities.map((city) => city.name).join(', ') }})</span>
      </p>
    </BaseDashboardCard>

    <BaseDashboardCard>
      <template v-slot:title>미세먼지 경계값</template>
      <div class="setting-grid">
        <div>
          <span class="setting-label">좋음 상한</span>
          <el-slider
            :model-value="configStore.dustGoodMax"
            :min="10"
            :max="70"
            :step="5"
            show-stops
            @input="configStore.setDustGoodMax($event)"
          />
          <span class="setting-value">{{ configStore.dustGoodMax }} 미만 = 좋음</span>
        </div>
        <div>
          <span class="setting-label">나쁨 하한</span>
          <el-slider
            :model-value="configStore.dustBadMin"
            :min="40"
            :max="150"
            :step="5"
            show-stops
            @input="configStore.setDustBadMin($event)"
          />
          <span class="setting-value">{{ configStore.dustBadMin }} 이상 = 나쁨</span>
        </div>
      </div>

      <!-- 지금 경계로 도시가 어떻게 갈리는지 태그로 보여준다 -->
      <div class="dust-preview">
        <el-tag type="success" effect="light" round>좋음 {{ dustCounts.good }}개</el-tag>
        <el-tag type="warning" effect="light" round>보통 {{ dustCounts.normal }}개</el-tag>
        <el-tag type="danger" effect="light" round>나쁨 {{ dustCounts.bad }}개</el-tag>
      </div>

      <p class="setting-desc">두 값이 서로를 넘어서지 않도록 액션 안에서 막아둡니다.</p>
      <p class="setting-desc setting-source">
        기본값 30 / 80 은 한국 환경부의 PM10 등급 기준과 같습니다(30 이하 좋음, 80 이하 보통, 초과
        나쁨). 대기오염 API 가 주는 값이 실제 PM10 관측값이라, 같은 척도를 그대로 씁니다.
      </p>
    </BaseDashboardCard>

    <BaseDashboardCard>
      <template v-slot:title>체질 (옷차림 추천에 반영)</template>
      <!-- 과제 7 : radio 3개 → el-radio-group. 좌우 화살표 키로도 고를 수 있게 된다 -->
      <el-radio-group :model-value="configStore.bodyType" @change="configStore.setBodyType($event)">
        <el-radio-button value="cold">추위를 많이 탐</el-radio-button>
        <el-radio-button value="normal">보통</el-radio-button>
        <el-radio-button value="heat">더위를 많이 탐</el-radio-button>
      </el-radio-group>
      <p class="setting-desc">
        현재 설정: <strong>{{ configStore.bodyTypeLabel }}</strong
        >. 상세 페이지의 옷차림 추천이 이 값만큼 밀려서 판정됩니다.
      </p>
    </BaseDashboardCard>

    <el-button
      type="warning"
      plain
      class="reset-btn"
      :disabled="!configStore.isCustomized"
      @click="confirmReset"
    >
      기본값으로 되돌리기 (25℃ / 30 / 80 / 보통)
    </el-button>
  </div>
</template>

<style scoped>
.alert-gap {
  margin-bottom: var(--space-3);
}
.setting-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.setting-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-5);
}
.setting-label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  color: var(--c-text-muted);
}
.setting-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
}
/* el-slider 는 marks 라벨이 아래로 튀어나오므로 여백을 준다 */
.setting-slider {
  margin-bottom: var(--space-6);
}
.dust-preview {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-4);
}
.setting-desc {
  margin: 8px 0 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--c-text-sub);
}
.setting-source {
  color: var(--c-text-faint);
  font-size: 12px;
}
.reset-btn {
  width: 100%;
  margin-top: var(--space-1);
}
</style>
