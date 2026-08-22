<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

// 과제 5(나만의 추가). 옷차림 추천
// 체감온도(feelsLike)에 configStore 의 체질 보정을 얹은 값으로 5단계 판정한다.
// 같은 도시라도 설정 화면에서 체질을 바꾸면 추천이 달라지는 것이 포인트.
const props = defineProps({
  city: {
    type: Object,
    required: true,
  },
})

const configStore = useConfigStore()

// 판정에 쓰는 온도는 항상 섭씨 원본 기준. 화씨로 바꿨다고 입을 옷이 달라지지는 않으므로.
const personalTemp = computed(() => configStore.personalTemp(props.city.feelsLike))

const outfit = computed(() => {
  const temp = personalTemp.value
  if (temp >= 28)
    return { icon: '', wear: '민소매 · 반팔 · 반바지', tip: '물 챙기고 그늘로 다니기' }
  if (temp >= 23)
    return { icon: '', wear: '반팔 · 얇은 셔츠', tip: '실내 냉방 대비 얇은 겉옷 하나' }
  if (temp >= 17)
    return { icon: '', wear: '긴팔 · 가디건 · 얇은 니트', tip: '아침저녁 일교차 주의' }
  if (temp >= 10) return { icon: '', wear: '자켓 · 트렌치코트 · 니트', tip: '바람 막을 겉옷 필요' }
  return { icon: '', wear: '코트 · 패딩 · 목도리', tip: '내복까지 고려' }
})

// 옷차림과 별개로, 날씨 조건에 걸리면 챙길 것을 덧붙인다.
const extraItems = computed(() => {
  const items = []
  if (props.city.rainProb >= 40) items.push(`우산 (강수확률 ${props.city.rainProb}%)`)
  if (configStore.dustGrade(props.city.dust) === 'bad')
    items.push(`마스크 (미세먼지 ${props.city.dust})`)
  if (props.city.wind >= 5) items.push(`바람막이 (풍속 ${props.city.wind}m/s)`)
  return items
})
</script>

<template>
  <div class="outfit">
    <div class="outfit-main">
      <p class="outfit-wear">{{ outfit.wear }}</p>
      <p class="outfit-tip">{{ outfit.tip }}</p>
    </div>

    <p class="outfit-basis">
      판정 기준: 체감 {{ city.feelsLike }}℃
      <span v-if="configStore.bodyOffset !== 0">
        + 체질 보정 {{ configStore.bodyOffset > 0 ? '+' : '' }}{{ configStore.bodyOffset }}도 =
        <strong>{{ personalTemp }}℃</strong>
      </span>
      <span v-else>(체질 보정 없음)</span>
    </p>

    <ul v-if="extraItems.length" class="outfit-extra">
      <li v-for="item in extraItems" :key="item">{{ item }}</li>
    </ul>
  </div>
</template>

<style scoped>
.outfit-main {
  padding-left: 10px;
  border-left: 3px solid var(--c-brand);
}
.outfit-wear {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text);
}
.outfit-tip {
  margin: 2px 0 0 0;
  font-size: 13px;
  color: var(--c-text-muted);
}
.outfit-basis {
  margin: 10px 0 0 0;
  font-size: 12px;
  color: var(--c-text-faint);
}
.outfit-extra {
  margin: 8px 0 0 0;
  padding-left: 18px;
  font-size: 13px;
  color: var(--c-text-sub);
}
.outfit-extra li {
  margin-bottom: 2px;
}
</style>
