/**
 * Haptic Feedback Utility
 * Uses Web Vibration API for mobile vibration feedback
 */

export const haptic = {
  /**
   * Light tap - used for button interactions
   */
  tap: () => {
    if (navigator.vibrate) {
      navigator.vibrate(30)
    }
  },

  /**
   * Success pattern - short burst
   */
  success: () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50])
    }
  },

  /**
   * Error pattern - longer buzz
   */
  error: () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
  },

  /**
   * Swipe pattern - increasing intensity
   */
  swipe: () => {
    if (navigator.vibrate) {
      navigator.vibrate([40, 20, 60])
    }
  },

  /**
   * Delete confirmation - strong double buzz
   */
  delete: () => {
    if (navigator.vibrate) {
      navigator.vibrate([150, 80, 150])
    }
  },

  /**
   * Warning pattern - triple quick taps
   */
  warning: () => {
    if (navigator.vibrate) {
      navigator.vibrate([30, 30, 30, 30, 30])
    }
  },
}
