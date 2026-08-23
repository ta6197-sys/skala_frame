import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// "주소창이 원본이고 화면은 파생" 패턴을 함수 하나로 묶은 것.
//
// 왜 뽑았나
// - 이 패턴이 프로젝트에 두 번 나왔다. 대시보드의 검색어(?search=)와 상세 화면의 배경 미리보기(?preview=).
//   두 화면에 같은 모양의 computed + router.replace 가 각각 복사되어 있었다.
//   두 번 나온 것을 그대로 두면 한쪽만 고치는 날이 온다 - weatherStore.summary 를 getter 로 올릴 때
//   세운 "값은 한 곳에서만 태어난다" 원칙을 로직에도 그대로 적용한다.
//
// 왜 ref 를 쓰지 않나
// - 상태를 따로 들면 값의 저장소가 주소창과 ref 두 곳이 되고, 서로를 갱신하는 watch 가 필요해진다.
//   그 구조에서는 뒤로가기로 주소만 바뀌었을 때 화면이 따라오지 못한다(과제 6 까지 실제로 그랬다).
//   여기서는 흐름이 한 방향이다: 입력 → router.replace → route.query → computed → 화면.
//
// @param {string} key            쿼리 파라미터 이름
// @param {(v: string) => boolean} [validate]  통과시킬 값인지 판정. 실패하면 빈 문자열로 떨어진다.
export function useQueryParam(key, { validate } = {}) {
  const route = useRoute()
  const router = useRouter()

  const value = computed(() => {
    const raw = route.query[key]
    // 같은 키가 두 번 들어오면(?search=a&search=b) vue-router 는 배열을 준다. 그건 값으로 치지 않는다.
    const text = typeof raw === 'string' ? raw : ''
    if (!text) return ''
    return validate && !validate(text) ? '' : text
  })

  // 상태가 아니라 주소를 고친다. 그러면 위 computed 가 알아서 따라온다.
  // push 가 아니라 replace 인 이유 - 글자 하나마다 히스토리가 쌓이면 뒤로가기가 먹통이 된다.
  // 기존 쿼리를 펼쳐 담는 이유 - 이 함수는 자기 키 하나만 책임진다. 남의 파라미터를 지우면 안 된다.
  const setValue = (next) => {
    router.replace({
      path: route.path,
      query: { ...route.query, [key]: next || undefined },
    })
  }

  return { value, setValue }
}
