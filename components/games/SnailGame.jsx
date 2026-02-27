'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store/useStore'

const SNAIL_COUNT = 6
const RACE_DURATION = 5000
const TRACK_LENGTH = 100
const SNAIL_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4']
const ODDS = [2.5, 2.8, 2.2, 3.0, 2.6, 2.4]

function SnailSvg({ color, position }) {
  const x = (position / TRACK_LENGTH) * 260
  return (
    <g transform={`translate(${x}, 0)`}>
      <ellipse cx="0" cy="0" rx="12" ry="8" fill={color} opacity={0.9} />
      <ellipse cx="8" cy="-4" rx="6" ry="5" fill={color} />
      <circle cx="10" cy="-5" r="2" fill="white" opacity={0.8} />
      <circle cx="11" cy="-5" r="1" fill="black" />
      <path d="M-2 -2 Q -8 -8 -6 -2" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M-2 2 Q -8 8 -6 2" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  )
}

export default function SnailGame() {
  const [round, setRound] = useState(1)
  const [countdown, setCountdown] = useState(15)
  const [selected, setSelected] = useState(null)
  const [stake, setStake] = useState('')
  const [racing, setRacing] = useState(false)
  const [positions, setPositions] = useState(Array(SNAIL_COUNT).fill(0))
  const [winner, setWinner] = useState(null)
  const [recentWinners, setRecentWinners] = useState([3, 1, 5, 2, 4, 6, 1, 3, 2])
  const speedsRef = useRef([])
  const placeBet = useStore((state) => state.placeBet)
  const addWinnings = useStore((state) => state.addWinnings)
  const addToast = useStore((state) => state.addToast)
  const balance = useStore((state) => state.balance)
  const startTimeRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!racing) return

    const speeds = Array.from({ length: SNAIL_COUNT }, () => 0.12 + Math.random() * 0.2)
    speedsRef.current = speeds
    startTimeRef.current = performance.now()

    const animate = (now) => {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / RACE_DURATION, 1)

      const newPositions = speedsRef.current.map((speed) =>
        Math.min(progress * speed * 120, TRACK_LENGTH)
      )
      setPositions([...newPositions])

      if (progress >= 1) {
        const maxPos = Math.max(...newPositions)
        const winnerIdx = newPositions.findIndex((p) => p >= maxPos - 0.1) + 1
        setWinner(winnerIdx)
        setRecentWinners((prev) => [winnerIdx, ...prev.slice(0, 14)])
        const stakeAmount = parseFloat(stake)
        placeBet(stakeAmount)
        const won = selected === winnerIdx
        if (won) {
          const winnings = stakeAmount * ODDS[selected - 1]
          addWinnings(winnings)
          addToast({ message: `🎉 ${winnerIdx}번 달팽이 우승! ${winnings.toLocaleString()}원 획득`, type: 'success' })
        } else {
          addToast({ message: `${winnerIdx}번 달팽이 우승. 다음 회차에 도전하세요!`, type: 'error' })
        }
        setTimeout(() => {
          setRound((r) => r + 1)
          setCountdown(30)
          setWinner(null)
          setSelected(null)
          setStake('')
          setPositions(Array(SNAIL_COUNT).fill(0))
          setRacing(false)
        }, 2500)
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
    setCountdown(0)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-4 sm:p-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">달팽이 레이스</h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">6마리 달팽이가 트랙을 달립니다</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-slate-500 text-xs">회차</p>
                  <p className="text-amber-400 font-bold tabular-nums">{String(round).padStart(4, '0')}회</p>
                </div>
                {!racing && countdown > 0 && (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center border border-emerald-500/30">
                    <span className="text-xl sm:text-2xl font-black text-emerald-400 tabular-nums">{countdown}</span>
                  </div>
                )}
                {racing && !winner && (
                  <div className="text-emerald-400 text-sm font-bold animate-pulse">레이스 중...</div>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-slate-900/80 p-4 sm:p-6 border border-slate-700/50 overflow-hidden">
              <div className="relative w-full aspect-[2/1] min-h-[180px] sm:min-h-[220px]">
                <svg viewBox="0 0 320 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="trackGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#334155" />
                    </linearGradient>
                  </defs>
                  <rect x="0" y="0" width="320" height="120" fill="url(#trackGrad)" rx="8" />
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={20 + i * 16}
                      x2="320"
                      y2={20 + i * 16}
                      stroke="#475569"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}
                  <line x1="300" y1="0" x2="300" y2="120" stroke="#22c55e" strokeWidth="3" />
                  {Array.from({ length: SNAIL_COUNT }).map((_, i) => (
                    <g key={i} transform={`translate(20, ${22 + i * 16})`}>
                      <SnailSvg color={SNAIL_COLORS[i]} position={positions[i]} />
                      <text x="-8" y="5" fill="#94a3b8" fontSize="10" fontWeight="bold">
                        {i + 1}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2 mt-4">
                {Array.from({ length: SNAIL_COUNT }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => !racing && setSelected(i + 1)}
                    disabled={racing}
                    className={`py-2 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm transition-all ${
                      selected === i + 1
                        ? 'ring-2 ring-white/50'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600'
                    }`}
                    style={selected === i + 1 ? { backgroundColor: SNAIL_COLORS[i] } : {}}
                  >
                    {i + 1}번
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-3 sm:p-4 overflow-hidden">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-400 mb-2 sm:mb-3">최근 우승</h3>
              <div className="flex gap-1 sm:gap-2 flex-wrap">
                {recentWinners.map((num, i) => (
                  <span
                    key={i}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: SNAIL_COLORS[num - 1] }}
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-700/60 bg-slate-800/80 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4">배팅</h3>
            {selected && (
              <div className="mb-4 p-3 rounded-xl bg-slate-900/60">
                <p className="text-slate-400 text-xs sm:text-sm">선택</p>
                <p className="text-emerald-400 font-bold">{selected}번 달팽이 @ {ODDS[selected - 1]}배</p>
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
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm sm:text-base focus:ring-2 focus:ring-emerald-500"
                disabled={racing}
              />
            </div>
            <button
              type="button"
              onClick={handlePlaceBet}
              disabled={!selected || !stake || racing}
              className="w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-emerald-500 to-teal-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {racing ? '레이스 진행중...' : '배팅하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
