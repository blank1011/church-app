import { useEffect, useState, useRef } from 'react'

export function usePullToRefresh(onRefresh) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const touchStartY = useRef(0)
  const [pullDistance, setPullDistance] = useState(0)

  useEffect(() => {
    let container = null
    const findScrollContainer = () => {
      if (typeof window !== 'undefined') {
        container = document.querySelector('[data-pull-refresh-container]')
      }
    }

    findScrollContainer()

    const handleTouchStart = (e) => {
      if (container && container.scrollTop === 0) {
        touchStartY.current = e.touches[0].clientY
      }
    }

    const handleTouchMove = (e) => {
      if (container && container.scrollTop === 0 && touchStartY.current) {
        const distance = e.touches[0].clientY - touchStartY.current
        if (distance > 0) {
          e.preventDefault()
          setPullDistance(Math.min(distance, 150))
        }
      }
    }

    const handleTouchEnd = async () => {
      if (pullDistance > 60) {
        setIsRefreshing(true)
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
        }
      }
      setPullDistance(0)
      touchStartY.current = 0
    }

    const element = container || (typeof window !== 'undefined' ? document.documentElement : null)
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true })
      element.addEventListener('touchmove', handleTouchMove, { passive: false })
      element.addEventListener('touchend', handleTouchEnd, { passive: true })

      return () => {
        element.removeEventListener('touchstart', handleTouchStart)
        element.removeEventListener('touchmove', handleTouchMove)
        element.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [pullDistance, onRefresh])

  return { isRefreshing, pullDistance }
}
