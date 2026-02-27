'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { simulateLadderPath, generateRandomRungs, getLadderPath } from '@/lib/ladderLogic'
import { useStore } from '@/store/useStore'

const ODDS = { 좌: 1.95, 우: 1.95 }
const RUNG_COUNT = 6
const PATH_COUNT = 4
const BALL_DURATION = 2000

function LadderVisual({ paths, rungs, ballPosition, ballStep, isAnimating }) {
  const getRungStyle = (rungIndex) => {
    const rung = rungs[rungIndex]
    if (rung === 0) return { left: '12%', width: '26%' }
    if (rung === 1) return { left: '37%', width: '26%' }
    return { left: '62%', width: '26%' }
  }

  const getBallStyle = () => {
    if (ballPosition === null) return {}
    const leftPct = [12.5, 37.5, 62.5, 87.5][ballPosition] ?? 12.5
    const totalSteps = Math.max((rungs?.length || 1), 1)
    const topPct = 10 + (ballStep / totalSteps) * 75
    return { left: `${leftPct}%`, top: `${topPct}%` }
  }

  return (
    <div className="relative w-full min-h-[200px] sm:min-h-[280px] py-4 sm:py-8 overflow-visible">
      <div className="flex justify-between gap-2 sm:gap-4">
        {Array.from({ length: paths }).map((_, i) => (
          <div key={i} className="flex flex-col items-center flex-1 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-600 flex items-center justify-center text-white font-bold text-sm sm:text-base mb-1 sm:mb-2 shrink-0">
              {i + 1}
            </div>
            <div className="w-0.5 sm:w-1 flex-1 min-h-[80px] sm:min-h-[120px] bg-amber-500/70 rounded-full" />
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs sm:text-sm mt-1 sm:mt-2 shrink-0">
              {i % 2 === 0 ? '좌' : '우'}
            </div>
          </div>
        ))}
      </div>
      {rungs?.map((rung, i) => {
        const style = getRungStyle(i)
        return (
          <div
            key={i}
            className="absolute left-0 right-0 h-0.5 sm:h-1"
            style={{ top: `${18 + (i + 1) * (60 / (rungs.length + 1))}%` }}
          >
            <div
              className="absolute h-full bg-amber-400 rounded-full"
              style={{ left: style.left, width: style.width }}
            />
          </div>
        )
      })}
      {isAnimating && ballPosition !== null && (
        <motion.div
          className="absolute w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-400 border-2 border-amber-300 shadow-lg z-10 -translate-x-1/2 -translate-y-1/2"
          initial={false}
          animate={getBallStyle()}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
        />
      )}
    </div>
  )
}

export default function LadderGame() {
  const [round, setRound] = useState(1)
  const [selected, setSelected] = useState(null)
  const [stake, setStake] = useState('')
  const [result, setResult] = useState(null)
  const [recentResults, setRecentResults] = useState(['좌', '우', '좌', '우', '좌'])
  const [rungs, setRungs] = useState(() => generateRandomRungs(RUNG_COUNT))
  const [animating, setAnimating] = useState(false)
  const [ballState, setBallState] = useState({ pos: null, step: 0 })
  const placeBet = useStore((state) => state.placeBet)
  const addWinnings = useStore((state) => state.addWinnings)
  const addToast = useStore((state) => state.addToast)
  const balance = useStore((state) => state.balance)

  const runLadder = useCallback(() => {
    const newRungs = generateRandomRungs(RUNG_COUNT)
    const line = Math.floor(Math.random() * PATH_COUNT) + 1
    const resultSide = simulateLadderPath(line, newRungs)
    const path = getLadderPath(line, newRungs)

    setRungs(newRungs)
    setAnimating(true)
    setBallState({ pos: path[0], step: 0 })

    const stakeAmount = parseFloat(stake)
    placeBet(stakeAmount)

    const stepDuration = BALL_DURATION / (path.length - 1)
    path.forEach((pos, i) => {
      if (i === 0) return
      setTimeout(() => {
        setBallState({ pos, step: i })
      }, i * stepDuration)
    })

    setTimeout(() => {
      setResult(resultSide)
      setRecentResults((prev) => [resultSide, ...prev.slice(0, 9)])
      setAnimating(false)

      const win = selected === resultSide
      if (win) {
        const winnings = stakeAmount * ODDS[selected]
        addWinnings(winnings)
        addToast({ message: `당첨! ${winnings.toLocaleString()}원 획득`, type: 'success' })
      } else {
        addToast({ message: `결과: ${resultSide}. 다음 기회를!`, type: 'error' })
      }

      setTimeout(() => {
        setRound((r) => r + 1)
        setResult(null)
        setSelected(null)
        setStake('')
        setBallState({ pos: null, step: 0 })
      }, 1500)
    }, BALL_DURATION)
  }, [selected, stake, placeBet, addWinnings, addToast])

  const handlePlaceBet = () => {
    const stakeAmount = parseFloat(stake)
    if (!selected || !stake || stakeAmount <= 0 || stakeAmount > balance || animating) return
    runLadder()
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-4 sm:p-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">사다리타기</h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">좌/우 예측 - 공이 내려가는 경로 확인</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-slate-500 text-xs">회차</p>
                  <p className="text-amber-400 font-bold tabular-nums">{String(round).padStart(4, '0')}회</p>
                </div>
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/50"
                    >
                      <span className="text-xl sm:text-2xl font-black text-amber-400">{result}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900/90 p-4 sm:p-8 border border-slate-700/50 overflow-hidden">
              <LadderVisual paths={PATH_COUNT} rungs={rungs} ballPosition={ballState.pos} ballStep={ballState.step} isAnimating={animating} />
            </div>

            <div className="flex gap-2 sm:gap-4 mt-4 sm:mt-6">
              <button
                type="button"
                onClick={() => setSelected('좌')}
                disabled={!!result || animating}
                className={`flex-1 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all ${
                  selected === '좌'
                    ? 'bg-amber-500/30 text-amber-400 border-2 border-amber-500 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600 border-2 border-transparent'
                }`}
              >
                좌 (배당 {ODDS.좌})
              </button>
              <button
                type="button"
                onClick={() => setSelected('우')}
                disabled={!!result || animating}
                className={`flex-1 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all ${
                  selected === '우'
                    ? 'bg-amber-500/30 text-amber-400 border-2 border-amber-500 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600 border-2 border-transparent'
                }`}
              >
                우 (배당 {ODDS.우})
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-3 sm:p-4 overflow-hidden">
            <h3 className="text-xs sm:text-sm font-semibold text-slate-400 mb-2 sm:mb-3">최근 결과</h3>
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              {recentResults.map((r, i) => (
                <span
                  key={i}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    r === '좌' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                  }`}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-700/60 bg-slate-800/80 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4">배팅</h3>
            {selected && (
              <div className="mb-4 p-3 rounded-xl bg-slate-900/60 border border-slate-700/50">
                <p className="text-slate-400 text-xs sm:text-sm">선택</p>
                <p className="text-amber-400 font-bold">{selected} @ {ODDS[selected]}</p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-xs text-slate-400 mb-2">금액</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[1000, 5000, 10000, 50000].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStake(String(n))}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-600"
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
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm sm:text-base focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="button"
              onClick={handlePlaceBet}
              disabled={!selected || !stake || !!result || animating}
              className="w-full py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-amber-500 to-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
            >
              배팅하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
