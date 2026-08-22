<script setup>
// 과제 3: 검색박스와 리스트박스의 공통 껍데기 디자인 담당
// - 스크립트 상태는 하나도 갖지 않고, <slot> 자리만 비워둔다.
// - 제목은 named slot(title), 내용은 default slot 으로 부모가 주입한다.
</script>

<template>
  <div class="dashboard-card">
    <h3 class="dashboard-title">
      <slot name="title">제목 없음</slot>
    </h3>
    <div class="dashboard-body">
      <slot>
        <p>부모가 내용을 주입하지 않았을 때의 디폴트 화면</p>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.dashboard-card {
  padding: 14px 16px;
  margin-bottom: 14px;
  background-color: var(--c-surface-soft);
  border: 1px solid var(--c-line);
  border-radius: 8px;
}
.dashboard-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: var(--c-text);
}
.dashboard-body {
  margin: 0;
}
</style>
