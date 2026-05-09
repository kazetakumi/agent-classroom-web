import { useRef } from 'react'

interface Props {
  onSkip: () => void
  onGoBack: () => void
  onOpenCompanion: () => void
  children: React.ReactNode
}

export function SwipeLayer({ onSkip, onGoBack, onOpenCompanion, children }: Props) {
  const startPos = useRef<{ x: number; y: number } | null>(null)

  function handlePointerDown(e: React.PointerEvent) {
    startPos.current = { x: e.clientX, y: e.clientY }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!startPos.current) return
    const dx = e.clientX - startPos.current.x
    const dy = e.clientY - startPos.current.y
    startPos.current = null

    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx > 80) onSkip()
      else if (dx < -80) onGoBack()
    } else {
      if (dy < -60) onOpenCompanion()
    }
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ touchAction: 'none' }}
    >
      {children}
    </div>
  )
}
