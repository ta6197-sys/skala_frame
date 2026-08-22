<script setup>
import { computed } from 'vue'
import { getWeatherKind, isNightIcon, KIND_ICON_CODE, KIND_LABEL } from '@/data/weatherKind'

// 과제 7(개발용). 배경 연출 6종 × 낮밤을 눈으로 확인하기 위한 도구.
//
// 왜 필요했나:
//   배경은 실제 관측값(icon)을 따라가는데, 지금 도시 6곳이 전부 비슷한 날씨면 눈·안개·뇌우를
//   영영 못 본다. 날씨가 바뀌기를 기다리거나 API 응답을 손으로 고쳐가며 확인하는 건 방법이 아니다.
//
// 이 컴포넌트가 지키는 것:
//   - 상태를 하나도 갖지 않는다. 지금 무엇이 선택돼 있는지는 props(currentIcon)에서 읽는다.
//     여기에 ref 를 두면 주소창과 컴포넌트가 각자 값을 들고 서로 어긋난다. (과제 7 원칙 1)
//   - 직접 주소를 고치지 않고 부모에게 emit 한다. 어디에 기록할지는 부모가 정할 일이다.
//     SearchBar 가 검색어를 다루는 방식과 같은 형태다. (과제 7 원칙 2 - 위로는 emit)
//   - 개발 중에만 존재한다. 부모가 import.meta.env.DEV 로 감싸서 불러오므로 배포 빌드에는 들어가지 않는다.
const props = defineProps({
  // 지금 화면이 실제로 쓰고 있는 아이콘 코드 (미리보기 중이면 미리보기 값, 아니면 관측값)
  currentIcon: {
    type: String,
    default: null,
  },
  // 미리보기가 켜져 있는지. 껐을 때 "관측값" 쪽을 활성으로 보여주려고 받는다.
  isPreviewing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update-preview'])

// 선택 상태도 props 에서 파생시킨다. 내부에 복사본을 두지 않는다.
const activeKind = computed(() => getWeatherKind(props.currentIcon))
const activeNight = computed(() => isNightIcon(props.currentIcon))

// 버튼에 뿌릴 목록. KIND_ICON_CODE 를 그대로 돌기 때문에 날씨 종류가 늘면 버튼도 자동으로 따라온다.
const kindList = computed(() =>
  Object.keys(KIND_ICON_CODE).map((kind) => ({ kind, label: KIND_LABEL[kind] })),
)

// 종류나 낮/밤 중 하나만 바뀌어도 코드는 통째로 다시 만들어야 한다 ('10' + 'n' = '10n').
const emitIcon = (kind, night) => {
  emit('update-preview', KIND_ICON_CODE[kind] + (night ? 'n' : 'd'))
}

const handlePickKind = (kind) => emitIcon(kind, activeNight.value)

// 아직 아무것도 안 골랐는데 낮/밤만 누르면 기준이 없다. 그때는 맑음으로 시작한다.
const handleToggleNight = (night) => {
  const kind = activeKind.value === 'unknown' ? 'clear' : activeKind.value
  emitIcon(kind, night)
}

// null 을 올려보내면 부모가 쿼리를 지운다 = 실제 관측값으로 돌아간다.
const handleReset = () => emit('update-preview', null)
</script>

<template>
  <div class="preview-switch">
    <div class="preview-head">
      <el-tag type="warning" size="small" effect="dark" round>DEV</el-tag>
      <span class="preview-title">배경 미리보기</span>
      <span class="preview-desc">
        주소창의 <code>?preview=</code> 로 기록되므로 새로고침·링크 공유에도 유지된다. 배포 빌드에는
        포함되지 않는다.
      </span>
    </div>

    <div class="preview-row">
      <el-radio-group
        :model-value="isPreviewing ? activeKind : ''"
        size="small"
        @change="handlePickKind($event)"
      >
        <el-radio-button v-for="item in kindList" :key="item.kind" :value="item.kind">
          {{ item.label }}
        </el-radio-button>
      </el-radio-group>

      <el-switch
        :model-value="activeNight"
        size="small"
        inline-prompt
        active-text="밤"
        inactive-text="낮"
        @change="handleToggleNight($event)"
      />

      <el-button size="small" :disabled="!isPreviewing" @click="handleReset">
        관측값으로 되돌리기
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.preview-switch {
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-3);
  background-color: var(--c-surface-soft);
  /* 진짜 기능이 아니라 개발 도구라는 게 한눈에 보이도록 점선 테두리를 쓴다 */
  border: 1px dashed var(--c-normal);
  border-radius: var(--radius-m);
}
.preview-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}
.preview-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--c-text);
}
.preview-desc {
  flex: 1;
  min-width: 200px;
  font-size: 12px;
  color: var(--c-text-faint);
}
.preview-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
}
code {
  padding: 1px 5px;
  background-color: var(--c-surface-mute);
  border-radius: 4px;
  color: var(--c-hot);
}
</style>
