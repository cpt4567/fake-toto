'use client'

import { useCallback } from 'react'
import { SPORT_ICONS } from '@/lib/constants'

function OddsButton({ type, label, odds, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={`${label} ${odds > 0 ? odds.toFixed(2) : '해당 없음'}`}
      className={`
        flex-1 py-3.5 px-3 rounded-xl font-bold text-sm
        transition-all duration-200 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
        ${        isSelected
          ? 'bg-gradient-to-b from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20 scale-[1.02]'
          : 'bg-slate-700/40 hover:bg-slate-600/60 text-slate-200 hover:text-white border border-slate-600/50 hover:border-slate-500'
        }
      `}
    >
      <span className="block text-[10px] font-medium opacity-90 mb-0.5 uppercase tracking-wide">
        {label}
      </span>
      <span className="block tabular-nums">
        {odds > 0 ? odds.toFixed(2) : '–'}
      </span>
    </button>
  )
}

export default function MatchCard({ match, onSelectOdds, selectedOdds }) {
  const hasDraw = match.odds.draw > 0
  const sportIcon = SPORT_ICONS[match.sport] || '⚽'

  const getOddsKey = useCallback((type) => {
    const map = { home: 'home', draw: 'draw', away: 'away' }
    return `${match.id}-${map[type]}`
  }, [match.id])

  return (
    <article
      className="
        group relative overflow-hidden rounded-2xl
        bg-slate-800/70 border border-slate-700/60
        shadow-toto-card hover:shadow-toto-card-hover
        transition-all duration-300 ease-out
        hover:border-slate-600/80
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-slate-900/60 border-b border-slate-700/50">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400">
          <span className="text-base" aria-hidden>{sportIcon}</span>
          {match.sport}
        </span>
        <span className="text-xs text-slate-400 font-medium">{match.league}</span>
        <time
          dateTime={`${match.date} ${match.startTime}`}
          className="text-xs text-slate-500 tabular-nums"
        >
          {match.date} {match.startTime}
        </time>
      </div>

      {/* Match info */}
      <div className="p-5">
        <div className="flex items-center justify-between gap-6 mb-5">
          <div className="flex-1 text-right min-w-0">
            <p className="font-bold text-white text-lg truncate" title={match.homeTeam}>
              {match.homeTeam}
            </p>
          </div>
          <div className="flex-shrink-0 px-4 py-1.5 rounded-lg bg-slate-700/50">
            <span className="text-slate-400 text-sm font-semibold">VS</span>
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="font-bold text-white text-lg truncate" title={match.awayTeam}>
              {match.awayTeam}
            </p>
          </div>
        </div>

        {/* Odds buttons */}
        <div className="flex gap-3">
          <OddsButton
            type="home"
            label="홈승"
            odds={match.odds.home}
            isSelected={!!selectedOdds[getOddsKey('home')]}
            onSelect={() => onSelectOdds(match, 'home', match.odds.home, getOddsKey('home'))}
          />
          {hasDraw && (
            <OddsButton
              type="draw"
              label="무승부"
              odds={match.odds.draw}
              isSelected={!!selectedOdds[getOddsKey('draw')]}
              onSelect={() => onSelectOdds(match, 'draw', match.odds.draw, getOddsKey('draw'))}
            />
          )}
          <OddsButton
            type="away"
            label="원정승"
            odds={match.odds.away}
            isSelected={!!selectedOdds[getOddsKey('away')]}
            onSelect={() => onSelectOdds(match, 'away', match.odds.away, getOddsKey('away'))}
          />
        </div>
      </div>
    </article>
  )
}
