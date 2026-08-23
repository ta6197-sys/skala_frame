<script setup>
// 과제 4: 라우터 화면들이 공용으로 쓰는 카드 껍데기
// - 상태는 하나도 갖지 않고 <slot> 자리만 비워둔다. (과제 3 weather3/BaseDashboardCard 재사용)
// - 제목은 named slot(title), 내용은 default slot 으로 부모가 주입한다.
//
// 과제 7. 내부 구현만 el-card 로 바꿨다. slot 인터페이스(title / default)는 그대로다.
// - 이 컴포넌트는 과제 3 요구사항 2번(슬롯으로 공통 껍데기 만들기)의 산출물이라 없애면 안 된다.
//   그래서 컴포넌트를 el-card 로 "대체" 하지 않고, 껍데기 안쪽만 el-card 로 갈아끼웠다.
// - 덕분에 이 카드를 쓰는 화면 5개(홈·상세·즐겨찾기·통계·설정·소개)는 한 줄도 안 고쳤다.
//   슬롯으로 인터페이스를 잡아두면 내부 구현을 통째로 바꿔도 부모가 안 흔들린다는 게 여기서 확인된다.
// - shadow="never" 인 이유: 이 카드는 이미 흰 router-outlet 안에 들어가므로 그림자를 겹쳐 주면 지저분해진다.
</script>

<template>
  <el-card class="dashboard-card" shadow="never">
    <template #header>
      <h3 class="dashboard-title">
        <slot name="title">제목 없음</slot>
      </h3>
    </template>

    <slot>
      <p>부모가 내용을 주입하지 않았을 때의 디폴트 화면</p>
    </slot>
  </el-card>
</template>

<style scoped>
.dashboard-card {
  margin-bottom: var(--space-4);
  background-color: var(--c-surface-soft);
  border: 1px solid var(--c-line);
  border-radius: var(--radius-m);
}
.dashboard-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--c-text);
}
/* el-card 는 기본 padding 이 20px 이라 카드가 여럿 쌓이면 화면이 너무 성겨진다.
   :deep() 으로 자식 컴포넌트 내부 클래스에 닿아야 scoped 스타일이 먹는다. */
.dashboard-card :deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid var(--c-line);
}
.dashboard-card :deep(.el-card__body) {
  padding: 14px 16px;
}
</style>
