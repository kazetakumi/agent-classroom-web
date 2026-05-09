import { vi, describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { SwipeLayer } from './SwipeLayer'

function renderSwipeLayer(callbacks: {
  onSkip?: () => void
  onGoBack?: () => void
  onOpenCompanion?: () => void
}) {
  const onSkip = callbacks.onSkip ?? vi.fn()
  const onGoBack = callbacks.onGoBack ?? vi.fn()
  const onOpenCompanion = callbacks.onOpenCompanion ?? vi.fn()
  const { container } = render(
    <SwipeLayer onSkip={onSkip} onGoBack={onGoBack} onOpenCompanion={onOpenCompanion}>
      <div>content</div>
    </SwipeLayer>
  )
  return { layer: container.firstChild as HTMLElement, onSkip, onGoBack, onOpenCompanion }
}

describe('SwipeLayer', () => {
  it('calls onSkip when swiping right more than 80px', () => {
    const onSkip = vi.fn()
    const { layer } = renderSwipeLayer({ onSkip })

    fireEvent.pointerDown(layer, { clientX: 0, clientY: 0 })
    fireEvent.pointerUp(layer, { clientX: 90, clientY: 5 })

    expect(onSkip).toHaveBeenCalledOnce()
  })

  it('does not call onSkip when right swipe is under 80px threshold', () => {
    const onSkip = vi.fn()
    const { layer } = renderSwipeLayer({ onSkip })

    fireEvent.pointerDown(layer, { clientX: 0, clientY: 0 })
    fireEvent.pointerUp(layer, { clientX: 79, clientY: 0 })

    expect(onSkip).not.toHaveBeenCalled()
  })

  it('calls onGoBack when swiping left more than 80px', () => {
    const onGoBack = vi.fn()
    const { layer } = renderSwipeLayer({ onGoBack })

    fireEvent.pointerDown(layer, { clientX: 100, clientY: 0 })
    fireEvent.pointerUp(layer, { clientX: 10, clientY: 5 })

    expect(onGoBack).toHaveBeenCalledOnce()
  })

  it('calls onOpenCompanion when swiping up more than 60px', () => {
    const onOpenCompanion = vi.fn()
    const { layer } = renderSwipeLayer({ onOpenCompanion })

    fireEvent.pointerDown(layer, { clientX: 0, clientY: 100 })
    fireEvent.pointerUp(layer, { clientX: 5, clientY: 30 })

    expect(onOpenCompanion).toHaveBeenCalledOnce()
  })

  it('does not call any callback without a preceding pointerDown', () => {
    const onSkip = vi.fn()
    const onGoBack = vi.fn()
    const onOpenCompanion = vi.fn()
    const { layer } = renderSwipeLayer({ onSkip, onGoBack, onOpenCompanion })

    fireEvent.pointerUp(layer, { clientX: 200, clientY: 0 })

    expect(onSkip).not.toHaveBeenCalled()
    expect(onGoBack).not.toHaveBeenCalled()
    expect(onOpenCompanion).not.toHaveBeenCalled()
  })

  it('renders children unchanged', () => {
    const { layer } = renderSwipeLayer({})
    expect(layer.textContent).toBe('content')
  })
})
