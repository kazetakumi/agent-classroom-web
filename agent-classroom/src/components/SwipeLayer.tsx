import { useRef } from 'react'

interface Props {
  onSkip: () => void
  onGoBack: () => void
  onOpenCompanion: () => void
  children: React.ReactNode
}

export function SwipeLayer({ onSkip, onGoBack, onOpenCompanion, children }: Props) {
  const startPos = useRef<{ x: number; y: number } | null>(null)

  function resolveGesture(dx: number, dy: number) {
    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx > 80) onSkip()
      else if (dx < -80) onGoBack()
    } else {
      if (dy < -60) onOpenCompanion()
    }
  }

  // Touch Events — primary path for iOS.
  // setPointerCapture is unreliable on iOS WebKit (used by both Safari and Chrome on iPhone),
  // causing pointercancel instead of pointerup. Touch events fire reliably there.
  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0]
    startPos.current = { x: t.clientX, y: t.clientY }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!startPos.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - startPos.current.x
    const dy = t.clientY - startPos.current.y
    startPos.current = null
    resolveGesture(dx, dy)
  }

  function handleTouchCancel() {
    startPos.current = null
  }

  // Pointer Events — mouse only, to avoid double-firing on touch devices.
  function handlePointerDown(e: React.PointerEvent) {
    if (e.pointerType === 'touch') return
    startPos.current = { x: e.clientX, y: e.clientY }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (e.pointerType === 'touch') return
    if (!startPos.current) return
    const dx = e.clientX - startPos.current.x
    const dy = e.clientY - startPos.current.y
    startPos.current = null
    resolveGesture(dx, dy)
  }

  function handlePointerCancel(e: React.PointerEvent) {
    if (e.pointerType === 'touch') return
    startPos.current = null
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{ touchAction: 'none' }}
    >
      {children}
    </div>
  )
}
