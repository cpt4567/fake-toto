'use client'

import { motion } from 'framer-motion'
import { GAME_TABS } from '@/lib/constants'
import { useStore } from '@/store/useStore'

export default function Header({ activeTab, onTabChange }) {
  const balance = useStore((state) => state.balance)

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-amber-500/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              T
            </motion.div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">FAKE TOTO</h1>
              <p className="text-[10px] text-slate-500 -mt-0.5 hidden sm:block">실시간 베팅</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/50"
              key={balance}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <span className="text-slate-400 text-xs">보유</span>
              <span className="text-emerald-400 font-bold tabular-nums text-sm">
                ₩{balance.toLocaleString()}
              </span>
            </motion.div>
            <motion.button
              type="button"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              로그인
            </motion.button>
          </div>
        </div>

        <nav className="flex gap-1 pb-3 overflow-x-auto scrollbar-hide" aria-label="게임 메뉴">
          {GAME_TABS.map((tab) => (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap
                transition-colors duration-200
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-600/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </nav>
      </div>
    </header>
  )
}
