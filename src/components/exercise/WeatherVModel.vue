<script setup>
import { ref } from 'vue'

// 요구사항 3) 도시 이름을 한글로 검색하는 input 을 만들고, 입력한 도시명을 출력한다.
// - v-model 은 IME(한글) 조합 중에는 input 이벤트를 무시하므로 화면 반영이 한 박자 밀린다.
// - 그래서 v-model 대신 :value + @input 으로 직접 연결한다.
const searchText = ref('')

// 입력 이벤트 핸들러 : 조합 중인 글자까지 즉시 반영
const onSearchInput = (e) => {
  searchText.value = e.target.value
}
</script>

<template>
  <div class="practice-section">
    <h2>요구사항 3) 양방향 바인딩 및 한글 처리 (:value, @input)</h2>

    <h3>도시 검색</h3>
    <input
      type="text"
      :value="searchText"
      @input="onSearchInput"
      placeholder="검색할 도시 이름 입력"
      class="search-input"
    />
    <p class="search-result">검색 중인 도시: {{ searchText }}</p>
  </div>
</template>
