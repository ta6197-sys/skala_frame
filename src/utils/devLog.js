// 과제 2 요구사항 3(watch / watchEffect 동작 확인)은 콘솔 출력으로 시연한다.
// 그 로그가 배포본에도 그대로 남아 있었다 - 검색어를 한 글자 칠 때마다 watchEffect 가 콘솔을 친다.
// 로그를 지우면 시연이 사라지고, 두면 제품에 개발 흔적이 남는다. 그래서 문을 하나 둔다.
//
// import.meta.env.DEV 는 Vite 가 빌드할 때 리터럴 false 로 치환하므로,
// 배포 빌드에서는 이 모듈이 빈 함수로 굳고 호출해도 아무 일도 일어나지 않는다.
// (상세 화면의 ?preview= 도구가 이미 쓰던 방식과 같은 장치다. 그쪽에만 적용돼 있던 것을 여기로 넓혔다.)
export const logDev = import.meta.env.DEV ? (...args) => console.log(...args) : () => {}
