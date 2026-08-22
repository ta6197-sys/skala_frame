import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ko'

// 과제 6. day.js 설정을 한 곳에 모은다.
// day.js 는 기본 기능만 들어 있고 나머지는 플러그인을 붙여야 쓸 수 있다. 화면마다 extend 를 반복하지 않도록 여기서 한 번만 한다.
// - utc / timezone : 예보의 dt 는 UNIX 초라서 시간대 정보가 없다. 도시 타임존으로 옮겨야 "오후 3시" 가 맞는 시각이 된다.
// - relativeTime : "3분 전" 같은 갱신 시각 표시
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)
dayjs.locale('ko')

// UNIX 초 → 해당 도시 현지 시각 객체
export const fromUnix = (seconds, tz = 'Asia/Seoul') => dayjs.unix(seconds).tz(tz)

// UNIX 초 → "오늘 오후 3시" / "내일 오전 9시"
export const formatHourLabel = (seconds, tz = 'Asia/Seoul') => {
  const target = fromUnix(seconds, tz)
  const today = dayjs().tz(tz)

  const dayLabel = target.isSame(today, 'day')
    ? '오늘'
    : target.isSame(today.add(1, 'day'), 'day')
      ? '내일'
      : target.format('M월 D일')

  return `${dayLabel} ${target.format('A h시')}`
}

// 밀리초 타임스탬프 → "3분 전"
export const fromNow = (milliseconds) => (milliseconds ? dayjs(milliseconds).fromNow() : '')

export default dayjs
