'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useStore } from '@/store/useStore'

const HORSE_COUNT = 8
const HORSE_NAMES = ['번개', '질풍', '천마', '적토', '백룡', '흑운', '금강', '은화']
const ODDS = [3.2, 2.8, 4.0, 2.5, 3.5, 2.2, 5.0, 2.8]
const RACE_DURATION = 6000
const TRACK_RADIUS = 4
const LANE_WIDTH = 0.4

function HorseModel({ color }) {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.5, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.15, 0.35, 0.1]} castShadow>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.1, 0.1, 0.15]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.1, 0.1, -0.15]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.1, 0.1, 0.15]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.1, 0.1, -0.15]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

function Horse({ index, progress, color, laneOffset }) {
  const angle = progress * Math.PI * 2
  const radius = TRACK_RADIUS + laneOffset * LANE_WIDTH
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius
  const rotationY = -angle

  return (
    <group position={[x, 0.3, z]} rotation={[0, rotationY, 0]}>
      <HorseModel color={color} />
    </group>
  )
}

function RaceTrack() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[TRACK_RADIUS - 0.5, TRACK_RADIUS + 2, 64]} />
        <meshStandardMaterial color="#0d2818" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[TRACK_RADIUS - 0.3, TRACK_RADIUS + 1.8, 64]} />
        <meshStandardMaterial color="#1a472a" />
      </mesh>
    </group>
  )
}

function Scene({ positions }) {
  const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-far={50} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
      <RaceTrack />
      {positions.map((p, i) => (
        <Horse key={i} index={i} progress={p} color={colors[i]} laneOffset={i - HORSE_COUNT / 2} />
      ))}
    </>
  )
}

export default function HorseGame3D() {
  const [round, setRound] = useState(1)
  const [selected, setSelected] = useState(null)
  const [stake, setStake] = useState('')
  const [racing, setRacing] = useState(false)
  const [positions, setPositions] = useState(Array(HORSE_COUNT).fill(0))
  const [winner, setWinner] = useState(null)
  const [recentWinners, setRecentWinners] = useState([3, 7, 1, 5, 2, 8, 4, 6])
  const speedsRef = useRef([])
  const placeBet = useStore((state) => state.placeBet)
  const addWinnings = useStore((state) => state.addWinnings)
  const addToast = useStore((state) => state.addToast)
  const balance = useStore((state) => state.balance)
  const startTimeRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!racing) return

    const speeds = Array.from({ length: HORSE_COUNT }, () => 0.08 + Math.random() * 0.15)
    speedsRef.current = speeds
    startTimeRef.current = performance.now()

    const animate = (now) => {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / RACE_DURATION, 1)

      const newPositions = speedsRef.current.map((speed) =>
        Math.min(progress * speed * 1.5, 1)
      )
      setPositions([...newPositions])

      if (progress >= 1) {
        const maxPos = Math.max(...newPositions)
        const winnerIdx = newPositions.findIndex((p) => p >= maxPos - 0.001) + 1
        setWinner(winnerIdx)
        setRecentWinners((prev) => [winnerIdx, ...prev.slice(0, 14)])
        const stakeAmount = parseFloat(stake)
        placeBet(stakeAmount)
        const won = selected === winnerIdx
        if (won) {
          const winnings = stakeAmount * ODDS[selected - 1]
          addWinnings(winnings)
          addToast({ message: `🏇 ${HORSE_NAMES[winnerIdx - 1]} 우승! ${winnings.toLocaleString()}원 획득`, type: 'success' })
        } else {
          addToast({ message: `${HORSE_NAMES[winnerIdx - 1]} 우승. 아쉽습니다!`, type: 'error' })
        }
        setTimeout(() => {
          setRound((r) => r + 1)
          setWinner(null)
          setSelected(null)
          setStake('')
          setPositions(Array(HORSE_COUNT).fill(0))
          setRacing(false)
        }, 3000)
        return
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [racing, selected, stake, placeBet, addWinnings, addToast])

  const handlePlaceBet = () => {
    const stakeAmount = parseFloat(stake)
    if (!selected || !stake || stakeAmount <= 0 || stakeAmount > balance || racing) return
    setRacing(true)
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-4 sm:p-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">3D 경마</h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">8마리 - 3D 트랙에서 실제 레이스</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-slate-500 text-xs">경주</p>
                  <p className="text-amber-400 font-bold tabular-nums">{String(round).padStart(3, '0')}R</p>
                </div>
                {racing && !winner && (
                  <div className="text-rose-400 text-sm font-bold animate-pulse">경주 중...</div>
                )}
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900 w-full aspect-video min-h-[200px] sm:min-h-[280px]">
              <Canvas shadows camera={{ position: [0, 12, 12], fov: 45 }}>
                <Suspense fallback={null}>
                  <Scene positions={positions} />
                  <OrbitControls
                    enableZoom={true}
                    minDistance={8}
                    maxDistance={25}
                    minPolarAngle={Math.PI / 4}
                    maxPolarAngle={Math.PI / 2}
                  />
                </Suspense>
              </Canvas>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 sm:gap-2 mt-4">
              {Array.from({ length: HORSE_COUNT }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => !racing && setSelected(i + 1)}
                  disabled={racing}
                  className={`py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all ${
                    selected === i + 1
                      ? 'bg-rose-500/30 text-rose-400 border-2 border-rose-500'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {i + 1}. {HORSE_NAMES[i]}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-3 sm:p-4 overflow-hidden">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-400 mb-2 sm:mb-3">최근 우승마</h3>
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              {recentWinners.map((num, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-lg bg-slate-700/50 text-slate-300 text-xs font-medium"
                >
                  {num}번 {HORSE_NAMES[num - 1]}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-700/60 bg-slate-800/80 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4">배팅</h3>
            {selected && (
              <div className="mb-4 p-3 rounded-xl bg-slate-900/60">
                <p className="text-slate-400 text-xs sm:text-sm">선택</p>
                <p className="text-rose-400 font-bold text-sm sm:text-base">{selected}번 {HORSE_NAMES[selected - 1]} @ {ODDS[selected - 1]}배</p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-2">금액</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[1000, 5000, 10000, 50000].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => !racing && setStake(String(n))}
                    disabled={racing}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-600 disabled:opacity-50"
                  >
                    {(n / 1000).toFixed(0)}천
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                placeholder="배팅 금액"
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm sm:text-base focus:ring-2 focus:ring-rose-500"
                disabled={racing}
              />
            </div>
            <button
              type="button"
              onClick={handlePlaceBet}
              disabled={!selected || !stake || racing}
              className="w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-rose-500 to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {racing ? '경주 진행중...' : '배팅하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
