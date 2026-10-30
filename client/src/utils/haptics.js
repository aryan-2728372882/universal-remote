/**
 * Mobile Haptic Feedback helper
 * Triggers subtle vibration on mobile devices when tapping remote buttons
 */
export const triggerHaptic = (type = 'light') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'light') {
        navigator.vibrate(12);
      } else if (type === 'medium') {
        navigator.vibrate(25);
      } else if (type === 'heavy') {
        navigator.vibrate([35, 30, 35]);
      } else if (type === 'success') {
        navigator.vibrate([15, 50, 20]);
      }
    } catch {
      // Ignore vibration error on unsupported browsers
    }
  }
};
