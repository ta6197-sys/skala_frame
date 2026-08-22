<script setup>
// 과제 4: 검색어를 props 로 받아 표시하고, 입력이 생기면 부모(WeatherHomeView)에게 되돌려 준다.
//
// 과제 7. input 을 el-input 으로 바꿨다. clearable(X 버튼)과 prefix 슬롯을 공짜로 얻는다.
// 다만 과제 1 요구사항 3번("한글 처리 - :value, @input") 때문에 v-model 은 여전히 안 쓴다.
// el-input 에도 v-model 대신 :model-value + @input 을 쓴다.
// v-model 은 IME 조합이 끝나야 값이 반영돼서, 한글을 타이핑하는 도중에는 검색이 한 박자 늦는다.
// 라이브러리를 쓰면서도 앞 단원의 요구사항을 그대로 지킨 지점이다.
defineProps({
  searchQuery: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update-query'])

const onSearchInput = (value) => {
  // el-input 의 @input 은 DOM 이벤트가 아니라 값(string)을 그대로 넘겨준다.
  // 기본 input 태그였을 때의 e.target.value 자리가 이 value 다.
  emit('update-query', value)
}
</script>

<template>
  <div>
    <el-input
      :model-value="searchQuery"
      placeholder="검색할 도시 이름 입력 (예: 서울)"
      clearable
      size="large"
      @input="onSearchInput"
      @clear="onSearchInput('')"
    >
      <template #prefix>
        <span class="search-icon">🔍</span>
      </template>
    </el-input>

    <p class="search-result">
      검색 중인 도시: <strong>{{ searchQuery || '(전체)' }}</strong>
      <span class="hint">— 검색어는 주소창(?search=)이 원본이다. 새로고침·뒤로가기에도 유지된다.</span>
    </p>
  </div>
</template>

<style scoped>
.search-icon {
  font-size: 14px;
}
.search-result {
  margin: 8px 0 0 0;
  font-size: 14px;
  color: var(--c-text-muted);
}
.hint {
  font-size: 12px;
  color: var(--c-text-faint);
}
</style>
