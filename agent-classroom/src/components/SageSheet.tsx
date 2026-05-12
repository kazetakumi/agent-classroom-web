import { useState } from 'react'

interface SageSheetProps {
  quickActions: string[]
  onDismiss: () => void
  onQuickAction: (action: string) => void
}

export function SageSheet({ quickActions, onDismiss, onQuickAction }: SageSheetProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [inputText, setInputText] = useState('')

  function handleActionClick(action: string) {
    setSelectedAction(action)
    onQuickAction(action)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = inputText.trim()
    if (trimmed) {
      onQuickAction(trimmed)
      setInputText('')
    }
  }

  return (
    <div
      data-testid="sage-sheet"
      style={{
        position: 'fixed',
        inset: 0,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 200,
        animation: 'slideUpSheet 300ms ease-out',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
        <div
          data-testid="pill-handle"
          onClick={onDismiss}
          style={{
            width: 36,
            height: 4,
            background: '#E0E0E0',
            borderRadius: 2,
            cursor: 'pointer',
          }}
        />
      </div>

      <div
        className="col-grid"
        style={{ padding: '16px 24px', flex: 1, overflowY: 'auto' }}
      >
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
            {quickActions.map((action) => (
              <button
                key={action}
                data-testid="action-chip"
                onClick={() => handleActionClick(action)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #E0E0E0',
                  borderRadius: 20,
                  background: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--serif, serif)',
                  fontSize: 14,
                  opacity: selectedAction !== null && selectedAction !== action ? 0.3 : 1,
                  transition: 'opacity 200ms',
                }}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ padding: '12px 24px', borderTop: '1px solid #F0F0F0' }}
      >
        <input
          data-testid="you-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a question…"
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--serif, serif)',
            fontSize: 16,
          }}
        />
      </form>
    </div>
  )
}
