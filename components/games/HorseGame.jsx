'use client'

import { useState } from 'react'
import Toast from '@/components/Toast'

const HORSE_COUNT = 8
const HORSE_NAMES = ['번개', '질풍', '천마', '적토', '백룡', '흑운', '금강', '은화']
const ODDS = [3.2, 2.8, 4.0, 2.5, 3.5, 2.2, 5.0, 2.8]

export default function HorseGame() {
  const [round, setRound] = useState(1)
  const [countdown, setCountdown] = useState(45)
  const [selected, setSelected] = useState(null)
  const [stake, setStake] = useState('')
  const [racing, setRacing] = useState(false)
  const [winner, setWinner] = useState(null)
  const [toast, setToast] = useState(null)
  const [recentWinners, setRecentWinners] = useState([3, 7, 1, 5, 2, 8, 4, 6])

  const handlePlaceBet = () => {
    if (!selected || !stake || parseFloat(stake) <= 0 || racing) return
    setRacing(true)
    setCountdown(0)

    const duration = 4000
    const winnerHorse = Math.floor(Math.random() * HORSE_COUNT) + 1
    setTimeout(() => {
      setWinner(winnerHorse)
      setRecentWinners((prev) => [winnerHorse, ...prev.slice(0, 14)])
      const won = selected === winnerHorse
      setToast({
        message: won
          ? `🏇 ${HORSE_NAMES[winnerHorse - 1]} 우승! ${(parseInt(stake) * ODDS[selected - 1]).toLocaleString()}원 획득`
          : `${HORSE_NAMES[winnerHorse - 1]} 우승. 아쉽습니다!`,
        type: won ? 'success' : 'error',
      })
      setTimeout(() => {
        setRound((r) => r + 1)
        setCountdown(60)
        setWinner(null)
        setSelected(null)
        setStake('')
        setRacing(false)
      }, 3000)
    }, duration)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">3D 경마</h2>
                <p className="text-slate-400 text-sm mt-1">8마리 중 1등 예측</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-slate-500 text-xs">경주</p>
                  <p className="text-amber-400 font-bold tabular-nums">{String(round).padStart(3, '0')}R</p>
                </div>
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-600/20 flex items-center justify-center border border-rose-500/30">
                  <span className="text-2xl font-black text-rose-400 tabular-nums">{countdown}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-b from-slate-900/80 to-slate-800/50 p-6 border border-slate-700/50">
              <div className="relative">
                <div className="space-y-3">
                  {Array.from({ length: HORSE_COUNT }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-4 p-3 rounded-xl border transition-all duration-700 ${
                        winner === i + 1
                          ? 'bg-rose-500/20 border-rose-500/50'
                          : 'bg-slate-800/30 border-slate-700/30'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-amber-400 font-bold">
                        {i + 1}
                      </div>
                      <span className="text-white font-medium w-16">{HORSE_NAMES[i]}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-1000"
                          style={{
                            width: racing
                              ? winner === i + 1
                                ? '100%'
                                : `${20 + Math.random() * 60}%`
                              : '0%',
                          }}
                        />
                      </div>
                      <span className="text-slate-400 text-sm w-12 text-right">{ODDS[i]}배</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-6">
              {Array.from({ length: HORSE_COUNT }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => !racing && setSelected(i + 1)}
                  disabled={racing}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${
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

          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-4">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">최근 우승마</h3>
            <div className="flex gap-2 flex-wrap">
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
          <div className="sticky top-24 rounded-2xl border border-slate-700/60 bg-slate-800/80 p-6">
            <h3 className="text-lg font-bold text-white mb-4">배팅</h3>
            {selected && (
              <div className="mb-4 p-3 rounded-xl bg-slate-900/60">
                <p className="text-slate-400 text-sm">선택</p>
                <p className="text-rose-400 font-bold">{selected}번 {HORSE_NAMES[selected - 1]} @ {ODDS[selected - 1]}배</p>
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
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-rose-500"
                disabled={racing}
              />
            </div>
            <button
              type="button"
              onClick={handlePlaceBet}
              disabled={!selected || !stake || racing}
              className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {racing ? '경주 진행중...' : '배팅하기'}
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  )
}
