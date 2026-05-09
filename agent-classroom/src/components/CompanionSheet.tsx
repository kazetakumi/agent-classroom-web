import { useRef } from 'react'

interface Command {
  label: string
  onSelect: () => void
}

interface Props {
  isOpen: boolean
  commands: Command[]
  onClose: () => void
}

export function CompanionSheet({ isOpen, commands, onClose }: Props) {
  if (!isOpen) return null

  const swipeStart = useRef<{ y: number } | null>(null)

  function handleSheetPointerDown(e: React.PointerEvent) {
    swipeStart.current = { y: e.clientY }
  }

  function handleSheetPointerUp(e: React.PointerEvent) {
    if (!swipeStart.current) return
    const dy = e.clientY - swipeStart.current.y
    swipeStart.current = null
    if (dy > 60) onClose()
  }

  return (
    <div
      data-testid="companion-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        zIndex: 100,
      }}
    >
      <div
        data-testid="companion-sheet"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={handleSheetPointerDown}
        onPointerUp={handleSheetPointerUp}
        style={{
          background: '#fff',
          borderRadius: '16px 16px 0 0',
          padding: '24px 16px',
          animation: 'slideUp 200ms ease-out',
        }}
      >
        {commands.map((cmd) => (
          <button
            key={cmd.label}
            onClick={cmd.onSelect}
            style={{
              display: 'block',
              width: '100%',
              padding: '16px',
              fontSize: '18px',
              marginBottom: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              background: '#f5f5f5',
              cursor: 'pointer',
            }}
          >
            {cmd.label}
          </button>
        ))}
      </div>
    </div>
  )
}
