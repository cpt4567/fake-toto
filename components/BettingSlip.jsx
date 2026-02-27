'use client'

import { useState } from 'react'
import ConfirmModal from './ConfirmModal'
import { QUICK_STAKES } from '@/lib/constants'
import { useStore } from '@/store/useStore'

export default function BettingSlip({ bets, onRemoveBet, onPlaceBet }) {
  const balance = useStore((state) => state.balance)
  const [stake, setStake] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const betCount = Object.keys(bets).length
  const totalOdds = Object.values(bets).reduce((acc, b) => acc * b.odds, 1)
  const potentialWin = stake ? (parseFloat(stake) * totalOdds).toFixed(0) : '0'
  const isValidStake = stake && parseFloat(stake) > 0 && parseFloat(stake) <= balance

  const handleQuickStake = (amount) => {
    if (amount === '최대') {
      setStake(String(balance))
    } else {
      setStake(String(amount))
    }
  }

  const handlePlaceBetClick = () => {
    if (betCount === 0 || !isValidStake) return
    setShowConfirm(true)
  }

  const handleConfirmBet = () => {
    onPlaceBet({
      bets,
      stake: parseFloat(stake),
      totalOdds,
      potentialWin,
    })
    setStake('')
  }

  if (betCount === 0) {
    return (
      <aside
        className="sticky top-24 rounded-2xl border border-slate-700/60 bg-slate-800/80 p-6 shadow-toto-card"
        aria-label="배팅 슬립"
      >
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <span className="text-xl" aria-hidden>📋</span>
          <span>배팅 슬립</span>
        </h3>
        <div className="text-slate-400 text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-700/50 flex items-center justify-center text-3xl">
            🎯
          </div>
          <p className="text-sm font-medium text-slate-300 mb-1">경기에서 배당률을 선택하세요</p>
          <p className="text-xs text-slate-500">선택한 경기가 여기에 표시됩니다</p>
        </div>
      </aside>
    )
  }

  return (
    <>
      <aside
        className="sticky top-24 rounded-2xl border border-slate-700/60 bg-slate-800/80 p-6 shadow-toto-card animate-slide-up"
        aria-label="배팅 슬립"
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-xl" aria-hidden>📋</span>
          <span>배팅 슬립</span>
          <span className="text-sm font-normal text-slate-400">({betCount}경기)</span>
        </h3>

        {/* Bet list */}
        <div className="space-y-3 mb-5 max-h-44 overflow-y-auto">
          {Object.entries(bets).map(([key, bet]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-3 rounded-xl bg-slate-900/60 p-3 border border-slate-700/40 animate-fade-in"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {bet.homeTeam} vs {bet.awayTeam}
                </p>
                <p className="text-xs text-amber-400 font-semibold mt-0.5">
                  {bet.selection} @ {bet.odds.toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveBet(key)}
                className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                aria-label="삭제"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4 mb-5 p-4 rounded-xl bg-slate-900/40 border border-slate-700/40">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">총 배당률</span>
            <span className="text-amber-400 font-bold tabular-nums">{totalOdds.toFixed(2)}</span>
          </div>

          {/* Quick stake buttons */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">빠른 선택</label>
            <div className="flex flex-wrap gap-2">
              {QUICK_STAKES.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleQuickStake(amount)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
                >
                  {amount === '최대' ? '최대' : `${(amount / 1000).toFixed(0)}천`}
                </button>
              ))}
            </div>
          </div>

          {/* Stake input */}
          <div>
            <label htmlFor="stake-input" className="block text-xs text-slate-400 mb-1.5">
              배팅 금액 (원)
            </label>
            <input
              id="stake-input"
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="금액 입력"
              min="0"
              max={BALANCE}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-toto-primary focus:border-transparent transition-shadow"
            />
          </div>

          <div className="flex justify-between text-sm pt-2 border-t border-slate-700/50">
            <span className="text-slate-400">예상 당첨금</span>
            <span className="text-emerald-400 font-bold tabular-nums">
              {parseInt(potentialWin).toLocaleString()}원
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePlaceBetClick}
          disabled={!isValidStake}
          className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-amber-500/20"
        >
          배팅하기
        </button>
      </aside>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmBet}
        title="배팅 확인"
        message={`${parseFloat(stake).toLocaleString()}원을 배팅하시겠습니까? 예상 당첨금은 ${parseInt(potentialWin).toLocaleString()}원입니다.`}
        confirmLabel="배팅하기"
        cancelLabel="취소"
        variant="success"
      />
    </>
  )
}
