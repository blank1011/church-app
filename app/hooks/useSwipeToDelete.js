import { useRef, useState, useEffect } from 'react'

export function useSwipeToDelete(onDelete) {
  const [swipeDistance, setSwipeDistance] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    setSwipeDistance(0)
  }

  const handleTouchMove = (e) => {
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const diffX = touchStartX.current - currentX
    const diffY = Math.abs(touchStartY.current - currentY)

    // Only trigger swipe if it's primarily horizontal (not vertical scroll)
    if (Math.abs(diffX) > diffY && diffX > 0) {
      e.preventDefault?.()
      setSwipeDistance(Math.min(diffX, 100))
    }
  }

  const handleTouchEnd = async () => {
    if (swipeDistance > 50) {
      setIsDeleting(true)
      try {
        await onDelete()
      } finally {
        setIsDeleting(false)
      }
    }
    setSwipeDistance(0)
    touchStartX.current = 0
    touchStartY.current = 0
  }

  return {
    swipeDistance,
    isDeleting,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}
