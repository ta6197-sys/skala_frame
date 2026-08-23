<script setup>
// 과제 3: 검색어를 props 로 받아 표시하고, 입력이 생기면 부모에게 되돌려 준다.
defineProps({
  searchQuery: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update-query'])

// 과제 1~2 와 동일하게 v-model 대신 :value + @input 으로 한글 조합 중인 글자까지 즉시 반영
const onSearchInput = (e) => {
  emit('update-query', e.target.value)
}
</script>

<template>
  <div>
    <input
      type="text"
      :value="searchQuery"
      @input="onSearchInput"
      placeholder="검색할 도시 이름 입력"
      class="search-input"
    />
    <p class="search-result">검색 중인 도시: {{ searchQuery }}</p>
  </div>
</template>

<style scoped>
.search-input {
  width: 100%;
}
.search-result {
  margin: 6px 0 0 0;
  font-size: 14px;
  color: var(--c-text-muted);
}
</style>
