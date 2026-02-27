'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  ShadowGenerator,
  DirectionalLight,
  Mesh,
  SceneLoader,
  PhotoDome,
} from '@babylonjs/core'
import '@babylonjs/loaders/glTF'
import { useStore } from '@/store/useStore'

const HORSE_NAMES = ['번개', '질풍', '천마', '적토', '백룡', '흑운', '금강', '은화']
const ODDS = [3.2, 2.8, 4.0, 2.5, 3.5, 2.2, 5.0, 2.8]
const RACE_DURATION = 6000
const HORSE_COUNT = HORSE_NAMES.length
const LANE_SPACING = 1.0
const RACE_START_Z = -4
const RACE_END_Z = 8

// Poly Haven CC0 - 야외 초원 (kloppenheim)
const MEADOW_SKY = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/kloppenheim_02.jpg'

const HORSE_SCALE = 0.35

function createFallbackHorse(scene, color, name) {
  const root = new Mesh(`horse_${name}`, scene)
  root.isPickable = false
  root.scaling = new Vector3(HORSE_SCALE, HORSE_SCALE, HORSE_SCALE)

  const body = MeshBuilder.CreateCylinder(
    `${name}_body`,
    { height: 0.8, diameterTop: 0.35, diameterBottom: 0.4, tessellation: 16 },
    scene
  )
  body.parent = root
  body.position.y = 0.5
  body.rotation.x = Math.PI / 2
  body.scaling.z = 1.5

  const neck = MeshBuilder.CreateCylinder(
    `${name}_neck`,
    { height: 0.5, diameterTop: 0.15, diameterBottom: 0.25, tessellation: 12 },
    scene
  )
  neck.parent = root
  neck.position.set(0.35, 0.85, 0)
  neck.rotation.x = -Math.PI / 4

  const head = MeshBuilder.CreateSphere(
    `${name}_head`,
    { diameter: 0.35, segments: 12 },
    scene
  )
  head.parent = root
  head.position.set(0.6, 1.05, 0)
  head.scaling.y = 1.2
  head.scaling.z = 0.9

  ;[
    [-0.25, 0.2, 0.25],
    [-0.25, 0.2, -0.25],
    [0.25, 0.2, 0.25],
    [0.25, 0.2, -0.25],
  ].forEach((pos, i) => {
    const leg = MeshBuilder.CreateCylinder(
      `${name}_leg_${i}`,
      { height: 0.4, diameter: 0.08, tessellation: 8 },
      scene
    )
    leg.parent = root
    leg.position.set(...pos)
  })

  const mat = new StandardMaterial(`${name}_mat`, scene)
  mat.diffuseColor = color
  mat.specularColor = new Color3(0.2, 0.2, 0.2)
  root.getChildMeshes().forEach((m) => (m.material = mat))
  return root
}

function createGround(scene) {
  const ground = MeshBuilder.CreateGround(
    'ground',
    { width: 30, height: 30 },
    scene
  )
  ground.position.y = -0.01
  const grassMat = new StandardMaterial('grassMat', scene)
  grassMat.diffuseColor = new Color3(0.22, 0.38, 0.24)
  grassMat.specularColor = new Color3(0.02, 0.03, 0.02)
  ground.material = grassMat
  ground.receiveShadows = true
  return ground
}

export default function HorseGame3D() {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const sceneRef = useRef(null)
  const horsesRef = useRef([])
  const [round, setRound] = useState(1)
  const [selected, setSelected] = useState(null)
  const [stake, setStake] = useState('')
  const [racing, setRacing] = useState(false)
  const [positions, setPositions] = useState(Array(HORSE_COUNT).fill(0))
  const [winner, setWinner] = useState(null)
  const [recentWinners, setRecentWinners] = useState([3, 7, 1, 5, 2, 8, 4, 6])
  const speedsRef = useRef([])
  const [loading, setLoading] = useState(true)
  const placeBet = useStore((state) => state.placeBet)
  const addWinnings = useStore((state) => state.addWinnings)
  const addToast = useStore((state) => state.addToast)
  const balance = useStore((state) => state.balance)
  const startTimeRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
    })
    engineRef.current = engine

    const scene = new Scene(engine)
    scene.clearColor = new Color3(0.4, 0.55, 0.7)
    sceneRef.current = scene

    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2.2,
      16,
      new Vector3(0, 0, 2),
      scene
    )
    camera.attachControl(canvasRef.current, true)
    camera.wheelPrecision = 20
    camera.minZ = 0.5

    const light = new HemisphericLight(
      'light',
      new Vector3(0, 1, 0),
      scene
    )
    light.intensity = 0.6

    const dirLight = new DirectionalLight(
      'dirLight',
      new Vector3(-2, -5, -2),
      scene
    )
    dirLight.position = new Vector3(10, 15, 10)
    dirLight.intensity = 1.2

    const shadowGen = new ShadowGenerator(2048, dirLight)
    shadowGen.useBlurExponentialShadowMap = true
    shadowGen.blurScale = 2

    createGround(scene)

    // 초원 360 배경 (PhotoDome)
    try {
      const skyDome = new PhotoDome(
        'meadowSky',
        MEADOW_SKY,
        { resolution: 32, size: 1000 },
        scene
      )
      skyDome.fovMultiplier = 1.5
    } catch {
      scene.clearColor = new Color3(0.4, 0.55, 0.7)
    }

    const horseColors = [
      new Color3(0.94, 0.27, 0.27),
      new Color3(0.23, 0.51, 0.96),
      new Color3(0.13, 0.77, 0.37),
      new Color3(0.96, 0.62, 0.04),
      new Color3(0.55, 0.36, 0.96),
      new Color3(0.02, 0.71, 0.84),
      new Color3(0.93, 0.29, 0.6),
      new Color3(0.52, 0.8, 0.09),
    ]

    const getLaneX = (i) => (i - (HORSE_COUNT - 1) / 2) * LANE_SPACING

    const createHorses = (useFallback) => {
      const horses = []
      for (let i = 0; i < HORSE_COUNT; i++) {
        const horse = useFallback
          ? createFallbackHorse(scene, horseColors[i], i)
          : null
        if (horse) {
          horse.position.x = getLaneX(i)
          horse.position.z = RACE_START_Z
          horse.position.y = 0
          horse.rotation.y = 0
          shadowGen.addShadowCaster(horse)
          horses.push({ mesh: horse, laneIndex: i })
        }
      }
      return horses
    }

    SceneLoader.ImportMesh(
      '',
      '/models/',
      'Horse.glb',
      scene,
      (meshes) => {
        if (!meshes.length) {
          horsesRef.current = createHorses(true)
          setLoading(false)
          return
        }

        const meshSet = new Set(meshes)
        const rootMesh = meshes.find((m) => !m.parent || !meshSet.has(m.parent)) || meshes[0]
        rootMesh.setEnabled(false)
        rootMesh.scaling = new Vector3(HORSE_SCALE, HORSE_SCALE, HORSE_SCALE)

        const horses = []
        for (let i = 0; i < HORSE_COUNT; i++) {
          const clone = rootMesh.clone(`horse_${i}`, null, false)
          clone.setEnabled(true)
          clone.isPickable = false
          clone.getChildMeshes().forEach((m) => (m.isPickable = false))
          clone.position.set(getLaneX(i), 0, RACE_START_Z)
          clone.rotation.y = 0
          shadowGen.addShadowCaster(clone)
          horses.push({ mesh: clone, laneIndex: i })
        }
        horsesRef.current = horses
        setLoading(false)
      },
      null,
      () => {
        horsesRef.current = createHorses(true)
        setLoading(false)
      }
    )

    engine.runRenderLoop(() => scene.render(true))

    return () => {
      engine.dispose()
      scene.dispose()
    }
  }, [])

  useEffect(() => {
    if (!racing || !horsesRef.current.length) return

    const speeds = Array.from({ length: HORSE_COUNT }, () => 0.08 + Math.random() * 0.15)
    speedsRef.current = speeds
    startTimeRef.current = performance.now()

    const animate = () => {
      const elapsed = performance.now() - startTimeRef.current
      const progress = Math.min(elapsed / RACE_DURATION, 1)

      const newPositions = speedsRef.current.map((speed) =>
        Math.min(progress * speed * 1.5, 1)
      )

      horsesRef.current.forEach(({ mesh, laneIndex }, i) => {
        const p = newPositions[i]
        const z = RACE_START_Z + p * (RACE_END_Z - RACE_START_Z)
        mesh.position.x = (laneIndex - (HORSE_COUNT - 1) / 2) * LANE_SPACING
        mesh.position.z = z
        mesh.position.y = 0
      })

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
          horsesRef.current.forEach(({ mesh, laneIndex }) => {
            mesh.position.x = (laneIndex - (HORSE_COUNT - 1) / 2) * LANE_SPACING
            mesh.position.z = RACE_START_Z
            mesh.position.y = 0
          })
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
                <h2 className="text-base sm:text-lg font-bold text-white">3D 경마 (Babylon.js)</h2>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">{HORSE_COUNT}마리 - 초원 배경</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-slate-500 text-xs">경주</p>
                  <p className="text-amber-400 font-bold tabular-nums">{String(round).padStart(3, '0')}R</p>
                </div>
                {loading && (
                  <div className="text-slate-400 text-sm">로딩 중...</div>
                )}
                {racing && !winner && !loading && (
                  <div className="text-rose-400 text-sm font-bold animate-pulse">경주 중...</div>
                )}
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900 w-full aspect-video min-h-[200px] sm:min-h-[280px] relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-10">
                  <div className="text-slate-400 text-sm">말 모델 로딩 중...</div>
                </div>
              )}
              <canvas ref={canvasRef} className="w-full h-full touch-none" />
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
