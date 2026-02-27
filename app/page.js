'use client'

import { useState, lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Header from '@/components/Header'
import ToastContainer from '@/components/ToastContainer'
import SportsGame from '@/components/games/SportsGame'
import LadderGame from '@/components/games/LadderGame'
import SnailGame from '@/components/games/SnailGame'

const HorseGame3D = lazy(() => import('@/components/games/HorseGame3D'))

const GAME_COMPONENTS = {
  sports: SportsGame,
  ladder: LadderGame,
  snail: SnailGame,
  horse: HorseGame3D,
}

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('sports')
  const GameComponent = GAME_COMPONENTS[activeTab]

  return (
    <div className="min-h-screen">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'horse' ? (
            <Suspense
              key="horse"
              fallback={
                <motion.div
                  className="h-96 flex items-center justify-center text-slate-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  3D 경마 로딩중...
                </motion.div>
              }
            >
              <motion.div
                key="horse"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                <HorseGame3D />
              </motion.div>
            </Suspense>
          ) : (
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <GameComponent />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-16 py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-xs">
            FAKE TOTO는 데모용 서비스입니다. 실제 금전 거래가 발생하지 않습니다.
          </p>
        </div>
      </footer>

      <ToastContainer />
    </div>
  )
}
