/**
 * 사다리타기 경로 시뮬레이션
 * rungs: 각 행에서 가로대 위치 [0]=1-2번라인사이, [1]=2-3번사이, [2]=3-4번사이
 * 한 행에 하나의 가로대만 (겹치지 않음)
 */
export function simulateLadderPath(startLine, rungs) {
  let position = startLine - 1 // 0-indexed

  for (const rung of rungs) {
    // rung 0: 0-1 연결, rung 1: 1-2 연결, rung 2: 2-3 연결
    if (rung === 0 && (position === 0 || position === 1)) {
      position = position === 0 ? 1 : 0
    } else if (rung === 1 && (position === 1 || position === 2)) {
      position = position === 1 ? 2 : 1
    } else if (rung === 2 && (position === 2 || position === 3)) {
      position = position === 2 ? 3 : 2
    }
  }

  // 0,1번 → 좌, 2,3번 → 우
  return position < 2 ? '좌' : '우'
}

/**
 * 공이 내려가는 경로 반환 (애니메이션용)
 * 각 스텝에서의 position (0~3)
 */
export function getLadderPath(startLine, rungs) {
  const path = [startLine - 1]
  let position = startLine - 1

  for (const rung of rungs) {
    if (rung === 0 && (position === 0 || position === 1)) {
      position = position === 0 ? 1 : 0
    } else if (rung === 1 && (position === 1 || position === 2)) {
      position = position === 1 ? 2 : 1
    } else if (rung === 2 && (position === 2 || position === 3)) {
      position = position === 2 ? 3 : 2
    }
    path.push(position)
  }
  return path
}

/**
 * 겹치지 않는 랜덤 가로대 생성
 * 각 행마다 0, 1, 2 중 하나 (인접한 행과 겹치지 않도록)
 */
export function generateRandomRungs(count) {
  const rungs = []
  let prev = -1
  for (let i = 0; i < count; i++) {
    const options = [0, 1, 2].filter((r) => r !== prev)
    prev = options[Math.floor(Math.random() * options.length)]
    rungs.push(prev)
  }
  return rungs
}
