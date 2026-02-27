'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import MatchCard from '@/components/MatchCard'
import BettingSlip from '@/components/BettingSlip'
import { useBettingSlip } from '@/hooks/useBettingSlip'
import { useStore } from '@/store/useStore'
import { matches } from '@/lib/matches'
import { SPORTS } from '@/lib/constants'

const SPORT_FILTERS = ['전체', SPORTS.SOCCER, SPORTS.BASEBALL, SPORTS.BASKETBALL, SPORTS.VOLLEYBALL]

export default function SportsGame() {
  const [sportFilter, setSportFilter] = useState('전체')
  const placeBet = useStore((state) => state.placeBet)
  const addToast = useStore((state) => state.addToast)
  const {
    selectedOdds,
    bets,
    handleSelectOdds,
    handleRemoveBet,
    clearBets,
  } = useBettingSlip()

  const filteredMatches =
    sportFilter === '전체'
      ? matches
      : matches.filter((m) => m.sport === sportFilter)

  const handlePlaceBet = ({ stake, potentialWin }) => {
    const stakeAmount = parseFloat(stake)
    placeBet(stakeAmount)
    addToast({
      message: `${stake.toLocaleString()}원 배팅 완료! 예상 당첨금: ${parseInt(potentialWin).toLocaleString()}원`,
      type: 'success',
    })
    clearBets()
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {SPORT_FILTERS.map((sport) => (
          <button
            key={sport}
            type="button"
            onClick={() => setSportFilter(sport)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              sportFilter === sport
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-amber-500" />
            경기 목록 ({filteredMatches.length}경기)
          </h2>
          <div className="space-y-4">
            {filteredMatches.length === 0 ? (
              <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-12 text-center">
                <p className="text-slate-400 text-sm">해당 종목의 경기가 없습니다</p>
                <button
                  type="button"
                  onClick={() => setSportFilter('전체')}
                  className="mt-4 text-amber-400 hover:text-amber-300 text-sm font-medium"
                >
                  전체 보기
                </button>
              </div>
            ) : (
              filteredMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.3) }}
                >
                  <MatchCard
                    match={match}
                    onSelectOdds={handleSelectOdds}
                    selectedOdds={selectedOdds}
                  />
                </motion.div>
              ))
            )}
          </div>
        </section>

        <section className="lg:col-span-1">
          <BettingSlip
            bets={bets}
            onRemoveBet={handleRemoveBet}
            onPlaceBet={handlePlaceBet}
          />
        </section>
      </div>

    </div>
  )
}
