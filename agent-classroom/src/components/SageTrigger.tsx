import React from 'react'

interface SageTriggerProps {
  onAskSage: () => void
  onPrev: () => void
  onNext: () => void
  canGoPrev: boolean
  canGoNext: boolean
  progress: number
  showNav: boolean
}

export function SageTrigger({
  onAskSage,
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
  progress,
  showNav,
}: SageTriggerProps) {
  return (
    <div className="sage-trigger">
      {showNav && (
        <div
          data-testid="nav-row"
          style={{
            height: 44,
            borderTop: '1px solid #F0F0F0',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            gap: 8,
          }}
        >
          <button
            data-testid="prev-btn"
            onClick={onPrev}
            style={{
              background: 'none',
              border: 'none',
              cursor: canGoPrev ? 'pointer' : 'default',
              pointerEvents: canGoPrev ? 'auto' : 'none',
              fontFamily: 'var(--mono, monospace)',
              fontSize: 12,
              color: canGoPrev ? '#111' : '#CFCFCF',
              padding: 0,
            }}
          >
            ← PREV
          </button>
          <div
            style={{
              flex: 1,
              height: 2,
              background: '#F0F0F0',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <div
              data-testid="progress-bar"
              style={{
                height: '100%',
                width: `${progress * 100}%`,
                background: '#111',
                borderRadius: 1,
              }}
            />
          </div>
          <button
            data-testid="next-btn"
            onClick={onNext}
            style={{
              background: 'none',
              border: 'none',
              cursor: canGoNext ? 'pointer' : 'default',
              pointerEvents: canGoNext ? 'auto' : 'none',
              fontFamily: 'var(--mono, monospace)',
              fontSize: 12,
              color: canGoNext ? '#111' : '#CFCFCF',
              padding: 0,
            }}
          >
            NEXT →
          </button>
        </div>
      )}
      <div
        data-testid="sage-strip"
        onClick={onAskSage}
        style={{
          height: 64,
          background: '#F9F9F7',
          borderTop: '1px solid #E8E8E0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--serif, serif)',
            fontSize: 16,
            color: '#888',
            fontStyle: 'italic',
          }}
        >
          Ask me anything…
        </span>
      </div>
    </div>
  )
}
