import { useState, useCallback } from 'react'
import { ODDS_LABELS } from '@/lib/constants'

export function useBettingSlip() {
  const [selectedOdds, setSelectedOdds] = useState({})
  const [bets, setBets] = useState({})

  const handleSelectOdds = useCallback((match, type, odds, key) => {
    const selection = ODDS_LABELS[type]

    setSelectedOdds((prev) => {
      const wasSelected = prev[key]
      const newState = { ...prev }
      Object.keys(newState).forEach((k) => {
        if (k.startsWith(`${match.id}-`)) delete newState[k]
      })
      if (wasSelected) {
        setBets((b) => {
          const { [key]: _, ...rest } = b
          return rest
        })
      } else {
        newState[key] = true
        setBets((b) => ({
          ...b,
          [key]: {
            matchId: match.id,
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            selection,
            odds,
          },
        }))
      }
      return newState
    })
  }, [])

  const handleRemoveBet = useCallback((key) => {
    if (key === 'all') {
      setBets({})
      setSelectedOdds({})
    } else {
      setSelectedOdds((prev) => {
        const { [key]: _, ...rest } = prev
        return rest
      })
      setBets((prev) => {
        const { [key]: _, ...rest } = prev
        return rest
      })
    }
  }, [])

  const clearBets = useCallback(() => {
    setBets({})
    setSelectedOdds({})
  }, [])

  return {
    selectedOdds,
    bets,
    handleSelectOdds,
    handleRemoveBet,
    clearBets,
  }
}
